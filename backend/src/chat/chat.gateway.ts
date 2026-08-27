import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      process.env.FRONTEND_URL || 'http://localhost:3000',
      /\.vercel\.app$/,
    ],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})
export class ChatGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string>();

  constructor(private readonly chatService: ChatService) {}

  // 👇 Nuevo: se llama una sola vez al conectar, sin importar la página
  @SubscribeMessage('register-user')
  handleRegisterUser(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!data.userId) return;
    client.join(`user-${data.userId}`);
    this.userSockets.set(data.userId, client.id);
    client.data.userId = data.userId;
  }

  @SubscribeMessage('join-transaction')
  handleJoinTransaction(
    @MessageBody() data: { transactionId: string; userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`transaction-${data.transactionId}`);

    if (data.userId) {
      // Redundante con register-user, pero lo dejamos por compatibilidad
      this.userSockets.set(data.userId, client.id);
      client.data.userId = data.userId;
      client.data.transactionId = data.transactionId;
    }

    return { event: 'joined', data: { transactionId: data.transactionId } };
  }

  @SubscribeMessage('leave-transaction')
  handleLeaveTransaction(
    @MessageBody() data: { transactionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`transaction-${data.transactionId}`);
  }

  @SubscribeMessage('check-presence')
  handleCheckPresence(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const isOnline = this.userSockets.has(data.userId);
    client.emit('user-status', { userId: data.userId, online: isOnline });
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSockets.delete(userId);
      // Avisamos globalmente que este usuario se desconectó de verdad
      this.server.emit('user-status', { userId, online: false });
    }
  }

  @SubscribeMessage('send-message')
  async handleMessage(
    @MessageBody() data: {
      transactionId: string;
      senderId: string;
      recipientId: string; // 👈 nuevo campo requerido
      content: string;
    },
  ) {
    const message = await this.chatService.createMessage(
      data.transactionId,
      data.senderId,
      data.content,
    );

    // Emitimos a las salas personales de ambos: llega sin importar la página
    this.server
      .to(`user-${data.senderId}`)
      .to(`user-${data.recipientId}`)
      .emit('new-message', message);

    return message;
  }

  @SubscribeMessage('get-messages')
  async handleGetMessages(@MessageBody() data: { transactionId: string }) {
    return this.chatService.getMessages(data.transactionId);
  }
}