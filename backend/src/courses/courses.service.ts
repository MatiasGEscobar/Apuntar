import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CourseEnrollment, EnrollmentStatus } from './entities/course-enrollment.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
    @InjectRepository(CourseEnrollment) 
    private enrollmentsRepository: Repository<CourseEnrollment>,
  ) {}

  async create(data: Partial<Course>): Promise<Course> {
    const course = this.coursesRepository.create(data);
    return this.coursesRepository.save(course);
  }

  async findAll(onlyActive = false): Promise<Course[]> {
    if (onlyActive) {
      return this.coursesRepository.find({
        where: { isActive: true },
        order: { startDate: 'ASC' },
      });
    }
    return this.coursesRepository.find({ order: { startDate: 'ASC' } });
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.coursesRepository.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Curso no encontrado');
    return course;
  }

  async update(id: string, data: Partial<Course>): Promise<Course> {
    await this.findOne(id);
    await this.coursesRepository.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.coursesRepository.delete(id);
  }

  async decrementSpot(id: string): Promise<Course> {
    const course = await this.findOne(id);
    if (course.availableSpots <= 0) {
      throw new NotFoundException('No hay cupos disponibles');
    }
    await this.coursesRepository.update(id, {
      availableSpots: course.availableSpots - 1,
    });
    return this.findOne(id);
  }

  async createEnrollment(
    courseId: string,
    userId: string,
    participantName: string,
  ): Promise<CourseEnrollment> {
    const course = await this.findOne(courseId);

    const normalized = participantName.trim().toLowerCase();
    const existing = await this.enrollmentsRepository.findOne({
      where: { courseId, participantNameNormalized: normalized },
    });
    if (existing && existing.status !== EnrollmentStatus.CANCELLED) {
      throw new ConflictException(
        'Ya existe una inscripción activa con ese nombre de participante para este curso',
      );
    }

    const amount = course.discountPrice ?? course.price;

    const enrollment = this.enrollmentsRepository.create({
      courseId,
      userId,
      participantName: participantName.trim(),
      amount,
      status: EnrollmentStatus.PENDING,
    });
    return this.enrollmentsRepository.save(enrollment);
  }

  async findEnrollment(id: string): Promise<CourseEnrollment> {
    const enrollment = await this.enrollmentsRepository.findOne({ where: { id } });
    if (!enrollment) throw new NotFoundException('Inscripción no encontrada');
    return enrollment;
  }

  async cancelEnrollment(id: string): Promise<void> {
  await this.enrollmentsRepository.update(id, { status: EnrollmentStatus.CANCELLED });
  }

  async markEnrollmentPaid(id: string, paymentId: string): Promise<CourseEnrollment> {
    const enrollment = await this.findEnrollment(id);
    if (enrollment.status === EnrollmentStatus.PAID) return enrollment; // evita descontar cupo 2 veces
    await this.enrollmentsRepository.update(id, { status: EnrollmentStatus.PAID, paymentId });
    await this.decrementSpot(enrollment.courseId);
    return this.findEnrollment(id);
  }
}