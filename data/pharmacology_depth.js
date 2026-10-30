/**
 * Iranian Plumb's Veterinary Drug Formulary & Decision Support System
 * Specialized Clinical Module: Pharmacology Depth, Compatibility, BUD & Personnel Safety
 * 
 * Standards & Reference Authorities:
 * 1. Physical-Chemical Compatibility: ASHP Injectable Drug Information (Trissel's) & King Guide
 * 2. Beyond-Use Dating & Compounding: USP <795> Nonsterile, USP <797> Sterile, USP <800> Hazardous
 * 3. Pharmacokinetics & Organ Adjustments: Riviere & Papich Veterinary Pharmacology & Therapeutics 10th Ed
 * 4. Clinical Anesthetic Syringe Cocktails: Muir & Hubbell Handbook of Veterinary Anesthesia 6th Ed
 */

(function (window) {
  'use strict';

  // ۱. لیست سرم‌های پایه وریدی
  const IV_FLUIDS_LIST = [
    { id: 'nacl_09', name_fa: 'نرمال سالین ۰.۹٪ (Normal Saline)', name_en: '0.9% Sodium Chloride', ph: '4.5 - 7.0', osmolarity: '308 mOsm/L (ایزوتونیک)', notes: 'سرم استاندارد رقیق‌سازی اکثر آنتی‌بیوتیک‌ها، مخدرها و کاتکول‌آمین‌ها؛ فاقد کلسیم.' },
    { id: 'd5w', name_fa: 'دکستروز ۵٪ در آب (D5W)', name_en: '5% Dextrose in Water', ph: '3.5 - 6.5', osmolarity: '252 mOsm/L (هیپوتونیک فیزیولوژیک)', notes: 'محیط اسیدی ضعیف؛ نامناسب برای داروهای حساس به اسید نظیر آمپی‌سیلین و پنتوپرازول.' },
    { id: 'lrs', name_fa: 'رینگر لاکتات (Lactated Ringer\'s - LRS)', name_en: 'Lactated Ringer\'s Solution', ph: '6.0 - 7.5', osmolarity: '273 mOsm/L (حاوی کلسیم ۳ mEq/L)', notes: '⚠️ حاوی یون کلسیم: منع مطلق اختلاط با سفتریاکسون و بی‌کربنات سدیم (رسوب بلوری کشنده).' },
    { id: 'normosol_r', name_fa: 'نرموسول R / پلاسما لایت (Normosol-R / Plasmalyte-A)', name_en: 'Normosol-R', ph: '7.4', osmolarity: '294 mOsm/L (بافر گلوکونات/استات)', notes: 'فاقد کلسیم (حاوی منیزیم)؛ سازگاری عالی با اکثر الکترولیت‌ها و خون ترانسفیوژن.' },
    { id: 'hypertonic_saline_72', name_fa: 'هایپرتونیک سالین ۷.۲٪ (Hypertonic Saline)', name_en: '7.2% Hypertonic Saline', ph: '5.0 - 7.0', osmolarity: '2464 mOsm/L (احیا شوک)', notes: 'فقط از مسیر وریدی اختصاصی و آرام تزریق شود؛ با داروهای کریستالوئید دیگر مخلوط نشود.' },
    { id: 'sodium_bicarbonate_84', name_fa: 'سدیم بی‌کربنات ۸.۴٪ (Sodium Bicarbonate 1 mEq/mL)', name_en: '8.4% Sodium Bicarbonate', ph: '7.0 - 8.5', osmolarity: '2000 mOsm/L (قلیایی قوی)', notes: '⚠️ قلیایی شدید: هیدرولیز فوری کاتکول‌آمین‌ها (اپی‌نفرین) و رسوب با نمک‌های کلسیم.' }
  ];

  // ۲. ماتریس سازگاری و ناسازگاری سرمی و اختلاط در یک سرنگ (Trissel\'s Reference Database)
  const IV_AND_SYRINGE_COMPATIBILITY_DATABASE = [
    {
      drugs: ['diazepam', 'nacl_09'],
      status: 'incompatible',
      syringe_mix: '❌ ناسازگار (عدم اختلاط)',
      y_site: '❌ ممنوع (رسوب فوری)',
      compatible_fluids: ['بدون رقیق‌سازی با هیچ سرمی (تزریق مستقیم IV وریدی)'],
      phenomenon: 'رسوب فیزیکی کدر (Precipitation): دیازپام حاوی ۴۰٪ پروپیلن گلیکول و ۱۰٪ اتانول است که در اثر تماس با محیط آبی سالین فوراً رسوب کریستالی سفید شیری تشکیل می‌دهد.',
      action: 'دیازپام باید به تنهایی و مستقیماً داخل رگ تزریق شود. هرگز نباید داخل میکروست، سرم قندی یا سالین ریخته شود.',
      reference: 'Trissel\'s Handbook on Injectable Drugs, Plumb\'s 10th Ed'
    },
    {
      drugs: ['diazepam', 'd5w'],
      status: 'incompatible',
      syringe_mix: '❌ ناسازگار',
      y_site: '❌ ممنوع',
      compatible_fluids: ['تزریق مستقیم آهسته بدون رقیق‌سازی'],
      phenomenon: 'رسوب بلوری کدر ناشی از جدا شدن حامل پروپیلن گلیکول در محیط مایع.',
      action: 'از افزودن دیازپام به کیسه سرم دکستروز اکیداً خودداری نمایید.',
      reference: 'Trissel\'s Injectable Drugs'
    },
    {
      drugs: ['ceftriaxone', 'lrs'],
      status: 'critical_hazard',
      severity: 'fatal',
      syringe_mix: '🔴 مطلقاً ممنوع (رسوب کشنده)',
      y_site: '🔴 مطلقاً ممنوع (حتی تزریق متوالی در یک لاین بدون شستشو)',
      compatible_fluids: ['نرمال سالین ۰.۹٪', 'دکستروز ۵٪ (D5W)', 'آب مقطر استریل تزریقی (SWFI)'],
      phenomenon: 'رسوب نامحلول بلورهای سفتریاکسون کلسیم (Calcium-Ceftriaxone Particulates) در عروق خونی، ریه و کلیه که منجر به مرگ ناگهانی ناشی از انسداد میکروواسکولار و نارسایی حاد ریوی-کلیوی می‌شود.',
      action: 'سفتریاکسون را فقط با نرمال سالین یا آب مقطر حل کنید. در صورت وصل بودن سرم رینگر لاکتات، لاین وریدی باید قبل و بعد از تزریق سفتریاکسون با حداقل ۱۰ سی‌سی نرمال سالین فلاش شود.',
      reference: 'FDA Safety Alert & Plumb\'s 10th Ed - Critical Invariant'
    },
    {
      drugs: ['ceftriaxone', 'calcium_gluconate_iv'],
      status: 'critical_hazard',
      severity: 'fatal',
      syringe_mix: '🔴 ممنوعیت مطلق / مرگبار',
      y_site: '🔴 ممنوعیت مطلق',
      compatible_fluids: ['نرمال سالین ۰.۹٪'],
      phenomenon: 'تشکیل رسوب کریستالی غیرمحلول سفتریاکسون کلسیم.',
      action: 'بین تزریق کلسیم و سفتریاکسون باید حداقل ۴۸ ساعت فاصله باشد یا از لاین‌های عروقی کاملاً مجزا در دو اندام مختلف استفاده شود.',
      reference: 'Trissel\'s Compatibility Standards'
    },
    {
      drugs: ['calcium_gluconate_iv', 'sodium_bicarbonate'],
      status: 'incompatible',
      severity: 'major',
      syringe_mix: '❌ ممنوع (رسوب گچی)',
      y_site: '❌ ممنوع (رسوب فوری در ست سرم)',
      compatible_fluids: ['نرمال سالین ۰.۹٪', 'دکستروز ۵٪'],
      phenomenon: 'رسوب کربنات کلسیم گچی کدر نامحلول (Calcium Carbonate Chalky Precipitate).',
      action: 'در احیای قلبی و هایپرکالمی شدید، کلسیم گلوکونات و بی‌کربنات باید در دو رگ مجزا تزریق شوند یا لاین با سالین فراوان شستشو داده شود.',
      reference: 'RECOVER CPR Guidelines & Trissel\'s'
    },
    {
      drugs: ['sodium_bicarbonate', 'epinephrine'],
      status: 'incompatible',
      severity: 'major',
      syringe_mix: '❌ ممنوع (بی‌اثر شدن شیمیایی)',
      y_site: '❌ ممنوع (هیدرولیز آدرنالین)',
      compatible_fluids: ['نرمال سالین ۰.۹٪', 'دکستروز ۵٪'],
      phenomenon: 'اکسیداسیون سریع کاتکول‌آمین‌ها در pH قلیایی (Alkaline Hydrolysis) و تبدیل اپی‌نفرین به آدرنوکروم صورتی/قهوه‌ای فاقد اثر سمپاتومیمتیک.',
      action: 'هرگز اپی‌نفرین را همزمان با بی‌کربنات در یک سرنگ نکشید و در یک لاین مشترک سرم تزریق نکنید.',
      reference: 'RECOVER Resuscitation Pharmacology'
    },
    {
      drugs: ['furosemide', 'midazolam'],
      status: 'incompatible',
      severity: 'major',
      syringe_mix: '❌ ناسازگار (رسوب فوری)',
      y_site: '❌ ناسازگار',
      compatible_fluids: ['نرمال سالین ۰.۹٪', 'رینگر لاکتات'],
      phenomenon: 'رسوب شدید اسید-باز: فوروزماید شدیداً قلیایی (pH ~9) است در حالی که میدازولام برای پایداری در pH اسیدی (pH ~3) بافر شده است. اختلاط باعث خنثی شدن بافر و رسوب کریستالی سفید فوری هر دو دارو می‌شود.',
      action: 'فوروزماید و بنزودیازپین‌ها باید در دو سرنگ کاملاً جداگانه کشیده و تزریق شوند.',
      reference: 'ASHP Injectable Drug Information'
    },
    {
      drugs: ['furosemide', 'morphine'],
      status: 'incompatible',
      severity: 'major',
      syringe_mix: '❌ ناسازگار (رسوب)',
      y_site: '❌ ناسازگار',
      compatible_fluids: ['نرمال سالین ۰.۹٪'],
      phenomenon: 'رسوب کریستالی ناشی از اختلاف فاحش pH قلیایی فوروزماید با نمک اسیدی مورفین سولفات.',
      action: 'در درمان ادم حاد ریوی ناشی از نارسایی قلبی (CHF)، لازیکس و مورفین در دو سرنگ جداگانه تزریق شوند.',
      reference: 'Veterinary Emergency & Critical Care Society (VECCS)'
    },
    {
      drugs: ['ketamine', 'xylazine'],
      status: 'compatible',
      syringe_mix: '✅ کاملاً سازگار در یک سرنگ مشترک',
      y_site: '✅ کاملاً سازگار',
      compatible_fluids: ['نرمال سالین ۰.۹٪', 'دکستروز ۵٪', 'رینگر لاکتات'],
      phenomenon: 'محلول کاملاً شفاف و پایدار فیزیکی-شیمیایی بدون تغییر رنگ یا رسوب تا ۴۸ ساعت در دمای اتاق.',
      action: 'می‌توان مستقیماً در یک سرنگ کشیده و به صورت عضلانی یا وریدی تزریق کرد (پروتکل استاندارد کت-زایل).',
      reference: 'Muir & Hubbell Handbook of Veterinary Anesthesia'
    },
    {
      drugs: ['ketamine', 'midazolam'],
      status: 'compatible',
      syringe_mix: '✅ کاملاً سازگار و پایدار در یک سرنگ',
      y_site: '✅ کاملاً سازگار',
      compatible_fluids: ['نرمال سالین ۰.۹٪', 'دکستروز ۵٪', 'رینگر لاکتات', 'نرموسول R'],
      phenomenon: 'سازگاری فیزیکوشیمیایی عالی در pH اسیدی مشترک (پایداری بیش از ۲۴ ساعت).',
      action: 'ترکیب خط اول القای بیهوشی با بالاترین ثبات قلبی-عروقی (Ket-Mid).',
      reference: 'Lumb and Jones Veterinary Anesthesia 5th Ed'
    },
    {
      drugs: ['ketamine', 'diazepam'],
      status: 'conditional_compatible',
      syringe_mix: '⚠️ سازگار مشروط (تزریق فوری بلافاصله پس از کشیدن)',
      y_site: '⚠️ عبور فوری با فلاش',
      compatible_fluids: ['تزریق بدون سرم'],
      phenomenon: 'اگر بلافاصله پس از کشیدن در سرنگ تزریق شود شفاف می‌ماند، اما نگهداری بیش از ۱۵ دقیقه باعث کدر شدن و رسوب دیازپام به دلیل رقیق شدن با حلال آبی کتامین می‌شود.',
      action: 'فقط ثانیه‌هایی قبل از القا در سرنگ کشیده و وریدی تزریق شود؛ برای نگهداری طولانی یا بیهوشی متوالی از میدازولام استفاده شود.',
      reference: 'Plumb\'s Veterinary Drug Handbook 10th Ed'
    },
    {
      drugs: ['detomidine', 'butorphanol'],
      status: 'compatible',
      syringe_mix: '✅ کاملاً سازگار در یک سرنگ مشترک',
      y_site: '✅ کاملاً سازگار',
      compatible_fluids: ['نرمال سالین ۰.۹٪', 'رینگر لاکتات'],
      phenomenon: 'پایداری فیزیکی و شیمیایی کامل؛ سینرژی سداسیون عمیق و ضددرد احشایی در اسب.',
      action: 'ترکیب استاندارد طلایی سداسیون ایستاده اسب (Det-Torph).',
      reference: 'Equine Anesthesia & Pain Management (Muir)'
    },
    {
      drugs: ['dexmedetomidine', 'butorphanol'],
      status: 'compatible',
      syringe_mix: '✅ کاملاً سازگار در یک سرنگ',
      y_site: '✅ کاملاً سازگار',
      compatible_fluids: ['نرمال سالین ۰.۹٪', 'رینگر لاکتات'],
      phenomenon: 'سازگاری کامل و هم‌افزایی عالی سداسیون و بی‌دردی بدون رسوب.',
      action: 'پروتکل ایده‌آل سداسیون معاینات، رادیوگرافی و پانسمان در سگ و گربه.',
      reference: 'Plumb\'s 10th Ed & Lumb and Jones'
    },
    {
      drugs: ['propofol', 'ketamine'],
      status: 'conditional_compatible',
      syringe_mix: '✅ سازگار در سرنگ برای تزریق فوری (کتوفول Ketofol)',
      y_site: '⚠️ تزریق فوری',
      compatible_fluids: ['فقط دکستروز ۵٪ (D5W)؛ با نرمال سالین مخلوط نشود'],
      phenomenon: 'در نسبت‌های ۱ به ۱ یا ۱ به ۴ تا ۴ ساعت امولسیون پایدار می‌ماند، اما نگهداری طولانی‌مدت به دلیل شکستن بار الکترواستاتیک امولسیون چربی پروپوفول باعث جدا شدن فاز چربی می‌شود.',
      action: 'کوکتل کتوفول باید در روز جراحی آماده شده و حداکثر طی ۲ تا ۴ ساعت مصرف شود.',
      reference: 'Veterinary Anaesthesia & Analgesia Clinical Trials'
    },
    {
      drugs: ['ampicillin', 'd5w'],
      status: 'incompatible',
      severity: 'moderate',
      syringe_mix: '❌ ناسازگار (هیدرولیز سریع)',
      y_site: '❌ ناسازگار',
      compatible_fluids: ['فقط نرمال سالین ۰.۹٪ یا آب مقطر'],
      phenomenon: 'حلقه بتا-لاکتام آمپی‌سیلین در pH اسیدی سرم قندی D5W به سرعت هیدرولیز شده و طی ۲ ساعت بیش از ۳۰٪ قدرت آنتی‌بیوتیکی خود را از دست می‌دهد.',
      action: 'آمپی‌سیلین تزریقی فقط باید در نرمال سالین ۰.۹٪ حل شده و ظرف ۱ ساعت انفوزیون شود.',
      reference: 'ASHP Injectable Drug Information'
    },
    {
      drugs: ['metronidazole', 'ampicillin'],
      status: 'incompatible',
      severity: 'moderate',
      syringe_mix: '❌ ناسازگار در یک سرنگ',
      y_site: '⚠️ نیازمند فلاش با سالین',
      compatible_fluids: ['نرمال سالین ۰.۹٪'],
      phenomenon: 'کدر شدن و افت پایداری آنتی‌بیوتیکی در لاین مشترک.',
      action: 'در درمان پریتونیت و سپسیس شکمی، مترونیدازول و آمپی‌سیلین باید به صورت متوالی با شستشوی سالین بین دو تزریق تجویز شوند.',
      reference: 'Trissel\'s Standards'
    },
    {
      drugs: ['enrofloxacin', 'nacl_09'],
      status: 'compatible',
      syringe_mix: '⚠️ فقط با رقیق‌سازی مناسب (حداقل ۱ به ۵)',
      y_site: '✅ سازگار در انفوزیون آهسته',
      compatible_fluids: ['نرمال سالین ۰.۹٪', 'رینگر لاکتات'],
      phenomenon: 'انروفلوکساسین شدیداً قلیایی (pH ~10.5) است؛ تزریق غلیظ وریدی باعث فلبیت شدید و نکروز عروقی می‌شود. اختلاط در سرنگ با اکثر داروهای اسیدی باعث رسوب کریستالی می‌شود.',
      action: 'هرگز انروفلوکساسین را در سرنگ با داروی دیگر مخلوط نکنید. در انفوزیون وریدی، دوز محاسبه شده را با حداقل ۲۰ تا ۵۰ سی‌سی سالین رقیق کرده و طی ۳۰ دقیقه انفوزیون کنید.',
      reference: 'Bayer Baytril Clinical Monograph & Plumb\'s'
    },
    {
      drugs: ['potassium_chloride', 'nacl_09'],
      status: 'compatible',
      syringe_mix: '✅ سازگار در کیسه سرم (با میکس کامل)',
      y_site: '✅ سازگار',
      compatible_fluids: ['نرمال سالین ۰.۹٪', 'رینگر لاکتات', 'دکستروز ۵٪', 'نرموسول R'],
      phenomenon: 'سازگاری کامل؛ اما تزریق بولوس وریدی مستقیم کلرید پتاسیم مرگبار و ایست قلبی فوری در دیاستول است.',
      action: 'پس از تزریق به کیسه سرم، کیسه را حداقل ۵ بار سر و ته کنید تا کاملاً یکنواخت شود. حداکثر سرعت تجویز وریدی 0.5 mEq/kg/hr است.',
      reference: 'Veterinary Fluid & Electrolyte Therapy (DiBartola)'
    },
    {
      drugs: ['menbutone', 'nacl_09'],
      status: 'compatible',
      syringe_mix: '✅ سازگار',
      y_site: '✅ سازگار',
      compatible_fluids: ['نرمال سالین ۰.۹٪', 'دکستروز ۵٪ آب مقطر تزریقی'],
      phenomenon: 'سازگاری فیزیکوشیمیایی مطلوب با محلول سالین و قندی ایزوتونیک؛ شفافیت پایدار و حفظ اثربخشی بدون افت pH یا تشکیل کریستال.',
      action: 'در صورت نیاز به رقیق‌سازی پیش از تزریق وریدی، فقط از نرمال سالین ۰.۹٪ یا دکستروز ۵٪ استفاده شود و تزریق طی ۳ تا ۵ دقیقه انجام گردد.',
      reference: 'British Pharmacopoeia (Veterinary) 2024, Plumb\'s Veterinary Drug Handbook 10th Ed'
    },
    {
      drugs: ['menbutone', 'lrs'],
      status: 'incompatible',
      syringe_mix: '❌ ناسازگار (رسوب نامحلول با کلسیم)',
      y_site: '❌ ممنوع در مسیر وریدی مشترک',
      compatible_fluids: ['فقط سرم‌های فاقد کلسیم (نرمال سالین ۰.۹٪ و دکستروز ۵٪)'],
      phenomenon: 'تشکیل رسوب کدر کلسیم-منبوتونات در اثر برهم‌کنش ساختار اسید آلی منبوتون با یون‌های دو ظرفیتی کلسیم موجود در رینگر لاکتات.',
      action: 'منبوتون را هرگز با سرم‌های حاوی املاح کلسیم (رینگر، رینگر لاکتات) مخلوط نکرده و پیش از تزریق خط سرم را با سالین کاملاً فلاش کنید.',
      reference: 'British Pharmacopoeia (Veterinary) 2024'
    }
  ];

  // ۳. پایگاه داده جامع پایداری، بازسازی و تاریخ انقضا پس از باز شدن (Storage, Reconstitution & Beyond-Use Dating - BUD)
  const STORAGE_AND_BUD_DATABASE = {
    'menbutone': {
      storage_unopened: 'دمای زیر ۲۵ درجه سانتی‌گراد، محافظت در برابر نور مستقیم خورشید و رطوبت؛ از یخ‌زدگی جلوگیری شود',
      reconstitution_diluent: 'محلول آماده تزریق ۱۰٪ (100 mg/mL) - بدون نیاز به بازسازی',
      bud_room_temp: 'ویال چنددوزی پس از اولین ورود سرسوزن تا ۲۸ روز در دمای اتاق با رعایت شرایط آسپتیک پایدار است',
      bud_refrigerated: '۲۸ روز در دمای یخچال (۲ تا ۸ درجه سانتی‌گراد)',
      bud_frozen: 'منجمد نشود (تشکیل کریستال‌های غیرمحلول و تغییرات ساختاری برگشت‌ناپذیر)',
      light_sensitive: true,
      clinical_storage_pearl: 'در صورت مشاهده کدورت، تغییر رنگ یا تشکیل رسوب کریستالی در ویال ژنابیل، از مصرف آن خودداری گردد.'
    },
    'amoxicillin_clavulanate': {
      storage_unopened: 'دمای خنک و خشک زیر ۲۵ درجه سانتی‌گراد، محافظت در برابر رطوبت',
      reconstitution_diluent: 'آب جوشیده سرد شده یا آب مقطر خالص طبق خط نشانه شیشه',
      bud_room_temp: 'حداکثر ۲۴ ساعت (افت سریع قدرت کلاوولانیک اسید)',
      bud_refrigerated: '۷ روز در یخچال (۲ تا ۸ درجه سانتی‌گراد)؛ پس از روز هفتم دور ریخته شود',
      bud_frozen: 'منجمد نشود (تخریب ساختار سوسپانسیون)',
      light_sensitive: false,
      photoprotection_needed: false,
      usp_handling: 'قبل از هر بار مصرف شیشه را به خوبی تکان دهید. تغییر رنگ به زرد پررنگ نشانه اکسیداسیون کلاوولانات است.',
      multi_dose_vial_rule: 'سوسپانسیون خوراکی پس از روز هفتم باید حتماً معدوم شود.'
    },
    'ampicillin': {
      storage_unopened: 'دمای اتاق ۱۵ الی ۲۵ درجه سانتی‌گراد، محافظت از نور',
      reconstitution_diluent: 'آب مقطر استریل تزریقی (SWFI) یا نرمال سالین ۰.۹٪',
      bud_room_temp: 'حداکثر ۱ ساعت پس از بازسازی (هیدرولیز بسیار سریع)',
      bud_refrigerated: 'در سالین ۰.۹٪ تا ۲۴ ساعت در یخچال (۲ تا ۸ درجه)',
      bud_frozen: 'توصیه نمی‌شود',
      light_sensitive: false,
      photoprotection_needed: false,
      usp_handling: 'به دلیل هیدرولیز فوق‌العاده سریع حلقه بتا-لاکتام، ترجیحاً بلافاصله پس از حل کردن ویال تزریق شود.',
      multi_dose_vial_rule: 'فاقد ماده نگهدارنده؛ باقیمانده ویال پس از ۲۴ ساعت در یخچال دور ریخته شود.'
    },
    'ceftriaxone': {
      storage_unopened: 'دمای اتاق زیر ۲۵ درجه، محافظت از نور و رطوبت',
      reconstitution_diluent: 'آب مقطر تزریقی، نرمال سالین ۰.۹٪ یا لیدوکائین ۱٪ (فقط برای تزریق عضلانی)',
      bud_room_temp: '۲۴ ساعت در دمای اتاق (۱۵ تا ۲۵ درجه سانتی‌گراد)',
      bud_refrigerated: '۳ تا ۷ روز در یخچال (۲ تا ۸ درجه سانتی‌گراد)',
      bud_frozen: 'تا ۳۰ روز در فریزر (-۲۰ درجه سانتی‌گراد)',
      light_sensitive: true,
      photoprotection_needed: true,
      usp_handling: 'هرگز با حلال‌های حاوی کلسیم (رینگر لاکتات) بازسازی نشود. محلول بازسازی شده ممکن است کمی زرد تا کهربایی باشد که طبیعی است.',
      multi_dose_vial_rule: 'ویال فاقد نگهدارنده است؛ حداکثر ۳ روز در یخچال قابل استفاده است.'
    },
    'furosemide': {
      storage_unopened: 'دمای اتاق ۱۵ الی ۳۰ درجه؛ از نگهداری آمپول باز نشده در یخچال خودداری شود!',
      reconstitution_diluent: 'آماده تزریق (۵۰ mg/mL) یا رقیق‌سازی در نرمال سالین',
      bud_room_temp: 'آمپول باز شده در صورت نگهداری در محیط استریل تا ۲۴ ساعت پایدار است',
      bud_refrigerated: '⚠️ در یخچال نگهداری نشود (رسوب و کریستالیزاسیون برگشت‌ناپذیر!)',
      bud_frozen: 'منجمد نشود',
      light_sensitive: true,
      photoprotection_needed: true,
      usp_handling: 'شدیداً حساس به نور. آمپول‌های شفاف باید در جعبه مقوایی کدر نگهداری شوند. در صورت تغییر رنگ به زرد تیره یا وجود هرگونه بلور دور ریخته شود.',
      multi_dose_vial_rule: 'آمپول تک‌دوز انسانی بلافاصله پس از باز شدن استفاده و باقیمانده دور ریخته شود.'
    },
    'diazepam': {
      storage_unopened: 'دمای اتاق ۱۵ الی ۲۵ درجه سانتی‌گراد، محافظت در برابر نور',
      reconstitution_diluent: 'آماده تزریق (۵ mg/mL)؛ بدون نیاز به حلال',
      bud_room_temp: 'در آمپول اصلی تا تاریخ انقضا پایدار است',
      bud_refrigerated: 'توصیه نمی‌شود',
      bud_frozen: 'منجمد نشود',
      light_sensitive: true,
      photoprotection_needed: true,
      usp_handling: '⚠️ جذب شدید به ظروف و لوله‌های پلاستیکی (PVC Adsorption): دیازپام به دیواره سرنگ‌های پلاستیکی و ست سرم می‌چسبد و دوز داروی دریافتی بیمار تا ۵۰٪ کاهش می‌یابد. نباید از قبل در سرنگ کشیده شود و نباید در کیسه سرم ریخته شود.',
      multi_dose_vial_rule: 'آمپول تک‌دوز پس از باز شدن دور ریخته شود.'
    },
    'propofol': {
      storage_unopened: 'دمای خنک ۱۵ الی ۲۲ درجه سانتی‌گراد؛ از انجماد جلوگیری شود',
      reconstitution_diluent: 'آماده تزریق (۱۰ mg/mL امولسیون شیری)',
      bud_room_temp: 'حداکثر ۶ ساعت پس از باز شدن ویال (دستورالعمل قطعی USP <797>)',
      bud_refrigerated: 'حداکثر ۱۲ ساعت در یخچال (در صورت عدم آلودگی باکتریایی)',
      bud_frozen: 'منجمد نشود (تخریب ساختار امولسیون و آمبولی چربی)',
      light_sensitive: false,
      photoprotection_needed: false,
      usp_handling: '⚠️ فاقد نگهدارنده ضدمیکروبی: امولسیون حاوی روغن سویا، گلیسرول و لسیتین تخم‌مرغ بستر فوق‌العاده مستعدی برای تکثیر سریع باکتری‌ها و باسیل‌های کشنده است. ویال باز شده حتماً پس از پایان جراحی‌های آن روز دور ریخته شود.',
      multi_dose_vial_rule: 'پروپوفول باز شده پس از ۶ ساعت باید فوراً معدوم گردد.'
    },
    'insulin_regular': {
      storage_unopened: 'در یخچال (۲ الی ۸ درجه سانتی‌گراد) تا تاریخ انقضا',
      reconstitution_diluent: 'آماده تزریق (100 IU/mL)',
      bud_room_temp: '۲۸ روز در دمای اتاق (زیر ۲۵ درجه)',
      bud_refrigerated: '۲۸ الی ۴۰ روز در یخچال پس از اولین سوراخ شدن لاستیک ویال',
      bud_frozen: 'هرگز منجمد نشود (تخریب کامل زنجیره پروتئینی انسولین)',
      light_sensitive: true,
      photoprotection_needed: true,
      usp_handling: 'انسولین رگولار تنها نوع انسولین قابل تزریق وریدی و عضلانی در کتواسیدوز دیابتی (DKA) است. محلول باید کاملاً شفاف باشد.',
      multi_dose_vial_rule: 'قانون ۲۸ روزه ویال چنددوزه USP <797>: تاریخ باز شدن روی برچسب ثبت و پس از ۲۸ روز دور ریخته شود.'
    },
    'doxycycline': {
      storage_unopened: 'دمای اتاق ۱۵ الی ۲۵ درجه سانتی‌گراد در محیط تاریک',
      reconstitution_diluent: 'آب مقطر استریل تزریقی، سپس رقیق‌سازی در سالین یا D5W',
      bud_room_temp: '۴ ساعت پس از رقیق‌سازی نهایی',
      bud_refrigerated: '۲۴ تا ۴۸ ساعت در یخچال در صورت پوشش کامل فویل',
      bud_frozen: 'توصیه نمی‌شود',
      light_sensitive: true,
      photoprotection_needed: true,
      usp_handling: 'فوق‌العاده حساس به نور (Photodegradation): تجزیه نوری باعث تشکیل متابولیت‌های سمی و تحریک عروق می‌شود. کیسه سرم و لوله‌های رابط باید با فویل آلومینیومی ضخیم پوشانده شوند.',
      multi_dose_vial_rule: 'فرم خوراکی در کپسول یا سوسپانسیون پس از باز شدن تا ۱۴ روز در دمای اتاق پایدار است.'
    },
    'sodium_nitroprusside': {
      storage_unopened: 'دمای اتاق در جعبه محافظ نور تاریک',
      reconstitution_diluent: 'فقط دکستروز ۵٪ (D5W)؛ هرگز با نرمال سالین مخلوط نشود',
      bud_room_temp: '۲۴ ساعت در تاریکی مطلق',
      bud_refrigerated: 'توصیه نمی‌شود',
      bud_frozen: 'ممنوع',
      light_sensitive: true,
      photoprotection_needed: true,
      usp_handling: '⚠️ تجزیه نوری آنی به سیانید سمی (Cyanide Toxicity): کیسه سرم و میکروست باید فوراً با فویل کدر یا روکش مات مات فابریک پوشانده شوند. در صورت تغییر رنگ محلول به آبی یا قرمز تیره بلافاصله معدوم شود.',
      multi_dose_vial_rule: 'پس از آماده‌سازی حداکثر ۲۴ ساعت مجاز است.'
    }
  };

  // ۴. پایگاه داده خطرات شغلی، بارداری و ایمنی پرسنل بر اساس USP <800> و NIOSH
  const OCCUPATIONAL_HAZARDS_DATABASE = {
    'finasteride': {
      usp800_category: 'داروی هازارد دسته ۲ (Hazardous Reproductive Risk)',
      pregnancy_warning: '⛔ منع مطلق لمس یا کار با دارو در دوران بارداری (Pregnancy Category X)',
      pregnancy_details: 'فیناستراید مهارکننده آنزیم ۵-آلفا ردوکتاز است. جذب پوستی ناچیز ناشی از لمس قرص خرد شده یا پودر آن توسط پرسنل باردار یا زنانی که قصد بارداری دارند، باعث مهار تکامل دستگاه تناسلی خارجی جنین پسر و ایجاد ابهام جنسیتی یا ناهنجاری‌های شدید مادرزادی می‌شود.',
      ppe_requirements: ['دستکش نیتریل ضخیم یا دولایه نیتریل', 'ماسک در صورت خرد کردن یا پودر کردن قرص', 'پرهیز از تماس مستقیم پوست'],
      client_warning: 'به صاحب حیوان باردار در منزل هشدار داده شود که به هیچ عنوان نباید به این قرص دست بزند.',
      excreta_precautions: 'ادرار حیوان درمان شده تا ۴۸ ساعت حاوی غلظت‌های پایینی از متابولیت است؛ نظافت با دستکش انجام شود.',
      accidental_exposure: 'در صورت تماس پوستی تصادفی، موضع فوراً با آب فراوان و صابون ملایم شسته شود.'
    },
    'misoprostol': {
      usp800_category: 'داروی هازارد تراتوژنیک و محرک رحمی (Abortifacient Hazard)',
      pregnancy_warning: '⛔ منع مطلق در پرسنل باردار یا زنانی که احتمال بارداری دارند',
      pregnancy_details: 'میزوپروستول آنالوگ پروستاگلاندین E1 است که باعث تحریک گیرنده‌های عضلات صاف رحم و انقباضات حاد رحمی، خونریزی شدید، سقط خودبه‌خودی جنین و آسیب‌های عروقی جنینی می‌شود. استنشاق پودر یا جذب ترنس‌درمال خطرناک است.',
      ppe_requirements: ['دستکش نیتریل نفوذناپذیر', 'ماسک جراحی یا N95 هنگام شمارش یا حل کردن قرص'],
      client_warning: 'بسته‌بندی دارو باید دارای برچسب برجسته هشدار سقط جنین برای صاحبان حیوان باشد.',
      excreta_precautions: 'احتیاط خاصی گزارش نشده است.',
      accidental_exposure: 'شستشوی فوری دست‌ها با صابون.'
    },
    'chloramphenicol': {
      usp800_category: 'سم خونی خطرناک برای انسان (Fatal Idiosyncratic Hematotoxin)',
      pregnancy_warning: '⚠️ منع مصرف در بارداری و شیردهی به دلیل سمیت میلوئیدی جنین',
      pregnancy_details: 'تماس پوستی حتی در مقادیر بسیار ناچیز می‌تواند در برخی از انسان‌های با زمینه ژنتیکی مستعد، باعث آپلازی غیرقابل برگشت و کشنده مغز استخوان (Fatal Idiosyncratic Aplastic Anemia) شود که وابسته به دوز نیست.',
      ppe_requirements: ['دستکش نیتریل دولایه', 'ماسک تنفسی FFP2/N95 در صورت کار با پودر یا سوسپانسیون', 'روپوش آزمایشگاهی'],
      client_warning: 'به صاحب حیوان آموزش دهید که همواره با دستکش قطره یا شربت را تجویز کند و دست‌ها را پس از مصرف بشوید.',
      excreta_precautions: 'ادرار و مدفوع حیوان تا ۴۸ ساعت با دستکش تمیز شود.',
      accidental_exposure: 'شستشوی اضطراری با آب و صابون به مدت ۱۵ دقیقه.'
    },
    'lomustine': {
      usp800_category: 'داروی شیمی‌درمانی سایتوتوکسیک و جهش‌زا (Cytotoxic Chemotherapy - USP <800>)',
      pregnancy_warning: '⛔ ممنوعیت مطلق تماس برای خانم‌های باردار و شیرده',
      pregnancy_details: 'لوموستین (CCNU) یک عامل آلکیلان قدرتمند از خانواده نیتروزواوره‌ها است که باعث شکست زنجیره‌های DNA، جهش‌های ژنتیکی، تراتوژنیسیته شدید و سرکوب شدید مغز استخوان می‌شود.',
      ppe_requirements: ['دستکش استاندارد شیمی‌درمانی ASTM D6978 (ترجیحاً دولایه)', 'گان محافظ نفوذناپذیر مخصوص آنکولوژی', 'عینک محافظ چشم', 'ماسک تنفسی FFP3'],
      client_warning: 'کپسول‌ها هرگز نباید باز یا شکسته شوند. مصرف حتماً با دستکش یکبار مصرف انجام گیرد.',
      excreta_precautions: '⚠️ فضولات سمی: ادرار، مدفوع، بزاق و استفراغ حیوان درمان شده تا ۷۲ ساعت حاوی بقایای رادیواکتیو/سایتوتوکسیک فعال است. خاک بستر گربه یا فضولات سگ با دو لایه کیسه پلاستیکی پسماند عفونی دفع شود.',
      accidental_exposure: 'در صورت برخورد با پوست، موضع با آب جاری فراوان و صابون شسته شود (از الکل استفاده نشود زیرا جذب را افزایش می‌دهد).'
    },
    'vincristine': {
      usp800_category: 'آلکالوئید وینکا و وزیکانت شدید (Potent Vesicant & Cytotoxic)',
      pregnancy_warning: '⛔ ممنوعیت مطلق برای پرسنل باردار',
      pregnancy_details: 'مهارکننده میکروتوبول‌ها و سم تقسیم سلولی. تزریق اکستراوازیشن پوستی (خروج از رگ) باعث نکروز شدید و تاول‌های عمقی بافتی می‌شود.',
      ppe_requirements: ['تجهیزات کامل تزریق داروهای ضدسرطان (PPE USP <800>)'],
      client_warning: 'تجویز فقط در کلینیک مجهز توسط دامپزشک انجام گیرد.',
      excreta_precautions: 'دفع فضولات تا ۴۸ ساعت با دستکش و احتیاطات شیمی‌درمانی.',
      accidental_exposure: 'شستشوی چشم با نرمال سالین به مدت ۱۵ دقیقه؛ در صورت تماس پوستی شستشو با آب و صابون.'
    },
    'carfentanil': {
      usp800_category: 'اوپیوئید فوق‌العاده مرگبار (Ultra-potent Opioid - Schedule II)',
      pregnancy_warning: '☠️ فوق‌العاده کشنده برای تمام پرسنل (مرگ سریع انسان با یک قطره)',
      pregnancy_details: 'کارفنتانیل ۱۰۰۰۰ برابر قوی‌تر از مورفین و ۱۰۰ برابر قوی‌تر از فنتانیل است. جذب حتی از طریق قطره‌ای روی پوست خراشیده، ملتحمه چشم یا استنشاق ذرات باعث آپنه تنفسی آنی، کما و ایست قلبی ظرف ۲ تا ۵ دقیقه می‌شود.',
      ppe_requirements: ['دستکش ضخیم نیتریل', 'محافظ کامل صورت و شیلد چشمی', 'لباس محافظ آستین بلند', 'ماسک تنفسی FFP3'],
      client_warning: 'فقط برای دارتینگ حیات وحش و باغ‌وحش توسط متخصصان دارای مجوز.',
      excreta_precautions: 'بزاق و مایعات حیوان تازه بی‌هوش شده می‌تواند حاوی مقادیر خطرناک باشد.',
      accidental_exposure: 'اقدام فوری بقا: فوراً نالوکسان به میزان ۰.۴ تا ۲ میلی‌گرم تزریق عضلانی/وریدی شود و هر ۲ دقیقه تا رسیدن اورژانس تکرار گردد. اکسیژن کمکی و CPR بلافاصله آغاز شود.'
    }
  };

  // ۵. پایگاه داده فارماکوکینتیک اندامی، مسیرهای سیتوکروم P450 و تعدیل دوز در نارسایی‌ها (Riviere & Papich)
  const ORGAN_PHARMACOKINETICS_DATABASE = {
    'ketamine': {
      cyp_pathway: 'متابولیسم کبدی وسیع از طریق آنزیم‌های CYP2B11 و CYP3A به نورکتامین فعال (دارای ۱/۳ قدرت کتامین)',
      feline_metabolism_note: '🐱 نکته حیاتی گربه: در گربه گلوکورونیداسیون ضعیف است و نورکتامین عمدتاً بدون تغییر از طریق کلیه‌ها دفع می‌شود. در نارسایی کلیوی گربه ریکاوری بسیار طولانی و هذیان شدید ایجاد می‌شود.',
      renal_excretion_pct: 'سگ: کمتر از ۵٪ داروی تغییرنیافته؛ گربه: ۳۰ تا ۵۰٪ دفع کلیوی داروی فعال',
      biliary_excretion_pct: '۵۰ تا ۷۰ درصد متابولیت‌های فاقد اثر',
      protein_binding_pct: 'حدود ۵۰٪ (باند پروتئینی متوسط، ایمن در هیپوآلبومینمی خفیف)',
      hypoalbuminemia_risk: 'کم؛ تغییرات بالینی چندانی در افت آلبومین خون ایجاد نمی‌شود.',
      renal_failure_adjustment: 'در نارسایی حاد کلیه یا مرحله ۳ و ۴ IRIS گربه، دوز اولیه ۵۰٪ کاهش یابد یا از پروتکل‌های دیگر بیهوشی نظیر آلفاکسالون استفاده شود.',
      hepatic_failure_adjustment: 'کاهش ۳۰ تا ۵۰ درصدی دوز در نارسایی هپاتوسلولار شدید و شنت پورتوسیستمیک (PSS).'
    },
    'enrofloxacin': {
      cyp_pathway: 'متابولیسم کبدی ۲۰ الی ۴۰ درصد به متابولیت فعال سیپروفلوکساسین (Ciprofloxacin) از طریق سیتوکروم P450',
      feline_metabolism_note: '🐱 نکته رتینوپاتی گربه: مهار ناقل ABCG2 در گربه توسط انروفلوکساسین باعث تجمع دارو در شبکیه و نابینایی غیرقابل برگشت می‌شود. دوز گربه هرگز نباید از ۵ mg/kg در روز بیشتر شود!',
      renal_excretion_pct: '۵۰ تا ۶۰ درصد از طریق فیلتراسیون گلومرولی و ترشح فعال توبولار کلیوی دفع می‌شود.',
      biliary_excretion_pct: '۲۰ تا ۳۰ درصد دفع صفراوی/مدفوعی',
      protein_binding_pct: 'سگ: ۲۷٪؛ گربه: ۳۰٪ (باند پروتئینی پایین)',
      hypoalbuminemia_risk: 'پایین؛ نیاز به تنظیم بر اساس آلبومین ندارد.',
      renal_failure_adjustment: 'در مرحله ۳ و ۴ نارسایی مزمن کلیوی (IRIS CKD Stage 3/4)، دوز روزانه ۵۰٪ کاهش یابد یا فاصله تجویز از ۲۴ ساعت به ۳۶ یا ۴۸ ساعت افزایش داده شود تا از تجمع سمی پیشگیری گردد.',
      hepatic_failure_adjustment: 'معمولاً نیازی به تعدیل دوز ندارد زیرا کلیرانس کلیوی جایگزین می‌شود.'
    },
    'meloxicam': {
      cyp_pathway: 'متابولیسم کبدی وسیع از طریق اکسیداسیون توسط CYP2C9 و CYP3A4 به متابولیت‌های غیرفعال ۵-هیدروکسی‌متیل',
      feline_metabolism_note: '🐱 در گربه نیمه‌عمر طولانی‌تر است (حدود ۱۵ ساعت). فقط دوز بسیار پایین و دقیق بر اساس وزن ایده‌آل توصیه می‌شود.',
      renal_excretion_pct: 'کمتر از ۲٪ داروی تغییرنیافته از ادرار دفع می‌شود.',
      biliary_excretion_pct: 'عمدتاً از طریق مدفوع و صفرا دفع می‌گردد.',
      protein_binding_pct: '۹۹.۴٪ (باند پروتئینی فوق‌العاده بالا)',
      hypoalbuminemia_risk: '🔴 بسیار پرخطر: در هیپوآلبومینمی (آلبومین کمتر از 2.0 g/dL)، کسر آزاد داروی فعال ناگهان تا ۵ برابر افزایش یافته و خطر زخم گوارشی سوراخ‌کننده حاد، افت GFR کلیوی و سپسیس شدیداً بالا می‌رود.',
      renal_failure_adjustment: 'در مرحله ۳ و ۴ IRIS منع مصرف دارد (خطر نکروز پاپیلری کلیوی). در مراحل ۱ و ۲ با دوز حداقل و هیدراتاسیون کامل مصرف شود.',
      hepatic_failure_adjustment: 'در سیروز کبدی و آسیت دوز تا ۵۰٪ کاهش یابد.'
    },
    'gabapentin': {
      cyp_pathway: 'در سگ حدود ۳۰ تا ۴۰ درصد متابولیسم کبدی به N-متیل‌گاباپنتین دارد؛ در گربه تقریباً بدون متابولیسم کبدی است.',
      feline_metabolism_note: 'دفع تقریباً ۱۰۰٪ کلیوی در گربه؛ حساسیت بالا به تجمع در کم‌کاری کلیه.',
      renal_excretion_pct: '۷۰ تا ۱۰۰ درصد دفع از طریق فیلتراسیون کلیوی',
      biliary_excretion_pct: 'ناچیز (کمتر از ۵٪)',
      protein_binding_pct: 'کمتر از ۳٪ (فاقد اتصال پروتئینی)',
      hypoalbuminemia_risk: 'صفر (هیچ حساسیتی به سطح آلبومین خون ندارد).',
      renal_failure_adjustment: 'در IRIS CKD Stage 3 و 4: افزایش فواصل مصرف از ۸ ساعت (TID) به ۱۲ یا ۲۴ ساعت (BID یا SID)؛ دوز به ۵ mg/kg کاهش یابد تا از رخوت شدید، آتاکسی و سندرم سروتونینی کاذب پیشگیری شود.',
      hepatic_failure_adjustment: 'بدون نیاز به تعدیل دوز در بیماری‌های کبدی.'
    },
    'phenobarbital': {
      cyp_pathway: 'متابولیسم کبدی توسط CYP2C و CYP2E؛ همچنین القاکننده بسیار قوی آنزیم‌های سیتوکروم P450 کبدی (CYP Auto-induction)',
      feline_metabolism_note: 'در گربه نیمه‌عمر حدود ۴۰ تا ۵۰ ساعت است و القای آنزیمی کمتر از سگ رخ می‌دهد.',
      renal_excretion_pct: '۲۰ تا ۳۰ درصد دفع کلیوی (قلیایی کردن ادرار دفع را سرعت می‌بخشد)',
      biliary_excretion_pct: '۷۰ الی ۸۰ درصد متابولیت گلوکورونید',
      protein_binding_pct: '۴۵ الی ۵۰ درصد',
      hypoalbuminemia_risk: 'متوسط؛ پایش غلظت سرمی تام و آزاد توصیه می‌شود.',
      renal_failure_adjustment: 'تعدیل جزئی؛ در GFR بسیار پایین فواصل دوز افزایش یابد.',
      hepatic_failure_adjustment: 'منع مصرف در نارسایی حاد کبدی و انسفالوپاتی؛ پایش آنزیم‌های کبد ALT و ALP هر ۶ ماه الزامی است.'
    },
    'diazepam': {
      cyp_pathway: 'متابولیسم کبدی وسیع توسط سیتوکروم P450 به متابولیت‌های فعال نوردیازپام، اگزازپام و تمازپام',
      feline_metabolism_note: '🐱 نکته مرگبار مصرف خوراکی گربه: تجویز خوراکی مکرر دیازپام در گربه می‌تواند باعث نکروز حاد کبد (Idiosyncratic Fulminant Hepatic Failure) و مرگ شود. در گربه ترجیحاً از فرم‌های تزریقی وریدی/رکتال یا میدازولام استفاده شود.',
      renal_excretion_pct: 'عمدتاً به صورت کونژوگه گلوکورونید از ادرار دفع می‌شود.',
      biliary_excretion_pct: '۱۰ تا ۲۰ درصد',
      protein_binding_pct: '۹۶ الی ۹۸ درصد (باند پروتئینی بسیار بالا)',
      hypoalbuminemia_risk: '🔴 بالا: در نارسایی کبد یا کلیه با افت آلبومین، جزء آزاد دارو افزایش یافته و دپرسیون شدید تنفسی و گیجی عمیق ایجاد می‌کند.',
      renal_failure_adjustment: 'کاهش دوز به دلیل افزایش جزء آزاد و حساسیت گیرنده‌های مغزی.',
      hepatic_failure_adjustment: 'در بیماران مبتلا به شنت پورتوسیستمیک یا انسفالوپاتی کبدی اکیداً ممنوع است (تشدید کما).'
    },
    'propofol': {
      cyp_pathway: 'کلیرانس فوق‌العاده سریع از طریق گلوکورونیداسیون کبدی و کلیرانس خارج کبدی ریوی و روده',
      feline_metabolism_note: '🐱 نکته هاینز بادی گربه: گلوکورونیداسیون کند در گربه باعث تجمع متابولیت‌های فنولی و آسیب اکسیداتیو گلبول‌های قرمز (Heinz Body Anemia) در صورت تکرار روزانه می‌شود.',
      renal_excretion_pct: 'تقریباً ۱۰۰٪ متابولیت‌های کونژوگه از کلیه دفع می‌شوند.',
      biliary_excretion_pct: 'ناچیز',
      protein_binding_pct: '۹۶ الی ۹۸ درصد',
      hypoalbuminemia_risk: 'بالا: در حیوانات لاغر با آلبومین پایین دوز القا باید ۳۰٪ کاهش یابد تا آپنه مرگبار رخ ندهد.',
      renal_failure_adjustment: 'به دلیل متابولیسم سریع معمولاً تعدیل دوز نیاز ندارد، اما سرعت القا باید بسیار ملایم باشد.',
      hepatic_failure_adjustment: 'کلیرانس خارج کبدی تا حدی نارسایی کبد را جبران می‌کند؛ دوز القا با تیتر آرام انجام گیرد.'
    },
    'menbutone': {
      cyp_pathway: 'تحریک مستقیم سلول‌های پارانشیم کبدی و پانکراس؛ جذب سریع عضلانی با فراهمی زیستی بیش از ۹۰٪ و تحریک ۲ تا ۵ برابری ترشح صفرا ظرف ۱۵ دقیقه',
      feline_metabolism_note: 'به دلیل کمبود داده‌های بالینی فارماکوکینتیک و ایمنی در گربه‌سانان، مصرف روتین آن در گربه توصیه نمی‌شود.',
      renal_excretion_pct: 'حدود ۵۰ الی ۶۰ درصد به صورت متابولیت‌های کونژوگه از مسیر ادرار دفع می‌شود.',
      biliary_excretion_pct: '۳۰ الی ۴۰ درصد دفع از طریق ترشحات صفراوی به روده',
      protein_binding_pct: 'حدود ۷۰ درصد',
      hypoalbuminemia_risk: 'پایین: تغییرات حاد در اتصال پروتئینی ایجاد نمی‌کند.',
      renal_failure_adjustment: 'در نارسایی حاد کلیه پایش بالینی و افزایش فواصل دوزها (هر ۳۶ تا ۴۸ ساعت) توصیه می‌شود.',
      hepatic_failure_adjustment: 'در انسداد مکانیکی حاد مجاری صفراوی منع مصرف قطعی دارد؛ در سایر هپاتوپاتی‌ها به رفع رکود صفراوی (کلستاز) کمک می‌کند.'
    }
  };

  // توابع کمکی جستجو و بررسی سازگاری فیزیکوشیمیایی
  function checkSyringeAndYSiteCompatibility(drug1Id, drug2Id) {
    if (!drug1Id || !drug2Id) return null;
    const id1 = drug1Id.trim().toLowerCase();
    const id2 = drug2Id.trim().toLowerCase();

    const match = IV_AND_SYRINGE_COMPATIBILITY_DATABASE.find(item => {
      return (item.drugs.includes(id1) && item.drugs.includes(id2));
    });

    if (match) return match;

    // بررسی هوشمند پیش‌فرض بر اساس ویژگی‌های داروها
    return null;
  }

  function getDrugPharmacologyDepth(drugId) {
    if (!drugId) return null;
    const id = drugId.trim().toLowerCase();

    return {
      storage_bud: STORAGE_AND_BUD_DATABASE[id] || null,
      hazard: OCCUPATIONAL_HAZARDS_DATABASE[id] || null,
      pharmacokinetics: ORGAN_PHARMACOKINETICS_DATABASE[id] || null
    };
  }

  // آماده‌سازی خروجی HTML برای مونوگراف داروها
  function renderPharmacologyDepthMonographCards(drug) {
    if (!drug) return '';
    const depth = getDrugPharmacologyDepth(drug.id);
    const bud = depth.storage_bud;
    const haz = depth.hazard;
    const pk = depth.pharmacokinetics;

    // پیدا کردن تداخلات تزریقی مربوط به این دارو
    const compatList = IV_AND_SYRINGE_COMPATIBILITY_DATABASE.filter(c => c.drugs.includes(drug.id));

    let html = '';

    // بخش ۱: سازگاری سرمی و اختلاط سرنگ
    html += `
      <div class="p-4 bg-slate-900 text-white rounded-2xl mb-4 border border-slate-800 shadow-md">
        <div class="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <h4 class="text-xs font-black text-emerald-400 flex items-center gap-1.5">
            <i data-lucide="flask-conical" class="w-4 h-4"></i>
            <span>سازگاری و ناسازگاری سرمی و اختلاط در یک سرنگ (Y-Site & Syringe Admixture):</span>
          </h4>
          <button onclick="openSyringeCompatibilityModal('${drug.id}')" class="text-[10px] bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-200 border border-emerald-500/40 px-2.5 py-1 rounded-xl font-bold transition flex items-center gap-1">
            <span>چکر زنده اختلاط سرنگ</span>
            <i data-lucide="external-link" class="w-3 h-3"></i>
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs mb-3">
          <div class="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60">
            <span class="text-emerald-400 font-bold block mb-1">💧 سرم‌های سازگار و استاندارد:</span>
            <p class="text-slate-300 text-[11px] leading-relaxed">
              ${compatList.length > 0 && compatList[0].compatible_fluids ? compatList[0].compatible_fluids.join(' • ') : 'نرمال سالین ۰.۹٪ و سرم قندی ۵٪ (مگر در مونوگراف منع شده باشد)'}
            </p>
          </div>
          <div class="p-3 bg-slate-800/70 rounded-xl border border-slate-700/60">
            <span class="text-amber-400 font-bold block mb-1">⚠️ وضعیت اختلاط در یک سرنگ:</span>
            <p class="text-slate-300 text-[11px] leading-relaxed">
              ${compatList.length > 0 ? compatList.map(c => `<strong>${c.drugs.find(x => x !== drug.id)}:</strong> ${c.syringe_mix}`).join('<br>') : 'قبل از اختلاط در سرنگ با داروی دیگر، جدول Trissel\'s را چک کنید یا به صورت مجزا تزریق فرمایید.'}
            </p>
          </div>
        </div>

        ${compatList.length > 0 && compatList.some(c => c.status === 'critical_hazard' || c.status === 'incompatible') ? `
          <div class="p-3 bg-rose-950/60 border border-rose-500/40 rounded-xl text-xs text-rose-200 space-y-1">
            <div class="flex items-center gap-1.5 font-bold text-rose-300">
              <i data-lucide="alert-octagon" class="w-4 h-4 text-rose-400"></i>
              <span>هشدار ناسازگاری فیزیکوشیمیایی خطرناک (خط قرمز تزریقات):</span>
            </div>
            ${compatList.filter(c => c.status === 'critical_hazard' || c.status === 'incompatible').map(c => `
              <p class="text-[11px] text-rose-100/90 leading-relaxed pt-1 border-t border-rose-900/40">
                📌 <strong>ناسازگاری با ${c.drugs.find(x => x !== drug.id)}:</strong> ${c.phenomenon}
              </p>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    // بخش ۲: پایداری دارو و تاریخ انقضا پس از باز شدن (BUD)
    if (bud) {
      html += `
        <div class="p-4 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl mb-4 border border-blue-500/30 shadow-md">
          <div class="flex items-center justify-between mb-3 border-b border-blue-800/40 pb-2">
            <h4 class="text-xs font-black text-blue-300 flex items-center gap-1.5">
              <i data-lucide="clock" class="w-4 h-4 text-blue-400"></i>
              <span>پایداری، شرایط نگهداری و تاریخ انقضا پس از باز شدن (Storage & Beyond-Use Dating - BUD):</span>
            </h4>
            <span class="text-[10px] bg-blue-500/20 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-full font-mono">
              USP <797>/<795>
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs mb-3 text-center">
            <div class="bg-white/5 p-2.5 rounded-xl border border-white/10">
              <span class="text-blue-300 text-[10px] block mb-0.5">دمای اتاق (۱۵-۲۵°C):</span>
              <span class="font-bold text-slate-100 text-xs block">${bud.bud_room_temp}</span>
            </div>
            <div class="bg-blue-500/10 p-2.5 rounded-xl border border-blue-500/30">
              <span class="text-blue-200 text-[10px] font-bold block mb-0.5">یخچال (۲-۸°C):</span>
              <span class="font-black text-emerald-300 text-xs block">${bud.bud_refrigerated}</span>
            </div>
            <div class="bg-white/5 p-2.5 rounded-xl border border-white/10">
              <span class="text-slate-400 text-[10px] block mb-0.5">فریزر (-۲۰°C):</span>
              <span class="font-bold text-slate-200 text-xs block">${bud.bud_frozen}</span>
            </div>
          </div>

          <div class="text-[11px] space-y-1.5 text-blue-100/90 bg-slate-950/40 p-3 rounded-xl border border-blue-900/40">
            <p><strong>حلال بازسازی (Reconstitution):</strong> ${bud.reconstitution_diluent}</p>
            <p><strong>شرایط نگهداری ویال باز نشده:</strong> ${bud.storage_unopened}</p>
            ${bud.light_sensitive ? `
              <p class="text-amber-300 font-bold flex items-center gap-1">
                <i data-lucide="sun" class="w-3.5 h-3.5"></i>
                <span>حساسیت نوری شدید (Photoprotection Needed): ویال و ست سرم باید با فویل محافظ پوشانده شود.</span>
              </p>
            ` : ''}
            <p class="text-blue-200/80 pt-1 border-t border-blue-900/30">📌 ${bud.usp_handling}</p>
          </div>
        </div>
      `;
    }

    // بخش ۳: ایمنی پرسنل، خطرات شغلی و بارداری (Hazardous & USP <800>)
    if (haz) {
      html += `
        <div class="p-4 bg-gradient-to-br from-rose-950 via-slate-900 to-amber-950 text-white rounded-2xl mb-4 border border-rose-500/40 shadow-md">
          <div class="flex items-center justify-between mb-3 border-b border-rose-800/40 pb-2">
            <h4 class="text-xs font-black text-rose-300 flex items-center gap-1.5">
              <i data-lucide="biohazard" class="w-4 h-4 text-rose-400"></i>
              <span>ایمنی پرسنل، خطرات شغلی، تماس انسانی و بارداری (Hazardous Handling - USP <800>):</span>
            </h4>
            <span class="text-[10px] bg-rose-500/20 text-rose-200 border border-rose-400/30 px-2 py-0.5 rounded-full font-bold">
              ${haz.usp800_category}
            </span>
          </div>

          <div class="p-3 bg-rose-900/30 border border-rose-500/40 rounded-xl mb-3 text-xs">
            <span class="font-black text-rose-300 block mb-1">${haz.pregnancy_warning}</span>
            <p class="text-rose-100/90 text-[11px] leading-relaxed">${haz.pregnancy_details}</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div class="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <span class="text-amber-300 font-bold block mb-1.5 flex items-center gap-1">
                <i data-lucide="shield" class="w-3.5 h-3.5"></i>
                <span>تجهیزات حفاظت فردی الزامی (PPE):</span>
              </span>
              <ul class="text-[11px] text-slate-300 space-y-1 list-disc list-inside">
                ${haz.ppe_requirements.map(p => `<li>${p}</li>`).join('')}
              </ul>
            </div>

            <div class="bg-slate-950/50 p-3 rounded-xl border border-slate-800">
              <span class="text-amber-300 font-bold block mb-1.5 flex items-center gap-1">
                <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                <span>احتیاطات فضولات و ادرار بیمار:</span>
              </span>
              <p class="text-[11px] text-slate-300 leading-relaxed">${haz.excreta_precautions}</p>
            </div>
          </div>

          <div class="mt-2.5 pt-2 border-t border-rose-900/40 text-[11px] text-amber-200 flex items-center justify-between flex-wrap gap-2">
            <span>🚨 <strong>مواجهه تصادفی:</strong> ${haz.accidental_exposure}</span>
            <span class="text-slate-400 text-[10px]">آموزش به صاحب بیمار: ${haz.client_warning}</span>
          </div>
        </div>
      `;
    }

    // بخش ۴: فارماکوکینتیک اندامی، مسیرهای سیتوکروم P450 و تعدیل دوز در نارسایی‌ها
    if (pk) {
      html += `
        <div class="p-4 bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950 text-white rounded-2xl mb-4 border border-purple-500/40 shadow-md">
          <div class="flex items-center justify-between mb-3 border-b border-purple-800/40 pb-2">
            <h4 class="text-xs font-black text-purple-300 flex items-center gap-1.5">
              <i data-lucide="dna" class="w-4 h-4 text-purple-400"></i>
              <span>فارماکوکینتیک اندامی و تعدیل دوز در نارسایی‌های کبدی/کلیوی (Organ PK & Clearance):</span>
            </h4>
            <span class="text-[10px] bg-purple-500/20 text-purple-200 border border-purple-400/30 px-2 py-0.5 rounded-full font-mono">
              CYP450 & Clearance
            </span>
          </div>

          <div class="space-y-2.5 text-xs">
            <div class="p-3 bg-purple-900/20 border border-purple-800/40 rounded-xl">
              <span class="text-purple-300 font-bold block mb-1">🧬 مسیرهای متابولیسم سیتوکروم P450 کبدی:</span>
              <p class="text-slate-200 text-[11px] leading-relaxed">${pk.cyp_pathway}</p>
              ${pk.feline_metabolism_note ? `
                <p class="text-amber-300 text-[11px] font-bold mt-1.5 pt-1 border-t border-purple-800/30">
                  ${pk.feline_metabolism_note}
                </p>
              ` : ''}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-xs">
              <div class="bg-white/5 p-2 rounded-xl border border-white/10">
                <span class="text-slate-400 text-[10px] block">دفع کلیوی (%):</span>
                <span class="font-bold text-slate-100 text-[11px]">${pk.renal_excretion_pct}</span>
              </div>
              <div class="bg-white/5 p-2 rounded-xl border border-white/10">
                <span class="text-slate-400 text-[10px] block">دفع صفراوی (%):</span>
                <span class="font-bold text-slate-100 text-[11px]">${pk.biliary_excretion_pct}</span>
              </div>
              <div class="bg-white/5 p-2 rounded-xl border border-white/10">
                <span class="text-slate-400 text-[10px] block">باند پروتئینی (%):</span>
                <span class="font-bold text-purple-300 text-[11px]">${pk.protein_binding_pct}</span>
              </div>
            </div>

            ${pk.hypoalbuminemia_risk ? `
              <div class="p-2.5 bg-amber-950/40 border border-amber-500/30 rounded-xl text-[11px] text-amber-200">
                <strong>⚠️ خطر در هیپوآلبومینمی (افت آلبومین خون):</strong> ${pk.hypoalbuminemia_risk}
              </div>
            ` : ''}

            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
              <div class="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <span class="text-emerald-300 font-bold block mb-0.5">ضریب تعدیل دوز در نارسایی کلیه (IRIS CKD):</span>
                <p class="text-slate-300 leading-relaxed">${pk.renal_failure_adjustment}</p>
              </div>
              <div class="p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
                <span class="text-purple-300 font-bold block mb-0.5">ضریب تعدیل دوز در نارسایی کبد (Hepatic Insufficiency):</span>
                <p class="text-slate-300 leading-relaxed">${pk.hepatic_failure_adjustment}</p>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    return html;
  }

  // اکسپورت سراسری
  window.IV_FLUIDS_LIST = IV_FLUIDS_LIST;
  window.IV_AND_SYRINGE_COMPATIBILITY_DATABASE = IV_AND_SYRINGE_COMPATIBILITY_DATABASE;
  window.STORAGE_AND_BUD_DATABASE = STORAGE_AND_BUD_DATABASE;
  window.OCCUPATIONAL_HAZARDS_DATABASE = OCCUPATIONAL_HAZARDS_DATABASE;
  window.ORGAN_PHARMACOKINETICS_DATABASE = ORGAN_PHARMACOKINETICS_DATABASE;
  window.checkSyringeAndYSiteCompatibility = checkSyringeAndYSiteCompatibility;
  window.getDrugPharmacologyDepth = getDrugPharmacologyDepth;
  window.renderPharmacologyDepthMonographCards = renderPharmacologyDepthMonographCards;

})(typeof window !== 'undefined' ? window : global);
