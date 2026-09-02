import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

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
    if (user.cluExpirationDate && new Date(user.cluExpirationDate) < new Date()) {
      throw new ForbiddenException(
        'Tu CLU está vencida. Actualizá tu CLU vigente para poder comprar o vender en la plataforma.',
      );
    }
    return user;
  }
}