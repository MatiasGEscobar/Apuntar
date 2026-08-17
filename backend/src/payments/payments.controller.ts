import { Controller, Post, Body, Param, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionStatus } from '../transactions/entities/transaction.entity';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly transactionsService: TransactionsService,
  ) {}

  @Post('process/:transactionId')
  async processPayment(
    @Param('transactionId') transactionId: string,
    @Body() body: {
      token: string;
      paymentMethodId: string;
      installments: number;
      buyerEmail: string;
      identificationType: string;
      identificationNumber: string;
    },
  ) {
    const transaction = await this.transactionsService.findOne(transactionId);
    const totalAmount = Number(transaction.amount) + Number(transaction.buyerCommission);

    const result = await this.paymentsService.processPayment({
      transactionId,
      amount: totalAmount,
      token: body.token,
      paymentMethodId: body.paymentMethodId,
      installments: body.installments,
      buyerEmail: body.buyerEmail,
      identificationType: body.identificationType,
      identificationNumber: body.identificationNumber,
    });

    if (result.status === 'approved') {
      await this.transactionsService.updateStatusBySystem(
        transactionId,
        TransactionStatus.ESCROW,
        { paymentId: result.paymentId },
      );
    }

    return result;
  }

  @Post('webhook')
  @HttpCode(200)
  async webhook(@Body() body: any) {
    const result = await this.paymentsService.processWebhook(body);
    if (result.status === 'approved' && result.externalReference) {
      await this.transactionsService.updateStatusBySystem(
        result.externalReference,
        TransactionStatus.ESCROW,
        { paymentId: result.paymentId },
      );
    }
    return { received: true };
  }
}