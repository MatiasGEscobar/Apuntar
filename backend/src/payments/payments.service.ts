import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import MercadoPagoConfig, { Preference, Payment } from 'mercadopago';

@Injectable()
export class PaymentsService {
  private client: MercadoPagoConfig;
  private frontendUrl: string;
  private backendUrl: string;

  constructor(private configService: ConfigService) {
    const accessToken = this.configService.get<string>('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN no está definido');
    }

    this.client = new MercadoPagoConfig({ accessToken });
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    this.backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:4000';

    // Log de diagnóstico
    console.log('PaymentsService iniciado con FRONTEND_URL:', this.frontendUrl);
    console.log('FRONTEND_URL:', this.frontendUrl);
    console.log('BACKEND_URL:', this.backendUrl);
  }

  async createPreference(data: {
    transactionId: string;
    productTitle: string;
    amount: number;
    buyerCommission: number;
    buyerEmail: string;
  }) {
    try {
      const preference = new Preference(this.client);
      const totalAmount = Number(data.amount) + Number(data.buyerCommission);

      const body = {
  items: [
    {
      id: data.transactionId,
      title: data.productTitle,
      quantity: 1,
      unit_price: totalAmount,
      currency_id: 'ARS',
    },
  ],
  payer: {
    email: data.buyerEmail,
  },
  back_urls: {
    success: `${this.frontendUrl}/transactions?status=success&id=${data.transactionId}`,
    failure: `${this.frontendUrl}/transactions?status=failure&id=${data.transactionId}`,
    pending: `${this.frontendUrl}/transactions?status=pending&id=${data.transactionId}`,
  },
  external_reference: data.transactionId,
  // notification_url: `${this.backendUrl}/api/payments/webhook`,
  statement_descriptor: 'ArmeriaLegal',
};

console.log('=== BODY ENVIADO A MP ===');
console.log(JSON.stringify(body, null, 2));

const response = await preference.create({ body });

      // Logs de diagnóstico
console.log('=== PREFERENCIA CREADA ===');
console.log('ID:', response.id);
console.log('Init Point:', response.init_point);
console.log('Sandbox Init Point:', response.sandbox_init_point);
console.log('Response completo:', JSON.stringify(response, null, 2));

      return {
        preferenceId: response.id,
        initPoint: response.init_point,
        sandboxInitPoint: response.sandbox_init_point,
      };
    } catch (error) {
      console.log('ERROR MERCADOPAGO:', JSON.stringify(error, null, 2));
      throw new BadRequestException(
        error instanceof Error ? error.message : 'Error al crear preferencia de pago'
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