import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionStatus } from './entities/transaction.entity';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body('productId') productId: string, @Request() req) {
    return this.transactionsService.create(productId, req.user.id);
  }

  @Get()
  findAll() {
    return this.transactionsService.findAll();
  }

  @Get('my-transactions')
  findMyTransactions(@Request() req) {
    return this.transactionsService.findByUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transactionsService.findOne(id);
  }

  @Patch(':id/confirm-payment')
  confirmPayment(
    @Param('id') id: string,
    @Body('paymentId') paymentId: string,
    @Body('preferenceId') preferenceId: string,
    @Request() req,
  ) {
    return this.transactionsService.updateStatus(
      id,
      TransactionStatus.ESCROW,
      req.user.id,
      { paymentId, preferenceId }
    );
  }

  @Patch(':id/confirm-delivery')
  confirmDelivery(@Param('id') id: string, @Request() req) {
    return this.transactionsService.confirmDelivery(id, req.user.id);
  }

  @Patch(':id/cancel')
  cancel(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @Request() req,
  ) {
    return this.transactionsService.updateStatus(
      id,
      TransactionStatus.CANCELLED,
      req.user.id,
      { reason }
    );
  }

  @Patch(':id/rating')
  addRating(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Body('review') review: string,
    @Request() req,
  ) {
    return this.transactionsService.addRating(id, req.user.id, rating, review);
  }
}