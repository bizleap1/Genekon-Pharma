import { Resend } from "resend";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { Order, DeliveryAddressSnapshot } from "../db/schema/orders";
import { OrderItem } from "../db/schema/orderItems";
import { Payment } from "../db/schema/payments";

const resendClient = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

interface CustomerInfo {
  name: string;
  email: string;
}

export const emailNotificationService = {
  /**
   * Helper: Dispatches an email via Resend with graceful fallback (non-blocking)
   */
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!resendClient || !env.RESEND_API_KEY) {
      logger.warn(`Resend API key not configured. Mocking email dispatch to ${to}: ${subject}`);
      return false;
    }

    try {
      const response = await resendClient.emails.send({
        from: env.RESEND_FROM_EMAIL || "Genekon Pharmacy <onboarding@resend.dev>",
        to,
        subject,
        html,
      });

      logger.info(`Dispatched email to ${to} (Subject: "${subject}") via Resend. ID: ${response.data?.id}`);
      return true;
    } catch (err) {
      logger.error(`Failed to send email to ${to} via Resend:`, err);
      return false;
    }
  },

  /**
   * 1. Order Placed Confirmation Email (Sent on initial order placement - Online or COD)
   */
  async sendOrderPlacedConfirmation(
    order: Order,
    items: OrderItem[],
    customer: CustomerInfo
  ): Promise<boolean> {
    const isCod = order.paymentMethod === "COD";
    const address = order.deliveryAddressSnapshot as DeliveryAddressSnapshot;

    const itemsRows = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; color: #14304A;">
            <strong>${item.productNameSnapshot}</strong><br/>
            <span style="font-size: 12px; color: #6B7280;">SKU: ${item.skuSnapshot} ${item.dosageFormSnapshot ? `| Form: ${item.dosageFormSnapshot}` : ""}</span>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; text-align: center; color: #14304A;">
            ${item.quantity}
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #E5E7EB; text-align: right; font-weight: bold; color: #14304A;">
            ₹${(Number(item.price) * item.quantity).toFixed(2)}
          </td>
        </tr>
      `
      )
      .join("");

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFCFA; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #14304A; padding: 24px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">GENEKON PHARMACY</h1>
          <p style="color: #A3E635; margin: 6px 0 0 0; font-size: 14px; font-weight: 500;">Trusted Healthcare & Wholesale Diagnostics</p>
        </div>
        
        <div style="padding: 24px; color: #14304A;">
          <h2 style="color: #14304A; margin-top: 0;">Order Placed Successfully!</h2>
          <p>Dear ${customer.name},</p>
          <p>Thank you for placing your order with Genekon Pharmacy. We have received your order <strong>#${order.orderNumber}</strong>.</p>
          
          ${
            order.prescriptionRequired
              ? `<div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 12px; margin: 16px 0; border-radius: 4px;">
                  <strong style="color: #92400E;">Prescription Verification in Progress</strong>
                  <p style="margin: 4px 0 0 0; color: #78350F; font-size: 13px;">This order contains prescription medications. Our licensed pharmacist is reviewing your prescription and will confirm your order shortly.</p>
                </div>`
              : ""
          }

          <div style="background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #14304A; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">Order Summary</h3>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
              <thead>
                <tr style="color: #6B7280; font-size: 12px; text-transform: uppercase;">
                  <th style="text-align: left; padding-bottom: 8px;">Item</th>
                  <th style="text-align: center; padding-bottom: 8px;">Qty</th>
                  <th style="text-align: right; padding-bottom: 8px;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>
            
            <div style="margin-top: 16px; border-top: 1px solid #E5E7EB; padding-top: 12px; font-size: 14px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>Subtotal:</span>
                <span>₹${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #559620;">
                <span>Discount:</span>
                <span>-₹${Number(order.discountAmount).toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>Delivery Fee:</span>
                <span>${Number(order.deliveryFee) === 0 ? "FREE" : `₹${Number(order.deliveryFee).toFixed(2)}`}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 8px; padding-top: 8px; border-top: 2px solid #14304A; font-size: 16px; font-weight: bold;">
                <span>Total Amount:</span>
                <span style="color: #559620;">₹${Number(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div style="background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
            <h4 style="margin-top: 0; color: #14304A; margin-bottom: 8px;">Delivery Details</h4>
            <p style="margin: 0; font-size: 14px; color: #4B5563;">
              <strong>${address.fullName}</strong> (${address.phone})<br/>
              ${address.addressLine}${address.landmark ? `, Landmark: ${address.landmark}` : ""}<br/>
              ${address.city}, ${address.state} - ${address.pincode}
            </p>
            <p style="margin: 12px 0 0 0; font-size: 14px; color: #4B5563;">
              <strong>Payment Method:</strong> ${isCod ? "Cash on Delivery (COD)" : order.paymentMethod}
            </p>
          </div>

          <p style="font-size: 13px; color: #6B7280; text-align: center; margin-top: 24px;">
            Need help? Contact our clinical pharmacy support at <a href="mailto:support@genekonpharma.com" style="color: #559620;">support@genekonpharma.com</a>
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(customer.email, `Order Confirmation - #${order.orderNumber} | Genekon Pharmacy`, html);
  },

  /**
   * 2. Payment Success Receipt Email (Sent immediately upon successful Razorpay verification)
   */
  async sendPaymentReceiptEmail(
    order: Order,
    payment: Payment,
    customer: CustomerInfo
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFCFA; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #559620; padding: 24px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">Payment Received!</h1>
          <p style="color: #E2F4D5; margin: 6px 0 0 0; font-size: 14px;">Receipt for Order #${order.orderNumber}</p>
        </div>
        
        <div style="padding: 24px; color: #14304A;">
          <p>Dear ${customer.name},</p>
          <p>We have successfully received your payment of <strong style="color: #559620; font-size: 18px;">₹${Number(payment.amount).toFixed(2)}</strong>.</p>
          
          <div style="background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #14304A; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">Transaction Details</h3>
            <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #6B7280;">Order Number:</td>
                <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #14304A;">${order.orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6B7280;">Payment ID:</td>
                <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #14304A;">${payment.razorpayPaymentId || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6B7280;">Razorpay Order ID:</td>
                <td style="padding: 6px 0; text-align: right; font-family: monospace; color: #14304A;">${payment.razorpayOrderId || "N/A"}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6B7280;">Payment Method:</td>
                <td style="padding: 6px 0; text-align: right; color: #14304A;">${payment.paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6B7280;">Status:</td>
                <td style="padding: 6px 0; text-align: right; color: #559620; font-weight: bold;">SUCCESS</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #6B7280;">Date & Time:</td>
                <td style="padding: 6px 0; text-align: right; color: #14304A;">${new Date(payment.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
              </tr>
            </table>
          </div>

          <p style="font-size: 14px; color: #4B5563;">
            Your order is now confirmed and our fulfillment team is preparing your medications with cold-chain safeguards where applicable.
          </p>

          <p style="font-size: 13px; color: #6B7280; text-align: center; margin-top: 24px;">
            Questions about this receipt? Contact <a href="mailto:billing@genekonpharma.com" style="color: #559620;">billing@genekonpharma.com</a>
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(customer.email, `Payment Receipt - ₹${Number(payment.amount).toFixed(2)} | Order #${order.orderNumber}`, html);
  },

  /**
   * 3. Order Shipped Notification Email
   */
  async sendOrderShippedEmail(
    order: Order,
    shippingDetails: { courierName?: string; trackingNumber?: string; estimatedDelivery?: string },
    customer: CustomerInfo
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFCFA; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #14304A; padding: 24px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">Your Order is On Its Way! 🚀</h1>
          <p style="color: #A3E635; margin: 6px 0 0 0; font-size: 14px;">Order #${order.orderNumber}</p>
        </div>
        
        <div style="padding: 24px; color: #14304A;">
          <p>Dear ${customer.name},</p>
          <p>Good news! Your Genekon Pharmacy order has been packed and dispatched.</p>
          
          <div style="background-color: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 6px; padding: 16px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #14304A;">Shipping & Tracking Information</h4>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Courier Partner:</strong> ${shippingDetails.courierName || "Express Pharmacy Logistics"}</p>
            <p style="margin: 6px 0; font-size: 14px;"><strong>Tracking Number:</strong> ${shippingDetails.trackingNumber || "Assigned upon handover"}</p>
            ${shippingDetails.estimatedDelivery ? `<p style="margin: 6px 0; font-size: 14px;"><strong>Estimated Delivery:</strong> ${shippingDetails.estimatedDelivery}</p>` : ""}
          </div>

          <p style="font-size: 14px; color: #4B5563;">
            Temperature-sensitive formulations are dispatched in insulated thermal packaging to maintain efficacy.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(customer.email, `Order #${order.orderNumber} Has Shipped! | Genekon Pharmacy`, html);
  },

  /**
   * 4. Order Delivered Notification Email
   */
  async sendOrderDeliveredEmail(
    order: Order,
    customer: CustomerInfo
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFCFA; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #559620; padding: 24px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">Order Delivered! 📦</h1>
          <p style="color: #FFFFFF; margin: 6px 0 0 0; font-size: 14px;">Thank you for trusting Genekon Pharmacy</p>
        </div>
        
        <div style="padding: 24px; color: #14304A;">
          <p>Dear ${customer.name},</p>
          <p>Your order <strong>#${order.orderNumber}</strong> has been successfully delivered.</p>
          <p style="font-size: 14px; color: #4B5563;">
            Please inspect the medications upon arrival and ensure seals are intact. Store medicines according to the temperature instructions on the packaging.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${env.FRONTEND_URL}/orders/${order.id}" style="background-color: #14304A; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px;">View Order Details</a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail(customer.email, `Order #${order.orderNumber} Delivered Successfully | Genekon Pharmacy`, html);
  },

  /**
   * 5. Payment Failed Notification Email
   */
  async sendPaymentFailedEmail(
    order: Order,
    customer: CustomerInfo,
    retryUrl?: string
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFCFA; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #DC2626; padding: 24px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">Payment Attempt Unsuccessful</h1>
          <p style="color: #FEE2E2; margin: 6px 0 0 0; font-size: 14px;">Order #${order.orderNumber}</p>
        </div>
        
        <div style="padding: 24px; color: #14304A;">
          <p>Dear ${customer.name},</p>
          <p>We were unable to process your payment for order <strong>#${order.orderNumber}</strong> (Amount: ₹${Number(order.totalAmount).toFixed(2)}).</p>
          <p style="font-size: 14px; color: #4B5563;">
            Don't worry—your order has not been cancelled. You can retry the payment using UPI, Credit/Debit Card, or Netbanking.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${retryUrl || `${env.FRONTEND_URL}/checkout/retry/${order.id}`}" style="background-color: #14304A; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px;">Retry Payment Now</a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail(customer.email, `Payment Unsuccessful for Order #${order.orderNumber} | Genekon Pharmacy`, html);
  },

  /**
   * 6. Order Cancellation Request Received Email
   */
  async sendCancellationRequestReceivedEmail(
    order: Order,
    reason: string,
    customer: CustomerInfo
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFCFA; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #14304A; padding: 24px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">Cancellation Request Received</h1>
          <p style="color: #93C5FD; margin: 6px 0 0 0; font-size: 14px;">Order #${order.orderNumber}</p>
        </div>
        
        <div style="padding: 24px; color: #14304A;">
          <p>Dear ${customer.name},</p>
          <p>We have received your cancellation request for order <strong>#${order.orderNumber}</strong>.</p>
          <div style="background: #F3F4F6; border-left: 4px solid #F59E0B; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 13px; color: #1F2937;"><strong>Reason stated:</strong> ${reason}</p>
          </div>
          <p style="font-size: 14px; color: #4B5563;">
            Our dispensary administration team is currently reviewing your request in accordance with Schedule H compliance. You will receive an update once the review is finalized.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${env.FRONTEND_URL}/account/orders/${order.id}" style="background-color: #559620; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px;">View Request Status</a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail(customer.email, `Cancellation Request for Order #${order.orderNumber} | Genekon Pharmacy`, html);
  },

  /**
   * 7. Order Cancellation Approved Email
   */
  async sendCancellationApprovedEmail(
    order: Order,
    customer: CustomerInfo,
    refundInfo?: string
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFCFA; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #559620; padding: 24px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">Order Cancellation Approved</h1>
          <p style="color: #D1FAE5; margin: 6px 0 0 0; font-size: 14px;">Order #${order.orderNumber}</p>
        </div>
        
        <div style="padding: 24px; color: #14304A;">
          <p>Dear ${customer.name},</p>
          <p>Your cancellation request for order <strong>#${order.orderNumber}</strong> has been <strong>approved</strong> by our dispensary administration.</p>
          <p style="font-size: 14px; color: #4B5563;">
            The order is now cancelled and stock has been returned to dispensary inventory.
          </p>
          ${
            refundInfo
              ? `<div style="background: #ECFDF5; border: 1px solid #A7F3D0; padding: 14px; border-radius: 6px; margin: 16px 0; color: #065F46; font-size: 14px;">
                  <strong>Refund Status:</strong> ${refundInfo}
                </div>`
              : ""
          }
          <p style="font-size: 13px; color: #6B7280; margin-top: 16px;">
            Thank you for choosing Genekon Central Pharmacy. If you have any further questions, please contact our clinical support team.
          </p>
        </div>
      </div>
    `;

    return this.sendEmail(customer.email, `Order #${order.orderNumber} Cancelled & Refund Update | Genekon Pharmacy`, html);
  },

  /**
   * 8. Order Cancellation Rejected Email
   */
  async sendCancellationRejectedEmail(
    order: Order,
    customer: CustomerInfo,
    adminComment?: string
  ): Promise<boolean> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAFCFA; border: 1px solid #E5E7EB; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #14304A; padding: 24px; text-align: center;">
          <h1 style="color: #FFFFFF; margin: 0; font-size: 24px;">Cancellation Request Update</h1>
          <p style="color: #FCA5A5; margin: 6px 0 0 0; font-size: 14px;">Order #${order.orderNumber}</p>
        </div>
        
        <div style="padding: 24px; color: #14304A;">
          <p>Dear ${customer.name},</p>
          <p>Your cancellation request for order <strong>#${order.orderNumber}</strong> could not be approved at this time.</p>
          ${
            adminComment
              ? `<div style="background: #FEF2F2; border-left: 4px solid #EF4444; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
                  <p style="margin: 0; font-size: 13px; color: #991B1B;"><strong>Dispensary note:</strong> ${adminComment}</p>
                </div>`
              : ""
          }
          <p style="font-size: 14px; color: #4B5563;">
            Your order remains active and is progressing through clinical verification and dispatch.
          </p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${env.FRONTEND_URL}/account/orders/${order.id}" style="background-color: #14304A; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px;">Track Order</a>
          </div>
        </div>
      </div>
    `;

    return this.sendEmail(customer.email, `Update on Cancellation Request #${order.orderNumber} | Genekon Pharmacy`, html);
  },
};
