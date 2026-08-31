import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum EnrollmentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

@Entity('course_enrollments')
export class CourseEnrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  courseId: string;

  @Column()
  userId: string;

  @Column()
  participantName: string;

  @Column()
  participantDni: string; // 👈 nuevo, reemplaza participantNameNormalized

  @Column({ default: false })
  acceptedTerms: boolean; // 👈 nuevo

  @Column({ type: 'timestamp', nullable: true })
  termsAcceptedAt: Date; // 👈 nuevo

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: EnrollmentStatus, default: EnrollmentStatus.PENDING })
  status: EnrollmentStatus;

  @Column({ nullable: true })
  paymentId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}