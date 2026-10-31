// Vercel Serverless Function: Create Transaction for Iranian Payment Gateways (Aqaye Pardakht / ZarinPal)
// Iranian Veterinary Plumb's (LibDose) Commercial API Engine

module.exports = async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', message: 'Method Not Allowed' });
  }

  try {
    const { planId, amount, mobile, name, invoiceId, couponCode } = req.body || {};

    if (!amount || amount < 1000) {
      return res.status(400).json({ status: 'error', message: 'مبلغ تراکنش نامعتبر است.' });
    }

    const merchantPin = process.env.AQAYEPARDAKHT_PIN || process.env.MERCHANT_PIN;
    const siteUrl = process.env.SITE_URL || (req.headers.origin || 'https://vetdose-self.vercel.app');
    const callbackUrl = `${siteUrl}/api/pay-verify`;

    // 1. اگر مرچنت‌پین تعریف شده باشد، اتصال مستقیم به درگاه واقعی آقای پرداخت
    if (merchantPin && merchantPin !== 'SANDBOX') {
      const payload = {
        pin: merchantPin,
        amount: Math.round(amount),
        callback: callbackUrl,
        invoice_id: invoiceId || `LIB-${Date.now()}`,
        mobile: mobile || '09120000000',
        description: `خرید اشتراک بالینی لیب‌دوز - پلن ${planId || 'VIP'} (${name || 'همکار دامپزشک'})`
      };

      const gatewayResponse = await fetch('https://panel.aqayepardakht.ir/api/v2/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await gatewayResponse.json();

      if (data && data.status === 'success' && data.transid) {
        return res.status(200).json({
          status: 'success',
          transid: data.transid,
          gatewayUrl: `https://panel.aqayepardakht.ir/startpay/${data.transid}`,
          isLive: true
        });
      } else {
        return res.status(400).json({
          status: 'error',
          message: data.message || 'خطا در برقراری ارتباط با شاپرک',
          code: data.code
        });
      }
    }

    // 2. حالت شبیه‌ساز امن (Sandbox Demo Engine) در صورت عدم تنظیم مرچنت پین
    const simulatedTransId = `AP-DEMO-${Date.now()}-${Math.floor(Math.random() * 89999 + 10000)}`;
    const redirectUrl = `${siteUrl}/?payment_status=success&transid=${simulatedTransId}&plan=${encodeURIComponent(planId || '1_year_vip')}&amount=${amount}`;

    return res.status(200).json({
      status: 'success',
      transid: simulatedTransId,
      gatewayUrl: redirectUrl,
      isLive: false,
      isDemo: true,
      message: 'حالت آزمایشی فعال است؛ تراکنش با موفقیت ایجاد گردید.'
    });

  } catch (error) {
    console.error('Payment create error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'خطای سیستمی در پردازش تراکنش بانکی: ' + error.message
    });
  }
};
