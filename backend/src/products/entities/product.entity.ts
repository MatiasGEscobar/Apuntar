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

export enum ProductCategory {
  PISTOLA = 'pistola',
  REVOLVER = 'revolver',
  RIFLE = 'rifle',
  ESCOPETA = 'escopeta',
  CARABINA = 'carabina',
}

export enum ProductCondition {
  NUEVO = 'nuevo',
  USADO_EXCELENTE = 'usado_excelente',
  USADO_BUENO = 'usado_bueno',
  USADO_REGULAR = 'usado_regular',
}

export enum ProductStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  SOLD = 'sold',
  RESERVED = 'reserved',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ProductCategory })
  category: ProductCategory;

  @Column()
  brand: string;

  @Column()
  model: string;

  @Column()
  caliber: string;

  @Column({ unique: true })
  serialNumber: string;

  @Column({ type: 'enum', enum: ProductCondition })
  condition: ProductCondition;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ type: 'text' })
  description: string;

  @Column('simple-array')
  images: string[];

  @Column()
  city: string;

  @Column()
  province: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ type: 'enum', enum: ProductStatus, default: ProductStatus.PENDING })
  status: ProductStatus;

  @Column({ nullable: true })
  renarRegistrationNumber: string;

  @Column({ nullable: true })
  renarCertificateUrl: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'sellerId' })
  seller: User;

  @Column()
  sellerId: string;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ nullable: true })
  moderatedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  moderatedAt: Date;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  favorites: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}