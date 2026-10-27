import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum AccessoryOrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum DeliveryMethod {
  SHIPPING = 'shipping',
  IN_PERSON = 'in_person',
}

@Entity('accessory_orders')
export class AccessoryOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  accessoryId: string;

  // null = compra como invitado
  @Column({ type: 'uuid', nullable: true })
  buyerUserId: string | null;

  @Column()
  buyerName: string;

  @Column()
  buyerEmail: string;

  @Column()
  buyerPhone: string;

  @Column({ type: 'enum', enum: DeliveryMethod })
  deliveryMethod: DeliveryMethod;

  @Column({ type: 'varchar', nullable: true })
  shippingAddress: string | null;

  @Column({ type: 'varchar', nullable: true })
  shippingCity: string | null;

  @Column({ type: 'varchar', nullable: true })
  shippingProvince: string | null;

  @Column({ type: 'varchar', nullable: true })
  shippingPostalCode: string | null;

  @Column({ default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: AccessoryOrderStatus, default: AccessoryOrderStatus.PENDING })
  status: AccessoryOrderStatus;

  @Column({ type: 'varchar', nullable: true })
  paymentId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  fulfilledAt: Date | null; 
}