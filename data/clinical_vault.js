/**
 * پایگاه دانش جامع و سامانه تصمیم‌یار بالینی وت‌دوز
 * VetDose Clinical Decision & Diagnostic Vault
 * 
 * استانداردهای بالینی فارماکوپه و مراجع جامع دارویی دامپزشکی
 */

// =====================================================================
// ۱. مقادیر مرجع آزمایشگاهی و پارامترهای نرمال خون (Lab Reference Intervals)
// =====================================================================
const LAB_REFERENCE_INTERVALS = {
  canine: {
    speciesFa: 'سگ (Canine)',
    icon: '🐶',
    cbc: [
      { param: 'RBC (تعداد گلبول قرمز)', range: '5.5 - 8.5', unit: 'M/uL', note: 'کمتر از ۵.۵ نشان‌دهنده آنمی است' },
      { param: 'HGB (هموگلوبین)', range: '12.0 - 18.0', unit: 'g/dL', note: 'نشان‌دهنده ظرفیت حمل اکسیژن' },
      { param: 'PCV / HCT (هماتوکریت)', range: '37 - 55', unit: '%', note: 'زیر ۳۰ آنمی بالینی، بالای ۵۵ اریتروسیتوز/دهیدراتاسیون' },
      { param: 'WBC (کل گلبول‌های سفید)', range: '6,000 - 17,000', unit: '/uL', note: 'بالای ۱۷ هزار لکوسیتوز التهابی/عفونی' },
      { param: 'Neutrophils (نوتروفیل بند/سگمانته)', range: '3,000 - 11,500', unit: '/uL', note: 'خط قرمز ایمنی شیمی‌درمانی بالای ۳۰۰۰' },
      { param: 'Lymphocytes (لنوسیت‌ها)', range: '1,000 - 4,800', unit: '/uL', note: 'کاهش در استرس حاد کورتیکواستروئیدی' },
      { param: 'Platelets (پلاکت‌ها)', range: '200,000 - 500,000', unit: '/uL', note: 'زیر ۵۰ هزار خطر خونریزی خودبه‌خودی' }
    ],
    biochem: [
      { param: 'BUN (نیتروژن اوره خون)', range: '7 - 27', unit: 'mg/dL', note: 'افزایش در ازوتمی پره‌رنال، رنال و پست‌رنال' },
      { param: 'Creatinine (کراتینین)', range: '0.5 - 1.4', unit: 'mg/dL', note: 'شاخص مرحله‌بندی IRIS کلیه (بالای ۱.۴ غیرطبیعی)' },
      { param: 'ALT (آلانین آمینوترانسفراز)', range: '10 - 100', unit: 'U/L', note: 'شاخص آسیب سلولی حاد کبد سگ' },
      { param: 'ALKP (آلکالین فسفاتاز)', range: '23 - 212', unit: 'U/L', note: 'کولستاز کبدی و القای کورتیکواستروئید در سگ' },
      { param: 'Total Protein (پروتئین کل)', range: '5.2 - 8.2', unit: 'g/dL', note: 'کاهش در خونریزی و بیماری‌های از دست‌دهنده پروتئین' },
      { param: 'Albumin (آلبومین)', range: '2.3 - 4.0', unit: 'g/dL', note: 'زیر ۲.۰ خطر آسیت و ادم محیطی' },
      { param: 'Blood Glucose (گلوکز)', range: '70 - 110', unit: 'mg/dL', note: 'زیر ۵۰ هایپوگلیسمی کشنده (تشنج)' },
      { param: 'Calcium (کلسیم تام)', range: '9.0 - 11.5', unit: 'mg/dL', note: 'افزایش در بدخیمی‌ها (لنفوم و آدنوکارسینوم کیسه مقعدی)' },
      { param: 'Phosphorus (فسفر)', range: '2.5 - 6.0', unit: 'mg/dL', note: 'در نارسایی مزمن کلیه (CKD) افزایش می‌یابد' },
      { param: 'Sodium (سدیم)', range: '144 - 160', unit: 'mEq/L', note: 'حداکثر سرعت تصحیح هایپوناترمی 0.5 mEq/L/hr' },
      { param: 'Potassium (پتاسیم)', range: '3.5 - 5.5', unit: 'mEq/L', note: 'بالای ۶.۵ خطر ایست قلبی و فلوتر بطنی' }
    ],
    bloodGas: [
      { param: 'pH خون شریانی', range: '7.35 - 7.45', unit: '', note: 'زیر ۷.۲۰ اسیدوز شدید' },
      { param: 'PaCO2 (دی‌اکسید کربن شریانی)', range: '35 - 45', unit: 'mmHg', note: 'بالای ۵۰ هیپوونتیلاسیون در بیهوشی' },
      { param: 'PaO2 (اکسیژن شریانی با FiO2 100%)', range: '400 - 500', unit: 'mmHg', note: 'با هوای اتاق بالای ۸۵ mmHg' },
      { param: 'HCO3 (بی‌کربنات پلاسما)', range: '18 - 24', unit: 'mEq/L', note: 'شاخص متابولیک تعادل اسید و باز' }
    ]
  },

  feline: {
    speciesFa: 'گربه (Feline)',
    icon: '🐱',
    cbc: [
      { param: 'RBC (تعداد گلبول قرمز)', range: '5.0 - 10.0', unit: 'M/uL', note: 'گلبول‌های قرمز گربه کوچکتر از سگ هستند' },
      { param: 'HGB (هموگلوبین)', range: '8.0 - 15.0', unit: 'g/dL', note: 'حساسیت بالا به تشکیل Heinz Bodies در سمیت‌ها' },
      { param: 'PCV / HCT (هماتوکریت)', range: '24 - 45', unit: '%', note: 'زیر ۲۰ نیاز به پایش شدید ترانسفیوژن' },
      { param: 'WBC (کل گلبول‌های سفید)', range: '5,500 - 19,500', unit: '/uL', note: 'پاسخ لکوسیتی استرس در گربه بسیار بارز است' },
      { param: 'Neutrophils (نوتروفیل‌ها)', range: '2,500 - 12,500', unit: '/uL', note: 'گیت‌وی ایمنی شیمی‌درمانی بالای ۲۵۰۰' },
      { param: 'Lymphocytes (لنفوسیت‌ها)', range: '1,500 - 7,000', unit: '/uL', note: 'افزایش در لکوسیتوز هیجانی اپی‌نفرینی' },
      { param: 'Platelets (پلاکت‌ها)', range: '150,000 - 600,000', unit: '/uL', note: 'تجمع پلاکتی کاذب (Clumping) در گربه بسیار شایع است' }
    ],
    biochem: [
      { param: 'BUN (نیتروژن اوره خون)', range: '16 - 36', unit: 'mg/dL', note: 'به شدت وابسته به پروتئین جیره غذایی گوشتخوار اجباری' },
      { param: 'Creatinine (کراتینین)', range: '0.8 - 1.6', unit: 'mg/dL', note: 'مرحله ۱ IRIS گربه زیر ۱.۶ است' },
      { param: 'ALT (آلانین آمینوترانسفراز)', range: '12 - 130', unit: 'U/L', note: 'نیمه‌عمر ALT در گربه بسیار کوتاه‌تر از سگ است' },
      { param: 'ALKP (آلکالین فسفاتاز)', range: '14 - 111', unit: 'U/L', note: 'افزایش حتی جزئی ALKP در گربه ارزش بالینی بالای هپاتوپاتی دارد' },
      { param: 'Total Protein (پروتئین کل)', range: '5.7 - 8.9', unit: 'g/dL', note: 'افزایش بالای ۹ در FIP (عفونت پریتونیت عفونی)' },
      { param: 'Albumin (آلبومین)', range: '2.1 - 3.8', unit: 'g/dL', note: 'نسبت A:G زیر ۰.۴ مشکوک قوی به FIP' },
      { param: 'Blood Glucose (گلوکز)', range: '75 - 140', unit: 'mg/dL', note: 'هایپرگلیسمی استرس در گربه تا ۳۰۰ میلی‌گرم دیده می‌شود' },
      { param: 'Total Bilirubin (بیلی‌روبین)', range: '0.1 - 0.4', unit: 'mg/dL', note: 'ایکتر در گربه شاخص لیپیدوز کبدی، کولانژیت یا همولیز' },
      { param: 'Potassium (پتاسیم)', range: '3.5 - 5.0', unit: 'mEq/L', note: 'هایپوکالمی در گربه باعث ضعف شدید عضلانی و ونتورفلکسی گردن می‌شود' }
    ],
    bloodGas: [
      { param: 'pH خون شریانی', range: '7.25 - 7.40', unit: '', note: 'گربه تمایل به اسیدیته کمی بیشتر از سگ دارد' },
      { param: 'PaCO2 (دی‌اکسید کربن شریانی)', range: '30 - 35', unit: 'mmHg', note: 'تنفس سریع استرس باعث آلکالوز تنفسی می‌شود' },
      { param: 'HCO3 (بی‌کربنات)', range: '17 - 22', unit: 'mEq/L', note: 'ارزیابی اسیدوز کلیوی یا کتواسیدوز دیابتی' }
    ]
  },

  equine: {
    speciesFa: 'اسب (Equine)',
    icon: '🐎',
    cbc: [
      { param: 'RBC (تعداد گلبول قرمز)', range: '6.8 - 12.9', unit: 'M/uL', note: 'طحال اسب مخزن ذخیره عظیم RBC در استرس و دویدن است' },
      { param: 'PCV / HCT (هماتوکریت)', range: '32 - 53', unit: '%', note: 'در کولیک حاد، افزایش بالای ۵۰ نشان‌دهنده هموکانسنتراسیون خطرناک است' },
      { param: 'WBC (کل گلبول‌های سفید)', range: '5,400 - 14,300', unit: '/uL', note: 'لوکوپنی زیر ۵۰۰۰ علامت سپتی‌سمی، اندوتوکسمی و پرتونیت' },
      { param: 'Fibrinogen (فیبرینوژن پلاسما)', range: '200 - 400', unit: 'mg/dL', note: 'مهم‌ترین پروتئین فاز حاد التهاب در اسب (حساس‌تر از WBC)' }
    ],
    biochem: [
      { param: 'BUN (اوره)', range: '10 - 24', unit: 'mg/dL', note: 'ارزیابی هیدراتاسیون و فانکشن کلیه' },
      { param: 'Creatinine (کراتینین)', range: '1.0 - 2.0', unit: 'mg/dL', note: 'کراتینین بالای ۳.۰ در کولیک نیازمند مایع‌درمانی تهاجمی' },
      { param: 'Lactate (لاکتات خون)', range: '0.5 - 2.0', unit: 'mmol/L', note: 'لاکتات بالای ۴ در کولیک اسب شاخص پیش‌آگهی ایسکمی روده' },
      { param: 'GGT (گاما گلوتامیل ترانسفراز)', range: '5 - 24', unit: 'U/L', note: 'شاخص طلایی بیماری‌های کبدی-صفراوی اسب' },
      { param: 'SDH (سوربیتول دهیدروژناز)', range: '1 - 6', unit: 'U/L', note: 'شاخص نکروز حاد سلول‌های کبدی اسب' }
    ],
    bloodGas: [
      { param: 'pH شریانی', range: '7.38 - 7.46', unit: '', note: 'اسیدوز در شوک اندوتوکسیک و کلاپس کولیک' },
      { param: 'PaO2 در بیهوشی استنشاقی', range: '100 - 350', unit: 'mmHg', note: 'هیپوکسمی ناشی از شانت و وزن احشا روی ریه بسیار شایع است' }
    ]
  },

  bovine: {
    speciesFa: 'گاو و گوساله (Bovine)',
    icon: '🐄',
    cbc: [
      { param: 'RBC (تعداد گلبول قرمز)', range: '5.0 - 10.0', unit: 'M/uL', note: 'آنمی در بابزیوز، آناپلاسموز و فاسیولیازیس' },
      { param: 'PCV / HCT (هماتوکریت)', range: '24 - 36', unit: '%', note: 'زیر ۱۸ نیاز به خون کامل در بابزیوز حاد' },
      { param: 'WBC (کل گلبول‌های سفید)', range: '4,000 - 12,000', unit: '/uL', note: 'در گاو نسبت لنفوسیت به نوتروفیل ۲ به ۱ است' },
      { param: 'Fibrinogen (فیبرینوژن)', range: '200 - 700', unit: 'mg/dL', note: 'بالای ۱۰۰۰ شاخص پریتونیت و تروماتیک رتیکولوپریتونیت (TRP)' }
    ],
    biochem: [
      { param: 'Calcium (کلسیم سرم)', range: '8.5 - 10.5', unit: 'mg/dL', note: 'زیر ۶.۰ در تب شیر (Milk Fever / Hypocalcemia)' },
      { param: 'Phosphorus (فسفر)', range: '4.5 - 7.5', unit: 'mg/dL', note: 'هموگلوبینوری پس از زایمان در هیپوفسفاتمی' },
      { param: 'Magnesium (منیزیم)', range: '1.8 - 3.0', unit: 'mg/dL', note: 'زیر ۱.۲ کزاز علفی (Grass Tetany) با علائم هایپراکسیتیبیلیتی' },
      { param: 'BHB (بتا-هیدروکسی بوتیرات)', range: '< 1.2', unit: 'mmol/L', note: 'بالای ۱.۴ نشان‌دهنده کتوز بالینی یا تحت‌بالینی گاو شیری' },
      { param: 'NEFA (اسیدهای چرب غیر استریفه)', range: '< 0.4', unit: 'mEq/L', note: 'شاخص تعادل منفی انرژی پیش از زایش' }
    ],
    bloodGas: [
      { param: 'pH ورید و شریان', range: '7.35 - 7.45', unit: '', note: 'اسیدوز شدید در اسهال گوساله ناشی از از دست رفتن بیکربنات' },
      { param: 'HCO3 (بی‌کربنات)', range: '20 - 30', unit: 'mEq/L', note: 'در اسهال گوساله ممکن است به زیر ۱۰ سقوط کند' }
    ]
  },

  ovine: {
    speciesFa: 'گوسفند (Ovine)',
    icon: '🐑',
    cbc: [
      { param: 'PCV / HCT (هماتوکریت)', range: '27 - 45', unit: '%', note: 'زیر ۲۰ آنمی شدید؛ پایش بار انگل همونکوس با کارت فاماچا (FAMACHA)' },
      { param: 'RBC (تعداد گلبول‌های قرمز)', range: '9.0 - 15.0', unit: 'M/uL', note: 'گلبول‌های کوچک میکروستیک؛ آنمی همولیتیک در مسمومیت با مس و آناپلاسموز' },
      { param: 'HGB (هموگلوبین)', range: '9.0 - 15.0', unit: 'g/dL', note: 'کاهش ظرفیت اکسیژن‌رسانی در پنومونی‌های باکتریایی و پاستورلوز' },
      { param: 'WBC (کل گلبول‌های سفید)', range: '4,000 - 12,000', unit: '/uL', note: 'نسبت لنفوسیت به نوتروفیل معمولاً ۲ به ۱ است' },
      { param: 'Neutrophils (نوتروفیل‌ها)', range: '1,000 - 5,000', unit: '/uL', note: 'انحراف به چپ نشان‌دهنده سپسیس، آنتروتوکسمی یا ماستیت قانقریایی' },
      { param: 'Lymphocytes (لنفوسیت‌ها)', range: '2,000 - 9,000', unit: '/uL', note: 'جمعیت اصلی لوکوسیت‌های خون محیطی گوسفند' },
      { param: 'Platelets (پلاکت‌ها)', range: '250,000 - 750,000', unit: '/uL', note: 'ترومبوسیتوپنی در کواگولوپاتی مصرفی (DIC)' },
      { param: 'Fibrinogen (فیبرینوژن)', range: '100 - 500', unit: 'mg/dL', note: 'بالای ۶۰۰ شاخص حساس التهاب فعال، پنومونی یا لنفادنیت کازئوس (CLA)' }
    ],
    biochem: [
      { param: 'Total Protein (پروتئین تام)', range: '6.0 - 7.9', unit: 'g/dL', note: 'کاهش در هایپوپروتئینمی ناشی از همونکوزیس یا اسهال نوزادان' },
      { param: 'Albumin (آلبومین)', range: '2.4 - 3.8', unit: 'g/dL', note: 'زیر ۲.۰ همراه با ادم زیرفکی (Bottle Jaw) در آلودگی شدید انگلی' },
      { param: 'BUN (نیتروژن اوره خون)', range: '8 - 28', unit: 'mg/dL', note: 'افزایش در آزوتمی کم‌آبی یا انسداد ادراری ناشی از سنگ‌های مجاری ادرار' },
      { param: 'Creatinine (کراتینین)', range: '1.2 - 1.9', unit: 'mg/dL', note: 'شاخص دقیق فیلتراسیون گلومرولی' },
      { param: 'Calcium (کلسیم سرم)', range: '8.5 - 12.5', unit: 'mg/dL', note: 'افت شدید در هیپوکلسمی میش‌های آبستن سنگین (تب شیر آبستنی)' },
      { param: 'Phosphorus (فسفر)', range: '4.5 - 8.0', unit: 'mg/dL', note: 'حفظ نسبت کلسیم به فسفر ۲ به ۱ جهت پیشگیری از سنگ ادراری در قوچ‌ها' },
      { param: 'Magnesium (منیزیم)', range: '2.2 - 3.2', unit: 'mg/dL', note: 'افت زیر ۱.۴ در کزاز علفی میش‌ها با علائم هایپراکسیتیبیلیتی' },
      { param: 'Blood Glucose (گلوکز)', range: '50 - 80', unit: 'mg/dL', note: 'قند فیزیولوژیک نشخوارکنندگان کمتر از سگ و گربه است' },
      { param: 'BHB (بتا-هیدروکسی بوتیرات)', range: '< 0.8', unit: 'mmol/L', note: 'بالای ۱.۶ نشان‌دهنده مسمومیت آبستنی میش‌ها (Pregnancy Toxemia / Twin Lamb Disease)' },
      { param: 'AST (آسپارتات آمینوترانسفراز)', range: '60 - 280', unit: 'U/L', note: 'صدمه عضلانی در بیماری عضله سفید (کمبود سلنیوم/ویتامین E) و آسیب کبد' },
      { param: 'GGT (گاما گلوتامیل ترانسفراز)', range: '20 - 52', unit: 'U/L', note: 'شاخص کلستاز و آسیب صفراوی در فاسیولیازیس و مسمومیت با مس' }
    ],
    bloodGas: [
      { param: 'دمای طبیعی مقعدی (Rectal Temp)', range: '38.5 - 39.5', unit: '°C', note: 'بالای ۴۰.۰ تب با منشأ عفونی یا استرس گرمایی شدید' },
      { param: 'ضربان قلب (Heart Rate)', range: '70 - 90', unit: 'bpm', note: 'در بره‌ها تا ۱۲۰ ضربان در دقیقه طبیعی است' },
      { param: 'تعداد تنفس (Respiratory Rate)', range: '12 - 20', unit: 'brpm', note: 'تا ۴۰ در استرس گرمایی و پنومونی‌های انزوتیک' },
      { param: 'pH ورید و شریان', range: '7.35 - 7.50', unit: '', note: 'اسیدوز شدید در پرخوری دان و اسیدوز لاکتیک حاد شکمبه' },
      { param: 'HCO3 (بی‌کربنات)', range: '20 - 28', unit: 'mEq/L', note: 'کاهش شدید در اسیدوز متابولیک' },
      { param: 'انقباضات شکمبه (Rumen Motility)', range: '2 - 3', unit: 'در ۲ دقیقه', note: 'سمع در فرورفتگی تهیگاه چپ؛ توقف در آتونی شکمبه و نفخ' }
    ]
  },

  caprine: {
    speciesFa: 'بز (Caprine)',
    icon: '🐐',
    cbc: [
      { param: 'PCV / HCT (هماتوکریت)', range: '22 - 38', unit: '%', note: 'کوچک‌ترین اریتروسیت‌های پستانداران (۲.۵ تا ۳.۵ میکرومتر)' },
      { param: 'RBC (تعداد گلبول‌های قرمز)', range: '8.0 - 18.0', unit: 'M/uL', note: 'شمارش بالای گلبول‌ها به دلیل اندازه بسیار ریز آن‌ها است' },
      { param: 'HGB (هموگلوبین)', range: '8.0 - 14.0', unit: 'g/dL', note: 'پایش ظرفیت اکسیژن‌گیری در بیماری‌های تنفسی' },
      { param: 'WBC (کل گلبول‌های سفید)', range: '4,000 - 13,000', unit: '/uL', note: 'پاسخ لکوسیتوزی با نوتروفیلی در انتریت و پنومونی بز' },
      { param: 'Neutrophils (نوتروفیل‌ها)', range: '1,200 - 7,200', unit: '/uL', note: 'انحراف به چپ نشان‌دهنده پنومونی شدید یا پریتونیت حاد' },
      { param: 'Lymphocytes (لنفوسیت‌ها)', range: '2,000 - 9,000', unit: '/uL', note: 'غالب‌ترین جمعیت سلول‌های ایمنی خون محیطی' },
      { param: 'Platelets (پلاکت‌ها)', range: '300,000 - 800,000', unit: '/uL', note: 'پلاکت‌های متعدد و فعال خون محیطی بز' },
      { param: 'Fibrinogen (فیبرینوژن)', range: '100 - 400', unit: 'mg/dL', note: 'بالای ۵۰۰ پروتئین فاز حاد التهاب و آبسه‌های پنیری CLA' }
    ],
    biochem: [
      { param: 'Total Protein (پروتئین تام)', range: '6.4 - 7.8', unit: 'g/dL', note: 'ارزیابی وضعیت هیدراتاسیون و کم‌آبی' },
      { param: 'Albumin (آلبومین)', range: '2.7 - 3.9', unit: 'g/dL', note: 'افت در بیماری‌های کبدی، روده‌ای و فاسیولیازیس شدید' },
      { param: 'BUN (نیتروژن اوره خون)', range: '10 - 26', unit: 'mg/dL', note: 'افزایش در آزوتمی کلیوی یا پارگی مثانه بر اثر سنگ مجرا در نرها' },
      { param: 'Creatinine (کراتینین)', range: '0.9 - 1.8', unit: 'mg/dL', note: 'شاخص اختصاصی نارسایی کلیوی' },
      { param: 'Calcium (کلسیم سرم)', range: '8.9 - 11.7', unit: 'mg/dL', note: 'پایش کلسیم پیش و پس از زایمان در بزهای پرتولید شیری' },
      { param: 'Phosphorus (فسفر)', range: '4.2 - 8.2', unit: 'mg/dL', note: 'حفظ نسبت کلسیم به فسفر ۲ به ۱ برای ممانعت از سنگ ادراری' },
      { param: 'Magnesium (منیزیم)', range: '2.0 - 3.1', unit: 'mg/dL', note: 'افت زیر ۱.۴ در کزاز علفی بزها' },
      { param: 'Blood Glucose (گلوکز)', range: '50 - 75', unit: 'mg/dL', note: 'سطح گلوکز پایه فیزیولوژیک نشخوارکنندگان' },
      { param: 'BHB (بتا-هیدروکسی بوتیرات)', range: '< 0.8', unit: 'mmol/L', note: 'بالای ۱.۶ شاخص توکسمی آبستنی بزهای چندقلوزا' },
      { param: 'AST (آسپارتات آمینوترانسفراز)', range: '65 - 280', unit: 'U/L', note: 'آسیب هپاتوسلولار یا بیماری عضله سفید ناشی از کمبود سلنیوم' },
      { param: 'GGT (گاما گلوتامیل ترانسفراز)', range: '20 - 55', unit: 'U/L', note: 'شاخص حساس بیماری‌های کلستاتیک کبد و انگل‌های کبد' }
    ],
    bloodGas: [
      { param: 'دمای طبیعی مقعدی (Rectal Temp)', range: '38.5 - 40.0', unit: '°C', note: 'دمای طبیعی بز تا ۴۰.۰ طبیعی است؛ بالای ۴۰.۵ نشانه تب است' },
      { param: 'ضربان قلب (Heart Rate)', range: '70 - 95', unit: 'bpm', note: 'در بزغاله‌ها تا ۱۴۰ ضربان در دقیقه طبیعی است' },
      { param: 'تعداد تنفس (Respiratory Rate)', range: '15 - 30', unit: 'brpm', note: 'تنفس سریع در استرس گرمایی و ذات‌الریه' },
      { param: 'pH ورید و شریان', range: '7.35 - 7.50', unit: '', note: 'اسیدوز در نفخ کف‌آلود و اسیدوز حاد شکمبه' },
      { param: 'HCO3 (بی‌کربنات)', range: '20 - 28', unit: 'mEq/L', note: 'بافر اسید و باز بدن' },
      { param: 'انقباضات شکمبه (Rumen Motility)', range: '2 - 3', unit: 'در ۲ دقیقه', note: 'سمع در تهیگاه چپ؛ توقف در نفخ و اسیدوز' }
    ]
  },

  camelids: {
    speciesFa: 'شترسانان (Camelids - شتر، لاما، آلپاکا)',
    icon: '🐪',
    cbc: [
      { param: 'RBC (گلبول قرمز بیضوی شتر)', range: '9.0 - 15.0', unit: 'M/uL', note: 'RBCهای شتر بیضوی شکل و بدون فرورفتگی مرکزی هستند' },
      { param: 'PCV / HCT (هماتوکریت شتر)', range: '27 - 38', unit: '%', note: 'شتر کم‌آبی شدید را بدون افزایش نامتعارف ویسکوزیته تحمل می‌کند' },
      { param: 'WBC (کل لکوسیت‌ها)', range: '8,000 - 22,000', unit: '/uL', note: 'دامنه نرمال سفیدهای شتر بالاتر از گاو است' },
      { param: 'Eosinophils (ائوزینوفیل‌ها)', range: '100 - 2,000', unit: '/uL', note: 'در شترسانان ائوزینوفیلی ملایم فیزیولوژیک شایع است' }
    ],
    biochem: [
      { param: 'Blood Glucose (گلوکز شتر)', range: '90 - 140', unit: 'mg/dL', note: 'گلوکز شترسانان بر خلاف نشخوارکنندگان نزدیک انسان و تک‌سمی‌هاست' },
      { param: 'BUN (اوره)', range: '10 - 30', unit: 'mg/dL', note: 'بازیافت اوره در پیش‌معده شتر بسیار بالاست' },
      { param: 'Creatinine (کراتینین)', range: '1.0 - 2.4', unit: 'mg/dL', note: 'ارزیابی آسیب حاد کلیوی و دهیدراتاسیون' },
      { param: 'Triglycerides (تری‌گلیسرید)', range: '10 - 45', unit: 'mg/dL', note: 'افزایش شدید در سندرم کشنده کبد چرب (Hepatic Lipidosis) لاما و شتر' },
      { param: 'Albumin (آلبومین)', range: '2.8 - 4.5', unit: 'g/dL', note: 'افت شدید در اولسراسیون C3 و بیماری لاغری مزمن' }
    ],
    bloodGas: [
      { param: 'pH وریدی', range: '7.32 - 7.42', unit: '', note: 'پایش در کما و اسیدوز متابولیک شتر' }
    ]
  },

  exotics_avian: {
    speciesFa: 'پرندگان، خرگوش و جوندگان اگزوتیک (Carpenter 6th)',
    icon: '🦜',
    cbc: [
      { param: 'PCV پرندگان زینتی (طوطی/قناری)', range: '42 - 55', unit: '%', note: 'زیر ۳۵ آنمی، بالای ۵۵ کم‌آبی حاد پرنده' },
      { param: 'WBC پرندگان (Heterophils)', range: '5,000 - 15,000', unit: '/uL', note: 'پرندگان هتروفیل دارند نه نوتروفیل' },
      { param: 'PCV خرگوش (Rabbit PCV)', range: '33 - 48', unit: '%', note: 'سفیدهای خرگوش به نام هتروفیل شناخته می‌شوند' },
      { param: 'Platelets خرگوش', range: '250,000 - 650,000', unit: '/uL', note: 'پلاکت‌های نرمال پستانداران کوچک' }
    ],
    biochem: [
      { param: 'Uric Acid پرندگان (اسید اوریک)', range: '2.5 - 10.0', unit: 'mg/dL', note: 'شاخص دفع نیتروژنی پرنده (بالای ۱۰ علامت نقرس و آسیب کلیه)' },
      { param: 'Blood Glucose پرندگان', range: '200 - 350', unit: 'mg/dL', note: 'گلوکز نرمال پرندگان بیش از ۲ برابر پستانداران است' },
      { param: 'Calcium خرگوش (کلسیم سرم)', range: '12.0 - 16.0', unit: 'mg/dL', note: 'خرگوش کلسیم کل جیره را جذب و از ادرار دفع می‌کند' },
      { param: 'Creatinine خرگوش', range: '0.5 - 1.8', unit: 'mg/dL', note: 'BUN در خرگوش بیشتر تحت تاثیر هیدراتاسیون است تا کراتینین' }
    ],
    bloodGas: []
  }
};

// =====================================================================
// ۲. اورژانس‌های سم‌شناسی و پادزهرها (Toxicology & Antidote Decision Engines)
// =====================================================================
const TOXICOLOGY_DATA = {
  // ۱. مسمومیت با شکلات و متیل‌گزانتین‌ها (تئوبرومین و کافئین)
  chocolate: {
    types: {
      white: { name: 'شکلات سفید (White Chocolate)', theobromineMgPerGram: 0.1, danger: 'بسیار کم (خطر اصلی پانکراتیت ناشی از چربی بالا)' },
      milk: { name: 'شکلات شیری تجاری (Milk Chocolate)', theobromineMgPerGram: 2.0, danger: 'متوسط در مقادیر بالا' },
      dark: { name: 'شکلات تلخ ۵۰٪ تا ۷۰٪ (Dark Chocolate)', theobromineMgPerGram: 6.0, danger: 'خطرناک و کشنده حتی در مقادیر کم' },
      baker: { name: 'شکلات قنادی تلخ ۱۰۰٪ (Baker\'s Chocolate)', theobromineMgPerGram: 14.0, danger: 'فوق‌العاده سمی و مرگبار' },
      cocoa_powder: { name: 'پودر کاکائو خالص خشک (Dry Cocoa Powder)', theobromineMgPerGram: 26.0, danger: 'بالاترین غلظت سم تئوبرومین' }
    },
    thresholds: [
      { minMgKg: 20, level: 'خفیف (Mild)', signs: 'استفراغ، اسهال، پلی‌دیپسی و بی‌قراری گوارشی' },
      { minMgKg: 40, level: 'متوسط (Cardiotoxic)', signs: 'تاکی‌کاردی شدید، آریتمی قلبی (VPC)، هایپرتنشن' },
      { minMgKg: 60, level: 'شدید و بحرانی (Neurotoxic)', signs: 'لرزش‌های عضلانی، تشنج مداوم، هایپرترمی و کما' },
      { minMgKg: 100, level: 'کشنده (Potentially Fatal)', signs: 'کلاپس قلبی-عروقی، ایست قلبی و مرگ ناگهانی' }
    ]
  },

  // ۲. مسمومیت با ضدیخ (اتیلن گلیکول - Ethylene Glycol)
  antifreeze: {
    lethalDose: {
      cat: '1.4 mL/kg (حتی یک قاشق چای‌خوری ضدیخ برای گربه کشنده است)',
      dog: '4.4 - 6.6 mL/kg'
    },
    goldenWindowHours: { cat: 3, dog: 8 },
    antidotes: [
      {
        drug: 'فومپیزول (Fomepizole / 4-MP)',
        route: 'وریدی (IV)',
        protocol: 'سگ: دوز اولیه 20 mg/kg وریدی، سپس 15 mg/kg در ساعت‌های ۱۲ و ۲۴، و 5 mg/kg در ساعت ۳۶. در گربه: 125 mg/kg دوز بارگیری، سپس 31.25 mg/kg هر ۱۲ ساعت.',
        advantages: 'مهارکننده رقابتی قوی الکل دهیدروژناز بدون ایجاد دپرسیون CNS یا هایپراسمولاریته'
      },
      {
        drug: 'اتانول ۲۰٪ (Ethanol 20% Compounded)',
        route: 'انفوزیون مداوم وریدی (CRI) با فیلتر',
        protocol: 'سگ و گربه: دوز بارگیری 1.3 mL/kg از محلول ۲۰٪، سپس CRI به میزان 0.42 mL/kg/hr تحت مانیتورینگ دقیق تنفس.',
        notes: 'جایگزین ارزان فومپیزول؛ پایش هایپوترمی، هایپوگلیسمی و اسیدوز متابولیک الزامی است.'
      }
    ],
    diagnosticPearls: 'کریستال‌های اگزالات کلسیم منوهیدرات (شبیه به چوب الفبایی یا دمبلی) ظرف ۳ تا ۶ ساعت در رسوب ادرار پدیدار می‌شوند.'
  },

  // ۳. مسمومیت با جونده‌کش‌های آنتی‌کواگولان (Rodenticide / Brodifacoum)
  rodenticide: {
    antidote: 'ویتامین K1 (فیتونادیون / Phytomenadione)',
    protocol: 'دوز: 2.5 - 5 mg/kg خوراکی (PO) همراه با غذای چرب (کنسرو یا ماست پرچرب) جهت بیشترین جذب، هر ۱۲ ساعت به مدت ۲۸ تا ۳۵ روز کامل.',
    warning: '🔴 تزریق سریع وریدی (IV) ویتامین K1 به علت خطر شوک آنافیلاکسی کشنده مطلقاً ممنوع است. فقط SC یا PO.',
    labTesting: 'ارزیابی زمان پروترومبین (PT) ظرف ۴۸ تا ۷۲ ساعت پس از قطع دوره ویتامین K1؛ اگر PT طولانی بود، دوره باید ۱۴ روز دیگر تمدید شود.'
  },

  // ۴. مسمومیت با سموم ارگانوفسفره و کاربامات‌ها (SLUDGE Signs)
  organophosphates: {
    syndrome: 'سندرم کولینرژیک شدید موسکارینی و نیکوتینیک (SLUDGE: Salivation, Lacrimation, Urination, Defecation, GI cramping, Emesis) + برادی‌کاردی و تنگی برونش.',
    antidotes: [
      { drug: 'آتروپین سولفات', dose: '0.2 - 0.5 mg/kg (یک‌چهارم دوز IV، باقیمانده IM یا SC)', goal: 'قطع ترشحات بزاقی و برونشیال و رفع برادی‌کاردی (نه میدریاز کامل)' },
      { drug: 'پرالیدوکسیم (2-PAM)', dose: '20 mg/kg IV آهسته طی ۱۵ دقیقه هر ۸ تا ۱۲ ساعت', note: 'فعال‌کننده مجدد استیل‌کولین‌استراز؛ ظرف ۲۴ ساعت اول قبل از پدیده Aging آنزیم باید تجویز شود.' }
    ]
  },

  // ۵. گیت‌وی القای استفراغ و پاکسازی گوارشی
  emesisGateway: {
    safeToInduce: 'بلع غیرسوزاننده ظرف ۲ ساعت اول در بیمار کاملاً هوشیار و دارای رفلکس بلع نرمال.',
    strictlyForbidden: '🔴 بلع مواد اسیدی/قلیایی قوی (وایتکس، لوله‌بازکن)، هیدروکربن‌های نفتی (بنزین، نفت سفید)، اشیای نوک‌تیز، بیماران تشنجی، بی‌حال یا در معرض کما، و نژادهای براکی‌سفالیک شدید به علت ریسک پنومونی آسپیراسیون.',
    emeticAgents: {
      dog: 'آپومورفین (Apomorphine) با دوز 0.03 mg/kg IV/IM یا قرص ملتحمه چشم که پس از استفراغ با نرمال سالین شسته شود.',
      cat: 'دکسمدتومازین (Dexmedetomidine) با دوز 7 mcg/kg IM یا زایلازین 0.44 mg/kg IM (آپومورفین در گربه بی‌اثر و خطرناک است).'
    }
  }
};

// =====================================================================
// ۳. موتور پیشرفته مایع‌درمانی و تصحیح الکترولیت‌ها (Advanced Fluids & Electrolytes)
// =====================================================================
const FLUID_ELECTROLYTES_DATA = {
  // تصحیح کمبود سدیم در هایپوناترمی حاد
  sodiumCorrection: {
    formula: 'Deficit (mEq) = Factor * Weight (kg) * (Target_Na - Current_Na)',
    factors: { dog: 0.6, cat: 0.5 },
    maxCorrectionRatePerHour: 0.5, // mEq/L per hour
    warning: '⚠️ تصحیح بیش از حد سریع سدیم (> 12 mEq/L در ۲۴ ساعت) باعث دمیلیناسیون میلینولیز ساقه مغز و مرگ نورولوژیک می‌شود.'
  },

  // مکمل پتاسیم در مایع‌درمانی (Hypokalemia KCl Supplementation)
  potassiumSupplementation: {
    table: [
      { serumK: '> 3.5', mEqToAddPerLiter: 20, maxInfusionRateMlKgHr: 25 },
      { serumK: '3.0 - 3.5', mEqToAddPerLiter: 30, maxInfusionRateMlKgHr: 16 },
      { serumK: '2.5 - 3.0', mEqToAddPerLiter: 40, maxInfusionRateMlKgHr: 12 },
      { serumK: '2.0 - 2.5', mEqToAddPerLiter: 60, maxInfusionRateMlKgHr: 8 },
      { serumK: '< 2.0', mEqToAddPerLiter: 80, maxInfusionRateMlKgHr: 6 }
    ],
    maxSafeKRate: 0.5 // mEq/kg/hour
  },

  // تصحیح کمبود بی‌کربنات در اسیدوز متابولیک
  bicarbonateCorrection: {
    formula: 'HCO3 Deficit (mEq) = Factor * Weight (kg) * (Target_HCO3 - Current_HCO3)',
    factors: { adult: 0.3, calf_or_neonate: 0.5 },
    administration: 'نیمی از بی‌کربنات محاسبه‌شده ظرف ۲ الی ۴ ساعت در سرم دکستروز یا سالین رقیق شده تزریق شود و سپس گازهای خون ارزیابی مجدد گردند.'
  }
};

// =====================================================================
// ۴. راهنمای تشخیصی و الگوریتم‌های چشم‌پزشکی (Ophthalmology Diagnostic Guide)
// =====================================================================
const OPHTHALMOLOGY_DIAGNOSTICS = {
  schirmerTearTest: {
    normalRange: '15 - 25 mm/min',
    earlyKCS: '11 - 14 mm/min (کراتوکونژونکتیویت سیکا مشکوک)',
    moderateKCS: '6 - 10 mm/min (سیکا متوسط - نیازمند سیکلوسپورین یا تاکرولیموس)',
    severeKCS: '< 5 mm/min (خشکی چشم شدید - خطر سوراخ شدن قرنیه)'
  },

  intraocularPressure: {
    normalRange: '10 - 25 mmHg (تونومتری با تونُووت یا تونوپن)',
    glaucoma: '> 25 - 30 mmHg (گلوکوم حاد - نیازمند مانیتول، دورزولامید و لاتانوپروست)',
    uveitis: '< 10 mmHg (یوئیت قدامی - شکست سد خونی-زلالیه)'
  },

  meltingUlcerProtocol: {
    title: 'پروتکل اورژانس اولسر ذوب‌شونده قرنیه (Keratomalacia / Melting Ulcer)',
    pathology: 'تخریب سریع و خودکار استرومای قرنیه ناشی از ترشح آنزیم کلاژناز باکتری‌ها (سودوموناس) و نوتروفیل‌ها.',
    regimen: [
      { step: 'مهار کلاژناز (آنتی‌کلاژناز)', action: 'قطره سرم اتولوگ (خون سانتریفوژشده خود حیوان) یا استیل‌سیستئین ۱۰٪ هر ۱ تا ۲ ساعت در روز اول.' },
      { step: 'آنتی‌بیوتیک باکتریسید قوی', action: 'سفازولین غنی‌شده (۵۰ mg/mL) + توبرامایسین غنی‌شده (۱۴ mg/mL) یا فلوروکینولون چشمی هر ۱ تا ۲ ساعت متناوب.' },
      { step: 'تسکین سیکلوپلژیک', action: 'قطره آتروپین ۱٪ هر ۱۲ تا ۲۴ ساعت تا زمان حصول میدریاز جهت تسکین اسپاسم عضلات مژگانی.' },
      { step: 'خط قرمز مطلق', action: '🔴 مصرف کورتیکواستروئیدهای موضعی یا ترکیبی (بتامتازون، هیدروکورتیزون) در این حالت موجب ذوب آنی و پارگی قرنیه ظرف ۲۴ ساعت می‌شود.' }
    ]
  }
};

// =====================================================================
// ۵. استیجینگ تومورها و اورژانس‌های انکولوژی (Oncology TNM Staging & Emergencies)
// =====================================================================
const ONCOLOGY_STAGING_DATA = {
  lymphomaWHO: [
    { stage: 'Stage I', description: 'درگیری تنها یک گره لنفاوی یا یک عضو منفرد' },
    { stage: 'Stage II', description: 'درگیری چند گره لنفاوی در یک سمت دیافراگم (قدامی یا خلفی)' },
    { stage: 'Stage III', description: 'بزرگ‌شدگی ژنرالیزه تمام غدد لنفاوی محیطی بدن' },
    { stage: 'Stage IV', description: 'درگیری کبد و/یا طحال همراه یا بدون لنفادنوپاتی' },
    { stage: 'Stage V', description: 'درگیری مغز استخوان، خون محیطی (لوسمی) و ارگان‌های غیرلنفاوی (CNS)' }
  ],
  substages: {
    a: 'بدون علائم سیستمیک بالینی (Substage a - احساس سلامتی عمومی)',
    b: 'همراه با علائم سیستمیک بیماری (Substage b - تب، بی‌اشتهایی، لاغری مفرط)'
  },

  febrileNeutropeniaProtocol: {
    title: 'پروتکل نوتروپنی تب‌دار ناشی از شیمی‌درمانی (Febrile Neutropenia)',
    criteria: 'نوتروفیل‌های تام (ANC) زیر ۱,۰۰۰ در میکرولیتر همراه با تب بالای ۳۹.۵ درجه سلسیوس.',
    management: [
      'قطع فوری داروی شیمی‌درمانی تا زمان بازیابی نوتروفیل‌ها به بالای ۳,۰۰۰.',
      'بستری در بخش مراقبت‌های ویژه در شرایط ایزوله بهداشتی.',
      'آنتی‌بیوتیک‌تراپی وریدی وسیع‌الطیف چهارگانه: آمپی‌سیلین/سولباکتام وریدی + انروفلوکساسین یا آمیکاسین (با پایش عملکرد کلیه).',
      'مایع‌درمانی وریدی کریستالوئیدی متعادل با نرخ نگهداری جهت حفظ پرفیوژن مویرگی.'
    ]
  },

  extravasationRescue: {
    doxorubicin: 'توقف آنی تزریق بدون کشیدن سرسوزن، آسپیراسیون تا حد ممکن مایع نشت‌کرده، تزریق پادزهر دکسرازوکسان (Dexrazoxane / Zinecard) ظرف ۶ ساعت و کمپرس سرد متناوب (یخ).',
    vincristine: 'کمپرس گرم (برعکس دوکسوروبیسین) جهت تسریع اتساع عروقی و جذب دارو، تزریق زیرجلدی هیالورونیداز در بافت اطراف نشت.'
  }
};

// =====================================================================
// ۶. پزشکی انتقال خون، گروه‌های خونی و کراس‌مچ (Transfusion Medicine)
// =====================================================================
const TRANSFUSION_DATA = {
  formula: 'Volume (mL) = BodyWeight (kg) * Factor * ((Target_PCV - Patient_PCV) / Donor_PCV)',
  factors: { dog: 90, cat: 66 },

  bloodGroups: {
    dog: {
      system: 'Dog Erythrocyte Antigen (DEA)',
      types: 'DEA 1.1, DEA 1.2, DEA 3, 4, 5, 7, Dal, Kai',
      universalDonor: 'سگ منفی برای DEA 1.1 (DEA 1.1 Negative)',
      universalRecipient: 'سگ مثبت برای DEA 1.1 (در اولین تزریق عمر خود)'
    },
    cat: {
      system: 'AB System',
      types: 'Type A (شایع‌ترین)، Type B (نژادهای اصیل مثل بریتیش، رگ‌دال، پرشین)، Type AB (بسیار نادر)',
      fatalReaction: '🔴 تزریق حتی ۱ میلی‌لیتر خون نوع A به گربه نوع B باعث شوک آنافیلاکسی حاد همولیتیک و مرگ ظرف چند دقیقه می‌شود!'
    }
  },

  crossMatchSteps: [
    { step: 'Major Crossmatch', procedure: '۲ قطره سرم گیرنده (بیمار) + ۱ قطره سوسپانسیون RBC شسته‌شده دهنده -> بررسی آگلوتیناسیون ماکروسکوپیک و میکروسکوپیک.' },
    { step: 'Minor Crossmatch', procedure: '۲ قطره سرم دهنده + ۱ قطره سوسپانسیون RBC شسته‌شده گیرنده (بیمار) -> ارزیابی آنتی‌بادی‌های دهنده علیه گیرنده.' },
    { step: 'تفسیر نتیجه', procedure: 'هرگونه آگلوتیناسیون یا همولیز به معنای ناسازگاری قطعی است؛ تزریق باید فوراً با دهنده دیگری جایگزین شود.' }
  ]
};

// =====================================================================
// ۷. مرحله‌بندی نارسایی کلیه IRIS و تعدیل دوز داروها (IRIS Renal Staging)
// =====================================================================
const IRIS_RENAL_STAGING = {
  dog: [
    { stage: 'Stage 1 (عدم ازوتمی)', creatinine: '< 1.4 mg/dL', sdma: '< 18 ug/dL', action: 'مانیتورینگ و پرهیز از داروهای بالقوه نفروتوکسیک (NSAIDs)' },
    { stage: 'Stage 2 (ازوتمی خفیف)', creatinine: '1.4 - 2.8 mg/dL', sdma: '18 - 25 ug/dL', action: 'کاهش ۲۵٪ دوز یا افزایش فواصل مصرف داروهای دفع کلیوی' },
    { stage: 'Stage 3 (ازوتمی متوسط)', creatinine: '2.9 - 5.0 mg/dL', sdma: '26 - 45 ug/dL', action: 'کاهش ۵۰٪ دوز، رژیم کلیوی و پایش فسفر و فشار خون' },
    { stage: 'Stage 4 (ازوتمی شدید)', creatinine: '> 5.0 mg/dL', sdma: '> 45 ug/dL', action: 'بستری، مایع‌درمانی پیوسته، اجتناب قطعی از آنتی‌بیوتیک‌های آمینوگلیکوزید' }
  ],
  cat: [
    { stage: 'Stage 1', creatinine: '< 1.6 mg/dL', sdma: '< 18 ug/dL', action: 'حفظ هیدراتاسیون، دسترسی آزاد به آب تمیز' },
    { stage: 'Stage 2', creatinine: '1.6 - 2.8 mg/dL', sdma: '18 - 25 ug/dL', action: 'تعدیل دوزهای دارویی، کاهش استرس' },
    { stage: 'Stage 3', creatinine: '2.9 - 5.0 mg/dL', sdma: '26 - 45 ug/dL', action: 'اتصال‌دهنده‌های فسفات، کنترل فشار خون' },
    { stage: 'Stage 4', creatinine: '> 5.0 mg/dL', sdma: '> 45 ug/dL', action: 'مایع‌درمانی زیرجلدی مکرر خانگی، پایش اورمی و کم‌خونی ناشی از فقر اریتروپویتین' }
  ]
};

// =====================================================================
// ۸. پارامترهای ماشین بیهوشی، گازها و ونتیلاتور (Anesthesia & Ventilation)
// =====================================================================
const ANESTHESIA_VENTILATION_DATA = {
  macValues: [
    { agent: 'ایزوفلوران (Isoflurane)', canineMAC: '1.30 %', felineMAC: '1.63 %', equineMAC: '1.31 %', notes: 'دوز جراحی استاندارد: 1.3 تا 1.5 برابر MAC' },
    { agent: 'سووفلوران (Sevoflurane)', canineMAC: '2.36 %', felineMAC: '2.58 %', equineMAC: '2.31 %', notes: 'القای بسیار سریع‌تر، تحریک کمتر مجاری تنفسی' }
  ],

  oxygenFlowRates: {
    rebreathingClosed: '4 - 10 mL/kg/min (مدار کاملاً بسته - اکسیژن متابولیک)',
    rebreathingSemiClosed: '20 - 50 mL/kg/min (مدار رایج Rebreathing با حداقل ۵۰۰ تا ۱۰۰۰ سی‌سی در دقیقه)',
    nonRebreathingBain: '150 - 300 mL/kg/min (حیوانات زیر ۷ کیلوگرم، جهت شستشوی گاز کربنیک بازدمی)'
  },

  ventilatorSettings: {
    tidalVolume: '10 - 15 mL/kg (حجم جاری تنفسی)',
    respiratoryRate: '8 - 12 تنفس در دقیقه',
    peakInspiratoryPressure: '< 20 cmH2O (سقف فشار دمی برای پیشگیری از باروترومای ریه)',
    ieRatio: '1:2 (نسبت زمان دم به بازدم)'
  }
};

// =====================================================================
// ۹. تغذیه بالینی و انرژی استراحت بیماران بستری (Clinical Nutrition & RER)
// =====================================================================
const CLINICAL_NUTRITION_DATA = {
  rerFormula: 'RER (kcal/day) = 70 * (Weight_kg ^ 0.75)',
  tubeFeedingSchedule: [
    { day: 'روز اول بستری', goal: '۳۳٪ از کل کالری RER محاسبه‌شده (تقسیم به ۴ تا ۶ وعده گاواژ آرام)' },
    { day: 'روز دوم بستری', goal: '۶۶٪ از کل کالری RER' },
    { day: 'روز سوم و پس از آن', goal: '۱۰۰٪ نیاز کالری RER بیمار' }
  ],
  feedingTubes: [
    { type: 'نازوگاستریک (Naso-gastric)', indication: 'کوتاه‌مدت (کمتر از ۵ تا ۷ روز) - نیازمند رژیم کاملاً مایع فاقد فیبر' },
    { type: 'ازوفاگوستومی (Esophagostomy)', indication: 'میان‌مدت و بلندمدت (چند هفته تا چند ماه) - قطر بزرگتر، امکان تغذیه کنسرو رقیق‌شده' },
    { type: 'گاستروستومی (PEG Tube)', indication: 'بلندمدت در بی‌اشتهایی ناشی از تومورهای فک و لیپیدوز کبدی گربه' }
  ]
};

// =====================================================================
// ۱۰. ایمنی اپراتور انسانی در دارتینگ حیات‌وحش (Wildlife Human Safety)
// =====================================================================
const WILDLIFE_HUMAN_SAFETY_DATA = {
  ultraPotentOpioids: ['اتورفین (M99)', 'کارفنتانیل (Wildnil)', 'تیافنتانیل (Thianil)'],
  potencyNote: 'کارفنتانیل ۱۰,۰۰۰ بار و اتورفین ۱,۰۰۰ تا ۳,۰۰۰ بار قوی‌تر از مرفین هستند. جذب حتی یک قطره از طریق پوست بریده یا ملتحمه چشم انسان باعث آپنه و مرگ آنی می‌شود.',
  humanAccidentProtocol: [
    'همراه داشتن دائمی حداقل ۲ تا ۳ آمپول نالوکسان انسانی (0.4 mg/mL) در جیب اعضای تیم دارتینگ.',
    'در صورت نیدل‌استیک یا آلودگی مخاطی: تزریق فوری 0.4 تا 0.8 میلی‌گرم نالوکسان وریدی یا عضلانی به فرد مصدوم.',
    'تکرار دوز نالوکسان هر ۲ تا ۳ دقیقه تا زمان رفع کامل تنگی مردمک و احیای تنفس ارادی.',
    'شستشوی فوری موضع نشت با مقادیر فراوان آب تمیز بدون الکل (الکل جذب پوستی اوپیوئید را تسریع می‌کند).'
  ]
};

// =====================================================================
// توابع محاسباتی بالینی ماژولار (Clinical Calculation Engines)
// =====================================================================

// ۱. محاسبه‌گر تئوبرومین شکلات
function calculateChocolateToxicity(weightKg, arg2, arg3) {
  let gramsOfChocolate = 0;
  let chocolateTypeKey = 'milk';
  if (typeof arg2 === 'number') {
    gramsOfChocolate = arg2;
    chocolateTypeKey = typeof arg3 === 'string' ? arg3 : 'milk';
  } else if (typeof arg2 === 'string') {
    chocolateTypeKey = arg2;
    gramsOfChocolate = parseFloat(arg3) || 0;
  } else {
    gramsOfChocolate = parseFloat(arg3) || 0;
  }

  const type = (TOXICOLOGY_DATA.chocolate && TOXICOLOGY_DATA.chocolate.types && TOXICOLOGY_DATA.chocolate.types[chocolateTypeKey]) 
    ? TOXICOLOGY_DATA.chocolate.types[chocolateTypeKey] 
    : { name: 'شکلات شیری', theobromineMgPerGram: 2.0 };
  const totalTheobromineMg = gramsOfChocolate * type.theobromineMgPerGram;
  const mgPerKg = weightKg > 0 ? (totalTheobromineMg / weightKg) : 0;

  let severity = 'ایمن';
  let badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
  let advice = 'دوز تئوبرومین کمتر از آستانه خطر مسمومیت است. صرفاً از نظر علائم گوارشی چربی شکلات پایش شود.';

  if (mgPerKg >= 100) {
    severity = 'فوق‌العاده خطرناک و کشنده (Lethal Emergency)';
    badgeColor = 'bg-rose-600 text-white border-rose-700';
    advice = '🔴 خطر مرگ آنی و کلاپس قلبی! القای فوری استفراغ، تجویز مکرر شارکول فعال، بستری ICU و مانیتورینگ نوار قلب الزامی است.';
  } else if (mgPerKg >= 60) {
    severity = 'مسمومیت شدید عصبی (Neurotoxic)';
    badgeColor = 'bg-rose-100 text-rose-900 border-rose-300';
    advice = 'خطر تشنج مداوم و لرزش شدید عضلانی؛ آماده‌باش دیازپام، متوکاربامول و کنترل تب الزامی است.';
  } else if (mgPerKg >= 40) {
    severity = 'مسمومیت قلبی (Cardiotoxic)';
    badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
    advice = 'احتمال تاکی‌کاردی و آریتمی‌های بطنی؛ مانیتورینگ ECG و کنترل ریتم با بتابلوکر در صورت نیاز.';
  } else if (mgPerKg >= 20) {
    severity = 'مسمومیت خفیف گوارشی (Mild GI)';
    badgeColor = 'bg-blue-100 text-blue-900 border-blue-200';
    advice = 'تهوع، استفراغ و اسهال قابل انتظار است؛ مایع‌درمانی خوراکی یا وریدی توصیه می‌شود.';
  }

  return {
    totalMg: totalTheobromineMg.toFixed(1),
    mgPerKg: mgPerKg.toFixed(1),
    severity,
    badgeColor,
    advice,
    typeName: type.name
  };
}

// ۲. محاسبه‌گر تصحیح کمبود سدیم
function calculateSodiumDeficit(weightKg, speciesKey, currentNa, targetNa) {
  const factor = speciesKey === 'feline' ? 0.5 : 0.6;
  const target = targetNa || 145;
  const current = currentNa || 120;
  const deficit = factor * weightKg * Math.max(0, target - current);
  const maxSafeIncreasePerDay = 12; // mEq/L/day
  const safeHourlyRate = 0.5; // mEq/L/hr

  return {
    deficitMEq: deficit.toFixed(1),
    safeHourlyIncrease: safeHourlyRate,
    maxDailyIncrease: maxSafeIncreasePerDay,
    guidance: `برای رساندن سدیم از ${current} به ${target} mEq/L، کمبود کل برابر ${deficit.toFixed(1)} mEq است. حداکثر نرخ افزایش مجاز 0.5 mEq/L در ساعت است تا از آسیب میلینولیز مغزی جلوگیری شود.`
  };
}

// ۳. محاسبه‌گر پیشرفته کالری RER و لوله تغذیه
function calculateClinicalNutritionRER(weightKg) {
  const rer = 70 * Math.pow(weightKg, 0.75);
  return {
    rerKcal: Math.round(rer),
    day1Kcal: Math.round(rer * 0.33),
    day2Kcal: Math.round(rer * 0.66),
    day3Kcal: Math.round(rer),
    mealsPerDay: 4,
    mlPerMealAt1KcalPerMl: Math.round((rer * 0.33) / 4)
  };
}

// ۴. محاسبه‌گر حجم خون کامل ترانسفیوژن
function calculateWholeBloodVolume(weightKg, speciesKey, patientPcv, targetPcv, donorPcv) {
  const factor = speciesKey === 'feline' ? 66 : 90;
  const pPcv = patientPcv || 12;
  const tPcv = targetPcv || 25;
  const dPcv = donorPcv || 40;

  const vol = weightKg * factor * ((tPcv - pPcv) / dPcv);
  return {
    volumeMl: Math.max(0, Math.round(vol)),
    factor,
    guidance: `جهت افزایش هماتوکریت از ${pPcv}٪ به ${tPcv}٪ با خون دهنده ${dPcv}٪، نیاز به ${Math.round(vol)} میلی‌لیتر خون کامل است. نرخ اولیه تزریق: 0.25 - 0.5 mL/kg طی ۳۰ دقیقه اول جهت پایش علائم واکنش همولیتیک.`
  };
}

// =====================================================================
// ۱۱. پیش‌فرض‌ها و موتور ماشین‌حساب بالینی چندگونه‌ای و چندفرمی
// Universal Clinical Dose, Formulation & Prescription Engine
// =====================================================================

const UNIVERSAL_CALC_PRESETS = {
  canine: [
    { id: 'amox_clav_susp', name: 'شربت کوآموکسی‌کلاو (Amox-Clav Suspension)', formRoute: 'oral_liquid', defaultRate: 13.75, defaultConc: 31.25, unit: 'mg/kg', interval: 'q12h', days: 7, bottleMl: 100, notes: 'سوسپانسیون ۳۱۲ میلی‌گرم در ۵ سی‌سی (معادل 62.5 mg/mL) یا ۱۵۶ در ۵ سی‌سی (31.25 mg/mL). همراه غذا مصرف شود.' },
    { id: 'amox_clav_pill', name: 'قرص کوآموکسی‌کلاو (Amox-Clav Tablets)', formRoute: 'oral_pill', defaultRate: 13.75, defaultConc: 250, unit: 'mg/kg', interval: 'q12h', days: 7, notes: 'قرص‌های ۲۵۰، ۳۷۵ یا ۵۰۰ میلی‌گرم خط‌دار. همراه وعده غذایی.' },
    { id: 'cephalexin_susp', name: 'شربت سفالکسین (Cephalexin 250/5 Suspension)', formRoute: 'oral_liquid', defaultRate: 22.0, defaultConc: 50.0, unit: 'mg/kg', interval: 'q12h', days: 10, bottleMl: 100, notes: 'سوسپانسیون ۲۵۰ میلی‌گرم در ۵ سی‌سی. انتخاب طلایی پیودرمی سطحی و عمقی.' },
    { id: 'meloxicam_inj', name: 'ملوکسیکام تزریقی (Meloxicam 0.5% Injection)', formRoute: 'injectable', defaultRate: 0.2, defaultConc: 5.0, unit: 'mg/kg', interval: 'q24h', days: 1, route: 'زیرجلدی (SC) یا وریدی (IV)', notes: 'دوز بارگیری روز اول 0.2 mg/kg، دوز نگهدارنده 0.1 mg/kg. بیمار باید هیدراته باشد.' },
    { id: 'meloxicam_oral', name: 'ملوکسیکام سوسپانسیون خوراکی (Meloxicam 1.5 mg/mL)', formRoute: 'oral_liquid', defaultRate: 0.1, defaultConc: 1.5, unit: 'mg/kg', interval: 'q24h', days: 5, bottleMl: 32, notes: 'همراه غذا. دارای سرنگ مدرج بر اساس وزن سگ.' },
    { id: 'maropitant_inj', name: 'ماروپیتانت سرنیا تزریقی (Maropitant 10 mg/mL)', formRoute: 'injectable', defaultRate: 1.0, defaultConc: 10.0, unit: 'mg/kg', interval: 'q24h', days: 3, route: 'زیرجلدی (SC)', notes: 'ضداستفراغ انتخابی؛ نگهداری ویال در یخچال قبل از تزریق سوزش موضعی را به شدت کاهش می‌دهد.' },
    { id: 'metoclopramide_inj', name: 'متوکلوپرامید تزریقی (Metoclopramide 5 mg/mL)', formRoute: 'injectable', defaultRate: 0.3, defaultConc: 5.0, unit: 'mg/kg', interval: 'q8h', days: 3, route: 'زیرجلدی (SC) / وریدی (IV)', notes: 'پروکینتیک معده؛ در انسداد مکانیکی گوارش ممنوع است.' },
    { id: 'cefazolin_inj', name: 'سفازولین تزریقی (Cefazolin 1g Vial)', formRoute: 'injectable', defaultRate: 22.0, defaultConc: 100.0, unit: 'mg/kg', interval: 'q8h', days: 5, route: 'وریدی (IV) آهسته', notes: 'پودر ۱ گرمی را در ۹.۶ سی‌سی آب مقطر حل کنید تا غلظت 100 mg/mL حاصل شود.' },
    { id: 'enrofloxacin_inj', name: 'انروفلوکساسین ۵٪ تزریقی (Enrofloxacin 50 mg/mL)', formRoute: 'injectable', defaultRate: 5.0, defaultConc: 50.0, unit: 'mg/kg', interval: 'q24h', days: 5, route: 'زیرجلدی (SC) یا وریدی رقیق‌شده', notes: 'در توله‌سگ‌های در حال رشد به علت آسیب غضروف‌های مفصلی با احتیاط مصرف شود.' },
    { id: 'gabapentin_pill', name: 'کپسول گاباپنتین (Gabapentin 100mg Capsule)', formRoute: 'oral_pill', defaultRate: 10.0, defaultConc: 100, unit: 'mg/kg', interval: 'q12h', days: 14, notes: 'تسکین درد نوروپاتیک و آرام‌بخشی؛ از فرمولاسیون شربت انسانی حاوی زایلیتول خودداری شود!' },
    { id: 'tramadol_pill', name: 'قرص ترامادول (Tramadol 50mg Tablet)', formRoute: 'oral_pill', defaultRate: 3.0, defaultConc: 50, unit: 'mg/kg', interval: 'q8h', days: 5, notes: 'مسکن اوپیوئیدی خوراکی چندوجهی.' },
    { id: 'metronidazole_susp', name: 'سوسپانسیون مترونیدازول (Metronidazole 200/5)', formRoute: 'oral_liquid', defaultRate: 15.0, defaultConc: 40.0, unit: 'mg/kg', interval: 'q12h', days: 7, bottleMl: 100, notes: 'سوسپانسیون ۲۰۰ میلی‌گرم در ۵ سی‌سی؛ درمان ژیاردیا و اسهال حاد با منشا بی‌هوازی.' },
    { id: 'dexamethasone_inj', name: 'دگزامتازون تزریقی (Dexamethasone 2 mg/mL)', formRoute: 'injectable', defaultRate: 0.15, defaultConc: 2.0, unit: 'mg/kg', interval: 'q24h', days: 2, route: 'وریدی (IV) / عضلانی (IM)', notes: 'کورتیکواستروئید قوی ضدالتهاب؛ همراه NSAID مصرف نشود (خطر زخم حاد معده).' }
  ],

  feline: [
    { id: 'meloxicam_cat_inj', name: 'ملوکسیکام تزریقی گربه (Meloxicam Cat 5 mg/mL)', formRoute: 'injectable', defaultRate: 0.05, defaultConc: 5.0, unit: 'mg/kg', interval: 'q24h', days: 1, route: 'زیرجلدی (SC)', notes: 'حداکثر دوز ایمن گربه 0.05 mg/kg است (یک‌چهارم دوز سگ). در گربه‌های دهیدراته یا مبتلا به CKD ممنوع است.' },
    { id: 'meloxicam_cat_oral', name: 'ملوکسیکام قطره خوراکی گربه (Meloxicam 0.5 mg/mL)', formRoute: 'oral_liquid', defaultRate: 0.05, defaultConc: 0.5, unit: 'mg/kg', interval: 'q24h', days: 3, bottleMl: 15, notes: 'قطره مخصوص گربه با غلظت ملایم 0.5 mg/mL؛ پایش عملکرد کلیه.' },
    { id: 'amox_clav_feline_susp', name: 'سوسپانسیون کوآموکسی‌کلاو گربه (Amox-Clav 156/5)', formRoute: 'oral_liquid', defaultRate: 12.5, defaultConc: 31.25, unit: 'mg/kg', interval: 'q12h', days: 7, bottleMl: 100, notes: 'انتخاب اول در عفونت‌های تنفسی فوقانی گربه (URI) و آبسه‌های گازگرفتگی.' },
    { id: 'buprenorphine_inj', name: 'بوپرنورفین تزریقی (Buprenorphine 0.3 mg/mL)', formRoute: 'injectable', defaultRate: 0.02, defaultConc: 0.3, unit: 'mg/kg', interval: 'q8h', days: 3, route: 'زیرجلدی (SC) یا مخاط گونه (OTM)', notes: 'جذب عالی از طریق مخاط گونه (OTM) در گربه؛ مسکن اگونیست نسبی مو بسیار ایمن.' },
    { id: 'maropitant_cat_inj', name: 'ماروپیتانت گربه (Maropitant 10 mg/mL)', formRoute: 'injectable', defaultRate: 1.0, defaultConc: 10.0, unit: 'mg/kg', interval: 'q24h', days: 3, route: 'زیرجلدی (SC)', notes: 'تزریق سرد از یخچال جهت کاهش درد موضعی.' },
    { id: 'methimazole_pill', name: 'قرص متی‌مازول (Methimazole 5mg Tablet)', formRoute: 'oral_pill', defaultRate: 2.5, defaultConc: 5.0, unit: 'mg/kg', interval: 'q12h', days: 30, notes: 'درمان پرکاری تیروئید (هایپرتیروئیدیسم) گربه‌های مسن؛ مانیتورینگ کلیه و شمارش سلول‌های خون.' }
  ],

  equine: [
    { id: 'flunixin_eq_inj', name: 'فلونیکسین مگلومین اسب (Flunixin Meglumine 50 mg/mL)', formRoute: 'injectable', defaultRate: 1.1, defaultConc: 50.0, unit: 'mg/kg', interval: 'q24h', days: 3, route: 'وریدی (IV) انحصاری', notes: 'مسکن طلایی دردهای احشایی و کولیک اسب. تزریق عضلانی به علت ریسک میوزیت کلستریدیایی کشنده ممنوع است!' },
    { id: 'xylazine_eq_inj', name: 'زایلازین ۲٪ اسب (Xylazine 20 mg/mL)', formRoute: 'injectable', defaultRate: 1.1, defaultConc: 20.0, unit: 'mg/kg', interval: 'single', days: 1, route: 'وریدی (IV) آهسته', notes: 'آرام‌بخشی و مقیدسازی اسب؛ پایش برادی‌کاردی و آتاکسی.' },
    { id: 'oxytetracycline_eq_inj', name: 'اکسی‌تتراسایکلین ۱۰٪ اسب (Oxytetracycline 100 mg/mL)', formRoute: 'injectable', defaultRate: 10.0, defaultConc: 100.0, unit: 'mg/kg', interval: 'q24h', days: 5, route: 'صرفاً وریدی (IV) رقیق‌شده در سرم', notes: 'تزریق سریع بدون رقیق‌سازی باعث کلاپس قلبی ناشی از کلاتاسیون کلسیم می‌شود.' },
    { id: 'omeprazole_paste', name: 'پاست خوراکی امپرازول اسب (Omeprazole Paste 370 mg/g)', formRoute: 'oral_liquid', defaultRate: 4.0, defaultConc: 370.0, unit: 'mg/kg', interval: 'q24h', days: 28, bottleMl: 30, notes: 'درمان سندرم زخم معده اسب (EGUS) ناشتا پیش از وعده صبحگاهی.' }
  ],

  bovine: [
    { id: 'oxytet_la_bov', name: 'اکسی‌تتراسایکلین طولانی‌اثر ۲۰٪ (Oxytetracycline LA 200 mg/mL)', formRoute: 'injectable', defaultRate: 20.0, defaultConc: 200.0, unit: 'mg/kg', interval: 'q72h', days: 3, route: 'عضلانی عمیق (IM) یا زیرجلدی (SC)', notes: 'حداکثر حجم تزریق در یک موضع ۱۵ سی‌سی در گاو بالغ است. دوره پرهیز گوشت ۲۸ روز و شیر ۷ روز.' },
    { id: 'florfenicol_bov', name: 'فلورفنیکل ۳۰٪ گاو (Florfenicol 300 mg/mL)', formRoute: 'injectable', defaultRate: 20.0, defaultConc: 300.0, unit: 'mg/kg', interval: 'q48h', days: 2, route: 'عضلانی (IM) - دو تزریق به فاصله ۴۸ ساعت', notes: 'درمان مجتمع تنفسی گاو (BRD) ناشی از مانهیمیا همولیتیکا. دوره پرهیز گوشت ۲۸ روز.' },
    { id: 'tulatromycin_bov', name: 'تولاترومایسین دراکسین (Tulathromycin 100 mg/mL)', formRoute: 'injectable', defaultRate: 2.5, defaultConc: 100.0, unit: 'mg/kg', interval: 'single', days: 1, route: 'زیرجلدی (SC) تک‌دوز', notes: 'تک‌دوز نجات‌بخش با نفوذ عالی در ریه گاو.' }
  ],

  ovine_caprine: [
    { id: 'oxytet_la_sheep', name: 'اکسی‌تتراسایکلین طولانی‌اثر ۲۰٪ (Oxytetracycline LA 200 mg/mL)', formRoute: 'injectable', defaultRate: 20.0, defaultConc: 200.0, unit: 'mg/kg', interval: 'q72h', days: 3, route: 'عضلانی عمیق (IM)', notes: 'درمان آگالاکسی واگیر، پنومونی پاستورلایی و پلوروپنومونی بز (CCPP). حداکثر ۵ سی‌سی در یک موضع تزریق شود.' },
    { id: 'flunixin_sheep', name: 'فلونیکسین مگلومین ۵٪ (Flunixin Meglumine 50 mg/mL)', formRoute: 'injectable', defaultRate: 2.2, defaultConc: 50.0, unit: 'mg/kg', interval: 'q24h', days: 3, route: 'وریدی (IV) یا عضلانی (IM)', notes: 'ضدالتهاب و مسکن قوی تب در پنومونی، ماستیت حاد و آندوتوکسمی.' },
    { id: 'albendazole_sheep', name: 'سوسپانسیون خوراکی آلبندازول ۲.۵٪ (Albendazole 25 mg/mL)', formRoute: 'oral_liquid', defaultRate: 7.5, defaultConc: 25.0, unit: 'mg/kg', interval: 'single', days: 1, bottleMl: 1000, notes: 'ضدانگل وسیع‌الطیف علیه نماتودها، سستودها و فاسیولا هپاتیکا بالغ. در ۴۵ روز اول آبستنی منع مصرف دارد.' }
  ],

  camelids: [
    { id: 'oxytet_camel', name: 'اکسی‌تتراسایکلین شتر (Oxytetracycline 200 mg/mL)', formRoute: 'injectable', defaultRate: 10.0, defaultConc: 200.0, unit: 'mg/kg', interval: 'q48h', days: 3, route: 'زیرجلدی (SC) با سوزن ۱۸', notes: 'پایش دقیق اولسراسیون C3؛ از تزریق حجم بالای ۱۰ سی‌سی در یک نقطه خودداری شود.' },
    { id: 'flunixin_camel', name: 'فلونیکسین مگلومین شتر (Flunixin 50 mg/mL)', formRoute: 'injectable', defaultRate: 1.1, defaultConc: 50.0, unit: 'mg/kg', interval: 'q24h', days: 3, route: 'وریدی (IV) یا زیرجلدی (SC)', notes: 'شترسانان مستعد اولسراسیون C3 هستند؛ ترجیحاً همراه با امپرازول یا سوکرالفات تجویز شود.' },
    { id: 'ivermectin_camel', name: 'آیورمکتین ۱٪ شتر (Ivermectin 10 mg/mL)', formRoute: 'injectable', defaultRate: 0.2, defaultConc: 10.0, unit: 'mg/kg', interval: 'single', days: 1, route: 'زیرجلدی (SC)', notes: 'کنترل جرب سارکوپتس و نماتودهای دستگاه گوارش شتر.' }
  ],

  aquatics: [
    { id: 'oxytet_fish_bath', name: 'اکسی‌تتراسایکلین حمام غوطه‌وری ماهیان (Oxytetracycline Bath)', formRoute: 'aquatic_powder', defaultRate: 20.0, defaultConc: 1000.0, unit: 'ppm', interval: 'q24h', days: 4, notes: '20 ppm معادل ۲۰ گرم در متر مکعب آب حوضچه (یا 20 mg/L) به مدت ۱ ساعت در حمام کوتاه‌مدت.' },
    { id: 'florfenicol_fish_feed', name: 'فلورفنیکل خوراکی خوراک قزل‌آلا (Florfenicol in-feed)', formRoute: 'aquatic_powder', defaultRate: 10.0, defaultConc: 500.0, unit: 'mg/kg', interval: 'q24h', days: 10, notes: 'دوز ۱۰ میلی‌گرم به ازای هر کیلوگرم بیوماس (توده زیستی زنده ماهیان استخر) مخلوط در جیره روزانه.' },
    { id: 'ms222_anesthesia', name: 'ام‌اس-۲۲۲ بیهوشی ماهی (Tricaine MS-222)', formRoute: 'aquatic_powder', defaultRate: 100.0, defaultConc: 1000.0, unit: 'ppm', interval: 'single', days: 1, notes: '100 ppm معادل ۱۰۰ میلی‌گرم در لیتر آب حوضچه بیهوشی؛ بافربندی با بی‌کربنات سدیم جهت حفظ pH خنثی الزامی است.' }
  ],

  wildlife: [
    { id: 'bam_darting', name: 'کوکتل دارتینگ BAM (بوتورفانول + آزاپِرون + مدتومازین)', formRoute: 'injectable', defaultRate: 0.4, defaultConc: 50.0, unit: 'mg/kg', interval: 'single', days: 1, route: 'عضلانی پرتابه دارت (IM)', notes: 'ایمن‌ترین کوکتل مقیدسازی شیمیایی پستانداران وحشی و نشخوارکنندگان حیات‌وحش.' },
    { id: 'ketamine_darting', name: 'کتامین ۱۰٪ پرتابه دارت (Ketamine 100 mg/mL)', formRoute: 'injectable', defaultRate: 5.0, defaultConc: 100.0, unit: 'mg/kg', interval: 'single', days: 1, route: 'عضلانی پرتابه دارت (IM)', notes: 'معمولاً در ترکیب با مدتومازین یا زایلازین جهت القای بی‌هوشی جراحی در گوشتخواران وحشی.' },
    { id: 'atipamezole_reversal', name: 'آتیپامزول رِوِرسال مدتومازین (Atipamezole 5 mg/mL)', formRoute: 'injectable', defaultRate: 0.2, defaultConc: 5.0, unit: 'mg/kg', interval: 'single', days: 1, route: 'عضلانی (IM)', notes: 'پادزهر اختصاصی آلفا-۲؛ ۵ برابر دوز میلی‌گرمی مدتومازین تزریق شود. تزریق سریع IV ممنوع است.' }
  ]
};

// موتور اصلی محاسبات بالینی چندگونه‌ای و نسخه (Universal Calculation Engine)
function calculateUniversalDoseDispensing(params) {
  const weight = parseFloat(params.weight) || 0;
  const rate = parseFloat(params.rate) || 0;
  const conc = parseFloat(params.conc) || 0;
  const formRoute = params.formRoute || 'injectable';
  const species = params.species || 'canine';
  const intervalCode = params.interval || 'q12h';
  const days = parseInt(params.days) || 1;
  const bottleMl = parseFloat(params.bottleMl) || 100;
  const drugId = params.drugId || '';
  const doseBasis = params.doseBasis || 'weight'; // 'weight' (mg/kg) یا 'bsa' (mg/m²)

  // محاسبه دقیق مساحت سطح بدن (BSA) بر اساس فرمول استاندارد میه (Meeh's formula)
  let bsa = 0;
  if (weight > 0) {
    const weightInGrams = weight * 1000.0;
    const kFactor = (species === 'canine') ? 10.1 : 10.0;
    bsa = (kFactor * Math.pow(weightInGrams, 2.0 / 3.0)) / 10000.0;
  }

  // ۱. محاسبه دوز تام هر وعده بر حسب میلی‌گرم
  let mgPerDose = 0;
  if (doseBasis === 'bsa') {
    mgPerDose = bsa * rate; // دوز بر اساس میلی‌گرم بر متر مربع سطح مقطع بدن (mg/m²)
    if (params.doseUnit === 'mcg/m2') {
      mgPerDose = (bsa * rate) / 1000.0;
    }
  } else {
    mgPerDose = weight * rate; // دوز بر اساس میلی‌گرم بر کیلوگرم وزن (mg/kg)
    if (params.doseUnit === 'mcg/kg') {
      mgPerDose = (weight * rate) / 1000.0;
    }
  }

  // ۲. محاسبه حجم یا کسر قرص در هر وعده
  let volOrUnitPerDose = conc > 0 ? (mgPerDose / conc) : 0;
  let unitTextFa = 'میلی‌لیتر (سی‌سی)';
  let syringeAdvice = '';
  let tabletFractionFa = '';

  if (formRoute === 'oral_pill') {
    unitTextFa = 'عدد قرص';
    if (volOrUnitPerDose < 0.2) {
      tabletFractionFa = 'کمتر از ۱/۴ قرص (نیاز به سوسپانسیون یا حل کردن در سرنگ)';
    } else if (volOrUnitPerDose < 0.38) {
      tabletFractionFa = '۱/۴ قرص (یک‌چهارم قرص)';
    } else if (volOrUnitPerDose < 0.68) {
      tabletFractionFa = '۱/۲ قرص (نصف قرص)';
    } else if (volOrUnitPerDose < 0.88) {
      tabletFractionFa = '۳/۴ قرص (سه‌چهارم قرص)';
    } else if (volOrUnitPerDose < 1.35) {
      tabletFractionFa = '۱ قرص کامل';
    } else if (volOrUnitPerDose < 1.7) {
      tabletFractionFa = '۱.۵ قرص (یک و نیم قرص)';
    } else if (volOrUnitPerDose < 2.35) {
      tabletFractionFa = '۲ قرص کامل';
    } else {
      tabletFractionFa = `${volOrUnitPerDose.toFixed(1)} عدد قرص`;
    }
  } else if (formRoute === 'injectable') {
    unitTextFa = 'میلی‌لیتر (سی‌سی)';
    if (volOrUnitPerDose <= 0.5) {
      syringeAdvice = '💉 سرنگ انسولین ۱۰۰ واحدی (0.5 یا 1 mL) جهت دقت میکرولیتری';
    } else if (volOrUnitPerDose <= 2.5) {
      syringeAdvice = '💉 سرنگ ۲ یا ۲.۵ سی‌سی استاندارد';
    } else if (volOrUnitPerDose <= 5.0) {
      syringeAdvice = '💉 سرنگ ۵ سی‌سی';
    } else if (volOrUnitPerDose <= 10.0) {
      syringeAdvice = '💉 سرنگ ۱۰ سی‌سی';
    } else {
      syringeAdvice = '💉 سرنگ ۲۰ سی‌سی (توجه: تقسیم حجم در ۲ یا چند موضع تزریق مختلف)';
    }
  } else if (formRoute === 'oral_liquid') {
    unitTextFa = 'میلی‌لیتر (سی‌سی)';
    if (volOrUnitPerDose < 5) {
      syringeAdvice = '🥄 با سرنگ خوراکی مدرج بدون سوزن خورانده شود';
    } else {
      const spoons = (volOrUnitPerDose / 5).toFixed(1);
      syringeAdvice = `🥄 معادل تقریبی ${spoons} قاشق مرباخوری (هر قاشق ۵ سی‌سی)`;
    }
  } else if (formRoute === 'aquatic_powder') {
    unitTextFa = 'گرم در متر مکعب (ppm)';
  }

  // ۳. محاسبه تعداد دفعات مصرف در روز بر اساس کد فاصله
  let dosesPerDay = 2; // q12h
  let intervalLabelFa = 'هر ۱۲ ساعت (۲ بار در روز)';
  if (intervalCode === 'q6h') { dosesPerDay = 4; intervalLabelFa = 'هر ۶ ساعت (۴ بار در روز)'; }
  else if (intervalCode === 'q8h') { dosesPerDay = 3; intervalLabelFa = 'هر ۸ ساعت (۳ بار در روز)'; }
  else if (intervalCode === 'q12h') { dosesPerDay = 2; intervalLabelFa = 'هر ۱۲ ساعت (۲ بار در روز)'; }
  else if (intervalCode === 'q24h') { dosesPerDay = 1; intervalLabelFa = 'هر ۲۴ ساعت (۱ بار در روز)'; }
  else if (intervalCode === 'q48h') { dosesPerDay = 0.5; intervalLabelFa = 'هر ۴۸ ساعت یک‌بار'; }
  else if (intervalCode === 'single') { dosesPerDay = 1; intervalLabelFa = 'تک‌دوز (Single Dose)'; }

  // ۴. تعداد کل مصرفی دوره نسخه
  const totalDosesCount = intervalCode === 'single' ? 1 : Math.ceil(dosesPerDay * days);
  let totalDispenseText = '';

  if (formRoute === 'oral_pill') {
    const totalPillsNeeded = Math.ceil(totalDosesCount * volOrUnitPerDose);
    totalDispenseText = `${totalPillsNeeded} عدد قرص (معادل ${Math.ceil(totalPillsNeeded / 10)} ورق ۱۰ تایی)`;
  } else if (formRoute === 'oral_liquid') {
    const totalMlNeeded = (totalDosesCount * volOrUnitPerDose).toFixed(1);
    const bottlesNeeded = Math.ceil(totalMlNeeded / bottleMl);
    totalDispenseText = `${totalMlNeeded} سی‌سی مایع (معادل ${bottlesNeeded} بطری ${bottleMl} سی‌سی)`;
  } else if (formRoute === 'injectable') {
    const totalMlNeeded = (totalDosesCount * volOrUnitPerDose).toFixed(1);
    totalDispenseText = `${totalMlNeeded} سی‌سی حجم کل داروی تزریقی`;
  } else {
    totalDispenseText = `${(totalDosesCount * volOrUnitPerDose).toFixed(1)} ${unitTextFa}`;
  }

  // ۵. ایجاد متن دستور مصرف استاندارد فارسی (Prescription Label)
  let rxLabel = '';
  if (formRoute === 'oral_pill') {
    rxLabel = `${intervalLabelFa}، به میزان ${tabletFractionFa} تا ${days} روز متوالی خورانده شود.`;
  } else if (formRoute === 'oral_liquid') {
    rxLabel = `${intervalLabelFa}، به میزان ${volOrUnitPerDose.toFixed(2)} سی‌سی با سرنگ خوراکی تا ${days} روز متوالی خورانده شود.`;
  } else if (formRoute === 'injectable') {
    rxLabel = `${intervalLabelFa}، به میزان ${volOrUnitPerDose.toFixed(2)} سی‌سی به صورت تزریقی تا ${days} روز مصرف شود.`;
  } else {
    rxLabel = `${intervalLabelFa}، به میزان ${volOrUnitPerDose.toFixed(2)} ${unitTextFa} مصرف شود.`;
  }

  // ۶. ارزیابی رادار ایمنی بالینی گونه (Zero Dosage Error Invariant)
  let safetyAlert = '';
  if (species === 'feline' && (drugId.includes('acetaminophen') || drugId.includes('paracetamol'))) {
    safetyAlert = '🔴 خط قرمز ایمنی کشنده: استامینوفن در گربه به دلیل فقر گلوکورونیل ترانسفراز مطلقاً مرگبار است!';
  } else if (species === 'camelids' && drugId.includes('tilmicosin')) {
    safetyAlert = '🔴 خط قرمز ایمنی کشنده: تزریق تیلمیکوزین در شترسانان باعث ایست حاد قلبی و مرگ ناگهانی می‌شود!';
  } else if (species === 'equine' && drugId.includes('tilmicosin')) {
    safetyAlert = '🔴 خط قرمز ایمنی کشنده: تزریق تیلمیکوزین در اسب مطلقاً مرگبار است!';
  } else if (species === 'camelids' && formRoute === 'injectable' && volOrUnitPerDose > 15) {
    safetyAlert = '⚠️ احتیاط در شترسانان: از تزریق بیش از ۱۰ تا ۱۵ سی‌سی در یک نقطه خودداری کرده و حجم را در دو موضع مجزا تزریق نمایید.';
  } else if (species === 'canine' && formRoute === 'oral_liquid' && drugId.includes('human')) {
    safetyAlert = '⚠️ هشدار زایلیتول: در شربت‌های خوراکی ساخت انسانی از عدم وجود شیرین‌کننده زایلیتول اطمینان حاصل کنید.';
  }

  return {
    mgPerDose: mgPerDose.toFixed(2),
    volPerDose: volOrUnitPerDose.toFixed(2),
    unitTextFa,
    tabletFractionFa,
    syringeAdvice,
    totalDosesCount,
    totalDispenseText,
    rxLabel,
    safetyAlert: doseBasis === 'bsa' 
      ? (safetyAlert ? safetyAlert + ' | ⚠️ پروتکل انکولوژی (BSA): تزریق دقیق با کاتتر وریدی سالم جهت پیشگیری از اکستراوازیشن.' : '⚠️ داروی شیمی‌درمانی/انکولوژی بر پایه مساحت سطح بدن (BSA): استفاده از دستکش دوبل، ماسک محافظ و تزریق با کاتتر وریدی سالم الزامی است.') 
      : safetyAlert,
    intervalLabelFa,
    bsa: bsa.toFixed(2),
    bsaExact: bsa.toFixed(3),
    doseBasis
  };
}

// صادر کردن متغیرها برای ماژولار بودن در مرورگر و Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    LAB_REFERENCE_INTERVALS,
    TOXICOLOGY_DATA,
    FLUID_ELECTROLYTES_DATA,
    OPHTHALMOLOGY_DIAGNOSTICS,
    ONCOLOGY_STAGING_DATA,
    TRANSFUSION_DATA,
    IRIS_RENAL_STAGING,
    ANESTHESIA_VENTILATION_DATA,
    CLINICAL_NUTRITION_DATA,
    WILDLIFE_HUMAN_SAFETY_DATA,
    UNIVERSAL_CALC_PRESETS,
    calculateChocolateToxicity,
    calculateSodiumDeficit,
    calculateClinicalNutritionRER,
    calculateWholeBloodVolume,
    calculateUniversalDoseDispensing
  };
}

if (typeof window !== 'undefined') {
  window.LAB_REFERENCE_INTERVALS = LAB_REFERENCE_INTERVALS;
  window.TOXICOLOGY_DATA = TOXICOLOGY_DATA;
  window.FLUID_ELECTROLYTES_DATA = FLUID_ELECTROLYTES_DATA;
  window.OPHTHALMOLOGY_DIAGNOSTICS = OPHTHALMOLOGY_DIAGNOSTICS;
  window.ONCOLOGY_STAGING_DATA = ONCOLOGY_STAGING_DATA;
  window.TRANSFUSION_DATA = TRANSFUSION_DATA;
  window.IRIS_RENAL_STAGING = IRIS_RENAL_STAGING;
  window.ANESTHESIA_VENTILATION_DATA = ANESTHESIA_VENTILATION_DATA;
  window.CLINICAL_NUTRITION_DATA = CLINICAL_NUTRITION_DATA;
  window.WILDLIFE_HUMAN_SAFETY_DATA = WILDLIFE_HUMAN_SAFETY_DATA;
  window.UNIVERSAL_CALC_PRESETS = UNIVERSAL_CALC_PRESETS;
  window.calculateChocolateToxicity = calculateChocolateToxicity;
  window.calculateSodiumDeficit = calculateSodiumDeficit;
  window.calculateClinicalNutritionRER = calculateClinicalNutritionRER;
  window.calculateWholeBloodVolume = calculateWholeBloodVolume;
  window.calculateUniversalDoseDispensing = calculateUniversalDoseDispensing;
}

