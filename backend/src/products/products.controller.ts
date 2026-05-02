import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApprovedUserGuard } from '../auth/guards/approved-user.guard'; // ← AGREGAR
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService, private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, ApprovedUserGuard) // ← AGREGAR ApprovedUserGuard
  create(@Body() createProductDto: CreateProductDto, @Request() req) {
    return this.productsService.create(createProductDto, req.user.id);
  }

  @Get()
  findAll(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.productsService.findAll({ category, status, search });
  }

  @Get('my-products')
  @UseGuards(JwtAuthGuard)
  findMine(@Request() req) {
    return this.productsService.findBySeller(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, ApprovedUserGuard) // ← AGREGAR
  update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req,
  ) {
    return this.productsService.update(id, updateProductDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, ApprovedUserGuard) // ← AGREGAR
  remove(@Param('id') id: string, @Request() req) {
    return this.productsService.remove(id, req.user.id);
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async approve(@Param('id') id: string, @Request() req) {
    const product = await this.productsService.approve(id, req.user.id);

    await this.notificationsService.sendProductApprovedEmail(product, product.seller);

    return product;
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async reject(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    const product = await this.productsService.reject(id, req.user.id, reason);

    // ← ENVIAR EMAIL
    await this.notificationsService.sendProductRejectedEmail(product, product.seller, reason);

    return product;
  }
}