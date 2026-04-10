import { 
  Entity, 
  Column, 
  PrimaryGeneratedColumn, 
  ManyToOne,
  JoinColumn,
  CreateDateColumn, 
  UpdateDateColumn 
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';

export enum TransactionStatus {
  PENDING = 'pending',
  ESCROW = 'escrow',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'buyerId' })
  buyer: User;

  @Column()
  buyerId: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column()
  sellerId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  buyerCommission: number; // 1.5%

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  sellerCommission: number; // 1.5%

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalCommission: number; // 3%

  @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  @Column({ nullable: true })
  mercadoPagoPaymentId: string;

  @Column({ nullable: true })
  escrowReleaseDate: Date;

  @Column({ type: 'text', nullable: true })
  buyerNotes: string;

  @Column({ type: 'text', nullable: true })
  sellerNotes: string;

  @Column({ type: 'int', nullable: true })
  buyerRating: number; // 1-5

  @Column({ type: 'int', nullable: true })
  sellerRating: number; // 1-5

  @Column({ type: 'text', nullable: true })
  buyerReview: string;

  @Column({ type: 'text', nullable: true })
  sellerReview: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}