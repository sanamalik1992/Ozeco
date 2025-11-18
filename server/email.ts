import type { Order, OrderItem, Product } from '@shared/schema';
import { getUncachableResendClient } from './resend';

const SUPPORT_EMAIL = 'support@ozeco.co.uk';

interface OrderEmailData extends Order {
  items: Array<OrderItem & { product: Product }>;
}

export async function sendOrderConfirmationEmail(order: OrderEmailData) {
  try {
    const { client: resendClient, fromEmail } = await getUncachableResendClient();
    
    console.log(`Sending order confirmation email for order ${order.id} to ${order.customerEmail}`);

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.product.name}</strong><br>
          <span style="color: #6b7280; font-size: 14px;">Quantity: ${item.quantity}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          £${(parseFloat(item.priceAtTime) * item.quantity).toFixed(2)}
        </td>
      </tr>
    `
    )
    .join('');

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation - Ozeco</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Your Order!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${order.customerName},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Your order has been received and is being processed. We'll send you another email when your Electric bike ships.
    </p>
    
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <h2 style="margin-top: 0; font-size: 20px; color: #10b981;">Order Details</h2>
      <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.id.substring(0, 8)}...</p>
      <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
      <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${order.paymentMethod === 'stripe' ? 'Card/Shop Pay' : 'PayPal'}</p>
    </div>
    
    <h3 style="margin-top: 30px; margin-bottom: 15px; font-size: 18px;">Items Ordered</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      ${itemsHtml}
      <tr>
        <td style="padding: 12px; font-weight: bold; font-size: 18px;">Total</td>
        <td style="padding: 12px; font-weight: bold; font-size: 18px; text-align: right;">£${parseFloat(order.totalAmount).toFixed(2)}</td>
      </tr>
    </table>
    
    <h3 style="margin-top: 30px; margin-bottom: 15px; font-size: 18px;">Shipping Address</h3>
    <div style="background: #f9fafb; padding: 15px; border-radius: 8px;">
      <p style="margin: 5px 0;">${order.shippingAddressLine1}</p>
      ${order.shippingAddressLine2 ? `<p style="margin: 5px 0;">${order.shippingAddressLine2}</p>` : ''}
      <p style="margin: 5px 0;">${order.shippingCity}, ${order.shippingPostalCode}</p>
      <p style="margin: 5px 0;">${order.shippingCountry}</p>
    </div>
    
    <div style="background: #ecfdf5; border: 1px solid #10b981; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #065f46; font-weight: 600;">📦 Dispatch within 1 working day</p>
      <p style="margin: 5px 0 0 0; color: #065f46;">🚚 Shipping time: 2-3 working days</p>
    </div>
    
    <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
      If you have any questions, please contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #10b981;">${SUPPORT_EMAIL}</a>
    </p>
    
    <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
      Best regards,<br>
      The Ozeco Team
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>Ozeco Ltd • Electric Bikes Specialist • ozeco.co.uk</p>
  </div>
</body>
</html>
  `;

    // Send to customer
    console.log(`Attempting to send customer email to: ${order.customerEmail}`);
    try {
      const customerEmailResult = await resendClient.emails.send({
        from: fromEmail,
        to: order.customerEmail,
        subject: `Order Confirmation - Ozeco`,
        html: emailHtml,
      });
      console.log(`✅ Customer email sent successfully:`, customerEmailResult);
    } catch (customerError: any) {
      console.error(`❌ Failed to send customer email to ${order.customerEmail}:`, customerError);
      throw customerError; // Re-throw to ensure we know about failures
    }

    // Send to support
    console.log(`Attempting to send support email to: ${SUPPORT_EMAIL}`);
    try {
      const supportEmailResult = await resendClient.emails.send({
        from: fromEmail,
        to: SUPPORT_EMAIL,
        subject: `New Order: ${order.customerName} - £${parseFloat(order.totalAmount).toFixed(2)}`,
        html: emailHtml,
      });
      console.log(`✅ Support email sent successfully:`, supportEmailResult);
    } catch (supportError: any) {
      console.error(`❌ Failed to send support email:`, supportError);
      throw supportError; // Re-throw to ensure we know about failures
    }

    console.log(`✅ ALL order confirmation emails sent successfully for order ${order.id}`);
  } catch (error) {
    console.error('Failed to send order confirmation email:', error);
    // Don't throw - allow order to complete even if email fails
  }
}

export async function sendShippingConfirmationEmail(
  order: OrderEmailData,
  trackingNumber: string
) {
  try {
    const { client: resendClient, fromEmail } = await getUncachableResendClient();
    
    console.log(`Sending shipping confirmation email for order ${order.id} to ${order.customerEmail}`);

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${item.product.name}</strong><br>
          <span style="color: #6b7280; font-size: 14px;">Quantity: ${item.quantity}</span>
        </td>
      </tr>
    `
    )
    .join('');

  const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Order Has Shipped - Ozeco</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">📦 Your Order Has Shipped!</h1>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <p style="font-size: 16px; margin-bottom: 20px;">Hi ${order.customerName},</p>
    
    <p style="font-size: 16px; margin-bottom: 20px;">
      Great news! Your Electric bike order is on its way to you.
    </p>
    
    <div style="background: #ecfdf5; border: 2px solid #10b981; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
      <p style="margin: 0 0 10px 0; color: #065f46; font-weight: 600; font-size: 14px;">TRACKING NUMBER</p>
      <p style="margin: 0; color: #065f46; font-size: 24px; font-weight: bold; font-family: monospace; letter-spacing: 1px;">${trackingNumber}</p>
    </div>
    
    <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <h2 style="margin-top: 0; font-size: 20px; color: #10b981;">Order Details</h2>
      <p style="margin: 5px 0;"><strong>Order ID:</strong> ${order.id.substring(0, 8)}...</p>
      <p style="margin: 5px 0;"><strong>Shipping Address:</strong></p>
      <p style="margin: 5px 0 5px 20px;">
        ${order.shippingAddressLine1}<br>
        ${order.shippingAddressLine2 ? `${order.shippingAddressLine2}<br>` : ''}
        ${order.shippingCity}, ${order.shippingPostalCode}<br>
        ${order.shippingCountry}
      </p>
    </div>
    
    <h3 style="margin-top: 30px; margin-bottom: 15px; font-size: 18px;">Items Shipped</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      ${itemsHtml}
    </table>
    
    <div style="background: #eff6ff; border: 1px solid #3b82f6; padding: 20px; border-radius: 8px; margin: 30px 0;">
      <p style="margin: 0; color: #1e40af; font-weight: 600;">🚚 Expected Delivery: 2-3 working days</p>
    </div>
    
    <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
      If you have any questions about your delivery, please contact us at <a href="mailto:${SUPPORT_EMAIL}" style="color: #10b981;">${SUPPORT_EMAIL}</a>
    </p>
    
    <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
      Best regards,<br>
      The Ozeco Team
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>Ozeco Ltd • Electric Bikes Specialist • ozeco.co.uk</p>
  </div>
</body>
</html>
  `;

    await resendClient.emails.send({
      from: fromEmail,
      to: order.customerEmail,
      subject: `Your Ozeco Order Has Shipped - Tracking: ${trackingNumber}`,
      html: emailHtml,
    });

    console.log(`Shipping confirmation email sent for order ${order.id}`);
  } catch (error) {
    console.error('Failed to send shipping confirmation email:', error);
    // Don't throw - allow order to complete even if email fails
  }
}
