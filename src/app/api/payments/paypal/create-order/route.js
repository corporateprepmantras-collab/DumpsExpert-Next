import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

export async function POST(request) {
  try {
    console.log("Route hit: /api/payments/paypal/create-order");
    const { amount, currency, userId } = await request.json();

    // Check PayPal credentials
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('PayPal credentials not configured');
      return NextResponse.json(
        { 
          success: false, 
          error: 'PayPal payment is not configured. Please contact support.' 
        }, 
        { status: 503 }
      );
    }

    // Input validation
    if (!amount || amount <= 0) {
      console.error('Invalid or missing amount:', { amount });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid or missing amount. Must be a number greater than 0.' 
        }, 
        { status: 400 }
      );
    }

    if (!currency) {
      console.error('Missing currency:', { currency });
      return NextResponse.json(
        { success: false, error: 'Missing currency' }, 
        { status: 400 }
      );
    }

    // Initialize PayPal client after credential validation
    const environment = new paypal.core.SandboxEnvironment(clientId, clientSecret);
    const client = new paypal.core.PayPalHttpClient(environment);

    const paypalRequest = new paypal.orders.OrdersCreateRequest();
    paypalRequest.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: currency || 'USD',
            value: amount.toString()
          }
        }
      ]
    });

    const order = await client.execute(paypalRequest);
    
    console.log("PayPal order created successfully:", {
      orderId: order.result.id,
      amount,
      currency,
      userId
    });

    return NextResponse.json({
      success: true,
      orderId: order.result.id
    });
  } catch (error) {
    console.error('[PAYPAL_ORDER_ERROR]', {
      error: error.message,
      stack: error.stack,
    });
    return NextResponse.json(
      { success: false, error: `Unable to create order: ${error.message}` }, 
      { status: 500 }
    );
  }
}