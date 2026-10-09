import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Accessory } from './entities/accessory.entity';

@Injectable()
export class AccessoriesService {
  constructor(
    @InjectRepository(Accessory)
    private accessoriesRepository: Repository<Accessory>,
  ) {}

  async create(data: Partial<Accessory>, sellerId: string): Promise<Accessory> {
    if (!data.allowsShipping && !data.allowsInPerson) {
      throw new BadRequestException('Debés habilitar al menos un método de entrega (envío o en persona)');
    }

    const accessory = this.accessoriesRepository.create({
      ...data,
      sellerId,
      isActive: true,
    });
    return this.accessoriesRepository.save(accessory);
  }

  async findAll(filters?: { category?: string; search?: string }): Promise<Accessory[]> {
    const query = this.accessoriesRepository
      .createQueryBuilder('accessory')
      .where('accessory.isActive = :isActive', { isActive: true })
      .andWhere('accessory.stock > 0');

    if (filters?.category) {
      query.andWhere('accessory.category = :category', { category: filters.category });
    }
    if (filters?.search) {
      query.andWhere('accessory.name ILIKE :search', { search: `%${filters.search}%` });
    }

    return query.orderBy('accessory.createdAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Accessory> {
    const accessory = await this.accessoriesRepository.findOne({ where: { id } });
    if (!accessory) {
      throw new NotFoundException('Accesorio no encontrado');
    }
    await this.accessoriesRepository.increment({ id }, 'views', 1);
    return accessory;
  }

  async findBySeller(sellerId: string): Promise<Accessory[]> {
    return this.accessoriesRepository.find({
      where: { sellerId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, data: Partial<Accessory>, userId: string): Promise<Accessory> {
    const accessory = await this.findOneRaw(id);
    if (accessory.sellerId !== userId) {
      throw new ForbiddenException('No tenés permiso para editar este accesorio');
    }

    const willAllowShipping = data.allowsShipping ?? accessory.allowsShipping;
    const willAllowInPerson = data.allowsInPerson ?? accessory.allowsInPerson;
    if (!willAllowShipping && !willAllowInPerson) {
      throw new BadRequestException('Debés habilitar al menos un método de entrega (envío o en persona)');
    }

    await this.accessoriesRepository.update(id, data);
    return this.findOneRaw(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const accessory = await this.findOneRaw(id);
    if (accessory.sellerId !== userId) {
      throw new ForbiddenException('No tenés permiso para eliminar este accesorio');
    }
    await this.accessoriesRepository.delete(id);
  }

  // Búsqueda sin incrementar vistas (para uso interno: update/remove/checkout)
  private async findOneRaw(id: string): Promise<Accessory> {
    const accessory = await this.accessoriesRepository.findOne({ where: { id } });
    if (!accessory) {
      throw new NotFoundException('Accesorio no encontrado');
    }
    return accessory;
  }
}