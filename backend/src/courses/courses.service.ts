import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private coursesRepository: Repository<Course>,
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
}