import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AccessoryCategory {
  PORTACARGADOR = 'portacargador',
  FUNDA_PISTOLERA = 'funda_pistolera',
  ROPA = 'ropa',
  LIMPIEZA_MANTENIMIENTO = 'limpieza_mantenimiento',
  OPTICA_MIRAS = 'optica_miras',
  ACCESORIOS_VARIOS = 'accesorios_varios',
  OTROS = 'otros',
}

export enum AccessoryCondition {
  NUEVO = 'nuevo',
  USADO = 'usado',
}

@Entity('accessories')
export class Accessory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  sellerId: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: AccessoryCategory })
  category: AccessoryCategory;

  @Column({ type: 'enum', enum: AccessoryCondition, default: AccessoryCondition.NUEVO })
  condition: AccessoryCondition;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ default: 1 })
  stock: number;

  @Column('text', { array: true, default: [] })
  images: string[];

  // Entrega
  @Column({ default: false })
  allowsShipping: boolean;

  @Column({ default: false })
  allowsInPerson: boolean;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  province: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  views: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}