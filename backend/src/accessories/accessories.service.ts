import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Accessory } from './entities/accessory.entity';
import { AccessoryOrder, AccessoryOrderStatus, DeliveryMethod } from './entities/accessory-order.entity';
import { UsersService } from '../users/users.service';

export interface CreateAccessoryOrderInput {
  quantity?: number;
  deliveryMethod?: DeliveryMethod;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingProvince?: string;
  shippingPostalCode?: string;
}

@Injectable()
export class AccessoriesService {
  constructor(
    @InjectRepository(Accessory)
    private accessoriesRepository: Repository<Accessory>,
    @InjectRepository(AccessoryOrder)
    private ordersRepository: Repository<AccessoryOrder>,
    private usersService: UsersService,
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

  async createOrder(
    accessoryId: string,
    input: CreateAccessoryOrderInput,
    userId: string | null,
  ): Promise<AccessoryOrder> {
    const accessory = await this.findOneRaw(accessoryId);

    if (!accessory.isActive) {
      throw new BadRequestException('Este accesorio ya no está disponible');
    }
    if (userId && userId === accessory.sellerId) {
      throw new BadRequestException('No podés comprar tu propio accesorio');
    }

    const quantity = Number(input.quantity ?? 1);
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestException('Cantidad inválida');
    }
    if (accessory.stock < quantity) {
      throw new BadRequestException('No hay stock suficiente para esa cantidad');
    }

    const method = input.deliveryMethod;
    if (method === DeliveryMethod.SHIPPING && !accessory.allowsShipping) {
      throw new BadRequestException('Este accesorio no se ofrece con envío');
    }
    if (method === DeliveryMethod.IN_PERSON && !accessory.allowsInPerson) {
      throw new BadRequestException('Este accesorio no se ofrece con entrega en persona');
    }
    if (method !== DeliveryMethod.SHIPPING && method !== DeliveryMethod.IN_PERSON) {
      throw new BadRequestException('Elegí un método de entrega');
    }

    // Datos del comprador: perfil si está logueado, formulario si es invitado
    let buyerName: string;
    let buyerEmail: string;
    let buyerPhone: string;
    let profileAddress: { address?: string; city?: string; province?: string; postalCode?: string } = {};

    if (userId) {
      const user = await this.usersService.findOne(userId);
      buyerName = `${user.firstName} ${user.lastName}`;
      buyerEmail = user.email;
      buyerPhone = (input.buyerPhone || user.phone || '').trim();
      profileAddress = {
        address: user.address,
        city: user.city,
        province: user.province,
        postalCode: user.postalCode,
      };
    } else {
      buyerName = (input.buyerName || '').trim();
      buyerEmail = (input.buyerEmail || '').trim();
      buyerPhone = (input.buyerPhone || '').trim();
      if (!buyerName || !buyerEmail) {
        throw new BadRequestException('Ingresá tu nombre y email');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
        throw new BadRequestException('El email no es válido');
      }
    }
    if (!buyerPhone) {
      throw new BadRequestException('Ingresá un teléfono de contacto');
    }

    let shipping = {
      shippingAddress: null as string | null,
      shippingCity: null as string | null,
      shippingProvince: null as string | null,
      shippingPostalCode: null as string | null,
    };
    if (method === DeliveryMethod.SHIPPING) {
      const address = (input.shippingAddress || profileAddress.address || '').trim();
      const city = (input.shippingCity || profileAddress.city || '').trim();
      const province = (input.shippingProvince || profileAddress.province || '').trim();
      if (!address || !city || !province) {
        throw new BadRequestException('Completá la dirección de envío (calle, ciudad y provincia)');
      }
      shipping = {
        shippingAddress: address,
        shippingCity: city,
        shippingProvince: province,
        shippingPostalCode: (input.shippingPostalCode || profileAddress.postalCode || '').trim() || null,
      };
    }

    const order = this.ordersRepository.create({
      accessoryId,
      buyerUserId: userId,
      buyerName,
      buyerEmail,
      buyerPhone,
      deliveryMethod: method,
      ...shipping,
      quantity,
      amount: Number(accessory.price) * quantity,
      status: AccessoryOrderStatus.PENDING,
    });
    return this.ordersRepository.save(order);
  }

  async findOrder(id: string): Promise<AccessoryOrder> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Orden no encontrada');
    return order;
  }

  // Idempotente y a prueba de carreras (respuesta del pago + webhook casi simultáneos)
  async markOrderPaid(
    orderId: string,
    paymentId: string,
  ): Promise<{ order: AccessoryOrder; oversold: boolean }> {
    // 1) "Reclamar" la orden: solo una llamada logra pasarla de pending a paid
    const claim = await this.ordersRepository.update(
      { id: orderId, status: AccessoryOrderStatus.PENDING },
      { status: AccessoryOrderStatus.PAID, paymentId },
    );
    if (!claim.affected) {
      return { order: await this.findOrder(orderId), oversold: false };
    }

    // 2) Descontar stock solo si alcanza (operación atómica)
    const order = await this.findOrder(orderId);
    const decrement = await this.accessoriesRepository
      .createQueryBuilder()
      .update(Accessory)
      .set({ stock: () => `stock - ${Number(order.quantity)}` })
      .where('id = :id AND stock >= :qty', { id: order.accessoryId, qty: order.quantity })
      .execute();

    if (!decrement.affected) {
      // Se agotó entre medio: se cancela y el controller reembolsa
      await this.ordersRepository.update(orderId, { status: AccessoryOrderStatus.CANCELLED });
      return { order: await this.findOrder(orderId), oversold: true };
    }

    return { order, oversold: false };
  }

  async cancelOrder(orderId: string): Promise<void> {
    await this.ordersRepository.update(
      { id: orderId, status: AccessoryOrderStatus.PENDING },
      { status: AccessoryOrderStatus.CANCELLED },
    );
  }

  // Respaldo: órdenes pendientes de más de 24 hs (pagos "en proceso" que nunca se resolvieron)
  @Cron(CronExpression.EVERY_HOUR)
  async cleanupStalePendingOrders(): Promise<void> {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await this.ordersRepository.update(
      { status: AccessoryOrderStatus.PENDING, createdAt: LessThan(cutoff) },
      { status: AccessoryOrderStatus.CANCELLED },
    );
  }
}