import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AccessoriesService } from './accessories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Accessory } from './entities/accessory.entity';

@Controller('accessories')
export class AccessoriesController {
  constructor(private readonly accessoriesService: AccessoriesService) {}

  // Público
  @Get()
  findAll(@Query('category') category?: string, @Query('search') search?: string) {
    return this.accessoriesService.findAll({ category, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accessoriesService.findOne(id);
  }

  // Requiere login, cualquier usuario registrado (sin exigir rol seller ni CLU aprobado)
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: Partial<Accessory>, @Request() req) {
    return this.accessoriesService.create(body, req.user.id);
  }

  @Get('seller/mine')
  @UseGuards(JwtAuthGuard)
  findMine(@Request() req) {
    return this.accessoriesService.findBySeller(req.user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body: Partial<Accessory>, @Request() req) {
    return this.accessoriesService.update(id, body, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.accessoriesService.remove(id, req.user.id);
  }
}