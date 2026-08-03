import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('courses')
export class Course {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ nullable: true })
  discountPrice: number;

  @Column({ nullable: true })
  promoLabel: string;

  @Column({ type: 'timestamp' })
  startDate: Date;

  @Column({ nullable: true })
  schedule: string;

  @Column({ default: 0 })
  totalSpots: number;

  @Column({ default: 0 })
  availableSpots: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  location: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}