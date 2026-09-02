import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, TransactionStatus } from './entities/transaction.entity';
import { ProductsService } from '../products/products.service';
import { ProductStatus } from '../products/entities/product.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    private productsService: ProductsService,
    private usersService: UsersService,
  ) {}

  async create(productId: string, buyerId: string): Promise<Transaction> {
    await this.usersService.assertCluValid(buyerId);
    
    const product = await this.productsService.findOne(productId);

    await this.usersService.assertCluValid(product.sellerId);

    if (product.status !== ProductStatus.APPROVED) {
      throw new BadRequestException('El producto no está disponible para compra');
    }

    if (product.sellerId === buyerId) {
      throw new BadRequestException('No puedes comprar tu propio producto');
    }

    // Calcular comisiones
    const amount = Number(product.price);
    const buyerCommission = amount * 0.015; // 1.5%
    const sellerCommission = amount * 0.015; // 1.5%
    const totalCommission = buyerCommission + sellerCommission; // 3%

    const transaction = this.transactionsRepository.create({
      productId,
      buyerId,
      sellerId: product.sellerId,
      amount,
      buyerCommission,
      sellerCommission,
      totalCommission,
      status: TransactionStatus.PENDING,
    });

    // Reservar producto
    await this.productsService.update(productId, { status: ProductStatus.RESERVED }, product.sellerId);

    return this.transactionsRepository.save(transaction);
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: string): Promise<Transaction[]> {
    return this.transactionsRepository.find({
      where: [
        { buyerId: userId },
        { sellerId: userId },
      ],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findOne({
      where: { id },
    });

    if (!transaction) {
      throw new NotFoundException('Transacción no encontrada');
    }

    return transaction;
  }

  async updateStatus(
    id: string, 
    status: TransactionStatus, 
    userId: string,
    metadata?: any
  ): Promise<Transaction> {
    const transaction = await this.findOne(id);

    // Validar que el usuario tenga permiso
    if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
      throw new ForbiddenException('No tienes permiso para modificar esta transacción');
    }

    const updateData: any = { status };

    if (status === TransactionStatus.ESCROW) {
      updateData.mercadoPagoPaymentId = metadata?.paymentId;
      updateData.mercadoPagoPreferenceId = metadata?.preferenceId;
    }

    if (status === TransactionStatus.COMPLETED) {
      updateData.completedAt = new Date();
      // Marcar producto como vendido
      await this.productsService.update(
        transaction.productId, 
        { status: ProductStatus.SOLD },
        transaction.sellerId
      );
    }

    if (status === TransactionStatus.CANCELLED) {
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = metadata?.reason;
      // Liberar producto
      await this.productsService.update(
        transaction.productId,
        { status: ProductStatus.APPROVED },
        transaction.sellerId
      );
    }

    await this.transactionsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async addRating(
    id: string,
    userId: string,
    rating: number,
    review?: string
  ): Promise<Transaction> {
    const transaction = await this.findOne(id);

    if (transaction.status !== TransactionStatus.COMPLETED) {
      throw new BadRequestException('Solo puedes calificar transacciones completadas');
    }

    const updateData: any = {};

    if (transaction.buyerId === userId) {
      updateData.buyerRating = rating;
      updateData.buyerReview = review;
    } else if (transaction.sellerId === userId) {
      updateData.sellerRating = rating;
      updateData.sellerReview = review;
    } else {
      throw new ForbiddenException('No tienes permiso para calificar esta transacción');
    }

    await this.transactionsRepository.update(id, updateData);
    return this.findOne(id);
  }

  async confirmDelivery(id: string, buyerId: string): Promise<Transaction> {
    const transaction = await this.findOne(id);

    if (transaction.buyerId !== buyerId) {
      throw new ForbiddenException('Solo el comprador puede confirmar la entrega');
    }

    if (transaction.status !== TransactionStatus.ESCROW) {
      throw new BadRequestException('La transacción no está en escrow');
    }

    return this.updateStatus(id, TransactionStatus.COMPLETED, buyerId);
  }

  // Método interno para actualizaciones del sistema (webhooks)
async updateStatusBySystem(
  id: string,
  status: TransactionStatus,
  metadata?: any,
): Promise<Transaction> {
  const transaction = await this.findOne(id);
  const updateData: any = { status };

  if (status === TransactionStatus.ESCROW) {
    updateData.mercadoPagoPaymentId = metadata?.paymentId;
  }

  await this.transactionsRepository.update(id, updateData);
  return this.findOne(id);
}
}