import crypto from 'crypto';

const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY || '';
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY || '';
const MIDTRANS_API_URL = process.env.MIDTRANS_API_URL || 'https://api.sandbox.midtrans.com';

interface MidtransItem {
  id: string;
  price: number;
  quantity: number;
  name: string;
}

interface MidtransCustomer {
  first_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

interface MidtransTransaction {
  transaction_details: { order_id: string; gross_amount: number };
  item_details: MidtransItem[];
  customer_details: MidtransCustomer;
  callbacks?: { finish?: string };
}

export function generateVAName(orderId: string, vaName?: string): string {
  return vaName || `MARKETPLACE-${orderId}`;
}

export async function createPaymentLink(orderId: string, amount: number, items: MidtransItem[], customer: MidtransCustomer): Promise<{ token: string; redirect_url: string }> {
  const transaction: MidtransTransaction = {
    transaction_details: { order_id: orderId, gross_amount: amount },
    item_details: items,
    customer_details: customer,
    callbacks: { finish: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${orderId}` },
  };

  const response = await fetch(`${MIDTRANS_API_URL}/v1/payment-links`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64')}`,
    },
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    const error = await response.json() as any;
    throw new Error(error.message || 'Payment creation failed');
  }

  return response.json() as Promise<{ token: string; redirect_url: string }>;
}

export async function createSnapTransaction(orderId: string, amount: number, items: MidtransItem[], customer: MidtransCustomer): Promise<{ token: string; redirect_url: string }> {
  const transaction = {
    transaction_details: { order_id: orderId, gross_amount: amount },
    item_details: items,
    customer_details: customer,
  };

  const response = await fetch(`${MIDTRANS_API_URL}/v2/snap/transaction`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${MIDTRANS_SERVER_KEY}:`).toString('base64')}`,
    },
    body: JSON.stringify(transaction),
  });

  if (!response.ok) {
    const error = await response.json() as any;
    throw new Error(error.message || 'Payment creation failed');
  }

  return response.json() as Promise<{ token: string; redirect_url: string }>;
}

export function verifyNotification(notification: any): boolean {
  const orderId = notification.order_id;
  const statusCode = notification.status_code;
  const grossAmount = notification.gross_amount;
  const serverKey = MIDTRANS_SERVER_KEY;

  const signatureKey = `${orderId}${statusCode}${grossAmount}${serverKey}`;
  const signature = crypto.createHash('sha512').update(signatureKey).digest('hex');

  return signature === notification.signature_key;
}

export function getPaymentStatus(notification: any): string {
  const statusMap: Record<string, string> = {
    capture: 'PAID',
    settlement: 'PAID',
    pending: 'PENDING',
    deny: 'FAILED',
    cancel: 'CANCELLED',
    expire: 'EXPIRED',
    failure: 'FAILED',
  };
  return statusMap[notification.transaction_status] || 'PENDING';
}
