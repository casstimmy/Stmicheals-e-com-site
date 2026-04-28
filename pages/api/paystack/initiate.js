// pages/api/initiate-paystack.js

import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email, amount, customer, cartProducts, orderId } = req.body;

  if (!email || !amount || !customer || !Array.isArray(cartProducts)) {
  return res.status(400).json({ error: "Missing required fields" });
}

  try {
    const paystackRes = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount,
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/order-confirmation/${orderId}`,
        metadata: {
          customer,
          cartProducts,
          orderId,
          custom_fields: [
            {
              display_name: 'Customer Name',
              variable_name: 'customer_name',
              value: customer.name,
            },
            {
              display_name: 'Customer Phone',
              variable_name: 'customer_phone',
              value: customer.phone,
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const { authorization_url: authorizationUrl } = paystackRes.data.data;

    res.status(200).json({ authorizationUrl });
  } catch (error) {
    console.error('Paystack Init Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to initiate Paystack payment.' });
  }
}
