import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, In } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { User, UserStatus } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

const CLU_EXPIRED_REASON = 'CLU vencido. Actualizá tu CLU para reactivar tu cuenta.';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    // Validar que la contraseña existe
    if (!userData.password) {
      throw new BadRequestException('La contraseña es requerida');
    }

    // Verificar si el email ya existe
    if (userData.email) {
      const existingEmail = await this.usersRepository.findOne({
        where: { email: userData.email },
      });

      if (existingEmail) {
        throw new ConflictException('El email ya está registrado');
      }
    }

    // Verificar si el DNI ya existe
    if (userData.dni) {
      const existingDNI = await this.usersRepository.findOne({
        where: { dni: userData.dni },
      });

      if (existingDNI) {
        throw new ConflictException('El DNI ya está registrado');
      }
    }

    // Verificar si el CLU ya existe
    if (userData.clu) {
      const existingCLU = await this.usersRepository.findOne({
        where: { clu: userData.clu },
      });

      if (existingCLU) {
        throw new ConflictException('El CLU ya está registrado');
      }
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Crear el usuario con la contraseña hasheada
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async findByIds(ids: string[]): Promise<User[]> {
    if (ids.length === 0) return [];
    return this.usersRepository.find({ where: { id: In(ids) } });
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    return user;
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async validatePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    // Si se actualiza la contraseña, hashearla
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }
    await this.usersRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Usuario no encontrado');
    }
  }

  async assertCluValid(id: string): Promise<User> {
    const user = await this.findOne(id);
    const isExpired = user.cluExpirationDate && new Date(user.cluExpirationDate) < new Date();

    if (isExpired) {
    if (user.status === UserStatus.APPROVED) {
        // 👇 chequeo perezoso: corrige el status ahí mismo, no espera al cron
        await this.usersRepository.update(id, {
          status: UserStatus.SUSPENDED,
          rejectionReason: CLU_EXPIRED_REASON,
        });
      }
      throw new ForbiddenException(
        'Tu CLU está vencida. Actualizá tu CLU vigente para poder comprar o vender en la plataforma.',
      );
    }
    return user;
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredClus(): Promise<void> {
    const now = new Date();
    const expiredUsers = await this.usersRepository.find({
      where: {
        status: UserStatus.APPROVED,
        cluExpirationDate: LessThan(now),
      },
    });

    for (const user of expiredUsers) {
      await this.usersRepository.update(user.id, {
        status: UserStatus.SUSPENDED,
        rejectionReason: CLU_EXPIRED_REASON,
      });
    }
  }

  async submitDocuments(
    id: string,
    data: {
      dniFrontUrl?: string;
      dniBackUrl?: string;
      cluFrontUrl?: string;
      cluBackUrl?: string;
      cluExpirationDate?: string;
    },
    ): Promise<User> {
    const user = await this.findOne(id);
    const updates: Partial<User> = { status: UserStatus.IN_REVIEW };
    
    if (data.dniFrontUrl) updates.dniFrontUrl = data.dniFrontUrl;
    if (data.dniBackUrl) updates.dniBackUrl = data.dniBackUrl;
    if (data.cluFrontUrl) updates.cluFrontUrl = data.cluFrontUrl;
    if (data.cluBackUrl) updates.cluBackUrl = data.cluBackUrl;
    
    if (data.cluExpirationDate) {
      if (user.status === UserStatus.APPROVED) {
        updates.pendingCluExpirationDate = new Date(data.cluExpirationDate);
      } else {
        updates.cluExpirationDate = new Date(data.cluExpirationDate);
      }
    }
    await this.usersRepository.update(id, updates);
    return this.findOne(id);
}
}