import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from './entities/product.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private usersService: UsersService,
  ) {}

  async create(productData: Partial<Product>, userId: string): Promise<Product> {
    await this.usersService.assertCluValid(userId);
    const product = this.productsRepository.create({
      ...productData,
      sellerId: userId,
      status: ProductStatus.PENDING,
    });

    return this.productsRepository.save(product);
  }

  async findAll(filters?: {
    category?: string;
    status?: string;
    search?: string;
  }): Promise<Product[]> {
    const query = this.productsRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.seller', 'seller');

    if (filters?.category) {
      query.andWhere('product.category = :category', { category: filters.category });
    }

    if (filters?.status) {
      query.andWhere('product.status = :status', { status: filters.status });
    }

    if (filters?.search) {
      query.andWhere(
        '(product.name ILIKE :search OR product.brand ILIKE :search OR product.model ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['seller'],
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Incrementar vistas
    await this.productsRepository.increment({ id }, 'views', 1);

    return product;
  }

  async findBySeller(sellerId: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: { sellerId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateData: Partial<Product>, userId: string): Promise<Product> {
    const product = await this.findOne(id);

    if (product.sellerId !== userId) {
      throw new ForbiddenException('No tienes permiso para editar este producto');
    }

    await this.productsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const product = await this.findOne(id);

    if (product.sellerId !== userId) {
      throw new ForbiddenException('No tienes permiso para eliminar este producto');
    }

    await this.productsRepository.delete(id);
  }

  async approve(id: string, adminId: string): Promise<Product> {
    await this.productsRepository.update(id, {
      status: ProductStatus.APPROVED,
      moderatedBy: adminId,
      moderatedAt: new Date(),
    });

    return this.findOne(id);
  }

  async reject(id: string, adminId: string, reason: string): Promise<Product> {
    await this.productsRepository.update(id, {
      status: ProductStatus.REJECTED,
      moderatedBy: adminId,
      moderatedAt: new Date(),
      rejectionReason: reason,
    });

    return this.findOne(id);
  }
}