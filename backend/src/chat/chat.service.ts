import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
  ) {}

  async createMessage(
    transactionId: string,
    senderId: string,
    content: string,
  ): Promise<Message> {
    const message = this.messagesRepository.create({
      transactionId,
      senderId,
      content,
    });

    return this.messagesRepository.save(message);
  }

  async getMessages(transactionId: string): Promise<Message[]> {
    return this.messagesRepository.find({
      where: { transactionId },
      order: { createdAt: 'ASC' },
    });
  }

  async markAsRead(messageId: string): Promise<void> {
    await this.messagesRepository.update(messageId, { isRead: true });
  }

  async getUnreadCount(transactionId: string, userId: string): Promise<number> {
    return this.messagesRepository.count({
      where: {
        transactionId,
        isRead: false,
        // No contar los mensajes propios
      },
    });
  }
}