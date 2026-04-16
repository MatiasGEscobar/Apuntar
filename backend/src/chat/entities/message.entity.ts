import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  JoinColumn,
  CreateDateColumn 
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Transaction)
  @JoinColumn({ name: 'transactionId' })
  transaction: Transaction;

  @Column()
  transactionId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderId: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}