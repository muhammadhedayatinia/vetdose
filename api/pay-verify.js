// Vercel Serverless Function: Verify Transaction from Bank Callback (Aqaye Pardakht / Shaparak)
// Iranian Veterinary Plumb's (LibDose) Commercial API Engine

module.exports = async function handler(req, res) {
  try {
    const siteUrl = process.env.SITE_URL || 'https://vetdose-self.vercel.app';
    
    // پارامترهای دریافتی از درگاه بانک (از طریق GET یا POST)
    const params = req.method === 'POST' ? req.body : req.query;
    const { transid, status, tracking_number, code } = params || {};

    if (!transid) {
      return res.redirect(302, `${siteUrl}/?payment_status=failed&reason=missing_transid`);
    }

    // اگر تراکنش توسط کاربر لغو شده باشد
    if (status === '0' || status === 0 || code === '0') {
      return res.redirect(302, `${siteUrl}/?payment_status=cancelled&transid=${transid}`);
    }

    const merchantPin = process.env.AQAYEPARDAKHT_PIN || process.env.MERCHANT_PIN;

    // 1. اگر درگاه زنده با مرچنت‌پین باشد، ارسال به API وریفای شاپرک
    if (merchantPin && merchantPin !== 'SANDBOX') {
      const verifyResponse = await fetch('https://panel.aqayepardakht.ir/api/v2/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: merchantPin,
          transid: transid
        })
      });

      const verifyData = await verifyResponse.json();

      // وضعیت ۱ یا status=success به معنی موفقیت تایید است
      // وضعیت -۱ به معنی قبلاً وریفای شده (idempotent)
      if (verifyData.status === 'success' || verifyData.code === '1' || verifyData.code === '-1') {
        const tracking = tracking_number || verifyData.tracking_number || transid;
        return res.redirect(302, `${siteUrl}/?payment_status=success&transid=${transid}&tracking=${tracking}`);
      } else {
        return res.redirect(302, `${siteUrl}/?payment_status=failed&transid=${transid}&code=${verifyData.code}`);
      }
    }

    // 2. در حالت آزمایشی یا دمو، تراکنش معتبر تلقی شده و به صفحه اصلی هدایت می‌شود
    return res.redirect(302, `${siteUrl}/?payment_status=success&transid=${transid}&tracking=${tracking_number || 'DEMO-OK'}`);

  } catch (error) {
    console.error('Payment verify error:', error);
    const siteUrl = process.env.SITE_URL || 'https://vetdose-self.vercel.app';
    return res.redirect(302, `${siteUrl}/?payment_status=error&msg=${encodeURIComponent(error.message)}`);
  }
};
