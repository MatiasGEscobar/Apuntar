import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { Transaction } from '../transactions/entities/transaction.entity';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('EMAIL_HOST'),
      port: this.configService.get<number>('EMAIL_PORT'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASSWORD'),
      },
    });
  }

  // ========== EMAILS DE VERIFICACIÓN DE USUARIOS ==========

  async sendUserApprovedEmail(user: User) {
    const subject = '✅ Tu cuenta ha sido aprobada - ArmaLegal';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Cuenta Aprobada!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${user.firstName} ${user.lastName}</strong>,</p>
            
            <p>¡Excelentes noticias! Tu cuenta en ArmaLegal ha sido <strong>aprobada</strong>.</p>
            
            <p>Ya puedes:</p>
            <ul>
              <li>✅ Comprar productos del catálogo</li>
              <li>✅ Publicar tus propios productos (si eres vendedor)</li>
              <li>✅ Realizar transacciones seguras con escrow</li>
              <li>✅ Chatear con vendedores/compradores</li>
            </ul>
            
            <p style="text-align: center;">
              <a href="${this.configService.get('FRONTEND_URL')}/products" class="button">
                Ver Catálogo de Productos
              </a>
            </p>
            
            <p><strong>Recordatorio importante:</strong></p>
            <p style="background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 5px;">
              ⚠️ Todas las transacciones deben realizarse en persona con verificación de CLU y DNI vigentes, 
              conforme a las regulaciones del RENAR.
            </p>
          </div>
          <div class="footer">
            <p>ArmaLegal.ar - Plataforma Regulada por RENAR</p>
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  async sendUserRejectedEmail(user: User, reason: string) {
    const subject = '❌ Tu cuenta ha sido rechazada - ArmaLegal';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .reason-box { background: #fee2e2; padding: 15px; border-left: 4px solid #dc2626; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Cuenta Rechazada</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${user.firstName} ${user.lastName}</strong>,</p>
            
            <p>Lamentamos informarte que tu cuenta en ArmaLegal ha sido <strong>rechazada</strong>.</p>
            
            <div class="reason-box">
              <strong>Motivo del rechazo:</strong><br>
              ${reason}
            </div>
            
            <p><strong>¿Qué puedes hacer?</strong></p>
            <ul>
              <li>Verifica que tus documentos sean claros y legibles</li>
              <li>Asegúrate de que tu CLU esté vigente</li>
              <li>Vuelve a subir tus documentos desde tu perfil</li>
            </ul>
            
            <p style="text-align: center;">
              <a href="${this.configService.get('FRONTEND_URL')}/profile/documents" class="button">
                Subir Documentos Nuevamente
              </a>
            </p>
            
            <p>Si tienes dudas, puedes contactarnos a soporte@armalegal.ar</p>
          </div>
          <div class="footer">
            <p>ArmaLegal.ar - Plataforma Regulada por RENAR</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(user.email, subject, html);
  }

  // ========== EMAILS DE PRODUCTOS ==========

  async sendProductApprovedEmail(product: Product, seller: User) {
    const subject = '✅ Tu producto ha sido aprobado - ArmaLegal';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .product-box { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #e5e7eb; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Producto Aprobado!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${seller.firstName}</strong>,</p>
            
            <p>Tu producto ha sido aprobado y ya está <strong>visible en el catálogo</strong>.</p>
            
            <div class="product-box">
              <h3>${product.name}</h3>
              <p><strong>Marca:</strong> ${product.brand}</p>
              <p><strong>Calibre:</strong> ${product.caliber}</p>
              <p><strong>Precio:</strong> $${product.price.toLocaleString()}</p>
            </div>
            
            <p>Los compradores ya pueden ver tu producto y contactarte para realizar una compra.</p>
            
            <p style="text-align: center;">
              <a href="${this.configService.get('FRONTEND_URL')}/products/${product.id}" class="button">
                Ver Mi Producto
              </a>
            </p>
          </div>
          <div class="footer">
            <p>ArmaLegal.ar - Plataforma Regulada por RENAR</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(seller.email, subject, html);
  }

  async sendProductRejectedEmail(product: Product, seller: User, reason: string) {
    const subject = '❌ Tu producto ha sido rechazado - ArmaLegal';
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .reason-box { background: #fee2e2; padding: 15px; border-left: 4px solid #dc2626; border-radius: 5px; margin: 20px 0; }
          .product-box { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border: 2px solid #e5e7eb; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Producto Rechazado</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${seller.firstName}</strong>,</p>
            
            <p>Tu producto ha sido rechazado y no será publicado en el catálogo.</p>
            
            <div class="product-box">
              <h3>${product.name}</h3>
              <p><strong>Marca:</strong> ${product.brand}</p>
              <p><strong>Calibre:</strong> ${product.caliber}</p>
            </div>
            
            <div class="reason-box">
              <strong>Motivo del rechazo:</strong><br>
              ${reason}
            </div>
            
            <p>Puedes corregir la información y volver a publicar tu producto.</p>
          </div>
          <div class="footer">
            <p>ArmaLegal.ar - Plataforma Regulada por RENAR</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.sendEmail(seller.email, subject, html);
  }

  // ========== EMAILS DE TRANSACCIONES ==========

  async sendNewPurchaseEmail(transaction: Transaction) {
    const buyerSubject = '🛒 Compra Iniciada - ArmaLegal';
    const sellerSubject = '💰 Nueva Venta - ArmaLegal';

    // Email al comprador
    const buyerHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .info-box { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Compra Confirmada</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${transaction.buyer.firstName}</strong>,</p>
            
            <p>Tu pago de <strong>$${transaction.amount.toLocaleString()}</strong> está en <strong>escrow</strong> (retenido de forma segura).</p>
            
            <div class="info-box">
              <h3>Producto: ${transaction.product.name}</h3>
              <p><strong>Vendedor:</strong> ${transaction.seller.firstName} ${transaction.seller.lastName}</p>
              <p><strong>Total pagado:</strong> $${(transaction.amount + transaction.buyerCommission).toLocaleString()}</p>
            </div>
            
            <p><strong>Próximos pasos:</strong></p>
            <ol>
              <li>Coordina la entrega con el vendedor por chat</li>
              <li>Verifica CLU y DNI del vendedor en persona</li>
              <li>Confirma la entrega en la plataforma</li>
              <li>El pago se liberará automáticamente al vendedor</li>
            </ol>
            
            <p style="text-align: center;">
              <a href="${this.configService.get('FRONTEND_URL')}/transactions/${transaction.id}" class="button">
                Ir al Chat con Vendedor
              </a>
            </p>
          </div>
          <div class="footer">
            <p>ArmaLegal.ar - Plataforma Regulada por RENAR</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email al vendedor
    const sellerHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .info-box { background: white; padding: 20px; border-radius: 10px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Nueva Venta!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${transaction.seller.firstName}</strong>,</p>
            
            <p>¡Felicitaciones! Has vendido tu producto <strong>${transaction.product.name}</strong>.</p>
            
            <div class="info-box">
              <p><strong>Comprador:</strong> ${transaction.buyer.firstName} ${transaction.buyer.lastName}</p>
              <p><strong>Monto:</strong> $${transaction.amount.toLocaleString()}</p>
              <p><strong>Recibirás:</strong> $${(transaction.amount - transaction.sellerCommission).toLocaleString()} (después de comisión)</p>
            </div>
            
            <p><strong>Próximos pasos:</strong></p>
            <ol>
              <li>Coordina la entrega con el comprador por chat</li>
              <li>Verifica CLU y DNI del comprador en persona</li>
              <li>Espera que el comprador confirme la entrega</li>
              <li>El pago se liberará automáticamente a tu cuenta</li>
            </ol>
            
            <p style="text-align: center;">
              <a href="${this.configService.get('FRONTEND_URL')}/transactions/${transaction.id}" class="button">
                Ir al Chat con Comprador
              </a>
            </p>
          </div>
          <div class="footer">
            <p>ArmaLegal.ar - Plataforma Regulada por RENAR</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar ambos emails
    await Promise.all([
      this.sendEmail(transaction.buyer.email, buyerSubject, buyerHtml),
      this.sendEmail(transaction.seller.email, sellerSubject, sellerHtml),
    ]);
  }

  async sendTransactionCompletedEmail(transaction: Transaction) {
    const buyerSubject = '✅ Transacción Completada - ArmaLegal';
    const sellerSubject = '💰 Pago Liberado - ArmaLegal';

    // Email al comprador
    const buyerHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ ¡Compra Completada!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${transaction.buyer.firstName}</strong>,</p>
            
            <p>Tu compra de <strong>${transaction.product.name}</strong> ha sido completada exitosamente.</p>
            
            <p>El pago ha sido liberado al vendedor.</p>
            
            <p style="text-align: center;">
              <a href="${this.configService.get('FRONTEND_URL')}/transactions/${transaction.id}" class="button">
                Calificar al Vendedor
              </a>
            </p>
            
            <p>Gracias por usar ArmaLegal. ¡Esperamos verte pronto!</p>
          </div>
          <div class="footer">
            <p>ArmaLegal.ar - Plataforma Regulada por RENAR</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Email al vendedor
    const sellerHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; }
          .amount-box { background: #d1fae5; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 ¡Pago Liberado!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>${transaction.seller.firstName}</strong>,</p>
            
            <p>El comprador confirmó la entrega de <strong>${transaction.product.name}</strong>.</p>
            
            <div class="amount-box">
              <h2 style="color: #059669; margin: 0;">$${(transaction.amount - transaction.sellerCommission).toLocaleString()}</h2>
              <p style="margin: 10px 0 0 0; color: #064e3b;">Han sido liberados a tu cuenta</p>
            </div>
            
            <p style="text-align: center;">
              <a href="${this.configService.get('FRONTEND_URL')}/transactions/${transaction.id}" class="button">
                Calificar al Comprador
              </a>
            </p>
            
            <p>¡Gracias por vender en ArmaLegal!</p>
          </div>
          <div class="footer">
            <p>ArmaLegal.ar - Plataforma Regulada por RENAR</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar ambos emails
    await Promise.all([
      this.sendEmail(transaction.buyer.email, buyerSubject, buyerHtml),
      this.sendEmail(transaction.seller.email, sellerSubject, sellerHtml),
    ]);
  }

  // ========== MÉTODO PRIVADO PARA ENVIAR EMAILS ==========

  private async sendEmail(to: string, subject: string, html: string) {
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM'),
        to,
        subject,
        html,
      });

      console.log('✅ Email enviado:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Error enviando email:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Error desconocido' };
    }
  }
}