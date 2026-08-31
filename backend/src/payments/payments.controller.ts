import { Controller, Post, Body, Param, HttpCode } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { TransactionsService } from '../transactions/transactions.service';
import { TransactionStatus } from '../transactions/entities/transaction.entity';
import { CoursesService } from '../courses/courses.service';
import { EnrollmentStatus } from '../courses/entities/course-enrollment.entity';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly transactionsService: TransactionsService,
    private readonly coursesService: CoursesService,
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

    const result = await this.paymentsService.processPayment({
      externalReference: `course_${enrollment.id}`, // 👈 prefijo para distinguir en el webhook
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
  }

  @Post('webhook')
  @HttpCode(200)
  async webhook(@Body() body: any) {
    const result = await this.paymentsService.processWebhook(body);
    if (result.status === 'approved' && result.externalReference) {
      if (result.externalReference.startsWith('course_')) {
        const enrollmentId = result.externalReference.replace('course_', '');
        await this.coursesService.markEnrollmentPaid(enrollmentId, result.paymentId);
      } else {
        await this.transactionsService.updateStatusBySystem(
        result.externalReference,
        TransactionStatus.ESCROW,
        { paymentId: result.paymentId },
      );
    }
  }
    return { received: true };
  }
}