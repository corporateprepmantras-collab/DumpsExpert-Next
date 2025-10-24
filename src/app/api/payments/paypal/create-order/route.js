import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret); // Use LiveEnvironment for production
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(request) {
  try {
    const { amount, currency } = await request.json();

    if (!amount || !currency) {
      console.error('Missing required fields:', { amount, currency });
      return NextResponse.json({ error: 'Missing required order details' }, { status: 400 });
    }

    const paypalRequest = new paypal.orders.OrdersCreateRequest();
    paypalRequest.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency || 'INR',
            value: amount.toString()
          }
        }
      ]
    });

    const order = await client.execute(paypalRequest);
    return NextResponse.json({
      success: true,
      orderId: order.result.id
    });
  } catch (error) {
    console.error('PayPal order creation failed:', error);
    return NextResponse.json({ error: 'Payment initiation failed' }, { status: 500 });
  }
}