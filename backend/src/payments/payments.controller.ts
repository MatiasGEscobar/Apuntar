import { Controller, Post, Body, Get, Param, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionStatus } from '../transactions/entities/transaction.entity';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly transactionsService: TransactionsService,
  ) {}

  // Crear preferencia de pago para una transacción
  @Post('create-preference/:transactionId')
  async createPreference(
    @Param('transactionId') transactionId: string,
    @Body() body: { buyerEmail: string; productTitle: string },
  ) {
    const transaction = await this.transactionsService.findOne(transactionId);

    return this.paymentsService.createPreference({
      transactionId,
      productTitle: body.productTitle,
      amount: transaction.amount,
      buyerCommission: transaction.buyerCommission,
      buyerEmail: body.buyerEmail,
    });
  }

  // Webhook: MP notifica el resultado del pago
  @Post('webhook')
  @HttpCode(200)
  async webhook(@Body() body: any) {
    const result = await this.paymentsService.processWebhook(body);

    // Si hay un pago aprobado, actualizamos la transacción a ESCROW
    if (result.status === 'approved' && result.externalReference) {
      await this.transactionsService.updateStatusBySystem(
        result.externalReference,
        TransactionStatus.ESCROW,
        {
          paymentId: result.paymentId,
        },
      );
    }

    return { received: true };
  }
}