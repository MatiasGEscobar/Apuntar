import { UseGuards, Request, Controller, Post, Body, Param, HttpCode, Patch } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionStatus } from '../transactions/entities/transaction.entity';
import { CoursesService } from '../courses/courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { EnrollmentStatus } from '../courses/entities/course-enrollment.entity';
import { AccessoriesService, CreateAccessoryOrderInput } from '../accessories/accessories.service';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly transactionsService: TransactionsService,
    private readonly coursesService: CoursesService,
    private readonly accessoriesService: AccessoriesService,
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
      externalReference: transactionId,
      description: `Transacción ${transactionId}`,
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

   @Post('process-course/:courseId')
  async processCoursePayment(
    @Param('courseId') courseId: string,
    @Body() body: {
      participantName: string;
      participantDni: string;   
      acceptedTerms: boolean;
      token: string;
      paymentMethodId: string;
      installments: number;
      buyerEmail: string;
      identificationType: string;
      identificationNumber: string;
      userId: string; 
    },
  ) {
    const enrollment = await this.coursesService.createEnrollment(
      courseId,
      body.userId,
      body.participantName,
      body.participantDni,
      body.acceptedTerms,
    );

  try {
    const result = await this.paymentsService.processPayment({
      externalReference: `course_${enrollment.id}`, 
      description: `Inscripción curso ${courseId} - ${body.participantName}`,
      amount: Number(enrollment.amount),
      token: body.token,
      paymentMethodId: body.paymentMethodId,
      installments: body.installments,
      buyerEmail: body.buyerEmail,
      identificationType: body.identificationType,
      identificationNumber: body.identificationNumber,
    });

    if (result.status === 'approved') {
      await this.coursesService.markEnrollmentPaid(enrollment.id, result.paymentId);
    } else if (result.status === 'rejected') {
      await this.coursesService.cancelEnrollment(enrollment.id);
    }

    return { ...result, enrollmentId: enrollment.id };
  } catch (error) {
    await this.coursesService.cancelEnrollment(enrollment.id); // 👈 nuevo: limpia si el pago tira excepción
    throw error;
  }
};

  @Post('webhook')
  @HttpCode(200)
  async webhook(@Body() body: any) {
    const result = await this.paymentsService.processWebhook(body);
    if (result.status === 'approved' && result.externalReference) {
      if (result.externalReference.startsWith('course_')) {
        const enrollmentId = result.externalReference.replace('course_', '');
        await this.coursesService.markEnrollmentPaid(enrollmentId, result.paymentId);
      }else if (result.externalReference.startsWith('accessory_')) {
         const orderId = result.externalReference.replace('accessory_', '');
         await this.confirmAccessoryOrder(orderId, result.paymentId);
      }else {
        await this.transactionsService.updateStatusBySystem(
        result.externalReference,
        TransactionStatus.ESCROW,
        { paymentId: result.paymentId },
      );
    }
  }
    return { received: true };
  }

  @Patch('disputes/:transactionId/resolve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async resolveDispute(
    @Param('transactionId') transactionId: string,
    @Body() body: { resolution: 'buyer' | 'seller'; notes: string },
    @Request() req,
  ) {
    const transaction = await this.transactionsService.findOne(transactionId);

    if (body.resolution === 'buyer' && transaction.mercadoPagoPaymentId) {
      await this.paymentsService.refundPayment(transaction.mercadoPagoPaymentId);
    }

    return this.transactionsService.resolveDispute(transactionId, req.user.id, body.resolution, body.notes);
  }

  @Post('process-accessory/:accessoryId')
  @UseGuards(OptionalJwtAuthGuard)
  async processAccessoryPayment(
    @Param('accessoryId') accessoryId: string,
    @Body() body: CreateAccessoryOrderInput & {
      token: string;
      paymentMethodId: string;
      installments: number;
      identificationType: string;
      identificationNumber: string;
    },
    @Request() req,
  ) {
    const userId = req.user?.id ?? null;
    const order = await this.accessoriesService.createOrder(accessoryId, body, userId);

    try {
      const result = await this.paymentsService.processPayment({
        externalReference: `accessory_${order.id}`,
        description: `Accesorio ${accessoryId} x${order.quantity}`,
        amount: Number(order.amount),
        token: body.token,
        paymentMethodId: body.paymentMethodId,
        installments: body.installments,
        buyerEmail: order.buyerEmail,
        identificationType: body.identificationType,
        identificationNumber: body.identificationNumber,
      });

      if (result.status === 'approved') {
        const oversold = await this.confirmAccessoryOrder(order.id, result.paymentId);
        return { ...result, status: oversold ? 'out_of_stock' : result.status, orderId: order.id };
      }
      if (result.status === 'rejected') {
        await this.accessoriesService.cancelOrder(order.id);
      }
      return { ...result, orderId: order.id };
    } catch (error) {
      await this.accessoriesService.cancelOrder(order.id);
      throw error;
    }
  }

  // Marca la orden como pagada; si se agotó el stock, reembolsa. Devuelve true si hubo reembolso.
  private async confirmAccessoryOrder(orderId: string, paymentId: string): Promise<boolean> {
    const { oversold } = await this.accessoriesService.markOrderPaid(orderId, paymentId);
    if (oversold) await this.paymentsService.refundPayment(paymentId);
    return oversold;
  }
}