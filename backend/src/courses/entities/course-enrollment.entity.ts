import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
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

  // Usado solo para chequear duplicados sin importar mayúsculas/espacios
  @Column()
  participantNameNormalized: string;

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

  @BeforeInsert()
  @BeforeUpdate()
  normalizeParticipantName() {
    this.participantNameNormalized = this.participantName.trim().toLowerCase();
  }
}