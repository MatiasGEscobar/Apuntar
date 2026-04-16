import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('join-transaction')
  handleJoinTransaction(
    @MessageBody() data: { transactionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`transaction-${data.transactionId}`);
    return { event: 'joined', data: { transactionId: data.transactionId } };
  }

  @SubscribeMessage('send-message')
  async handleMessage(
    @MessageBody() data: {
      transactionId: string;
      senderId: string;
      content: string;
    },
  ) {
    const message = await this.chatService.createMessage(
      data.transactionId,
      data.senderId,
      data.content,
    );

    this.server.to(`transaction-${data.transactionId}`).emit('new-message', message);

    return message;
  }

  @SubscribeMessage('get-messages')
  async handleGetMessages(@MessageBody() data: { transactionId: string }) {
    return this.chatService.getMessages(data.transactionId);
  }
}