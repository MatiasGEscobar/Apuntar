import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MercadoPagoConfig, { Payment } from 'mercadopago';

@Injectable()
export class PaymentsService {
  private client: MercadoPagoConfig;

  constructor(private configService: ConfigService) {
    const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) throw new Error('MERCADOPAGO_ACCESS_TOKEN no está definido');
    this.client = new MercadoPagoConfig({ accessToken });
  }

  async processPayment(data: {
    externalReference: string;
    description: string;
    amount: number;
    token: string;
    paymentMethodId: string;
    installments: number;
    buyerEmail: string;
    identificationType: string;
    identificationNumber: string;
  }) {
    try {
      const payment = new Payment(this.client);

      const response = await payment.create({
        body: {
          transaction_amount: data.amount,
          token: data.token,
          description: data.description,
          installments: data.installments,
          payment_method_id: data.paymentMethodId,
          payer: {
            email: data.buyerEmail,
            identification: {
              type: data.identificationType,
              number: data.identificationNumber,
            },
          },
          external_reference: data.externalReference,
          notification_url: `${this.configService.get('BACKEND_URL')}/api/payments/webhook`,
        },
      });

      return {
        status: response.status,
        statusDetail: response.status_detail,
        paymentId: String(response.id),
        externalReference: response.external_reference,
      };
    } catch (error) {
      console.log('ERROR MP:', JSON.stringify(error, null, 2));
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Error al procesar el pago'
      );
    }
  }

  async getPayment(paymentId: string) {
    try {
      const payment = new Payment(this.client);
      return await payment.get({ id: paymentId });
    } catch (error) {
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Error al obtener el pago'
      );
    }
  }

  async processWebhook(body: any) {
    if (body.type === 'payment') {
      const paymentId = body.data?.id;
      if (!paymentId) return { received: true };
      const payment = await this.getPayment(String(paymentId));
      return {
        paymentId: String(payment.id),
        status: payment.status,
        externalReference: payment.external_reference,
        amount: payment.transaction_amount,
      };
    }
    return { received: true };
  }
}