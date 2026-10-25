/**
 * لاجیک برنامه وت‌دوز (VetDose Veterinary Clinical Formulary & Decision Support Logic)
 */

let currentCategory = 'all';
let currentSpecies = 'all';
let currentTherapeuticCategory = 'all';
let searchQuery = '';
let activeMonographDrug = null;
let currentPatientWeight = 10; // پیش‌فرض وزن بیمار: ۱۰ کیلوگرم

// فراداده جامع ۹ گونه جانوری در کارت بالینی وت‌دوز (VetDose)
const CARD_SPECIES_META = {
  canine: { key: 'canine', label: 'سگ', icon: '🐶' },
  feline: { key: 'feline', label: 'گربه', icon: '🐱' },
  equine: { key: 'equine', label: 'اسب', icon: '🐎' },
  bovine: { key: 'bovine', label: 'گاو', icon: '🐄' },
  ovine_caprine: { key: 'ovine_caprine', label: 'گوسفند/بز', icon: '🐑' },
  poultry: { key: 'poultry', label: 'طیور', icon: '🐔' },
  camelids: { key: 'camelids', label: 'شترسانان', icon: '🐪' },
  aquatics: { key: 'aquatics', label: 'آبزیان', icon: '🐟' },
  wildlife: { key: 'wildlife', label: 'حیات وحش', icon: '🦁' }
};

// =================================================================
// 🔬 پایگاه دانش و تصمیم‌یار بالینی پروتکل‌های فوق‌تخصصی پلامبز (۷ حوزه درون‌دارویی)
// =================================================================
const DRUG_SPECIALTY_KNOWLEDGE = {
  // ۱. انکولوژی و شیمی‌درمانی (Oncology & BSA)
  oncology: {
    vincristine: { stdDose: 0.7, unit: 'mg/m²', stockConc: 1.0, maxDoseMg: 2.0, protocols: ['chop_lymphoma_canine', 'cop_lymphoma_protocol', 'feline_lymphoma_cop_rescue'], pearl: 'حداکثر دوز در سگ‌های بزرگ ۲ میلی‌گرم است؛ نشت خارج وریدی (Extravasation) مساوی با اسلافینگ شدید بافت است. گیت‌وی ANC بالای ۳۰۰۰.' },
    doxorubicin: { stdDose: 30, unit: 'mg/m²', stockConc: 2.0, maxCumulative: 180, protocols: ['chop_lymphoma_canine'], pearl: 'حداکثر دوز تجمعی ۱۸۰ الی ۲۴۰ mg/m² به دلیل کاردیومیوپاتی اتساعی (DCM)؛ در سگ‌های زیر ۱۰ کیلوگرم با دوز 1 mg/kg تجویز شود. در گربه سمیت کلیوی دارد.' },
    cyclophosphamide: { stdDose: 200, unit: 'mg/m²', stockConc: 20.0, protocols: ['chop_lymphoma_canine', 'cop_lymphoma_protocol'], pearl: 'همراه با فوروزماید (1 mg/kg IV) و دسترسی آزاد به آب مصرف شود تا از سیستیت هموراژیک استریل ناشی از اکرولئین پیشگیری گردد.' },
    carboplatin: { stdDose: 300, unit: 'mg/m²', stockConc: 10.0, protocols: ['osteosarcoma_carboplatin'], pearl: 'در گربه دوز ۲۰۰ الی ۲۴۰ mg/m² است (برخلاف سیس‌پلاتین که در گربه مطلقاً کشنده است، کاربوپلاتین در گربه ایمن است). ارزیابی نادیر پلاکت‌ها در روز ۱۴ الزامی است.' },
    lomustine: { stdDose: 60, unit: 'mg/m²', stockConc: 40.0, protocols: ['ccnu_lasparaginase_rescue'], pearl: 'داروی خوراکی سیتوتوکسیک؛ همراه با SAMe (دنوسیل) جهت پیشگیری از سمیت کبدی کشنده CCNU تجویز شود.' },
    l_asparaginase: { stdDose: 400, unit: 'IU/kg', stockConc: 10000, protocols: ['ccnu_lasparaginase_rescue'], pearl: 'تزریق عضلانی (IM) یا زیرجلدی (SC) جهت کاهش خطر آنافیلاکسی نسبت به تزریق وریدی ارجحیت دارد.' },
    vinblastine: { stdDose: 2.0, unit: 'mg/m²', stockConc: 1.0, protocols: ['mct_vinblastine_prednisolone'], pearl: 'انتخاب اول در تومورهای ماست‌سل (MCT)؛ سمیت گوارشی کمتر از وینکریستین.' },
    mitoxantrone: { stdDose: 5.0, unit: 'mg/m²', stockConc: 2.0, protocols: ['tcc_bladder_mitoxantrone_piroxicam'], pearl: 'انتخاب اول در کارسینوم سلول بینابینی مثانه (TCC) همراه با پیروکسیکام؛ عوارض قلبی بسیار کمتر از دوکسوروبیسین.' },
    toceranib_phosphate: { stdDose: 2.75, unit: 'mg/kg', stockConc: 10.0, protocols: ['mct_vinblastine_prednisolone'], pearl: 'مهارکننده گیرنده تیروزین کیناز در ماست‌سل تومور؛ پایش ترومبوز و پروتئینوری ادرار الزامی است.' },
    chlorambucil: { stdDose: 4.0, unit: 'mg/m²', stockConc: 2.0, protocols: ['feline_lymphoma_cop_rescue'], pearl: 'عامل آلکیله‌کننده ملایم در لنفوم با درجه تمایز کم (Small cell) روده گربه و سرکوب ایمنی بیماری‌های خودایمنی.' },
    melphalan: { stdDose: 2.0, unit: 'mg/m²', stockConc: 2.0, pearl: 'انتخاب طلایی در مولتیپل میلوما (Multiple Myeloma) سگ و گربه.' }
  },

  // ۲. بیهوشی، آرام‌بخشی و انفوزیون مداوم (Anesthesia, Sedation & CRI)
  cri: {
    lidocaine: { stdRate: 30, unit: 'mcg/kg/min', stockConc: 20, protocols: ['gdv_pre_post_op_lidocaine', 'multimodal_flk_mlk_cri'], pearl: 'ضد آریتمی بطنی (VPC/VT) و مسکن احشایی قوی در ایلئوس و GDV سگ. در گربه منع مصرف نسبی به دلیل مسمومیت حاد سیستمیک (LAST).' },
    ketamine: { stdRate: 5, unit: 'mcg/kg/min', stockConc: 100, protocols: ['multimodal_flk_mlk_cri', 'equine_gkx_triple_drip', 'ruminant_gk_double_drip'], pearl: 'مسکن NMDA ساب‌آنستتیک و مهار پدیده Wind-up درد مزمن و جراحی. کاهش ۳۰٪ تا ۵۰٪ نیاز به گاز بیهوشی (MAC-sparing).' },
    propofol: { stdRate: 0.2, unit: 'mg/kg/min', stockConc: 10, protocols: ['propofol_tiva_dog_cat'], pearl: 'پروتکل بیهوشی کامل وریدی (TIVA) بدون گاز در جراحی‌های مغز و برونکوسکوپی؛ پایش تنفس و اکسیژن‌رسانی الزامی است.' },
    alfaxalone: { stdRate: 0.1, unit: 'mg/kg/min', stockConc: 10, protocols: ['alfaxalone_tiva'], pearl: 'انتخاب اول بیهوشی وریدی TIVA در گربه‌ها و بیماران قلبی؛ ثبات همودینامیک فوق‌العاده.' },
    fentanyl: { stdRate: 5, unit: 'mcg/kg/hr', stockConc: 0.05, protocols: ['multimodal_flk_mlk_cri'], pearl: 'ضد درد اوپیوئیدی فوق‌قوی خالص گیرنده مو؛ نیازمند ونتیلاسیون کمکی در صورت هایپوونتیلاسیون.' },
    metoclopramide: { stdRate: 1.5, unit: 'mg/kg/day', stockConc: 5, pearl: 'پروکینتیک روده و ضدتهوع پیوسته در پاروویروس و پانکراتیت سگ و گربه.' },
    dexmedetomidine: { stdRate: 1, unit: 'mcg/kg/hr', stockConc: 0.5, pearl: 'آرام‌بخشی میکرو-دوز ICU و بی‌دردی احشایی؛ منع مصرف همزمان با آتروپین به دلیل هیپرتانسیون جهشی.' },
    dopamine: { stdRate: 5, unit: 'mcg/kg/min', stockConc: 40, protocols: ['septic_shock_vasopressors'], pearl: 'اینوتروپ و وازوپرسور در شوک کاردیوژنیک و افت فشار خون حین بیهوشی.' },
    dobutamine: { stdRate: 5, unit: 'mcg/kg/min', stockConc: 12.5, pearl: 'اینوتروپ مثبت بتا-۱ انتخابی در نارسایی انقباضی میوکارد سگ و اسب.' },
    norepinephrine: { stdRate: 0.5, unit: 'mcg/kg/min', stockConc: 1.0, protocols: ['septic_shock_vasopressors'], pearl: 'وازوپرسور خط اول شوک سپتیک مقاوم به مایعات در ICU.' },
    insulin_regular: { stdRate: 0.05, unit: 'U/kg/hr', stockConc: 100, protocols: ['dka_regular_insulin_cri'], pearl: 'انفوزیون مداوم در کتواسیدوز دیابتی (DKA)؛ پایش ساعتی قند خون و پتاسیم.' },
    furosemide: { stdRate: 0.5, unit: 'mg/kg/hr', stockConc: 50, pearl: 'انفوزیون پیوسته در ادم ریه حاد سگ‌های مبتلا به CHF مقاوم به دوزهای منقطع.' }
  },

  // ۳. مراقبت‌های ویژه و احیای اورژانس (ICU & Critical Care)
  icu: {
    epinephrine: { title: '🚨 پروتکل احیای قلبی-ریوی (RECOVER CPR 2024)', dose: 'Low-Dose: 0.01 mg/kg IV/IO هر ۴ دقیقه (۱ سی‌سی محلول ۱:۱۰,۰۰۰ برای ۱۰ کیلو)', warning: 'دوز بالا (0.1 mg/kg) فقط در آسیستول طولانی بالای ۱۰ دقیقه به علت وازوکانستریکشن شدید عروق مغز مجاز است.' },
    atropine: { title: '🚨 برادی‌کاردی شدید، اسیستول و ایست واگال (RECOVER CPR)', dose: '0.04 mg/kg IV/IO (معادل ۰.۸ سی‌سی از ویال ۰.۵ mg/mL برای ۱۰ کیلو)', warning: 'تکرار پس از ۴ دقیقه در صورت عدم پاسخ؛ در تاکی‌کاردی بطنی یا فیبریلاسیون اکیداً ممنوع است.' },
    norepinephrine: { title: '🚨 وازوپرسور خط اول شوک سپتیک مقاوم به مایعات', dose: '0.1 - 2.0 mcg/kg/min وریدی پیوسته CRI', warning: 'تجویز از کاتتر وریدی مرکزی (CVC) جهت جلوگیری از اسلافینگ نکروتیک بافت.' },
    dopamine: { title: '🚨 شوک کاردیوژنیک و نارسایی انقباضی میوکارد', dose: '5 - 10 mcg/kg/min وریدی CRI', warning: 'در دوزهای بالای ۱۰ میکروگرم سبب تاکی‌آریتمی و انقباض عروق کلیه می‌شود.' },
    vasopressin: { title: '🚨 جایگزین اپی‌نفرین در آسیستول مقاوم (RECOVER CPR)', dose: '0.8 U/kg IV/IO تک‌دوز', warning: 'در محیط‌های شدیداً اسیدوتیک ایست قلبی بر خلاف اپی‌نفرین اثربخشی خود را حفظ می‌کند.' },
    calcium_gluconate: { title: '🚨 محافظت قلبی در هیپرکالمی کشنده (FLUTD)', dose: '0.5 - 1.5 mL/kg از محلول ۱۰٪ IV آهسته طی ۱۰ تا ۲۰ دقیقه', warning: 'غلظت پتاسیم را پایین نمی‌آورد؛ صرفاً میوکارد را در برابر فیبریلاسیون بطنی محافظت می‌کند. مانیتورینگ ECG الزامی است.' },
    dextrose: { title: '🚨 تریاژ اورژانس شوک هیپوگلیسمی و سپسیس', dose: '1 - 2 mL/kg از دکستروز ۵۰٪ رقیق‌شده ۱:۱ با نرمال سالین (محلول ۲۵٪) IV آهسته', warning: 'تزریق رقیق‌نشده باعث فلبیت حاد و ترومبوز عروق می‌شود.' },
    insulin_regular: { title: '🚨 پروتکل CRI اورژانس کتواسیدوز دیابتی (DKA)', dose: '0.05 - 0.1 U/kg/hr وریدی پیوسته CRI', warning: '۵۰ سی‌سی اول سرم حاوی انسولین دور ریخته شود زیرا انسولین به جداره پلاستیکی سرم متصل می‌شود.' },
    mannitol: { title: '🚨 ترومای سر و کاهش فشار داخل جمجمه (ICP)', dose: '0.5 - 1.0 g/kg (۲.۵ تا ۵ mL/kg از محلول ۲۰٪) IV طی ۱۵ دقیقه با فیلتر', warning: 'در بیماران هیپوولمیک یا دارای خونریزی فعال داخل مغز ممنوع است.' },
    fomepizole: { title: '🚨 پادزهر طلایی مسمومیت کشنده با ضدیخ (اتیلن گلایکول)', dose: 'سگ: 20 mg/kg IV بار اول، سپس 15 mg/kg در ساعت‌های ۱۲ و ۲۴', warning: 'شروع در کمتر از ۵ ساعت اول اثربخشی ۱۰۰٪ دارد؛ در گربه دوز بالاتر (125 mg/kg) نیاز است.' },
    naloxone: { title: '🚨 پادزهر فوری دپرسیون تنفسی اپیوئیدها', dose: '0.04 mg/kg IV/IM/IN', warning: 'نیمه‌عمر نالوکسان کوتاه‌تر از مورفین و متادون است؛ پایش مداوم تنفس و تکرار دوز در صورت بازگشت آپنه الزامی است.' },
    atipamezole: { title: '🚨 رِوِرسال اورژانس آلفا-۲ آگونیست‌ها (آنتی‌سدان)', dose: 'عضلانی (IM) به حجم مساوی دکسمدتومازین یا ۵ برابر دوز میلی‌گرمی مدتومازین', warning: 'تزریق وریدی سریع خطر کلاپس عروقی و تاکی‌کاردی جهشی دارد؛ تزریق عضلانی الزامی است.' },
    intralipid: { title: '🚨 اینترالیپید ۲۰٪ (Lipid Rescue) در مسمومیت‌های چربی‌دوست', dose: '1.5 mL/kg IV بلوس طی ۱ دقیقه، سپس 0.25 mL/kg/min انفوزیون طی ۳۰ تا ۶۰ دقیقه', warning: 'اختصاصی مسمومیت با پیرتروئیدها در گربه، آیورمکتین در سگ‌های MDR1 و سموم چربی‌دوست.' }
  },

  // ۴. شترسانان (Camelids Knowledge)
  camelids: {
    tilmicosin: { fatal: true, alert: '🔴 منع مصرف مطلق و کشنده: تزریق تیلمیکوزین در شتر، لاما و آلپاکا باعث مسمومیت حاد قلبی، افت کلسیم میوسیت‌ها و مرگ ناگهانی می‌شود.' },
    flunixin: { caution: true, dose: '1.1 - 2.2 mg/kg IV/IM', alert: '⚠️ احتیاط شدید: شترسانان به اولسراسیون و سوراخ‌شدگی محفظه سوم معده (C3 Ulcer) و نکروز پاپیلای کلیه بسیار حساسند. هیدراتاسیون قبل از تزریق و مصرف همزمان امپرازول توصیه می‌شود.' },
    ivermectin: { dose: '0.2 mg/kg SC', alert: '✅ درمان جرب سارکوپتس شتر (Sarcoptic Mange) و کرم‌های نماتود گوارشی؛ تزریق زیرجلدی، تکرار پس از ۱۴ روز.' },
    diminazene: { dose: '3.5 mg/kg deep IM', alert: '✅ درمان بیماری سورا (Surra / Trypanosoma evansi) در شتر؛ تزریق عضلانی عمیق.' },
    oxytetracycline: { dose: '20 mg/kg LA IM/SC', alert: '✅ درمان پنومونی، سپتی‌سمی و گندیدگی سم در شتر و لاما؛ تکرار پس از ۷۲ ساعت.' },
    xylazine: { dose: '0.2 - 0.4 mg/kg IM', alert: '✅ پروتکل Camelid Stun (زایلازین 0.2 + بوتورفانول 0.05 + کتامین 0.3 mg/kg IM در یک سرنگ) جهت جراحی سرپایی.' },
    calcium_borogluconate: { dose: '250 - 500 mL IV/SC', alert: '✅ درمان هیپوکلسمی زایمان در شتر ماده و تب شیر.' }
  },

  // ۵. آبزیان و شیلات (Aquaculture Knowledge)
  aquatics: {
    ms222: { dose: '50 - 100 ppm (mg/L)', bath: 'حمام غوطه‌وری بیهوشی ماهیان', notes: 'نیازمند بافر بی‌کربنات سدیم ۱:۱ جهت خنثی‌سازی افت اسیدیته pH آب.' },
    eugenol: { dose: '40 - 60 ppm (mg/L)', bath: 'حمام غوطه‌وری آرام‌بخشی و حمل و نقل', notes: 'عصاره طبیعی گل میخک؛ ریکاوری سریع و بدون عوارض اسیدوز.' },
    formalin: { dose: '15 - 25 ppm استخر / 150 - 250 ppm حمام کوتاه‌مدت ۳۰-۶۰ دقیقه', notes: 'درمان سفیدک ایک (Ich)؛ هوادهی شدید الزامی است (به ازای هر ۵ ppm فرمالین، ۱ ppm اکسیژن آب سوخته می‌شود).' },
    florfenicol: { dose: '10 mg/kg بیومس روزانه در خوراک ۱۰ روز', notes: 'درمان باکتریایی فورونکولوز و سپتی‌سمی قزل‌آلا؛ دوره پرهیز: ۵۰۰ روز-درجه.' },
    oxytetracycline: { dose: '50 - 75 mg/kg بیومس روزانه در خوراک یا 20 - 50 ppm حمام', notes: 'بیماری آبشش آلوده و کلومناریس؛ آب‌های با سختی بالا فراهمی زیستی را کاهش می‌دهند.' },
    praziquantel: { dose: '2 - 10 ppm حمام غوطه‌وری', notes: 'ریشه‌کنی انگل‌های منوژن آبشش (داکتیلوژیروس و ژیروداکتیلوس) و کرم‌های نواری ماهیان.' },
    hydrogen_peroxide: { dose: '100 - 250 ppm حمام ۳۰ دقیقه‌ای', notes: 'درمان عفونت قارچی ساپرولگنیازیس تخم‌ها و پوست ماهیان؛ بدون باقیمانده دارویی.' }
  },

  // ۶. بیهوشی و دارتینگ حیات‌وحش (Wildlife Knowledge)
  wildlife: {
    bam_cocktail: { drugs: 'بوتورفانول + آزاپِرون + مدتومازین (BAM)', notes: 'کوکتل استاندارد جهانی دارتینگ پستانداران حیات‌وحش؛ رِوِرسال با آتیپامزول و نالترکسون.' },
    iran_carnivore: { drugs: 'کتامین ۵ mg/kg + مدتومازین ۰.۰۸ mg/kg', notes: 'دارتینگ پلنگ ایرانی، یوزپلنگ، خرس قهوه‌ای و گرگ خاکستری با پرتابه دارت.' },
    ketamine: { drugs: '5 mg/kg IM همراه با مدتومازین 0.08 mg/kg', notes: 'دارتینگ پلنگ ایرانی، یوزپلنگ، خرس قهوه‌ای و گرگ خاکستری' },
    xylazine: { drugs: '1 - 2 mg/kg IM در دارت', notes: 'آرام‌بخشی و بیهوشی سم‌داران و علفخواران حیات‌وحش (کل و بز، قوچ و میش)' },
    medetomidine: { drugs: '0.04 - 0.08 mg/kg IM', notes: 'پروتکل طلایی دارتینگ حیات‌وحش (ترکیب با کتامین یا BAM)' },
    atipamezole: { drugs: '۵ برابر دوز میلی‌گرمی مدتومازین IM', notes: 'رِوِرسال اورژانس آلفا-۲ آگونیست‌ها در حیات‌وحش' },
    butorphanol: { drugs: '0.1 - 0.4 mg/kg IM', notes: 'جزء مسکن و آرام‌بخش پروتکل دارتینگ BAM حیات‌وحش' },
    iran_ungulate: { drugs: 'تیافنتانیل / بوتورفانول + آزاپِرون', notes: 'بیهوشی علفخواران فراری (گورخر ایرانی، کل و بز، قوچ و میش).' },
    ultra_potent_safety: { alert: '🔴 هشدار قرمز کشنده برای انسان: جذب پوستی کارفنتانیل و اتورفین مساوی با آپنه و مرگ؛ کیت نالوکسان همراه سرنگ آماده تزریق به دامپزشک الزامی است.' }
  }
};

// تابع استخراج پروفایل بالینی و تخصصی دارو
function getDrugSpecialtyProfile(drug) {
  if (!drug) return {};
  const dId = (drug.id || '').toLowerCase();
  const dFa = (drug.generic_name_fa || '').toLowerCase();
  const dEn = (drug.generic_name_en || '').toLowerCase();
  const dClass = ((drug.drug_class_fa || '') + ' ' + (drug.drug_class_en || '')).toLowerCase();
  const dCat = ((drug.therapeutic_category_fa || '') + ' ' + (drug.organ_system_fa || '')).toLowerCase();
  const allJson = JSON.stringify(drug).toLowerCase();

  const isOnco = dCat.includes('انکولوژی') || dCat.includes('شیمی‌درمانی') || dClass.includes('سیتوتوکسیک') || dClass.includes('نئوپلا') ||
    !!DRUG_SPECIALTY_KNOWLEDGE.oncology[dId] ||
    ['doxorubicin', 'cyclophosphamide', 'vincristine', 'vinblastine', 'carboplatin', 'cisplatin', 'lomustine', 'l_asparaginase', 'mitoxantrone', 'toceranib_phosphate', 'chlorambucil', 'melphalan', 'methotrexate', 'hydroxyurea', 'piroxicam'].includes(dId);

  const isAnesthCri = dCat.includes('بیهوشی') || dCat.includes('آرام‌بخش') || dCat.includes('ضد درد') ||
    /\bcri\b/i.test(allJson) || allJson.includes('انفوزیون مداوم') || allJson.includes('انفوزیون پیوسته') ||
    !!DRUG_SPECIALTY_KNOWLEDGE.cri[dId] ||
    ['lidocaine', 'ketamine', 'propofol', 'alfaxalone', 'midazolam', 'diazepam', 'fentanyl', 'dexmedetomidine', 'medetomidine', 'xylazine', 'butorphanol', 'buprenorphine', 'morphine', 'methadone', 'hydromorphone', 'atracurium', 'acepromazine', 'metoclopramide', 'dopamine', 'dobutamine', 'norepinephrine'].includes(dId);

  const isOpht = dCat.includes('چشم') || dClass.includes('چشمی') || dId.includes('opht') || dId.includes('eye') ||
    ['latanoprost', 'travoprost', 'bimatoprost', 'timolol', 'betaxolol', 'dorzolamide', 'brinzolamide', 'atropine_ophthalmic', 'atropine_eye', 'tropicamide', 'pilocarpine', 'tacrolimus_ophthalmic', 'cyclosporine_opht', 'cyclosporine_ophthalmic', 'ciprofloxacin_ophthalmic', 'ofloxacin_ophthalmic', 'prednisolone_eye', 'dexamethasone_ophthalmic', 'diclofenac_ophthalmic', 'cidofovir', 'voriconazole'].includes(dId);

  const isIcu = !!DRUG_SPECIALTY_KNOWLEDGE.icu[dId] || dCat.includes('اورژانس') || dCat.includes('قلب') || allJson.includes('احیا') || allJson.includes('شوک') || allJson.includes('مسمومیت') ||
    ['epinephrine', 'atropine', 'norepinephrine', 'dopamine', 'dobutamine', 'vasopressin', 'calcium_gluconate', 'sodium_bicarbonate', 'dextrose', 'mannitol', 'furosemide', 'insulin_regular', 'terbutaline', 'tranexamic_acid', 'fomepizole', 'acetylcysteine', 'atipamezole', 'naloxone', 'flumazenil', 'intralipid'].includes(dId);

  const isCamelidFatal = (dId === 'tilmicosin') || allJson.includes('مرگ در شتر') || allJson.includes('منع مصرف در شتر');
  const hasCamelidUse = isCamelidFatal || !!DRUG_SPECIALTY_KNOWLEDGE.camelids[dId] ||
    !!drug.species_dosing?.camel || !!drug.species_dosing?.camelid || !!drug.species_guide?.camel || !!drug.species_guide?.camelid ||
    allJson.includes('شتر') || allJson.includes('لاما') || allJson.includes('camel');

  const hasAquaticsUse = !!DRUG_SPECIALTY_KNOWLEDGE.aquatics[dId] ||
    !!drug.species_dosing?.aquatics || !!drug.species_dosing?.aquatic || !!drug.species_guide?.aquatics || !!drug.species_guide?.aquatic ||
    allJson.includes('ماهی') || allJson.includes('قزل‌آلا') || allJson.includes('شیلات') || allJson.includes('ppm') ||
    ['ms222', 'tricaine', 'eugenol', 'formalin', 'hydrogen_peroxide', 'chloramine_t', 'potassium_permanganate', 'florfenicol', 'enrofloxacin', 'oxytetracycline', 'praziquantel', 'mebendazole'].includes(dId);

  const hasWildlifeUse = !!DRUG_SPECIALTY_KNOWLEDGE.wildlife[dId] || !!drug.species_dosing?.wildlife || !!drug.species_guide?.wildlife || allJson.includes('دارتینگ') || allJson.includes('حیات وحش') ||
    ['ketamine', 'medetomidine', 'butorphanol', 'azaperone', 'midazolam', 'xylazine', 'atipamezole', 'yohimbine', 'naltrexone', 'diprenorphine', 'carfentanil', 'etorphine', 'tiletamine_zolazepam'].includes(dId);

  return { isOnco, isAnesthCri, isOpht, isIcu, hasCamelidUse, isCamelidFatal, hasAquaticsUse, hasWildlifeUse };
}

// استخراج گونه‌های تحت پوشش این دارو بر اساس دوز و شواهد بالینی پلامبز
function getSpeciesForDrug(drug) {
  if (!drug) return ['canine', 'feline'];
  const p = getDrugSpecialtyProfile(drug);
  const list = [];
  
  if (drug.species_guide?.canine || drug.species_dosing?.canine) list.push('canine');
  if (drug.species_guide?.feline || drug.species_dosing?.feline) list.push('feline');
  if (drug.species_guide?.equine || drug.species_dosing?.equine) list.push('equine');
  if (drug.species_guide?.bovine || drug.species_dosing?.bovine || drug.species_dosing?.ruminant) list.push('bovine');
  if (drug.species_guide?.ovine_caprine || drug.species_dosing?.ovine_caprine || drug.species_dosing?.ruminant) list.push('ovine_caprine');
  if (drug.species_guide?.poultry || drug.species_dosing?.poultry || drug.species_dosing?.avian) list.push('poultry');
  if (p.hasCamelidUse || p.isCamelidFatal || drug.species_guide?.camelids || drug.species_dosing?.camelids || drug.species_dosing?.camelid) list.push('camelids');
  if (p.hasAquaticsUse || drug.species_guide?.aquatics || drug.species_guide?.aquatic || drug.species_dosing?.aquatics || drug.species_dosing?.aquatic) list.push('aquatics');
  if (p.hasWildlifeUse || drug.species_guide?.wildlife || drug.species_dosing?.wildlife) list.push('wildlife');
  
  if (list.length === 0) list.push('canine', 'feline');
  return list;
}

let activeCardSpecies = {}; // نگهداری گونه فعال هر کارت دارویی
let activeCardFormulation = {}; // نگهداری فرمولاسیون/غلظت انتخابی برای هر کارت
let activeCardTabletStrength = {}; // نگهداری دوز قرص انتخابی برای هر کارت

const DEFAULT_PRE_EXPANDED_DRUGS = [];

let expandedCards = (typeof window !== 'undefined' && window.expandedCards) || new Set(DEFAULT_PRE_EXPANDED_DRUGS); // کارت‌های بازشده به صورت آکاردئونی
let isAllCardsExpanded = false; // وضعیت کلید باز کردن / بستن همه دوزها
if (typeof window !== 'undefined') {
  window.expandedCards = expandedCards;
  window.isAllCardsExpanded = isAllCardsExpanded;
}

// تابع فعال‌سازی ویترین داروهای شاخص بالینی و هدایت سریع کاربر
function quickShowcaseDrug(drugId) {
  currentTherapeuticCategory = 'all';
  currentSpecies = 'all';
  currentCategory = 'all';
  currentFavoritesOnly = false;
  
  if (typeof document !== 'undefined') {
    // تنظیم وضعیت دکمه‌های رده درمانی
    document.querySelectorAll('.thcat-pill').forEach(btn => {
      const isTarget = btn.getAttribute('data-thcat') === 'all';
      if (isTarget) {
        btn.classList.add('active', 'bg-slate-900', 'text-white', 'border-slate-900', 'shadow-sm');
        btn.classList.remove('bg-slate-50');
      } else {
        btn.classList.remove('active', 'bg-slate-900', 'text-white', 'border-slate-900', 'shadow-sm');
        btn.classList.add('bg-slate-50');
      }
    });
    
    // تنظیم کادر جستجو روی نام دارو
    const searchInput = document.getElementById('searchInput');
    const drug = (typeof DRUGS_DATA !== 'undefined') ? DRUGS_DATA.find(d => d.id === drugId) : null;
    if (drug && searchInput) {
      searchInput.value = drug.generic_name_fa.split(' ')[0] || drug.id;
      searchQuery = searchInput.value.trim().toLowerCase();
    }
  }
  
  expandedCards.add(drugId);
  renderDrugs();
  
  if (typeof document !== 'undefined') {
    setTimeout(() => {
      const cardEl = document.getElementById(`card_${drugId}`);
      if (cardEl) {
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cardEl.classList.add('ring-4', 'ring-teal-500');
        setTimeout(() => cardEl.classList.remove('ring-4', 'ring-teal-500'), 2500);
      }
    }, 150);
  }
}

// تابع ریاضی محاسبه کسر قرص و دستور نسخه (Clinical Tablet Math Engine)
function calculateTabletDispensing(weight, doseMgKg, tabletMg, intervalCode, durationDays) {
  const mgPerDose = weight * doseMgKg;
  const rawTablets = tabletMg > 0 ? (mgPerDose / tabletMg) : 0;
  
  let fractionText = '';
  let fractionVal = 0;
  let roundingAdvice = '';
  
  if (rawTablets < 0.18) {
    fractionText = 'کمتر از ۱/۴ قرص (نیاز به سوسپانسیون مایع یا رقیق‌سازی)';
    fractionVal = 0.25;
    roundingAdvice = '⚠️ دوز قرص برای این وزن خیلی بالاست. بهتر است از شربت یا سوسپانسیون رقیق‌شده استفاده کنید یا قرص را در سرنگ حل نمایید.';
  } else if (rawTablets < 0.38) {
    fractionText = '۱/۴ قرص (یک‌چهارم قرص)';
    fractionVal = 0.25;
    roundingAdvice = 'قرص را با تیغ کاتر تمیز از محل خط برش نصف کرده و سپس نصفه را مجدداً نصف نمایید.';
  } else if (rawTablets < 0.68) {
    fractionText = '۱/۲ قرص (نصف قرص)';
    fractionVal = 0.5;
    roundingAdvice = 'قرص خط‌دار است؛ از محل خط‌برش به دو نیم تقسیم کنید.';
  } else if (rawTablets < 0.88) {
    fractionText = '۳/۴ قرص (سه‌چهارم قرص)';
    fractionVal = 0.75;
    roundingAdvice = 'نصف قرص به اضافه یک‌چهارم قرص خورانده شود.';
  } else if (rawTablets < 1.35) {
    fractionText = '۱ قرص کامل';
    fractionVal = 1.0;
    roundingAdvice = 'یک عدد قرص کامل بدون نیاز به خرد کردن خورانده شود.';
  } else if (rawTablets < 1.7) {
    fractionText = '۱.۵ قرص (یک و نیم قرص)';
    fractionVal = 1.5;
    roundingAdvice = 'یک قرص کامل همراه با نصف قرص خورانده شود.';
  } else if (rawTablets < 2.35) {
    fractionText = '۲ قرص کامل';
    fractionVal = 2.0;
    roundingAdvice = 'دو عدد قرص کامل خورانده شود.';
  } else if (rawTablets < 2.7) {
    fractionText = '۲.۵ قرص (دو و نیم قرص)';
    fractionVal = 2.5;
    roundingAdvice = 'دو قرص کامل به اضافه نصف قرص خورانده شود.';
  } else if (rawTablets < 3.35) {
    fractionText = '۳ قرص کامل';
    fractionVal = 3.0;
    roundingAdvice = 'سه عدد قرص کامل خورانده شود.';
  } else {
    const rounded = Math.round(rawTablets * 2) / 2;
    fractionText = `${rounded} قرص کامل`;
    fractionVal = rounded;
    roundingAdvice = `${rounded} عدد قرص خورانده شود (یا از دوز قوی‌تر استفاده فرمایید).`;
  }

  let dosesPerDay = 2;
  let intervalLabelFa = 'هر ۱۲ ساعت';
  if (intervalCode === 'q8h') { dosesPerDay = 3; intervalLabelFa = 'هر ۸ ساعت'; }
  else if (intervalCode === 'q24h') { dosesPerDay = 1; intervalLabelFa = 'هر ۲۴ ساعت (روزانه)'; }
  else if (intervalCode === 'q6h') { dosesPerDay = 4; intervalLabelFa = 'هر ۶ ساعت'; }
  else if (intervalCode === 'single_dose' || intervalCode === 'stat') { dosesPerDay = 1; intervalLabelFa = 'تک‌دوز (یک‌بار)'; }

  const days = Math.max(1, parseInt(durationDays) || 7);
  const totalDoses = dosesPerDay * days;
  const totalTablets = Math.ceil(totalDoses * fractionVal);

  return {
    mgPerDose: Math.round(mgPerDose * 10) / 10,
    rawTablets: rawTablets.toFixed(2),
    fractionText,
    fractionVal,
    roundingAdvice,
    intervalLabelFa,
    dosesPerDay,
    days,
    totalTablets
  };
}

// انتخاب فرمولاسیون/غلظت یک کارت دارویی
function selectCardFormulation(drugId, formId) {
  activeCardFormulation[drugId] = formId;
  const contentEl = document.getElementById(`spContent_${drugId}`);
  const drug = DRUGS_DATA.find(d => d.id === drugId);
  const currentCardSp = activeCardSpecies[drugId] || (currentSpecies !== 'all' ? currentSpecies : 'canine');
  if (contentEl && drug) {
    contentEl.innerHTML = getPlumbsSpeciesBoxHtml(drug, currentCardSp);
    if (window.lucide) lucide.createIcons();
  }
}

// انتخاب دوز قرص یک کارت دارویی
function selectCardTabletStrength(drugId, strengthMg) {
  activeCardTabletStrength[drugId] = strengthMg;
  const contentEl = document.getElementById(`spContent_${drugId}`);
  const drug = DRUGS_DATA.find(d => d.id === drugId);
  const currentCardSp = activeCardSpecies[drugId] || (currentSpecies !== 'all' ? currentSpecies : 'canine');
  if (contentEl && drug) {
    contentEl.innerHTML = getPlumbsSpeciesBoxHtml(drug, currentCardSp);
    if (window.lucide) lucide.createIcons();
  }
}

// کپی سریع متن نسخه از روی کارت دارویی
function copyCardTabletPrescription(drugId) {
  const drug = DRUGS_DATA.find(d => d.id === drugId);
  if (!drug || !drug.tablet_dispensing_guide) return;
  const tabGuide = drug.tablet_dispensing_guide;
  const selectedStrength = activeCardTabletStrength[drug.id] || (tabGuide.available_strengths.find(s => s.is_default)?.strength_mg || tabGuide.available_strengths[0].strength_mg);
  const tabRes = calculateTabletDispensing(currentPatientWeight, tabGuide.target_dose_mg_kg, selectedStrength, tabGuide.interval_code, tabGuide.duration_days_default);
  
  const text = `📋 نسخه دارویی بیمار (دستور مصرف)
----------------------------------------
🐾 بیمار: با وزن تقریبی ${currentPatientWeight} کیلوگرم
💊 دارو: ${drug.generic_name_fa} (${drug.generic_name_en})
📏 دوز قرص در داروخانه: ${selectedStrength} میلی‌گرم
⏱️ دستور هر وعده: ${tabRes.fractionText}
⏰ فاصله مصرف: ${tabGuide.interval_fa}
🍽️ شرایط مصرف: ${tabGuide.administration_note || 'همراه با غذا'}
📅 طول دوره درمان: ${tabRes.days} روز
📦 تعداد کل قرص نسخه جهت تحویل: ${tabRes.totalTablets} عدد قرص
----------------------------------------
📌 لطفاً دوره درمان را کامل نموده و از قطع خودسرانه دارو خودداری نمایید.`;

  navigator.clipboard.writeText(text).then(() => {
    alert(`✅ متن نسخه ${drug.generic_name_fa} برای بیمار ${currentPatientWeight} کیلوگرم در کلیپ‌بورد کپی شد!\nمی‌توانید در نرم‌افزار کلینیک یا پیام‌رسان Paste کنید.`);
  }).catch(() => {
    prompt('متن نسخه را کپی کنید:', text);
  });
}

// تولید HTML کادر بزرگ و خوانای بالینی پلامبز برای یک گونه مشخص
function getPlumbsSpeciesBoxHtml(drug, speciesKey) {
  let guide = drug.species_guide ? (drug.species_guide[speciesKey] || (speciesKey === 'aquatics' ? (drug.species_guide.aquatics || drug.species_guide.aquatic) : null)) : null;
  const spMeta = CARD_SPECIES_META[speciesKey] || { label: speciesKey, icon: '🐾' };

  // ۱. استخراج خودکار راهنمای بالینی شترسانان (Camelids)
  if (!guide && speciesKey === 'camelids') {
    const p = (typeof getDrugSpecialtyProfile === 'function') ? getDrugSpecialtyProfile(drug) : {};
    const camelInfo = (typeof DRUG_SPECIALTY_KNOWLEDGE !== 'undefined' && DRUG_SPECIALTY_KNOWLEDGE.camelids) ? DRUG_SPECIALTY_KNOWLEDGE.camelids[drug.id] : null;

    if (p.isCamelidFatal || camelInfo?.fatal) {
      guide = {
        status: 'contraindicated',
        warning_title: 'منع مصرف مطلق و کشنده در شترسانان (Fatal Risk)',
        warning_body: camelInfo?.alert || 'تزریق تیلمیکوزین در شتر، لاما و آلپاکا مطلقاً کشنده و مرگبار است (ایست قلبی ناگهانی و آریتمی کشنده).'
      };
    } else if (camelInfo) {
      guide = {
        status: camelInfo.caution ? 'caution' : 'active',
        indication: 'درمان فارماکولوژیک در شتر (جماز/دوکوهانه)، لاما و آلپاکا',
        range_mg: camelInfo.dose || 'مطابق دوز استاندارد نشخوارکنندگان با تعدیل حجم C3',
        formulation: 'تزریقی LA زیرجلدی (SC) یا عضلانی (IM)',
        route: camelInfo.dose?.includes('SC') ? 'زیرجلدی (SC)' : (camelInfo.dose?.includes('IM') ? 'عضلانی (IM)' : 'وریدی / زیرجلدی'),
        rule_of_thumb: 'شترسانان دارای معده ۳ محفظه‌ای هستند و به اولسراسیون C3 و سمیت کلیوی بسیار حساسند. هیدراتاسیون کافی الزامی است.',
        pearl: camelInfo.alert
      };
    } else if (drug.species_dosing?.camel || drug.species_dosing?.camelid) {
      const cDose = drug.species_dosing.camel || drug.species_dosing.camelid;
      const cDoseStr = typeof cDose === 'string' ? cDose : (cDose.dose || cDose.regimen || JSON.stringify(cDose));
      guide = {
        status: 'active',
        indication: 'کاربرد بالینی و دوز شترسانان',
        range_mg: cDoseStr,
        formulation: 'تزریقی زیرجلدی (SC) یا عضلانی (IM)',
        route: 'زیرجلدی (SC) یا عضلانی (IM)',
        rule_of_thumb: 'تعدیل دوز و فواصل مصرف بر اساس فارماکوکینتیک اختصاصی شترسانان الزامی است.',
        pearl: 'شترها به علت حجم توزیع متفاوت، ممکن است نیمه‌عمر دارویی متفاوتی نسبت به گاو داشته باشند.'
      };
    } else if (drug.species_guide?.bovine || drug.species_dosing?.ruminant) {
      guide = {
        status: 'active',
        indication: 'کاربرد بالینی در شترسانان بر اساس دوز نشخوارکنندگان',
        range_mg: 'مطابق دوز نشخوارکنندگان (با پایش اولسراسیون C3)',
        formulation: 'تزریقی یا خوراکی',
        route: 'زیرجلدی (SC) / عضلانی (IM)',
        rule_of_thumb: 'در شترسانان از تزریق داخل عضلانی با حجم بالا در یک نقطه خودداری شود.',
        pearl: 'پایش دقیق رفتاری و علائم درد شکمی و کولیک ناشی از زخم C3 الزامی است.'
      };
    }
  }

  // ۲. استخراج خودکار راهنمای بالینی آبزیان (Aquatics)
  if (!guide && speciesKey === 'aquatics') {
    const aquaInfo = (typeof DRUG_SPECIALTY_KNOWLEDGE !== 'undefined' && DRUG_SPECIALTY_KNOWLEDGE.aquatics) ? DRUG_SPECIALTY_KNOWLEDGE.aquatics[drug.id] : null;
    const rawDose = drug.species_dosing?.aquatics || drug.species_dosing?.aquatic;
    if (aquaInfo) {
      guide = {
        status: 'active',
        indication: 'شیلات و ماهیان پرورشی (قزل‌آلا/کپور) و ماهیان آکواریومی زینتی',
        range_mg: aquaInfo.dose,
        formulation: aquaInfo.bath || 'حمام غوطه‌وری (Bath) یا مخلوط در خوراک',
        route: 'محیط آب (حمام) / خوراکی (In-feed)',
        rule_of_thumb: 'ppm معادل میلی‌گرم در لیتر یا گرم در متر مکعب آب است.',
        pearl: aquaInfo.notes || 'پایش اکسیژن محلول، دما و pH آب الزامی است.'
      };
    } else if (rawDose) {
      const doseStr = typeof rawDose === 'string' ? rawDose : (rawDose.dose || rawDose.regimen || JSON.stringify(rawDose));
      guide = {
        status: 'active',
        indication: 'درمان و پیشگیری بالینی در ماهیان پرورشی و زینتی',
        range_mg: doseStr,
        formulation: 'پودر محلول در آب، حمام غوطه‌وری (Bath) یا مخلوط در خوراک',
        route: 'محیط آب (حمام) / خوراکی (In-feed)',
        rule_of_thumb: 'ppm معادل میلی‌گرم در لیتر یا گرم در متر مکعب آب است.',
        pearl: 'پارامترهای کیفیت آب (دما، هوادهی، pH و سختی) در فارماکوکینتیک داروها در ماهیان نقش حیاتی دارند.'
      };
    }
  }

  // ۳. استخراج خودکار راهنمای بالینی حیات‌وحش (Wildlife)
  if (!guide && speciesKey === 'wildlife') {
    const wildInfo = (typeof DRUG_SPECIALTY_KNOWLEDGE !== 'undefined' && DRUG_SPECIALTY_KNOWLEDGE.wildlife) ? DRUG_SPECIALTY_KNOWLEDGE.wildlife[drug.id] : null;
    const rawDose = drug.species_dosing?.wildlife;
    if (drug.id === 'ketamine') {
      guide = {
        status: 'active',
        indication: 'پروتکل دارتینگ و بی‌هوشی گوشتخواران حیات‌وحش (پلنگ ایرانی، یوزپلنگ، خرس، گرگ)',
        range_mg: '5 mg/kg IM در پرتابه دارت (همراه با مدتومازین 0.08 mg/kg)',
        formulation: 'محلول تزریقی متمرکز در دارت',
        route: 'عضلانی با پرتابه دارت (IM Dart)',
        rule_of_thumb: 'همراه با آلفا-۲ آگونیست‌ها جهت شل شدن عضلانی و کاهش دوز تجویز شود.',
        pearl: 'رِوِرسال بخش آرام‌بخش با آتیپامزول عضلانی انجام شود (کتامین پادزهر ندارد؛ پایش دمای بدن الزامی است).'
      };
    } else if (drug.id === 'xylazine') {
      guide = {
        status: 'active',
        indication: 'آرام‌بخشی و بیهوشی سم‌داران و علفخواران حیات‌وحش (کل و بز، قوچ و میش، جبیر)',
        range_mg: '1 - 2 mg/kg IM در دارت',
        formulation: 'محلول تزریقی ۲۰٪ یا ۱۰٪',
        route: 'عضلانی پرتابه دارت (IM)',
        rule_of_thumb: 'رِوِرسال با یوهمبین (0.125 mg/kg IV) یا آتیپامزول انجام شود.',
        pearl: 'حیوان خوابیده باید روی جناغ سینه (Sternal recumbency) قرار گیرد تا از نفخ و رگورژیتاسیون جلوگیری شود.'
      };
    } else if (drug.id === 'medetomidine') {
      guide = {
        status: 'active',
        indication: 'پروتکل دارتینگ حیات‌وحش (کوکتل BAM یا ترکیب با کتامین)',
        range_mg: '0.04 - 0.08 mg/kg IM',
        formulation: 'محلول تزریقی با خلوص بالا',
        route: 'عضلانی پرتابه دارت (IM)',
        rule_of_thumb: 'رِوِرسال قطعی و سریع با آتیپامزول (به نسبت وزنی ۵ برابر مدتومازین).',
        pearl: 'انتخاب اول در دارتینگ گربه‌سانان بزرگ (پلنگ ایرانی و شیر).'
      };
    } else if (drug.id === 'atipamezole') {
      guide = {
        status: 'active',
        indication: 'رِوِرسال و پادزهر فوری مدتومازین و دکسمدتومازین در حیات‌وحش',
        range_mg: '۵ برابر دوز میلی‌گرمی مدتومازین یا حجم مساوی IM',
        formulation: 'محلول تزریقی عضلانی',
        route: 'صرفاً عضلانی (IM) - تزریق سریع وریدی ممنوع',
        rule_of_thumb: 'حیوان ظرف ۳ الی ۸ دقیقه پس از تزریق عضلانی سرپا می‌شود.',
        pearl: 'تزریق سریع وریدی باعث کلاپس عروقی و تاکی‌آریتمی شدید می‌شود.'
      };
    } else if (drug.id === 'butorphanol') {
      guide = {
        status: 'active',
        indication: 'جزء مسکن و آرام‌بخش پروتکل دارتینگ BAM حیات‌وحش',
        range_mg: '0.1 - 0.4 mg/kg IM',
        formulation: 'تزریقی در سرنگ ترکیبی BAM',
        route: 'عضلانی پرتابه دارت (IM)',
        rule_of_thumb: 'رِوِرسال با نالترکسون یا نالوکسان انجام شود.',
        pearl: 'پروتکل BAM (بوتورفانول + آزاپِرون + مدتومازین) ایمن‌ترین ترکیب برای پستانداران وحشی است.'
      };
    } else if (wildInfo) {
      guide = {
        status: 'active',
        indication: 'پروتکل دارتینگ و مقیدسازی شیمیایی حیات‌وحش',
        range_mg: wildInfo.drugs || wildInfo.dose || 'مطابق پروتکل دارتینگ',
        formulation: 'تزریقی در سرنگ دارت',
        route: 'عضلانی پرتابه دارت (IM)',
        pearl: wildInfo.notes || wildInfo.alert
      };
    } else if (rawDose) {
      const doseStr = typeof rawDose === 'string' ? rawDose : (rawDose.dose || rawDose.regimen || JSON.stringify(rawDose));
      guide = {
        status: 'active',
        indication: 'کاربرد بالینی در جانوران حیات‌وحش و باغ‌وحش',
        range_mg: doseStr,
        formulation: 'تزریقی با دارت یا خوراکی در طعمه',
        route: 'عضلانی (IM) یا خوراکی',
        pearl: 'پایش تنفس و علائم حیاتی و آماده بودن پادزهر الزامی است.'
      };
    }
  }

  // اگر راهنما رشته متنی ساده یا آبجکت خلاصه بود
  if (typeof guide === 'string') {
    guide = {
      status: 'active',
      indication: `درمان فارماکولوژیک در ${spMeta.label}`,
      range_mg: guide,
      formulation: 'فرم دارویی استاندارد',
      route: 'خوراکی / تزریقی',
      pearl: `پایش دقیق علائم بالینی در ${spMeta.label} الزامی است.`
    };
  } else if (guide && typeof guide === 'object' && guide.status && !guide.range_mg && !guide.warning_title && !guide.warning_body) {
    guide = {
      status: (typeof guide.status === 'string' && (guide.status.includes('منع') || guide.status === 'contraindicated')) ? 'contraindicated' : 'active',
      warning_title: guide.warning || `راهنمای مصرف در ${spMeta.label}`,
      warning_body: guide.summary || guide.warning || '',
      indication: guide.summary || `پروتکل بالینی در ${spMeta.label}`,
      range_mg: guide.summary || '-',
      formulation: 'اشکال دارویی استاندارد',
      route: 'خوراکی / تزریقی',
      pearl: guide.warning || `پایش دقیق علائم بالینی در ${spMeta.label} الزامی است.`
    };
  }

  if (!guide) {
    return `
      <div class="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center text-xs text-slate-500">
        اطلاعات دوز بالینی برای ${spMeta.icon} ${spMeta.label} در مونوگراف ثبت نشده است.
      </div>
    `;
  }

  // ۱. حالت منع مصرف قطعی (Contraindicated - کشنده یا عارضه فوق حاد)
  if (guide.status === 'contraindicated') {
    return `
      <div class="bg-rose-50/95 border-2 border-rose-500 p-4 rounded-2xl text-rose-950 shadow-sm transition-all">
        <div class="flex items-center gap-2 mb-2 pb-2 border-b border-rose-200">
          <span class="text-2xl shrink-0">☠️</span>
          <div>
            <h4 class="font-black text-sm text-rose-700 leading-snug">${guide.warning_title || `منع مصرف مطلق در ${spMeta.label}`}</h4>
            <span class="text-[10px] font-bold text-rose-800 bg-rose-200/80 px-2 py-0.5 rounded-md inline-block mt-0.5">خط قرمز ایمنی بالینی (Lethal Risk)</span>
          </div>
        </div>
        <p class="text-xs leading-relaxed font-bold text-rose-900 whitespace-pre-line">
          ${guide.warning_body}
        </p>
      </div>
    `;
  }

  // ۲. حالت عدم توصیه / کاربرد غیرمعمول (Not Recommended)
  if (guide.status === 'not_recommended') {
    return `
      <div class="bg-slate-100/90 border border-slate-300 p-3.5 rounded-2xl text-slate-800 shadow-2xs">
        <div class="flex items-center gap-2 mb-1.5">
          <span class="text-xl shrink-0">⛔</span>
          <h4 class="font-black text-xs text-slate-700">${guide.warning_title || `کاربرد غیرمعمول در ${spMeta.label}`}</h4>
        </div>
        <p class="text-xs text-slate-600 leading-relaxed font-medium">
          ${guide.warning_body}
        </p>
      </div>
    `;
  }

  // ۳. فرمولاسیون‌های چندگانه و قابل تغییر (تزریقی چند غلظتی)
  const injectableForms = (drug.available_formulations || []).filter(f => f.form_type === 'injectable');
  let selectedForm = null;
  let calculatedMl = null;

  if (injectableForms.length > 0) {
    const activeFormId = activeCardFormulation[drug.id] || (injectableForms.find(f => f.is_default)?.id || injectableForms[0].id);
    selectedForm = injectableForms.find(f => f.id === activeFormId) || injectableForms[0];
    if (selectedForm && selectedForm.concentration_mg_ml > 0 && selectedForm.dose_mg_kg > 0) {
      calculatedMl = (currentPatientWeight * selectedForm.dose_mg_kg) / selectedForm.concentration_mg_ml;
    }
  }

  // محاسبه حجم سرنگ پایه
  let volDisplayHtml = '';
  if (typeof calculatedMl === 'number' && calculatedMl > 0) {
    let formatted = calculatedMl < 0.05 ? calculatedMl.toFixed(3) : (calculatedMl < 1 ? calculatedMl.toFixed(2) : (calculatedMl < 10 ? calculatedMl.toFixed(1) : (Math.round(calculatedMl * 10) / 10).toString()));
    volDisplayHtml = `
      <div class="text-left bg-white/95 px-3 py-1.5 rounded-xl border border-emerald-300/80 shadow-2xs shrink-0">
        <div class="flex items-baseline gap-1">
          <span class="text-2xl font-black font-mono text-emerald-950 latin-text">${formatted}</span>
          <span class="text-xs font-black text-emerald-700">سی‌سی (mL)</span>
        </div>
        <span class="text-[10px] text-emerald-800 block font-bold text-center">برای وزن ${currentPatientWeight} kg</span>
      </div>
    `;
  } else if (typeof guide.ml_per_kg === 'number' && guide.ml_per_kg > 0) {
    const totalMl = currentPatientWeight * guide.ml_per_kg;
    let formatted = totalMl < 0.05 ? totalMl.toFixed(3) : (totalMl < 1 ? totalMl.toFixed(2) : (totalMl < 10 ? totalMl.toFixed(1) : (Math.round(totalMl * 10) / 10).toString()));
    volDisplayHtml = `
      <div class="text-left bg-white/95 px-3 py-1.5 rounded-xl border border-emerald-300/80 shadow-2xs shrink-0">
        <div class="flex items-baseline gap-1">
          <span class="text-2xl font-black font-mono text-emerald-950 latin-text">${formatted}</span>
          <span class="text-xs font-black text-emerald-700">سی‌سی (mL)</span>
        </div>
        <span class="text-[10px] text-emerald-800 block font-bold text-center">برای وزن ${currentPatientWeight} kg</span>
      </div>
    `;
  } else if (guide.fixed_dose) {
    volDisplayHtml = `
      <div class="text-left bg-white/95 px-3 py-1.5 rounded-xl border border-emerald-300/80 shadow-2xs shrink-0">
        <span class="text-xs font-black text-emerald-950 block">${guide.fixed_dose}</span>
        <span class="text-[10px] text-emerald-700 block font-medium">دوز کل رأس</span>
      </div>
    `;
  } else if (guide.range_ml) {
    volDisplayHtml = `
      <div class="text-left bg-white/95 px-3 py-1.5 rounded-xl border border-emerald-300/80 shadow-2xs shrink-0">
        <span class="text-xs font-mono font-bold text-emerald-950 latin-text block">${guide.range_ml}</span>
        <span class="text-[10px] text-emerald-700 block font-medium">حجم بر کیلوگرم</span>
      </div>
    `;
  }

  // کادر انتخاب غلظت ویال (برای داروهای چند غلظتی مانند اکسی‌تتراسایکلین و انروفلوکساسین)
  let formulationSwitcherHtml = '';
  if (injectableForms.length > 1 && (speciesKey === 'bovine' || speciesKey === 'ovine_caprine' || speciesKey === 'equine' || guide.ml_per_kg > 0)) {
    const isLa = selectedForm && selectedForm.id.includes('la');
    const splitNeededCow = speciesKey === 'bovine' && calculatedMl > 15;
    const splitNeededSheep = speciesKey === 'ovine_caprine' && calculatedMl > 5;
    
    formulationSwitcherHtml = `
      <div class="bg-slate-100/95 border border-slate-300/90 p-2.5 rounded-2xl space-y-2">
        <div class="flex items-center justify-between text-xs font-bold text-slate-800">
          <span class="flex items-center gap-1.5">
            <span>💉</span>
            <span>انتخاب غلظت ویال تزریقی (تغییر آنی حجم و تکرار):</span>
          </span>
          <span class="text-teal-900 font-bold font-mono text-[11px] bg-white px-2 py-0.5 rounded-lg border border-slate-200">
            ${selectedForm.concentration_percent ? selectedForm.concentration_percent + '٪' : selectedForm.concentration_mg_ml + ' mg/mL'}
          </span>
        </div>

        <div class="flex flex-wrap gap-1.5">
          ${injectableForms.map(f => {
            const isSel = selectedForm && f.id === selectedForm.id;
            return `
              <button type="button" onclick="selectCardFormulation('${drug.id}', '${f.id}')"
                      class="px-2.5 py-1 rounded-xl text-xs font-black transition ${isSel ? 'bg-slate-900 text-white shadow-xs ring-2 ring-slate-900/30' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-bold'}">
                ${f.name.split(' (')[0]}
              </button>
            `;
          }).join('')}
        </div>

        <!-- هشدار فرکانس، ماندگاری و عدم تزریق روزانه -->
        <div class="p-2 rounded-xl text-xs font-bold ${isLa ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-teal-100 text-teal-950 border border-teal-300'}">
          <span class="block">${isLa ? '⚠️ فرم طولانی‌اثر (LA): تک‌دوز عضلانی عمیق با ماندگاری ۷۲ ساعت (تزریق روزانه ممنوع است!)' : `📅 تکرار تزریق روزانه: ${selectedForm.interval || 'هر ۲۴ ساعت'}`}</span>
          ${selectedForm.instructions ? `<span class="block text-[11px] font-medium text-slate-700 mt-0.5">📌 ${selectedForm.instructions}</span>` : ''}
        </div>

        ${splitNeededCow ? `
          <div class="p-2 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-900 border border-rose-300 flex items-center gap-1.5">
            <span>📍</span>
            <span>تقسیم حجم در گاو: حداکثر ۱۵ سی‌سی در هر موضع؛ حجم کل (${calculatedMl.toFixed(1)} mL) باید در ${Math.ceil(calculatedMl / 15)} نقطه جداگانه گردن تزریق شود.</span>
          </div>
        ` : ''}

        ${splitNeededSheep ? `
          <div class="p-2 rounded-xl text-[11px] font-bold bg-rose-50 text-rose-900 border border-rose-300 flex items-center gap-1.5">
            <span>📍</span>
            <span>تقسیم حجم در گوسفند: حداکثر ۵ سی‌سی در هر موضع؛ حجم (${calculatedMl.toFixed(1)} mL) در ${Math.ceil(calculatedMl / 5)} نقطه مجزا تزریق گردد.</span>
          </div>
        ` : ''}
      </div>
    `;
  }

  // ۴. کادر راهنمای دوز قرص و دستور نسخه (برای داروهای خوراکی)
  let tabletBoxHtml = '';
  const tabGuide = drug.tablet_dispensing_guide;
  const isOralSpecies = speciesKey === 'canine' || speciesKey === 'feline' || (guide.route && (guide.route.includes('PO') || guide.route.includes('خوراکی')));
  
  const tabStrengths = tabGuide ? (tabGuide.available_strengths || tabGuide.available_tablets || []) : [];
  if (tabGuide && isOralSpecies && tabStrengths.length > 0) {
    const defStrength = tabStrengths.find(s => s.is_default)?.strength_mg || tabStrengths[0].strength_mg;
    const selectedTabStrength = activeCardTabletStrength[drug.id] || defStrength;
    const targetDose = tabGuide.target_dose_mg_kg || tabGuide.default_dose_mg_kg || 10;
    const intervalCode = tabGuide.interval_code || tabGuide.dosing_interval || 'q12h';
    const durationDays = tabGuide.duration_days_default || 7;
    const tabCalc = calculateTabletDispensing(currentPatientWeight, targetDose, selectedTabStrength, intervalCode, durationDays);

    tabletBoxHtml = `
      <div class="mt-2.5 bg-gradient-to-br from-amber-50 to-orange-50/70 border-2 border-amber-300 p-3.5 rounded-2xl shadow-2xs space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-amber-950 flex items-center gap-1.5">
            <span>💊</span>
            <span>راهنمای دوز قرص برای وزن ${currentPatientWeight} kg:</span>
          </span>
          <button type="button" onclick="copyCardTabletPrescription('${drug.id}')" class="px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 text-[11px] font-black shadow-2xs transition flex items-center gap-1">
            <span>📋 کپی نسخه</span>
          </button>
        </div>

        <!-- انتخاب دوز قرص موجود در داروخانه -->
        <div class="flex flex-wrap gap-1">
          ${tabStrengths.map(s => {
            const isSel = s.strength_mg === selectedTabStrength;
            return `
              <button type="button" onclick="selectCardTabletStrength('${drug.id}', ${s.strength_mg})"
                      class="px-2 py-1 rounded-xl text-[10px] font-bold transition ${isSel ? 'bg-amber-800 text-white shadow-xs ring-2 ring-amber-800/30' : 'bg-white text-slate-700 border border-slate-200 hover:bg-amber-50'}">
                ${s.label}
              </button>
            `;
          }).join('')}
        </div>

        <!-- کادر دستور مصرف صریح و آماده نسخه -->
        <div class="bg-white/95 p-3 rounded-xl border border-amber-200 shadow-2xs text-xs space-y-1.5">
          <div class="flex items-baseline justify-between">
            <span class="text-slate-600 font-bold">دستور هر وعده:</span>
            <span class="text-sm font-black text-amber-950">${tabCalc.fractionText} (${selectedTabStrength} mg)</span>
          </div>
          <div class="flex items-center justify-between text-[11px] text-slate-700 font-bold pt-1 border-t border-slate-100">
            <span>⏰ <strong>تکرار:</strong> ${tabGuide.interval_fa}</span>
            <span>📦 <strong>تعداد کل نسخه:</strong> ${tabCalc.totalTablets} عدد قرص (${tabCalc.days} روز)</span>
          </div>
          <p class="text-[11px] text-amber-900 font-bold pt-0.5">${tabCalc.roundingAdvice}</p>
          ${tabGuide.administration_note ? `<p class="text-[10px] text-slate-600 pt-1 border-t border-slate-100">📌 ${tabGuide.administration_note}</p>` : ''}
        </div>
      </div>
    `;
  }

  const isCaution = guide.status === 'caution';
  const cardBorder = isCaution ? 'border-2 border-amber-400 bg-amber-50/70' : 'border-2 border-emerald-400/80 bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-emerald-50/80';
  const headerIcon = isCaution ? '⚠️' : '💉';
  const headerTitle = isCaution ? `هشدار دوز پلامبز در ${spMeta.label}` : `حجم سرنگ و دوز پلامبز در ${spMeta.label}`;

  return `
    <div class="${cardBorder} p-3.5 sm:p-4 rounded-2xl shadow-sm space-y-2.5 transition-all">
      <!-- هدر کادر و نمایش حجم سرنگ -->
      <div class="flex items-center justify-between gap-2">
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 text-xs font-black ${isCaution ? 'text-amber-950' : 'text-emerald-950'}">
            <span>${headerIcon}</span>
            <span>${headerTitle}:</span>
          </div>
          <p class="text-xs font-bold text-slate-800 mt-0.5 leading-snug truncate" title="${guide.indication || ''}">
            ${guide.indication || 'تسکین و درمان بالینی'}
          </p>
        </div>
        ${volDisplayHtml}
      </div>

      <!-- کادر انتخاب غلظت ویال تزریقی (در صورت وجود چند غلظت) -->
      ${formulationSwitcherHtml}

      <!-- مقادیر مرجع پلامبز و فرمولاسیون دارویی در ایران -->
      <div class="grid grid-cols-2 gap-2 text-xs bg-white/85 p-2.5 rounded-xl border border-slate-200/80">
        <div>
          <span class="text-[11px] text-slate-500 block font-medium">دوز مرجع پلامبز:</span>
          <span class="font-mono font-bold text-slate-900 latin-text text-left block mt-0.5">${guide.range_mg || '-'}</span>
          ${guide.range_ml ? `<span class="text-teal-700 font-mono font-bold text-[11px] latin-text block mt-0.5">معادل: ${guide.range_ml}</span>` : ''}
        </div>
        <div>
          <span class="text-[11px] text-slate-500 block font-medium">فرم دارویی در ایران:</span>
          <span class="font-bold text-slate-900 block mt-0.5 leading-snug">${selectedForm ? selectedForm.name : (guide.formulation || '-')}</span>
          ${guide.route ? `<span class="text-indigo-800 font-bold text-[11px] block mt-0.5">مسیر: ${guide.route}</span>` : ''}
        </div>
      </div>

      <!-- کادر راهنمای دوز قرص و دستور نسخه -->
      ${tabletBoxHtml}

      <!-- فرمول سرانگشتی طلایی ۳۰ ثانیه‌ای -->
      ${guide.rule_of_thumb ? `
        <div class="bg-amber-100/80 border border-amber-300 px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs font-black text-amber-950 shadow-2xs">
          <span class="flex items-center gap-1.5 shrink-0">
            <span>📌</span>
            <span>فرمول سرانگشتی:</span>
          </span>
          <span class="text-left font-bold text-amber-900 latin-text text-xs">${guide.rule_of_thumb}</span>
        </div>
      ` : ''}

      <!-- مروارید بالینی پلامبز -->
      ${guide.pearl ? `
        <div class="text-xs leading-relaxed text-slate-700 bg-white/80 p-2.5 rounded-xl border border-slate-200/60">
          <span class="font-black text-teal-800">💡 نکته بالینی پلامبز:</span>
          <span>${guide.pearl}</span>
        </div>
      ` : ''}
    </div>
  `;
}

// ساخت دکمه‌های گونه برای یک کارت (فقط گونه‌های تحت پوشش یا دارای هشدار برای این داروی مشخص)
function renderSpeciesTabsButtons(drug, activeKey) {
  const availableSpecies = getSpeciesForDrug(drug);
  const p = (typeof getDrugSpecialtyProfile === 'function') ? getDrugSpecialtyProfile(drug) : {};
  
  return availableSpecies.map(spKey => {
    const spInfo = CARD_SPECIES_META[spKey] || { key: spKey, label: spKey, icon: '🐾' };
    const isSelected = spKey === activeKey;
    
    let isLethal = false;
    let isCaution = false;
    
    if (spKey === 'camelids') {
      isLethal = p.isCamelidFatal;
      isCaution = !isLethal && (DRUG_SPECIALTY_KNOWLEDGE.camelids?.[drug.id]?.caution || false);
    } else {
      const guide = drug.species_guide ? drug.species_guide[spKey] : null;
      isLethal = guide && (guide.status === 'contraindicated' || (typeof guide.status === 'string' && guide.status.includes('منع')));
      isCaution = guide && (guide.status === 'caution' || (typeof guide.status === 'string' && guide.status.includes('احتیاط')));
    }

    let btnClasses = isSelected
      ? 'bg-slate-900 text-white font-black shadow-xs ring-2 ring-slate-900/30'
      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold';

    if (isLethal && !isSelected) {
      btnClasses = 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold';
    } else if (isCaution && !isSelected) {
      btnClasses = 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 font-bold';
    }

    return `
      <button type="button"
              onclick="selectCardSpecies('${drug.id}', '${spKey}')"
              class="px-2.5 py-1.5 rounded-xl text-xs flex items-center gap-1 transition-all ${btnClasses}"
              title="${spInfo.label}">
        <span class="text-sm">${spInfo.icon}</span>
        <span>${spInfo.label}</span>
        ${isLethal ? '<span class="text-[10px]" title="منع مصرف">☠️</span>' : ''}
        ${isCaution ? '<span class="text-[10px]" title="احتیاط">⚠️</span>' : ''}
      </button>
    `;
  }).join('');
}

// تغییر گونه انتخاب‌شده روی یک کارت خاص
function selectCardSpecies(drugId, speciesKey) {
  activeCardSpecies[drugId] = speciesKey;
  const drug = DRUGS_DATA.find(d => d.id === drugId);
  if (!drug) return;

  // ۱. به‌روزرسانی محتوای کادر پلامبز
  const contentEl = document.getElementById(`spContent_${drugId}`);
  if (contentEl) {
    contentEl.innerHTML = getPlumbsSpeciesBoxHtml(drug, speciesKey);
  }

  // ۲. به‌روزرسانی نوار دکمه‌های گونه
  const tabsContainer = document.getElementById(`spTabs_${drugId}`);
  if (tabsContainer) {
    tabsContainer.innerHTML = renderSpeciesTabsButtons(drug, speciesKey);
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

// Audio Context برای مترونوم صوتی CPR
let audioCtx = null;
let metronomeInterval = null;
let isMetronomePlaying = false;
let cprTimerInterval = null;
let cprSecondsLeft = 120;
let isCprTimerRunning = false;

// کنترل تغییر وزن سراسری بیمار
function handleGlobalWeightChange(val) {
  const w = parseFloat(val);
  if (!isNaN(w) && w > 0) {
    currentPatientWeight = w;
    updateWeightPresetPills(w);
    const cDisp = document.getElementById('cocktailActiveWeightDisplay');
    if (cDisp) cDisp.textContent = w + ' kg';
    renderDrugs();
    if (typeof activeCocktailsFilter !== 'undefined') {
      renderCocktailsList(activeCocktailsFilter);
    }
  }
}

function setGlobalWeight(w) {
  currentPatientWeight = w;
  const input = document.getElementById('globalPatientWeight');
  if (input) input.value = w;
  updateWeightPresetPills(w);
  const cDisp = document.getElementById('cocktailActiveWeightDisplay');
  if (cDisp) cDisp.textContent = w + ' kg';
  renderDrugs();
  if (typeof activeCocktailsFilter !== 'undefined') {
    renderCocktailsList(activeCocktailsFilter);
  }
}

function updateWeightPresetPills(w) {
  document.querySelectorAll('.weight-preset').forEach(btn => {
    const bw = parseFloat(btn.getAttribute('data-w'));
    if (bw === w) {
      btn.classList.add('bg-emerald-400', 'text-slate-950', 'font-bold', 'shadow-sm');
      btn.classList.remove('bg-white/10', 'text-white', 'hover:bg-white/20');
    } else {
      btn.classList.remove('bg-emerald-400', 'text-slate-950', 'font-bold', 'shadow-sm');
      btn.classList.add('bg-white/10', 'text-white', 'hover:bg-white/20');
    }
  });
}


// مقداردهی اولیه پس از بارگذاری صفحه
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    updateTherapeuticCategoryCounts();
    renderDrugs();
    setupInteractionsCheckboxes();
    runDoseCalculation();
    runDilutionCalculation();
    runFluidCalculation();
    runCprCalculation();
    runCriCalculation();
    if (typeof window !== 'undefined' && window.lucide) {
      lucide.createIcons();
    }
  });
}

// فیلتر جستجو
function stepGlobalWeight(delta) {
  let w = parseFloat(currentPatientWeight) || 10;
  w = Math.max(0.1, Math.round((w + delta) * 10) / 10);
  setGlobalWeight(w);
}

// فیلتر جستجو با پشتیبانی از دکمه پاک‌کردن و استایل مدرن Google Stitch
function handleSearch() {
  const input = document.getElementById('searchInput');
  searchQuery = input ? input.value.trim().toLowerCase() : '';
  const clearBtn = document.getElementById('searchClearBtn');
  if (clearBtn) {
    if (searchQuery.length > 0) {
      clearBtn.classList.remove('hidden');
    } else {
      clearBtn.classList.add('hidden');
    }
  }
  renderDrugs();
}

// پاک‌کردن متن جستجو با یک لمس
function clearSearchInput() {
  const input = document.getElementById('searchInput');
  if (input) {
    input.value = '';
    input.focus();
  }
  const clearBtn = document.getElementById('searchClearBtn');
  if (clearBtn) clearBtn.classList.add('hidden');
  searchQuery = '';
  renderDrugs();
}

// فیلتر تگ‌های سریع Google Stitch Chips
function filterByQuickTag(tag) {
  document.querySelectorAll('#quickSearchChips .stitch-chip').forEach(chip => {
    if (chip.getAttribute('data-qtag') === tag) {
      chip.classList.add('active');
    } else {
      chip.classList.remove('active');
    }
  });

  if (tag === 'all') {
    currentSpecies = 'all';
    currentCategory = 'all';
    currentTherapeuticCategory = 'all';
    currentFavoritesOnly = false;
    searchQuery = '';
    const sInput = document.getElementById('searchInput');
    if (sInput) sInput.value = '';
    const clrBtn = document.getElementById('searchClearBtn');
    if (clrBtn) clrBtn.classList.add('hidden');
    setSpeciesFilter('all');
    setTherapeuticCategoryFilter('all');
    return;
  }

  if (tag === 'emergency') {
    setTherapeuticCategoryFilter('emergency_cpr');
  } else if (tag === 'antibiotic') {
    setTherapeuticCategoryFilter('anti_infective');
  } else if (tag === 'analgesic') {
    setTherapeuticCategoryFilter('analgesia_nsaid');
  } else if (tag === 'anesthetic') {
    setTherapeuticCategoryFilter('anesthesia_sedation');
  } else if (tag === 'cardio_renal') {
    setTherapeuticCategoryFilter('cardiovascular');
  } else if (tag === 'canine') {
    setSpeciesFilter('canine');
  } else if (tag === 'feline') {
    setSpeciesFilter('feline');
  } else if (tag === 'equine') {
    setSpeciesFilter('equine');
  } else if (tag === 'ruminant') {
    setSpeciesFilter('bovine');
  } else if (tag === 'favorites') {
    if (!currentFavoritesOnly) {
      toggleFavoritesFilter();
    }
  }
}

// اسکرول و فوکوس به نوار جستجو
function scrollToSearchAndFocus() {
  const input = document.getElementById('searchInput');
  if (input) {
    input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => input.focus(), 300);
  }
}

// اسکرول نرم به بالای صفحه
function scrollToTopSmooth() {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// تغییر فیلتر رده درمانی و فارماکولوژی
function setTherapeuticCategoryFilter(thcat) {
  currentTherapeuticCategory = thcat;
  document.querySelectorAll('.thcat-pill').forEach(btn => {
    const isTarget = btn.getAttribute('data-thcat') === thcat;
    const badge = btn.querySelector('.count-badge');
    if (isTarget) {
      btn.classList.add('active', 'bg-slate-900', 'text-white', 'border-slate-900', 'shadow-sm');
      btn.classList.remove('bg-slate-50');
      if (badge) {
        badge.classList.add('bg-white/20', 'text-white');
      }
    } else {
      btn.classList.remove('active', 'bg-slate-900', 'text-white', 'border-slate-900', 'shadow-sm');
      btn.classList.add('bg-slate-50');
      if (badge) {
        badge.classList.remove('bg-white/20', 'text-white');
      }
    }
  });
  renderDrugs();
}

// محاسبه و به‌روزرسانی شمارنده‌های دسته‌ها
function updateTherapeuticCategoryCounts() {
  if (typeof DRUGS_DATA === 'undefined') return;
  
  const counts = { all: DRUGS_DATA.length };
  DRUGS_DATA.forEach(d => {
    const primary = d.therapeutic_category;
    if (primary) {
      counts[primary] = (counts[primary] || 0) + 1;
    }
    (d.secondary_categories || []).forEach(sec => {
      counts[sec] = (counts[sec] || 0) + 1;
    });
  });

  Object.entries(counts).forEach(([catKey, count]) => {
    const el = document.getElementById(`cnt_${catKey}`);
    if (el) {
      el.textContent = count;
    }
  });
}

// دکمه میانبر نقشه راه ۱۴ فصل پلامبز
function openChaptersRoadmapModal() {
  openTherapeuticAtlasModal();
}

// باز کردن مودال اطلس و نقشه راه ۱۴ فصل بالینی پلامبز
function openTherapeuticAtlasModal() {
  const modal = document.getElementById('therapeuticAtlasModal');
  const container = document.getElementById('therapeuticAtlasContainer');
  if (!modal || !container || typeof THERAPEUTIC_CATEGORIES_DATA === 'undefined') return;

  const totalActive = DRUGS_DATA.length;
  const totalTargetCore = DRUGS_DATA.length;
  const overallPercent = 100;

  // هدر آماری نقشه راه پلامبز
  let overviewHtml = `
    <div class="mb-4 p-4 rounded-2xl bg-gradient-to-r from-teal-900 via-slate-900 to-indigo-950 text-white border border-teal-500/30 flex flex-wrap items-center justify-between gap-3 shadow-md">
      <div>
        <h4 class="text-sm font-bold flex items-center gap-2">
          <span>نقشه راه و اطلس جامع ۱۶ رفرنس معتبر بین‌المللی دامپزشکی (Plumb's Full Pharmacopeia)</span>
          <span class="text-[10px] bg-emerald-400 text-slate-950 px-2 py-0.5 rounded-full font-black">پوشش ۱۰۰٪ تکمیل</span>
        </h4>
        <p class="text-xs text-teal-200/80 mt-1">تفکیک جامع ۱,۱۲۰ داروی فعال در ۱۶ فصل تخصصی؛ همراه با محاسبات میلی‌گرم، سی‌سی و کسر قرص</p>
      </div>
      <div class="flex items-center gap-3">
        <div class="text-left bg-black/40 px-3.5 py-1.5 rounded-xl border border-teal-400/30">
          <span class="text-[10px] text-teal-300 block">تعداد کل داروهای فعال:</span>
          <span class="text-base font-black text-emerald-300 font-mono">${totalActive} <span class="text-xs font-normal text-teal-100">داروی کامل (۱۰۰٪ فعال)</span></span>
        </div>
      </div>
    </div>
  `;

  // رندر کارت‌های ۱۴ فصل
  const cardsHtml = Object.values(THERAPEUTIC_CATEGORIES_DATA).map(cat => {
    if (cat.id === 'all') return '';

    // داروهای موجود در این رده
    const matchingDrugs = DRUGS_DATA.filter(d => 
      d.therapeutic_category === cat.id || 
      (d.secondary_categories && d.secondary_categories.includes(cat.id))
    );

    const count = matchingDrugs.length;
    const target = cat.target_count || count;
    const pct = target > 0 ? Math.min(100, Math.round((count / target) * 100)) : 100;

    // جستجوی مونوگراف‌های نمونه از نقشه راه
    let sampleMngHtml = '';
    if (typeof PLUMBS_CHAPTERS_ROADMAP_DATA !== 'undefined' && PLUMBS_CHAPTERS_ROADMAP_DATA.chapters) {
      const chData = PLUMBS_CHAPTERS_ROADMAP_DATA.chapters.find(c => c.id === cat.id || c.title_fa.includes(cat.name_fa.split(' ')[0]));
      if (chData && chData.sample_monographs) {
        sampleMngHtml = chData.sample_monographs.slice(0, 6).map(m => `
          <span class="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono border border-slate-200" title="صفحه ${m.printed_page} در پلامبز">
            ${m.name}
          </span>
        `).join(' ');
      }
    }

    const drugBadgesHtml = matchingDrugs.map(d => `
      <button onclick="selectDrugFromAtlas('${d.id}')" class="bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 px-2.5 py-1 rounded-xl text-xs font-bold shadow-2xs transition flex items-center gap-1">
        <span>✓ ${d.generic_name_fa}</span>
      </button>
    `).join(' ');

    return `
      <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition">
        <div class="flex items-start justify-between gap-3 mb-2.5">
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-teal-500/10 text-teal-800 border border-teal-200 flex items-center justify-center shrink-0">
              <i data-lucide="${cat.icon || 'book-open'}" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm sm:text-base font-black text-slate-900">${cat.name_fa}</h3>
                <span class="text-[11px] text-slate-400 font-mono latin-text font-medium">${cat.name_en}</span>
                ${cat.priority ? `<span class="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-full font-bold">${cat.priority}</span>` : ''}
              </div>
              <p class="text-xs text-slate-500 mt-1">${cat.description}</p>
            </div>
          </div>
          <div class="text-left shrink-0">
            <span class="text-xs font-bold ${count > 0 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-600 border-slate-200'} px-2.5 py-1 rounded-xl border block text-center font-mono">
              ${count} / ${target} دارو
            </span>
            <span class="text-[10px] text-slate-400 block mt-1 text-center font-mono">${pct}٪ تکمیل</span>
          </div>
        </div>

        <!-- نوار پیشرفت بار -->
        <div class="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-3">
          <div class="bg-teal-600 h-1.5 rounded-full transition-all duration-500" style="width: ${pct}%"></div>
        </div>

        <!-- داروهای تکمیل شده -->
        <div class="mt-2 pt-2.5 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div class="flex flex-wrap gap-1.5 items-center">
            <span class="text-xs font-bold text-slate-500 pl-1">داروهای فعال:</span>
            ${drugBadgesHtml || '<span class="text-xs text-slate-400 italic">در نوبت ورود روزانه</span>'}
          </div>

          <button onclick="selectCategoryFromAtlas('${cat.id}')" class="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-2xs">
            <span>مشاهده در دارونامه</span>
            <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i>
          </button>
        </div>

        <!-- نمونه مونوگراف‌های هدف این فصل -->
        ${sampleMngHtml ? `
          <div class="mt-2 pt-2 border-t border-dashed border-slate-100 flex items-center gap-1.5 flex-wrap">
            <span class="text-[11px] text-slate-400">برخی مونوگراف‌های این فصل:</span>
            ${sampleMngHtml}
          </div>
        ` : ''}
      </div>
    `;
  }).join('');

  container.innerHTML = overviewHtml + cardsHtml;
  modal.classList.remove('hidden');
  if (window.lucide) {
    lucide.createIcons();
  }
}

function closeTherapeuticAtlasModal() {
  const modal = document.getElementById('therapeuticAtlasModal');
  if (modal) modal.classList.add('hidden');
}

function selectCategoryFromAtlas(catId) {
  closeTherapeuticAtlasModal();
  setTherapeuticCategoryFilter(catId);
  const grid = document.getElementById('drugsGrid');
  if (grid) grid.scrollIntoView({ behavior: 'smooth' });
}

function selectDrugFromAtlas(drugId) {
  closeTherapeuticAtlasModal();
  openMonographModal(drugId);
}

// تغییر فیلتر وضعیت بازار و منبع دارو
function setCategoryFilter(cat) {
  currentCategory = cat;
  document.querySelectorAll('.cat-pill').forEach(btn => {
    if (btn.getAttribute('data-cat') === cat) {
      btn.classList.add('bg-slate-900', 'text-white', 'border-slate-900', 'shadow-sm');
      btn.classList.remove('bg-slate-50');
    } else {
      btn.classList.remove('bg-slate-900', 'text-white', 'border-slate-900', 'shadow-sm');
      btn.classList.add('bg-slate-50');
    }
  });
  renderDrugs();
}

// تغییر فیلتر گونه
function setSpeciesFilter(species) {
  currentSpecies = species;
  document.querySelectorAll('.species-pill').forEach(btn => {
    if (btn.getAttribute('data-species') === species) {
      btn.classList.add('bg-slate-900', 'text-white', 'border-slate-900', 'shadow-sm');
      btn.classList.remove('bg-slate-50', 'text-slate-700', 'border-slate-200');
    } else {
      btn.classList.remove('bg-slate-900', 'text-white', 'border-slate-900', 'shadow-sm');
      btn.classList.add('bg-slate-50', 'text-slate-700', 'border-slate-200');
    }
  });

  // اگر گونه خاصی انتخاب شده، گونه پیش‌فرض همه کارت‌ها با آن همگام شود
  if (species !== 'all' && typeof DRUGS_DATA !== 'undefined') {
    DRUGS_DATA.forEach(d => {
      activeCardSpecies[d.id] = species;
    });
  }

  renderDrugs();
}

// =================================================================
// سامانه علاقه‌مندی‌ها و یادداشت‌های بالینی اختصاصی دامپزشک (Favorites & Clinical Notes)
// Offline LocalStorage Persistent Storage
// =================================================================

var currentFavoritesOnly = false;

function getFavoriteDrugs() {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem('plumbs_favorite_drugs');
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function isFavoriteDrug(drugId) {
  return getFavoriteDrugs().includes(drugId);
}

function toggleFavoriteDrug(drugId, event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  let favs = getFavoriteDrugs();
  if (favs.includes(drugId)) {
    favs = favs.filter(id => id !== drugId);
  } else {
    favs.push(drugId);
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('plumbs_favorite_drugs', JSON.stringify(favs));
    }
  } catch (e) {}
  renderDrugs();
}

function toggleFavoritesFilter() {
  currentFavoritesOnly = !currentFavoritesOnly;
  const btn = document.getElementById('btnFilterFavorites');
  if (btn) {
    if (currentFavoritesOnly) {
      btn.classList.add('bg-amber-500', 'text-white', 'border-amber-600');
      btn.classList.remove('bg-amber-50', 'text-amber-800', 'border-amber-300');
    } else {
      btn.classList.remove('bg-amber-500', 'text-white', 'border-amber-600');
      btn.classList.add('bg-amber-50', 'text-amber-800', 'border-amber-300');
    }
  }
  renderDrugs();
}

function getDoctorClinicalNote(drugId) {
  try {
    if (typeof localStorage === 'undefined') return '';
    return localStorage.getItem('plumbs_note_' + drugId) || '';
  } catch (e) {
    return '';
  }
}

function saveDoctorClinicalNote(drugId) {
  const input = document.getElementById('doctorClinicalNoteInput');
  if (!input) return;
  const val = input.value.trim();
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('plumbs_note_' + drugId, val);
    }
  } catch (e) {}
  const badge = document.getElementById('doctorNoteSavedBadge');
  if (badge) {
    badge.classList.remove('hidden');
    setTimeout(() => badge.classList.add('hidden'), 2500);
  }
}

// تابع تولید آیکون و بج‌های گونه‌های تحت پوشش برای پیش‌نمایش در کارت فشرده
function getSpeciesIconsPreviewHtml(drug) {
  const availableKeys = getSpeciesForDrug(drug);
  if (!availableKeys || availableKeys.length === 0) return '';
  const p = (typeof getDrugSpecialtyProfile === 'function') ? getDrugSpecialtyProfile(drug) : {};

  const badges = availableKeys.map(spKey => {
    const sp = CARD_SPECIES_META[spKey] || { label: spKey, icon: '🐾' };
    const isFatal = (spKey === 'camelids' && p.isCamelidFatal) || (drug.species_guide?.[spKey]?.status === 'contraindicated');
    const badgeStyle = isFatal 
      ? 'bg-rose-50 text-rose-800 border-rose-300 font-bold' 
      : 'bg-slate-100 text-slate-700 border-slate-200/80 font-medium';

    return `
      <span class="inline-flex items-center gap-0.5 text-[10px] ${badgeStyle} px-1.5 py-0.5 rounded-md border shadow-2xs">
        <span>${sp.icon}</span>
        <span>${sp.label}</span>
        ${isFatal ? '<span class="text-[9px]" title="منع مصرف">☠️</span>' : ''}
      </span>
    `;
  }).join(' ');

  return `
    <div class="flex items-center gap-1.5 flex-wrap mt-1">
      <span class="text-[10px] text-slate-400 font-medium">گونه‌ها:</span>
      ${badges}
    </div>
  `;
}

// باز یا بسته کردن یک کارت دارویی خاص (Accordion Card Toggle)
function toggleDrugCard(drugId, event) {
  if (event) {
    const target = event.target;
    if (target.closest('.no-card-toggle') || target.closest('button[onclick*="openMonographModal"]') || target.closest('button[onclick*="toggleFavoriteDrug"]') || target.closest('button[onclick*="openCocktailsModal"]') || target.closest('button[onclick*="quickCalculateForDrug"]') || target.closest('button[onclick*="openSingleDrugInteractions"]')) {
      return;
    }
  }

  const detailsEl = document.getElementById(`card_details_${drugId}`);
  const toggleIcon = document.getElementById(`card_toggle_icon_${drugId}`);
  const toggleText = document.getElementById(`card_toggle_text_${drugId}`);
  const cardEl = document.getElementById(`card_${drugId}`);

  if (!detailsEl) return;

  const isCurrentlyHidden = detailsEl.classList.contains('hidden');
  if (isCurrentlyHidden) {
    detailsEl.classList.remove('hidden');
    expandedCards.add(drugId);
    if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'chevron-up');
    if (toggleText) toggleText.textContent = 'بستن توضیحات و دوزها';
    if (cardEl) {
      cardEl.classList.add('border-teal-500/50', 'shadow-md', 'ring-2', 'ring-teal-500/20');
      cardEl.classList.remove('border-slate-200/90', 'shadow-2xs');
    }
  } else {
    detailsEl.classList.add('hidden');
    expandedCards.delete(drugId);
    if (toggleIcon) toggleIcon.setAttribute('data-lucide', 'chevron-down');
    if (toggleText) toggleText.textContent = 'مشاهده دوزها، سرنگ و جزئیات';
    if (cardEl) {
      cardEl.classList.remove('border-teal-500/50', 'shadow-md', 'ring-2', 'ring-teal-500/20');
      cardEl.classList.add('border-slate-200/90', 'shadow-2xs');
    }
  }

  if (window.lucide) {
    lucide.createIcons();
  }
}

// باز کردن یا بستن یکجای تمامی کارت‌های صفحه (Expand All / Collapse All)
function toggleAllDrugCards() {
  isAllCardsExpanded = !isAllCardsExpanded;
  if (typeof window !== 'undefined') window.isAllCardsExpanded = isAllCardsExpanded;
  if (isAllCardsExpanded) {
    DRUGS_DATA.forEach(d => expandedCards.add(d.id));
  } else {
    expandedCards.clear();
  }
  const btnText = document.getElementById('btnToggleAllText');
  if (btnText) {
    btnText.textContent = isAllCardsExpanded ? 'بستن همه دوزها' : 'باز کردن همه دوزها';
  }
  renderDrugs();
}

if (typeof window !== 'undefined') {
  window.toggleDrugCard = toggleDrugCard;
  window.toggleAllDrugCards = toggleAllDrugCards;
}



// استخراج پروتکل‌های فوق‌تخصصی متصل به دارو
function getSpecialtyProtocolsForDrug(drug) {
  if (!drug) return [];
  const protocolsData = (typeof SUPER_SPECIALTY_PROTOCOLS_DATA !== 'undefined') ? SUPER_SPECIALTY_PROTOCOLS_DATA : [];
  const dId = (drug.id || '').toLowerCase();
  const dFa = (drug.generic_name_fa || '').toLowerCase();
  const dEn = (drug.generic_name_en || '').toLowerCase();

  return protocolsData.filter(p => {
    const pStr = (JSON.stringify(p.calc_items || []) + ' ' + (p.quick_summary?.first_line_drug || '') + ' ' + (p.title_fa || '') + ' ' + (p.title_en || '')).toLowerCase();
    return pStr.includes(dId) || (dEn.length > 3 && pStr.includes(dEn)) || (dFa.length > 3 && pStr.includes(dFa));
  });
}

// تولید چیپ‌های سریع هدر کارت دارو (فقط هشدارهای حیاتی و برچسب‌های تخصصی بدون تکرار گونه‌ها)
function renderDrugSpecialtyPillsHtml(drug) {
  const p = getDrugSpecialtyProfile(drug);
  const pills = [];

  if (p.isOnco) {
    pills.push(`<button type="button" onclick="toggleDrugSpecialtySection('${drug.id}')" class="no-card-toggle inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100 transition shadow-2xs" title="محاسبه‌گر مساحت سطح بدن (BSA) درون این دارو">🎗️ شیمی‌درمانی (BSA)</button>`);
  }
  if (p.isAnesthCri) {
    pills.push(`<button type="button" onclick="toggleDrugSpecialtySection('${drug.id}')" class="no-card-toggle inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition shadow-2xs" title="موتور محاسباتی CRI درون این دارو">💉 انفوزیون CRI</button>`);
  }
  if (p.isOpht) {
    pills.push(`<button type="button" onclick="toggleDrugSpecialtySection('${drug.id}')" class="no-card-toggle inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-cyan-50 text-cyan-800 border border-cyan-200 hover:bg-cyan-100 transition shadow-2xs" title="بررسی خروجی برهم‌کنش قطره‌ها درون این دارو">👁️ قطره‌های چشمی</button>`);
  }
  if (p.isIcu) {
    pills.push(`<button type="button" onclick="toggleDrugSpecialtySection('${drug.id}')" class="no-card-toggle inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg bg-red-50 text-red-800 border border-red-200 hover:bg-red-100 transition shadow-2xs" title="پروتکل احیا و مراقبت ویژه ICU درون این دارو">🚨 مراقبت ویژه ICU</button>`);
  }
  if (p.isCamelidFatal) {
    pills.push(`<span class="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-lg bg-rose-100 text-rose-950 border border-rose-300">☠️ منع در شترسانان</span>`);
  }

  return pills.length > 0 ? `<div class="flex items-center gap-1.5 flex-wrap my-1.5">${pills.join(' ')}</div>` : '';
}

// دکمه اختصاصی اکشن فوتر کارت (فقط ابزارهای محاسباتی تعاملی فعال، بدون تکرار گونه‌ها)
function renderDrugSpecialtyCardButtonHtml(drug) {
  const p = getDrugSpecialtyProfile(drug);
  if (p.isOnco) {
    return `
      <button type="button" onclick="toggleDrugSpecialtySection('${drug.id}')" id="btn_specialty_${drug.id}" class="flex-1 min-w-[70px] py-1.5 px-2 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-900 border border-rose-200 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer" title="مشاهده ماشین‌حساب انکولوژی درون این دارو">
        <span>🎗️ انکولوژی</span>
      </button>
    `;
  }
  if (p.isAnesthCri) {
    return `
      <button type="button" onclick="toggleDrugSpecialtySection('${drug.id}')" id="btn_specialty_${drug.id}" class="flex-1 min-w-[70px] py-1.5 px-2 bg-teal-50 hover:bg-teal-100 active:scale-95 text-teal-900 border border-teal-200 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer" title="مشاهده موتور CRI درون این دارو">
        <span>💉 CRI</span>
      </button>
    `;
  }
  if (p.isOpht) {
    return `
      <button type="button" onclick="toggleDrugSpecialtySection('${drug.id}')" id="btn_specialty_${drug.id}" class="flex-1 min-w-[70px] py-1.5 px-2 bg-cyan-50 hover:bg-cyan-100 active:scale-95 text-cyan-900 border border-cyan-200 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer" title="بررسی خروجی قطره‌ها درون این دارو">
        <span>👁️ قطره‌ها</span>
      </button>
    `;
  }
  if (p.isIcu) {
    return `
      <button type="button" onclick="toggleDrugSpecialtySection('${drug.id}')" id="btn_specialty_${drug.id}" class="flex-1 min-w-[70px] py-1.5 px-2 bg-red-50 hover:bg-red-100 active:scale-95 text-red-900 border border-red-200 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs cursor-pointer" title="پروتکل احیا و مراقبت ویژه ICU درون این دارو">
        <span>🚨 ICU</span>
      </button>
    `;
  }
  return '';
}

// تابع باز کردن و اسکرول مستقیم به تب گونه مشخص درون همان کارت
function openDrugSpeciesTab(drugId, speciesKey) {
  if (typeof expandedCards !== 'undefined' && !expandedCards.has(drugId)) {
    toggleDrugCard(drugId);
  }
  selectCardSpecies(drugId, speciesKey);
  setTimeout(() => {
    const el = document.getElementById(`spContent_${drugId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      el.classList.add('ring-2', 'ring-teal-500');
      setTimeout(() => el.classList.remove('ring-2', 'ring-teal-500'), 1500);
    }
  }, 100);
}

// تابع تاگل باز/بسته کردن ماشین‌حساب و تصمیم‌یار فوق‌تخصصی درون کارت بر اساس کلیک دکمه
function toggleDrugSpecialtySection(drugId) {
  if (typeof expandedCards !== 'undefined' && !expandedCards.has(drugId)) {
    toggleDrugCard(drugId);
  }
  setTimeout(() => {
    const el = document.getElementById(`card_specialty_${drugId}`);
    const btn = document.getElementById(`btn_specialty_${drugId}`);
    if (!el) return;

    const isHidden = el.classList.contains('hidden');
    if (isHidden) {
      el.classList.remove('hidden');
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      el.classList.add('ring-2', 'ring-teal-500');
      setTimeout(() => el.classList.remove('ring-2', 'ring-teal-500'), 1500);
      if (btn) btn.classList.add('ring-2', 'ring-teal-500', 'font-black');
    } else {
      el.classList.add('hidden');
      if (btn) btn.classList.remove('ring-2', 'ring-teal-500', 'font-black');
    }
  }, 100);
}

const openDrugSpecialtySection = toggleDrugSpecialtySection;

// تابع محاسبه خروجی ترکیب دو قطره چشمی
function getOphtPairOutcome(d1, d2) {
  if (d1 === d2) {
    return {
      severity: 'minor',
      badge: '⚠️ تکرار داروی مشابه',
      title: 'اورلود قطره چشمی بدون فایده بالینی',
      outcome: 'چکاندن دو قطره یکسان به فاصله کم، صرفاً باعث شسته شدن قطره اول از کیسه ملتحمه و هدررفت دارو می‌شود. بین دو وعده همان قطره حداقل ۴ تا ۸ ساعت فاصله بگذارید.',
      timing: 'تنها ۱ قطره در هر نوبت کافی است (ظرفیت کیسه ملتحمه حداکثر ۲۵ تا ۳۰ میکرولیتر است).'
    };
  }

  const hasAtropine = d1.includes('atropine') || d2.includes('atropine');
  const hasLatanoprost = d1.includes('latano') || d2.includes('latano');
  const hasTimolol = d1.includes('timolol') || d2.includes('timolol');
  const hasDorzolamide = d1.includes('dorzolamide') || d2.includes('dorzolamide');
  const hasSteroid = d1.includes('pred') || d1.includes('dexa') || d2.includes('pred') || d2.includes('dexa');
  const hasUlcer = d1.includes('ulcer') || d2.includes('ulcer');
  const hasCefazolin = d1.includes('cefazolin') || d2.includes('cefazolin');
  const hasTobramycin = d1.includes('tobra') || d2.includes('tobra');

  if (hasAtropine && hasLatanoprost) {
    return {
      severity: 'major',
      badge: '🔴 منع مصرف مطلق و خطر کوری',
      title: 'آنتاگونیسم متضاد و انسداد زاویه تخلیه در گلوکوم',
      outcome: 'آتروپین مردمک را کاملاً گشاد کرده (میدریاز) و زاویه فیلتراسیون زلالیه را مسدود می‌کند؛ در نتیجه اثر ضدگلوکوم لاتانوپروست خنثی شده و فشار چشم به شدت بالا می‌رود.',
      timing: 'مصرف همزمان اکیداً ممنوع است.'
    };
  }

  if (hasSteroid && hasUlcer) {
    return {
      severity: 'major',
      badge: '🔴 هشدار قرمز سوراخ‌شدگی قرنیه',
      title: 'ذوب استروما و پرفوراسیون چشم (Melting Ulcer)',
      outcome: 'کورتیکواستروئیدها با مهار سنتز کلاژن و فعال‌سازی آنزیم‌های کلاژناز باکتریایی، استرومای قرنیه را ذوب کرده و چشم را ظرف ۲۴ ساعت سوراخ می‌کنند.',
      timing: 'در هرگونه تست فلورسئین مثبت اکیداً ممنوع است.'
    };
  }

  if (hasLatanoprost && hasTimolol) {
    return {
      severity: 'synergy',
      badge: '🟢 هم‌افزایی استاندارد طلایی',
      title: 'افت هم‌افزا و بسیار قوی فشار داخل چشم (IOP)',
      outcome: 'لاتانوپروست خروج زلالیه از مسیر یوواواسکلرال را ارتقا داده و تیمولول ترشح زلالیه در اجسام مژگانی را مهار می‌کند. اثر هم‌افزا موجب افت سریع و پایدار فشار داخل چشم (IOP) در گلوکوم حاد سگ می‌شود.',
      timing: '⏱️ رعایت حداقل ۱۰ دقیقه فاصله زمانی بین دو قطره الزامی است.'
    };
  }

  if (hasTimolol && hasDorzolamide) {
    return {
      severity: 'synergy',
      badge: '🟢 فرمولاسیون کوزوپت (Cosopt)',
      title: 'مهار همزمان ترشح زلالیه از دو مسیر مجزا',
      outcome: 'ترکیب تیمولول و دورزولامید با مهار گیرنده‌های بتا و آنزیم کربنیک انهیدراز، بیشترین مهار ترشح زلالیه را بدون عوارض سیستمیک ایجاد می‌کند.',
      timing: '⏱️ رعایت حداقل ۵ دقیقه فاصله زمانی بین دو قطره.'
    };
  }

  if (hasCefazolin && hasTobramycin) {
    return {
      severity: 'synergy',
      badge: '🟢 پروتکل سه‌گانه نجات قرنیه ذوب‌شونده',
      title: 'پوشش باکتریوسیدال فوق‌وسیع + ضدسودوموناس',
      outcome: 'سفازولین غنی‌شده ۵۰ mg/mL همراه با توبرامایسین غنی‌شده ۱۴ mg/mL و سرم اتولوگ ۵۰٪، تهاجمی‌ترین پروتکل نجات قرنیه در کراتیت‌های ذوب‌شونده هستند.',
      timing: '⏱️ هر ۱ ساعت متناوب با فاصله ۵ دقیقه در ۴۸ ساعت اول.'
    };
  }

  return {
    severity: 'standard',
    badge: '🔵 برهم‌کنش استاندارد',
    title: 'سازگار با رعایت توالی زمانی',
    outcome: 'ترکیب این دو دارو در پروتکل درمانی مجاز است. به دلیل محدودیت حجم کیسه ملتحمه، چکاندن همزمان باعث سرریز و شسته شدن داروی اول می‌شود.',
    timing: '⏱️ حداقل ۵ تا ۱۰ دقیقه فاصله زمانی بین دو قطره؛ ابتدا محلول شفاف سپس سوسپانسیون یا پماد.'
  };
}

// تابع تغییر زنده خروجی ترکیب قطره در کارت
function handleInlineOphtChange(drugId, selectedCompanion) {
  const resBox = document.getElementById(`ophtInlineResult_${drugId}`);
  if (!resBox) return;

  const res = getOphtPairOutcome(drugId, selectedCompanion);
  const badgeClass = res.severity === 'major' ? 'bg-rose-100 text-rose-950 border-rose-300' :
                     res.severity === 'synergy' ? 'bg-emerald-100 text-emerald-950 border-emerald-300' :
                     'bg-cyan-100 text-cyan-950 border-cyan-300';

  resBox.innerHTML = `
    <div class="flex items-center justify-between flex-wrap gap-1.5 mb-1">
      <span class="font-black text-xs text-slate-900">${res.title}</span>
      <span class="text-[10px] font-black px-2 py-0.5 rounded-full border ${badgeClass}">${res.badge}</span>
    </div>
    <p class="text-[11px] text-slate-700 leading-relaxed font-medium mb-1.5">
      ${res.outcome}
    </p>
    <div class="text-[10px] text-slate-600 bg-white/80 p-1.5 rounded-md border border-slate-200">
      ${res.timing}
    </div>
  `;
}

// سوئیت کامل تصمیم‌یار بالینی فوق‌تخصصی درون کارت و مونوگراف
function renderDrugSpecialtySuiteHtml(drug, isMonograph = false) {
  if (!drug) return '';
  const p = getDrugSpecialtyProfile(drug);
  const protocols = getSpecialtyProtocolsForDrug(drug);
  const dId = drug.id;
  const weight = (typeof currentPatientWeight !== 'undefined' && currentPatientWeight > 0) ? currentPatientWeight : 10;

  const oncoInfo = DRUG_SPECIALTY_KNOWLEDGE.oncology[dId] || (p.isOnco ? { stdDose: 1.0, unit: 'mg/m²', stockConc: 1.0, pearl: 'دوز شیمی‌درمانی بر اساس مساحت سطح بدن (m²)؛ مانیتورینگ خونی کامل الزامی است.' } : null);
  const criInfo = DRUG_SPECIALTY_KNOWLEDGE.cri[dId] || (p.isAnesthCri ? { stdRate: 5.0, unit: 'mcg/kg/min', stockConc: 20.0, pearl: 'انفوزیون مداوم با پمپ سرم یا میکروست؛ پایش همودینامیک پیوسته.' } : null);
  const icuInfo = DRUG_SPECIALTY_KNOWLEDGE.icu[dId];
  const camelInfo = DRUG_SPECIALTY_KNOWLEDGE.camelids[dId];
  const aquaInfo = DRUG_SPECIALTY_KNOWLEDGE.aquatics[dId];

  // ۱. ماشین‌حساب مساحت بدن انکولوژی (BSA) درون خود کارت
  let oncoInlineHtml = '';
  if (p.isOnco && oncoInfo) {
    const kDog = 10.1;
    const bsaDog = (kDog * Math.pow(weight, 2/3)) / 100;
    const totalMg = (oncoInfo.stdDose * bsaDog).toFixed(2);
    const syringeMl = (oncoInfo.stockConc > 0 ? (totalMg / oncoInfo.stockConc) : totalMg).toFixed(2);

    oncoInlineHtml = `
      <div class="p-3.5 bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50 border-2 border-rose-300 rounded-2xl space-y-2.5 mb-2.5 text-xs shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="font-black text-rose-950 flex items-center gap-1.5 text-xs">
            <span class="text-base">🎗️</span>
            <span>ماشین‌حساب بالینی مساحت سطح بدن (BSA) و دوز دقیق:</span>
          </span>
          <span class="text-[10px] bg-rose-200/90 text-rose-950 font-black px-2 py-0.5 rounded-md">پروتکل انکولوژی پلامبز</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-center text-[11px] pt-1">
          <div class="bg-white p-2 rounded-xl border border-rose-200">
            <span class="text-slate-500 block text-[10px]">وزن بیمار (kg):</span>
            <span class="font-black text-slate-800 font-mono text-xs">${weight} kg</span>
          </div>
          <div class="bg-white p-2 rounded-xl border border-rose-200">
            <span class="text-slate-500 block text-[10px]">مساحت سطح بدن:</span>
            <span class="font-black text-rose-950 font-mono text-xs">${bsaDog.toFixed(3)} m²</span>
          </div>
          <div class="bg-white p-2 rounded-xl border border-rose-200">
            <span class="text-slate-500 block text-[10px]">دوز تام هر نوبت:</span>
            <span class="font-black text-rose-800 font-mono text-sm">${totalMg} mg</span>
          </div>
          <div class="bg-white p-2 rounded-xl border border-rose-200">
            <span class="text-slate-500 block text-[10px]">حجم دقیق سرنگ:</span>
            <span class="font-black text-indigo-900 font-mono text-sm">${syringeMl} mL</span>
          </div>
        </div>
        <div class="bg-white/80 p-2.5 rounded-xl border border-rose-200 text-[11px] text-rose-950 space-y-1">
          <p><strong>📌 نکته طلایی انکولوژی:</strong> ${oncoInfo.pearl}</p>
          <p class="text-slate-600 pt-1 border-t border-rose-100"><strong>گیت‌وی ایمنی:</strong> شمارش مطلق نوتروفیل‌ها (ANC) باید بالای ۳,۰۰۰ و پلاکت بالای ۱۰۰,۰۰۰ باشد.</p>
        </div>
      </div>
    `;
  }

  // ۲. موتور محاسباتی CRI درون خود کارت
  let criInlineHtml = '';
  if (p.isAnesthCri && criInfo) {
    const mgPerHour = (criInfo.unit === 'mcg/kg/min') ? ((criInfo.stdRate * weight * 60) / 1000) : (criInfo.stdRate * weight);
    const bagVol = 500;
    const fluidRate = 20;
    const totalMgBag = (mgPerHour * (bagVol / fluidRate)).toFixed(1);
    const stockVolMl = (criInfo.stockConc > 0 ? (totalMgBag / criInfo.stockConc) : 0).toFixed(2);
    const syringeRateMl = (criInfo.stockConc > 0 ? (mgPerHour / criInfo.stockConc) : 0).toFixed(2);

    criInlineHtml = `
      <div class="p-3.5 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 border-2 border-teal-300 rounded-2xl space-y-2.5 mb-2.5 text-xs shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="font-black text-teal-950 flex items-center gap-1.5 text-xs">
            <span class="text-base">💉</span>
            <span>موتور محاسباتی انفوزیون مداوم (CRI Infusion Engine):</span>
          </span>
          <span class="text-[10px] bg-teal-200/90 text-teal-950 font-black px-2 py-0.5 rounded-md">استاندارد لامب اند جونز</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-center text-[11px] pt-1">
          <div class="bg-white p-2 rounded-xl border border-teal-200">
            <span class="text-slate-500 block text-[10px]">نرخ دوز پایه:</span>
            <span class="font-bold text-teal-950 font-mono text-xs">${criInfo.stdRate} ${criInfo.unit}</span>
          </div>
          <div class="bg-white p-2 rounded-xl border border-teal-200">
            <span class="text-slate-500 block text-[10px]">تحویل ساعتی به بیمار:</span>
            <span class="font-black text-teal-800 font-mono text-sm">${mgPerHour.toFixed(2)} mg/hr</span>
          </div>
          <div class="bg-white p-2 rounded-xl border border-teal-200">
            <span class="text-slate-500 block text-[10px]">افزودن به سرم ۵۰۰ mL:</span>
            <span class="font-black text-emerald-800 font-mono text-sm">${stockVolMl} mL</span>
          </div>
          <div class="bg-white p-2 rounded-xl border border-teal-200">
            <span class="text-slate-500 block text-[10px]">پمپ سرنگ خالص:</span>
            <span class="font-black text-indigo-900 font-mono text-sm">${syringeRateMl} mL/hr</span>
          </div>
        </div>
        <p class="text-[11px] text-teal-950 leading-relaxed bg-white/80 p-2.5 rounded-xl border border-teal-200">
          <strong>📌 نکته کلینیکی CRI:</strong> ${criInfo.pearl}
        </p>
      </div>
    `;
  }

  // ۳. تصمیم‌یار قطره‌های چشمی و شبیه‌ساز برهم‌کنش درون همان کارت
  let ophtInlineHtml = '';
  if (p.isOpht) {
    const defaultCompanion = dId === 'timolol' ? 'latanoprost' : 'timolol';
    const initialOutcome = getOphtPairOutcome(dId, defaultCompanion);

    ophtInlineHtml = `
      <div class="p-3.5 bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 border-2 border-cyan-300 rounded-2xl space-y-2.5 mb-2.5 text-xs shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="font-black text-cyan-950 flex items-center gap-1.5 text-xs">
            <span class="text-base">👁️</span>
            <span>تصمیم‌یار قطره‌های چشمی و بررسی خروجی ترکیب («این دارو با این دارو»):</span>
          </span>
          <span class="text-[10px] bg-cyan-200/90 text-cyan-950 font-black px-2 py-0.5 rounded-md">اسلاتر و ژلات</span>
        </div>

        <!-- قوانین طلایی ۳ گانه -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px]">
          <div class="bg-white p-2 rounded-xl border border-cyan-200">
            <strong class="text-cyan-950 block">⏱️ قانون ۱: فاصله ۵-۱۰ دقیقه‌ای</strong>
            <span class="text-slate-600">جلوگیری از شسته شدن قطره اول با قطره دوم</span>
          </div>
          <div class="bg-white p-2 rounded-xl border border-cyan-200">
            <strong class="text-cyan-950 block">💧 قانون ۲: ترتیب فیزیکی</strong>
            <span class="text-slate-600">محلول شفاف → سوسپانسیون → پماد روغنی</span>
          </div>
          <div class="bg-white p-2 rounded-xl border border-rose-200">
            <strong class="text-rose-900 block">⚠️ قانون ۳: خط قرمز کورتون</strong>
            <span class="text-slate-600">منع مصرف کورتون در هرگونه زخم قرنیه</span>
          </div>
        </div>

        <!-- شبیه‌ساز انتخاب قطره همراه -->
        <div class="bg-cyan-100/60 p-2.5 rounded-xl border border-cyan-200 space-y-2">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <label class="font-bold text-slate-800 text-[11px]">انتخاب داروی همراه جهت مشاهده خروجی بالینی:</label>
            <select onchange="handleInlineOphtChange('${dId}', this.value)" class="p-1.5 bg-white border border-cyan-300 rounded-lg text-xs font-bold text-slate-800">
              <option value="timolol" ${defaultCompanion === 'timolol' ? 'selected' : ''}>تیمولول ۰.۵٪ (محلول بتا بلاکر)</option>
              <option value="latanoprost" ${defaultCompanion === 'latanoprost' ? 'selected' : ''}>لاتانوپروست ۰.۰۰۵٪ (زالاتان)</option>
              <option value="atropine_ophthalmic">آتروپین ۱٪ (میدرایتیک)</option>
              <option value="dorzolamide">دورزولامید ۲٪ (تروزوپت)</option>
              <option value="prednisolone_eye">پردنیزولون چشمی ۱٪ (کورتون)</option>
              <option value="tacrolimus_ophthalmic">تاکرولیموس روغنی (KCS)</option>
              <option value="cefazolin_fortified">سفازولین غنی‌شده ۵۰ mg/mL</option>
              <option value="tobramycin_fortified">توبرامایسین غنی‌شده ۱۴ mg/mL</option>
              <option value="autologous_serum">سرم اتولوگ ۵۰٪ ضدکلاژناز</option>
              <option value="corneal_ulcer">⚠️ وضعیت زخم قرنیه فعال (اولسر)</option>
            </select>
          </div>

          <!-- خروجی تحلیلی ترکیب دو قطره -->
          <div id="ophtInlineResult_${dId}" class="p-2.5 bg-white rounded-xl border border-cyan-200 space-y-1">
            <div class="flex items-center justify-between flex-wrap gap-1 mb-1">
              <span class="font-black text-xs text-slate-900">${initialOutcome.title}</span>
              <span class="text-[10px] font-black px-2 py-0.5 rounded-full border ${initialOutcome.severity === 'major' ? 'bg-rose-100 text-rose-950 border-rose-300' : 'bg-emerald-100 text-emerald-950 border-emerald-300'}">${initialOutcome.badge}</span>
            </div>
            <p class="text-[11px] text-slate-700 leading-relaxed font-medium">
              ${initialOutcome.outcome}
            </p>
            <div class="text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded-md border border-slate-200">
              ${initialOutcome.timing}
            </div>
          </div>
        </div>

        <!-- فرمول قطره‌های غنی‌شده -->
        <div class="bg-slate-900 text-white p-2.5 rounded-xl text-[10px] space-y-1 border border-slate-800">
          <span class="font-bold text-amber-400 block">🧪 فرمولاسیون قطره‌های غنی‌شده قرنیه ذوب‌شونده:</span>
          <p class="text-slate-300">سفازولین غنی‌شده: ۵۰۰ mg پودر سفازولین در ۹.۲ mL اشک مصنوعی (۵۰ mg/mL) | توبرامایسین غنی‌شده: ۲ mL آمپول ۸۰ mg در ۵ mL قطره تجاری (۱۴ mg/mL).</p>
        </div>
      </div>
    `;
  }

  // ۴. مراقبت‌های ویژه و احیای اورژانس (ICU & Critical Care)
  let icuInlineHtml = '';
  if (icuInfo) {
    icuInlineHtml = `
      <div class="p-3.5 bg-gradient-to-br from-red-50 via-rose-50 to-orange-50 border-2 border-red-300 rounded-2xl space-y-2 mb-2.5 text-xs shadow-2xs">
        <div class="flex items-center justify-between">
          <span class="font-black text-red-950 flex items-center gap-1.5 text-xs">
            <span class="text-base">🚨</span>
            <span>${icuInfo.title}:</span>
          </span>
          <span class="text-[10px] bg-red-200/90 text-red-950 font-black px-2 py-0.5 rounded-md">پروتکل ICU & CPR</span>
        </div>
        <div class="bg-white p-2.5 rounded-xl border border-red-200 text-[11px] space-y-1">
          <p class="font-black text-red-900"><strong>دوز اورژانس / احیا:</strong> ${icuInfo.dose}</p>
          <p class="text-slate-700 leading-relaxed pt-1 border-t border-red-100"><strong>⚠️ هشدار حیاتی بالینی:</strong> ${icuInfo.warning}</p>
        </div>
      </div>
    `;
  }

  // پروتکل‌های فوق‌تخصصی مرتبط در سیستم
  let matchedProtocolsHtml = '';
  if (protocols.length > 0) {
    matchedProtocolsHtml = `
      <div class="p-3 bg-slate-900 text-white rounded-xl space-y-2 text-xs border border-slate-800">
        <div class="flex items-center justify-between">
          <span class="font-bold text-amber-400 flex items-center gap-1.5">
            <span>🏆</span>
            <span>پروتکل‌های فوق‌تخصصی مرتبط در سیستم (${protocols.length} پروتکل):</span>
          </span>
          <span class="text-[10px] text-slate-400">کتابخانه ۴۱ پروتکل مرجع</span>
        </div>
        <div class="space-y-1.5">
          ${protocols.map(pt => `
            <div class="p-2 bg-white/10 rounded-lg flex items-center justify-between gap-2 hover:bg-white/15 transition">
              <span class="text-[11px] font-bold text-white">${pt.title_fa}</span>
              <button type="button" onclick="openSpecialtyProtocolsModal('${pt.category}')" class="text-[10px] font-bold text-teal-300 hover:text-teal-200 bg-teal-900/50 px-2 py-0.5 rounded-md border border-teal-700/50 shrink-0 cursor-pointer">
                مشاهده پروتکل
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  const hasSpecialtyTools = oncoInlineHtml || criInlineHtml || ophtInlineHtml || icuInlineHtml || matchedProtocolsHtml;
  if (!hasSpecialtyTools) return '';

  return `
    <div id="card_specialty_${drug.id}" class="${isMonograph ? '' : 'hidden'} specialty-decision-suite my-3 p-3.5 bg-slate-100/70 border border-slate-200 rounded-2xl text-xs space-y-2.5 transition-all">
      <div class="flex items-center justify-between border-b border-slate-200/80 pb-2">
        <span class="font-black text-slate-900 flex items-center gap-1.5">
          <span class="text-teal-600">🔬</span>
          <span>تصمیم‌یار بالینی و پروتکل‌های فوق‌تخصصی پلامبز</span>
        </span>
        ${!isMonograph ? `
          <button type="button" onclick="toggleDrugSpecialtySection('${drug.id}')" class="text-[10px] bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-2 py-0.5 rounded-md cursor-pointer transition">
            بستن ✕
          </button>
        ` : `
          <span class="text-[10px] bg-teal-100 text-teal-900 font-black px-2 py-0.5 rounded-md">ابزار بالینی اختصاصی</span>
        `}
      </div>

      <!-- ماشین‌حساب‌های تعبیه‌شده اختصاصی درون خود دارو -->
      ${oncoInlineHtml}
      ${criInlineHtml}
      ${ophtInlineHtml}
      ${icuInlineHtml}

      <!-- پروتکل‌های چنددارویی مرتبط -->
      ${matchedProtocolsHtml}
    </div>
  `;
}

// رندر کارت‌های داروها در صفحه
function renderDrugs() {
  const container = document.getElementById('drugsGrid');
  const noResults = document.getElementById('noResults');
  const countBadge = document.getElementById('searchCountBadge');
  const favBadge = document.getElementById('favCountBadge');
  const drugsCountDisplay = document.getElementById('drugsCountDisplay');
  const btnToggleAllText = document.getElementById('btnToggleAllText');

  if (favBadge) favBadge.textContent = getFavoriteDrugs().length;
  if (!container) return;

  const filtered = DRUGS_DATA.filter(drug => {
    // ۰. فیلتر نشان‌شده‌ها (علاقه‌مندی‌ها)
    if (currentFavoritesOnly && !isFavoriteDrug(drug.id)) {
      return false;
    }

    // ۱. فیلتر رده درمانی و فارماکولوژی (پلامبز)
    if (currentTherapeuticCategory !== 'all') {
      const isMatchPrimary = drug.therapeutic_category === currentTherapeuticCategory;
      const isMatchSecondary = drug.secondary_categories && drug.secondary_categories.includes(currentTherapeuticCategory);
      if (!isMatchPrimary && !isMatchSecondary) {
        return false;
      }
    }

    // ۲. فیلتر وضعیت بازار و منبع دارو
    if (currentCategory !== 'all' && drug.category_type !== currentCategory) {
      return false;
    }

    // ۳. فیلتر گونه بیمار
    if (currentSpecies !== 'all') {
      const guideObj = drug.species_guide ? (
        drug.species_guide[currentSpecies] ||
        (currentSpecies === 'aquatics' ? (drug.species_guide.aquatics || drug.species_guide.aquatic) : null)
      ) : null;
      const hasGuide = guideObj && (typeof guideObj === 'string' || guideObj.status !== 'not_recommended');
      
      const checkSpeciesDosing = (val) => {
        if (!val) return false;
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === 'object') return Object.keys(val).length > 0;
        if (typeof val === 'string') return val.trim().length > 0;
        return true;
      };
      const hasDosing = drug.species_dosing && (
        checkSpeciesDosing(drug.species_dosing[currentSpecies]) ||
        (currentSpecies === 'aquatics' && (checkSpeciesDosing(drug.species_dosing.aquatics) || checkSpeciesDosing(drug.species_dosing.aquatic))) ||
        (currentSpecies === 'bovine' && checkSpeciesDosing(drug.species_dosing.ruminant)) ||
        (currentSpecies === 'ovine_caprine' && checkSpeciesDosing(drug.species_dosing.ruminant))
      );
      if (!hasGuide && !hasDosing) return false;
    }

    // ۴. فیلتر جستجوی چندوجهی
    if (searchQuery) {
      const matchEn = (drug.generic_name_en || drug.name_en || '').toLowerCase().includes(searchQuery);
      const matchFa = (drug.generic_name_fa || drug.name_fa || '').includes(searchQuery);
      const matchClass = ((drug.drug_class_fa || '') + ' ' + (drug.drug_class_en || '')).toLowerCase().includes(searchQuery);
      const matchCategory = (drug.therapeutic_category_fa || '').toLowerCase().includes(searchQuery);
      const matchOrgan = (drug.organ_system_fa || '').toLowerCase().includes(searchQuery);
      const matchTags = (drug.clinical_tags || []).join(' ').toLowerCase().includes(searchQuery);
      
      // جستجو در برندهای ایران
      let matchBrand = false;
      if (drug.iranian_market_products) {
        if (Array.isArray(drug.iranian_market_products)) {
          matchBrand = drug.iranian_market_products.join(' ').toLowerCase().includes(searchQuery);
        } else {
          const vetB = (drug.iranian_market_products.veterinary_brands || []).map(b => b.brand_name).join(' ');
          const humB = (drug.iranian_market_products.human_brands || []).map(b => b.brand_name).join(' ');
          matchBrand = (vetB + ' ' + humB).toLowerCase().includes(searchQuery);
        }
      }

      if (!matchEn && !matchFa && !matchClass && !matchBrand && !matchCategory && !matchOrgan && !matchTags) {
        return false;
      }
    }

    return true;
  });

  if (drugsCountDisplay) drugsCountDisplay.textContent = `${filtered.length} دارو`;
  if (btnToggleAllText) btnToggleAllText.textContent = isAllCardsExpanded ? 'بستن همه دوزها' : 'باز کردن همه دوزها';
  if (countBadge) countBadge.textContent = `${filtered.length} دارو یافت شد`;

  if (filtered.length === 0) {
    container.innerHTML = '';
    if (noResults) noResults.classList.remove('hidden');
    return;
  }

  if (noResults) noResults.classList.add('hidden');

  // در صورت جستجوی خاص با نتایج کم (۱ تا ۳ دارو)، برای سهولت بالینی خودکار باز شوند
  if (searchQuery && filtered.length > 0 && filtered.length <= 3) {
    filtered.forEach(d => expandedCards.add(d.id));
  }

  container.innerHTML = filtered.map(drug => {
    // تعیین کلاس رنگ بج
    let badgeClass = 'badge-blue';
    if (drug.badge_color === 'purple') badgeClass = 'badge-purple';
    if (drug.badge_color === 'green') badgeClass = 'badge-green';
    if (drug.badge_color === 'red') badgeClass = 'badge-red';

    // هشدار زایلیتول
    const xylitolBadge = drug.excipient_warnings?.has_xylitol_risk ? `
      <span class="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold">
        ⚠️ هشدار زایلیتول شربت انسانی
      </span>
    ` : '';

    // تعیین گونه فعال کارت دارویی بر اساس گونه‌های تحت پوشش این داروی مشخص
    const drugSpeciesList = getSpeciesForDrug(drug);
    let currentCardSp = activeCardSpecies[drug.id];
    if (!currentCardSp) {
      if (currentSpecies !== 'all' && drugSpeciesList.includes(currentSpecies)) {
        currentCardSp = currentSpecies;
      } else if (drugSpeciesList.includes('canine')) {
        currentCardSp = 'canine';
      } else {
        currentCardSp = drugSpeciesList[0] || 'canine';
      }
    }
    const speciesTabsHtml = renderSpeciesTabsButtons(drug, currentCardSp);
    const speciesBoxHtml = getPlumbsSpeciesBoxHtml(drug, currentCardSp);

    const isExpanded = expandedCards.has(drug.id);
    const speciesIconsPreview = getSpeciesIconsPreviewHtml(drug);

    return `
      <div id="card_${drug.id}" class="drug-card bg-white rounded-3xl p-5 border ${isExpanded ? 'border-teal-500/50 shadow-md ring-2 ring-teal-500/20' : 'border-slate-200/90 shadow-2xs hover:border-teal-300 hover:shadow-sm'} transition-all duration-200 flex flex-col justify-between">
        <div>
          <!-- هدر کلیک‌پذیر کارت جهت باز/بسته شدن آکاردئونی -->
          <div class="cursor-pointer select-none group" onclick="toggleDrugCard('${drug.id}', event)">
            <div class="flex items-start justify-between gap-2 mb-2">
              <div class="flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <h3 class="text-base font-black text-slate-900 group-hover:text-teal-600 transition">
                    ${drug.generic_name_fa}
                  </h3>
                  <span class="text-[10px] px-2 py-0.5 rounded-lg font-bold whitespace-nowrap ${badgeClass}">
                    ${drug.category_badge}
                  </span>
                </div>
                <p class="text-xs text-slate-400 latin-text font-mono mt-0.5">${drug.generic_name_en}</p>
              </div>

              <div class="flex items-center gap-1.5 shrink-0 no-card-toggle">
                <button type="button" onclick="toggleFavoriteDrug('${drug.id}', event)" class="p-1 rounded-xl hover:bg-amber-50 text-base transition" title="نشان کردن در علاقه‌مندی‌ها">
                  ${isFavoriteDrug(drug.id) ? '⭐' : '☆'}
                </button>
              </div>
            </div>

            <!-- برچسب‌های تفکیک رده درمانی و سیستم اندام پلامبز -->
            <div class="flex items-center gap-1.5 flex-wrap mb-1.5">
              <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-800 border border-slate-200/80">
                <i data-lucide="${drug.therapeutic_icon || 'pill'}" class="w-3.5 h-3.5 text-teal-600"></i>
                <span>${drug.therapeutic_category_fa || drug.drug_class_fa}</span>
              </span>
              ${drug.organ_system_fa ? `
                <span class="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-teal-50/80 text-teal-900 border border-teal-200/50">
                  🎯 ${drug.organ_system_fa}
                </span>
              ` : ''}
            </div>

            <!-- رده فارماکولوژی تفصیلی -->
            <p class="text-xs text-slate-500 line-clamp-1 mb-2">${drug.drug_class_fa}</p>

            <!-- برچسب‌های سریع فوق‌تخصصی پلامبز -->
            ${renderDrugSpecialtyPillsHtml(drug)}

            <!-- پیش‌نمایش گونه‌های حیوانی تحت پوشش در حالت فشرده -->
            ${speciesIconsPreview}

            <!-- نوار کلیک برای باز کردن یا بستن دوزها و جزئیات -->
            <div class="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-teal-700 group-hover:text-teal-800 transition">
              <span id="card_toggle_text_${drug.id}" class="flex items-center gap-1 text-[11px]">
                <i data-lucide="layers" class="w-3.5 h-3.5 text-teal-600"></i>
                <span>${isExpanded ? 'بستن توضیحات و دوزها' : 'مشاهده دوزها، سرنگ و جزئیات'}</span>
              </span>
              <div class="w-6 h-6 rounded-full bg-teal-50 border border-teal-200/70 flex items-center justify-center text-teal-700 transition group-hover:bg-teal-100">
                <i id="card_toggle_icon_${drug.id}" data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-4 h-4"></i>
              </div>
            </div>
          </div>

          <!-- بخش جزئیات قابل باز و بسته شدن (Accordion Details) -->
          <div id="card_details_${drug.id}" class="${isExpanded ? '' : 'hidden'} mt-3 pt-3 border-t border-slate-100/80 transition-all">
            <!-- 🐾 نوار انتخاب حیوان با آیکون و تب مستقیم زیر نام دارو -->
            <div class="mb-3">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-[11px] font-black text-slate-700 flex items-center gap-1">
                  <i data-lucide="paw-print" class="w-3.5 h-3.5 text-teal-600"></i>
                  <span>انتخاب حیوان برای دوز و حجم سرنگ:</span>
                </span>
                <span class="text-[10px] text-slate-400 font-medium">کلیک کنید</span>
              </div>
              <div class="flex flex-wrap gap-1.5" id="spTabs_${drug.id}">
                ${speciesTabsHtml}
              </div>
            </div>

            <!-- 💉 کادر بزرگ، خوانا و اختصاصی بالینی پلامبز -->
            <div id="spContent_${drug.id}" class="mb-3">
              ${speciesBoxHtml}
            </div>

            <!-- 🔬 تصمیم‌یار بالینی و پروتکل‌های فوق‌تخصصی پلامبز (تاگل شونده با دکمه اختصاصی) -->
            ${renderDrugSpecialtySuiteHtml(drug, false)}

            <!-- هشدارهای مهم و زایلیتول -->
            ${xylitolBadge ? `<div class="mb-3">${xylitolBadge}</div>` : ''}

            <!-- نکته نسخه‌نویس (خلاصه) -->
            ${drug.prescriber_highlights && (Array.isArray(drug.prescriber_highlights) ? drug.prescriber_highlights.length > 0 : !!drug.prescriber_highlights) ? `
              <div class="bg-amber-50/60 border border-amber-200/70 p-2.5 rounded-xl text-[11px] text-amber-900 leading-relaxed mb-3">
                <span class="font-bold">نکته کلیدی:</span> ${Array.isArray(drug.prescriber_highlights) ? drug.prescriber_highlights[0] : drug.prescriber_highlights}
              </div>
            ` : ''}
          </div>
        </div>

        <!-- دکمه‌های اکشن پایین کارت با ساختار دو ردیفه منظم و بدون بیرون‌زدگی -->
        <div class="pt-3 border-t border-slate-100 mt-2 space-y-1.5 w-full">
          <!-- ردیف ۱: مونوگراف کامل و محاسبه دوز -->
          <div class="grid grid-cols-2 gap-1.5 w-full">
            <button type="button" onclick="openMonographModal('${drug.id}')" class="py-2 px-2 bg-slate-900 hover:bg-slate-800 active:scale-95 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-2xs">
              <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
              <span>مونوگراف</span>
            </button>

            <button type="button" onclick="quickCalculateForDrug('${drug.id}')" class="py-2 px-2 bg-teal-50 hover:bg-teal-100 active:scale-95 text-teal-800 border border-teal-200 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-2xs" title="محاسبه دوز برای بیمار">
              <i data-lucide="calculator" class="w-3.5 h-3.5 text-teal-600"></i>
              <span>محاسبه دوز</span>
            </button>
          </div>

          <!-- ردیف ۲: تداخلات، کوکتل‌ها و ابزارهای تخصصی -->
          <div class="flex flex-wrap items-center gap-1.5 w-full">
            <button type="button" onclick="openSingleDrugInteractions('${drug.id}')" class="flex-1 min-w-[70px] py-1.5 px-2 bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-900 border border-amber-200 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs" title="رادار تداخلات ۳۶۰ درجه این دارو">
              <i data-lucide="shield-alert" class="w-3.5 h-3.5 text-amber-600 shrink-0"></i>
              <span>تداخلات</span>
            </button>
            
            ${drug.synergistic_combinations && drug.synergistic_combinations.length > 0 ? `
              <button type="button" onclick="openCocktailsModal('${drug.id}')" class="flex-1 min-w-[70px] py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 active:scale-95 text-indigo-900 border border-indigo-200 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1 shadow-2xs" title="مشاهده کوکتل‌های ترکیبی و دستور اختلاط سرنگ">
                <i data-lucide="flask-conical" class="w-3.5 h-3.5 text-indigo-600 shrink-0"></i>
                <span>کوکتل‌ها (${drug.synergistic_combinations.length})</span>
              </button>
            ` : ''}

            ${renderDrugSpecialtyCardButtonHtml(drug)}
          </div>
        </div>
      </div>
    `;
  }).join('');

  if (window.lucide) {
    lucide.createIcons();
  }
}

// باز کردن مودال مونوگراف کامل
function openMonographModal(drugId) {
  const drug = DRUGS_DATA.find(d => d.id === drugId);
  if (!drug) return;

  activeMonographDrug = drug;

  document.getElementById('monoGenericFa').textContent = drug.generic_name_fa;
  const monoClassEl = document.getElementById('monoDrugClass');
  if (monoClassEl) {
    monoClassEl.innerHTML = `
      <div class="flex items-center gap-2 flex-wrap mt-1">
        <span class="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-teal-500/30 text-teal-200 border border-teal-400/30">
          <i data-lucide="${drug.therapeutic_icon || 'pill'}" class="w-3 h-3"></i>
          <span>${drug.therapeutic_category_fa || ''}</span>
        </span>
        ${drug.organ_system_fa ? `
          <span class="text-[11px] font-medium text-slate-300">🎯 ${drug.organ_system_fa}</span>
        ` : ''}
        <span class="text-slate-400 text-xs mr-1">• ${drug.drug_class_fa} (${drug.drug_class_en})</span>
      </div>
    `;
  }

  const body = document.getElementById('monoBody');

  // نکات کلیدی نسخه‌نویسی
  let highlightsHtml = '';
  if (Array.isArray(drug.prescriber_highlights)) {
    highlightsHtml = drug.prescriber_highlights.map(h => `
      <li class="flex items-start gap-2">
        <span class="text-teal-600 font-bold shrink-0">•</span>
        <span>${h}</span>
      </li>
    `).join('');
  } else if (drug.prescriber_highlights) {
    highlightsHtml = `
      <li class="flex items-start gap-2">
        <span class="text-teal-600 font-bold shrink-0">•</span>
        <span>${drug.prescriber_highlights}</span>
      </li>
    `;
  }

  // دوزهای تفکیک‌شده گونه‌ها
  let speciesDosingHtml = '';
  const speciesLabels = {
    canine: '🐶 سگ (Canine)',
    feline: '🐱 گربه (Feline)',
    ruminant: '🐄 نشخوارکنندگان (Ruminants)',
    bovine: '🐄 گاو و گوساله (Bovine)',
    ovine_caprine: '🐑 گوسفند و بز (Ovine/Caprine)',
    equine: '🐎 اسب (Equine)',
    poultry: '🐔 طیور (Poultry)',
    avian: '🦜 پرندگان زینتی (Avian)',
    exotic: '🐰 حیوانات اگزوتیک (Exotics)'
  };

  for (const [spKey, rawDoses] of Object.entries(drug.species_dosing || {})) {
    if (!rawDoses) continue;
    const doses = Array.isArray(rawDoses) ? rawDoses : [rawDoses];
    if (doses.length > 0) {
      speciesDosingHtml += `
        <div class="mb-4">
          <h4 class="text-xs font-bold text-slate-800 mb-2 bg-slate-100 px-3 py-1.5 rounded-lg inline-block">
            ${speciesLabels[spKey] || spKey}
          </h4>
          <div class="space-y-2">
            ${doses.map(d => {
              const doseDisplay = (d.dose_low !== undefined)
                ? `${d.dose_low}${d.dose_high && d.dose_high !== d.dose_low ? ' - ' + d.dose_high : ''} ${d.unit || 'mg/kg'}`
                : (d.dose || '');
              return `
              <div class="p-3 bg-white border border-slate-200 rounded-xl text-xs">
                <div class="flex items-center justify-between font-bold text-slate-900 mb-1">
                  <span>${d.indication || 'تجویز بالینی'}</span>
                  ${doseDisplay ? `<span class="text-teal-700 font-mono latin-text font-black text-sm">${doseDisplay}</span>` : ''}
                </div>
                <div class="text-slate-600 flex items-center gap-3 text-[11px] flex-wrap">
                  ${d.route ? `<span><strong>مسیر:</strong> ${d.route}</span>` : ''}
                  ${d.frequency ? `<span><strong>تکرار:</strong> ${d.frequency}</span>` : ''}
                </div>
                ${d.notes ? `<p class="text-slate-500 text-[11px] mt-1 pt-1 border-t border-slate-100">📌 ${d.notes}</p>` : ''}
              </div>
            `;
            }).join('')}
          </div>
        </div>
      `;
    }
  }

  // محصولات بازار ایران
  let iranianMarketHtml = '';
  if (Array.isArray(drug.iranian_market_products)) {
    iranianMarketHtml = `
      <div class="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl text-xs">
        <h5 class="font-bold text-emerald-900 mb-2.5 flex items-center gap-1.5">
          <i data-lucide="building" class="w-4 h-4 text-emerald-700"></i>
          <span>اشکال دارویی و برندهای موجود در بازار ایران:</span>
        </h5>
        <div class="space-y-1.5">
          ${drug.iranian_market_products.map(b => `
            <div class="p-2.5 bg-white rounded-xl border border-emerald-100 flex items-center gap-2 shadow-2xs">
              <span class="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
              <span class="font-bold text-slate-800">${b}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    const vetBrands = drug.iranian_market_products?.veterinary_brands || [];
    const humBrands = drug.iranian_market_products?.human_brands || [];

    iranianMarketHtml = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div class="p-3 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
          <h5 class="font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
            <i data-lucide="building" class="w-4 h-4 text-emerald-700"></i>
            <span>برندهای دامی موجود در ایران:</span>
          </h5>
          ${vetBrands.length > 0 ? vetBrands.map(b => `
            <div class="mb-1.5 pb-1.5 border-b border-emerald-100 last:border-0">
              <span class="font-bold text-emerald-950">${b.brand_name}</span>
              <span class="text-[11px] text-emerald-700 block">${b.company} - (${b.strength})</span>
            </div>
          `).join('') : '<p class="text-slate-400 text-[11px]">برند دامی رسمی در بازار ایران یافت نشد (استفاده از داروی انسانی).</p>'}
        </div>

        <div class="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl">
          <h5 class="font-bold text-blue-900 mb-2 flex items-center gap-1.5">
            <i data-lucide="store" class="w-4 h-4 text-blue-700"></i>
            <span>برندهای انسانی موجود در داروخانه‌های ایران:</span>
          </h5>
          ${humBrands.length > 0 ? humBrands.map(b => `
            <div class="mb-1.5 pb-1.5 border-b border-blue-100 last:border-0">
              <span class="font-bold text-blue-950">${b.brand_name}</span>
              <span class="text-[11px] text-blue-700 block">${b.company} - (${b.strength})</span>
            </div>
          `).join('') : '<p class="text-slate-400 text-[11px]">معادل انسانی ثبت نشده است.</p>'}
        </div>
      </div>
    `;
  }

  // رقیق‌سازی و خرد کردن داروی انسانی
  const compoundingHtml = drug.compounding_and_dilution?.instructions ? `
    <div class="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl text-xs space-y-1.5">
      <h5 class="font-bold text-purple-950 flex items-center gap-1.5">
        <i data-lucide="beaker" class="w-4 h-4 text-purple-700"></i>
        <span>دستورالعمل رقیق‌سازی و خرد کردن داروی انسانی (Pediatric Dilution):</span>
      </h5>
      <p class="text-purple-900 leading-relaxed">${drug.compounding_and_dilution.instructions}</p>
      ${drug.compounding_and_dilution.stability ? `<p class="text-purple-700 text-[11px]">⏳ <strong>پایداری:</strong> ${drug.compounding_and_dilution.stability}</p>` : ''}
    </div>
  ` : '';

  // تداخلات دارویی تطبیق‌یافته با ۱۶ مرجع
  const rawInteractions = (drug.interactions || drug.drug_interactions || []);
  const interactionsHtml = rawInteractions.length > 0 ? `
    <div class="space-y-2.5">
      ${rawInteractions.map(it => {
        const pName = it.drug || it.drug_name || it.name || 'داروی متداخل';
        const pDesc = it.note || (it.mechanism ? (it.mechanism + (it.clinical_effect ? ' • ' + it.clinical_effect : '')) : 'تداخل فارماکولوژیک متقابل.');
        const isMajor = it.severity === 'major';
        const isSynergy = it.severity === 'synergy';
        const borderStyle = isMajor ? 'bg-rose-50/90 border-rose-300 text-rose-950' : (isSynergy ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950' : 'bg-amber-50/90 border-amber-300 text-amber-950');
        const badgeStyle = isMajor ? 'bg-rose-600 text-white' : (isSynergy ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white');
        const badgeLabel = isMajor ? '🔴 ماژور / خط قرمز' : (isSynergy ? '🟢 هم‌افزایی بالینی' : '🟡 متوسط / احتیاط');
        
        return `
          <div class="p-3 rounded-2xl text-xs border ${borderStyle} shadow-2xs space-y-1.5">
            <div class="flex items-center justify-between flex-wrap gap-1.5">
              <span class="font-black text-slate-900">${pName}</span>
              <span class="text-[10px] font-black px-2 py-0.5 rounded-full ${badgeStyle}">${badgeLabel}</span>
            </div>
            <p class="text-[11px] leading-relaxed opacity-90">${pDesc}</p>
          </div>
        `;
      }).join('')}
    </div>
  ` : '<p class="text-xs text-slate-500">تداخل دارویی بحرانی ثبت نشده است.</p>';

  // جدول محاسبه آماده حجم سرنگ برای اوزان مختلف (بدون نیاز به ضرب و تقسیم دستی)
  let readyMatrixHtml = '';
  if (Array.isArray(drug.clinical_volume_rules) && drug.clinical_volume_rules.length > 0) {
    const weightsToSample = [1, 2, 3, 5, 8, 10, 15, 20, 30];
    readyMatrixHtml = `
      <div class="p-4 bg-slate-900 text-white rounded-2xl mb-4 border border-slate-800 shadow-md">
        <div class="flex items-center justify-between mb-2.5">
          <h4 class="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <i data-lucide="syringe" class="w-4 h-4"></i>
            <span>جدول سریع حجم سرنگ به سی‌سی (مراجعه آنی بدون محاسبه دستی):</span>
          </h4>
          <span class="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
            حجم آماده کشیدن در سرنگ (mL)
          </span>
        </div>
        
        <div class="overflow-x-auto">
          <table class="w-full text-center text-xs border-collapse">
            <thead>
              <tr class="bg-slate-800/80 text-slate-300">
                <th class="p-2 text-right">فرمولاسیون و گونه</th>
                <th class="p-2 font-mono">قاعده سرانگشتی</th>
                ${weightsToSample.map(w => `<th class="p-2 font-mono text-emerald-300 font-bold">${w} kg</th>`).join('')}
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              ${drug.clinical_volume_rules.map(rule => {
                if (rule.ml_per_kg) {
                  return `
                    <tr class="hover:bg-slate-800/50 transition">
                      <td class="p-2 text-right font-medium">
                        <span class="text-white block">${rule.species}</span>
                        <span class="text-[10px] text-slate-400 block">${rule.formulation}</span>
                      </td>
                      <td class="p-2 text-slate-300 text-[10px] latin-text">${rule.rule_of_thumb}</td>
                      ${weightsToSample.map(w => {
                        const v = w * rule.ml_per_kg;
                        const vStr = v < 0.1 ? v.toFixed(3) : (v < 1 ? v.toFixed(2) : v.toFixed(1));
                        return `<td class="p-2 font-mono font-black text-emerald-400 text-sm bg-slate-950/40">${vStr}</td>`;
                      }).join('')}
                    </tr>
                  `;
                } else if (rule.fixed_volume_ml) {
                  return `
                    <tr class="hover:bg-slate-800/50 transition">
                      <td class="p-2 text-right font-medium">
                        <span class="text-white block">${rule.species}</span>
                        <span class="text-[10px] text-slate-400 block">${rule.formulation}</span>
                      </td>
                      <td class="p-2 text-purple-300 text-[10px] latin-text">${rule.rule_of_thumb}</td>
                      <td colspan="${weightsToSample.length}" class="p-2 text-center font-bold text-purple-300 bg-purple-950/30">
                        ${rule.fixed_volume_ml}
                      </td>
                    </tr>
                  `;
                }
                return '';
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // ترکیب‌های دارویی هم‌افزا (کوکتل‌ها) در مونوگراف
  let monoSynergyHtml = '';
  if (drug.synergistic_combinations && drug.synergistic_combinations.length > 0) {
    monoSynergyHtml = `
      <div class="p-4 bg-gradient-to-r from-indigo-50/90 to-purple-50/80 border-2 border-indigo-200 rounded-2xl mb-4">
        <div class="flex items-center justify-between mb-3">
          <h4 class="text-xs font-black text-indigo-950 flex items-center gap-1.5">
            <i data-lucide="flask-conical" class="w-4 h-4 text-indigo-600"></i>
            <span>ترکیب‌های هم‌افزا و کوکتل‌های بالینی (${drug.synergistic_combinations.length} کوکتل):</span>
          </h4>
          <button onclick="closeMonographModal(); openCocktailsModal('${drug.id}')" class="text-[11px] bg-indigo-700 hover:bg-indigo-800 text-white font-bold px-3 py-1 rounded-xl shadow-xs transition flex items-center gap-1">
            <span>ماتریس کامل کوکتل‌ها</span>
            <i data-lucide="chevron-left" class="w-3.5 h-3.5"></i>
          </button>
        </div>
        <div class="space-y-3">
          ${drug.synergistic_combinations.map(c => `
            <div class="p-3.5 bg-white border border-indigo-100 rounded-xl shadow-2xs text-xs space-y-2">
              <div class="flex items-center justify-between gap-2 flex-wrap">
                <span class="font-black text-indigo-900 text-sm">${c.cocktail_title || c.partner_name || c.combo}</span>
                ${c.mixing_in_syringe ? `
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full ${c.mixing_in_syringe.includes('✅') ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}">
                    ${c.mixing_in_syringe}
                  </span>
                ` : ''}
              </div>
              ${c.ratio_guide ? `
                <p class="text-slate-800 text-xs bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/60 leading-relaxed">
                  <strong>💉 نسبت و دستور سرنگ:</strong> ${c.ratio_guide}
                </p>
              ` : ''}
              ${c.clinical_use ? `
                <p class="text-slate-800 text-xs bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/60 leading-relaxed">
                  <strong>🎯 کاربرد بالینی:</strong> ${c.clinical_use}
                </p>
              ` : ''}
              ${c.clinical_benefits && c.clinical_benefits.length > 0 ? `
                <div class="bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-lg text-emerald-950 text-[11px]">
                  <span class="font-bold block mb-1">مزایا و برتری‌های بالینی:</span>
                  <ul class="list-disc list-inside space-y-0.5">
                    ${c.clinical_benefits.map(b => `<li>${b}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              ${c.drawbacks_warnings ? `
                <div class="bg-amber-50/60 border border-amber-100 p-2 rounded-lg text-amber-950 text-[11px]">
                  <strong>⚠️ احتیاطات و عوارض:</strong> ${c.drawbacks_warnings}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // ترکیب کلی مونوگراف
  body.innerHTML = `

    <!-- کادر نکات نسخه‌نویسی -->
    <div class="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl">
      <h4 class="text-xs font-bold text-teal-900 mb-2 flex items-center gap-1.5">
        <i data-lucide="check-circle" class="w-4 h-4 text-teal-700"></i>
        <span>نکات کلیدی برای نسخه‌نویس (Prescriber Highlights):</span>
      </h4>
      <ul class="space-y-1 text-teal-950 text-xs">
        ${highlightsHtml}
      </ul>
    </div>

    <!-- 💉 جدول سریع حجم سرنگ برای اوزان مختلف (بدون محاسبه دستی) -->
    ${readyMatrixHtml}

    <!-- 🧪 کوکتل‌های ترکیبی و سینرژی در مونوگراف -->
    ${monoSynergyHtml}

    <!-- 🔬 تصمیم‌یار بالینی و پروتکل‌های فوق‌تخصصی پلامبز در مونوگراف کامل -->
    ${renderDrugSpecialtySuiteHtml(drug, true)}

    <!-- 🔬 ۴ بعد فوق‌تخصصی فارماکولوژی: سازگاری سرنگ، پایداری BUD، ایمنی USP 800 و فارماکوکینتیک CYP450 -->
    ${typeof renderPharmacologyDepthMonographCards === 'function' ? renderPharmacologyDepthMonographCards(drug) : ''}

    <!-- 💉 غلظت‌ها و فرمولاسیون‌های دارویی (تفاوت دوز و زمان مصرف) -->
    ${(drug.available_formulations && drug.available_formulations.length > 0) ? `
      <div class="p-4 bg-slate-50 border border-slate-200 rounded-2xl mb-4">
        <h4 class="text-xs font-black text-slate-900 mb-2 flex items-center gap-1.5">
          <i data-lucide="layers" class="w-4 h-4 text-teal-600"></i>
          <span>فرمولاسیون‌ها و غلظت‌های موجود در بازار (تفاوت دوز و زمان مصرف):</span>
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
          ${drug.available_formulations.map(f => `
            <div class="p-3 bg-white rounded-xl border border-slate-200 space-y-1">
              <div class="flex items-center justify-between">
                <span class="font-black text-slate-900">${f.name}</span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md ${f.id.includes('la') ? 'bg-amber-100 text-amber-900' : 'bg-teal-50 text-teal-800'}">
                  ${f.id.includes('la') ? 'طولانی‌اثر LA' : 'روزانه'}
                </span>
              </div>
              <p class="text-[11px] text-slate-600"><strong>مسیر و فاصله:</strong> ${f.route || ''} - ${f.interval || ''}</p>
              ${f.instructions ? `<p class="text-[10px] text-slate-500 pt-1 border-t border-slate-100">📌 ${f.instructions}</p>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- 💊 راهنمای جامع تجویز قرص و نسخه‌نویسی -->
    ${drug.tablet_dispensing_guide ? `
      <div class="p-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl mb-4 text-xs space-y-2">
        <div class="flex items-center justify-between">
          <h4 class="text-xs font-black text-amber-950 flex items-center gap-1.5">
            <i data-lucide="pill" class="w-4 h-4 text-amber-600"></i>
            <span>راهنمای جامع تجویز قرص و نسخه‌نویسی (Tablet Dispensing Protocol):</span>
          </h4>
          <button type="button" onclick="quickCalculateForDrug('${drug.id}')" class="text-[11px] font-bold px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl transition shadow-2xs">
            محاسبه دوز برای بیمار
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-white/80 p-2.5 rounded-xl border border-amber-200">
          <div>
            <span class="text-slate-500 text-[10px] block">دوز استاندارد هر وعده:</span>
            <span class="font-mono font-black text-amber-950 text-xs">${drug.tablet_dispensing_guide.target_dose_mg_kg} mg/kg</span>
          </div>
          <div>
            <span class="text-slate-500 text-[10px] block">فاصله مصرف:</span>
            <span class="font-bold text-slate-900 text-xs">${drug.tablet_dispensing_guide.interval_fa}</span>
          </div>
          <div>
            <span class="text-slate-500 text-[10px] block">طول دوره درمان پیش‌فرض:</span>
            <span class="font-bold text-slate-900 text-xs">${drug.tablet_dispensing_guide.duration_days_default} روز</span>
          </div>
        </div>
        <div class="text-[11px] text-slate-700 space-y-1">
          <p><strong>شرایط مصرف:</strong> ${drug.tablet_dispensing_guide.administration_note}</p>
          <p class="text-slate-500"><strong>نحوه خرد کردن:</strong> ${drug.tablet_dispensing_guide.scoring_info}</p>
        </div>
      </div>
    ` : ''}

    <!-- دوزهای گونه‌ها -->
    <div>
      <h3 class="text-sm font-black text-slate-900 mb-3 border-b pb-2 flex items-center gap-1.5">
        <i data-lucide="list-checks" class="w-4 h-4 text-teal-600"></i>
        <span>راهنمای دوزاژ بر اساس گونه‌ها:</span>
      </h3>

      ${speciesDosingHtml}
    </div>

    <!-- بازار دارویی ایران -->
    <div>
      <h3 class="text-sm font-black text-slate-900 mb-3 border-b pb-2 flex items-center gap-1.5">
        <i data-lucide="map-pin" class="w-4 h-4 text-teal-600"></i>
        <span>اشکال دارویی و برندهای موجود در بازار ایران:</span>
      </h3>
      ${iranianMarketHtml}
    </div>

    <!-- رقیق‌سازی داروی انسانی -->
    ${compoundingHtml}

    <!-- تداخلات و عوارض -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
          <h4 class="text-xs font-bold text-slate-800">تداخلات دارویی مهم:</h4>
          <button type="button" onclick="closeMonographModal(); openSingleDrugInteractions('${drug.id}')" class="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 transition flex items-center gap-1 shadow-2xs">
            <i data-lucide="zap" class="w-3.5 h-3.5 text-amber-600"></i>
            <span>رادار ۳۶۰ درجه تداخلات این دارو</span>
          </button>
        </div>
        ${interactionsHtml}
      </div>

      <div>
        <h4 class="text-xs font-bold text-slate-800 mb-2">عوارض جانبی شایع:</h4>
        <ul class="text-xs space-y-1 text-slate-600 list-disc list-inside">
          ${Array.isArray(drug.adverse_effects)
            ? drug.adverse_effects.map(e => `<li>${e}</li>`).join('')
            : (drug.adverse_effects ? `<li>${drug.adverse_effects}</li>` : '<li class="text-slate-400">عوارض جانبی خاصی گزارش نشده است.</li>')}
        </ul>
      </div>
    </div>

    <!-- زمان پرهیز از مصرف -->
    ${drug.withdrawal_times && (drug.withdrawal_times.meat_days > 0 || drug.withdrawal_times.milk_hours > 0) ? `
      <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between text-amber-900 font-bold">
        <span>دوره‌های منع مصرف در دام تولیدی:</span>
        <div class="flex items-center gap-3">
          <span>🥩 گوشت: ${drug.withdrawal_times.meat_days} روز</span>
          <span>🥛 شیر: ${drug.withdrawal_times.milk_hours} ساعت</span>
        </div>
      </div>
    ` : ''}

    <!-- 📝 یادداشت‌های بالینی اختصاصی دامپزشک (Clinical Personal Notes) -->
    <div class="mt-4 p-4 bg-amber-50/70 border border-amber-200/90 rounded-2xl space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-black text-amber-950 flex items-center gap-1.5">
          <i data-lucide="edit-3" class="w-4 h-4 text-amber-700"></i>
          <span>📝 یادداشت بالینی و تجربیات شخصی من درباره این دارو:</span>
        </span>
        <span class="text-[10px] text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full font-bold">ذخیره آفلاین در حافظه مرورگر</span>
      </div>
      <textarea id="doctorClinicalNoteInput" rows="2" placeholder="دوزهای موثر، پاسخ بیماران مطب یا برندهای دارویی که تجربه بهتری داشته‌اید را اینجا یادداشت کنید..." class="w-full p-2.5 bg-white border border-amber-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 leading-relaxed font-sans">${getDoctorClinicalNote(drug.id)}</textarea>
      <div class="flex items-center justify-between pt-1">
        <span class="text-[10px] text-emerald-700 font-bold hidden" id="doctorNoteSavedBadge">✓ یادداشت اختصاصی شما با موفقیت ذخیره شد</span>
        <button type="button" onclick="saveDoctorClinicalNote('${drug.id}')" class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs">
          <i data-lucide="save" class="w-3.5 h-3.5"></i>
          <span>ذخیره یادداشت در دستگاه</span>
        </button>
      </div>
    </div>
  `;

  // تنظیم دکمه محاسبه اختصاصی
  const calcBtn = document.getElementById('monoCalcBtn');
  if (calcBtn) {
    calcBtn.onclick = () => {
      closeMonographModal();
      quickCalculateForDrug(drug.id);
    };
  }

  // تنظیم دکمه صدور و چاپ نسخه رسمی
  const prescribeBtn = document.getElementById('monoPrescribeBtn');
  if (prescribeBtn) {
    prescribeBtn.onclick = () => {
      closeMonographModal();
      quickPrescribeForDrug(drug.id);
    };
  }

  document.getElementById('monographModal').classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeMonographModal() {
  document.getElementById('monographModal').classList.add('hidden');
}

// باز کردن سریع ماشین‌حساب برای یک داروی خاص
function quickCalculateForDrug(drugId) {
  const drug = DRUGS_DATA.find(d => d.id === drugId);
  if (!drug) return;

  const profile = getDrugSpecialtyProfile(drug);

  openCalculatorModal();

  if (profile.isOnco) {
    switchCalcTab('oncology');
    const select = document.getElementById('oncoDrugPresetSelect');
    if (select && select.querySelector(`option[value="${drug.id}"]`)) {
      select.value = drug.id;
      onOncologyPresetChange();
    } else {
      runOncologyBsaCalculation();
    }
  } else if (profile.isAnesthCri && ['lidocaine', 'ketamine', 'metoclopramide', 'propofol', 'fentanyl', 'dopamine', 'dobutamine'].includes(drug.id)) {
    switchCalcTab('cri');
    const select = document.getElementById('criPresetSelect');
    if (select && select.querySelector(`option[value="${drug.id}"]`)) {
      select.value = drug.id;
      onCriPresetChange();
    } else {
      runCriCalculation();
    }
  } else if (drug.compounding_and_dilution?.has_calculator) {
    switchCalcTab('dilution');
    document.getElementById('dilPillMg').value = drug.compounding_and_dilution.default_pill_mg || 100;
    document.getElementById('dilVolumeMl').value = drug.compounding_and_dilution.default_diluent_ml || 10;
    runDilutionCalculation();
  } else if (drug.tablet_dispensing_guide) {
    // تب محاسبه دوز قرص و نسخه
    switchCalcTab('pill');
    const selectEl = document.getElementById('pillPresetSelect');
    if (selectEl) {
      if (drug.id === 'amoxicillin_clavulanate') selectEl.value = 'amox_clav';
      else if (drug.id === 'gabapentin') selectEl.value = 'gabapentin';
      else if (drug.id === 'meloxicam') selectEl.value = 'meloxicam';
      else if (drug.id === 'tramadol') selectEl.value = 'tramadol';
      else if (drug.id === 'oxytetracycline') selectEl.value = 'oxytetracycline_po';
      else if (drug.id === 'enrofloxacin') selectEl.value = 'enrofloxacin_po';
      else if (drug.id === 'prazosin') selectEl.value = 'prazosin';
      else if (drug.id === 'famotidine') selectEl.value = 'famotidine';
      else if (drug.id === 'butorphanol') selectEl.value = 'butorphanol_po';
      else if (drug.id === 'fenbendazole') selectEl.value = 'fenbendazole';
      else if (drug.id === 'praziquantel') selectEl.value = 'praziquantel';
      else if (drug.id === 'levothyroxine') selectEl.value = 'levothyroxine';
      else if (drug.id === 'methimazole') selectEl.value = 'methimazole';
      else if (drug.id === 'spironolactone') selectEl.value = 'spironolactone';
      else if (drug.id === 'doxycycline') selectEl.value = 'doxycycline';
      else if (drug.id === 'cephalexin') selectEl.value = 'cephalexin';
      else if (drug.id === 'ciprofloxacin') selectEl.value = 'ciprofloxacin_po';
      else if (drug.id === 'loperamide') selectEl.value = 'loperamide';
      else if (drug.id === 'marbofloxacin') selectEl.value = 'marbofloxacin';
      else if (drug.id === 'terbinafine') selectEl.value = 'terbinafine';
      else if (drug.id === 'apoquel') selectEl.value = 'apoquel';
      else if (drug.id === 'trimethoprim_sulfa') selectEl.value = 'trimethoprim_sulfa';
      else selectEl.value = 'custom';
      onPillPresetChange();
    }
  } else {
    // تب دوز استاندارد
    switchCalcTab('dose');
    // پر کردن دوز سگ به عنوان نمونه اولیه
    let canineDose = 0.2;
    if (drug.species_dosing?.canine) {
      if (Array.isArray(drug.species_dosing.canine) && drug.species_dosing.canine[0]) {
        canineDose = drug.species_dosing.canine[0].dose_low || drug.species_dosing.canine[0].dose || 0.2;
      } else if (typeof drug.species_dosing.canine === 'object') {
        const raw = drug.species_dosing.canine.dose || drug.species_dosing.canine.dose_low;
        if (typeof raw === 'number') canineDose = raw;
        else if (typeof raw === 'string') {
          const match = raw.match(/([\d\.]+)/);
          if (match) canineDose = parseFloat(match[1]);
        }
      }
    }
    document.getElementById('doseRate').value = canineDose;
    runDoseCalculation();
  }
}

// باز و بستن مودال ماشین‌حساب
function openCalculatorModal() {
  const modal = document.getElementById('calculatorModal');
  if (modal) modal.classList.remove('hidden');
  if (typeof initUniversalCalculator === 'function') {
    initUniversalCalculator();
  }
}
function closeCalculatorModal() {
  const modal = document.getElementById('calculatorModal');
  if (modal) modal.classList.add('hidden');
}

function openCalculatorWithTab(tab) {
  openCalculatorModal();
  if (typeof switchCalcTab === 'function') {
    switchCalcTab(tab);
  }
}

// پیش‌فرض‌های داروهای قرص و خوراکی
var PILL_PRESETS = {
  amox_clav: {
    drugName: 'قرص کوآموکسی‌کلاو (Amoxicillin / Clavulanate)',
    doseRate: 13.75,
    defaultStrength: 250,
    strengths: [62.5, 125, 250, 375, 500, 625],
    interval: 'q12h',
    defaultDays: 7,
    instructions: 'همراه غذا خورانده شود تا از استفراغ و تهوع جلوگیری شود.',
    advice: 'قرص‌ها خط‌دار هستند؛ برای سگ‌های تا ۱۰ کیلو نصف قرص ۲۵۰ و برای ۲۰ کیلو ۱ قرص ۲۵۰ کامل تجویز می‌شود.'
  },
  metronidazole: {
    drugName: 'قرص مترونیدازول (Metronidazole)',
    doseRate: 15.0,
    defaultStrength: 250,
    strengths: [250, 500],
    interval: 'q12h',
    defaultDays: 7,
    instructions: 'همراه با غذا خورانده شود. طعم بسیار تلخی دارد.',
    advice: 'در اسهال‌های باکتریایی و ژیاردیازیس؛ در صورت علائم آتاکسی و مسمومیت عصبی فوراً قطع شود.'
  },
  gabapentin: {
    drugName: 'کپسول گاباپنتین (Gabapentin)',
    doseRate: 10.0,
    defaultStrength: 100,
    strengths: [100, 300, 400],
    interval: 'q12h',
    defaultDays: 14,
    instructions: 'پودر کپسول داخل مقدار کمی غذا مخلوط شود. ⚠️ شربت انسانی به علت داشتن زایلیتول در سگ ممنوع است.',
    advice: 'جهت آرام‌بخشی قبل ویزیت گربه، ۱ کپسول ۱۰۰ کامل ۲ ساعت قبل ویزیت خورانده شود.'
  },
  meloxicam: {
    drugName: 'قرص ملوکسیکام (Meloxicam - Mobic)',
    doseRate: 0.1,
    defaultStrength: 7.5,
    strengths: [7.5, 15],
    interval: 'q24h',
    defaultDays: 5,
    instructions: 'حتماً همراه با وعده اصلی غذا خورانده شود. آب تازه همیشه در دسترس باشد.',
    advice: 'در روز اول دوز لودینگ ۲ برابر (0.2 mg/kg) است. برای سگ‌های زیر ۱۵ کیلو از شربت دامی استفاده شود.'
  },
  tramadol: {
    drugName: 'قرص ترامادول (Tramadol HCl)',
    doseRate: 3.0,
    defaultStrength: 50,
    strengths: [50, 100],
    interval: 'q8h',
    defaultDays: 5,
    instructions: 'داخل تشویقی یا پنیر پنهان شود تا در دهان حل نشود (تلخی شدید).',
    advice: 'قرص ۵۰ خط‌دار است. در گربه ترجیحاً داخل پوکه ژلاتینی خورانده شود تا کف دهانی ندهد.'
  },
  oxytetracycline_po: {
    drugName: 'قرص/کپسول اکسی‌تتراسایکلین (Oxytetracycline)',
    doseRate: 20.0,
    defaultStrength: 250,
    strengths: [250],
    interval: 'q8h',
    defaultDays: 10,
    instructions: 'با معده خالی (۱ ساعت قبل یا ۲ ساعت بعد غذا) خورانده شود. همزمان با شیر و ماست مصرف نشود.',
    advice: 'در گربه حتماً پس از بلع قرص ۳ تا ۵ سی‌سی آب با سرنگ خورانده شود تا از زخم مری جلوگیری گردد.'
  },
  enrofloxacin_po: {
    drugName: 'قرص انروفلوکساسین دامی (Enrofloxacin - Baytril)',
    doseRate: 5.0,
    defaultStrength: 50,
    strengths: [50, 150],
    interval: 'q24h',
    defaultDays: 10,
    instructions: 'یک‌بار در روز خورانده شود. در توله‌های در حال رشد به دلیل آسیب غضروف رشد ممنوع است.',
    advice: 'قرص دامی خط‌دار و خوش‌خوراک است. سگ ۱۰ کیلو = ۱ قرص ۵۰ روزانه.'
  },
  prednisolone: {
    drugName: 'قرص پردنیزولون (Prednisolone)',
    doseRate: 1.0,
    defaultStrength: 5,
    strengths: [5, 20, 50],
    interval: 'q12h',
    defaultDays: 7,
    instructions: 'حتماً همراه غذا خورانده شود. مصرف آب و ادرار بیمار افزایش می‌یابد.',
    advice: 'هرگز ناگهانی قطع نشود؛ باید به تدریج تیتر و قطع گردد.'
  },
  furosemide_po: {
    drugName: 'قرص فوروزماید (Furosemide / Lasix)',
    doseRate: 2.5,
    defaultStrength: 40,
    strengths: [20, 40],
    interval: 'q12h',
    defaultDays: 7,
    instructions: 'در درمان ادم ریه و نارسایی قلبی احتقانی. آب تمیز در دسترس باشد.',
    advice: 'سگ ۱۰ کیلو = دوز ۲۵ mg (حدود نصف قرص ۴۰ هر ۱۲ ساعت).'
  },
  cephalexin: {
    drugName: 'کپسول/قرص سفالکسین (Cephalexin)',
    doseRate: 25.0,
    defaultStrength: 250,
    strengths: [250, 500],
    interval: 'q12h',
    defaultDays: 14,
    instructions: 'همراه با غذا خورانده شود. خط اول درمان عفونت‌های پوستی (پیودرما).',
    advice: 'سگ ۱۰ کیلو = ۱ کپسول ۲۵۰ هر ۱۲ ساعت | سگ ۲۰ کیلو = ۱ کپسول ۵۰۰ هر ۱۲ ساعت.'
  },
  fenbendazole: {
    drugName: 'قرص فنبندازول / پانباکور (Fenbendazole / Panacur)',
    doseRate: 50.0,
    defaultStrength: 500,
    strengths: [250, 500],
    interval: 'q24h',
    defaultDays: 3,
    instructions: 'حتماً همراه با غذا خورانده شود تا جذب به اوج برسد. دوره ۳ روز متوالی کامل شود.',
    advice: 'سگ ۱۰ کیلو = ۱ قرص ۵۰۰ روزانه ۳ روز | سگ ۵ کیلو = ۱ قرص ۲۵۰ روزانه ۳ روز.'
  },
  praziquantel: {
    drugName: 'قرص پرازیکوانتل / درونسید (Praziquantel / Droncit)',
    doseRate: 5.0,
    defaultStrength: 50,
    strengths: [50],
    interval: 'single_dose',
    defaultDays: 1,
    instructions: 'تک‌دوز جهت درمان کرم‌های نواری (دیپیلیدیوم و کیست هیداتید). همراه یک لقمه گوشت خورانده شود.',
    advice: 'هر ۱۰ کیلوگرم وزن سگ = ۱ قرص ۵۰ میلی‌گرم (سگ ۵ کیلو = نصف قرص).'
  },
  levothyroxine: {
    drugName: 'قرص لووتیروکسین سدیم (Levothyroxine / Thyro-Tabs)',
    doseRate: 0.02,
    defaultStrength: 0.4,
    strengths: [0.1, 0.2, 0.4, 0.6, 0.8],
    interval: 'q12h',
    defaultDays: 30,
    instructions: 'ترجیحاً همیشه ناشتا (۱ ساعت قبل غذا) خورانده شود. نمونه‌گیری ۴ تا ۶ ساعت پس از قرص باشد.',
    advice: 'سگ ۲۰ کیلو = ۱ قرص 0.4 میلی‌گرم هر ۱۲ ساعت | سگ ۱۰ کیلو = ۱ قرص 0.2 میلی‌گرم هر ۱۲ ساعت.'
  },
  methimazole: {
    drugName: 'قرص متی‌مازول / فیلی‌مازول (Methimazole / Felimazole)',
    doseRate: 0.5,
    defaultStrength: 2.5,
    strengths: [2.5, 5],
    interval: 'q12h',
    defaultDays: 30,
    instructions: 'همراه با وعده غذایی گربه خورانده شود. قرص‌ها به علت طعم بد خرد نشوند.',
    advice: 'دوز شروع برای هر گربه = ۱ قرص ۲.۵ mg دامی هر ۱۲ ساعت (یا نصف قرص ۵ mg انسانی).'
  },
  prazosin: {
    drugName: 'کپسول پرازوسین (Prazosin - شل‌کننده پیشابراه گربه نری و سگ)',
    doseRate: 0.05,
    defaultStrength: 1,
    strengths: [1, 2, 5],
    interval: 'q12h',
    defaultDays: 7,
    instructions: 'همراه با غذا خورانده شود. برای گربه، پودر یک کپسول ۱ میلی‌گرمی در ۴ سی‌سی آب حل شده و ۱ سی‌سی (0.25 mg) مصرف شود.',
    advice: 'خطر افت فشار خون؛ دوز اول تحت پایش تجویز شود و در صورت بی‌حالی شدید دوز کاهش یابد.'
  },
  famotidine: {
    drugName: 'قرص فاموتیدین (Famotidine - محافظ مخاط معده و کنترل اورمی)',
    doseRate: 0.5,
    defaultStrength: 20,
    strengths: [20, 40],
    interval: 'q12h',
    defaultDays: 10,
    instructions: 'ترجیحاً شب‌ها قبل از خواب یا صبح ناشتا ۳۰ تا ۶۰ دقیقه قبل از غذا خورانده شود.',
    advice: 'برای سگ تا ۱۰ کیلوگرم ۱/۴ قرص ۲۰ mg و برای گربه ۲.۵ الی ۵ میلی‌گرم (۱/۴ قرص) کافی است.'
  },
  butorphanol_po: {
    drugName: 'قرص بوتورفانول (Butorphanol - ضدسرفه کلاپس نای سگ)',
    doseRate: 0.08,
    defaultStrength: 1,
    strengths: [1, 5],
    interval: 'q8h',
    defaultDays: 7,
    instructions: 'همراه با غذا یا آب؛ در سرفه‌های خشک و حمله‌ای ناشی از کلاپس نای یا برونشیت مزمن.',
    advice: 'در صورت خواب‌آلودگی مفرط، فاصله مصرف به هر ۱۲ ساعت افزایش یابد.'
  },
  spironolactone: {
    drugName: 'قرص اسپیرونولاکتون (Spironolactone - نارسایی احتقانی قلب و آسیت)',
    doseRate: 2.0,
    defaultStrength: 25,
    strengths: [25, 100],
    interval: 'q12h',
    defaultDays: 30,
    instructions: 'حتماً همراه با وعده غذای چرب خورانده شود تا جذب آن دوچندان شود.',
    advice: 'دیورتیک نگه‌دارنده پتاسیم؛ مهار بازآرایی و فیبروز میوکارد در نارسایی میترال سگ.'
  },
  doxycycline: {
    drugName: 'قرص و کپسول داکسی‌سایکلین (Doxycycline - ارلیشیا، کرم قلب، FIA)',
    doseRate: 10.0,
    defaultStrength: 100,
    strengths: [100],
    interval: 'q24h',
    defaultDays: 28,
    instructions: 'همراه با وعده غذایی؛ در گربه حتماً همراه حداقل ۶ تا ۱۰ سی‌سی آب خورانده شود.',
    advice: '⚠️ در گربه هرگز قرص خشک داده نشود (خطر تنگی مری). دوره ۲۸ روزه ارلیشیا کامل شود.'
  },
  ciprofloxacin_po: {
    drugName: 'قرص سیپروفلوکساسین خوراکی (Ciprofloxacin Oral - عفونت ادراری و پروستاتیت)',
    doseRate: 20.0,
    defaultStrength: 250,
    strengths: [250, 500],
    interval: 'q24h',
    defaultDays: 10,
    instructions: 'ترجیحاً ۲ ساعت قبل یا بعد از غذا ناشتا؛ از مصرف همزمان با لبنیات یا کلسیم خودداری شود.',
    advice: '⛔ منع مطلق در توله‌سگ‌های در حال رشد به علت تخریب غضروف مفصلی.'
  },
  loperamide: {
    drugName: 'کپسول و قرص لوپرامید (Loperamide - ضداسهال غیراختصاصی سگ)',
    doseRate: 0.1,
    defaultStrength: 2,
    strengths: [2],
    interval: 'q12h',
    defaultDays: 2,
    instructions: 'خوراکی؛ حداکثر به مدت ۴۸ ساعت. با بهبود قوام مدفوع بلافاصله قطع گردد.',
    advice: '⛔ هشدار قرمز MDR1: در نژادهای کولی، استرالین شپرد، ژرمن شپرد کما و مرگ تنفسی ایجاد می‌کند!'
  },
  marbofloxacin: {
    drugName: 'قرص ماربوفلوکساسین دامی (Marbocyl - پیودرمای عمقی و بافت نرم)',
    doseRate: 2.75,
    defaultStrength: 20,
    strengths: [5, 20, 80],
    interval: 'q24h',
    defaultDays: 10,
    instructions: 'روزانه یک نوبت؛ در گربه‌ها بر خلاف انروفلوکساسین ایمنی شبکیه چشمی عالی دارد.',
    advice: '⛔ منع مصرف در توله‌سگ‌های در حال رشد به علت آسیب غضروفی.'
  },
  terbinafine: {
    drugName: 'قرص تربینافین (Terbinafine - کچلی قارچی و رینگ‌ورم)',
    doseRate: 35.0,
    defaultStrength: 250,
    strengths: [125, 250],
    interval: 'q24h',
    defaultDays: 30,
    instructions: 'حتماً همراه با وعده غذای چرب یا تشویقی خورانده شود تا جذب آن حداکثر گردد.',
    advice: 'طول دوره درمان حداقل ۴ تا ۶ هفته و ادامه تا اثبات ۲ کشت متوالی منفی قارچی.'
  },
  methocarbamol: {
    drugName: 'قرص متوکاربامول (Methocarbamol / Robaxin - شل‌کننده عضلانی و IVDD)',
    doseRate: 30.0,
    defaultStrength: 500,
    strengths: [500],
    interval: 'q8h',
    defaultDays: 7,
    instructions: 'همراه با غذا خورانده شود تا از تهوع و ناراحتی گوارشی پیشگیری گردد.',
    advice: 'قرص ۵۰۰ خط‌دار است. در آسیب‌های دیسک بین‌مهره‌ای (IVDD) و نقاهت مسمومیت‌ها.'
  },
  misoprostol: {
    drugName: 'قرص میزوپروستول (Misoprostol - پیشگیری و درمان اولسر NSAID)',
    doseRate: 0.003,
    defaultStrength: 0.1,
    strengths: [0.1, 0.2],
    interval: 'q8h',
    defaultDays: 14,
    instructions: 'حتماً همراه با وعده غذایی اصلی خورانده شود تا از اسهال پیشگیری شود.',
    advice: '⛔ هشدار سقط جنین: پرسنل باردار هرگز نباید بدون دستکش با قرص تماس پوستی داشته باشند.'
  },
  clopidogrel: {
    drugName: 'قرص کلوپیدوگرل (Clopidogrel / Plavix - پیشگیری لخته ATE گربه)',
    doseRate: 1.0,
    defaultStrength: 75,
    strengths: [75],
    interval: 'q24h',
    defaultDays: 30,
    instructions: 'همراه با غذا یا پنهان در پوکه ژلاتینی خورانده شود (طعم بسیار تلخ).',
    advice: 'در گربه‌های مبتلا به HCM و دهلیز چپ متسع: ۱/۴ قرص ۷۵ (معادل ۱۸.۷۵ میلی‌گرم) یک‌بار در روز مادام‌العمر.'
  },
  trilostane: {
    drugName: 'کپسول تریلوستان (Trilostane / Vetoryl - سندرم کوشینگ سگ)',
    doseRate: 1.5,
    defaultStrength: 30,
    strengths: [10, 30, 60],
    interval: 'q12h',
    defaultDays: 30,
    instructions: 'حتماً همراه با وعده غذای اصلی خورانده شود تا جذب آن کامل گردد.',
    advice: 'کپسول نباید باز شود؛ پایش منظم با تست تحریک ACTH هر ۱۲ هفته.'
  },
  levetiracetam: {
    drugName: 'قرص لوتیراستام / کپرا (Levetiracetam / Keppra)',
    doseRate: 20.0,
    defaultStrength: 250,
    strengths: [250, 500, 1000],
    interval: 'q8h',
    defaultDays: 30,
    instructions: 'دقیقاً هر ۸ ساعت خورانده شود؛ بدون متابولیسم کبدی و ایمن در نارسایی کبد.',
    advice: 'قرص‌ها خط‌دار هستند؛ در سگ‌های مبتلا به تشنج خوشه‌ای، هرگز دوز دارو نباید فراموش شود.'
  },
  potassium_bromide: {
    drugName: 'پتاسیم بروماید خوراکی سگ (Potassium Bromide - KBr)',
    doseRate: 30.0,
    defaultStrength: 250,
    strengths: [250, 500],
    interval: 'q24h',
    defaultDays: 60,
    instructions: 'حتماً همراه با وعده غذایی خورانده شود. ⛔ در گربه اکیداً ممنوع است (پنومونیت کشنده).',
    advice: 'رژیم غذایی بیمار از نظر نمک (NaCl) نباید تغییر کند؛ نیمه‌عمر دارو ۲۸ روز است.'
  },
  cyclosporine_systemic: {
    drugName: 'کپسول سیکلوسپورین سیستمیک (Cyclosporine / Atopica)',
    doseRate: 5.0,
    defaultStrength: 50,
    strengths: [10, 25, 50, 100],
    interval: 'q24h',
    defaultDays: 30,
    instructions: 'با معده خالی (۲ ساعت قبل یا بعد غذا)؛ فریز ۳۰ دقیقه‌ای کپسول تهوع را برطرف می‌کند.',
    advice: 'کپسول‌های ژلاتینی نباید باز یا سوراخ شوند؛ پس از بهبود بالینی دوز به یک‌روز در میان کاهش می‌یابد.'
  },
  benazepril: {
    drugName: 'قرص بنازپریل / فورتیکور (Benazepril / Fortekor)',
    doseRate: 0.5,
    defaultStrength: 5,
    strengths: [2.5, 5, 20],
    interval: 'q24h',
    defaultDays: 30,
    instructions: 'یک‌بار در روز همراه یا بدون غذا؛ دفع دوگانه کبدی/کلیوی ایمن‌تر از انالاپریل.',
    advice: 'انتخابی در نارسایی قلبی CHF سگ و پروتئینوری CKD گربه؛ قرص‌های فورتیکور طعم‌دار و خط‌دار هستند.'
  },
  sildenafil: {
    drugName: 'قرص سیلدنافیل (Sildenafil / Revatio - پرفشاری ریوی و مگاازوفاگوس)',
    doseRate: 1.0,
    defaultStrength: 50,
    strengths: [25, 50, 100],
    interval: 'q12h',
    defaultDays: 30,
    instructions: 'هر ۸ تا ۱۲ ساعت با معده خالی یا غذای سبک خورانده شود. ⛔ منع همزمان با نیتروگلیسیرین.',
    advice: 'بهبود فوری سنکوپ و تنفس در سگ‌های مبتلا به پرفشاری ریوی ناشی از بیماری دریچه میترال.'
  },
  oxybutynin: {
    drugName: 'قرص اکسی‌بوتینین (Oxybutynin / Ditropan - بی‌اختیاری ادرار اسپاستیک)',
    doseRate: 0.2,
    defaultStrength: 5,
    strengths: [5],
    interval: 'q8h',
    defaultDays: 14,
    instructions: 'همراه با غذا خورانده شود؛ قبل از شروع درمان انسداد مکانیکی مجاری ادرار باید رد شود.',
    advice: 'قرص ۵ خط‌دار است؛ شل‌کننده عضله دتروسور مثانه و درمان بی‌اختیاری فوریتی (Urge Incontinence).'
  },
  apoquel: {
    drugName: 'قرص اوکلاسیتینیب (Apoquel / اوکلاسیتینیب - ضدخارش آلرژی سگ)',
    doseRate: 0.5,
    defaultStrength: 5.4,
    strengths: [3.6, 5.4, 16],
    interval: 'q12h',
    defaultDays: 14,
    instructions: 'همراه یا بدون غذا؛ برای ۱۴ روز اول هر ۱۲ ساعت، سپس هر ۲۴ ساعت یک‌بار.',
    advice: 'شروع اثر سریع ۴ ساعته؛ قرص‌های خط‌دار ویژه دوزبندی دقیق سگ‌های زیر یک سال ممنوع است.'
  },
  trimethoprim_sulfa: {
    drugName: 'قرص/شربت کو-تریموکسازول (Trimethoprim / Sulfa)',
    doseRate: 20.0,
    defaultStrength: 480,
    strengths: [120, 480, 960],
    interval: 'q12h',
    defaultDays: 10,
    instructions: 'همراه با مقدار کافی آب آشامیدنی جهت پیشگیری از کریستالوری در کلیه.',
    advice: 'ایمن در خرگوش و جوندگان؛ در سگ دوبرمن پینچر و بیماران با خشکی چشم ممنوع است.'
  }
};

// سوئیچ تب‌های ماشین‌حساب جامع و ابزارهای ۱۶ کتاب مرجع
function switchCalcTab(tab) {
  const tabsConfig = [
    { id: 'dose', paneId: 'calcPaneDose', tabId: 'calcTabDose', onSelect: () => runUniversalCalculation() },
    { id: 'pill', paneId: 'calcPanePill', tabId: 'calcTabPill', onSelect: () => runPillCalculation() },
    { id: 'dilution', paneId: 'calcPaneDilution', tabId: 'calcTabDilution', onSelect: () => typeof runDilutionCalculation === 'function' && runDilutionCalculation() },
    { id: 'fluid', paneId: 'calcPaneFluid', tabId: 'calcTabFluid', onSelect: () => typeof runFluidCalculation === 'function' && runFluidCalculation() },
    { id: 'cri', paneId: 'calcPaneCri', tabId: 'calcTabCri', onSelect: () => runCriCalculation() },
    { id: 'toxicology', paneId: 'calcPaneToxicology', tabId: 'calcTabToxicology', onSelect: () => runChocolateCalculation() },
    { id: 'labref', paneId: 'calcPaneLabRef', tabId: 'calcTabLabRef', onSelect: () => renderLabRefTable('canine') },
    { id: 'transfusion', paneId: 'calcPaneTransfusion', tabId: 'calcTabTransfusion', onSelect: () => runTransfusionCalculation() },
    { id: 'ophthalmology', paneId: 'calcPaneOphthalmology', tabId: 'calcTabOphthalmology', onSelect: () => runOphthalmologyDiag() },
    { id: 'oncology', paneId: 'calcPaneOncology', tabId: 'calcTabOncology', onSelect: () => runOncologyBsaCalculation() },
    { id: 'iris', paneId: 'calcPaneIris', tabId: 'calcTabIris', onSelect: () => runIrisCalculation() },
    { id: 'anesthesia', paneId: 'calcPaneAnesthesia', tabId: 'calcTabAnesthesia', onSelect: () => runAnesthesiaCalculation() },
    { id: 'nutrition', paneId: 'calcPaneNutrition', tabId: 'calcTabNutrition', onSelect: () => runNutritionCalculation() },
    { id: 'wildlife_safety', paneId: 'calcPaneWildlifeSafety', tabId: 'calcTabWildlifeSafety' },
    { id: 'withdrawal', paneId: 'calcPaneWithdrawal', tabId: 'calcTabWithdrawal', onSelect: () => runWithdrawalCalculation() }
  ];

  tabsConfig.forEach(cfg => {
    const pane = document.getElementById(cfg.paneId);
    const tabEl = document.getElementById(cfg.tabId);
    if (pane) pane.classList.add('hidden');
    if (tabEl) {
      tabEl.classList.remove('border', 'border-teal-600', 'text-teal-900', 'bg-white', 'shadow-2xs', 'border-b-2', 'text-teal-800');
      tabEl.classList.add('text-slate-600');
    }
  });

  const selected = tabsConfig.find(c => c.id === tab);
  if (selected) {
    const activePane = document.getElementById(selected.paneId);
    const activeTabEl = document.getElementById(selected.tabId);
    if (activePane) activePane.classList.remove('hidden');
    if (activeTabEl) {
      activeTabEl.classList.remove('text-slate-600');
      activeTabEl.classList.add('border', 'border-teal-600', 'text-teal-900', 'bg-white', 'shadow-2xs');
    }
    if (typeof selected.onSelect === 'function') {
      try {
        selected.onSelect();
      } catch (err) {
        console.warn('Error running tab onSelect:', err);
      }
    }
  }
}

// =====================================================================
// ماشین‌حساب جامع بالینی چندگونه‌ای و چندفرمی (Universal Clinical Dose & Formulation Engine)
// =====================================================================

function initUniversalCalculator() {
  const spInput = document.getElementById('univSpecies');
  const currentSp = spInput ? spInput.value || 'canine' : 'canine';
  const formInput = document.getElementById('univFormRoute');
  const currentForm = formInput ? formInput.value || 'injectable' : 'injectable';
  setUniversalSpecies(currentSp, false);
  setUniversalFormRoute(currentForm, false);
  populateUniversalDrugSelect();
  runUniversalCalculation();
}

function setUniversalSpecies(sp, shouldCalc = true) {
  const spInput = document.getElementById('univSpecies');
  if (spInput) spInput.value = sp;

  document.querySelectorAll('.univ-sp-btn').forEach(btn => {
    btn.classList.remove('bg-slate-900', 'text-white', 'border-slate-900');
    btn.classList.add('bg-white', 'text-slate-700', 'border-slate-200');
  });
  const activeBtn = document.getElementById(`btnSp_${sp}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-white', 'text-slate-700', 'border-slate-200');
    activeBtn.classList.add('bg-slate-900', 'text-white', 'border-slate-900');
  }

  populateUniversalDrugSelect();
  if (shouldCalc) runUniversalCalculation();
}

function setUniversalFormRoute(route, shouldCalc = true) {
  const formInput = document.getElementById('univFormRoute');
  if (formInput) formInput.value = route;

  document.querySelectorAll('.univ-form-btn').forEach(btn => {
    btn.classList.remove('bg-teal-50', 'text-teal-900', 'border-teal-300', 'shadow-2xs');
    btn.classList.add('bg-white', 'text-slate-700', 'border-slate-200');
  });
  const activeBtn = document.getElementById(`btnForm_${route}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-white', 'text-slate-700', 'border-slate-200');
    activeBtn.classList.add('bg-teal-50', 'text-teal-900', 'border-teal-300', 'shadow-2xs');
  }

  const bottleField = document.getElementById('univBottleField');
  if (bottleField) {
    if (route === 'oral_liquid') bottleField.classList.remove('hidden');
    else bottleField.classList.add('hidden');
  }

  const concLabel = document.getElementById('univConcLabel');
  if (concLabel) {
    if (route === 'oral_pill') concLabel.textContent = 'قدرت هر قرص (mg/قرص):';
    else if (route === 'aquatic_powder') concLabel.textContent = 'غلظت حمام (ppm یا mg/L):';
    else if (route === 'oral_liquid') concLabel.textContent = 'غلظت شربت (mg/mL):';
    else concLabel.textContent = 'غلظت ویال (mg/mL):';
  }

  const doseRateLabel = document.getElementById('univDoseRateLabel');
  if (doseRateLabel) {
    if (route === 'aquatic_powder') doseRateLabel.textContent = 'دوز حمام یا آب (ppm یا mg/L):';
    else doseRateLabel.textContent = 'دوز هدف (mg/kg):';
  }

  populateUniversalDrugSelect();
  if (shouldCalc) runUniversalCalculation();
}

function populateUniversalDrugSelect() {
  const select = document.getElementById('univDrugSelect');
  if (!select) return;

  const spInput = document.getElementById('univSpecies');
  const formInput = document.getElementById('univFormRoute');
  const sp = spInput ? spInput.value : 'canine';
  const form = formInput ? formInput.value : 'injectable';

  select.innerHTML = '';

  const presetsObj = (typeof UNIVERSAL_CALC_PRESETS !== 'undefined') ? UNIVERSAL_CALC_PRESETS : (typeof window !== 'undefined' ? window.UNIVERSAL_CALC_PRESETS : null);
  const speciesList = (presetsObj && presetsObj[sp]) ? presetsObj[sp] : [];

  const matched = speciesList.filter(item => item.formRoute === form);
  const otherMatches = speciesList.filter(item => item.formRoute !== form);

  if (matched.length > 0) {
    const group = document.createElement('optgroup');
    group.label = `داروهای آماده ${getSpeciesFaName(sp)} [فرم ${getFormFaName(form)}]`;
    matched.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} (${p.defaultRate} mg/kg - ${p.defaultConc} mg/${form === 'oral_pill' ? 'قرص' : 'mL'})`;
      group.appendChild(opt);
    });
    select.appendChild(group);
  }

  if (otherMatches.length > 0) {
    const otherGroup = document.createElement('optgroup');
    otherGroup.label = `سایر فرم‌های دارویی ${getSpeciesFaName(sp)}`;
    otherMatches.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.id;
      opt.textContent = `${p.name} [${getFormFaName(p.formRoute)}]`;
      otherGroup.appendChild(opt);
    });
    select.appendChild(otherGroup);
  }

  const customOpt = document.createElement('option');
  customOpt.value = 'custom';
  customOpt.textContent = '✏️ داروی سفارشی (وارد کردن دستی دوز، غلظت و فاصله)';
  select.appendChild(customOpt);

  if (matched.length > 0) {
    select.value = matched[0].id;
  } else if (otherMatches.length > 0) {
    select.value = otherMatches[0].id;
  } else {
    select.value = 'custom';
  }

  onUniversalDrugChange();
}

function getSpeciesFaName(sp) {
  const names = {
    canine: 'سگ',
    feline: 'گربه',
    equine: 'اسب',
    bovine: 'گاو',
    ovine_caprine: 'گوسفند و بز',
    poultry: 'طیور',
    camelids: 'شترسانان',
    aquatics: 'آبزیان',
    wildlife: 'حیات‌وحش'
  };
  return names[sp] || sp;
}

function getFormFaName(form) {
  const forms = {
    injectable: 'تزریقی',
    oral_liquid: 'شربت / مایع خوراکی',
    oral_pill: 'قرص / کپسول',
    topical_drop: 'قطره موضعی',
    aquatic_powder: 'پودر / حمام غوطه‌وری'
  };
  return forms[form] || form;
}

function onUniversalDrugChange() {
  const select = document.getElementById('univDrugSelect');
  if (!select) return;
  const val = select.value;

  const spInput = document.getElementById('univSpecies');
  const sp = spInput ? spInput.value : 'canine';

  const presetsObj = (typeof UNIVERSAL_CALC_PRESETS !== 'undefined') ? UNIVERSAL_CALC_PRESETS : (typeof window !== 'undefined' ? window.UNIVERSAL_CALC_PRESETS : null);
  const speciesList = (presetsObj && presetsObj[sp]) ? presetsObj[sp] : [];
  const preset = speciesList.find(item => item.id === val);

  const doseRateInput = document.getElementById('univDoseRate');
  const concInput = document.getElementById('univConc');
  const intervalSelect = document.getElementById('univInterval');
  const daysInput = document.getElementById('univDays');
  const bottleInput = document.getElementById('univBottleMl');
  const routeAdvice = document.getElementById('univRouteAdvice');
  const drugHint = document.getElementById('univDrugHint');

  if (preset) {
    if (doseRateInput) doseRateInput.value = preset.defaultRate;
    if (concInput) concInput.value = preset.defaultConc;
    if (intervalSelect && preset.interval) intervalSelect.value = preset.interval;
    if (daysInput && preset.days) daysInput.value = preset.days;
    if (bottleInput && preset.bottleMl) bottleInput.value = preset.bottleMl;
    if (routeAdvice) routeAdvice.textContent = (preset.route ? preset.route + ' - ' : '') + (preset.notes || 'توصیه بالینی استاندارد مرجع');
    if (drugHint) drugHint.textContent = `پیش‌فرض آماده: ${preset.name}`;
  } else {
    if (drugHint) drugHint.textContent = 'ورودی دستی دوز و غلظت دلخواه';
    if (routeAdvice) routeAdvice.textContent = 'توصیه بالینی: دوز، غلظت و دوره درمان را بر اساس شرایط بالینی بیمار تنظیم کنید.';
  }

  runUniversalCalculation();
}

function runUniversalCalculation() {
  const weightInput = document.getElementById('univWeight');
  const rateInput = document.getElementById('univDoseRate');
  const concInput = document.getElementById('univConc');
  const intervalSelect = document.getElementById('univInterval');
  const daysInput = document.getElementById('univDays');
  const bottleInput = document.getElementById('univBottleMl');
  const formInput = document.getElementById('univFormRoute');
  const spInput = document.getElementById('univSpecies');
  const select = document.getElementById('univDrugSelect');

  const weight = parseFloat(weightInput ? weightInput.value : 0) || 0;
  const rate = parseFloat(rateInput ? rateInput.value : 0) || 0;
  const conc = parseFloat(concInput ? concInput.value : 0) || 0;
  const interval = intervalSelect ? intervalSelect.value : 'q12h';
  const days = parseInt(daysInput ? daysInput.value : 1) || 1;
  const bottleMl = parseFloat(bottleInput ? bottleInput.value : 100) || 100;
  const formRoute = formInput ? formInput.value : 'injectable';
  const species = spInput ? spInput.value : 'canine';
  const drugId = select ? select.value : '';

  const calcFn = (typeof calculateUniversalDoseDispensing === 'function') 
    ? calculateUniversalDoseDispensing 
    : (typeof window !== 'undefined' && typeof window.calculateUniversalDoseDispensing === 'function' ? window.calculateUniversalDoseDispensing : null);

  if (!calcFn) return;

  const res = calcFn({
    weight,
    rate,
    conc,
    formRoute,
    species,
    interval,
    days,
    bottleMl,
    drugId
  });

  const doseMgEl = document.getElementById('univDoseMgRes');
  if (doseMgEl) doseMgEl.textContent = `${res.mgPerDose} mg`;

  const volEl = document.getElementById('univVolRes');
  if (volEl) {
    if (formRoute === 'oral_pill') {
      volEl.innerHTML = `${res.tabletFractionFa} <span class="text-xs font-normal" id="univVolUnit">(${res.volPerDose} قرص)</span>`;
    } else {
      volEl.innerHTML = `${res.volPerDose} <span class="text-xs font-normal" id="univVolUnit">${res.unitTextFa}</span>`;
    }
  }

  const syringeEl = document.getElementById('univSyringeRes');
  if (syringeEl) syringeEl.textContent = res.syringeAdvice;

  const totalEl = document.getElementById('univTotalDispenseRes');
  if (totalEl) totalEl.textContent = res.totalDispenseText;

  const countEl = document.getElementById('univDosesCountRes');
  if (countEl) countEl.textContent = `تعداد کل وعده‌ها: ${res.totalDosesCount} نوبت`;

  const rxLabelEl = document.getElementById('univRxLabel');
  if (rxLabelEl) rxLabelEl.textContent = res.rxLabel;

  const alertBox = document.getElementById('univSafetyAlertBox');
  const alertText = document.getElementById('univSafetyAlertText');
  if (alertBox && alertText) {
    if (res.safetyAlert) {
      alertBox.classList.remove('hidden');
      alertText.textContent = res.safetyAlert;
    } else {
      alertBox.classList.add('hidden');
    }
  }
}

// =====================================================================
// ماژول‌های ۱۰ گنجینه بالینی ۱۶ کتاب مرجع
// =====================================================================

// ۱. سم‌شناسی: شکلات و تئوبرومین
function runChocolateCalculation() {
  const wEl = document.getElementById('toxChocWeight');
  const tEl = document.getElementById('toxChocType');
  const gEl = document.getElementById('toxChocGrams');
  if (!wEl || !tEl || !gEl) return;

  const weight = parseFloat(wEl.value) || 10;
  const chocType = tEl.value;
  const grams = parseFloat(gEl.value) || 100;

  const toxFn = (typeof calculateChocolateToxicity === 'function')
    ? calculateChocolateToxicity
    : (typeof window !== 'undefined' && typeof window.calculateChocolateToxicity === 'function' ? window.calculateChocolateToxicity : null);

  if (!toxFn) return;
  const res = toxFn(weight, chocType, grams);

  const totEl = document.getElementById('toxChocTotalMg');
  if (totEl) totEl.textContent = `${res.totalMg} mg`;

  const mgKgEl = document.getElementById('toxChocMgKg');
  if (mgKgEl) mgKgEl.textContent = `${res.mgPerKg} mg/kg`;

  const badge = document.getElementById('toxChocBadge');
  if (badge) {
    badge.className = `text-xs font-black px-2.5 py-0.5 rounded-full border ${res.badgeColor}`;
    badge.textContent = res.severity;
  }

  const adviceEl = document.getElementById('toxChocAdvice');
  if (adviceEl) adviceEl.textContent = res.advice;
}

// ۲. جداول مقادیر مرجع آزمایشگاهی CBC، بیوشیمی و گازهای خون
function renderLabRefTable(sp) {
  const container = document.getElementById('labRefContent');
  if (!container) return;

  document.querySelectorAll('.lab-sp-btn').forEach(btn => {
    btn.classList.remove('bg-slate-900', 'text-white', 'border-slate-900');
    btn.classList.add('bg-white', 'text-slate-700', 'border-slate-200');
  });
  const activeBtn = document.getElementById(`labBtn_${sp}`);
  if (activeBtn) {
    activeBtn.classList.remove('bg-white', 'text-slate-700', 'border-slate-200');
    activeBtn.classList.add('bg-slate-900', 'text-white', 'border-slate-900');
  }

  const data = (typeof LAB_REFERENCE_INTERVALS !== 'undefined') ? LAB_REFERENCE_INTERVALS[sp] : (window.LAB_REFERENCE_INTERVALS ? window.LAB_REFERENCE_INTERVALS[sp] : null);
  if (!data) {
    container.innerHTML = '<div class="p-4 bg-amber-50 text-amber-900 rounded-xl">داده‌های آزمایشگاهی این گونه در دسترس نیست.</div>';
    return;
  }

  function renderTableSection(title, icon, rows, colorTheme) {
    if (!rows || rows.length === 0) return '';
    return `
      <div class="bg-white rounded-2xl border border-${colorTheme}-200 overflow-hidden shadow-2xs">
        <div class="px-4 py-2.5 bg-${colorTheme}-50/80 border-b border-${colorTheme}-100 flex items-center justify-between">
          <span class="font-bold text-${colorTheme}-950 flex items-center gap-1.5 text-xs">
            <span>${icon}</span>
            <span>${title}</span>
          </span>
          <span class="text-[10px] text-${colorTheme}-700 font-mono font-bold">${rows.length} پارامتر</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-right text-xs">
            <thead class="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px]">
              <tr>
                <th class="py-2 px-3 font-bold">پارامتر (Test / Analyte)</th>
                <th class="py-2 px-3 font-bold font-mono text-center">دامنه مرجع (Reference Range)</th>
                <th class="py-2 px-3 font-bold font-mono text-center">واحد</th>
                <th class="py-2 px-3 font-bold">تفسیر و اهمیت بالینی</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              ${rows.map(r => `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-2 px-3 font-bold text-slate-800">${r.param}</td>
                  <td class="py-2 px-3 font-mono font-bold text-teal-800 text-center latin-text">${r.range}</td>
                  <td class="py-2 px-3 font-mono text-slate-500 text-center text-[11px] latin-text">${r.unit}</td>
                  <td class="py-2 px-3 text-slate-600 text-[11px] leading-relaxed">${r.note || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div class="space-y-4">
      <div class="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
        <span class="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
          <span class="text-base">${data.icon || '🩸'}</span>
          <span>مقادیر فیزیولوژیک مرجع: ${data.speciesFa}</span>
        </span>
        <span class="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">منبع: Carpenter Exotic & Plumb's Vet Formulary</span>
      </div>
      ${renderTableSection('شمارش کامل سلول‌های خونی (CBC / Complete Blood Count)', '🩸', data.cbc, 'rose')}
      ${renderTableSection('بیوشیمی سرم و الکترولیت‌ها (Serum Biochemistry & Electrolytes)', '🧪', data.biochem, 'blue')}
      ${renderTableSection('آنالیز گازهای خون و اسید-باز (Blood Gases & Acid-Base Balance)', '🫁', data.bloodGas, 'emerald')}
    </div>
  `;
}

// ۳. تصمیم‌یار تشخیصی چشم‌پزشکی
function runOphthalmologyDiag() {
  const sttInput = document.getElementById('ophtSttValue');
  const iopInput = document.getElementById('ophtIopValue');
  const sttResult = document.getElementById('ophtSttResult');
  const iopResult = document.getElementById('ophtIopResult');

  if (sttInput && sttResult) {
    const stt = parseFloat(sttInput.value) || 0;
    if (stt < 10) {
      sttResult.className = 'p-3 bg-rose-50 rounded-xl border border-rose-300 text-rose-950 font-bold';
      sttResult.innerHTML = `🔴 <strong>خشکی شدید قرنیه و چشم (Severe KCS):</strong> اشک کمتر از ۱۰ mm/min! تجویز فوری سیکلوسپورین ۰.۲٪ چشمی (Optimmune) یا تاکرولیموس ۰.۰۲٪ هر ۱۲ ساعت به همراه قطره اشک مصنوعی هر ۲ تا ۴ ساعت الزامی است.`;
    } else if (stt < 15) {
      sttResult.className = 'p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-950 font-bold';
      sttResult.innerHTML = `🟡 <strong>مشکوک یا مراحل اولیه KCS (Early / Borderline):</strong> اشک ۱۰ تا ۱۴ mm/min. شروع اشک مصنوعی با ویسکوزیته بالا (هیالورونات سدیم) و ارزیابی مجدد پس از ۳ هفته.`;
    } else {
      sttResult.className = 'p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-bold';
      sttResult.innerHTML = `🟢 <strong>ترشح اشک نرمال (Normal STT):</strong> ترشح اشک در محدوده فیزیولوژیک سگ و گربه (15-25 mm/min) قرار دارد.`;
    }
  }

  if (iopInput && iopResult) {
    const iop = parseFloat(iopInput.value) || 0;
    if (iop < 10) {
      iopResult.className = 'p-3 bg-amber-50 rounded-xl border border-amber-300 text-amber-950 font-bold';
      iopResult.innerHTML = `🟡 <strong>افت غیرطبیعی فشار کره چشم (Low IOP):</strong> شک قوی به یووئیت قدامی حاد (Anterior Uveitis). تجویز قطره آتروپین ۱٪ چشمی جهت تسکین درد مژگانی و گشاد کردن مردمک + ضدالتهاب موضعی (در صورت سلامت قرنیه).`;
    } else if (iop > 25) {
      iopResult.className = 'p-3 bg-rose-50 rounded-xl border border-rose-300 text-rose-950 font-bold';
      iopResult.innerHTML = `🔴 <strong>افزایش حاد فشار داخل چشم: اورژانس گلوکوم (Acute Glaucoma Emergency):</strong> فشار بالای ۲۵ mmHg خطر نابینایی دائمی شبکیه ظرف ۲۴ تا ۴۸ ساعت! تجویز فوری قطره دورزولامید ۲٪ + تیمولول ۰.۵٪ (کوزوپت) هر ۲۰ دقیقه و انفوزیون مانیتول ۲۰٪ تزریقی (1-2 g/kg IV آهسته).`;
    } else {
      iopResult.className = 'p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950 font-bold';
      iopResult.innerHTML = `🟢 <strong>فشار داخل چشم طبیعی (Normal IOP: 12-25 mmHg):</strong> خطر گلوکوم یا یووئیت حاد مطرح نیست.`;
    }
  }
}

// ۴. مرحله‌بندی نارسایی کلیه IRIS و تعدیل دوز
function runIrisCalculation() {
  const spSelect = document.getElementById('irisSpecies');
  const crInput = document.getElementById('irisCreatinine');
  const titleEl = document.getElementById('irisStageTitle');
  const actionEl = document.getElementById('irisStageAction');
  if (!spSelect || !crInput || !titleEl || !actionEl) return;

  const sp = spSelect.value;
  const cr = parseFloat(crInput.value) || 0;

  const data = (typeof IRIS_RENAL_STAGING !== 'undefined') ? IRIS_RENAL_STAGING : (window.IRIS_RENAL_STAGING || null);
  if (!data || !data[sp]) return;

  const list = data[sp];
  let stageObj = list[0];
  if (sp === 'dog') {
    if (cr < 1.4) stageObj = list[0];
    else if (cr <= 2.8) stageObj = list[1];
    else if (cr <= 5.0) stageObj = list[2];
    else stageObj = list[3];
  } else {
    if (cr < 1.6) stageObj = list[0];
    else if (cr <= 2.8) stageObj = list[1];
    else if (cr <= 5.0) stageObj = list[2];
    else stageObj = list[3];
  }

  titleEl.textContent = `${stageObj.stage} - کراتینین ${stageObj.creatinine} (SDMA: ${stageObj.sdma})`;
  actionEl.innerHTML = `<strong>پروتکل اقدام بالینی IRIS:</strong> ${stageObj.action}`;
}

// ۵. ماشین بیهوشی، مدار و ونتیلاتور
function runAnesthesiaCalculation() {
  const wInput = document.getElementById('anesWeight');
  const cSelect = document.getElementById('anesCircuit');
  const flowEl = document.getElementById('anesOxygenFlow');
  const tidalEl = document.getElementById('anesTidalVol');
  if (!wInput || !flowEl || !tidalEl) return;

  const weight = parseFloat(wInput.value) || 10;
  const circuit = cSelect ? cSelect.value : 'rebreathing';

  const tidalLow = Math.round(weight * 10);
  const tidalHigh = Math.round(weight * 15);
  tidalEl.textContent = `${tidalLow} - ${tidalHigh} mL`;

  if (circuit === 'bain') {
    const flow = Math.max(1.0, (weight * 0.2)).toFixed(1);
    flowEl.textContent = `${flow} L/min`;
  } else {
    const flowMaint = Math.max(0.5, (weight * 0.03)).toFixed(1);
    flowEl.textContent = `${flowMaint} L/min`;
  }
}

// ۶. محاسبه‌گر کالری RER و برنامه تغذیه ریکاوری
function runNutritionCalculation() {
  const wInput = document.getElementById('nutrWeight');
  const totalRerEl = document.getElementById('nutrTotalRer');
  const day1El = document.getElementById('nutrDay1');
  const day2El = document.getElementById('nutrDay2');
  const day3El = document.getElementById('nutrDay3');
  if (!wInput || !totalRerEl) return;

  const weight = parseFloat(wInput.value) || 10;
  const nutFn = (typeof calculateClinicalNutritionRER === 'function')
    ? calculateClinicalNutritionRER
    : (typeof window !== 'undefined' && typeof window.calculateClinicalNutritionRER === 'function' ? window.calculateClinicalNutritionRER : null);

  if (!nutFn) return;

  const res = nutFn(weight);
  totalRerEl.textContent = `${res.rerKcal} kcal/day`;
  if (day1El) day1El.textContent = `${res.day1Kcal} kcal`;
  if (day2El) day2El.textContent = `${res.day2Kcal} kcal`;
  if (day3El) day3El.textContent = `${res.day3Kcal} kcal`;
}

// تغییر داروی پیش‌فرض در ماشین‌حساب قرص
function onPillPresetChange() {
  const select = document.getElementById('pillPresetSelect');
  if (!select) return;
  const key = select.value;
  const preset = PILL_PRESETS[key];
  if (!preset) return;

  const doseRateInput = document.getElementById('pillDoseRate');
  const intervalSelect = document.getElementById('pillInterval');
  const daysInput = document.getElementById('pillDays');
  const strengthSelect = document.getElementById('pillStrengthSelect');
  const customStrengthInput = document.getElementById('pillCustomStrength');

  if (doseRateInput) doseRateInput.value = preset.doseRate;
  if (intervalSelect) intervalSelect.value = preset.interval;
  if (daysInput) daysInput.value = preset.defaultDays;

  if (strengthSelect) {
    strengthSelect.value = preset.defaultStrength.toString();
    if (!strengthSelect.value) {
      strengthSelect.value = 'custom_mg';
      if (customStrengthInput) {
        customStrengthInput.classList.remove('hidden');
        customStrengthInput.value = preset.defaultStrength;
      }
    } else if (customStrengthInput) {
      customStrengthInput.classList.add('hidden');
    }
  }

  // پر کردن وزن فعلی بیمار از هدر در صورت امکان
  const pillWeightInput = document.getElementById('pillWeight');
  if (pillWeightInput && currentPatientWeight > 0) {
    pillWeightInput.value = currentPatientWeight;
  }

  runPillCalculation();
}

function onPillStrengthSelectChange() {
  const strengthSelect = document.getElementById('pillStrengthSelect');
  const customInput = document.getElementById('pillCustomStrength');
  if (strengthSelect && customInput) {
    if (strengthSelect.value === 'custom_mg') {
      customInput.classList.remove('hidden');
    } else {
      customInput.classList.add('hidden');
    }
  }
  runPillCalculation();
}

// اجرای محاسبات جامع قرص و دستور نسخه
function runPillCalculation() {
  const weightInput = document.getElementById('pillWeight');
  const doseRateInput = document.getElementById('pillDoseRate');
  const strengthSelect = document.getElementById('pillStrengthSelect');
  const customStrengthInput = document.getElementById('pillCustomStrength');
  const intervalSelect = document.getElementById('pillInterval');
  const daysInput = document.getElementById('pillDays');
  const presetSelect = document.getElementById('pillPresetSelect');

  if (!weightInput || !doseRateInput || !strengthSelect) return;

  const weight = parseFloat(weightInput.value) || 0;
  const rate = parseFloat(doseRateInput.value) || 0;
  const strVal = strengthSelect.value;
  const tabletMg = strVal === 'custom_mg' ? (parseFloat(customStrengthInput?.value) || 250) : (parseFloat(strVal) || 250);
  const intervalCode = intervalSelect ? intervalSelect.value : 'q12h';
  const durationDays = parseInt(daysInput ? daysInput.value : 7) || 7;

  const res = calculateTabletDispensing(weight, rate, tabletMg, intervalCode, durationDays);

  const presetKey = presetSelect ? presetSelect.value : 'custom';
  const preset = PILL_PRESETS[presetKey];
  const drugTitle = preset ? preset.drugName : 'داروی خوراکی تجویز‌شده';
  const instructions = preset ? preset.instructions : 'طبق دستور مصرف شود.';
  const advice = preset ? preset.advice : '';

  // خواندن مشخصات کیس و صاحب حیوان
  const pName = document.getElementById('pillPatientName')?.value?.trim?.() || '';
  const pSpecies = document.getElementById('pillPatientSpecies')?.value || 'سگ (Canine)';
  const cName = document.getElementById('pillClientName')?.value?.trim?.() || '';
  const cPhone = document.getElementById('pillClientPhone')?.value?.trim?.() || '';

  const patientLine = pName ? `🐾 کیس بیمار: ${pName} (${pSpecies}) - وزن: ${weight} kg` : `🐾 مشخصات بیمار: ${pSpecies} با وزن تقریبی ${weight} کیلوگرم`;
  const clientLine = cName ? `👤 سرپرست: ${cName}${cPhone ? ' • تلفن: ' + cPhone : ''}\n` : '';

  // به‌روزرسانی نتایج در DOM
  const resMgEl = document.getElementById('pillResMgPerDose');
  const resDoseTextEl = document.getElementById('pillResDoseText');
  const resTotalEl = document.getElementById('pillResTotalTablets');
  const resAdviceEl = document.getElementById('pillResPracticalAdvice');
  const rxBoxEl = document.getElementById('pillPrescriptionBox');

  if (resMgEl) resMgEl.textContent = `${res.mgPerDose} mg`;
  if (resDoseTextEl) resDoseTextEl.textContent = `${res.fractionText} (${tabletMg} mg)`;
  if (resTotalEl) resTotalEl.textContent = `${res.totalTablets} عدد قرص (${durationDays} روز)`;
  if (resAdviceEl) resAdviceEl.textContent = `${res.roundingAdvice} • ${instructions} ${advice ? '• ' + advice : ''}`;

  if (rxBoxEl) {
    rxBoxEl.textContent = `📋 نسخه دارویی بیمار (دستور مصرف تحویل به صاحب حیوان)
--------------------------------------------------
${patientLine}
${clientLine}💊 نام دارو: ${drugTitle}
📏 دوز هر قرص: ${tabletMg} میلی‌گرم
🎯 دوز هدف هر وعده: ${res.mgPerDose} میلی‌گرم

⏱️ دستور مصرف در هر وعده:
    «${res.fractionText} ${res.intervalLabelFa}»

🍽️ نحوه خورانیدن:
    ${instructions}

📅 طول دوره درمان:
    ${durationDays} روز متوالی

📦 تعداد کل قرص نسخه جهت تحویل:
    ${res.totalTablets} عدد قرص کامل
--------------------------------------------------
📌 توصیه‌های مهم دامپزشک:
    ۱. دوره درمان را حتماً تا آخرین قرص کامل کنید و با بهبود ظاهری دارو را قطع ننمایید.
    ۲. در صورت بروز هرگونه استفراغ مکرر، بی‌حالی شدید یا اسهال با کلینیک تماس بگیرید.`;
  }

  updateRxQueueStatus();
}

// کپی متن نسخه قرص از داخل مودال
function copyPillPrescriptionText() {
  const rxBoxEl = document.getElementById('pillPrescriptionBox');
  const btnTextEl = document.getElementById('copyPillBtnText');
  if (!rxBoxEl) return;

  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(rxBoxEl.textContent).then(() => {
      if (btnTextEl) btnTextEl.textContent = '✅ کپی شد!';
      setTimeout(() => {
        if (btnTextEl) btnTextEl.textContent = 'کپی متن نسخه';
      }, 2000);
    }).catch(() => {
      prompt('متن نسخه را کپی نمایید:', rxBoxEl.textContent);
    });
  } else {
    prompt('متن نسخه را کپی نمایید:', rxBoxEl.textContent);
  }
}

// =========================================================
// سامانه صدور و چاپ نسخه رسمی بالینی دامپزشکی (Print & PDF Rx Engine)
// =========================================================
var currentPrescriptionQueue = [];
var currentRxSerial = null;
if (typeof window !== 'undefined') {
  window.currentPrescriptionQueue = currentPrescriptionQueue;
  window.currentRxSerial = currentRxSerial;
}

function generateRxSerial() {
  if (!currentRxSerial) {
    const y = 1405;
    const rand = Math.floor(1000 + Math.random() * 9000);
    currentRxSerial = `RX-${y}-${rand}`;
  }
  return currentRxSerial;
}

function getPersianDateString() {
  try {
    return new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date());
  } catch (e) {
    return '۲۸ مهر ۱۴۰۵';
  }
}

function getCurrentPillRxItem() {
  const weightInput = document.getElementById('pillWeight');
  const doseRateInput = document.getElementById('pillDoseRate');
  const strengthSelect = document.getElementById('pillStrengthSelect');
  const customStrengthInput = document.getElementById('pillCustomStrength');
  const intervalSelect = document.getElementById('pillInterval');
  const daysInput = document.getElementById('pillDays');
  const presetSelect = document.getElementById('pillPresetSelect');

  const weight = parseFloat(weightInput?.value) || (typeof currentPatientWeight !== 'undefined' ? currentPatientWeight : 10);
  const rate = parseFloat(doseRateInput?.value) || 13.75;
  const strVal = strengthSelect?.value || '250';
  const tabletMg = strVal === 'custom_mg' ? (parseFloat(customStrengthInput?.value) || 250) : (parseFloat(strVal) || 250);
  const intervalCode = intervalSelect ? intervalSelect.value : 'q12h';
  const durationDays = parseInt(daysInput ? daysInput.value : 7) || 7;

  const res = calculateTabletDispensing(weight, rate, tabletMg, intervalCode, durationDays);
  const presetKey = presetSelect ? presetSelect.value : 'custom';
  const preset = (typeof PILL_PRESETS !== 'undefined') ? PILL_PRESETS[presetKey] : null;

  return {
    id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    drugName: preset ? preset.drugName : 'داروی خوراکی تجویز‌شده',
    brandName: preset?.advice || '',
    strength: tabletMg,
    weight: weight,
    doseRate: rate,
    mgPerDose: res.mgPerDose,
    fractionText: res.fractionText,
    interval: intervalCode,
    intervalFa: res.intervalLabelFa,
    days: durationDays,
    totalTablets: res.totalTablets,
    instructions: preset ? preset.instructions : 'طبق دستور پزشک مصرف شود.',
    advice: res.roundingAdvice,
    addedAt: new Date()
  };
}

function addCurrentPillToPrescriptionQueue() {
  const item = getCurrentPillRxItem();
  currentPrescriptionQueue.push(item);
  updateRxQueueStatus();
  
  const statusEl = document.getElementById('pillRxQueueStatus');
  if (statusEl) {
    statusEl.innerHTML = `<span class="text-emerald-400 font-bold">✅ «${item.drugName}» افزوده شد (${currentPrescriptionQueue.length} قلم در نسخه)</span>`;
    setTimeout(updateRxQueueStatus, 3000);
  }
}

function updateRxQueueStatus() {
  const statusEl = document.getElementById('pillRxQueueStatus');
  if (!statusEl) return;
  if (currentPrescriptionQueue.length === 0) {
    statusEl.textContent = 'آماده صدور تک‌دارویی';
  } else {
    statusEl.innerHTML = `<span class="text-amber-400 font-bold">📋 اقلام در نسخه چنددارویی: ${currentPrescriptionQueue.length} قلم</span>`;
  }
}

function removePrescriptionItem(index) {
  if (index >= 0 && index < currentPrescriptionQueue.length) {
    currentPrescriptionQueue.splice(index, 1);
    renderPrescriptionSheet();
    updateRxQueueStatus();
  }
}

function clearPrescriptionItems() {
  currentPrescriptionQueue = [];
  updateRxQueueStatus();
  renderPrescriptionSheet();
}

function renderPrescriptionSheet() {
  const sheet = document.getElementById('prescriptionPrintSheet');
  if (!sheet) return;

  // اگر صف خالی بود، قلم فعلی ماشین‌حساب قرص نمایش داده می‌شود
  let items = [...currentPrescriptionQueue];
  if (items.length === 0) {
    items.push(getCurrentPillRxItem());
  }

  const pName = document.getElementById('pillPatientName')?.value?.trim?.() || 'بیمار ارجاعی (نامشخص)';
  const pSpecies = document.getElementById('pillPatientSpecies')?.value || 'سگ (Canine)';
  const cName = document.getElementById('pillClientName')?.value?.trim?.() || 'سرپرست محترم';
  const cPhone = document.getElementById('pillClientPhone')?.value?.trim?.() || '—';
  const weight = items[0]?.weight || (typeof currentPatientWeight !== 'undefined' ? currentPatientWeight : 10);
  const serialNo = generateRxSerial();
  const persianDate = getPersianDateString();

  sheet.innerHTML = `
    <!-- سربرگ رسمی کلینیک و اطلاعات نسخه -->
    <div class="border-b-2 border-slate-900 pb-3.5 flex items-start justify-between flex-wrap gap-4">
      <div class="flex items-center gap-3.5">
        <div class="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-serif text-3xl font-black shadow-md shrink-0">
          ℞
        </div>
        <div>
          <h1 class="text-xl font-black text-slate-900 tracking-tight" contenteditable="true" title="کلیک جهت ویرایش نام درمانگاه">
            درمانگاه تخصصی و دارونامه جامع دامپزشکی ایران
          </h1>
          <p class="text-xs text-slate-600 mt-0.5 font-bold" contenteditable="true" title="کلیک جهت ویرایش تخصص">
            مرکز تصمیم‌یار بالینی، جراحی، اورژانس و فارماکوتراپی حیوانات خانگی و اهلی
          </p>
          <p class="text-[11px] text-slate-500 mt-0.5" contenteditable="true" title="کلیک جهت ویرایش اطلاعات تماس">
            نشانی کلینیک: تهران، خیابان آزادی | تلفن اورژانس و نوبت‌دهی: ۰۲۱-۶۶۰۰۰۰۰۰
          </p>
        </div>
      </div>
      <div class="text-left text-xs space-y-1 font-mono border-r-2 border-slate-200 pr-4 shrink-0">
        <div><span class="text-slate-500 font-sans">شماره نسخه:</span> <strong class="text-slate-900 font-bold latin-text">${serialNo}</strong></div>
        <div><span class="text-slate-500 font-sans">تاریخ صدور:</span> <strong class="text-slate-900 font-bold">${persianDate}</strong></div>
        <div><span class="text-slate-500 font-sans">اعتبار نسخه:</span> <span class="text-slate-700 font-sans">۳ روز کاری</span></div>
      </div>
    </div>

    <!-- مشخصات بیمار و صاحب حیوان -->
    <div class="bg-slate-50 border border-slate-300 rounded-2xl p-3.5 text-xs grid grid-cols-2 sm:grid-cols-4 gap-3 shadow-2xs">
      <div>
        <span class="text-slate-500 block text-[10px] font-bold">نام بیمار (کیس):</span>
        <strong class="text-slate-900 font-black text-sm">${pName}</strong>
      </div>
      <div>
        <span class="text-slate-500 block text-[10px] font-bold">گونه بیمار:</span>
        <strong class="text-slate-900 font-bold text-xs">${pSpecies}</strong>
      </div>
      <div>
        <span class="text-slate-500 block text-[10px] font-bold">وزن ثبت‌شده:</span>
        <strong class="text-slate-900 font-black text-sm font-mono latin-text">${weight} kg</strong>
      </div>
      <div>
        <span class="text-slate-500 block text-[10px] font-bold">نام سرپرست (Client):</span>
        <strong class="text-slate-900 font-bold text-xs">${cName}</strong>
      </div>
      <div class="col-span-2 sm:col-span-4 border-t border-slate-200 pt-2 flex items-center justify-between text-[11px] text-slate-600">
        <span>شماره پرونده / تماس: <strong class="font-mono font-bold text-slate-800 latin-text">${cPhone}</strong></span>
        <span class="text-slate-500">وضعیت پذیرش: درمانگاهی / سرپایی</span>
      </div>
    </div>

    <!-- جدول اقلام دارویی نسخه (Rx Table) -->
    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-black text-slate-900 flex items-center gap-1.5">
          <span class="font-serif text-lg text-teal-800">℞</span>
          <span>اقلام دارویی تجویزی و دستور مصرف (Prescription Items):</span>
        </span>
        <span class="text-[11px] text-slate-500 font-medium font-mono">${items.length} قلم دارو</span>
      </div>

      <table class="rx-print-table w-full text-right text-xs border-collapse border border-slate-300 shadow-2xs rounded-xl overflow-hidden">
        <thead class="bg-slate-100 text-slate-900 font-black">
          <tr>
            <th class="p-2.5 border border-slate-300 text-center w-8">#</th>
            <th class="p-2.5 border border-slate-300">نام دارو و شکل دارویی</th>
            <th class="p-2.5 border border-slate-300">مقدار در هر وعده (Sig)</th>
            <th class="p-2.5 border border-slate-300">فواصل زمانی مصرف</th>
            <th class="p-2.5 border border-slate-300">طول دوره</th>
            <th class="p-2.5 border border-slate-300 text-center">تعداد کل</th>
            <th class="no-print p-2.5 border border-slate-300 text-center w-12">عملیات</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, idx) => `
            <tr class="hover:bg-slate-50/70 border-b border-slate-200">
              <td class="p-2.5 border border-slate-300 text-center font-mono font-bold">${idx + 1}</td>
              <td class="p-2.5 border border-slate-300 font-bold">
                <div class="text-slate-900 font-black text-sm">${item.drugName}</div>
                <div class="text-[11px] text-slate-600 font-medium">قرص ${item.strength} میلی‌گرم ${item.brandName ? '• ' + item.brandName : ''}</div>
              </td>
              <td class="p-2.5 border border-slate-300 font-black text-amber-950">
                <div class="text-xs font-bold">${item.fractionText}</div>
                <div class="text-[10px] text-slate-500 font-mono font-normal">(${item.mgPerDose} mg)</div>
              </td>
              <td class="p-2.5 border border-slate-300 font-bold text-slate-800">${item.intervalFa}</td>
              <td class="p-2.5 border border-slate-300 font-mono font-bold">${item.days} روز</td>
              <td class="p-2.5 border border-slate-300 text-center font-black font-mono text-emerald-800 bg-emerald-50/40 text-sm">
                ${item.totalTablets} عدد
              </td>
              <td class="no-print p-2.5 border border-slate-300 text-center">
                <button onclick="removePrescriptionItem(${idx})" class="text-rose-600 hover:text-rose-800 text-xs font-bold p-1" title="حذف دارو">
                  ✕
                </button>
              </td>
            </tr>
            <tr>
              <td colspan="7" class="p-2 bg-slate-50/80 border border-slate-300 text-[11px] text-slate-700">
                <strong class="text-slate-900 font-bold">دستور خورانیدن در منزل:</strong> ${item.instructions} ${item.advice ? '• ' + item.advice : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <!-- توصیه‌های مراقبت در منزل و هشدارهای سرپرست بیمار -->
    <div class="border border-amber-200 bg-amber-50/40 rounded-2xl p-3.5 space-y-1.5 text-xs">
      <strong class="text-amber-950 font-black block flex items-center gap-1.5">
        <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-600"></i>
        <span>توصیه‌های مهم مراقبت در منزل و هشدارهای سرپرست بیمار:</span>
      </strong>
      <ul class="list-disc list-inside text-[11px] text-slate-700 space-y-1 leading-relaxed">
        <li><strong>تکمیل کامل دوره درمان:</strong> مصرف آنتی‌بیوتیک یا داروی تجویز‌شده را دقیقاً تا آخرین عدد قرص کامل کنید؛ بهبودی زودهنگام نباید باعث قطع دارو شود.</li>
        <li><strong>نحوه مصرف با غذا:</strong> جهت جلوگیری از دل‌آشوب و استفراغ، دارو را همراه وعده غذایی یا داخل تکه کوچکی از غذای مورد علاقه حیوان بخورانید.</li>
        <li><strong>علائم خطرناک نیازمند تماس فوری:</strong> در صورت مشاهده هرگونه استفراغ مکرر، اسهال تیره/خونی، زردی مخاطات یا بی‌حالی شدید، مصرف دارو را متوقف کرده و فوراً به اورژانس کلینیک اطلاع دهید.</li>
        <li><strong>نگهداری:</strong> دارو را در دمای زیر ۲۵ درجه سانتی‌گراد، دور از رطوبت، نور مستقیم و دور از دسترس کودکان و سایر حیوانات خانگی قرار دهید.</li>
      </ul>
    </div>

    <!-- کادر مهر و امضای رسمی دامپزشک معالج -->
    <div class="pt-4 border-t-2 border-slate-900 flex items-end justify-between flex-wrap gap-4 text-xs">
      <div class="space-y-1">
        <p class="font-black text-slate-900">مهر و امضای دامپزشک معالج:</p>
        <p class="text-slate-700 font-bold" contenteditable="true" title="کلیک جهت ویرایش نام دامپزشک">دکتر دامپزشک کلینیک تخصصی</p>
        <p class="text-slate-500 text-[11px] font-mono" contenteditable="true" title="کلیک جهت ویرایش شماره نظام">نظام دامپزشکی: ....................</p>
      </div>
      <div class="w-48 h-20 border-2 border-dashed border-slate-400 rounded-xl flex items-center justify-center text-slate-400 text-xs font-serif bg-slate-50/30">
        محل مهر و امضای رسمی کلینیک
      </div>
    </div>

    <!-- واترمارک و ارجاع سامانه -->
    <div class="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-200 font-mono">
      نسخه رسمی صادره توسط سامانه جامع دارونامه و تصمیم‌یار بالینی دامپزشکی وت‌دوز (VetDose) • شناسه اعتبارسنجی: ${serialNo}
    </div>
  `;

  if (window.lucide) {
    lucide.createIcons();
  }
}

function openPrintPrescriptionModal(drugId) {
  if (drugId) {
    quickPrescribeForDrug(drugId);
    return;
  }
  renderPrescriptionSheet();
  const modal = document.getElementById('prescriptionPrintModal');
  if (modal) {
    modal.classList.remove('hidden');
    if (window.lucide) lucide.createIcons();
  }
}

function closePrintPrescriptionModal() {
  const modal = document.getElementById('prescriptionPrintModal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

function printOfficialPrescription() {
  window.print();
}

function sharePrescriptionWhatsApp() {
  let items = [...currentPrescriptionQueue];
  if (items.length === 0) {
    items.push(getCurrentPillRxItem());
  }

  const pName = document.getElementById('pillPatientName')?.value?.trim?.() || 'بیمار ارجاعی';
  const pSpecies = document.getElementById('pillPatientSpecies')?.value || 'سگ (Canine)';
  const cName = document.getElementById('pillClientName')?.value?.trim?.() || 'سرپرست محترم';
  let phone = document.getElementById('pillClientPhone')?.value?.trim?.() || '';
  const weight = items[0]?.weight || (typeof currentPatientWeight !== 'undefined' ? currentPatientWeight : 10);
  const serialNo = generateRxSerial();
  const persianDate = getPersianDateString();

  if (phone) {
    phone = phone.replace(/[^0-9]/g, '');
    if (phone.startsWith('09')) {
      phone = '98' + phone.substring(1);
    } else if (phone.startsWith('9')) {
      phone = '98' + phone;
    }
  }

  let text = `🐾 *نسخه و دستور دارویی کلینیک دامپزشکی*\n`;
  text += `--------------------------------\n`;
  text += `📋 شماره نسخه: ${serialNo}\n`;
  text += `📅 تاریخ: ${persianDate}\n`;
  text += `🐶 کیس: ${pName} (${pSpecies}) | وزن: ${weight} kg\n`;
  text += `👤 سرپرست: ${cName}\n`;
  text += `--------------------------------\n`;
  text += `💊 *اقلام دارویی تجویزی:*\n\n`;

  items.forEach((item, idx) => {
    text += `${idx + 1}. *${item.drugName}* (قرص ${item.strength} mg)\n`;
    text += `   • دستور هر وعده: *${item.fractionText}* (${item.mgPerDose} mg)\n`;
    text += `   • فواصل مصرف: ${item.intervalFa}\n`;
    text += `   • طول دوره درمان: ${item.days} روز متوالی\n`;
    text += `   • تعداد کل قرص: ${item.totalTablets} عدد قرص کامل\n`;
    text += `   • نحوه خورانیدن: ${item.instructions}\n\n`;
  });

  text += `--------------------------------\n`;
  text += `⚠️ *توصیه‌های مهم:*\n`;
  text += `۱. دوره درمان را تا آخرین قرص کامل کنید و با بهبودی ظاهری دارو را قطع ننمایید.\n`;
  text += `۲. در صورت بروز هرگونه استفراغ مکرر، اسهال یا بی‌حالی با کلینیک تماس بگیرید.\n`;
  text += `🏥 کلینیک تخصصی و دارونامه جامع دامپزشکی ایران`;

  const url = phone ? `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`
                    : `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  if (typeof window !== 'undefined' && window.open) {
    window.open(url, '_blank');
  }
}

function copyPrescriptionToClipboard() {
  const sheet = document.getElementById('prescriptionPrintSheet');
  const btn = document.getElementById('copyRxModalBtnText');
  if (!sheet) return;

  const text = sheet.innerText || sheet.textContent || '';
  if (navigator?.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      if (btn) btn.textContent = '✅ کپی شد!';
      setTimeout(() => {
        if (btn) btn.textContent = 'کپی متن';
      }, 2000);
    }).catch(() => {
      prompt('متن نسخه را کپی فرمایید:', text);
    });
  } else {
    prompt('متن نسخه را کپی فرمایید:', text);
  }
}

function quickPrescribeForDrug(drugId) {
  const drug = (typeof DRUGS_DATA !== 'undefined') ? DRUGS_DATA.find(d => d.id === drugId) : null;
  if (!drug) return;

  openCalculatorModal();
  switchCalcTab('pill');

  const selectEl = document.getElementById('pillPresetSelect');
  if (selectEl) {
    if (drug.id === 'amoxicillin_clavulanate') selectEl.value = 'amox_clav';
    else if (drug.id === 'gabapentin') selectEl.value = 'gabapentin';
    else if (drug.id === 'meloxicam') selectEl.value = 'meloxicam';
    else if (drug.id === 'tramadol') selectEl.value = 'tramadol';
    else if (drug.id === 'oxytetracycline') selectEl.value = 'oxytetracycline_po';
    else if (drug.id === 'enrofloxacin') selectEl.value = 'enrofloxacin_po';
    else if (drug.id === 'prazosin') selectEl.value = 'prazosin';
    else if (drug.id === 'famotidine') selectEl.value = 'famotidine';
    else if (drug.id === 'butorphanol') selectEl.value = 'butorphanol_po';
    else if (drug.id === 'fenbendazole') selectEl.value = 'fenbendazole';
    else if (drug.id === 'praziquantel') selectEl.value = 'praziquantel';
    else if (drug.id === 'levothyroxine') selectEl.value = 'levothyroxine';
    else if (drug.id === 'methimazole') selectEl.value = 'methimazole';
    else if (drug.id === 'spironolactone') selectEl.value = 'spironolactone';
    else if (drug.id === 'doxycycline') selectEl.value = 'doxycycline';
    else if (drug.id === 'cephalexin') selectEl.value = 'cephalexin';
    else if (drug.id === 'ciprofloxacin') selectEl.value = 'ciprofloxacin_po';
    else if (drug.id === 'loperamide') selectEl.value = 'loperamide';
    else if (drug.id === 'marbofloxacin') selectEl.value = 'marbofloxacin';
    else if (drug.id === 'terbinafine') selectEl.value = 'terbinafine';
    else selectEl.value = 'custom';
    onPillPresetChange();
  }

  openPrintPrescriptionModal();
}


// محاسبات دوز و حجم تزریقی
function runDoseCalculation() {
  const weight = parseFloat(document.getElementById('doseWeight').value) || 0;
  const rate = parseFloat(document.getElementById('doseRate').value) || 0;
  const conc = parseFloat(document.getElementById('doseConc').value) || 0;

  const totalMg = weight * rate;
  const volMl = conc > 0 ? (totalMg / conc) : 0;

  document.getElementById('doseResMg').textContent = totalMg.toFixed(2);
  document.getElementById('doseResVol').textContent = volMl.toFixed(2);
}

// محاسبات رقیق‌سازی داروی انسانی
function runDilutionCalculation() {
  const pillMg = parseFloat(document.getElementById('dilPillMg').value) || 0;
  const dilVol = parseFloat(document.getElementById('dilVolumeMl').value) || 0;
  const patientMg = parseFloat(document.getElementById('dilPatientMg').value) || 0;

  const resultingConc = dilVol > 0 ? (pillMg / dilVol) : 0;
  const volToGive = resultingConc > 0 ? (patientMg / resultingConc) : 0;

  document.getElementById('dilResConc').textContent = resultingConc.toFixed(1);
  document.getElementById('dilResGive').textContent = volToGive.toFixed(2);
  document.getElementById('dilGuidanceText').textContent = 
    `پودر کپسول/قرص ${pillMg} میلی‌گرمی را در ${dilVol} سی‌سی آب مقطر حل کرده و ${volToGive.toFixed(2)} سی‌سی از این مایع را با سرنگ به بیمار بخورانید.`;
}

// محاسبات جامع مایع‌درمانی و سرم‌تراپی بالینی (Fluid Therapy Engine)
function runFluidCalculation() {
  const weight = parseFloat(document.getElementById('flWeight').value) || 0;
  const dehyd = parseFloat(document.getElementById('flDehyd').value) || 0;
  const species = document.getElementById('flSpecies').value;
  const ongoingLosses = parseFloat(document.getElementById('flLosses').value) || 0;
  const dripSetFactor = parseFloat(document.getElementById('flDripSet').value) || 20;

  // نرخ نگهداری گونه‌ها بر اساس رفرنس پلامبز
  let maintRate = 60.0; // سگ
  if (species === 'feline') maintRate = 45.0; // گربه
  else if (species === 'equine') maintRate = 50.0; // اسب
  else if (species === 'calf') maintRate = 80.0; // گوساله و نشخوارکننده جوان

  // ۱. حجم جبران کمبود دهیدراتاسیون: Deficit (mL) = Weight (kg) * % * 10
  const deficit = weight * dehyd * 10.0;
  
  // ۲. حجم نگهداری ۲۴ ساعته: Maintenance (mL) = Weight (kg) * MaintRate
  const maint = weight * maintRate;
  
  // ۳. کل حجم ۲۴ ساعته: Total = Deficit + Maintenance + Ongoing Losses
  const total24h = deficit + maint + ongoingLosses;
  const totalLiters = total24h / 1000.0;

  // ۴. سرعت ساعتی انفوزیون (mL/hr)
  const hourly = total24h > 0 ? (total24h / 24.0) : 0;

  // ۵. سرعت قطره در دقیقه: Drops/min = (hourly * dripSetFactor) / 60
  const dripRate = total24h > 0 ? ((hourly * dripSetFactor) / 60.0) : 0;
  const roundedDripRate = Math.round(dripRate);

  // ۶. فواصل زمانی هر قطره (ثانیه بر هر قطره)
  const secondsPerDrop = dripRate > 0 ? (60.0 / dripRate).toFixed(1) : '-';

  // ۷. دوز احیای شوک هیپوولمیک
  let shockFullRate = 90.0; // mL/kg برای سگ
  if (species === 'feline') shockFullRate = 45.0;
  else if (species === 'equine') shockFullRate = 80.0;
  else if (species === 'calf') shockFullRate = 60.0;

  const shockTotal = weight * shockFullRate;
  const shockQuarter = shockTotal * 0.25;

  // به‌روزرسانی عناصر DOM
  const elTotal24 = document.getElementById('flTotal24');
  const elTotalLiters = document.getElementById('flTotalLiters');
  const elDeficit = document.getElementById('flDeficitMl');
  const elMaint = document.getElementById('flMaintMl');
  const elOngoing = document.getElementById('flOngoingMl');
  const elHourly = document.getElementById('flHourly');
  const elDripRate = document.getElementById('flDripRate');
  const elDropTiming = document.getElementById('flDropTiming');
  const elShockQuarter = document.getElementById('flShockQuarter');
  const elShockTotal = document.getElementById('flShockTotal');

  if (elTotal24) elTotal24.textContent = Math.round(total24h).toLocaleString();
  if (elTotalLiters) elTotalLiters.textContent = `(${totalLiters.toFixed(2)} لیتر)`;
  if (elDeficit) elDeficit.textContent = Math.round(deficit).toLocaleString();
  if (elMaint) elMaint.textContent = Math.round(maint).toLocaleString();
  if (elOngoing) elOngoing.textContent = Math.round(ongoingLosses).toLocaleString();
  if (elHourly) elHourly.textContent = hourly.toFixed(1);
  if (elDripRate) elDripRate.textContent = roundedDripRate;
  if (elDropTiming) elDropTiming.textContent = dripRate > 0 ? `معادل ۱ قطره در هر ${secondsPerDrop} ثانیه` : 'توقف سرم';
  if (elShockQuarter) elShockQuarter.textContent = `${Math.round(shockQuarter)} mL`;
  if (elShockTotal) elShockTotal.textContent = `${Math.round(shockTotal)} mL`;
}

// ==============================================
// موتور محاسباتی انفوزیون مداوم وریدی (CRI Calculator Engine)
// ==============================================

const CRI_PRESETS = {
  lidocaine: {
    drugName: 'لیدوکائین ۲٪ (Lidocaine 2%)',
    doseRate: 30,
    doseUnit: 'mcg_kg_min',
    stockConc: 20,
    bagVolume: 500,
    fluidRate: 20,
    advice: '⚠️ در گربه به دلیل خطر شدید سمیت قلبی و عصبی منع مصرف دارد. قبل از شروع CRI در سگ، دوز بارگیری 2 mg/kg IV آهسته تزریق شود. پایش مداوم ECG توصیه می‌شود.',
    instructions: (stockVol, bagVol, fluidRate) => `ابتدا ${stockVol} سی‌سی از مایع کیسه ${bagVol} میلی‌لیتری را با سرنگ خارج نموده، سپس ${stockVol} سی‌سی لیدوکائین ۲٪ به کیسه اضافه کرده و پمپ سرم را روی سرعت ${fluidRate} میلی‌لیتر در ساعت تنظیم کنید.`
  },
  ketamine: {
    drugName: 'کتامین ساب‌آنستتیک (Ketamine)',
    doseRate: 5,
    doseUnit: 'mcg_kg_min',
    stockConc: 50,
    bagVolume: 500,
    fluidRate: 20,
    advice: 'مهار گیرنده NMDA و جلوگیری از اثر Wind-up درد جراحی و هایپرآلژزی. دوز بارگیری اولیه 0.5 mg/kg IV قبل از شروع انفوزیون توصیه می‌شود.',
    instructions: (stockVol, bagVol, fluidRate) => `ابتدا ${stockVol} سی‌سی از کیسه ${bagVol} میلی‌لیتری خارج کرده، سپس ${stockVol} سی‌سی ویال کتامین ۵٪ (50 mg/mL) به کیسه تزریق و خوب مخلوط نمایید.`
  },
  metoclopramide: {
    drugName: 'متوکلوپرامید (Metoclopramide)',
    doseRate: 1.5,
    doseUnit: 'mg_kg_day',
    stockConc: 5,
    bagVolume: 500,
    fluidRate: 20,
    advice: '⚠️ در انسداد مکانیکی یا سوراخ‌شدگی گوارش ممنوع است. این دارو به نور حساس است؛ کیسه سرم و لوله‌ها حتماً با فویل آلومینیومی پوشانده شوند.',
    instructions: (stockVol, bagVol, fluidRate) => `مقدار ${stockVol} سی‌سی آمپول متوکلوپرامید (5 mg/mL) به کیسه ${bagVol} میلی‌لیتری افزوده و کیسه را با پوشش تیره بپوشانید.`
  },
  diazepam: {
    drugName: 'دیازپام (Diazepam)',
    doseRate: 0.5,
    doseUnit: 'mg_kg_hr',
    stockConc: 5,
    bagVolume: 250,
    fluidRate: 25,
    advice: '⚠️ دیازپام به پلاستیک لوله‌ها می‌چسبد و در سرم سالین رسوب می‌دهد. ترجیحاً در دکستروز ۵٪ استفاده شود یا در پمپ سرنگ بدون سرم تزریق گردد.',
    instructions: (stockVol, bagVol, fluidRate) => `مقدار ${stockVol} سی‌سی دیازپام به کیسه ${bagVol} میلی‌لیتری دکستروز ۵٪ تزریق شود؛ به طور مکرر از نظر تشکیل رسوب بلوری بررسی گردد.`
  },
  fentanyl: {
    drugName: 'فنتانیل (Fentanyl)',
    doseRate: 5,
    doseUnit: 'mcg_kg_hr',
    stockConc: 0.05,
    bagVolume: 250,
    fluidRate: 10,
    advice: '⚠️ اوپیوئید فوق‌العاده قوی؛ احتمال افت تنفس و برادی‌کاردی بالاست. مانیتورینگ SpO2 و حضور پادزهر نالوکسان الزامی است.',
    instructions: (stockVol, bagVol, fluidRate) => `مقدار ${stockVol} سی‌سی فنتانیل (50 mcg/mL) به کیسه ${bagVol} میلی‌لیتری افزوده و سرم را با پمپ تزریق کنید.`
  },
    dexmedetomidine: {
    drugName: 'دکسمدتومیدین (Dexmedetomidine)',
    doseRate: 1,
    doseUnit: 'mcg_kg_hr',
    stockConc: 0.5,
    bagVolume: 500,
    fluidRate: 20,
    advice: 'آرام‌بخشی میکرو-دوز در ICU بدون ایجاد هیپوونتیلاسیون شدید؛ باعث برادی‌کاردی می‌شود. پادزهر آتیپامزول (Antisedan) در دسترس باشد.',
    instructions: (stockVol, bagVol, fluidRate) => `مقدار ${stockVol} سی‌سی دکسمدتومیدین (0.5 mg/mL) به کیسه ${bagVol} میلی‌لیتری اضافه کرده و ضربان قلب حیوان را پایش نمایید.`
  },
  norepinephrine: {
    drugName: 'نوراپی‌نفرین (Norepinephrine 1 mg/mL)',
    doseRate: 0.5,
    doseUnit: 'mcg_kg_min',
    stockConc: 1,
    bagVolume: 250,
    fluidRate: 10,
    advice: 'وازوپرسور خط اول شوک سپسیس و افت فشارخون مقاوم به مایع‌درمانی در ICU. پایش مداوم فشار خون شریانی الزامی است؛ نشت خارج‌عروقی نکروز بافتی ایجاد می‌کند.',
    instructions: (stockVol, bagVol, fluidRate) => `مقدار ${stockVol} سی‌سی نوراپی‌نفرین به کیسه ${bagVol} میلی‌لیتری دکستروز ۵٪ تزریق کرده و سرعت پمپ را روی ${fluidRate} میلی‌لیتر در ساعت تنظیم فرمایید.`
  },
  dopamine: {
    drugName: 'دوپامین (Dopamine 40 mg/mL)',
    doseRate: 5,
    doseUnit: 'mcg_kg_min',
    stockConc: 40,
    bagVolume: 500,
    fluidRate: 20,
    advice: 'اثرات وابسته به دوز: دوز 1-3 mcg کلیوی، 3-10 mcg اینوتروپ مثبت بتا-۱، دوز بالای 10 mcg انقباض عروقی آلفا-۱. در گربه پاسخ به دوز پایین ضعیف است.',
    instructions: (stockVol, bagVol, fluidRate) => `مقدار ${stockVol} سی‌سی ویال دوپامین (40 mg/mL) به کیسه ${bagVol} میلی‌لیتری اضافه کرده و ریتم قلب را از نظر تاکی‌آریتمی پایش کنید.`
  },
  fenoldopam: {
    drugName: 'فنولدوپام (Fenoldopam 10 mg/mL)',
    doseRate: 0.2,
    doseUnit: 'mcg_kg_min',
    stockConc: 10,
    bagVolume: 250,
    fluidRate: 10,
    advice: 'آگونیست اختصاصی DA1 و وازودیلاتور کورتکس کلیه جهت تبدیل الیگوری به دیورز فعال در نارسایی حاد کلیه (AKI). بیمار باید کاملاً هیدراته باشد.',
    instructions: (stockVol, bagVol, fluidRate) => `مقدار ${stockVol} سی‌سی آمپول فنولدوپام (10 mg/mL) به کیسه ${bagVol} میلی‌لیتری نرمال سالین اضافه کرده و فشار خون بیمار را هر ۱۵ دقیقه کنترل نمایید.`
  },
  dobutamine: {
    drugName: 'دوبوتامین (Dobutamine 12.5 mg/mL)',
    doseRate: 5,
    doseUnit: 'mcg_kg_min',
    stockConc: 12.5,
    bagVolume: 500,
    fluidRate: 20,
    advice: 'اینوتروپ مثبت انتخابی بتا-۱ برای کاردیومیوپاتی اتساعی (DCM) و شوک قلبی. در گربه با دوز پایین‌تر (2-5 mcg) استفاده شود تا از تشنج پیشگیری گردد.',
    instructions: (stockVol, bagVol, fluidRate) => `مقدار ${stockVol} سی‌سی دوبوتامین به کیسه ${bagVol} میلی‌لیتری افزوده و از نظر تاکی‌کاردی پایش گردد.`
  },
  sodium_nitroprusside: {
    drugName: 'سدیم نیتروپروساید (Sodium Nitroprusside 25 mg/mL)',
    doseRate: 1,
    doseUnit: 'mcg_kg_min',
    stockConc: 25,
    bagVolume: 250,
    fluidRate: 10,
    advice: 'وازودیلاتور شریانی-وریدی متعادل در کریز پرفشاری خون و ادم حاد ریوی سگ. حساسیت شدید به نور؛ کیسه و ست سرم حتماً با فویل آلومینیوم پوشانده شود.',
    instructions: (stockVol, bagVol, fluidRate) => `مقدار ${stockVol} سی‌سی به کیسه ${bagVol} میلی‌لیتری دکستروز ۵٪ تزریق شده و کل کیسه و لوله‌ها فوراً با فویل ضد نور پوشانده شود.`
  },
  furosemide_cri: {
    drugName: 'فوروزماید پیوسته (Furosemide 10 mg/mL)',
    doseRate: 0.5,
    doseUnit: 'mg_kg_hr',
    stockConc: 10,
    bagVolume: 250,
    fluidRate: 15,
    advice: 'انفوزیون مداوم در ادم ریوی حاد ناشی از نارسایی احتقانی قلب (CHF) یا بیماری دریچه میترال؛ ایجاد دیورز یکنواخت بدون نوسانات شدید همودینامیک.',
    instructions: (stockVol, bagVol, fluidRate) => `مقدار ${stockVol} سی‌سی فوروزماید (10 mg/mL) به کیسه ${bagVol} میلی‌لیتری اضافه شده و برون‌ده ادراری بیمار پایش گردد.`
  },
  rabbit_butorphanol: {
    drugName: 'بوتورفانول خرگوش و جوندگان (Butorphanol - Carpenter Table 10-5)',
    doseRate: 0.15,
    doseUnit: 'mg_kg_hr',
    stockConc: 10,
    bagVolume: 250,
    fluidRate: 10,
    advice: '🐰 پروتکل اختصاصی خرگوش و جوندگان (Carpenter 6th Ed). دوز بارگیری 0.2–0.4 mg/kg IV قبل از شروع CRI. تسکین دردهای احشایی و شکمی با حفظ پایداری تنفسی.',
    instructions: (stockVol, bagVol, fluidRate) => `مقدار ${stockVol} سی‌سی بوتورفانول (10 mg/mL) به کیسه ${bagVol} میلی‌لیتری سرم اضافه کرده و سرعت پمپ را روی ${fluidRate} میلی‌لیتر در ساعت تنظیم نمایید.`
  },
  rabbit_fentanyl: {
    drugName: 'فنتانیل خرگوش و اگزوتیک (Fentanyl - Carpenter Table 10-5)',
    doseRate: 15,
    doseUnit: 'mcg_kg_hr',
    stockConc: 0.05,
    bagVolume: 250,
    fluidRate: 10,
    advice: '⚠️ پروتکل تسکین درد شدید در جراحی ارتوپدی و لاپاراتومی خرگوش و جوندگان. دوز بارگیری 5–10 mcg/kg IV. مانیتورینگ SpO2 و حضور پادزهر نالوکسان الزامی است.',
    instructions: (stockVol, bagVol, fluidRate) => `مقدار ${stockVol} سی‌سی فنتانیل (50 mcg/mL) به کیسه ${bagVol} میلی‌لیتری سرم افزوده و پایش دقیق تنفسی انجام شود.`
  },
  rabbit_ketamine: {
    drugName: 'کتامین خرگوش و اگزوتیک (Ketamine NMDA - Carpenter Table 10-5)',
    doseRate: 0.6,
    doseUnit: 'mg_kg_hr',
    stockConc: 50,
    bagVolume: 250,
    fluidRate: 10,
    advice: '🐰 مهار اثر Wind-up و هیپرآلژزی بعد از عمل. دوز بارگیری 2–5 mg/kg IV (یا 0.5 mg/kg ضددرد ساب‌آنستتیک). ترکیب هم‌افزا با اوپیوئیدها جهت کاهش MAC ایزوفلوران.',
    instructions: (stockVol, bagVol, fluidRate) => `مقدار ${stockVol} سی‌سی ویال کتامین ۵٪ (50 mg/mL) به کیسه ${bagVol} میلی‌لیتری افزوده و خوب مخلوط نمایید.`
  },
  rabbit_lidocaine: {
    drugName: 'لیدوکائین خرگوش (Lidocaine - Carpenter Table 10-5)',
    doseRate: 100,
    doseUnit: 'mcg_kg_min',
    stockConc: 20,
    bagVolume: 250,
    fluidRate: 10,
    advice: '🐰 اثرات دوگانه ضددرد سیستمیک و پروکینتیک (پیشگیری از ایلئوس و استاز گوارشی خرگوش). دوز بارگیری 2 mg/kg IV آهسته قبل از شروع CRI.',
    instructions: (stockVol, bagVol, fluidRate) => `مقدار ${stockVol} سی‌سی لیدوکائین ۲٪ به کیسه ${bagVol} میلی‌لیتری اضافه شده و با پمپ سرم انفوزیون گردد.`
  },
  rabbit_ketamine_butorphanol: {
    drugName: 'کوکتل KB کتامین + بوتورفانول خرگوش (KB Multi-modal - Carpenter Table 10-5)',
    doseRate: 0.6,
    doseUnit: 'mg_kg_hr',
    stockConc: 50,
    bagVolume: 250,
    fluidRate: 10,
    advice: '🐰 پروتکل طلایی بی‌دردی چندوجهی (Multimodal) در خرگوش و پستانداران کوچک: Ketamine 0.6 mg/kg/hr + Butorphanol 0.15 mg/kg/hr (دوز بارگیری: کتامین 0.5 mg/kg + بوتورفانول 0.05 mg/kg IV).',
    instructions: (stockVol, bagVol, fluidRate) => `مقدار ${stockVol} سی‌سی کتامین ۵۰ mg/mL به همراه دوز بوتورفانول در کیسه ${bagVol} میلی‌لیتری رقیق و با سرعت ${fluidRate} mL/hr انفوزیون شود.`
  }
};

function calculateCriInfusion(weightKg, doseAmount, doseUnit, stockConcMgMl, fluidBagMl, fluidRateMlHr) {
  const weight = Math.max(0.1, parseFloat(weightKg) || 10);
  const dose = Math.max(0.0001, parseFloat(doseAmount) || 0);
  const stockConc = Math.max(0.0001, parseFloat(stockConcMgMl) || 1);
  const bagVolume = Math.max(10, parseFloat(fluidBagMl) || 500);
  const fluidRate = Math.max(0.1, parseFloat(fluidRateMlHr) || 20);

  // محاسبه میلی‌گرم داروی مورد نیاز در هر ساعت
  let mgPerHour = 0;
  if (doseUnit === 'mcg_kg_min') {
    mgPerHour = (dose * weight * 60.0) / 1000.0;
  } else if (doseUnit === 'mcg_kg_hr') {
    mgPerHour = (dose * weight) / 1000.0;
  } else if (doseUnit === 'mg_kg_hr') {
    mgPerHour = dose * weight;
  } else if (doseUnit === 'mg_kg_day') {
    mgPerHour = (dose * weight) / 24.0;
  } else {
    mgPerHour = (dose * weight * 60.0) / 1000.0;
  }

  // غلظت مورد نیاز در هر میلی‌لیتر از کیسه سرم (mg/mL)
  const reqBagConcMgMl = mgPerHour / fluidRate;

  // کل میلی‌گرم داروی فعال در کیسه سرم
  const totalDrugMgInBag = reqBagConcMgMl * bagVolume;

  // حجم محلول استوک برای اضافه کردن به کیسه سرم (mL)
  const volumeStockToAddMl = totalDrugMgInBag / stockConc;

  // زمان تخلیه کامل کیسه سرم (ساعت)
  const bagDurationHours = bagVolume / fluidRate;

  // سرعت پمپ سرنگ در صورت تزریق مستقیم داروی استوک بدون رقیق‌سازی (mL/hr)
  const syringeRateMlHr = mgPerHour / stockConc;

  // میکروگرم در دقیقه
  const mcgPerMin = (mgPerHour * 1000.0) / 60.0;

  return {
    weight,
    dose,
    doseUnit,
    stockConc,
    bagVolume,
    fluidRate,
    mgPerHour: parseFloat(mgPerHour.toFixed(3)),
    mcgPerMin: parseFloat(mcgPerMin.toFixed(2)),
    totalDrugMgInBag: parseFloat(totalDrugMgInBag.toFixed(2)),
    volumeStockToAddMl: parseFloat(volumeStockToAddMl.toFixed(2)),
    bagDurationHours: parseFloat(bagDurationHours.toFixed(1)),
    syringeRateMlHr: parseFloat(syringeRateMlHr.toFixed(3))
  };
}

function onCriPresetChange() {
  const select = document.getElementById('criPresetSelect');
  if (!select) return;
  const key = select.value;
  if (key === 'custom') return;
  const preset = CRI_PRESETS[key];
  if (!preset) return;

  const doseRateInput = document.getElementById('criDoseRate');
  const doseUnitSelect = document.getElementById('criDoseUnit');
  const stockConcInput = document.getElementById('criStockConc');
  const bagVolumeSelect = document.getElementById('criBagVolume');
  const fluidRateInput = document.getElementById('criFluidRate');
  const weightInput = document.getElementById('criWeight');

  if (doseRateInput) doseRateInput.value = preset.doseRate;
  if (doseUnitSelect) doseUnitSelect.value = preset.doseUnit;
  if (stockConcInput) stockConcInput.value = preset.stockConc;
  if (bagVolumeSelect) bagVolumeSelect.value = preset.bagVolume.toString();
  if (fluidRateInput) fluidRateInput.value = preset.fluidRate;

  if (weightInput && typeof currentPatientWeight !== 'undefined' && currentPatientWeight > 0) {
    weightInput.value = currentPatientWeight;
  }

  runCriCalculation();
}

function runCriCalculation() {
  const weightInput = document.getElementById('criWeight');
  const doseRateInput = document.getElementById('criDoseRate');
  const doseUnitSelect = document.getElementById('criDoseUnit');
  const stockConcInput = document.getElementById('criStockConc');
  const bagVolumeSelect = document.getElementById('criBagVolume');
  const fluidRateInput = document.getElementById('criFluidRate');
  const presetSelect = document.getElementById('criPresetSelect');

  if (!weightInput || !doseRateInput || !stockConcInput) return;

  const weight = parseFloat(weightInput.value) || 10;
  const dose = parseFloat(doseRateInput.value) || 0;
  const doseUnit = doseUnitSelect ? doseUnitSelect.value : 'mcg_kg_min';
  const stockConc = parseFloat(stockConcInput.value) || 20;
  const bagVolume = parseFloat(bagVolumeSelect ? bagVolumeSelect.value : 500) || 500;
  const fluidRate = parseFloat(fluidRateInput ? fluidRateInput.value : 20) || 20;

  const res = calculateCriInfusion(weight, dose, doseUnit, stockConc, bagVolume, fluidRate);

  const presetKey = presetSelect ? presetSelect.value : 'custom';
  const preset = CRI_PRESETS[presetKey];

  // به‌روزرسانی DOM
  const elStockVol = document.getElementById('criResStockVol');
  const elTotalMg = document.getElementById('criResTotalMg');
  const elMgPerHour = document.getElementById('criResMgPerHour');
  const elMcgPerMin = document.getElementById('criResMcgPerMin');
  const elSyringeRate = document.getElementById('criResSyringeRate');
  const elBagDurationBadge = document.getElementById('criBagDurationBadge');
  const elInstructions = document.getElementById('criBagInstructionsFa');
  const elAdvice = document.getElementById('criClinicalAdvice');

  if (elStockVol) elStockVol.textContent = res.volumeStockToAddMl.toFixed(2);
  if (elTotalMg) elTotalMg.textContent = `${res.totalDrugMgInBag.toFixed(2)} mg`;
  if (elMgPerHour) elMgPerHour.textContent = res.mgPerHour.toFixed(2);
  if (elMcgPerMin) elMcgPerMin.textContent = `${res.mcgPerMin.toFixed(2)} mcg/min`;
  if (elSyringeRate) elSyringeRate.textContent = res.syringeRateMlHr.toFixed(3);
  if (elBagDurationBadge) elBagDurationBadge.textContent = `مدت زمان کیسه: ${res.bagDurationHours} ساعت`;

  if (elInstructions) {
    if (preset && typeof preset.instructions === 'function') {
      elInstructions.textContent = preset.instructions(res.volumeStockToAddMl.toFixed(2), bagVolume, fluidRate);
    } else {
      elInstructions.textContent = `ابتدا ${res.volumeStockToAddMl.toFixed(2)} سی‌سی از مایع کیسه ${bagVolume} میلی‌لیتری را خارج نموده، سپس ${res.volumeStockToAddMl.toFixed(2)} سی‌سی از ویال داروی فعال (${stockConc} mg/mL) به کیسه اضافه کرده و سرعت پمپ سرم را روی ${fluidRate} mL/hr تنظیم نمایید.`;
    }
  }

  if (elAdvice) {
    if (preset && preset.advice) {
      elAdvice.textContent = preset.advice;
    } else {
      elAdvice.textContent = `سرعت داروی تحویلی به بیمار ${res.mgPerHour.toFixed(2)} mg در هر ساعت است. بیمار را از نظر علائم حیاتی و عمق تسکین یا عوارض دارویی به طور مداوم پایش کنید.`;
    }
  }
}

// ==============================================
// رادار هوشمند تداخلات ۳۶۰ درجه و چنددارویی (Polypharmacy & Single-Drug 360° Radar)
// ==============================================
var currentInteractionMode = 'single';
var currentSingleDrugId = null;
var singleDrugSeverityFilter = 'all';
var singleDrugInnerQuery = '';

function openInteractionsModal(targetDrugId = null) {
  document.getElementById('interactionsModal').classList.remove('hidden');
  if (targetDrugId) {
    switchInteractionMode('single');
    selectSingleDrugForInteractions(targetDrugId);
  } else {
    if (currentInteractionMode === 'single' && !currentSingleDrugId) {
      selectSingleDrugForInteractions('enrofloxacin');
    }
  }
  if (window.lucide) lucide.createIcons();
}

function closeInteractionsModal() {
  document.getElementById('interactionsModal').classList.add('hidden');
}

function openSingleDrugInteractions(drugId) {
  openInteractionsModal(drugId);
}

function switchInteractionMode(mode) {
  currentInteractionMode = mode;
  const singleView = document.getElementById('singleDrugInteractionView');
  const multiView = document.getElementById('multiDrugInteractionView');
  const btnSingle = document.getElementById('interactTab_single');
  const btnMulti = document.getElementById('interactTab_multi');

  if (mode === 'single') {
    if (singleView) singleView.classList.remove('hidden');
    if (multiView) multiView.classList.add('hidden');
    if (btnSingle) {
      btnSingle.className = 'px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 bg-amber-600 text-white shadow-xs';
    }
    if (btnMulti) {
      btnMulti.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-white text-slate-700 hover:bg-slate-200 border border-slate-300';
    }
  } else {
    if (singleView) singleView.classList.add('hidden');
    if (multiView) multiView.classList.remove('hidden');
    if (btnSingle) {
      btnSingle.className = 'px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-white text-slate-700 hover:bg-slate-200 border border-slate-300';
    }
    if (btnMulti) {
      btnMulti.className = 'px-3.5 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 bg-amber-600 text-white shadow-xs';
    }
  }
  if (window.lucide) lucide.createIcons();
}

function handleSingleDrugSearchInput(query) {
  const suggestionsBox = document.getElementById('singleDrugSuggestions');
  if (!suggestionsBox) return;

  const q = (query || '').trim().toLowerCase();
  if (!q) {
    suggestionsBox.innerHTML = '';
    suggestionsBox.classList.add('hidden');
    return;
  }

  const matches = DRUGS_DATA.filter(d => {
    const fa = (d.generic_name_fa || '').toLowerCase();
    const en = (d.generic_name_en || '').toLowerCase();
    const id = (d.id || '').toLowerCase();
    const trade = ((d.trade_names || []).join(' ')).toLowerCase();
    return fa.includes(q) || en.includes(q) || id.includes(q) || trade.includes(q);
  }).slice(0, 10);

  if (matches.length === 0) {
    suggestionsBox.innerHTML = `
      <div class="p-3 text-xs text-slate-500 text-center">
        دارویی با عنوان "${query}" در دارونامه یافت نشد.
      </div>
    `;
    suggestionsBox.classList.remove('hidden');
    return;
  }

  suggestionsBox.innerHTML = matches.map(d => `
    <div 
      onclick="selectSingleDrugForInteractions('${d.id}')"
      class="p-2.5 hover:bg-amber-50 cursor-pointer border-b border-slate-100 last:border-0 flex items-center justify-between transition"
    >
      <div>
        <span class="text-xs font-black text-slate-900 block">${d.generic_name_fa}</span>
        <span class="text-[11px] text-slate-500 font-mono block">${d.generic_name_en}</span>
      </div>
      <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
        ${d.drug_class_fa || d.therapeutic_category_fa || ''}
      </span>
    </div>
  `).join('');
  suggestionsBox.classList.remove('hidden');
}


// ==============================================================
// موتور انطباق و تطبیق تداخلات دارویی با ۱۶ مرجع معتبر بین‌المللی و ملی
// ==============================================================
let singleDrugBookFilter = 'all';

function filterSingleDrugBook(bookKey) {
  singleDrugBookFilter = bookKey;
  renderSingleDrugResults(false);
}

function renderInteractionSourcesBadgesHtml(sources = []) {
  if (!sources || sources.length === 0) {
    sources = ["Plumb's Veterinary Drug Handbook (10th Ed)", "Papich Handbook of Veterinary Drugs (5th Ed)"];
  }
  return `
    <div class="pt-2 border-t border-black/10 flex items-center gap-1.5 flex-wrap">
      <span class="text-[10px] font-bold text-slate-500">📚 مراجع بالینی پشتیبان:</span>
      ${sources.map(s => {
        let badgeColor = 'bg-slate-100 text-slate-700 border-slate-300';
        if (s.includes("Plumb")) badgeColor = 'bg-amber-100 text-amber-950 border-amber-300';
        else if (s.includes("Papich")) badgeColor = 'bg-sky-100 text-sky-950 border-sky-300';
        else if (s.includes("BSAVA")) badgeColor = 'bg-indigo-100 text-indigo-950 border-indigo-300';
        else if (s.includes("Lumb") || s.includes("Anesthesia") || s.includes("Pain")) badgeColor = 'bg-emerald-100 text-emerald-950 border-emerald-300';
        else if (s.includes("Oncology") || s.includes("Withrow")) badgeColor = 'bg-purple-100 text-purple-950 border-purple-300';
        else if (s.includes("Carpenter") || s.includes("Exotic") || s.includes("Wildlife")) badgeColor = 'bg-teal-100 text-teal-950 border-teal-300';
        else if (s.includes("Ophthalmology") || s.includes("Slatter") || s.includes("Gelatt")) badgeColor = 'bg-cyan-100 text-cyan-950 border-cyan-300';
        else if (s.includes("Camelids") || s.includes("دامپزشکی کشور")) badgeColor = 'bg-orange-100 text-orange-950 border-orange-300';
        else if (s.includes("Refresher")) badgeColor = 'bg-rose-100 text-rose-950 border-rose-300';
        return `<span class="text-[9px] font-bold px-2 py-0.5 rounded-md border ${badgeColor}">${s}</span>`;
      }).join('')}
    </div>
  `;
}

// موتور ارزیابی سطح رده دارویی (Class-Level Smart Fallback Engine)
function checkClassLevelInteraction(d1, d2) {
  if (!d1 || !d2) return null;

  const getCategories = (d) => {
    const text = [
      d.id,
      d.generic_name_en,
      d.generic_name_fa,
      d.drug_class_en,
      d.drug_class_fa,
      d.therapeutic_class,
      d.therapeutic_category,
      d.therapeutic_category_fa,
      d.primary_category,
      ...(d.secondary_categories || [])
    ].filter(Boolean).join(' ').toLowerCase();

    return {
      isNSAID: text.includes('nsaid') || text.includes('غیراستروئیدی') || text.includes('cox') || ['carprofen', 'meloxicam', 'ketoprofen', 'flunixin', 'firocoxib', 'robenacoxib', 'mavacoxib', 'aspirin', 'phenylbutazone', 'tolfenamic'].some(x => text.includes(x)),
      isSteroid: text.includes('corticosteroid') || text.includes('استروئید') || text.includes('گلوکوکورتیکوئید') || ['prednisolone', 'dexamethasone', 'methylprednisolone', 'triamcinolone', 'hydrocortisone', 'betamethasone', 'budesonide'].some(x => text.includes(x)),
      isFluoroquinolone: text.includes('fluoroquinolone') || text.includes('فلوروکینولون') || ['enrofloxacin', 'marbofloxacin', 'ciprofloxacin', 'pradofloxacin', 'orbifloxacin'].some(x => text.includes(x)),
      isCationChelator: text.includes('sucralfate') || text.includes('سوکرالفات') || text.includes('antacid') || text.includes('آنتی‌اسید') || text.includes('آلومینیوم') || text.includes('کلسیم') || text.includes('منیزیم') || text.includes('آهن') || ['sucralfate', 'aluminum', 'calcium', 'magnesium', 'ferrous'].some(x => text.includes(x)),
      isAminoglycoside: text.includes('aminoglycoside') || text.includes('آمینوگلیکوزید') || ['gentamicin', 'amikacin', 'tobramycin', 'neomycin', 'kanamycin'].some(x => text.includes(x)),
      isLoopDiuretic: text.includes('loop diuretic') || text.includes('فوروزماید') || text.includes('تورزماید') || ['furosemide', 'torsemide'].some(x => text.includes(x)),
      isNeuromuscularOrInhalant: text.includes('neuromuscular') || text.includes('عصبی-عضلانی') || text.includes('inhalant') || text.includes('استنشاقی') || ['atracurium', 'isoflurane', 'sevoflurane'].some(x => text.includes(x)),
      isOpioid: text.includes('opioid') || text.includes('اوپیوئید') || text.includes('مخدر') || ['fentanyl', 'morphine', 'hydromorphone', 'methadone', 'buprenorphine', 'butorphanol', 'tramadol'].some(x => text.includes(x)),
      isSedative: text.includes('alpha-2') || text.includes('آلفا-۲') || text.includes('benzodiazepine') || text.includes('بنزودیازپین') || ['dexmedetomidine', 'medetomidine', 'xylazine', 'diazepam', 'midazolam', 'acepromazine'].some(x => text.includes(x)),
      isTramadol: d.id.includes('tramadol') || text.includes('ترامادول'),
      isSerotonergic: text.includes('ssri') || text.includes('tca') || text.includes('maoi') || ['fluoxetine', 'clomipramine', 'amitriptyline', 'selegiline', 'sertraline'].some(x => text.includes(x)),
      isACEi: text.includes('ace inhibitor') || text.includes('مهارکننده ace') || ['enalapril', 'benazepril', 'ramipril'].some(x => text.includes(x)),
      isPotassiumSparing: text.includes('spironolactone') || text.includes('نگه‌دارنده پتاسیم') || d.id.includes('spironolactone'),
      isPotassiumSupp: text.includes('potassium') && (text.includes('chloride') || text.includes('citrate') || text.includes('gluconate') || text.includes('مکمل') || text.includes('پتاسیم')),
      isBetaBlocker: text.includes('beta-blocker') || text.includes('بتابلاکر') || ['atenolol', 'propranolol', 'timolol', 'sotalol', 'carvedilol'].some(x => text.includes(x)),
      isCalciumChannelBlocker: text.includes('calcium channel') || text.includes('کانال کلسیم') || ['diltiazem', 'verapamil', 'amlodipine'].some(x => text.includes(x))
    };
  };

  const c1 = getCategories(d1);
  const c2 = getCategories(d2);

  // NSAID + Steroid
  if ((c1.isNSAID && c2.isSteroid) || (c2.isNSAID && c1.isSteroid)) {
    return {
      drugs: [d1.id, d2.id],
      severity: 'major',
      title: '🔴 خطر مهلک سوراخ‌شدگی گوارشی و زخم حاد معده (همپوشانی ضدالتهاب‌ها)',
      mechanism: 'مهار همزمان آنزیم‌های سیکلواکسیژناز (COX) توسط مسکن NSAID و فسفولیپاز A2 توسط کورتیکواستروئید که منجر به افت فاجعه‌بار پروستاگلاندین‌های محافظ سلولی (PGE2/PGI2) در مخاط معده و روده می‌شود.',
      clinical_effect: 'منع مصرف قطعی همزمان؛ حداقل ۴۸ تا ۷۲ ساعت (و ترجیحاً ۵ تا ۷ روز) دوره شستشو (Washout) بین قطع یکی و شروع دیگری الزامی است.',
      sources: [
        "Plumb's Veterinary Drug Handbook (10th Ed)",
        "Papich Handbook of Veterinary Drugs (5th Ed)",
        "BSAVA Small Animal Formulary (12th Ed)",
        "Veterinary Anesthesia and Analgesia (Lumb & Jones, 6th Ed)",
        "Handbook of Veterinary Pain Management (3rd Ed)"
      ]
    };
  }

  // Fluoroquinolone + Cation Chelator
  if ((c1.isFluoroquinolone && c2.isCationChelator) || (c2.isFluoroquinolone && c1.isCationChelator)) {
    return {
      drugs: [d1.id, d2.id],
      severity: 'major',
      title: '🔴 کلاتاسیون شدید و افت بیش از ۹۰٪ جذب گوارشی آنتی‌بیوتیک',
      mechanism: 'کاتیون‌های چندظرفیتی با ساختار کینولونی در لومن روده کمپلکس کلات نامحلول تشکیل داده و مانع از جذب دارو می‌شوند.',
      clinical_effect: 'حداقل ۲ ساعت فاصله زمانی بین مصرف خوراکی سوکرالفات یا مکمل‌های کاتیونی و فلوروکینولون الزامی است.',
      sources: [
        "Plumb's Veterinary Drug Handbook (10th Ed)",
        "Papich Handbook of Veterinary Drugs (5th Ed)",
        "BSAVA Small Animal Formulary (12th Ed)"
      ]
    };
  }

  // Aminoglycoside + Loop Diuretic
  if ((c1.isAminoglycoside && c2.isLoopDiuretic) || (c2.isAminoglycoside && c1.isLoopDiuretic)) {
    return {
      drugs: [d1.id, d2.id],
      severity: 'major',
      title: '🔴 تشدید مضاعف سمیت حاد کلیوی و ناشنوایی پایدار (Nephrotoxicity & Ototoxicity)',
      mechanism: 'همپوشانی سمیت سلول‌های مویی گوش داخلی و نکروز توبولار حاد کلیه ناشی از تخلیه مایع حلزون و غلظت بالای آمینوگلیکوزید.',
      clinical_effect: 'از مصرف همزمان فوروزماید با آمینوگلیکوزیدها اجتناب شود؛ در صورت لزوم مصرف، هیدراتاسیون وریدی کامل و پایش مکرر کراتینین الزامی است.',
      sources: [
        "Plumb's Veterinary Drug Handbook (10th Ed)",
        "BSAVA Small Animal Formulary (12th Ed)",
        "Refresher Guide in Veterinary Pharmacology and Toxicology"
      ]
    };
  }

  // Aminoglycoside + Neuromuscular blocker / inhalant
  if ((c1.isAminoglycoside && c2.isNeuromuscularOrInhalant) || (c2.isAminoglycoside && c1.isNeuromuscularOrInhalant)) {
    return {
      drugs: [d1.id, d2.id],
      severity: 'major',
      title: '🔴 تشدید شدید بلوک عصبی-عضلانی و آپنه تنفسی طولانی‌مدت',
      mechanism: 'آمینوگلیکوزیدها با مهار ورود کلسیم به پایانه‌های پیش‌سیناپسی، رهایش استیل‌کولین را مهار کرده و فلج عضلات تنفسی را طولانی می‌کنند.',
      clinical_effect: 'پایش مداوم ونتیلاسیون در بیماران جراحی؛ تزریق کلسیم گلوکونات وریدی ممکن است در خنثی‌سازی بلوک ناشی از آمینوگلیکوزید کمک‌کننده باشد.',
      sources: [
        "Veterinary Anesthesia and Analgesia (Lumb & Jones, 6th Ed)",
        "Plumb's Veterinary Drug Handbook (10th Ed)"
      ]
    };
  }

  // Tramadol + Serotonergic
  if ((c1.isTramadol && c2.isSerotonergic) || (c2.isTramadol && c1.isSerotonergic)) {
    return {
      drugs: [d1.id, d2.id],
      severity: 'major',
      title: '🔴 خطر مهلک سندروم سروتونین (Serotonin Syndrome): تشنج، هایپرترمی و مرگ',
      mechanism: 'مهار همزمان بازجذب سروتونین و تجمع سمی آن در سیناپس‌های CNS.',
      clinical_effect: 'منع مصرف مطلق همزمان؛ حداقل ۱۴ روز فاصله شستشو بین قطع داروی سروتونرژیک و شروع ترامادول الزامی است.',
      sources: [
        "Papich Handbook of Veterinary Drugs (5th Ed)",
        "Plumb's Veterinary Drug Handbook (10th Ed)",
        "Blackwell's Five-Minute Veterinary Drug Consult: Canine and Feline"
      ]
    };
  }

  // ACEi + NSAID
  if ((c1.isACEi && c2.isNSAID) || (c2.isACEi && c1.isNSAID)) {
    return {
      drugs: [d1.id, d2.id],
      severity: 'major',
      title: '🔴 افت شدید فیلتراسیون گلومرولی (GFR) و نارسایی حاد کلیه',
      mechanism: 'مهارکننده ACE آرتریول وابران گلومرول را گشاد می‌کند در حالی که NSAID آرتریول آوران را تنگ می‌کند؛ افت فشار فیلتراسیون گلومرولی.',
      clinical_effect: 'از مصرف همزمان پرهیز شود؛ در صورت الزام، پایش کراتینین و الکترولیت‌ها هر ۳ تا ۵ روز ضروری است.',
      sources: [
        "Plumb's Veterinary Drug Handbook (10th Ed)",
        "BSAVA Small Animal Formulary (12th Ed)",
        "Blackwell's Five-Minute Veterinary Drug Consult: Canine and Feline"
      ]
    };
  }

  // Potassium-sparing / ACEi + Potassium
  if (((c1.isACEi || c1.isPotassiumSparing) && c2.isPotassiumSupp) || ((c2.isACEi || c2.isPotassiumSparing) && c1.isPotassiumSupp)) {
    return {
      drugs: [d1.id, d2.id],
      severity: 'major',
      title: '🔴 خطر مهلک ایست قلبی ناشی از هایپرکالمی شدید',
      mechanism: 'کاهش دفع کلیوی پتاسیم همزمان با تجویز بار خارجی پتاسیم.',
      clinical_effect: 'منع مصرف همزمان مگر در موارد هایپوکالمی مستند با پایش مکرر گازهای خون و ECG.',
      sources: [
        "Plumb's Veterinary Drug Handbook (10th Ed)",
        "BSAVA Small Animal Formulary (12th Ed)"
      ]
    };
  }

  // Beta Blocker + Calcium Channel Blocker
  if ((c1.isBetaBlocker && c2.isCalciumChannelBlocker) || (c2.isBetaBlocker && c1.isCalciumChannelBlocker)) {
    return {
      drugs: [d1.id, d2.id],
      severity: 'major',
      title: '🔴 مهار مضاعف گره دهلیزی-بطنی (AV Node): برادی‌کاردی شدید و سنکوپ',
      mechanism: 'اثر سینرژیک بر مهار خودکاری و هدایت الکتریکی گره‌های SA و AV و تضعیف قدرت انقباضی میوکارد.',
      clinical_effect: 'پایش دقیق ریتم قلب و فشار خون؛ در صورت بروز برادی‌کاردی علامت‌دار یکی از داروها قطع گردد.',
      sources: [
        "Plumb's Veterinary Drug Handbook (10th Ed)",
        "Veterinary Ophthalmology (Gelatt, 6th Ed)"
      ]
    };
  }

  // Opioid + Sedative
  if ((c1.isOpioid && c2.isSedative) || (c2.isOpioid && c1.isSedative)) {
    return {
      drugs: [d1.id, d2.id],
      severity: 'synergy',
      title: '🟢 نروپت‌آنالژزی استاندارد جراحی با لزوم پایش تنفس و فشار خون',
      mechanism: "تسکین عمیق درد از طریق گیرنده‌های اپیوئیدی و آرام‌بخشی از طریق گیرنده‌های آلفا-۲ یا گابا.",
      clinical_effect: "پروتکل طلایی پری‌مدیکاسیون جراحی؛ پایش درصد اشباع اکسیژن (SpO2) و ضربان قلب الزامی است.",
      sources: [
        "Veterinary Anesthesia and Analgesia (Lumb & Jones, 6th Ed)",
        "Handbook of Veterinary Pain Management (3rd Ed)"
      ]
    };
  }

  return null;
}

function getSingleDrugAllInteractions(drugId) {
  const target = DRUGS_DATA.find(d => d.id === drugId);
  if (!target) return null;

  const results = [];
  const seenPartners = new Set();

  if (typeof PLUMBS_INTERACTION_MATRIX !== 'undefined' && Array.isArray(PLUMBS_INTERACTION_MATRIX)) {
    PLUMBS_INTERACTION_MATRIX.forEach(m => {
      if (m.drugs && m.drugs.includes(drugId)) {
        const partnerId = m.drugs.find(id => id !== drugId);
        if (partnerId && !seenPartners.has(partnerId)) {
          seenPartners.add(partnerId);
          const partner = DRUGS_DATA.find(d => d.id === partnerId);
          results.push({
            partnerId,
            partnerNameFa: partner ? (partner.generic_name_fa || partner.name_fa) : partnerId,
            partnerNameEn: partner ? (partner.generic_name_en || partner.name_en) : partnerId,
            partnerClass: partner ? (partner.drug_class_fa || partner.therapeutic_category_fa || '') : '',
            severity: m.severity || 'moderate',
            title: m.title || (m.severity === 'major' ? `🔴 تداخل با ${partner ? partner.generic_name_fa : partnerId}` : `🟡 احتیاط و پایش در مصرف همزمان`),
            mechanism: m.mechanism || 'تداخل فارماکوکینتیک یا فارماکودینامیک متقابل.',
            clinical_effect: m.clinical_effect || 'پایش دقیق بالینی و رعایت فاصله زمانی یا تعدیل دوز.',
            sources: m.sources || ["Plumb's Veterinary Drug Handbook (10th Ed)", "Papich Handbook of Veterinary Drugs (5th Ed)"],
            source: 'matrix'
          });
        }
      }
    });
  }

  const monographInteractions = target.interactions || target.drug_interactions || [];
  monographInteractions.forEach(it => {
    const pName = it.drug || it.drug_name || '';
    if (!pName) return;

    const isAlreadyCovered = Array.from(seenPartners).some(pid => {
      const p = DRUGS_DATA.find(x => x.id === pid);
      if (!p) return false;
      const fa = (p.generic_name_fa || '').toLowerCase();
      const en = (p.generic_name_en || '').toLowerCase();
      return pName.toLowerCase().includes(fa) || pName.toLowerCase().includes(en) || pName.toLowerCase().includes(pid);
    });

    if (!isAlreadyCovered) {
      results.push({
        partnerId: null,
        partnerNameFa: pName,
        partnerNameEn: '',
        partnerClass: 'مونوگراف بالینی',
        severity: it.severity || 'moderate',
        title: it.title || `تداخل با ${pName}`,
        mechanism: it.mechanism || it.note || 'مکانیسم فارماکولوژیک اختصاصی ثبت‌شده در مونوگراف.',
        clinical_effect: it.clinical_effect || it.note || 'احتیاط در مصرف همزمان و ارزیابی علائم بالینی.',
        sources: it.sources || ["Plumb's Veterinary Drug Handbook (10th Ed)", "Papich Handbook of Veterinary Drugs (5th Ed)", "BSAVA Small Animal Formulary (12th Ed)"],
        source: 'monograph'
      });
    }
  });

  if (Array.isArray(target.synergistic_combinations)) {
    target.synergistic_combinations.forEach(syn => {
      const synName = syn.partner_name || syn.combo || syn.cocktail_title || '';
      if (synName && !results.some(r => r.title.includes(synName) || r.partnerNameFa.includes(synName))) {
        results.push({
          partnerId: syn.partner_id || null,
          partnerNameFa: synName,
          partnerNameEn: '',
          partnerClass: 'پروتکل هم‌افزا',
          severity: 'synergy',
          title: `هم‌افزایی بالینی: ${synName}`,
          mechanism: syn.mechanism || syn.indication || 'ترکیب درمانی هم‌پوشان و سینرژیک.',
          clinical_effect: syn.clinical_pearl || syn.dose_adjustment || 'پروتکل استاندارد بالینی با کاهش دوز اختصاصی.',
          source: 'synergy'
        });
      }
    });
  }

  results.sort((a, b) => {
    const order = { major: 1, moderate: 2, minor: 3, synergy: 4 };
    return (order[a.severity] || 99) - (order[b.severity] || 99);
  });

  const counts = {
    total: results.length,
    major: results.filter(r => r.severity === 'major').length,
    moderate: results.filter(r => r.severity === 'moderate' || r.severity === 'minor').length,
    synergy: results.filter(r => r.severity === 'synergy').length
  };

  return {
    drug: target,
    counts,
    interactions: results
  };
}

function selectSingleDrugForInteractions(drugId) {
  currentSingleDrugId = drugId;
  singleDrugSeverityFilter = 'all';
  singleDrugInnerQuery = '';

  const drug = DRUGS_DATA.find(d => d.id === drugId);
  if (!drug) return;

  const searchInput = document.getElementById('singleDrugSearchInput');
  if (searchInput) {
    searchInput.value = `${drug.generic_name_fa} (${drug.generic_name_en})`;
  }

  const suggestionsBox = document.getElementById('singleDrugSuggestions');
  if (suggestionsBox) {
    suggestionsBox.classList.add('hidden');
    suggestionsBox.innerHTML = '';
  }

  renderSingleDrugResults();
}

function filterSingleDrugSeverity(sev) {
  singleDrugSeverityFilter = sev;
  renderSingleDrugResults();
}

function filterSingleDrugInnerQuery(query) {
  singleDrugInnerQuery = (query || '').trim().toLowerCase();
  renderSingleDrugResults(false);
}

function loadDrugIntoMultiInteraction(drugId) {
  const cb = document.querySelector(`.interact-cb[value="${drugId}"]`);
  if (cb) cb.checked = true;
  switchInteractionMode('multi');
  checkSelectedInteractions();
}

function renderSingleDrugResults(resetInnerInput = true) {
  const container = document.getElementById('singleDrugResultsContainer');
  if (!container) return;

  if (!currentSingleDrugId) {
    container.innerHTML = `
      <div class="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-3xl text-center space-y-2">
        <div class="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
          <i data-lucide="zap" class="w-6 h-6"></i>
        </div>
        <h4 class="text-sm font-black text-slate-800">هیچ دارویی برای بررسی ۳۶۰ درجه انتخاب نشده است</h4>
        <p class="text-xs text-slate-500 max-w-md mx-auto">
          نام داروی مورد نظر خود را در کادر بالا بنویسید یا روی یکی از دکمه‌های پرمراجعه کلیک فرمایید تا تمامی تداخلات ماژور، متوسط و هم‌افزایی‌های آن به صورت تفکیک‌شده ظاهر شوند.
        </p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  const data = getSingleDrugAllInteractions(currentSingleDrugId);
  if (!data || !data.drug) return;

  const target = data.drug;
  const counts = data.counts;

  let filtered = data.interactions;
  if (singleDrugSeverityFilter !== 'all') {
    if (singleDrugSeverityFilter === 'moderate') {
      filtered = filtered.filter(it => it.severity === 'moderate' || it.severity === 'minor');
    } else {
      filtered = filtered.filter(it => it.severity === singleDrugSeverityFilter);
    }
  }

  if (typeof singleDrugBookFilter !== 'undefined' && singleDrugBookFilter !== 'all') {
    filtered = filtered.filter(it => {
      const srcStr = (it.sources || []).join(' ').toLowerCase();
      if (singleDrugBookFilter === 'plumbs') return srcStr.includes('plumb');
      if (singleDrugBookFilter === 'papich') return srcStr.includes('papich');
      if (singleDrugBookFilter === 'bsava') return srcStr.includes('bsava');
      if (singleDrugBookFilter === 'anesth') return srcStr.includes('anesthesia') || srcStr.includes('lumb') || srcStr.includes('pain');
      if (singleDrugBookFilter === 'onco') return srcStr.includes('oncology') || srcStr.includes('withrow');
      if (singleDrugBookFilter === 'exotic') return srcStr.includes('carpenter') || srcStr.includes('exotic') || srcStr.includes('wildlife');
      if (singleDrugBookFilter === 'opht') return srcStr.includes('ophthalmology') || srcStr.includes('slatter') || srcStr.includes('gelatt');
      if (singleDrugBookFilter === 'large') return srcStr.includes('camelids') || srcStr.includes('دامپزشکی کشور');
      return true;
    });
  }

  if (singleDrugInnerQuery) {
    filtered = filtered.filter(it => {
      const fa = (it.partnerNameFa || '').toLowerCase();
      const en = (it.partnerNameEn || '').toLowerCase();
      const tit = (it.title || '').toLowerCase();
      const mech = (it.mechanism || '').toLowerCase();
      const eff = (it.clinical_effect || '').toLowerCase();
      return fa.includes(singleDrugInnerQuery) || en.includes(singleDrugInnerQuery) || tit.includes(singleDrugInnerQuery) || mech.includes(singleDrugInnerQuery) || eff.includes(singleDrugInnerQuery);
    });
  }

  let heroWarningBadge = '';
  if (target.id === 'paracetamol_acetaminophen') {
    heroWarningBadge = '<span class="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[11px] font-black animate-pulse flex items-center gap-1"><i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i> خط قرمز مرگبار در گربه (متهیموگلوبینمی)</span>';
  } else if (target.has_xylitol_warning) {
    heroWarningBadge = '<span class="px-2.5 py-1 rounded-xl bg-rose-600 text-white text-[11px] font-black flex items-center gap-1"><i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i> هشدار زایلیتول انسانی</span>';
  } else if (target.mdr1_sensitive) {
    heroWarningBadge = '<span class="px-2.5 py-1 rounded-xl bg-purple-700 text-white text-[11px] font-black flex items-center gap-1"><i data-lucide="dna" class="w-3.5 h-3.5"></i> حساسیت نژادی MDR1 / ABCB1</span>';
  }

  container.innerHTML = `
    <!-- بنر داروی انتخابی (Hero Banner) -->
    <div class="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/90 to-slate-900 text-white border border-amber-800/40 shadow-md space-y-3">
      <div class="flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-400/30 flex items-center justify-center shrink-0">
            <i data-lucide="pill" class="w-6 h-6"></i>
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h3 class="text-base sm:text-lg font-black text-white">${target.generic_name_fa}</h3>
              <span class="text-xs text-amber-300 font-mono font-bold">(${target.generic_name_en})</span>
              ${heroWarningBadge}
            </div>
            <p class="text-xs text-slate-300 mt-0.5">
              ${target.drug_class_fa || ''} ${target.drug_class_en ? '(' + target.drug_class_en + ')' : ''} • ${target.therapeutic_category_fa || ''}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button type="button" onclick="closeInteractionsModal(); openMonographModal('${target.id}')" class="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1 border border-white/20">
            <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
            <span>مونوگراف کامل</span>
          </button>
          <button type="button" onclick="loadDrugIntoMultiInteraction('${target.id}')" class="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition flex items-center gap-1 shadow-xs">
            <i data-lucide="layers" class="w-3.5 h-3.5"></i>
            <span>بررسی در نسخه چنددارویی</span>
          </button>
        </div>
      </div>

      <!-- نوار فیلترهای تفکیکی بر اساس سطح خطر و ۱۶ کتاب مرجع -->
      <div class="pt-3 border-t border-white/10 space-y-2.5">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-1.5 flex-wrap">
            <button type="button" onclick="filterSingleDrugSeverity('all')" class="px-3 py-1 rounded-xl text-xs font-bold transition ${singleDrugSeverityFilter === 'all' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'bg-white/10 text-white hover:bg-white/20'}">
              همه موارد (${counts.total})
            </button>
            <button type="button" onclick="filterSingleDrugSeverity('major')" class="px-3 py-1 rounded-xl text-xs font-bold transition ${singleDrugSeverityFilter === 'major' ? 'bg-rose-600 text-white font-black shadow-xs' : 'bg-rose-950/60 text-rose-200 border border-rose-800 hover:bg-rose-900'}">
              🔴 ماژور / خط قرمز (${counts.major})
            </button>
            <button type="button" onclick="filterSingleDrugSeverity('moderate')" class="px-3 py-1 rounded-xl text-xs font-bold transition ${singleDrugSeverityFilter === 'moderate' ? 'bg-amber-500 text-slate-950 font-black shadow-xs' : 'bg-amber-950/60 text-amber-200 border border-amber-800 hover:bg-amber-900'}">
              🟡 متوسط و احتیاط (${counts.moderate})
            </button>
            <button type="button" onclick="filterSingleDrugSeverity('synergy')" class="px-3 py-1 rounded-xl text-xs font-bold transition ${singleDrugSeverityFilter === 'synergy' ? 'bg-emerald-600 text-white font-black shadow-xs' : 'bg-emerald-950/60 text-emerald-200 border border-emerald-800 hover:bg-emerald-900'}">
              🟢 هم‌افزایی مثبت (${counts.synergy})
            </button>
          </div>

          <!-- فیلتر زنده داخلی در میان داروها -->
          <div class="w-full sm:w-64">
            <input 
              type="text" 
              placeholder="فیلتر داروی متداخل (مثلاً کتامین)..." 
              value="${singleDrugInnerQuery}"
              oninput="filterSingleDrugInnerQuery(this.value)"
              class="w-full px-3 py-1 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400 font-sans"
            >
          </div>
        </div>

        <!-- فیلتر تفکیکی بر اساس ۱۶ کتاب مرجع -->
        <div class="pt-2 border-t border-white/5 flex items-center gap-1.5 flex-wrap text-[11px]">
          <span class="text-amber-300 font-bold ml-1">📚 فیلتر مرجع:</span>
          <button type="button" onclick="filterSingleDrugBook('all')" class="px-2.5 py-0.5 rounded-lg font-bold transition ${singleDrugBookFilter === 'all' ? 'bg-white text-slate-950 shadow-2xs' : 'bg-white/10 text-slate-300 hover:bg-white/20'}">همه مراجع (۱۶ کتاب)</button>
          <button type="button" onclick="filterSingleDrugBook('plumbs')" class="px-2 py-0.5 rounded-lg font-bold transition ${singleDrugBookFilter === 'plumbs' ? 'bg-amber-400 text-slate-950' : 'bg-white/5 text-amber-200 hover:bg-white/15'}">پلامبز ۱۰</button>
          <button type="button" onclick="filterSingleDrugBook('papich')" class="px-2 py-0.5 rounded-lg font-bold transition ${singleDrugBookFilter === 'papich' ? 'bg-sky-400 text-slate-950' : 'bg-white/5 text-sky-200 hover:bg-white/15'}">پاپیچ ۵</button>
          <button type="button" onclick="filterSingleDrugBook('bsava')" class="px-2 py-0.5 rounded-lg font-bold transition ${singleDrugBookFilter === 'bsava' ? 'bg-indigo-400 text-slate-950' : 'bg-white/5 text-indigo-200 hover:bg-white/15'}">BSAVA ۱۲</button>
          <button type="button" onclick="filterSingleDrugBook('anesth')" class="px-2 py-0.5 rounded-lg font-bold transition ${singleDrugBookFilter === 'anesth' ? 'bg-emerald-400 text-slate-950' : 'bg-white/5 text-emerald-200 hover:bg-white/15'}">بیهوشی و درد (Lumb & Jones)</button>
          <button type="button" onclick="filterSingleDrugBook('onco')" class="px-2 py-0.5 rounded-lg font-bold transition ${singleDrugBookFilter === 'onco' ? 'bg-purple-400 text-slate-950' : 'bg-white/5 text-purple-200 hover:bg-white/15'}">انکولوژی (Withrow)</button>
          <button type="button" onclick="filterSingleDrugBook('exotic')" class="px-2 py-0.5 rounded-lg font-bold transition ${singleDrugBookFilter === 'exotic' ? 'bg-teal-400 text-slate-950' : 'bg-white/5 text-teal-200 hover:bg-white/15'}">اگزوتیک (Carpenter)</button>
          <button type="button" onclick="filterSingleDrugBook('opht')" class="px-2 py-0.5 rounded-lg font-bold transition ${singleDrugBookFilter === 'opht' ? 'bg-cyan-400 text-slate-950' : 'bg-white/5 text-cyan-200 hover:bg-white/15'}">چشم‌پزشکی (Slatter / Gelatt)</button>
          <button type="button" onclick="filterSingleDrugBook('large')" class="px-2 py-0.5 rounded-lg font-bold transition ${singleDrugBookFilter === 'large' ? 'bg-orange-400 text-slate-950' : 'bg-white/5 text-orange-200 hover:bg-white/15'}">شترسانان و دام بزرگ</button>
        </div>
      </div>
    </div>

    <!-- لیست کارت‌های تداخلات شناسایی‌شده -->
    <div class="space-y-3 pt-1">
      ${filtered.length === 0 ? `
        <div class="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-1.5">
          <p class="text-xs font-bold text-slate-700">موردی با این فیلتر یا نام دارو در میان تداخلات ${target.generic_name_fa} یافت نشد.</p>
          <p class="text-[11px] text-slate-500">برای مشاهده همه موارد، دکمه «همه موارد (${counts.total})» را انتخاب فرمایید.</p>
        </div>
      ` : filtered.map((it, idx) => {
        let cardStyle = '';
        let badgeStyle = '';
        let badgeLabel = '';

        if (it.severity === 'major') {
          cardStyle = 'bg-rose-50/90 border-rose-300 text-rose-950';
          badgeStyle = 'bg-rose-600 text-white';
          badgeLabel = '🔴 ماژور / خط قرمز (منع همزمان)';
        } else if (it.severity === 'synergy') {
          cardStyle = 'bg-emerald-50/90 border-emerald-300 text-emerald-950';
          badgeStyle = 'bg-emerald-600 text-white';
          badgeLabel = '🟢 ترکیب هم‌افزا (سینرژی بالینی)';
        } else {
          cardStyle = 'bg-amber-50/90 border-amber-300 text-amber-950';
          badgeStyle = 'bg-amber-500 text-white';
          badgeLabel = '🟡 متوسط / احتیاط و پایش';
        }

        return `
          <div class="p-4 rounded-2xl border ${cardStyle} shadow-2xs space-y-2.5 transition hover:shadow-md">
            <div class="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-black/10">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-black text-xs text-slate-900 bg-white/80 px-2 py-0.5 rounded-lg border border-black/5">
                  ${target.generic_name_fa}
                </span>
                <span class="text-slate-400 font-black text-xs">+</span>
                <span class="font-black text-xs text-slate-950 bg-white px-2.5 py-1 rounded-lg border border-black/15 shadow-2xs">
                  ${it.partnerNameFa} ${it.partnerNameEn ? '<span class="text-slate-500 font-mono font-normal">(' + it.partnerNameEn + ')</span>' : ''}
                </span>
                ${it.partnerClass ? `
                  <span class="text-[10px] text-slate-500 font-bold bg-white/60 px-2 py-0.5 rounded-md">
                    ${it.partnerClass}
                  </span>
                ` : ''}
              </div>

              <div class="flex items-center gap-2">
                <span class="text-[10px] font-black px-2.5 py-0.5 rounded-full ${badgeStyle} shadow-2xs">
                  ${badgeLabel}
                </span>
                ${it.partnerId ? `
                  <button type="button" onclick="selectSingleDrugForInteractions('${it.partnerId}')" class="text-[10px] font-black px-2.5 py-0.5 rounded-lg bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 transition flex items-center gap-1 shadow-2xs" title="بررسی تداخلات این دارو">
                    <i data-lucide="zap" class="w-3 h-3 text-amber-600"></i>
                    <span>رادار این دارو ⚡</span>
                  </button>
                ` : ''}
              </div>
            </div>

            ${it.title ? `
              <h5 class="text-xs font-black text-slate-900 leading-snug">
                ${it.title}
              </h5>
            ` : ''}

            <div class="text-[11px] space-y-1.5 leading-relaxed">
              <div class="bg-white/80 p-2.5 rounded-xl border border-black/5">
                <strong class="font-bold text-slate-800 block mb-0.5">🔬 مکانیسم فارماکولوژیک:</strong>
                <p class="text-slate-700">${it.mechanism}</p>
              </div>
              <div class="bg-white/80 p-2.5 rounded-xl border border-black/5">
                <strong class="font-bold text-slate-800 block mb-0.5">📋 توصیه بالینی و اقدام عملیاتی:</strong>
                <p class="text-slate-700">${it.clinical_effect}</p>
              </div>
            </div>
            ${renderInteractionSourcesBadgesHtml(it.sources)}
          </div>
        `;
      }).join('')}
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

// ساخت چک‌باکس‌های داروها
function setupInteractionsCheckboxes() {
  const container = document.getElementById('interactCheckboxes');
  if (!container) return;

  container.innerHTML = DRUGS_DATA.map(d => `
    <label class="interact-item flex items-center gap-2 p-2 bg-white hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 rounded-xl text-xs cursor-pointer transition select-none shadow-2xs" data-drug-id="${d.id}" data-search="${d.generic_name_fa} ${d.generic_name_en} ${d.id}">
      <input type="checkbox" value="${d.id}" class="interact-cb accent-amber-600 rounded shrink-0" onchange="onInteractionCheckboxChange()">
      <div class="truncate">
        <span class="font-bold text-slate-800 block truncate text-[11px]">${d.generic_name_fa}</span>
        <span class="text-[10px] text-slate-500 font-mono block truncate">${d.generic_name_en}</span>
      </div>
    </label>
  `).join('');
}

// فیلتر جستجوی زنده در چک‌باکس‌های داروها
function filterInteractionCheckboxes(query) {
  const q = (query || '').trim().toLowerCase();
  const items = document.querySelectorAll('.interact-item');
  items.forEach(item => {
    const searchData = (item.getAttribute('data-search') || '').toLowerCase();
    if (!q || searchData.includes(q)) {
      item.classList.remove('hidden');
    } else {
      item.classList.add('hidden');
    }
  });
}

// بارگذاری نسخه‌های آماده
function loadInteractionPreset(presetDrugIds) {
  if (!Array.isArray(presetDrugIds)) return;
  const checkboxes = document.querySelectorAll('.interact-cb');
  checkboxes.forEach(cb => {
    cb.checked = presetDrugIds.includes(cb.value);
  });
  const searchInput = document.getElementById('interactionSearchInput');
  if (searchInput) {
    searchInput.value = '';
    filterInteractionCheckboxes('');
  }
  checkSelectedInteractions();
}

// پاک کردن کل انتخاب‌ها
function clearAllInteractions() {
  const checkboxes = document.querySelectorAll('.interact-cb');
  checkboxes.forEach(cb => {
    cb.checked = false;
  });
  const searchInput = document.getElementById('interactionSearchInput');
  if (searchInput) {
    searchInput.value = '';
    filterInteractionCheckboxes('');
  }
  checkSelectedInteractions();
}

// حذف یک داروی خاص از انتخاب‌ها با کلیک روی ضربدر برچسب
function removeInteractionDrug(drugId) {
  const cb = document.querySelector(`.interact-cb[value="${drugId}"]`);
  if (cb) {
    cb.checked = false;
  }
  checkSelectedInteractions();
}

// پاسخ به تغییر چک‌باکس
function onInteractionCheckboxChange() {
  checkSelectedInteractions();
}

// بررسی جامع تداخلات بین همه داروهای انتخاب‌شده
function checkSelectedInteractions() {
  const checkedBoxes = Array.from(document.querySelectorAll('.interact-cb:checked')).map(cb => cb.value);
  const countEl = document.getElementById('selectedInteractionsCount');
  const pillsEl = document.getElementById('selectedInteractionPills');
  const summaryBadge = document.getElementById('interactionSummaryBadge');
  const resContainer = document.getElementById('interactionResults');

  if (countEl) {
    countEl.textContent = `${checkedBoxes.length} دارو انتخاب شده`;
  }

  // به‌روزرسانی برچسب‌های داروهای انتخاب‌شده
  if (pillsEl) {
    if (checkedBoxes.length === 0) {
      pillsEl.innerHTML = `<span class="text-[11px] text-slate-400 italic">هیچ دارویی انتخاب نشده است. از لیست زیر تیک بزنید یا از نسخه‌های سریع استفاده کنید.</span>`;
    } else {
      pillsEl.innerHTML = checkedBoxes.map(id => {
        const d = DRUGS_DATA.find(x => x.id === id);
        const nameFa = d ? d.generic_name_fa : id;
        return `
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100/90 text-amber-950 border border-amber-300 rounded-lg text-xs font-bold">
            <span>${nameFa}</span>
            <button type="button" onclick="removeInteractionDrug('${id}')" class="text-amber-800 hover:text-rose-600 transition" title="حذف دارو">
              <i data-lucide="x" class="w-3.5 h-3.5"></i>
            </button>
          </span>
        `;
      }).join('');
    }
  }

  if (checkedBoxes.length < 2) {
    if (summaryBadge) summaryBadge.classList.add('hidden');
    if (resContainer) {
      resContainer.innerHTML = `
        <div class="p-4 bg-slate-100 text-slate-500 rounded-2xl text-xs text-center border border-slate-200">
          حداقل ۲ دارو را در بالا انتخاب کنید تا رادار تداخلات فوراً فعال شود.
        </div>
      `;
    }
    if (window.lucide) lucide.createIcons();
    return;
  }

  // بررسی همه جفت‌های دارو (Pairwise Analysis)
  const foundPairs = [];
  const processedPairKeys = new Set();

  for (let i = 0; i < checkedBoxes.length; i++) {
    for (let j = i + 1; j < checkedBoxes.length; j++) {
      const id1 = checkedBoxes[i];
      const id2 = checkedBoxes[j];
      const d1 = DRUGS_DATA.find(d => d.id === id1);
      const d2 = DRUGS_DATA.find(d => d.id === id2);
      if (!d1 || !d2) continue;

      const pairKey = [id1, id2].sort().join('___');
      if (processedPairKeys.has(pairKey)) continue;

      // ۱. بررسی در ماتریس تخصصی PLUMBS_INTERACTION_MATRIX
      let match = null;
      if (typeof PLUMBS_INTERACTION_MATRIX !== 'undefined') {
        match = PLUMBS_INTERACTION_MATRIX.find(m => 
          (m.drugs.includes(id1) && m.drugs.includes(id2))
        );
      }

      // ۲. در صورت عدم تطابق ماتریس اصلی، بررسی در مونوگراف تداخلات هر دارو (هر دو فیلد drug_interactions و interactions)
      if (!match) {
        const list1 = (d1.drug_interactions || []).concat(d1.interactions || []);
        const list2 = (d2.drug_interactions || []).concat(d2.interactions || []);

        const inter1 = list1.find(it => {
          const dn = (it.drug_name || it.drug || it.name || '').toLowerCase();
          return dn.includes(d2.id.toLowerCase()) || 
                 dn.includes(d2.generic_name_fa.toLowerCase()) || 
                 dn.includes(d2.generic_name_en.toLowerCase()) ||
                 (d2.name_fa && dn.includes(d2.name_fa.toLowerCase())) ||
                 (d2.name_en && dn.includes(d2.name_en.toLowerCase()));
        });

        const inter2 = list2.find(it => {
          const dn = (it.drug_name || it.drug || it.name || '').toLowerCase();
          return dn.includes(d1.id.toLowerCase()) || 
                 dn.includes(d1.generic_name_fa.toLowerCase()) || 
                 dn.includes(d1.generic_name_en.toLowerCase()) ||
                 (d1.name_fa && dn.includes(d1.name_fa.toLowerCase())) ||
                 (d1.name_en && dn.includes(d1.name_en.toLowerCase()));
        });

        if (inter1) {
          match = {
            drugs: [id1, id2],
            severity: inter1.severity || 'moderate',
            title: inter1.title || (inter1.severity === 'major' ? `🔴 تداخل با ${d2.generic_name_fa}` : (inter1.severity === 'synergy' ? `🟢 هم‌افزایی با ${d2.generic_name_fa}` : `🟡 احتیاط و پایش در مصرف همزمان`)),
            mechanism: inter1.mechanism || inter1.note || 'تداخل فارماکوکینتیک یا فارماکودینامیک متقابل.',
            clinical_effect: inter1.clinical_effect || inter1.note || 'پایش دقیق بالینی و در صورت امکان رعایت فاصله زمانی یا تعدیل دوز.',
            sources: inter1.sources || ["Plumb's Veterinary Drug Handbook (10th Ed)", "Papich Handbook of Veterinary Drugs (5th Ed)", "BSAVA Small Animal Formulary (12th Ed)"]
          };
        } else if (inter2) {
          match = {
            drugs: [id1, id2],
            severity: inter2.severity || 'moderate',
            title: inter2.title || (inter2.severity === 'major' ? `🔴 تداخل با ${d1.generic_name_fa}` : (inter2.severity === 'synergy' ? `🟢 هم‌افزایی با ${d1.generic_name_fa}` : `🟡 احتیاط و پایش در مصرف همزمان`)),
            mechanism: inter2.mechanism || inter2.note || 'تداخل فارماکوکینتیک یا فارماکودینامیک متقابل.',
            clinical_effect: inter2.clinical_effect || inter2.note || 'پایش دقیق بالینی و در صورت امکان رعایت فاصله زمانی یا تعدیل دوز.',
            sources: inter2.sources || ["Plumb's Veterinary Drug Handbook (10th Ed)", "Papich Handbook of Veterinary Drugs (5th Ed)", "BSAVA Small Animal Formulary (12th Ed)"]
          };
        }
      }

      // ۳. تطبیق هوشمند سطح رده دارویی بر اساس ۱۶ کتاب مرجع (Class-Level Smart Matching)
      if (!match) {
        match = checkClassLevelInteraction(d1, d2);
      }

      if (match) {
        processedPairKeys.add(pairKey);
        foundPairs.push({
          d1,
          d2,
          interaction: match
        });
      }
    }
  }

  // آمار تفکیکی
  const majorCount = foundPairs.filter(p => p.interaction.severity === 'major').length;
  const modCount = foundPairs.filter(p => p.interaction.severity === 'moderate').length;
  const synCount = foundPairs.filter(p => p.interaction.severity === 'synergy').length;

  // وضعیت برچسب خلاصه
  if (summaryBadge) {
    summaryBadge.classList.remove('hidden', 'bg-rose-100', 'text-rose-900', 'border-rose-300', 'bg-amber-100', 'text-amber-900', 'border-amber-300', 'bg-emerald-100', 'text-emerald-900', 'border-emerald-300');
    if (majorCount > 0) {
      summaryBadge.className = 'text-[11px] font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300';
      summaryBadge.textContent = `🔴 ${majorCount} تداخل ماژور / خط قرمز شناسایی شد`;
    } else if (modCount > 0) {
      summaryBadge.className = 'text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300';
      summaryBadge.textContent = `🟡 ${modCount} تداخل متوسط نیازمند پایش بالینی`;
    } else if (synCount > 0) {
      summaryBadge.className = 'text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300';
      summaryBadge.textContent = `🟢 ${synCount} ترکیب استاندارد هم‌افزا (سینرژیک)`;
    } else {
      summaryBadge.className = 'text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300';
      summaryBadge.textContent = `✅ بدون تداخل منفی شناخته‌شده`;
    }
  }

  if (foundPairs.length === 0) {
    resContainer.innerHTML = `
      <div class="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs space-y-2">
        <div class="flex items-center gap-2 font-bold text-emerald-950">
          <i data-lucide="check-circle-2" class="w-5 h-5 text-emerald-600 shrink-0"></i>
          <span>هیچ تداخل شناخته‌شده ماژور، منفی یا بحرانی بین این ${checkedBoxes.length} دارو در پایگاه داده پلامبز ثبت نشده است.</span>
        </div>
        <p class="text-[11px] text-emerald-800 leading-relaxed pr-7">
          این داروها بر اساس مستندات بالینی تداخل منفی مستقیم ندارند. با این وجود، همواره وضعیت هیدراتاسیون، عملکرد کبد و کلیه بیمار را قبل از تجویز همزمان ارزیابی فرمایید.
        </p>
      </div>
    `;
  } else {
    // مرتب‌سازی نتایج: اول خط قرمزهای ماژور، سپس متوسط، سپس سینرژی مثبت
    foundPairs.sort((a, b) => {
      const order = { major: 1, moderate: 2, synergy: 3 };
      return (order[a.interaction.severity] || 99) - (order[b.interaction.severity] || 99);
    });

    resContainer.innerHTML = foundPairs.map(p => {
      const sev = p.interaction.severity;
      let cardStyle = '';
      let badgeHtml = '';

      if (sev === 'major') {
        cardStyle = 'bg-rose-50/90 border-rose-300 text-rose-950';
        badgeHtml = '<span class="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-600 text-white shadow-2xs">🔴 ماژور / خط قرمز (منع مصرف)</span>';
      } else if (sev === 'synergy') {
        cardStyle = 'bg-emerald-50/90 border-emerald-300 text-emerald-950';
        badgeHtml = '<span class="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">🟢 هم‌افزایی / پروتکل استاندارد</span>';
      } else {
        cardStyle = 'bg-amber-50/90 border-amber-300 text-amber-950';
        badgeHtml = '<span class="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-white shadow-2xs">🟡 متوسط / احتیاط و پایش</span>';
      }

      return `
        <div class="p-4 rounded-2xl border ${cardStyle} shadow-2xs space-y-2.5 transition hover:shadow-md">
          <div class="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-black/10">
            <div class="flex items-center gap-2">
              <span class="font-black text-xs text-slate-900">[${p.d1.generic_name_fa} (${p.d1.generic_name_en})]</span>
              <span class="text-slate-400 font-bold text-xs">+</span>
              <span class="font-black text-xs text-slate-900">[${p.d2.generic_name_fa} (${p.d2.generic_name_en})]</span>
            </div>
            ${badgeHtml}
          </div>

          ${p.interaction.title ? `
            <h5 class="text-xs font-black text-slate-900 leading-snug">
              ${p.interaction.title}
            </h5>
          ` : ''}

          <div class="text-[11px] space-y-1.5 leading-relaxed">
            <div class="bg-white/70 p-2.5 rounded-xl border border-black/5">
              <strong class="font-bold text-slate-800 block mb-0.5">🔬 مکانیسم فارماکولوژیک:</strong>
              <p class="text-slate-700">${p.interaction.mechanism}</p>
            </div>
            <div class="bg-white/70 p-2.5 rounded-xl border border-black/5">
              <strong class="font-bold text-slate-800 block mb-0.5">📋 توصیه بالینی و اقدام عملیاتی:</strong>
              <p class="text-slate-700">${p.interaction.clinical_effect}</p>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  if (window.lucide) lucide.createIcons();
}

// بخش اورژانس و CPR
function openCprModal() {
  document.getElementById('cprModal').classList.remove('hidden');
  runCprCalculation();
}
function closeCprModal() {
  document.getElementById('cprModal').classList.add('hidden');
  stopMetronome();
  stopCprCycle();
}

function runCprCalculation() {
  const weight = parseFloat(document.getElementById('cprWeight').value) || 10;
  const tbody = document.getElementById('cprTableBody');
  const revBody = document.getElementById('cprReversalTableBody');
  const defibLow = document.getElementById('cprDefibLow');
  const defibHigh = document.getElementById('cprDefibHigh');

  // ۱. محاسبه انرژی دفیبریلاتور (ژول)
  if (defibLow) defibLow.textContent = `${Math.round(weight * 2)} J`;
  if (defibHigh) defibHigh.textContent = `${Math.round(weight * 4)} J`;

  // ۲. جدول داروهای اصلی ایست قلبی (Arrest Drugs)
  if (tbody) {
    const arrestDrugs = [
      {
        name: "اپی‌نفرین دوز پایین (Epinephrine Low-Dose)",
        dose: "0.01 mg/kg",
        conc: "1 mg/mL (1:1000)",
        vol: (weight * 0.01).toFixed(2),
        route: "IV / IO (هر ۳ تا ۵ دقیقه - چرخه ۱ و ۳)"
      },
      {
        name: "اپی‌نفرین دوز بالا (Epinephrine High-Dose)",
        dose: "0.1 mg/kg",
        conc: "1 mg/mL (1:1000)",
        vol: (weight * 0.1).toFixed(2),
        route: "IV / IO (فقط پس از چرخه ۲ در عدم پاسخ)"
      },
      {
        name: "وازوپرسین (Vasopressin)",
        dose: "0.8 U/kg",
        conc: "20 U/mL",
        vol: (weight * 0.04).toFixed(2),
        route: "IV / IO (جایگزین اپی‌نفرین در اسیدوز)"
      },
      {
        name: "آتروپین ۰.۱٪ (Atropine Sulfate)",
        dose: "0.04 mg/kg",
        conc: "1 mg/mL",
        vol: (weight * 0.04).toFixed(2),
        route: "IV / IO (آسیستول و برادی‌کاردی با تون واگ)"
      },
      {
        name: "لیدوکائین ۲٪ بدون اپی‌نفرین (Lidocaine 2%)",
        dose: "سگ: 2 mg/kg | گربه: 0.2-0.5 mg/kg",
        conc: "20 mg/mL (2%)",
        vol: (weight * 0.1).toFixed(2),
        route: "IV آهسته (فیبریلاسیون بطنی و VTach بدون نبض)"
      },
      {
        name: "آمیودارون (Amiodarone)",
        dose: "5 mg/kg",
        conc: "50 mg/mL",
        vol: (weight * 0.1).toFixed(2),
        route: "IV رقیق‌شده (VF / pVT مقاوم به شوک)"
      },
      {
        name: "کلسیم گلوکونات ۱۰٪ (Calcium Gluconate 10%)",
        dose: "0.5 - 1.0 mL/kg",
        conc: "100 mg/mL (10%)",
        vol: (weight * 0.5).toFixed(1) + " الی " + (weight * 1.0).toFixed(1),
        route: "IV آهسته (هیپرکالمی و هیپوکلسمی)"
      },
      {
        name: "سدیم بی‌کربنات ۸.۴٪ (Sodium Bicarbonate)",
        dose: "1 mEq/kg",
        conc: "1 mEq/mL (8.4%)",
        vol: (weight * 1.0).toFixed(1),
        route: "IV آهسته (ایست طولانی > ۱۰ دقیقه و اسیدوز شدید)"
      }
    ];

    tbody.innerHTML = arrestDrugs.map(d => `
      <tr class="hover:bg-slate-800/60 transition">
        <td class="p-2.5">
          <span class="font-bold text-slate-100 block">${d.name}</span>
        </td>
        <td class="p-2.5 text-slate-300 font-mono text-[11px]">${d.dose}</td>
        <td class="p-2.5 text-slate-400 font-mono text-[11px]">${d.conc}</td>
        <td class="p-2.5 text-center font-mono font-black text-rose-400 text-sm bg-rose-950/20">
          ${d.vol} mL
        </td>
        <td class="p-2.5 text-slate-300 text-[11px]">${d.route}</td>
      </tr>
    `).join('');
  }

  // ۳. جدول پادزهرها (Reversal Agents)
  if (revBody) {
    const reversalDrugs = [
      {
        name: "نالوکسان (Naloxone)",
        target: "اپیوئیدها (مورفین، فنتانیل، متادون، بوپره‌نورفین)",
        conc: "0.4 mg/mL",
        vol: ((weight * 0.04) / 0.4).toFixed(2),
        route: "IV / IO / IM (دوز: 0.04 mg/kg)"
      },
      {
        name: "آتیپامزول (Antisedan)",
        target: "آلفا-۲ آگونیست‌ها (دکسمدتومیدین، زایلازین)",
        conc: "5 mg/mL",
        vol: (weight * 0.05).toFixed(2),
        route: "IM / IV (معادل حجم داروی آلفا-۲ مصرفی)"
      },
      {
        name: "فلومازنیل (Flumazenil)",
        target: "بنزودیازپین‌ها (دیازپام، میدازولام)",
        conc: "0.1 mg/mL",
        vol: ((weight * 0.02) / 0.1).toFixed(2),
        route: "IV (دوز: 0.02 mg/kg)"
      }
    ];

    revBody.innerHTML = reversalDrugs.map(r => `
      <tr class="hover:bg-slate-800/60 transition">
        <td class="p-2.5">
          <span class="font-bold text-emerald-300 block">${r.name}</span>
        </td>
        <td class="p-2.5 text-slate-300 text-[11px]">${r.target}</td>
        <td class="p-2.5 text-slate-400 font-mono text-[11px]">${r.conc}</td>
        <td class="p-2.5 text-center font-mono font-black text-emerald-400 text-sm bg-emerald-950/20">
          ${r.vol} mL
        </td>
        <td class="p-2.5 text-slate-300 text-[11px]">${r.route}</td>
      </tr>
    `).join('');
  }
}

// مترونوم صوتی ۱۱۰ BPM با Web Audio API (تولید صدای بوق کلیکی)
function toggleMetronome() {
  if (isMetronomePlaying) {
    stopMetronome();
  } else {
    startMetronome();
  }
}

function startMetronome() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  isMetronomePlaying = true;
  document.getElementById('metroBtn').classList.replace('bg-rose-600', 'bg-rose-800');
  document.getElementById('metroText').textContent = 'توقف مترونوم';

  const bpm = 110;
  const intervalMs = (60 / bpm) * 1000;

  playClickSound();
  metronomeInterval = setInterval(() => {
    playClickSound();
  }, intervalMs);
}

function stopMetronome() {
  isMetronomePlaying = false;
  if (metronomeInterval) clearInterval(metronomeInterval);
  const btn = document.getElementById('metroBtn');
  if (btn) btn.classList.replace('bg-rose-800', 'bg-rose-600');
  const txt = document.getElementById('metroText');
  if (txt) txt.textContent = 'شروع مترونوم ۱۱۰ BPM';
}

function playClickSound() {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(880, audioCtx.currentTime); // نت لا برای کلیک واضح
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.08);
}

// تایمر چرخه ۲ دقیقه‌ای ماساژ قلبی
function toggleCprCycle() {
  if (isCprTimerRunning) {
    stopCprCycle();
  } else {
    startCprCycle();
  }
}

function startCprCycle() {
  isCprTimerRunning = true;
  cprSecondsLeft = 120;
  document.getElementById('cprCycleBtn').textContent = 'توقف چرخه';
  document.getElementById('cprCycleBtn').classList.replace('bg-emerald-600', 'bg-slate-700');

  updateCprTimerDisplay();
  cprTimerInterval = setInterval(() => {
    cprSecondsLeft--;
    updateCprTimerDisplay();

    if (cprSecondsLeft <= 0) {
      stopCprCycle();
      alert("⚠️ پایان چرخه ۲ دقیقه‌ای احیا! تعویض ماساژور و بررسی ریتم نوار قلب.");
    }
  }, 1000);
}

function stopCprCycle() {
  isCprTimerRunning = false;
  if (cprTimerInterval) clearInterval(cprTimerInterval);
  const btn = document.getElementById('cprCycleBtn');
  if (btn) {
    btn.textContent = 'شروع تایمر چرخه';
    btn.classList.replace('bg-slate-700', 'bg-emerald-600');
  }
  cprSecondsLeft = 120;
  updateCprTimerDisplay();
}

function updateCprTimerDisplay() {
  const mins = Math.floor(cprSecondsLeft / 60);
  const secs = cprSecondsLeft % 60;
  const display = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const el = document.getElementById('cprTimerDisplay');
  if (el) el.textContent = display;
}

// ==============================================
// بخش ماتریس ترکیب‌های هم‌افزا و کوکتل‌های دارویی (Clinical Cocktails)
// ==============================================

let activeCocktailsFilter = 'all';

const CLINICAL_COCKTAILS_DATA = [
  {
    id: "etomidate_fentanyl",
    title: "نورولپت‌آنالژزی اتومیدات + فنتانیل",
    subtitle: "ایمن‌ترین القای بیهوشی در سگ و گربه مبتلا به بیماری شدید قلبی (DCM/HCM) و شوک",
    category: "fentanyl",
    species: ["canine","feline"],
    species_label: "🐶 سگ و 🐱 گربه",
    tags: [],
    drug_ids: ["etomidate","fentanyl"],
    mixing_in_syringe: "✅ تجویز متوالی وریدی (فنتانیل ابتدا و سپس اتومیدات آهسته)",
    mix_status: "compatible",
    drug1: {
      id: "etomidate",
      name: "اتومیدات ۲ mg/mL (Etomidate)",
      calc: (w) => (w * 0.25).toFixed(2),
      rule: "0.5 - 1.0 mg/kg IV (0.25 - 0.5 cc/kg)"
    },
    drug2: {
      id: "fentanyl",
      name: "فنتانیل ۵۰ mcg/mL (Fentanyl)",
      calc: (w) => (w * 0.1).toFixed(2),
      rule: "5 mcg/kg IV (0.1 cc/kg)"
    },
    drugs: [
      { id: "etomidate", name: "اتومیدات ۲ mg/mL (Etomidate)", calc: (w) => (w * 0.25).toFixed(2), rule: "0.5 - 1.0 mg/kg IV (0.25 - 0.5 cc/kg)" },
      { id: "fentanyl", name: "فنتانیل ۵۰ mcg/mL (Fentanyl)", calc: (w) => (w * 0.1).toFixed(2), rule: "5 mcg/kg IV (0.1 cc/kg)" }
    ],
    totalSyringeVol: (w) => (w * 0.35).toFixed(2),
    ratio_guide: "فنتانیل ابتدا وریدی تزریق می‌شود تا نیاز به دوز اتومیدات تا ۵۰٪ کاهش یابد و از پرش‌های عضلانی میوکلونوس پیشگیری گردد، سپس اتومیدات آهسته طی ۳۰ تا ۶۰ ثانیه تزریق می‌شود.",
    benefits: ["ثبات مطلق ریتم، فشار خون و برون‌ده قلبی بدون ایجاد دپرسیون میوکارد","القای بسیار ملایم و سریع بیهوشی بدون ایجاد افت بارز فشار خون","انتخاب اول در بیماران با تروما، شوک هموراژیک و بیماران مسن نارسایی احتقانی قلب"],
    warnings: "سرکوب موقت کورتیکواستروئیدی آدرنال طی ۲ تا ۶ ساعت پس از تزریق؛ در کریز آدیسونی تجویز نشود.",
  },
  {
    id: "detomidine_butorphanol",
    title: "سداسیون عمیق ایستاده اسب (Det-Torph Protocol)",
    subtitle: "استاندارد طلایی جراحی‌های سرپایی، دندانپزشکی، آندوسکوپی و تسکین کولیک اسب",
    category: "xylazine",
    species: ["equine"],
    species_label: "🐎 اسب (Equine)",
    tags: ["اسب ایستاده","دندانپزشکی","کولیک","جراحی سرپایی"],
    drug_ids: ["detomidine","butorphanol"],
    mixing_in_syringe: "✅ کاملاً سازگار در یک سرنگ مشترک",
    mix_status: "compatible",
    drugs: [
      {
        id: "detomidine",
        name: "دتومیدین ۱۰ mg/mL دامی (Dormosedan)",
        calc: (w) => (w * 0.0012).toFixed(3),
        rule: "10 - 20 mcg/kg IV (0.001 - 0.002 cc/kg)"
      },
      {
        id: "butorphanol",
        name: "بوتورفانول ۱۰ mg/mL دامی (Torbugesic)",
        calc: (w) => (w * 0.0025).toFixed(3),
        rule: "20 - 40 mcg/kg IV (0.002 - 0.004 cc/kg)"
      },
    ],
    drug1: {
      id: "detomidine",
      name: "دتومیدین ۱۰ mg/mL دامی (Dormosedan)",
      calc: (w) => (w * 0.0012).toFixed(3),
      rule: "10 - 20 mcg/kg IV (0.001 - 0.002 cc/kg)"
    },
    drug2: {
      id: "butorphanol",
      name: "بوتورفانول ۱۰ mg/mL دامی (Torbugesic)",
      calc: (w) => (w * 0.0025).toFixed(3),
      rule: "20 - 40 mcg/kg IV (0.002 - 0.004 cc/kg)"
    },
    totalSyringeVol: (w) => (w * 0.0037).toFixed(3),
    ratio_guide: "برای اسب ۵۰۰ کیلوگرمی: ۰.۶ سی‌سی دتومیدین ۱۰ mg/mL (۶ میلی‌گرم) + ۱.۲۵ سی‌سی بوتورفانول ۱۰ mg/mL (۱۲.۵ میلی‌گرم) در یک سرنگ ۵ سی‌سی کشیده و وریدی تزریق می‌شود.",
    benefits: ["سداسیون عمیق ایستاده با حفظ تعادل پاها و ثبات ۴ دست و پا بدون به زمین افتادن اسب","بی‌دردی احشایی فوق‌العاده قوی و طولانی (ایده‌آل برای معاینه رکتال کولیک‌های شدید)","مهار کامل واکنش‌های لگد زدن و دفاعی اسب در جراحی‌های اندام خلفی"],
    warnings: "برادی‌کاردی و بلوک قلبی درجه ۲ شایع است؛ از تجویز همزمان با تری‌متوپریم-سولفانامیدها خودداری شود.",
  },
  {
    id: "glyco_neostigmine",
    title: "ریورسال بلوک عضلانی (گلیکوپیرولات + نئوستیگمین)",
    subtitle: "برگشت سریع فلج عضلانی پس از جراحی‌های قفسه سینه، فتق دیافراگم و چشم",
    category: "atropine",
    species: ["canine","feline"],
    species_label: "🐶 سگ و 🐱 گربه",
    tags: [],
    drug_ids: ["glycopyrrolate","neostigmine"],
    mixing_in_syringe: "✅ کاملاً سازگار در یک سرنگ مشترک",
    mix_status: "compatible",
    drug1: {
      id: "glycopyrrolate",
      name: "گلیکوپیرولات ۰.۲ mg/mL (Robinul)",
      calc: (w) => (w * 0.05).toFixed(2),
      rule: "0.01 mg/kg IV (0.05 cc/kg)"
    },
    drug2: {
      id: "neostigmine",
      name: "نئوستیگمین ۰.۵ mg/mL (Neostigmine)",
      calc: (w) => (w * 0.08).toFixed(2),
      rule: "0.04 mg/kg IV (0.08 cc/kg)"
    },
    drugs: [
      { id: "glycopyrrolate", name: "گلیکوپیرولات ۰.۲ mg/mL (Robinul)", calc: (w) => (w * 0.05).toFixed(2), rule: "0.01 mg/kg IV (0.05 cc/kg)" },
      { id: "neostigmine", name: "نئوستیگمین ۰.۵ mg/mL (Neostigmine)", calc: (w) => (w * 0.08).toFixed(2), rule: "0.04 mg/kg IV (0.08 cc/kg)" }
    ],
    totalSyringeVol: (w) => (w * 0.13).toFixed(2),
    ratio_guide: "نسبت اختلاط: به ازای هر ۱ میلی‌گرم نئوستیگمین، ۰.۲ تا ۰.۲۵ میلی‌گرم گلیکوپیرولات در سرنگ کشیده شده و آهسته وریدی تزریق می‌شود.",
    benefits: ["مهار کامل برادی‌کاردی شدید موسکارینی ناشی از نئوستیگمین توسط گلیکوپیرولات","عدم عبور گلیکوپیرولات از سد خونی-مغزی و جلوگیری از بی‌قراری، دیسفوری یا تاکی‌کاردی ناشی از آتروپین","بازگشت کامل تنفس خودبخودی و تونوس عضلانی ظرف ۲ تا ۵ دقیقه"],
    warnings: "پیش از تزریق ریورسال، تهویه دستی و اکسیژن‌رسانی باید ادامه یابد تا هیپوکسی برطرف شود.",
  },
  {
    id: "ket_xyl",
    title: "ترکیب طلایی کت-زایل (Ket-Xyl)",
    subtitle: "رایج‌ترین کوکتل بیهوشی جراحی در سگ، گربه، اسب و نشخوارکننده",
    category: "ketamine",
    species: ["canine","feline"],
    species_label: "🐶 سگ و 🐱 گربه",
    tags: [],
    drug_ids: ["ketamine","xylazine"],
    mixing_in_syringe: "✅ کاملاً سازگار (قابل اختلاط در یک سرنگ)",
    mix_status: "compatible",
    drug1: {
      id: "ketamine",
      name: "کتامین ۱۰٪ دامی (Ketamine 100 mg/mL)",
      calc: (w) => (w * 0.08).toFixed(2),
      rule: "0.08 cc/kg"
    },
    drug2: {
      id: "xylazine",
      name: "زایلازین ۲٪ دامی (Xylazine 20 mg/mL)",
      calc: (w) => (w * 0.04).toFixed(2),
      rule: "0.04 cc/kg"
    },
    drugs: [
      { id: "ketamine", name: "کتامین ۱۰٪ دامی (Ketamine 100 mg/mL)", calc: (w) => (w * 0.08).toFixed(2), rule: "0.08 cc/kg" },
      { id: "xylazine", name: "زایلازین ۲٪ دامی (Xylazine 20 mg/mL)", calc: (w) => (w * 0.04).toFixed(2), rule: "0.04 cc/kg" }
    ],
    totalSyringeVol: (w) => (w * 0.12).toFixed(2),
    ratio_guide: "نسبت ۲ به ۱ حجمی کتامین به زایلازین. مثلاً برای بیمار ۱۰ کیلوگرم: ۰.۸ سی‌سی کتامین ۱۰٪ + ۰.۴ سی‌سی زایلازین ۲٪ در یک سرنگ مشترک کشیده و عضلانی یا وریدی تزریق می‌شود.",
    benefits: ["شل‌شدن کامل عضلات و رفع کامل کاتالپسی و سفتی ناشی از کتامین توسط زایلازین","بیهوشی جراحی ۲۰ الی ۳۰ دقیقه‌ای بدون نیاز به لوله‌گذاری برای عقیم‌سازی، ارتوپدی و جراحی‌های سرپایی","امکان برگشت سریع با آنتی‌دوت اختصاصی زایلازین (آتیپامزول / یوهیمبین) در صورت بروز عوارض"],
    warnings: "برادی‌کاردی و آریتمی قلبی؛ در بیماران قلبی، دهیدراته و گربه‌های با انسداد مجاری ادراری با احتیاط مصرف شود.",
  },
  {
    id: "ket_val",
    title: "پروتکل ایمن قلبی کت-وال (Ket-Val)",
    subtitle: "بیهوشی با حفظ حداکثری ثبات قلبی-عروقی برای بیماران بدحال، شوک و مسن",
    category: "ketamine",
    species: ["canine","feline"],
    species_label: "🐶 سگ و 🐱 گربه",
    tags: [],
    drug_ids: ["ketamine","diazepam"],
    mixing_in_syringe: "✅ پایدار بلافاصله قبل از تزریق در یک سرنگ",
    mix_status: "compatible",
    drug1: {
      id: "ketamine",
      name: "کتامین ۱۰٪ دامی (Ketamine 100 mg/mL)",
      calc: (w) => (w * 0.05).toFixed(2),
      rule: "0.05 cc/kg وریدی آهسته"
    },
    drug2: {
      id: "diazepam",
      name: "دیازپام ۵ mg/mL (یا میدازولام)",
      calc: (w) => (w * 0.05).toFixed(2),
      rule: "0.05 cc/kg وریدی آهسته"
    },
    drugs: [
      { id: "ketamine", name: "کتامین ۱۰٪ دامی (Ketamine 100 mg/mL)", calc: (w) => (w * 0.05).toFixed(2), rule: "0.05 cc/kg وریدی آهسته" },
      { id: "diazepam", name: "دیازپام ۵ mg/mL (یا میدازولام)", calc: (w) => (w * 0.05).toFixed(2), rule: "0.05 cc/kg وریدی آهسته" }
    ],
    totalSyringeVol: (w) => (w * 0.10).toFixed(2),
    ratio_guide: "نسبت مساوی ۱ به ۱ حجمی: برای سگ ۱۰ کیلوگرم = ۰.۵ سی‌سی کتامین ۱۰٪ + ۰.۵ سی‌سی دیازپام ۵ mg/ml در یک سرنگ مشترک به صورت وریدی آهسته طی ۶۰ ثانیه.",
    benefits: ["بالاترین ایمنی قلبی-عروقی (حفظ فشار خون و ضربان قلب بدون افت شدید)","ایده‌آل برای بیماران بدحال، تصادفی، مبتلا به شوک سپسیس و سگ‌های پیر","القا فوق‌العاده نرم بیهوشی و خاصیت ضدتشنجی قوی بنزودیازپین"],
    warnings: "بی‌دردی احشایی کمتر از زایلازین؛ فقط وریدی آهسته تزریق شود.",
  },
  {
    id: "ket_ace",
    title: "پروتکل آرام‌بخش پیش از بیهوشی (Ket-Ace)",
    subtitle: "ترکیب ریلکس‌کننده عضلانی بدون هیجان برای رادیولوژی، سونوگرافی و پانسمان",
    category: "ketamine",
    species: ["canine","feline"],
    species_label: "🐶 سگ و 🐱 گربه",
    tags: [],
    drug_ids: ["ketamine","acepromazine"],
    mixing_in_syringe: "✅ کاملاً سازگار در یک سرنگ",
    mix_status: "compatible",
    drug1: {
      id: "ketamine",
      name: "کتامین ۱۰٪ دامی (Ketamine 100 mg/mL)",
      calc: (w) => (w * 0.05).toFixed(2),
      rule: "0.05 cc/kg عضلانی"
    },
    drug2: {
      id: "acepromazine",
      name: "آسه‌پرومازین ۱٪ دامی (Acepromazine 10 mg/mL)",
      calc: (w) => (w * 0.005).toFixed(3),
      rule: "0.005 cc/kg عضلانی"
    },
    drugs: [
      { id: "ketamine", name: "کتامین ۱۰٪ دامی (Ketamine 100 mg/mL)", calc: (w) => (w * 0.05).toFixed(2), rule: "0.05 cc/kg عضلانی" },
      { id: "acepromazine", name: "آسه‌پرومازین ۱٪ دامی (Acepromazine 10 mg/mL)", calc: (w) => (w * 0.005).toFixed(3), rule: "0.005 cc/kg عضلانی" }
    ],
    totalSyringeVol: (w) => (w * 0.055).toFixed(2),
    ratio_guide: "به ازای هر ۱۰ کیلو سگ: ۰.۵ سی‌سی کتامین ۱۰٪ + ۰.۰۵ سی‌سی آسه‌پرومازین ۱٪ در یک سرنگ عضلانی.",
    benefits: ["ریکاوری آرام بدون هذیان و لرزش بعد از کتامین","شل‌شدن مطلوب عضلات در رادیوگرافی، سونوگرافی و پانسمان زخم‌های عمیق","عدم ایجاد افت تنفسی شدید"],
    warnings: "افت فشار خون؛ در بیماران دهیدراته، شوک هیپوولمیک و نژاد باکسر ممنوع است.",
  },
  {
    id: "kitty_magic",
    title: "کوکتل بیهوشی جادویی گربه (Kitty Magic)",
    subtitle: "پروتکل اختصاصی و سریع برای مهار گربه‌های پرخاشگر و جراحی‌های کوتاه",
    category: "ketamine",
    species: ["feline"],
    species_label: "🐱 گربه (Feline)",
    tags: [],
    drug_ids: ["ketamine","xylazine"],
    mixing_in_syringe: "✅ کاملاً سازگار در یک سرنگ",
    mix_status: "compatible",
    drug1: {
      id: "ketamine",
      name: "کتامین ۱۰٪ دامی",
      calc: (w) => (w * 0.05).toFixed(2),
      rule: "0.05 cc/kg عضلانی"
    },
    drug2: {
      id: "xylazine",
      name: "زایلازین ۲٪ دامی",
      calc: (w) => (w * 0.025).toFixed(2),
      rule: "0.025 cc/kg عضلانی"
    },
    drugs: [
      { id: "ketamine", name: "کتامین ۱۰٪ دامی", calc: (w) => (w * 0.05).toFixed(2), rule: "0.05 cc/kg عضلانی" },
      { id: "xylazine", name: "زایلازین ۲٪ دامی", calc: (w) => (w * 0.025).toFixed(2), rule: "0.025 cc/kg عضلانی" }
    ],
    totalSyringeVol: (w) => (w * 0.075).toFixed(2),
    ratio_guide: "برای گربه ۳ تا ۴ کیلویی: ۰.۱۵ تا ۰.۲ سی‌سی کتامین ۱۰٪ + ۰.۰۸ تا ۰.۱ سی‌سی زایلازین ۲٪ در یک سرنگ انسولین عضلانی.",
    benefits: ["بیهوشی کامل ظرف ۳ دقیقه پس از تزریق عضلانی بدون استرس و چنگ زدن گربه","بی‌دردی عالی و شل‌شدن ایده‌آل عضلات","امکان برگشت اثر زایلازین با آتیپامزول (0.1 cc به ازای هر گربه)"],
    warnings: "افت دمای بدن (هیپوترمی) و برادی‌کاردی؛ گربه روی پد گرمایش نگهداری شود.",
  },
  {
    id: "melo_gaba",
    title: "کنترل درد چندوجهی (Multimodal Analgesia)",
    subtitle: "ترکیب ضدالتهاب محیطی با مسکن نوروپاتیک مرکزی برای آرتروز و بعد عمل",
    category: "analgesia",
    species: ["canine","feline"],
    species_label: "🐶 سگ و 🐱 گربه",
    tags: [],
    drug_ids: ["meloxicam","gabapentin"],
    mixing_in_syringe: "⚠️ ملوکسیکام تزریقی/خوراکی و گاباپنتین خوراکی جداگانه",
    mix_status: "separate",
    drug1: {
      id: "meloxicam",
      name: "ملوکسیکام دامی (ویال ۵ mg/mL یا شربت)",
      calc: (w) => (w * 0.04).toFixed(2),
      rule: "0.04 cc/kg روزی یک‌بار"
    },
    drug2: {
      id: "gabapentin",
      name: "گاباپنتین خوراکی (شربت ۱۰ mg/mL حل‌شده)",
      calc: (w) => (w * 1.0).toFixed(1),
      rule: "1 cc/kg (معادل 10 mg/kg) هر ۱۲ ساعت"
    },
    drugs: [
      { id: "meloxicam", name: "ملوکسیکام دامی (ویال ۵ mg/mL یا شربت)", calc: (w) => (w * 0.04).toFixed(2), rule: "0.04 cc/kg روزی یک‌بار" },
      { id: "gabapentin", name: "گاباپنتین خوراکی (شربت ۱۰ mg/mL حل‌شده)", calc: (w) => (w * 1.0).toFixed(1), rule: "1 cc/kg (معادل 10 mg/kg) هر ۱۲ ساعت" }
    ],
    totalSyringeVol: () => "جداگانه",
    ratio_guide: "ملوکسیکام 0.04 cc/kg زیرجلدی یا خوراکی روزی ۱ بار + گاباپنتین 1 cc/kg خوراکی هر ۱۲ ساعت.",
    benefits: ["مهار همزمان مسیرهای التهاب محیطی (COX-2) و تحریک اعصاب حسی شاخ خلفی نخاع","امکان کاهش دوز NSAID و پیشگیری از عوارض کلیوی و گوارشی در مصرف طولانی","بهبود چشمگیر کیفیت خواب و کاهش ناله‌های شبانه در سگ‌های مبتلا به آرتروز"],
    warnings: "خواب‌آلودگی و لتارژی در روزهای اول درمان شایع است.",
  },
  {
    id: "melo_tram",
    title: "ترکیب مسکن مولتی‌مدال NSAID + Opioid",
    subtitle: "تسکین دردهای حاد و شدید استخوانی پس از شکستگی و جراحی بافت سخت",
    category: "analgesia",
    species: ["canine","feline"],
    species_label: "🐶 سگ و 🐱 گربه",
    tags: [],
    drug_ids: ["meloxicam","tramadol"],
    mixing_in_syringe: "⚠️ در دو سرنگ مجزا تزریق شود",
    mix_status: "separate",
    drug1: {
      id: "meloxicam",
      name: "ملوکسیکام ۵ mg/mL دامی",
      calc: (w) => (w * 0.04).toFixed(2),
      rule: "0.2 mg/kg روز اول"
    },
    drug2: {
      id: "tramadol",
      name: "ترامادول ۵۰ mg/mL تزریقی/خوراکی",
      calc: (w) => (w * 0.06).toFixed(2),
      rule: "3 mg/kg هر ۸ تا ۱۲ ساعت"
    },
    drugs: [
      { id: "meloxicam", name: "ملوکسیکام ۵ mg/mL دامی", calc: (w) => (w * 0.04).toFixed(2), rule: "0.2 mg/kg روز اول" },
      { id: "tramadol", name: "ترامادول ۵۰ mg/mL تزریقی/خوراکی", calc: (w) => (w * 0.06).toFixed(2), rule: "3 mg/kg هر ۸ تا ۱۲ ساعت" }
    ],
    totalSyringeVol: () => "جداگانه",
    ratio_guide: "ملوکسیکام 0.04 cc/kg تزریقی + ترامادول 0.06 cc/kg هر ۸ تا ۱۲ ساعت عضلانی یا خوراکی.",
    benefits: ["هم‌افزایی قدرتمند مهار پروستاگلاندین‌ها و مهار گیرنده‌های اوپیوئیدی مرکزی","کنترل دردهای گزنده پس از کشیدن دندان، جراحی استخوان و سوانح تصادفی"],
    warnings: "پایش سلامت کلیه و کبد؛ در شوک یا دهیدراتاسیون شدید با احتیاط مصرف شود.",
  },
  {
    id: "gaba_tram",
    title: "کوکتل ضددرد پیشرفته دیسک و اعصاب (IVDD)",
    subtitle: "مهار دردهای انتشاری و گزگز شدید فتق دیسک بین‌مهره‌ای ستون فقرات",
    category: "analgesia",
    species: ["canine","feline"],
    species_label: "🐶 سگ و 🐱 گربه",
    tags: [],
    drug_ids: ["gabapentin","tramadol"],
    mixing_in_syringe: "✅ هر دو خوراکی همراه غذا",
    mix_status: "compatible",
    drug1: {
      id: "gabapentin",
      name: "گاباپنتین (شربت ۱۰ mg/mL)",
      calc: (w) => (w * 1.0).toFixed(1),
      rule: "10 mg/kg هر ۱۲ ساعت"
    },
    drug2: {
      id: "tramadol",
      name: "ترامادول ۵۰ mg خوراکی",
      calc: (w) => (w * 0.06).toFixed(2),
      rule: "3 mg/kg هر ۱۲ ساعت"
    },
    drugs: [
      { id: "gabapentin", name: "گاباپنتین (شربت ۱۰ mg/mL)", calc: (w) => (w * 1.0).toFixed(1), rule: "10 mg/kg هر ۱۲ ساعت" },
      { id: "tramadol", name: "ترامادول ۵۰ mg خوراکی", calc: (w) => (w * 0.06).toFixed(2), rule: "3 mg/kg هر ۱۲ ساعت" }
    ],
    totalSyringeVol: () => "همراه غذا",
    ratio_guide: "گاباپنتین ۱۰ mg/kg + ترامادول ۳ mg/kg هر ۱۲ ساعت خوراکی همراه با غذای چرب.",
    benefits: ["قطع زنجیره دردهای تیرکشنده عصبی و کاهش اسپاسم عضلات اطراف مهره‌ها","آرام‌بخشی نسبی برای تحمیل استراحت در قفس (Cage Rest) در بیماران دیسک"],
    warnings: "ایجاد آتاکسی خفیف در اندام‌های خلفی؛ عدم پرش و پریدن از پله‌ها الزامی است.",
  },
  {
    id: "enro_clavamox",
    title: "ترکیب آنتی‌بیوتیکی سپسیس و پریتونیت",
    subtitle: "پوشش فوق‌وسیع باکتریسیدی گرم‌مثبت، گرم‌منفی مقاوم و بی‌هوازی‌ها",
    category: "antibiotics",
    species: ["canine","feline"],
    species_label: "🐶 سگ و 🐱 گربه",
    tags: [],
    drug_ids: ["enrofloxacin","amoxicillin_clavulanate"],
    mixing_in_syringe: "⚠️ در دو محل جداگانه تجویز شود",
    mix_status: "separate",
    drug1: {
      id: "enrofloxacin",
      name: "انروفلوکساسین ۵٪ دامی",
      calc: (w) => (w * 0.1).toFixed(2),
      rule: "5 mg/kg روزی یک‌بار"
    },
    drug2: {
      id: "amoxicillin_clavulanate",
      name: "کوآموکسی‌کلاو (شربت ۱۵۶ انسانی)",
      calc: (w) => (w * 0.4).toFixed(1),
      rule: "12.5 mg/kg هر ۱۲ ساعت"
    },
    drugs: [
      { id: "enrofloxacin", name: "انروفلوکساسین ۵٪ دامی", calc: (w) => (w * 0.1).toFixed(2), rule: "5 mg/kg روزی یک‌بار" },
      { id: "amoxicillin_clavulanate", name: "کوآموکسی‌کلاو (شربت ۱۵۶ انسانی)", calc: (w) => (w * 0.4).toFixed(1), rule: "12.5 mg/kg هر ۱۲ ساعت" }
    ],
    totalSyringeVol: () => "جداگانه",
    ratio_guide: "انروفلوکساسین 0.1 cc/kg تزریقی + کوآموکسی‌کلاو 0.4 cc/kg خوراکی یا آمپی‌سیلین تزریقی.",
    benefits: ["پوشش همزمان باکتری‌های بی‌هوازی (توسط کلاواموکس) و سودوموناس/گرم‌منفی‌ها (توسط انرو)","درمان نجات‌بخش در سپسیس حاد، پارگی روده، پیومتر پاره‌شده و پنومونی آسپیراسیون"],
    warnings: "در گربه دوز انروفلوکساسین نباید بیش از 0.1 cc/kg باشد (خطر کوری).",
  },
  {
    id: "dexa_antihist",
    title: "پروتکل اورژانس کهیر حاد و آنافیلاکسی",
    subtitle: "کنترل سریع و پایدار شوک آلرژیک، گزیدگی حشرات و واکنش دارویی",
    category: "emergency",
    species: ["canine","feline"],
    species_label: "🐶 سگ و 🐱 گربه",
    tags: [],
    drug_ids: ["dexamethasone"],
    mixing_in_syringe: "⚠️ در دو سرنگ جداگانه تزریق شود",
    mix_status: "separate",
    drug1: {
      id: "dexamethasone",
      name: "دگزامتازون ۲ mg/mL دامی",
      calc: (w) => (w * 0.05).toFixed(2),
      rule: "0.1 mg/kg وریدی/عضلانی"
    },
    drug2: {
      id: "antihistamine",
      name: "دیفن‌هیدرامین ۱۰ mg/mL انسانی",
      calc: (w) => (w * 0.1).toFixed(2),
      rule: "1-2 mg/kg عضلانی"
    },
    drugs: [
      { id: "dexamethasone", name: "دگزامتازون ۲ mg/mL دامی", calc: (w) => (w * 0.05).toFixed(2), rule: "0.1 mg/kg وریدی/عضلانی" },
      { id: "antihistamine", name: "دیفن‌هیدرامین ۱۰ mg/mL انسانی", calc: (w) => (w * 0.1).toFixed(2), rule: "1-2 mg/kg عضلانی" }
    ],
    totalSyringeVol: () => "جداگانه",
    ratio_guide: "دگزامتازون 0.05 cc/kg + دیفن‌هیدرامین 0.1 cc/kg به صورت عضلانی یا وریدی آهسته.",
    benefits: ["دیفن‌هیدرامین خارش و علائم حاد هیستامینی را ظرف ۱۰ دقیقه فرومی‌نشاند","دگزامتازون فاز تاخیری التهاب را برای ۲۴ تا ۴۸ ساعت سرکوب می‌کند"],
    warnings: "افت موقت ایمنی؛ همراه با NSAIDها مصرف نشود.",
  },
  {
    id: "tkx",
    title: "پروتکل بیهوشی فوق‌سریع TKX",
    subtitle: "تلازول + کتامین + زایلازین با حجم بسیار اندک برای بیهوشی گربه‌ها و سگ‌های وحشی",
    category: "ketamine",
    species: ["canine","feline"],
    species_label: "🐶 سگ و 🐱 گربه",
    tags: [],
    drug_ids: ["ketamine","xylazine"],
    mixing_in_syringe: "✅ کاملاً سازگار در یک سرنگ (میکروولوم)",
    mix_status: "compatible",
    drug1: {
      id: "ketamine",
      name: "کتامین ۱۰٪ دامی",
      calc: (w) => (w * 0.04).toFixed(2),
      rule: "0.04 cc/kg عضلانی"
    },
    drug2: {
      id: "xylazine",
      name: "زایلازین ۲٪ دامی",
      calc: (w) => (w * 0.02).toFixed(2),
      rule: "0.02 cc/kg عضلانی"
    },
    drugs: [
      { id: "ketamine", name: "کتامین ۱۰٪ دامی", calc: (w) => (w * 0.04).toFixed(2), rule: "0.04 cc/kg عضلانی" },
      { id: "xylazine", name: "زایلازین ۲٪ دامی", calc: (w) => (w * 0.02).toFixed(2), rule: "0.02 cc/kg عضلانی" }
    ],
    totalSyringeVol: (w) => (w * 0.06).toFixed(2),
    ratio_guide: "حجم بسیار اندک تزریق عضلانی (فقط ۰.۶ سی‌سی برای سگ ۱۰ کیلو و ۰.۱۸ سی‌سی برای گربه ۳ کیلو)، شروع بیهوشی جراحی ظرف ۲ تا ۳ دقیقه.",
    benefits: ["حجم تزریق بسیار کم، ایده‌آل برای حیوانات پرخاشگر که مهار طولانی آن‌ها خطرناک است","شل‌شدن کامل عضلانی و ضددرد بسیار قوی سوماتیک و احشایی","امکان برگشت بخش زیادی از اثر با آتیپامزول (Antisedan)"],
    warnings: "تضعیف تنفسی و قلبی؛ پایش مداوم اکسیژن و لوله‌گذاری تراشه توصیه می‌شود.",
  },
  {
    id: "triple_drip",
    title: "پروتکل بیهوشی وریدی اسب (Triple Drip / GKX)",
    subtitle: "بیهوشی داخل وریدی تام (TIVA) در شرایط صحرایی بدون نیاز به دستگاه بیهوشی استنشاقی",
    category: "ketamine",
    species: ["equine"],
    species_label: "🐎 اسب (Equine)",
    tags: [],
    drug_ids: ["ketamine","xylazine"],
    mixing_in_syringe: "✅ در سرم گوآیفنزین ۵٪ مخلوط و انفوزیون می‌شود",
    mix_status: "compatible",
    drug1: {
      id: "ketamine",
      name: "کتامین ۱۰٪ (۱۰ سی‌سی در سرم)",
      calc: (w) => (w * 2.0).toFixed(0) + " mL/hr",
      rule: "۱۰ سی‌سی (۱ گرم) در ۵۰۰ سی‌سی سرم"
    },
    drug2: {
      id: "xylazine",
      name: "زایلازین ۲٪ (۲۵ سی‌سی در سرم)",
      calc: (w) => (w * 2.0).toFixed(0) + " mL/hr",
      rule: "۲۵ سی‌سی (۵۰۰ میلی‌گرم) در ۵۰۰ سی‌سی سرم"
    },
    drugs: [
      { id: "ketamine", name: "کتامین ۱۰٪ (۱۰ سی‌سی در سرم)", calc: (w) => (w * 2.0).toFixed(0) + " mL/hr", rule: "۱۰ سی‌سی (۱ گرم) در ۵۰۰ سی‌سی سرم" },
      { id: "xylazine", name: "زایلازین ۲٪ (۲۵ سی‌سی در سرم)", calc: (w) => (w * 2.0).toFixed(0) + " mL/hr", rule: "۲۵ سی‌سی (۵۰۰ میلی‌گرم) در ۵۰۰ سی‌سی سرم" }
    ],
    totalSyringeVol: (w) => (w * 2.0).toFixed(0) + " mL/hr",
    ratio_guide: "در ۵۰۰ سی‌سی سرم گوآیفنزین ۵٪ دامی: ۱۰ سی‌سی کتامین ۱۰٪ + ۲۵ سی‌سی زایلازین ۲٪ اضافه شده و با سرعت ۱ تا ۲ سی‌سی بر کیلوگرم در ساعت وریدی انفوزیون می‌شود.",
    benefits: ["بیهوشی جراحی یکدست تا ۶۰ دقیقه در مزرعه و کلینیک‌های بدون دستگاه بیهوشی گاز","ریکاوری فوق‌العاده آرام، بدون هیجان و بدون آسیب به اندام‌های حرکتی اسب","حفظ مناسب فشار خون و ثبات قلبی-عروقی"],
    warnings: "انفوزیون نباید بیش از ۶۰ دقیقه ادامه یابد (خطر انباشتگی گوآیفنزین و فلج طولانی‌مدت عضلات).",
  },
  {
    id: "dex_torph",
    title: "آرام‌بخش عمیق و ضددرد دکس-تورف (Dex-Torph)",
    subtitle: "پروتکل ایمن ریداکشن دررفتگی، تصویربرداری و آندوسکوپی بدون بیهوشی کامل",
    category: "analgesia",
    species: ["canine","feline"],
    species_label: "🐶 سگ و 🐱 گربه",
    tags: [],
    drug_ids: ["xylazine","tramadol"],
    mixing_in_syringe: "✅ کاملاً سازگار در یک سرنگ",
    mix_status: "compatible",
    drug1: {
      id: "xylazine",
      name: "آلفا-۲ آگونیست (زایلازین یا دکسمدتومیدین)",
      calc: (w) => (w * 0.02).toFixed(2),
      rule: "سداسیون قوی"
    },
    drug2: {
      id: "tramadol",
      name: "بوترفانول / ترامادول تزریقی",
      calc: (w) => (w * 0.04).toFixed(2),
      rule: "تسکین درد احشایی"
    },
    drugs: [
      { id: "xylazine", name: "آلفا-۲ آگونیست (زایلازین یا دکسمدتومیدین)", calc: (w) => (w * 0.02).toFixed(2), rule: "سداسیون قوی" },
      { id: "tramadol", name: "بوترفانول / ترامادول تزریقی", calc: (w) => (w * 0.04).toFixed(2), rule: "تسکین درد احشایی" }
    ],
    totalSyringeVol: (w) => (w * 0.06).toFixed(2),
    ratio_guide: "تزریق عضلانی یا وریدی آهسته در یک سرنگ؛ شروع سداسیون عمیق ظرف ۳ تا ۵ دقیقه.",
    benefits: ["آرام‌بخشی بسیار عمیق همراه با بی‌دردی عالی بدون نیاز به بیهوشی کامل","قابلیت بازگشت ۱۰۰٪ اثرات خواب‌آلودگی توسط آتیپامزول (Antisedan)","کاهش استرس و مهار ضربان‌های عصبی در بیماران دردناک"],
    warnings: "برادی‌کاردی و تنگی عروقی؛ در نارسایی قلبی پیشرفته منع مصرف دارد.",
  },
  {
    id: "propo_mid",
    title: "القا آرام بیهوشی با حفظ تنفس (Propo-Mid Induction)",
    subtitle: "ترکیب پروپوفول و میدازولام برای لوله‌گذاری نرم بدون وقفه تنفسی حاد",
    category: "ketamine",
    species: ["canine","feline"],
    species_label: "🐶 سگ و 🐱 گربه",
    tags: [],
    drug_ids: ["diazepam"],
    mixing_in_syringe: "✅ تزریق متوالی در یک خط وریدی",
    mix_status: "compatible",
    drug1: {
      id: "propofol",
      name: "پروپوفول ۱٪ (Propofol 10 mg/mL)",
      calc: (w) => (w * 0.2).toFixed(1),
      rule: "2 mg/kg وریدی (نصف دوز معمولی)"
    },
    drug2: {
      id: "midazolam",
      name: "میدازولام ۵ mg/mL (Midazolam)",
      calc: (w) => (w * 0.04).toFixed(2),
      rule: "0.2 mg/kg وریدی"
    },
    drugs: [
      { id: "propofol", name: "پروپوفول ۱٪ (Propofol 10 mg/mL)", calc: (w) => (w * 0.2).toFixed(1), rule: "2 mg/kg وریدی (نصف دوز معمولی)" },
      { id: "midazolam", name: "میدازولام ۵ mg/mL (Midazolam)", calc: (w) => (w * 0.04).toFixed(2), rule: "0.2 mg/kg وریدی" }
    ],
    totalSyringeVol: (w) => (w * 0.24).toFixed(2),
    ratio_guide: "ابتدا میدازولام وریدی تزریق می‌شود، سپس پروپوفول با دوز نصف شده به آرامی تا شل شدن فک برای لوله‌گذاری تزریق می‌گردد.",
    benefits: ["کاهش ۵۰ درصدی دوز مورد نیاز پروپوفول و صرفه‌جویی دارویی","جلوگیری از آپنه حاد پس از القا (Post-induction Apnea)","ثبات فوق‌العاده فشار خون در بیماران پرخطر"],
    warnings: "پروپوفول فاقد ماده نگه‌دارنده است و باید ظرف ۶ ساعت پس از باز شدن ویال مصرف شود.",
  },
  {
    id: "kitty_magic_trio",
    title: "کوکتل بیهوشی جادویی سه‌گانه گربه (Kitty Magic - DKB)",
    subtitle: "استاندارد طلایی بیهوشی کوتاه، جراحی‌های عقیم‌سازی و آرام‌بخشی گربه‌های خشن و غیرقابل مقارد",
    category: "ketamine",
    species: ["feline"],
    species_label: "🐱 گربه (Feline)",
    tags: ["عقیم‌سازی","بیهوشی تزریقی","سداسیون عمیق","گربه تهاجمی"],
    drug_ids: ["ketamine","dexmedetomidine","butorphanol"],
    mixing_in_syringe: "✅ کاملاً سازگار در یک سرنگ انسولین مشترک",
    mix_status: "compatible",
    drugs: [
      {
        id: "dexmedetomidine",
        name: "دکسمدتومازین دامی (Dexdomitor 0.5 mg/mL)",
        calc: (w) => (w * 0.01).toFixed(2),
        rule: "5 - 10 mcg/kg IM (0.01 - 0.02 cc/kg)"
      },
      {
        id: "butorphanol",
        name: "بوتورفانول دامی (Torbugesic 10 mg/mL)",
        calc: (w) => (w * 0.02).toFixed(2),
        rule: "0.2 mg/kg IM (0.02 cc/kg)"
      },
      {
        id: "ketamine",
        name: "کتامین ۱۰٪ دامی (Ketamine 100 mg/mL)",
        calc: (w) => (w * 0.05).toFixed(2),
        rule: "5 mg/kg IM (0.05 cc/kg)"
      },
    ],
    drug1: {
      id: "dexmedetomidine",
      name: "دکسمدتومازین دامی (Dexdomitor 0.5 mg/mL)",
      calc: (w) => (w * 0.01).toFixed(2),
      rule: "5 - 10 mcg/kg IM (0.01 - 0.02 cc/kg)"
    },
    drug2: {
      id: "butorphanol",
      name: "بوتورفانول دامی (Torbugesic 10 mg/mL)",
      calc: (w) => (w * 0.02).toFixed(2),
      rule: "0.2 mg/kg IM (0.02 cc/kg)"
    },
    drug3: {
      id: "ketamine",
      name: "کتامین ۱۰٪ دامی (Ketamine 100 mg/mL)",
      calc: (w) => (w * 0.05).toFixed(2),
      rule: "5 mg/kg IM (0.05 cc/kg)"
    },
    totalSyringeVol: (w) => (w * 0.08).toFixed(2),
    ratio_guide: "برای گربه ۳ تا ۴ کیلوگرمی: ۰.۰۳ تا ۰.۰۴ سی‌سی دکسمدتومازین + ۰.۰۶ تا ۰.۰۸ سی‌سی بوتورفانول + ۰.۱۵ تا ۰.۲ سی‌سی کتامین ۱۰٪ در یک سرنگ انسولین عضلانی در عضله ران یا اپاکسیال.",
    benefits: ["شروع اثر فوق‌سریع ظرف ۳ تا ۵ دقیقه با ریلکسیشن عضلانی مطلق","بیهوشی جراحی آرام و با ثبات به مدت ۲۰ الی ۳۰ دقیقه","قابلیت بازگشت فوری و آنی با تزریق آنتی‌دوت آتیپامزول (Antisedan) و نالوکسان"],
    warnings: "در گربه‌های مبتلا به کاردیومیوپاتی هیپرتروفیک (HCM)، نارسایی قلبی و انسداد حاد مجاری ادرار (FLUTD) با احتیاط مصرف شود.",
    reversal: "آتیپامزول عضلانی به همان حجم دکسمدتومازین مصرفی (یا دوز مساوی) + در صورت نیاز نالوکسان",
  },
  {
    id: "kitty_magic_reversal",
    title: "پروتکل ریورسال سریع کیتی‌مجیک (Kitty Magic Reversal)",
    subtitle: "بازگشت هوشیاری و رفع برادی‌کاردی و خواب‌آلودگی گربه پس از پایان جراحی",
    category: "reversal",
    species: ["feline"],
    species_label: "🐱 گربه (Feline)",
    tags: ["آنتی‌دوت","ریورسال","اورژانس ریکاوری"],
    drug_ids: ["atipamezole","naloxone"],
    mixing_in_syringe: "✅ سازگار در دو سرنگ یا تزریق متوالی عضلانی",
    mix_status: "compatible",
    drugs: [
      {
        id: "atipamezole",
        name: "آتیپامزول ۵ mg/mL (Antisedan)",
        calc: (w) => (w * 0.01).toFixed(2),
        rule: "برابر با حجم دکسمدتومازین تزریق شده (عضلانی)"
      },
      {
        id: "naloxone",
        name: "نالوکسان ۰.۴ mg/mL (Naloxone)",
        calc: (w) => (w * 0.05).toFixed(2),
        rule: "0.02 - 0.04 mg/kg IM/IV (در صورت نیاز به حذف اثر اوپیوئید)"
      },
    ],
    drug1: {
      id: "atipamezole",
      name: "آتیپامزول ۵ mg/mL (Antisedan)",
      calc: (w) => (w * 0.01).toFixed(2),
      rule: "برابر با حجم دکسمدتومازین تزریق شده (عضلانی)"
    },
    drug2: {
      id: "naloxone",
      name: "نالوکسان ۰.۴ mg/mL (Naloxone)",
      calc: (w) => (w * 0.05).toFixed(2),
      rule: "0.02 - 0.04 mg/kg IM/IV (در صورت نیاز به حذف اثر اوپیوئید)"
    },
    totalSyringeVol: (w) => (w * 0.06).toFixed(2),
    ratio_guide: "آتیپامزول را عضلانی تزریق کنید؛ ظرف ۵ الی ۱۰ دقیقه رفلکس‌های گربه کاملاً برگشته و حیوان روی پا می‌ایستد.",
    benefits: ["حذف فوری اثرات دپرسیون قلبی-عروقی و افت دمای ناشی از آلفا-۲ آگونیست","ریکاوری نرم و هوشیار شدن سریع بیمار بدون اضطراب","ترخیص سریع و ایمن بیمار در مطب و کلینیک سرپایی"],
    warnings: "تزریق داخل وریدی آتیپامزول می‌تواند باعث کلاپس عروقی و تاکی‌کاردی حاد شود؛ فقط عضلانی تزریق شود.",
  },
  {
    id: "ketofol_induction",
    title: "کتوفول همودینامیک ۱ به ۱ (Ketofol 1:1 Protocol)",
    subtitle: "استاندارد طلایی القای بیهوشی با بالاترین ثبات فشار خون و ضربان قلب در سگ و گربه پرخطر",
    category: "ketamine",
    species: ["canine","feline"],
    species_label: "🐶 سگ و 🐱 گربه",
    tags: ["القا بیهوشی","ثبات قلبی","سزارین","بیمار بدحال"],
    drug_ids: ["propofol","ketamine"],
    mixing_in_syringe: "✅ سازگار در یک سرنگ (تزریق ظرف ۲ ساعت پس از اختلاط)",
    mix_status: "compatible",
    drugs: [
      {
        id: "propofol",
        name: "پروپوفول ۱٪ دامی/انسانی (10 mg/mL)",
        calc: (w) => (w * 0.2).toFixed(2),
        rule: "2 mg/kg IV (0.2 cc/kg)"
      },
      {
        id: "ketamine",
        name: "کتامین ۱۰٪ رقیق‌شده یا محاسبه‌شده (100 mg/mL)",
        calc: (w) => (w * 0.02).toFixed(2),
        rule: "2 mg/kg IV (0.02 cc/kg)"
      },
    ],
    drug1: {
      id: "propofol",
      name: "پروپوفول ۱٪ دامی/انسانی (10 mg/mL)",
      calc: (w) => (w * 0.2).toFixed(2),
      rule: "2 mg/kg IV (0.2 cc/kg)"
    },
    drug2: {
      id: "ketamine",
      name: "کتامین ۱۰٪ رقیق‌شده یا محاسبه‌شده (100 mg/mL)",
      calc: (w) => (w * 0.02).toFixed(2),
      rule: "2 mg/kg IV (0.02 cc/kg)"
    },
    totalSyringeVol: (w) => (w * 0.22).toFixed(2),
    ratio_guide: "تهیه کوکتل ۵ mg/mL از هر دو دارو: ۵ سی‌سی پروپوفول ۱۰ mg/mL (۵۰ میلی‌گرم) + ۰.۵ سی‌سی کتامین ۱۰٪ (۵۰ میلی‌گرم) + ۴.۵ سی‌سی نرمال سالین. مخلوط وریدی آهسته تا اثر (To Effect) تیتر شود.",
    benefits: ["خنثی شدن افت فشار خون و آپنه پروپوفول توسط اثر تحریکی سمپاتیک کتامین","حفظ برون‌ده قلبی، پرفیوژن کلیوی و تنفس خودبه‌خودی بیمار","بی‌دردی سوماتیک عالی در جراحی‌های ارتوپدی، بافت نرم و سزارین"],
    warnings: "پروپوفول فاقد نگهدارنده است؛ سرنگ کتوفول باید در همان روز جراحی مصرف و باقیمانده دور ریخته شود.",
  },
  {
    id: "alfax_mid_geriatric",
    title: "القا ایمن آلفاکسالون + میدازولام (Alfax-Mid Induction)",
    subtitle: "ایمن‌ترین القای بیهوشی برای سگ و گربه‌های مسن، بیماران قلبی (HCM/DCM) و سزارین",
    category: "fentanyl",
    species: ["canine","feline","exotic"],
    species_label: "🐱 گربه، 🐶 سگ و 🐰 اگزوتیک",
    tags: ["سالمند","بیماری قلبی","سزارین","فوق‌العاده ایمن"],
    drug_ids: ["alfaxalone","midazolam"],
    mixing_in_syringe: "✅ کاملاً سازگار در یک سرنگ مشترک",
    mix_status: "compatible",
    drugs: [
      {
        id: "alfaxalone",
        name: "آلفاکسالون ۱۰ mg/mL (Alfaxan)",
        calc: (w) => (w * 0.15).toFixed(2),
        rule: "1.5 - 2.0 mg/kg IV (0.15 - 0.2 cc/kg)"
      },
      {
        id: "midazolam",
        name: "میدازولام ۵ mg/mL (Midazolam)",
        calc: (w) => (w * 0.04).toFixed(2),
        rule: "0.2 mg/kg IV (0.04 cc/kg)"
      },
    ],
    drug1: {
      id: "alfaxalone",
      name: "آلفاکسالون ۱۰ mg/mL (Alfaxan)",
      calc: (w) => (w * 0.15).toFixed(2),
      rule: "1.5 - 2.0 mg/kg IV (0.15 - 0.2 cc/kg)"
    },
    drug2: {
      id: "midazolam",
      name: "میدازولام ۵ mg/mL (Midazolam)",
      calc: (w) => (w * 0.04).toFixed(2),
      rule: "0.2 mg/kg IV (0.04 cc/kg)"
    },
    totalSyringeVol: (w) => (w * 0.19).toFixed(2),
    ratio_guide: "میدازولام و آلفاکسالون را در یک سرنگ مخلوط کرده و ۱/۴ دوز را طی ۳۰ ثانیه تزریق کنید تا رفلکس بلع از بین برود و لوله‌گذاری تراشه (Intubation) انجام شود.",
    benefits: ["عدم ایجاد مهار انقباضی قلب و حفظ کامل ریتم سینوسی","ایده‌آل برای لوله‌گذاری آسان نای در گربه بدون لارنگواسپاسم","امکان تجویز عضلانی در گربه‌ها و خرگوش‌های بسیار بدقلق و ترسو"],
    warnings: "در صورت تزریق بولوس بسیار سریع ممکن است آپنه موقت ۲۰ تا ۴۰ ثانیه‌ای رخ دهد؛ اکسیژن‌رسانی کمکی پیش از القا انجام شود.",
  },
  {
    id: "equine_triple_drip",
    title: "پروتکل بیهوشی وریدی اسب در مزرعه (Triple Drip / GKX)",
    subtitle: "بیهوشی جامع و پایدار داخل وریدی (TIVA) برای جراحی‌های مزرعه و کستراسیون اسب",
    category: "ketamine",
    species: ["equine"],
    species_label: "🐎 اسب (Equine)",
    tags: ["مزرعه اسب","کستراسیون","TIVA","انفوزیون وریدی"],
    drug_ids: ["ketamine","xylazine","guaifenesin"],
    mixing_in_syringe: "✅ سازگار در کیسه سرم ۵۰۰ یا ۱۰۰۰ سی‌سی گایافنزین ۵٪",
    mix_status: "compatible",
    drugs: [
      {
        id: "guaifenesin",
        name: "گایافنزین ۵٪ وریدی (Guaifenesin 50 mg/mL)",
        calc: (w) => (w * 1.0).toFixed(1),
        rule: "حامل سرمی ۵۰۰ میلی‌لیتر ۵٪"
      },
      {
        id: "ketamine",
        name: "کتامین ۱۰٪ دامی (Ketamine 100 mg/mL)",
        calc: (w) => (w * 0.02).toFixed(2),
        rule: "1.0 - 2.0 گرم در کیسه ۵۰۰ سی‌سی (۱۰ الی ۲۰ سی‌سی)"
      },
      {
        id: "xylazine",
        name: "زایلازین ۱۰٪ یا ۲٪ دامی (Xylazine)",
        calc: (w) => (w * 0.005).toFixed(2),
        rule: "۵۰۰ میلی‌گرم در کیسه ۵۰۰ سی‌سی (۵ سی‌سی ویال ۱۰٪ یا ۲۵ سی‌سی ویال ۲٪)"
      },
    ],
    drug1: {
      id: "guaifenesin",
      name: "گایافنزین ۵٪ وریدی (Guaifenesin 50 mg/mL)",
      calc: (w) => (w * 1.0).toFixed(1),
      rule: "حامل سرمی ۵۰۰ میلی‌لیتر ۵٪"
    },
    drug2: {
      id: "ketamine",
      name: "کتامین ۱۰٪ دامی (Ketamine 100 mg/mL)",
      calc: (w) => (w * 0.02).toFixed(2),
      rule: "1.0 - 2.0 گرم در کیسه ۵۰۰ سی‌سی (۱۰ الی ۲۰ سی‌سی)"
    },
    drug3: {
      id: "xylazine",
      name: "زایلازین ۱۰٪ یا ۲٪ دامی (Xylazine)",
      calc: (w) => (w * 0.005).toFixed(2),
      rule: "۵۰۰ میلی‌گرم در کیسه ۵۰۰ سی‌سی (۵ سی‌سی ویال ۱۰٪ یا ۲۵ سی‌سی ویال ۲٪)"
    },
    totalSyringeVol: (w) => "کیسه سرم TIVA",
    ratio_guide: "القا ابتدا با زایلازین ۱ mg/kg IV و سپس ۵ دقیقه بعد کتامین ۲.۲ mg/kg IV انجام می‌شود. پس از زمین‌گیر شدن اسب، محلول تریپل دریپ با سرعت 1.0 - 2.0 mL/kg/hr انفوزیون می‌شود.",
    benefits: ["بیهوشی بسیار صاف و یکنواخت مزرعه بدون نیاز به دستگاه گاز بیهوشی","شل‌شدن کامل عضلانی و حفظ تنفس خودبه‌خودی اسب","ریکاوری آرام بدون هیجان و بدون آسیب به دست و پای اسب"],
    warnings: "مدت زمان انفوزیون ترجیحاً بیش از ۶۰ دقیقه نباشد تا تجمع گایافنزین و ضعف عضلانی در ریکاوری رخ ندهد.",
  },
  {
    id: "dex_ket_torph_canine",
    title: "بیهوشی تزریقی کوتاه سگ‌های تهاجمی (DKT Protocol)",
    subtitle: "پروتکل پرقدرت عضلانی برای رادیوگرافی، سوچور زخم‌های حاد و مقید کردن سگ‌های بسیار پرخاشگر",
    category: "ketamine",
    species: ["canine"],
    species_label: "🐶 سگ (Canine)",
    tags: ["سگ خشن","رادیوگرافی","سوچور","تزریق عضلانی"],
    drug_ids: ["dexmedetomidine","ketamine","butorphanol"],
    mixing_in_syringe: "✅ کاملاً سازگار در یک سرنگ مشترک",
    mix_status: "compatible",
    drugs: [
      {
        id: "dexmedetomidine",
        name: "دکسمدتومازین ۰.۵ mg/mL دامی",
        calc: (w) => (w * 0.015).toFixed(2),
        rule: "7 - 10 mcg/kg IM (0.015 - 0.02 cc/kg)"
      },
      {
        id: "butorphanol",
        name: "بوتورفانول ۱۰ mg/mL دامی",
        calc: (w) => (w * 0.02).toFixed(2),
        rule: "0.2 mg/kg IM (0.02 cc/kg)"
      },
      {
        id: "ketamine",
        name: "کتامین ۱۰٪ دامی",
        calc: (w) => (w * 0.03).toFixed(2),
        rule: "3 - 5 mg/kg IM (0.03 - 0.05 cc/kg)"
      },
    ],
    drug1: {
      id: "dexmedetomidine",
      name: "دکسمدتومازین ۰.۵ mg/mL دامی",
      calc: (w) => (w * 0.015).toFixed(2),
      rule: "7 - 10 mcg/kg IM (0.015 - 0.02 cc/kg)"
    },
    drug2: {
      id: "butorphanol",
      name: "بوتورفانول ۱۰ mg/mL دامی",
      calc: (w) => (w * 0.02).toFixed(2),
      rule: "0.2 mg/kg IM (0.02 cc/kg)"
    },
    drug3: {
      id: "ketamine",
      name: "کتامین ۱۰٪ دامی",
      calc: (w) => (w * 0.03).toFixed(2),
      rule: "3 - 5 mg/kg IM (0.03 - 0.05 cc/kg)"
    },
    totalSyringeVol: (w) => (w * 0.065).toFixed(2),
    ratio_guide: "هر ۳ دارو در یک سرنگ کشیده شده و به صورت عضلانی در عضله ران تزریق می‌شود. حیوان ظرف ۵ دقیقه به خواب عمیق می‌رود.",
    benefits: ["مهار کامل سگ‌های مهاجم بدون نیاز به نزاع و بدون خطر گاز گرفتگی پرسنل","امکان انجام رادیوگرافی هیپ (HD)، آندوسکوپی و پانسمان‌های دردناک","برگشت سریع با تزریق عضلانی آتیپامزول پس از اتمام کار"],
    warnings: "افت شدید ضربان قلب (برادی‌کاردی بازتابی) ایجاد می‌شود؛ در بیماران مبتلا به نارسایی دریچه میترال یا آریتمی قلبی ممنوع است.",
  },
  {
    id: "ruminant_standing_sedation",
    title: "سداسیون سبک نشخوارکنندگان (Low-Dose Xyl-Ket Ruminant)",
    subtitle: "سداسیون ایمن گوسفند، بز و گوساله برای سزارین، شاخ‌بری و سم‌چینی بدون نفخ شکمبه",
    category: "xylazine",
    species: ["ruminant"],
    species_label: "🐄 گاو، 🐑 گوسفند و 🐐 بز",
    tags: ["سزارین دام بزرگ","شاخ‌بری","سم‌چینی","ضدنفخ"],
    drug_ids: ["xylazine","ketamine"],
    mixing_in_syringe: "✅ کاملاً سازگار در یک سرنگ مشترک",
    mix_status: "compatible",
    drugs: [
      {
        id: "xylazine",
        name: "زایلازین ۲٪ دامی (Xylazine 2%)",
        calc: (w) => (w * 0.0015).toFixed(3),
        rule: "0.02 - 0.05 mg/kg IM (0.001 - 0.0025 cc/kg)"
      },
      {
        id: "ketamine",
        name: "کتامین ۱۰٪ دامی (Ketamine 10%)",
        calc: (w) => (w * 0.01).toFixed(2),
        rule: "1.0 - 2.0 mg/kg IM (0.01 - 0.02 cc/kg)"
      },
    ],
    drug1: {
      id: "xylazine",
      name: "زایلازین ۲٪ دامی (Xylazine 2%)",
      calc: (w) => (w * 0.0015).toFixed(3),
      rule: "0.02 - 0.05 mg/kg IM (0.001 - 0.0025 cc/kg)"
    },
    drug2: {
      id: "ketamine",
      name: "کتامین ۱۰٪ دامی (Ketamine 10%)",
      calc: (w) => (w * 0.01).toFixed(2),
      rule: "1.0 - 2.0 mg/kg IM (0.01 - 0.02 cc/kg)"
    },
    totalSyringeVol: (w) => (w * 0.012).toFixed(2),
    ratio_guide: "نشخوارکنندگان ۱۰ برابر نسبت به سگ و اسب به زایلازین حساس‌ترند! دوز بسیار ناچیز است: برای گوسفند ۵۰ کیلوگرمی فقط ۰.۱ سی‌سی زایلازین ۲٪ + ۰.۵ سی‌سی کتامین ۱۰٪ عضلانی.",
    benefits: ["آرام‌بخشی بدون از دست رفتن رفلکس بلع و بدون خوابیدن حیوان به پهلو (پرهیز از آسپیراسیون محتویات شکمبه)","عدم ایجاد مهار حرکات شکمبه و عدم وقوع تمپانی حاد (Bloat)","ایده‌آل برای انجام همزمان بی‌حسی موضعی کمری یا پاراورتبرال"],
    warnings: "در ماه آخر آبستنی گاو و گوسفند به دلیل اثرات اکسی‌توسینیک زایلازین و خطر سقط جنین با احتیاط مصرف شود.",
  },
  {
    id: "camelid_bkx",
    title: "کوکتل بیهوشی میدانی شتر و لاما (Camelid BKX - Fowler)",
    subtitle: "پروتکل استاندارد جهانی فاولر برای بیهوشی و مهار ایمن شتر، لاما و آلپاکا در مزرعه",
    category: "ketamine",
    species: ["camelid","ruminant"],
    species_label: "🐫 شتر و 🦙 لاما/آلپاکا",
    tags: ["شتر","لاما","آلپاکا","فاولر","جراحی مزرعه"],
    drug_ids: ["butorphanol","ketamine","xylazine"],
    mixing_in_syringe: "✅ کاملاً سازگار در یک سرنگ مشترک",
    mix_status: "compatible",
    drugs: [
      {
        id: "butorphanol",
        name: "بوتورفانول ۱۰ mg/mL دامی",
        calc: (w) => (w * 0.003).toFixed(3),
        rule: "0.03 mg/kg IM (0.003 cc/kg)"
      },
      {
        id: "xylazine",
        name: "زایلازین ۲٪ دامی (یا ۱۰٪)",
        calc: (w) => (w * 0.012).toFixed(3),
        rule: "0.25 mg/kg IM (0.012 cc/kg از ویال ۲٪)"
      },
      {
        id: "ketamine",
        name: "کتامین ۱۰٪ دامی",
        calc: (w) => (w * 0.025).toFixed(3),
        rule: "2.5 - 3.0 mg/kg IM (0.025 - 0.03 cc/kg)"
      },
    ],
    drug1: {
      id: "butorphanol",
      name: "بوتورفانول ۱۰ mg/mL دامی",
      calc: (w) => (w * 0.003).toFixed(3),
      rule: "0.03 mg/kg IM (0.003 cc/kg)"
    },
    drug2: {
      id: "xylazine",
      name: "زایلازین ۲٪ دامی (یا ۱۰٪)",
      calc: (w) => (w * 0.012).toFixed(3),
      rule: "0.25 mg/kg IM (0.012 cc/kg از ویال ۲٪)"
    },
    drug3: {
      id: "ketamine",
      name: "کتامین ۱۰٪ دامی",
      calc: (w) => (w * 0.025).toFixed(3),
      rule: "2.5 - 3.0 mg/kg IM (0.025 - 0.03 cc/kg)"
    },
    totalSyringeVol: (w) => (w * 0.04).toFixed(2),
    ratio_guide: "برای لاما یا آلپاکای ۶۰ کیلوگرمی: ۰.۲ سی‌سی بوتورفانول + ۰.۷۵ سی‌سی زایلازین ۲٪ + ۱.۵ تا ۱.۸ سی‌سی کتامین ۱۰٪ عضلانی. حیوان ظرف ۶ الی ۸ دقیقه در وضعیت نشسته (Kush) قرار می‌گیرد.",
    benefits: ["بهترین پروتکل بیهوشی شترسانان طبق کتاب طب حیات وحش فاولر (Fowler)","حفظ ثبات تنفسی بدون برونشواسپاسم و بدون افزایش ترشحات بزاقی خطرناک","امکان بازگشت سریع با آتیپامزول و نالتروکسان/نالوکسان"],
    warnings: "سر حیوان باید در حین بیهوشی بالاتر از قفسه سینه قرار گیرد تا از جریان رو به عقب ترشحات مری به حلق جلوگیری شود.",
  },
  {
    id: "rabbit_mid_but",
    title: "سداسیون ایمن خرگوش و جوندگان (Rabbit Mid-But Protocol)",
    subtitle: "آرام‌بخشی بدون مهار تنفس برای معاینه دندان، رادیوگرافی و خون‌گیری در خرگوش و خوکچه هندی",
    category: "fentanyl",
    species: ["exotic"],
    species_label: "🐰 خرگوش و 🐹 خوکچه هندی",
    tags: ["خرگوش","دندانپزشکی اگزوتیک","رادیوگرافی","سداسیون ایمن"],
    drug_ids: ["midazolam","butorphanol"],
    mixing_in_syringe: "✅ کاملاً سازگار در یک سرنگ انسولین",
    mix_status: "compatible",
    drugs: [
      {
        id: "midazolam",
        name: "میدازولام ۵ mg/mL (آمپول انسانی)",
        calc: (w) => (w * 0.1).toFixed(2),
        rule: "0.5 - 1.0 mg/kg SC/IM (0.1 - 0.2 cc/kg)"
      },
      {
        id: "butorphanol",
        name: "بوتورفانول دامی (Torbugesic 10 mg/mL)",
        calc: (w) => (w * 0.04).toFixed(2),
        rule: "0.2 - 0.4 mg/kg SC/IM (0.02 - 0.04 cc/kg)"
      },
    ],
    drug1: {
      id: "midazolam",
      name: "میدازولام ۵ mg/mL (آمپول انسانی)",
      calc: (w) => (w * 0.1).toFixed(2),
      rule: "0.5 - 1.0 mg/kg SC/IM (0.1 - 0.2 cc/kg)"
    },
    drug2: {
      id: "butorphanol",
      name: "بوتورفانول دامی (Torbugesic 10 mg/mL)",
      calc: (w) => (w * 0.04).toFixed(2),
      rule: "0.2 - 0.4 mg/kg SC/IM (0.02 - 0.04 cc/kg)"
    },
    totalSyringeVol: (w) => (w * 0.14).toFixed(2),
    ratio_guide: "برای خرگوش ۲ کیلوگرمی: ۰.۲ تا ۰.۳ سی‌سی میدازولام + ۰.۰۶ تا ۰.۰۸ سی‌سی بوتورفانول در یک سرنگ انسولین زیرجلدی یا عضلانی.",
    benefits: ["عدم ایجاد ایست تنفسی (خرگوش‌ها بسیار به دپرسیون تنفسی حساس هستند)","تسکین فوق‌العاده استرس و ترس شدید خرگوش بدون ایجاد شوک کاتکول‌آمینی","قابلیت برگشت کامل با آنتی‌دوت فلومازنیل (Flumazenil) در صورت لزوم"],
    warnings: "خرگوش‌ها نباید پیش از بیهوشی طولانی‌مدت ناشتا نگه داشته شوند (خطر استاز گوارشی GI Stasis).",
  },
  {
    id: "avian_in_mid_but",
    title: "آرام‌بخش قطره‌ای داخل بینی پرندگان (Avian Intranasal Mid-But)",
    subtitle: "سداسیون سریع بدون تزریق سوزنی برای کاسکو، طوطی‌سانان و شکاری‌ها جهت معاینه و رادیوگرافی",
    category: "fentanyl",
    species: ["avian"],
    species_label: "🦜 پرندگان زینتی و 🦅 شکاری",
    tags: ["طوطی","کاسکو","قطره داخل بینی","بدون سوزن","رادیولوژی پرنده"],
    drug_ids: ["midazolam","butorphanol"],
    mixing_in_syringe: "✅ سازگار در سرنگ انسولین بدون سوزن (تزریق به سوراخ بینی Nares)",
    mix_status: "compatible",
    drugs: [
      {
        id: "midazolam",
        name: "میدازولام ۵ mg/mL تزریقی",
        calc: (w) => (w * 0.2).toFixed(2),
        rule: "1.0 - 2.0 mg/kg IN (0.2 - 0.4 cc/kg)"
      },
      {
        id: "butorphanol",
        name: "بوتورفانول ۱۰ mg/mL دامی",
        calc: (w) => (w * 0.1).toFixed(2),
        rule: "1.0 - 2.0 mg/kg IN (0.1 - 0.2 cc/kg)"
      },
    ],
    drug1: {
      id: "midazolam",
      name: "میدازولام ۵ mg/mL تزریقی",
      calc: (w) => (w * 0.2).toFixed(2),
      rule: "1.0 - 2.0 mg/kg IN (0.2 - 0.4 cc/kg)"
    },
    drug2: {
      id: "butorphanol",
      name: "بوتورفانول ۱۰ mg/mL دامی",
      calc: (w) => (w * 0.1).toFixed(2),
      rule: "1.0 - 2.0 mg/kg IN (0.1 - 0.2 cc/kg)"
    },
    totalSyringeVol: (w) => (w * 0.3).toFixed(2),
    ratio_guide: "محلول در سرنگ انسولین بدون سرسوزن کشیده شده و نیمی از حجم در سوراخ بینی راست و نیم دیگر در سوراخ چپ چکانده می‌شود.",
    benefits: ["جلوگیری کامل از مرگ ناشی از استرس و خفگی در طوطی‌های بسیار وحشی","جذب سریع از عروق مویرگی مخاط بینی ظرف ۳ تا ۵ دقیقه","ریکاوری نرم و بازگشت آنی با چکاندن قطره فلومازنیل داخل بینی"],
    warnings: "مطمئن شوید مجرای نای پرنده مسدود نشود و سر پرنده در زاویه مناسب رو به جلو نگه داشته شود.",
  },
  {
    id: "flk_mlk_cri",
    title: "انفوزیون مداوم ضددرد پیشرفته (FLK / MLK CRI Protocol)",
    subtitle: "استاندارد طلایی کنترل دردهای شدید جراحی، پانکراتیت حاد، پریتونیت و تروما در ICU",
    category: "analgesia",
    species: ["canine"],
    species_label: "🐶 سگ (Canine)",
    tags: ["ICU","پانکراتیت","پریتونیت","کنترل درد جراحی","CRI"],
    drug_ids: ["fentanyl","lidocaine","ketamine"],
    mixing_in_syringe: "✅ کاملاً سازگار در کیسه سرم نرمال سالین یا رینگر لاکتات ۵۰۰ سی‌سی",
    mix_status: "compatible",
    drugs: [
      {
        id: "fentanyl",
        name: "فنتانیل ۵۰ mcg/mL",
        calc: (w) => (w * 0.06).toFixed(2),
        rule: "2 - 5 mcg/kg/hr CRI"
      },
      {
        id: "lidocaine",
        name: "لیدوکائین ۲٪ تزریقی (20 mg/mL)",
        calc: (w) => (w * 0.075).toFixed(2),
        rule: "25 - 50 mcg/kg/min CRI (1.5 - 3.0 mg/kg/hr)"
      },
      {
        id: "ketamine",
        name: "کتامین ۱۰٪ دامی (100 mg/mL)",
        calc: (w) => (w * 0.006).toFixed(3),
        rule: "2 - 10 mcg/kg/min CRI (0.1 - 0.6 mg/kg/hr - ساب‌آنستتیک)"
      },
    ],
    drug1: {
      id: "fentanyl",
      name: "فنتانیل ۵۰ mcg/mL",
      calc: (w) => (w * 0.06).toFixed(2),
      rule: "2 - 5 mcg/kg/hr CRI"
    },
    drug2: {
      id: "lidocaine",
      name: "لیدوکائین ۲٪ تزریقی (20 mg/mL)",
      calc: (w) => (w * 0.075).toFixed(2),
      rule: "25 - 50 mcg/kg/min CRI (1.5 - 3.0 mg/kg/hr)"
    },
    drug3: {
      id: "ketamine",
      name: "کتامین ۱۰٪ دامی (100 mg/mL)",
      calc: (w) => (w * 0.006).toFixed(3),
      rule: "2 - 10 mcg/kg/min CRI (0.1 - 0.6 mg/kg/hr - ساب‌آنستتیک)"
    },
    totalSyringeVol: (w) => "کیسه سرم CRI (سرعت 2 cc/kg/hr)",
    ratio_guide: "دستور ساخت در کیسه ۵۰۰ سی‌سی سرم سالین: برای سگ با سرعت 2 cc/kg/hr سرم: ۲۴ سی‌سی لیدوکائین ۲٪ + ۱.۲ سی‌سی کتامین ۱۰٪ + ۲۴ سی‌سی فنتانیل به کیسه سرم افزوده می‌شود.",
    benefits: ["مهار پدیده باد کردن اعصاب (Wind-up phenomenon) و دردهای مقاوم به مسکن","کاهش چشمگیر نیاز به هوشبرهای استنشاقی ایزوفلوران تا بیش از ۶۰٪","خاصیت ضدالتهابی قوی و محافظت از مخاط گوارشی به دلیل لیدوکائین سیستمیک"],
    warnings: "در گربه به دلیل سمیت قلبی لیدوکائین، ترکیب FLK ممنوع است و باید لیدوکائین حذف شود (کوکتل FK).",
  },
  {
    id: "ivdd_neuro_cocktail",
    title: "کوکتل ضددرد پیشرفته دیسک و اعصاب (IVDD Neuro-Cocktail)",
    subtitle: "خط اول کنترل دردهای عصبی دیسک بین‌مهره‌ای، لامینکتومی و درد ریشه عصبی",
    category: "analgesia",
    species: ["canine","feline"],
    species_label: "🐶 سگ و 🐱 گربه",
    tags: ["دیسک کمر","IVDD","درد نوروپاتیک","مولتی‌مدال"],
    drug_ids: ["gabapentin","tramadol"],
    mixing_in_syringe: "✅ تجویز همزمان خوراکی با فواصل منظم",
    mix_status: "compatible",
    drugs: [
      {
        id: "gabapentin",
        name: "گاباپنتین کپسول ۱۰۰ یا ۳۰۰ میلی‌گرم",
        calc: (w) => (w * 10).toFixed(1) + " mg",
        rule: "10 - 15 mg/kg PO TID (هر ۸ ساعت)"
      },
      {
        id: "tramadol",
        name: "ترامادول قرص ۵۰ میلی‌گرم",
        calc: (w) => (w * 3).toFixed(1) + " mg",
        rule: "2 - 5 mg/kg PO TID (هر ۸ ساعت)"
      },
    ],
    drug1: {
      id: "gabapentin",
      name: "گاباپنتین کپسول ۱۰۰ یا ۳۰۰ میلی‌گرم",
      calc: (w) => (w * 10).toFixed(1) + " mg",
      rule: "10 - 15 mg/kg PO TID (هر ۸ ساعت)"
    },
    drug2: {
      id: "tramadol",
      name: "ترامادول قرص ۵۰ میلی‌گرم",
      calc: (w) => (w * 3).toFixed(1) + " mg",
      rule: "2 - 5 mg/kg PO TID (هر ۸ ساعت)"
    },
    totalSyringeVol: (w) => "کپسول و قرص خوراکی",
    ratio_guide: "تجویز خوراکی همزمان هر ۸ ساعت همراه با غذا. در دردهای بسیار شدید، آمانتادین خوراکی (3 - 5 mg/kg SID) به عنوان مهارکننده NMDA به این کوکتل اضافه می‌شود.",
    benefits: ["مهار مسیرهای درد صعودی نخاعی و کاهش حساسیت‌زایی مرکزی (Central Sensitization)","امکان استراحت در باکس (Cage Rest) و تسکین آرامش‌بخش اسپاسم‌های عضلانی پاراورتبرال","پرهیز از عوارض گوارشی مصرف همزمان چند داروی ضدالتهاب غیراستروئیدی"],
    warnings: "خواب‌آلودگی و آتاکسی اولیه طبیعی است؛ با گذشت ۲ تا ۳ روز برطرف می‌شود.",
  },
  {
    id: "emergency_anaphylaxis_cocktail",
    title: "پروتکل اورژانس کهیر حاد و آنافیلاکسی (Anaphylaxis Cocktail)",
    subtitle: "مهار سریع واکنش‌های حساسیتی به واکسن، نیش حشرات، شوک آنافیلاکتیک و خارش شدید",
    category: "emergency",
    species: ["canine","feline"],
    species_label: "🐶 سگ و 🐱 گربه",
    tags: ["آنافیلاکسی","کهیر حاد","شوک واکسن","نیش زنبور","اورژانس"],
    drug_ids: ["dexamethasone","epinephrine"],
    mixing_in_syringe: "⚠️ تزریق در دو سرنگ یا متوالی (اپی‌نفرین فوری، کورتون پس از آن)",
    mix_status: "compatible",
    drugs: [
      {
        id: "epinephrine",
        name: "اپی‌نفرین ۱ mg/mL (آمپول ۱:۱۰۰۰) در صورت شوک",
        calc: (w) => (w * 0.01).toFixed(2),
        rule: "0.01 - 0.02 mg/kg IM/IV (0.01 - 0.02 cc/kg)"
      },
      {
        id: "dexamethasone",
        name: "دگزامتازون فسفات ۴ mg/mL",
        calc: (w) => (w * 0.05).toFixed(2),
        rule: "0.2 - 0.5 mg/kg IV/IM (0.05 - 0.12 cc/kg)"
      },
    ],
    drug1: {
      id: "epinephrine",
      name: "اپی‌نفرین ۱ mg/mL (آمپول ۱:۱۰۰۰) در صورت شوک",
      calc: (w) => (w * 0.01).toFixed(2),
      rule: "0.01 - 0.02 mg/kg IM/IV (0.01 - 0.02 cc/kg)"
    },
    drug2: {
      id: "dexamethasone",
      name: "دگزامتازون فسفات ۴ mg/mL",
      calc: (w) => (w * 0.05).toFixed(2),
      rule: "0.2 - 0.5 mg/kg IV/IM (0.05 - 0.12 cc/kg)"
    },
    totalSyringeVol: (w) => (w * 0.06).toFixed(2),
    ratio_guide: "در شوک آنافیلاکتیک و کلاپس تنفسی: ابتدا بلافاصله اپی‌نفرین عضلانی در عضله ران تزریق شود، سپس دگزامتازون وریدی به همراه دیفن‌هیدرامین ۲ mg/kg عضلانی تزریق گردد.",
    benefits: ["رفع فوری اسپاسم برونش، احیای فشار خون و مهار ادم حاد حنجره توسط اپی‌نفرین","مهار فاز تاخیری التهاب و پیشگیری از عود شوک آنافیلاکسی توسط کورتیکواستروئید","نجات جان حیوان در شوک واکسیناسیون کمتر از ۲ دقیقه"],
    warnings: "در کهیر ساده بدون شوک و بدون تنگی نفس، از تزریق اپی‌نفرین خودداری شده و فقط آنتی‌هیستامین و دگزامتازون استفاده شود.",
  },
  {
    id: "triple_reversal_protocol",
    title: "پروتکل احیای سه‌گانه بیهوشی و اوپیوئید (Triple Reversal Protocol)",
    subtitle: "آنتی‌دوت جامع بازگشت سریع بیماران بدحال در اوردوز بیهوشی، آپنه و عدم ریکاوری",
    category: "reversal",
    species: ["canine","feline","exotic"],
    species_label: "🐶 سگ، 🐱 گربه و 🐰 اگزوتیک",
    tags: ["احیا بیهوشی","پادزهر","نالوکسان","فلومازنیل","آتیپامزول"],
    drug_ids: ["atipamezole","naloxone"],
    mixing_in_syringe: "✅ تزریق متوالی اختصاصی بر اساس داروی مصرفی بیمار",
    mix_status: "compatible",
    drugs: [
      {
        id: "atipamezole",
        name: "آتیپامزول ۵ mg/mL (پادزهر آلفا-۲)",
        calc: (w) => (w * 0.02).toFixed(2),
        rule: "0.1 - 0.2 mg/kg IM (خنثی‌کننده دکسمدتومازین و زایلازین)"
      },
      {
        id: "naloxone",
        name: "نالوکسان ۰.۴ mg/mL (پادزهر اوپیوئیدها)",
        calc: (w) => (w * 0.05).toFixed(2),
        rule: "0.02 - 0.04 mg/kg IV/IM (خنثی‌کننده فنتانیل، مورفین، بوتورفانول)"
      },
    ],
    drug1: {
      id: "atipamezole",
      name: "آتیپامزول ۵ mg/mL (پادزهر آلفا-۲)",
      calc: (w) => (w * 0.02).toFixed(2),
      rule: "0.1 - 0.2 mg/kg IM (خنثی‌کننده دکسمدتومازین و زایلازین)"
    },
    drug2: {
      id: "naloxone",
      name: "نالوکسان ۰.۴ mg/mL (پادزهر اوپیوئیدها)",
      calc: (w) => (w * 0.05).toFixed(2),
      rule: "0.02 - 0.04 mg/kg IV/IM (خنثی‌کننده فنتانیل، مورفین، بوتورفانول)"
    },
    totalSyringeVol: (w) => (w * 0.07).toFixed(2),
    ratio_guide: "بر اساس پروتکل بیهوشی که بیمار دریافت کرده است: برای آلفا-۲ها (زایلازین/دکسمدین) آتیپامزول عضلانی؛ برای اوپیوئیدها نالوکسان وریدی آهسته؛ برای بنزودیازپین‌ها فلومازنیل 0.02 mg/kg IV تزریق شود.",
    benefits: ["بازگشت آنی ضربان قلب و فشار خون و رفع وقفه تنفسی در عرض ۶۰ ثانیه","نجات جان بیمار در حوادث ناشی از حساسیت دارویی یا اشتباه در دوزاژ","ایمنی کامل و اختصاصیت مطلق فارماکولوژیک گیرنده‌ای"],
    warnings: "نالوکسان بی‌دردی اوپیوئید را نیز به طور کامل خنثی می‌کند؛ مراقب بازگشت دردهای شدید جراحی باشید.",
  },
  {
    id: "otm_bup_dex_feline",
    title: "آرام‌بخش و بی‌دردی ترنس‌موکوزال مخاط گونه گربه (OTM Bup-Dex)",
    subtitle: "تسکین درد و آرام‌بخشی از طریق چکاندن در دهان بدون نیاز به تزریق دردناک در گربه‌های خشن",
    category: "analgesia",
    species: ["feline"],
    species_label: "🐱 گربه (Feline)",
    tags: ["مخاط دهان","OTM","بدون سوزن","آرام‌بخش گربه","درد جراحی"],
    drug_ids: ["buprenorphine","dexmedetomidine"],
    mixing_in_syringe: "✅ کاملاً سازگار در یک سرنگ انسولین بدون سوزن",
    mix_status: "compatible",
    drugs: [
      {
        id: "buprenorphine",
        name: "بوپرنورفین ۰.۳ mg/mL تزریقی",
        calc: (w) => (w * 0.07).toFixed(2),
        rule: "0.02 - 0.03 mg/kg OTM (0.07 - 0.1 cc/kg)"
      },
      {
        id: "dexmedetomidine",
        name: "دکسمدتومازین ۰.۵ mg/mL دامی",
        calc: (w) => (w * 0.01).toFixed(2),
        rule: "5 - 10 mcg/kg OTM (0.01 - 0.02 cc/kg)"
      },
    ],
    drug1: {
      id: "buprenorphine",
      name: "بوپرنورفین ۰.۳ mg/mL تزریقی",
      calc: (w) => (w * 0.07).toFixed(2),
      rule: "0.02 - 0.03 mg/kg OTM (0.07 - 0.1 cc/kg)"
    },
    drug2: {
      id: "dexmedetomidine",
      name: "دکسمدتومازین ۰.۵ mg/mL دامی",
      calc: (w) => (w * 0.01).toFixed(2),
      rule: "5 - 10 mcg/kg OTM (0.01 - 0.02 cc/kg)"
    },
    totalSyringeVol: (w) => (w * 0.08).toFixed(2),
    ratio_guide: "مخلوط در سرنگ انسولین بدون سرسوزن کشیده شده و بین لب و گونه (مخاط باکال Oral Transmucosal) چکانده می‌شود تا از طریق عروق مویرگی گونه جذب سیستمیک شود.",
    benefits: ["بدون هیچ‌گونه درد تزریق عضلانی یا زیرجلدی (ایده‌آل برای گربه‌های وحشی یا خانگی لوس)","فراهمی زیستی ۱۰۰٪ بوپرنورفین در مخاط دهان گربه به دلیل pH قلیایی بزاق","بی‌دردی طولانی‌مدت ۶ الی ۸ ساعته جراحی و دندانپزشکی"],
    warnings: "حیوان دارو را قورت ندهد تا از اثر عبور اول کبد (First-pass metabolism) جلوگیری شود.",
    reversal: "آتیپامزول عضلانی برای خنثی کردن دکسمدتومازین + نالوکسان در صورت لزوم",
  },
  {
    id: "ruminant_paravertebral_block",
    title: "کوکتل بلوک عصبی پاراورتبرال نشخوارکنندگان (Paravertebral Cocktail)",
    subtitle: "بی‌حسی موضعی کامل دیواره پهلو برای سزارین، رومینوتومی و جراحی‌های جابجایی شیردان (LDA)",
    category: "analgesia",
    species: ["ruminant"],
    species_label: "🐄 گاو و 🐑 گوسفند/بز",
    tags: ["سزارین گاو","رومینوتومی","پاراورتبرال","بی‌حسی موضعی","شیردان"],
    drug_ids: ["lidocaine","epinephrine"],
    mixing_in_syringe: "✅ سازگار در یک سرنگ مشترک با سالین",
    mix_status: "compatible",
    drugs: [
      {
        id: "lidocaine",
        name: "لیدوکائین ۲٪ دامی (Lidocaine 2%)",
        calc: (w) => (w * 0.15).toFixed(1),
        rule: "حداکثر 6 - 8 mg/kg (0.3 - 0.4 cc/kg)"
      },
      {
        id: "sodium_bicarbonate",
        name: "سدیم بی‌کربنات ۸.۴٪ (جهت بافر کردن و رفع سوزش تزریق)",
        calc: (w) => (w * 0.015).toFixed(2),
        rule: "نسبت ۱ به ۹ با لیدوکائین (حداکثر ۱۰٪ حجم)"
      },
    ],
    drug1: {
      id: "lidocaine",
      name: "لیدوکائین ۲٪ دامی (Lidocaine 2%)",
      calc: (w) => (w * 0.15).toFixed(1),
      rule: "حداکثر 6 - 8 mg/kg (0.3 - 0.4 cc/kg)"
    },
    drug2: {
      id: "sodium_bicarbonate",
      name: "سدیم بی‌کربنات ۸.۴٪ (جهت بافر کردن و رفع سوزش تزریق)",
      calc: (w) => (w * 0.015).toFixed(2),
      rule: "نسبت ۱ به ۹ با لیدوکائین (حداکثر ۱۰٪ حجم)"
    },
    totalSyringeVol: (w) => (w * 0.165).toFixed(1),
    ratio_guide: "به ازای هر ۹ سی‌سی لیدوکائین ۲٪، ۱ سی‌سی بی‌کربنات سدیم ۸.۴٪ به سرنگ افزوده می‌شود. این کار باعث قلیایی شدن pH لیدوکائین، حذف کامل سوزش حین تزریق و شروع اثر بی‌حسی ظرف ۹۰ ثانیه می‌شود.",
    benefits: ["بی‌حسی کامل تمام لایه‌های صفاق، عضلات و پوست پهلو بدون زمین‌گیر شدن دام","کاهش استرس جراحی سزارین و عدم نیاز به هوشبرهای استنشاقی پرهزینه","رفع کامل درد احشایی ناشی از برش دیواره رحم یا رومن"],
    warnings: "در گوسفند و بز سمیت لیدوکائین سریع‌تر رخ می‌دهد؛ حداکثر دوز 5 mg/kg رعایت شود.",
    reversal: "در صورت سمیت تصادفی سیستمیک و تشنج: دیازپام وریدی و اکسیژن",
  }
];

// ==============================================
// ماتریس ترکیبات ناسازگار، خطرناک و کم‌اثر (Blacklisted & Incompatible Cocktails)
// ==============================================
const INCOMPATIBLE_COMBINATIONS_DATA = [
  {
    id: "nsaid_steroid",
    title: "ملوکسیکام (NSAIDs) + دگزامتازون (کورتیکواستروئیدها)",
    severity: "fatal",
    severity_label: "☠️ خطر مرگبار سوراخ شدن روده و خونریزی حاد",
    incompatible_type: "هم‌افزایی سمیت گوارشی و نارسایی حاد کلیه (Ulcerogenic Synergy)",
    drugs: "ملوکسیکام، کارپروفن، فلونیکسین، کتوپروفن + دگزامتازون، پردنیزولون، هیدروکورتیزون",
    mechanism: "مهار همزمان آنزیم COX-1/2 توسط NSAID و آنزیم فسفولیپاز A2 توسط کورتون، سنتز پروستاگلاندین‌های محافظ مخاط معده و خونرسانی کلیه را به صفر می‌رساند. نتیجه: ایجاد اولسرهای عمیق پپتیک، پرفوراسیون روده، شوک سپتیک و مرگ ظرف ۲۴ تا ۷۲ ساعت.",
    clinical_rule: "🔴 مصرف همزمان در یک سرنگ یا حتی در یک روز مطلقاً ممنوع است. در صورت نیاز به تغییر دارو، حداقل ۳ تا ۵ روز دوره پاک‌سازی (Washout Period) رعایت شود."
  },
  {
    id: "diazepam_aqueous",
    title: "دیازپام + سرم‌های قندی/نمکی یا داروهای پایه آبی در یک سرنگ",
    severity: "major",
    severity_label: "🔴 رسوب بلوری فوری و خطر آمبولی عروقی (Precipitation)",
    incompatible_type: "ناسازگاری فیزیکوشیمیایی انحلال (Insoluble Precipitation)",
    drugs: "دیازپام تزریقی + رینگر، نرمال سالین، دکستروز یا آنتی‌بیوتیک‌های محلول در آب",
    mechanism: "دیازپام دارویی بسیار چربی‌دوست است و برای حل شدن در ویال از حلال پروپیلن گلیکول ۴۰٪ و اتانول استفاده می‌کند. به محض مخلوط شدن با هر مایع پایه آبی، حلال رقیق شده و دیازپام بلافاصله به شکل کریستال‌های سفید شیری‌رنگ رسوب می‌کند.",
    clinical_rule: "دیازپام باید به صورت وریدی مستقیم تزریق شود و در سرم ریخته نشود. در صورت نیاز به اختلاط با سرم یا سایر داروها، داروی انتخابی میدازولام (Midazolam) است که پایه آبی دارد."
  },
  {
    id: "aminoglycoside_betalactam",
    title: "جنتامایسین / آمیکاسین + آمپی‌سیلین / پنی‌سیلین در یک سرنگ",
    severity: "major",
    severity_label: "🔴 غیرفعال‌سازی شیمیایی مستقیم متقابل آنتی‌بیوتیک‌ها",
    incompatible_type: "تخریب متقابل پیوند شیمیایی در سرنگ مشترک (Chemical Inactivation)",
    drugs: "جنتامایسین، آمیکاسین، کانامایسین + آمپی‌سیلین، پنی‌سیلین G، کوآموکسی‌کلاو",
    mechanism: "حلقه بتا-لاکتام پنی‌سیلین با گروه‌های آمینی باردار مولکول آمینوگلیکوزید پیوند کووالانسی کوپلاسیون تشکیل می‌دهد. در نتیجه هر دو دارو در داخل سرنگ خنثی شده و اثر باکتریسیدی آن‌ها پیش از ورود به بدن بیمار از بین می‌رود.",
    clinical_rule: "این دو دارو در داخل بدن سینرژی عالی دارند، اما هرگز نباید در یک سرنگ مشترک مخلوط شوند. حتماً در دو سرنگ جداگانه و در دو موضع تزریقی مختلف تزریق شوند."
  },
  {
    id: "fluoroquinolone_cations",
    title: "انروفلوکساسین / تتراسایکلین + کلسیم، آنتی‌اسیدها یا سوکرالفات",
    severity: "moderate",
    severity_label: "🟡 شلاتاسیون کاتیونی و مهار ۹۰٪ جذب گوارشی",
    incompatible_type: "شلاتاسیون و تشکیل رسوب نامحلول در لومن روده (Chelation)",
    drugs: "انروفلوکساسین، سیپروفلوکساسین، داکسی‌سایکلین + سوکرالفات، کلسیم، آنتی‌اسیدهای آلومینیوم/منیزیم",
    mechanism: "کاتیون‌های چندظرفیتی فلزی به ساختار حلقوی فلوئوروکینولون‌ها و تتراسایکلین‌ها متصل شده و یک کمپلکس کلاته فوق‌العاده پایدار و غیرقابل جذب در روده تشکیل می‌دهند.",
    clinical_rule: "بین مصرف خوراکی انروفلوکساسین یا تتراسایکلین‌ها با سوکرالفات یا مکمل‌های کلسیم و شیر، حداقل ۲ ساعت فاصله زمانی رعایت شود."
  },
  {
    id: "metoclopramide_atropine",
    title: "متوکلوپرامید + آتروپین (خنثی‌سازی کامل اثر پروکینتیک)",
    severity: "moderate",
    severity_label: "🟡 تضاد فارماکودینامیک ۱۰۰٪ و بی‌اثر شدن دارو",
    incompatible_type: "تضاد مستقیم گیرنده‌ای (Pharmacodynamic Antagonism)",
    drugs: "متوکلوپرامید (محرک حرکتی دستگاه گوارش) + آتروپین / اسکوپولامین (آنتی‌کولینرژیک)",
    mechanism: "متوکلوپرامید با تحریک استیل‌کولین در شبکه عصبی مایانتریک حرکات پیش‌برنده معده را افزایش می‌دهد؛ در مقابل، آتروپین گیرنده‌های موسکارینی را بلوک کرده و حرکات روده را فلج می‌کند. این ترکیب بی‌فایده بوده و فقط عوارض جانبی بر جای می‌گذارد.",
    clinical_rule: "اگر هدف کنترل همزمان ترشحات بزاق و تهوع است، از ماروپیتانت (سیرنیا) به جای متوکلوپرامید همراه با آتروپین استفاده کنید."
  },
  {
    id: "tramadol_serotonergic",
    title: "ترامادول + مهارکننده‌های سروتونین (فلوکستین، کلومیپرامین، سلژیلین)",
    severity: "fatal",
    severity_label: "☠️ خطر سندروم سروتونین کشنده و تشنج حاد (Serotonin Syndrome)",
    incompatible_type: "هم‌پوشانی سمیت نوروترنسمیتری (Toxicity Synergy)",
    drugs: "ترامادول + فلوکستین، کلومیپرامین، سلژیلین، آمی‌تریپتیلین",
    mechanism: "ترامادول علاوه بر اثر بر گیرنده مو-اپیوئید، مهارکننده قوی بازجذب سروتونین و نوراپی‌نفرین است. مصرف همزمان با داروهای ضدافسردگی یا ضدترس باعث انباشت سمی سروتونین در CNS، ریجیدیتی عضلانی، هیپرترمی شدید، تشنج‌های مکرر و مرگ می‌شود.",
    clinical_rule: "در بیمارانی که فلوکستین یا کلومیپرامین مصرف می‌کنند، برای کنترل درد به جای ترامادول از گاباپنتین، متادون یا بوپرنورفین استفاده شود."
  }
];

// باز کردن مودال کوکتل‌ها
function openCocktailsModal(focusDrugId = null) {
  const modal = document.getElementById('cocktailsModal');
  if (!modal) return;

  activeCocktailsFilter = focusDrugId || 'all';

  const wDisp = document.getElementById('cocktailActiveWeightDisplay');
  if (wDisp) wDisp.textContent = `${currentPatientWeight} kg`;

  updateCocktailFilterPills(activeCocktailsFilter);
  renderCocktailsList(activeCocktailsFilter);

  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeCocktailsModal() {
  const modal = document.getElementById('cocktailsModal');
  if (modal) modal.classList.add('hidden');
}

function filterCocktails(filterKey) {
  activeCocktailsFilter = filterKey;
  updateCocktailFilterPills(filterKey);
  renderCocktailsList(filterKey);
}

function updateCocktailFilterPills(activeKey) {
  document.querySelectorAll('.cocktail-cat-pill').forEach(btn => {
    const ccat = btn.getAttribute('data-ccat');
    if (ccat === activeKey) {
      btn.classList.add('active', 'bg-indigo-900', 'text-white', 'shadow-sm');
      btn.classList.remove('bg-white', 'text-indigo-800');
    } else {
      btn.classList.remove('active', 'bg-indigo-900', 'text-white', 'shadow-sm');
      btn.classList.add('bg-white', 'text-indigo-800');
    }
  });
}

function renderCocktailsList(filterKey = 'all') {
  const container = document.getElementById('cocktailsListContainer');
  if (!container) return;

  // ۱. حالت نمایش ترکیبات ناسازگار و خطرناک
  if (filterKey === 'incompatible') {
    container.innerHTML = `
      <div class="mb-4 bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-rose-950 flex items-start gap-2.5">
        <i data-lucide="shield-alert" class="w-5 h-5 text-rose-600 shrink-0 mt-0.5"></i>
        <div>
          <h4 class="font-black text-xs text-rose-900">راهنمای ترکیبات ناسازگار، بی‌اثر یا مرگبار در بالین دامپزشکی (Blacklisted Combinations)</h4>
          <p class="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
            این داروها به دلیل رسوب فیزیکی در سرنگ، تضاد فارماکودینامیک ۱۰۰٪ یا ایجاد زخم‌های گوارشی مرگبار هرگز نباید همزمان یا در یک سرنگ مخلوط شوند.
          </p>
        </div>
      </div>
      <div class="space-y-4">
        ${INCOMPATIBLE_COMBINATIONS_DATA.map(item => `
          <div class="bg-white rounded-3xl p-5 border-2 ${item.severity === 'fatal' ? 'border-rose-400 bg-rose-50/20' : 'border-amber-300 bg-amber-50/20'} shadow-sm space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
              <div class="flex items-center gap-2">
                <span class="text-xl">${item.severity === 'fatal' ? '☠️' : '⛔'}</span>
                <div>
                  <h4 class="font-black text-sm text-slate-900">${item.title}</h4>
                  <span class="text-[11px] font-bold text-slate-500">${item.incompatible_type}</span>
                </div>
              </div>
              <span class="text-[11px] font-black px-2.5 py-1 rounded-xl ${item.severity === 'fatal' ? 'bg-rose-100 text-rose-900 border border-rose-300' : 'bg-amber-100 text-amber-900 border border-amber-300'}">
                ${item.severity_label}
              </span>
            </div>

            <div class="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <span class="font-bold text-slate-700 block mb-0.5">داروهای درگیر:</span>
              <span class="font-mono text-slate-800 font-bold latin-text">${item.drugs}</span>
            </div>

            <div class="bg-white p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <span class="font-bold text-slate-900 block flex items-center gap-1 text-slate-800">
                <i data-lucide="microscope" class="w-3.5 h-3.5 text-indigo-600"></i>
                <span>مکانیسم علمی پلامبز (Plumb's Clinical Mechanism):</span>
              </span>
              <p class="text-slate-700 text-xs leading-relaxed">${item.mechanism}</p>
            </div>

            <div class="p-3 rounded-xl ${item.severity === 'fatal' ? 'bg-rose-100/70 border border-rose-300 text-rose-950' : 'bg-amber-100/70 border border-amber-300 text-amber-950'} text-xs font-bold leading-relaxed">
              <span>📌 دستورالعمل بالینی و جایگزین ایمن:</span> ${item.clinical_rule}
            </div>
          </div>
        `).join('')}
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  // ۲. فیلتر هوشمند گونه‌ها و دسته‌بندی‌ها
  let filtered = CLINICAL_COCKTAILS_DATA;

  if (filterKey === 'dog_cat') {
    filtered = CLINICAL_COCKTAILS_DATA.filter(c => (c.species || []).includes('canine') || (c.species || []).includes('feline'));
  } else if (filterKey === 'equine') {
    filtered = CLINICAL_COCKTAILS_DATA.filter(c => (c.species || []).includes('equine'));
  } else if (filterKey === 'ruminant') {
    filtered = CLINICAL_COCKTAILS_DATA.filter(c => (c.species || []).includes('ruminant') || (c.species || []).includes('camelid'));
  } else if (filterKey === 'exotic') {
    filtered = CLINICAL_COCKTAILS_DATA.filter(c => (c.species || []).includes('exotic') || (c.species || []).includes('avian'));
  } else if (filterKey === 'reversal') {
    filtered = CLINICAL_COCKTAILS_DATA.filter(c => c.category === 'reversal' || c.reversal);
  } else if (filterKey !== 'all') {
    filtered = CLINICAL_COCKTAILS_DATA.filter(c => {
      if (c.category === filterKey) return true;
      if (c.id === filterKey) return true;
      if (Array.isArray(c.drug_ids) && c.drug_ids.includes(filterKey)) return true;
      return false;
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
        <i data-lucide="flask-conical-off" class="w-10 h-10 mx-auto text-slate-400 mb-2"></i>
        <p class="text-sm font-bold text-slate-600">کوکتلی برای این فیلتر یافت نشد.</p>
        <button onclick="filterCocktails('all')" class="mt-3 px-3.5 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold">نمایش همه کوکتل‌ها</button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = filtered.map(item => {
    const isCompatible = item.mix_status === 'compatible';
    const statusPill = isCompatible ? `
      <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
        <i data-lucide="check" class="w-3.5 h-3.5"></i>
        <span>${item.mixing_in_syringe}</span>
      </span>
    ` : `
      <span class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
        <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i>
        <span>${item.mixing_in_syringe}</span>
      </span>
    `;

    // دریافت لیست داروها (پشتیبانی از drugs یا فیلدهای drug1/drug2/drug3)
    let drugsList = [];
    if (Array.isArray(item.drugs) && item.drugs.length > 0) {
      drugsList = item.drugs;
    } else {
      if (item.drug1) drugsList.push(item.drug1);
      if (item.drug2) drugsList.push(item.drug2);
      if (item.drug3) drugsList.push(item.drug3);
    }

    // محاسبه مقادیر برای وزن فعلی بیمار
    const calculatedDrugs = drugsList.map(d => {
      let vol = '-';
      if (typeof d.calc === 'function') {
        vol = d.calc(currentPatientWeight);
      } else if (d.vol) {
        vol = d.vol;
      }
      return {
        id: d.id,
        name: d.name,
        vol: vol,
        rule: d.rule || ''
      };
    });

    let totalVolStr = null;
    if (typeof item.totalSyringeVol === 'function') {
      totalVolStr = item.totalSyringeVol(currentPatientWeight);
    } else if (typeof item.totalSyringeVol === 'string') {
      totalVolStr = item.totalSyringeVol;
    }

    let syringeVolumeBox = '';
    if (isCompatible) {
      syringeVolumeBox = `
        <div class="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 text-white p-3.5 sm:p-4 rounded-2xl border border-emerald-500/40 shadow-sm mb-3">
          <div class="flex items-center justify-between flex-wrap gap-2 mb-2 pb-2 border-b border-emerald-800/40">
            <div class="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
              <i data-lucide="syringe" class="w-4 h-4 text-emerald-400"></i>
              <span>محاسبه حجم کشیدن در سرنگ (برای بیمار ${currentPatientWeight} کیلوگرم):</span>
            </div>
            <span class="text-xs bg-emerald-500/20 text-emerald-200 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold">
              ${item.species_label || 'چندگونه‌ای'}
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-${Math.min(calculatedDrugs.length + (totalVolStr ? 1 : 0), 4)} gap-2 text-center text-xs">
            ${calculatedDrugs.map(cd => `
              <div class="bg-white/5 p-2 rounded-xl border border-white/10">
                <span class="text-[11px] text-emerald-300 block mb-0.5 truncate" title="${cd.name}">${cd.name}:</span>
                <span class="font-mono font-black text-lg text-emerald-400">${cd.vol} cc</span>
                <span class="text-[9px] text-slate-400 block mt-0.5">${cd.rule}</span>
              </div>
            `).join('')}

            ${totalVolStr ? `
              <div class="bg-emerald-500/20 p-2 rounded-xl border border-emerald-400/30">
                <span class="text-[11px] text-white font-bold block mb-0.5">کل حجم داخل سرنگ:</span>
                <span class="font-mono font-black text-xl text-emerald-300">${totalVolStr} ${totalVolStr.includes('cc') || totalVolStr.includes('کیسه') ? '' : 'cc'}</span>
                <span class="text-[9px] text-emerald-200 block mt-0.5">مخلوط یک سرنگ</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    } else {
      syringeVolumeBox = `
        <div class="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 shadow-sm mb-3">
          <div class="flex items-center justify-between gap-2 mb-2 text-xs font-bold text-amber-300">
            <span class="flex items-center gap-1.5">
              <i data-lucide="info" class="w-4 h-4 text-amber-400"></i>
              <span>دوزهای جداگانه (برای بیمار ${currentPatientWeight} کیلوگرم):</span>
            </span>
            <span class="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">مسیرها یا سرنگ‌های مجزا</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-${Math.min(calculatedDrugs.length, 3)} gap-2 text-center text-xs">
            ${calculatedDrugs.map(cd => `
              <div class="bg-white/5 p-2 rounded-xl border border-white/10">
                <span class="text-[11px] text-slate-300 block mb-0.5">${cd.name}:</span>
                <span class="font-mono font-black text-base text-teal-300">${cd.vol} cc</span>
                <span class="text-[9px] text-slate-400 block mt-0.5">${cd.rule}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    return `
      <div class="bg-white rounded-3xl p-5 border border-indigo-100/90 shadow-sm hover:shadow-md transition">
        
        <!-- هدر کوکتل -->
        <div class="flex items-start justify-between gap-3 mb-3 flex-wrap">
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="text-base font-black text-indigo-950">${item.title}</h4>
              ${statusPill}
            </div>
            <p class="text-xs text-slate-500 mt-0.5">${item.subtitle}</p>
          </div>
          <div class="flex items-center gap-1 flex-wrap">
            ${(item.tags || []).map(t => `<span class="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">${t}</span>`).join('')}
          </div>
        </div>

        <!-- کادر محاسبه حجم زنده سرنگ برای وزن بیمار -->
        ${syringeVolumeBox}

        <!-- نسبت و راهنمای اختلاط -->
        <div class="bg-indigo-50/70 border border-indigo-200/80 p-3 rounded-2xl mb-3 text-xs leading-relaxed text-indigo-950">
          <span class="font-black block mb-0.5">📌 نسبت و پروتکل تجویز:</span>
          <p>${item.ratio_guide}</p>
        </div>

        <!-- مزایا و برتری‌های بالینی -->
        <div class="bg-emerald-50/60 border border-emerald-100 p-3 rounded-2xl mb-3 text-xs text-emerald-950">
          <span class="font-black text-emerald-900 block mb-1.5 flex items-center gap-1">
            <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>
            <span>مزایا و خوبی‌های این ترکیب بالینی:</span>
          </span>
          <ul class="space-y-1 text-[11px]">
            ${item.benefits.map(b => `<li class="flex items-start gap-1.5"><span class="text-emerald-600 font-bold">•</span><span>${b}</span></li>`).join('')}
          </ul>
        </div>

        <!-- هشدار و احتیاطات -->
        ${item.warnings ? `
          <div class="bg-amber-50/70 border border-amber-200/80 p-3 rounded-2xl text-xs text-amber-950 flex items-start gap-2 mb-3">
            <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-600 shrink-0 mt-0.5"></i>
            <div>
              <span class="font-bold">هشدار بالینی:</span>
              <p class="text-[11px] text-amber-900 mt-0.5">${item.warnings}</p>
            </div>
          </div>
        ` : ''}

        <!-- فوتر کوکتل با اکشن‌های مونوگراف و ریورسال -->
        <div class="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-100 text-xs">
          <div class="flex items-center gap-1.5 flex-wrap">
            ${item.species_label ? `<span class="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">گونه: ${item.species_label}</span>` : ''}
            ${item.reversal ? `<span class="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 border border-purple-200">🛡️ پادزهر/ریورسال: ${item.reversal}</span>` : ''}
          </div>
          <div class="flex items-center gap-1.5 flex-wrap">
            ${calculatedDrugs.filter(d => d.id).map(d => `
              <button onclick="closeCocktailsModal(); openMonographModal('${d.id}')" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition">
                مونوگراف ${d.name.split(' ')[0]}
              </button>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  }).join('');

  if (window.lucide) lucide.createIcons();
}


// =================================================================
// موتور و سیستم تصمیم‌یار بالینی اورژانس مسمومیت‌ها و پادزهرها
// Veterinary Acute Toxicology & Poison Protocols Engine
// =================================================================

var currentToxicologyTab = 'chocolate';
var currentToxicologyWeight = 10;
var currentChocolateGrams = 50;
var currentChocolateType = 'dark_med';

var CHOCOLATE_TYPES_META = {
  cocoa_powder: { name: 'پودر کاکائو خالص تلخ (Cocoa Powder)', rate: 28.5, desc: 'سمیت فوق‌العاده شدید و کشنده حتی در مقادیر کم' },
  bakers: { name: 'شکلات تخته‌ای سیاه قنادی بدون شکر (Baker\'s)', rate: 14.0, desc: 'سمیت بسیار بالا به دلیل غلظت بالای کاکائو' },
  dark_high: { name: 'شکلات تلخ بالای ۸۰٪ (Dark Chocolate >80%)', rate: 9.0, desc: 'سمیت بالا و نیازمند سم‌زدایی سریع' },
  dark_med: { name: 'شکلات تلخ و نیمه‌شیرین ۶۰-۷۰٪ (Semi-Sweet)', rate: 5.5, desc: 'سمیت متوسط تا بالا در سگ‌های کوچک و متوسط' },
  milk: { name: 'شکلات شیری معمولی (Milk Chocolate)', rate: 2.1, desc: 'سمیت در مقادیر بالا (تخته‌ای کامل)' },
  white: { name: 'شکلات سفید (White Chocolate)', rate: 0.1, desc: 'سمیت تئوبرومین بسیار ناچیز؛ خطر پانکراتیت به علت چربی' }
};

function openToxicologyModal(initialTab = 'chocolate') {
  const modal = document.getElementById('toxicologyModal');
  if (!modal) return;

  currentToxicologyWeight = (typeof currentPatientWeight !== 'undefined' && currentPatientWeight > 0) ? currentPatientWeight : 10;
  const wInput = document.getElementById('toxicologyWeight');
  if (wInput) wInput.value = currentToxicologyWeight;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  switchToxicologyTab(initialTab);
}

function closeToxicologyModal() {
  const modal = document.getElementById('toxicologyModal');
  if (modal) modal.classList.add('hidden');
  document.body.style.overflow = 'auto';
}

function onToxicologyWeightChange(val) {
  const parsed = parseFloat(val);
  if (!isNaN(parsed) && parsed > 0) {
    currentToxicologyWeight = parsed;
    renderToxicologyTab(currentToxicologyTab, currentToxicologyWeight);
  }
}

function switchToxicologyTab(tabName) {
  currentToxicologyTab = tabName;

  const nav = document.getElementById('toxicologyTabNav');
  if (nav) {
    nav.querySelectorAll('.toxtab-pill').forEach(btn => {
      const t = btn.getAttribute('data-toxtab');
      if (t === tabName) {
        btn.className = 'toxtab-pill active px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 whitespace-nowrap bg-amber-500 text-slate-950 shadow-sm';
      } else {
        btn.className = 'toxtab-pill px-3 py-1.5 rounded-xl font-medium transition flex items-center gap-1.5 whitespace-nowrap bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700';
      }
    });
  }

  renderToxicologyTab(tabName, currentToxicologyWeight);
}

function setChocolateAmountPreset(grams) {
  currentChocolateGrams = grams;
  const inp = document.getElementById('chocGramsInput');
  if (inp) inp.value = grams;
  calculateChocolateToxicity();
}

function onChocolateTypeChange(type) {
  currentChocolateType = type;
  calculateChocolateToxicity();
}

function onChocolateGramsChange(val) {
  const parsed = parseFloat(val);
  if (!isNaN(parsed) && parsed >= 0) {
    currentChocolateGrams = parsed;
    calculateChocolateToxicity();
  }
}

function calculateChocolateToxicity() {
  const w = currentToxicologyWeight || 10;
  const typeMeta = CHOCOLATE_TYPES_META[currentChocolateType] || CHOCOLATE_TYPES_META.dark_med;
  const totalTheobromine = currentChocolateGrams * typeMeta.rate;
  const mgPerKg = totalTheobromine / w;

  const displayMg = document.getElementById('chocResultTotalMg');
  const displayDose = document.getElementById('chocResultMgKg');
  const alertBox = document.getElementById('chocAlertBox');
  const actionPlanBox = document.getElementById('chocActionPlan');

  if (displayMg) displayMg.textContent = Math.round(totalTheobromine) + ' mg';
  if (displayDose) displayDose.textContent = mgPerKg.toFixed(1) + ' mg/kg';

  if (!alertBox || !actionPlanBox) return;

  let severity = 'mild';
  let badgeColor = '';
  let title = '';
  let desc = '';

  if (mgPerKg < 20) {
    severity = 'mild';
    badgeColor = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-900';
    title = '🟢 سطح مسمومیت خفیف (Mild Toxicity - خطر قلبی کم)';
    desc = 'علائم بالینی عمدتاً محدود به اختلالات گوارشی گذرا (استفراغ، اسهال، ترشح بزاق و پرنوشی) است. پایش بیمار برای ۱۲ الی ۲۴ ساعت کافی است و معمولاً نیاز به بستری نیست.';
  } else if (mgPerKg >= 20 && mgPerKg < 40) {
    severity = 'moderate';
    badgeColor = 'bg-amber-500/10 border-amber-500/40 text-amber-950';
    title = '🟡 سطح مسمومیت متوسط (Cardiotoxic Risk - خطر قلبی)';
    desc = 'ریسک بالای بروز تاکی‌کاردی، پرتحرکی، له‌له‌زدن شدید، بی‌قراری و فشار خون بالا. انجام سم‌زدایی فوری گوارشی و پایش مداوم ضربان قلب و نوار قلب (ECG) الزامی است.';
  } else if (mgPerKg >= 40 && mgPerKg < 60) {
    severity = 'severe';
    badgeColor = 'bg-orange-500/15 border-orange-500/50 text-orange-950';
    title = '🟠 سطح مسمومیت شدید قلبی-عصبی (Severe Toxicity)';
    desc = 'خطر جدی بروز آریتمی‌های بطنی (VPCs, V-Tach)، لرزش‌های عضلانی شدید، هایپرترمی، آتاکسی و سفتی اندام‌ها. بیمار نیازمند بستری در ICU، سم‌زدایی تهاجمی و مانیتورینگ قلبی است.';
  } else {
    severity = 'critical';
    badgeColor = 'bg-rose-500/15 border-rose-500/60 text-rose-950';
    title = '🔴 سطح بحرانی و تهدیدکننده حیات (Potentially Lethal)';
    desc = 'خطر ایست ناگهانی قلب، تشنج‌های مکرر مداوم مقاوم به درمان، هایپرترمی بدخیم، نارسایی کلیه و مرگ. مداخله فوری سم‌زدایی تهاجمی، ضدتشنج، مایع‌درمانی دوبل و پایش ICU الزامی است.';
  }

  alertBox.className = 'p-4 rounded-2xl border transition ' + badgeColor;
  alertBox.innerHTML = `
    <div class="flex items-center gap-2 mb-1.5">
      <span class="text-sm font-black">${title}</span>
    </div>
    <p class="text-xs leading-relaxed">${desc}</p>
  `;

  const charcoalGrams = Math.round(w * 1.5);
  const fluidRate = Math.round(w * 4);
  const apomorphineDose = (w * 0.03).toFixed(2);

  actionPlanBox.innerHTML = `
    <div class="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
      <h4 class="font-bold text-slate-800 text-xs flex items-center gap-2 border-b border-slate-100 pb-2">
        <i data-lucide="clipboard-list" class="w-4 h-4 text-amber-600"></i>
        <span>پروتکل گام‌به‌گام نجات بالینی برای بیمار ${w} کیلوگرمی:</span>
      </h4>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span class="font-bold text-slate-900 block mb-1">۱. القای استفراغ (زمان بلع کمتر از ۲ ساعت):</span>
          <p class="text-slate-600 text-[11px] leading-relaxed">
            • <strong>آپومورفین در سگ:</strong> دوز ${apomorphineDose} mg وریدی (IV) یا داخل چشم؛ استفراغ ظرف ۱ تا ۲ دقیقه ایجاد می‌شود.
            <br>• در صورت خواب‌آلودگی یا تشنج، القای استفراغ مطلقاً ممنوع است.
          </p>
        </div>
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span class="font-bold text-slate-900 block mb-1">۲. زغال فعال دارویی (جاذب روده):</span>
          <p class="text-slate-600 text-[11px] leading-relaxed">
            • دوز اول: <strong>${charcoalGrams} گرم زغال فعال</strong> در آب همراه با سوربیتول مسهل.
            <br>• در دوزهای بالای شکلات، زغال فعال <strong>هر ۴ تا ۶ ساعت بدون مسهل تکرار شود</strong> (تئوبرومین چرخه روده‌ای-کبدی دارد).
          </p>
        </div>
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span class="font-bold text-slate-900 block mb-1">۳. مایع‌درمانی وریدی (تسریع دفع):</span>
          <p class="text-slate-600 text-[11px] leading-relaxed">
            • سرم رینگر لاکتات یا نرمال سالین با سرعت <strong>${fluidRate} mL/hr</strong> (دو برابر نرخ نگهداری) جهت دیورز اسموتیک و پیشگیری از نارسایی کلیه.
          </p>
        </div>
        <div class="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
          <span class="font-bold text-slate-900 block mb-1">۴. پایش ادرار و کنترل تاکی‌آریتمی:</span>
          <p class="text-slate-600 text-[11px] leading-relaxed">
            • <strong>هشدار بازجذب ادراری:</strong> تئوبرومین از مخاط مثانه بازجذب می‌شود؛ ادرار مکرر یا تعبیه سوند ادراری الزامی است.
            <br>• تاکی‌کاردی شدید: پروپرانولول (0.02-0.06 mg/kg IV) یا اسمولول. لرزش: متوکاربامول یا دیازپام.
          </p>
        </div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

function renderToxicologyTab(tabName, weight) {
  const container = document.getElementById('toxicologyContent');
  if (!container) return;

  const w = weight || 10;

  if (tabName === 'chocolate') {
    container.innerHTML = `
      <!-- پنل محاسبه‌گر شکلات -->
      <div class="bg-white p-4 sm:p-5 rounded-3xl border border-amber-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
              🍫
            </div>
            <div>
              <h4 class="font-black text-slate-800 text-sm">محاسبه‌گر بالینی سمیت شکلات و متیل‌گزانتین‌ها</h4>
              <p class="text-[11px] text-slate-400">ارزیابی خطر تئوبرومین و کافئین بر اساس وزن بیمار و نوع شکلات مصرفی</p>
            </div>
          </div>
          <span class="text-xs bg-amber-100 text-amber-900 font-bold px-2.5 py-1 rounded-xl font-mono">وزن: ${w} kg</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <!-- انتخاب نوع شکلات -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">نوع شکلات خورده‌شده:</label>
            <select id="chocTypeSelect" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs" onchange="onChocolateTypeChange(this.value)">
              ${Object.entries(CHOCOLATE_TYPES_META).map(([key, meta]) => `
                <option value="${key}" ${key === currentChocolateType ? 'selected' : ''}>${meta.name} (${meta.rate} mg/g)</option>
              `).join('')}
            </select>
            <p class="text-[10px] text-slate-400 mt-1">تئوبرومین و کافئین در کاکائوی تیره به مراتب بیشتر از شکلات شیری است.</p>
          </div>

          <!-- مقدار شکلات به گرم -->
          <div>
            <label class="block font-bold text-slate-700 mb-1">مقدار مصرفی (گرم):</label>
            <div class="flex items-center gap-2">
              <input type="number" id="chocGramsInput" value="${currentChocolateGrams}" min="1" step="5" class="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-black font-mono text-slate-900 text-sm latin-text" oninput="onChocolateGramsChange(this.value)">
              <span class="text-xs font-bold text-slate-500 whitespace-nowrap">گرم</span>
            </div>
            <!-- دکمه‌های مقدار سریع -->
            <div class="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
              <button onclick="setChocolateAmountPreset(25)" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">۲۵g (تکه کوچک)</button>
              <button onclick="setChocolateAmountPreset(50)" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">۵۰g (نصف تخته)</button>
              <button onclick="setChocolateAmountPreset(100)" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">۱۰۰g (۱ تخته کامل)</button>
              <button onclick="setChocolateAmountPreset(200)" class="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">۲۰۰g (بزرگ)</button>
            </div>
          </div>
        </div>

        <!-- کارت خروجی زنده دوز مصرفی -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div class="bg-amber-50/70 p-3 rounded-2xl border border-amber-200">
            <span class="text-amber-800 text-[11px] block">کل تئوبرومین بلعیده‌شده:</span>
            <span id="chocResultTotalMg" class="text-lg font-black font-mono text-amber-950 latin-text">-- mg</span>
          </div>
          <div class="bg-amber-50/70 p-3 rounded-2xl border border-amber-200">
            <span class="text-amber-800 text-[11px] block">دوز به ازای هر کیلوگرم:</span>
            <span id="chocResultMgKg" class="text-lg font-black font-mono text-amber-950 latin-text">-- mg/kg</span>
          </div>
          <div class="bg-slate-50 p-3 rounded-2xl border border-slate-200 col-span-2 sm:col-span-1">
            <span class="text-slate-600 text-[11px] block">آستانه سمیت قلبی:</span>
            <span class="text-xs font-bold text-slate-800">شروع از ۲۰ mg/kg</span>
          </div>
        </div>

        <!-- کادر هشدار شدت خطر -->
        <div id="chocAlertBox"></div>

        <!-- طرح اقدام بالینی -->
        <div id="chocActionPlan"></div>
      </div>
    `;

    calculateChocolateToxicity();
  } else if (tabName === 'rodenticide') {
    const vitKDoseMin = (w * 2.5).toFixed(1);
    const vitKDoseMax = (w * 5.0).toFixed(1);
    const vitKTab25 = Math.ceil((w * 3.5) / 25);
    const vitKScVolMin = (w * 0.25).toFixed(1);
    const vitKScVolMax = (w * 0.5).toFixed(1);

    container.innerHTML = `
      <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-700 flex items-center justify-center font-bold">
              🐀
            </div>
            <div>
              <h4 class="font-black text-slate-800 text-sm">پروتکل تریاژ و درمان مسمومیت با مرگ موش و جونده‌کش‌ها</h4>
              <p class="text-[11px] text-slate-400">Anticoagulant Rodenticides, Cholecalciferol, Bromethalin, Zinc Phosphide</p>
            </div>
          </div>
          <button onclick="closeToxicologyModal(); openMonographModal('vitamin_k1');" class="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition">
            📋 مشاهده مونوگراف ویتامین K1
          </button>
        </div>

        <!-- کارت خط قرمز مرگبار -->
        <div class="bg-rose-50 border border-rose-300 p-3.5 rounded-2xl text-rose-950 flex items-start gap-2.5">
          <i data-lucide="alert-octagon" class="w-5 h-5 text-rose-600 shrink-0 mt-0.5"></i>
          <div>
            <span class="font-black text-xs text-rose-900">⛔ هشدارهای خط قرمز مرگبار ویتامین K1:</span>
            <p class="text-[11px] text-rose-800 mt-0.5 leading-relaxed">
              ۱. <strong>تزریق داخل وریدی (IV) سریع مطلقاً ممنوع است:</strong> شوک آنافیلاکسی فوق‌العاده کشنده و کلاپس آنی قلبی ایجاد می‌کند.
              <br>۲. <strong>تزریق داخل عضلانی (IM) ممنوع است:</strong> به دلیل اختلال انعقادی، هماتوم‌های کشنده عضلانی در محل تزریق ایجاد می‌شود.
              <br>۳. <strong>مسیرهای مجاز:</strong> فقط خوراکی (PO) همراه با غذای چرب یا تزریق زیرجلدی (SC) با سوزن باریک (گیج ۲۵) در چند نقطه.
            </p>
          </div>
        </div>

        <!-- محاسبه‌گر دوز اختصاصی ویتامین K1 -->
        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
          <h5 class="font-bold text-slate-800 text-xs flex items-center gap-2">
            <i data-lucide="calculator" class="w-4 h-4 text-emerald-600"></i>
            <span>محاسبه دوز دقیق ویتامین K1 برای بیمار ${w} کیلوگرمی:</span>
          </h5>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="bg-white p-3 rounded-xl border border-slate-200">
              <span class="text-slate-500 text-[11px] block">دوز روزانه تام (mg):</span>
              <span class="text-base font-black font-mono text-emerald-800 latin-text">${vitKDoseMin} الی ${vitKDoseMax} mg/day</span>
              <span class="text-[10px] text-slate-400 block mt-0.5">بر اساس ۲.۵ الی ۵ mg/kg/day</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-slate-200">
              <span class="text-slate-500 text-[11px] block">تعداد کپسول/قرص ۲۵ میلی‌گرم:</span>
              <span class="text-base font-black font-mono text-indigo-800 latin-text">حدود ${vitKTab25} عدد قرص در روز</span>
              <span class="text-[10px] text-slate-400 block mt-0.5">منقسم به ۲ وعده همراه با غذای چرب</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-slate-200">
              <span class="text-slate-500 text-[11px] block">حجم تزریق زیرجلدی (10 mg/mL):</span>
              <span class="text-base font-black font-mono text-teal-800 latin-text">${vitKScVolMin} الی ${vitKScVolMax} mL</span>
              <span class="text-[10px] text-slate-400 block mt-0.5">تزریق SC در چند موضع با سوزن باریک</span>
            </div>
          </div>
        </div>

        <!-- راهنمای انواع جونده‌کش‌ها -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
            <span class="font-bold text-slate-900 block flex items-center gap-1.5">
              <span>۱. ضدانعقادی نسل ۲ (Brodifacoum / Bromadiolone):</span>
            </span>
            <p class="text-slate-600 text-[11px] leading-relaxed">
              • <strong>طول دوره درمان:</strong> ۲۸ الی ۳۰ روز کامل بدون وقفه.
              <br>• <strong>پایش PT/INR:</strong> ۴۸ ساعت پس از قطع آخرین دوز ویتامین K1 آزمایش پروترومبین تکرار شود؛ در صورت طولانی بودن PT، درمان ۲ هفته دیگر تمدید گردد.
            </p>
          </div>
          <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
            <span class="font-bold text-slate-900 block flex items-center gap-1.5">
              <span>۲. ضدانعقادی نسل ۱ (Warfarin):</span>
            </span>
            <p class="text-slate-600 text-[11px] leading-relaxed">
              • <strong>طول دوره درمان:</strong> ۱۴ الی ۲۱ روز همراه با غذا.
              <br>• فاکتور VII با نیمه‌عمر ۶ ساعت اولین فاکتوری است که کاهش می‌یابد؛ شروع خونریزی بالینی ۳ تا ۵ روز پس از بلع سم رخ می‌دهد.
            </p>
          </div>
        </div>
      </div>
    `;
  } else if (tabName === 'organophosphates') {
    const atropineVolMin = (w * 0.4).toFixed(1);
    const atropineVolMax = (w * 1.0).toFixed(1);
    const pamVolMin = (w * 0.4).toFixed(1);
    const pamVolMax = (w * 1.0).toFixed(1);

    container.innerHTML = `
      <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
              🌾
            </div>
            <div>
              <h4 class="font-black text-slate-800 text-sm">مسمومیت با سموم ارگانوفسفره و کاربامات‌ها (Organophosphates / Carbamates)</h4>
              <p class="text-[11px] text-slate-400">مهار آنزیم استیل‌کولین‌استراز، طوفان کولینرژیک (SLUDDE) و پروتکل استاندارد نجات</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="closeToxicologyModal(); openMonographModal('atropine');" class="text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition">
              مونوگراف آتروپین
            </button>
            <button onclick="closeToxicologyModal(); openMonographModal('pralidoxime');" class="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition">
              مونوگراف پرالیدوکسیم (2-PAM)
            </button>
          </div>
        </div>

        <!-- علائم کلاسیک SLUDDE -->
        <div class="bg-amber-50/80 border border-amber-200 p-3.5 rounded-2xl text-amber-950">
          <span class="font-bold text-xs block mb-1">طوفان کولینرژیک حاد موسکارینیک (SLUDDE Syndrome):</span>
          <p class="text-[11px] text-amber-900 leading-relaxed">
            • <strong>S</strong>alivation (ترشح مفرط بزاق کف‌آلود)، <strong>L</strong>acrimation (اشک‌ریزش)، <strong>U</strong>rination (ادرار مکرر بی‌اختیار)، <strong>D</strong>efecation (اسهال حاد)، <strong>D</strong>yspnea (اسپاسم و ترشحات مرگبار برونش ریه)، <strong>E</strong>mesis (استفراغ) و <strong>Miosis</strong> (تنگی شدید مردمک‌ها).
            <br>• علائم نیکوتینیک شامل لرزش شدید عضلانی، ضعف و فلج دیافراگم است که با آتروپین درمان نمی‌شود و نیازمند پرالیدوکسیم است!
          </p>
        </div>

        <!-- دو پروتکل استاندارد طلایی -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- پروتکل آتروپیناسیون -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <i data-lucide="syringe" class="w-4 h-4 text-amber-600"></i>
                <span>۱. پروتکل آتروپیناسیون (Atropinization):</span>
              </span>
              <span class="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full">مهار ترشحات</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <span class="text-[11px] text-slate-500 block">دوز: 0.2 الی 0.5 mg/kg</span>
              <span class="text-sm font-black font-mono text-amber-950 block latin-text">حجم سرنگ: ${atropineVolMin} الی ${atropineVolMax} mL</span>
              <span class="text-[10px] text-slate-400 block">از ویال آتروپین 0.5 mg/mL برای سگ ${w} kg</span>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              • <strong>نحوه تجویز:</strong> ۱/۴ دوز تام به صورت وریدی (IV) آهسته و مابقی عضلانی یا زیرجلدی.
              <br>• <strong>نقطه پایانی تیتراسیون (Endpoint):</strong> خشک شدن ترشحات ریه، متوقف شدن بزاق و نرمال شدن ضربان قلب (نه گشادی کامل مردمک!). هر ۱۵ الی ۳۰ دقیقه تا رسیدن به هدف تکرار شود.
            </p>
          </div>

          <!-- پروتکل پرالیدوکسیم ۲-پام -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                <i data-lucide="shield" class="w-4 h-4 text-emerald-600"></i>
                <span>۲. پرالیدوکسیم کلراید (2-PAM 50 mg/mL):</span>
              </span>
              <span class="text-[10px] bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded-full">احیای آنزیم</span>
            </div>
            <div class="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
              <span class="text-[11px] text-slate-500 block">دوز: 20 الی 50 mg/kg</span>
              <span class="text-sm font-black font-mono text-emerald-950 block latin-text">حجم سرنگ: ${pamVolMin} الی ${pamVolMax} mL</span>
              <span class="text-[10px] text-slate-400 block">از محلول 50 mg/mL رقیق با سالین در ۱۵ دقیقه</span>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              • <strong>پنجره طلایی درمان:</strong> شروع در ۲۴ الی ۳۶ ساعت اول قبل از رخ دادن پیری آنزیم (Aging).
              <br>• پرالیدوکسیم ضعف عضلانی، انقباضات فلوتر و فلج تنفسی نیکوتینیک را که آتروپین روی آن بی‌اثر است درمان می‌کند.
            </p>
          </div>
        </div>
      </div>
    `;
  } else if (tabName === 'antifreeze') {
    const ethanolLoadingVol = (w * 5.5).toFixed(1);
    const fomepizoleDose = (w * 20).toFixed(0);

    container.innerHTML = `
      <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center font-bold">
              ❄️
            </div>
            <div>
              <h4 class="font-black text-slate-800 text-sm">مسمومیت با ضدیخ خودرو (اتیلن گلیکول - Ethylene Glycol)</h4>
              <p class="text-[11px] text-slate-400">نارسایی حاد اولیگوریک کلیه، اسیدوز متابولیک شدید و پروتکل رقابتی الکل دهیدروژناز</p>
            </div>
          </div>
          <span class="text-xs bg-rose-100 text-rose-900 font-black px-2.5 py-1 rounded-xl">پنجره طلایی: سگ زیر ۸h | گربه زیر ۳h</span>
        </div>

        <!-- مراحل بالینی سمیت -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span class="font-bold text-slate-800 block text-[11px] mb-1">مرحله ۱ (۰ الی ۱۲ ساعت):</span>
            <p class="text-slate-600 text-[11px] leading-relaxed">مستی کاذب، تلوتلو خوردن، استفراغ، پلی‌اوری و پرنوشی مفرط (PU/PD) و افت دمای بدن.</p>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span class="font-bold text-slate-800 block text-[11px] mb-1">مرحله ۲ (۱۲ الی ۲۴ ساعت):</span>
            <p class="text-slate-600 text-[11px] leading-relaxed">تاکیکاردی، تنفس سریع و عمیق، اسیدوز متابولیک شدید با آنیون گپ بالا، ادم ریه.</p>
          </div>
          <div class="bg-slate-50 p-3 rounded-xl border border-slate-200">
            <span class="font-bold text-rose-800 block text-[11px] mb-1">مرحله ۳ (۲۴ الی ۷۲ ساعت):</span>
            <p class="text-rose-900 text-[11px] leading-relaxed">نارسایی حاد و برگشت‌ناپذیر اولیگوریک یا آنوریک کلیه، کریستال‌های کلسیم اگزالات منوهیدرات در ادرار، کما و مرگ.</p>
          </div>
        </div>

        <!-- پروتکل پادزهر اتانول و فومپیزول -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span class="font-bold text-slate-900 text-xs block">پروتکل اتانول ۲۰٪ دارویی (رقابت با الکل دهیدروژناز):</span>
            <div class="bg-white p-3 rounded-xl border border-slate-200">
              <span class="text-slate-500 text-[11px] block">دوز بارگیری (Loading Dose 5.5 mL/kg):</span>
              <span class="text-base font-black font-mono text-blue-900 block latin-text">${ethanolLoadingVol} mL از اتانول ۲۰٪ وریدی</span>
              <span class="text-[10px] text-slate-400 block mt-0.5">انفوزیون آهسته طی ۳۰ دقیقه، سپس دوز نگهدارنده</span>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              • تهیه محلول ۲۰٪: ۱۰۰ سی‌سی الکل مطلق دارویی + ۴۰۰ سی‌سی سرم قندی ۵٪ (D5W).
              <br>• اتانول مانع از تبدیل اتیلن گلیکول به اسید گلیکولیک و اگزالات سمی می‌شود تا سم بدون تغییر از کلیه دفع شود.
            </p>
          </div>

          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span class="font-bold text-slate-900 text-xs block">پروتکل فومپیزول (4-MP - مهارکننده اختصاصی آنزیم):</span>
            <div class="bg-white p-3 rounded-xl border border-slate-200">
              <span class="text-slate-500 text-[11px] block">دوز اولیه سگ (20 mg/kg):</span>
              <span class="text-base font-black font-mono text-purple-900 block latin-text">${fomepizoleDose} mg وریدی</span>
              <span class="text-[10px] text-slate-400 block mt-0.5">سپس ۱۵ mg/kg در ساعت ۱۲ و ۲۴</span>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              • داروی انتخابی در سگ زیرا برخلاف اتانول خواب‌آلودگی، اسیدوز و تضعیف تنفسی ایجاد نمی‌کند.
              <br>• در گربه نیازمند دوزهای بسیار بالاتر (۱۲۵ mg/kg) است؛ در گربه اتانول ارجح است.
            </p>
          </div>
        </div>
      </div>
    `;
  } else if (tabName === 'permethrin') {
    const methoVolMin = (w * 0.55).toFixed(1);
    const methoVolMax = (w * 1.0).toFixed(1);
    const ileBolusVol = (w * 1.5).toFixed(1);
    const ileCriRate = (w * 0.25).toFixed(2);

    container.innerHTML = `
      <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-700 flex items-center justify-center font-bold">
              🐱
            </div>
            <div>
              <h4 class="font-black text-slate-800 text-sm">مسمومیت کشنده گربه با قطره‌های پرمترین سگی (Feline Permethrin Toxicity)</h4>
              <p class="text-[11px] text-slate-400">لرزش‌های مداوم عضلانی، نقص گلوکورونیداسیون در کبد گربه و پروتکل طلایی نجات با ILE</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="closeToxicologyModal(); openMonographModal('methocarbamol');" class="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition">
              مونوگراف متوکاربامول
            </button>
            <button onclick="closeToxicologyModal(); openMonographModal('intralipid');" class="text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-xl border border-teal-200 transition">
              مونوگراف اینترالیپید ۲۰٪
            </button>
          </div>
        </div>

        <!-- الگوریتم سه‌مرحله‌ای نجات حیات -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <!-- گام ۱: دکونتامیناسیون پوستی -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span class="font-bold text-slate-900 block flex items-center gap-1.5 text-xs">
              <i data-lucide="bath" class="w-4 h-4 text-sky-600"></i>
              <span>گام ۱. شستشوی فوری پوست:</span>
            </span>
            <p class="text-slate-600 text-[11px] leading-relaxed">
              • شستشوی موضعی تمام بدن یا ناحیه پشت گردن با <strong>مایع ظرفشویی ملایم (Dawn)</strong> و آب ولرم جهت حل کردن چربی سم.
              <br>• ⚠️ <strong>آب گرم یا داغ مطلقاً ممنوع است:</strong> عروق پوست را گشاد کرده و جذب سیستمیک پرمترین را چند برابر می‌کند.
            </p>
          </div>

          <!-- گام ۲: کنترل لرزش با متوکاربامول -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span class="font-bold text-slate-900 block flex items-center gap-1.5 text-xs">
              <i data-lucide="activity" class="w-4 h-4 text-indigo-600"></i>
              <span>گام ۲. مهار لرزش (متوکاربامول):</span>
            </span>
            <div class="bg-white p-2.5 rounded-xl border border-slate-200">
              <span class="text-[10px] text-slate-500 block">دوز: 55 الی 100 mg/kg IV آهسته</span>
              <span class="text-xs font-black font-mono text-indigo-950 block latin-text">${methoVolMin} الی ${methoVolMax} mL</span>
              <span class="text-[10px] text-slate-400 block">از آمپول 100 mg/mL برای بیمار ${w} kg</span>
            </div>
            <p class="text-slate-600 text-[11px] leading-relaxed">
              • تزریق بسیار آهسته تا مهار کامل لرزش‌ها. در صورت عدم دسترسی، دیازپام یا میدازولام با پروپوفول.
            </p>
          </div>

          <!-- گام ۳: سینک لیپیدی با اینترالیپید -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <span class="font-bold text-slate-900 block flex items-center gap-1.5 text-xs">
              <i data-lucide="droplet" class="w-4 h-4 text-teal-600"></i>
              <span>گام ۳. پادزهر ILE (سینک لیپیدی):</span>
            </span>
            <div class="bg-white p-2.5 rounded-xl border border-slate-200">
              <span class="text-[10px] text-slate-500 block">بولوس ۱.۵ mL/kg طی ۲ دقیقه:</span>
              <span class="text-xs font-black font-mono text-teal-950 block latin-text">بولوس: ${ileBolusVol} mL</span>
              <span class="text-[10px] text-slate-500 block mt-1">انفوزیون مداوم (0.25 mL/kg/min):</span>
              <span class="text-xs font-black font-mono text-teal-950 block latin-text">${ileCriRate} mL/min (برای ۳۰-۶۰ دقیقه)</span>
            </div>
            <p class="text-slate-600 text-[11px] leading-relaxed">
              • پرمترین را از غشای عصبی جدا و در فاز چربی داخل خون حبس می‌کند.
            </p>
          </div>
        </div>
      </div>
    `;
  } else if (tabName === 'nsaids') {
    const nacLoadingVol = (w * 0.7).toFixed(1);
    const nacMaintVol = (w * 0.35).toFixed(1);
    const misoDoseMcg = (w * 3).toFixed(0);

    container.innerHTML = `
      <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-700 flex items-center justify-center font-bold">
              💊
            </div>
            <div>
              <h4 class="font-black text-slate-800 text-sm">مسمومیت با مسکن‌های انسانی (استامینوفن، ایبوپروفن) و شیرین‌کننده زایلیتول</h4>
              <p class="text-[11px] text-slate-400">متهیموگلوبینمی گربه با استامینوفن، زخم‌های سوراخ‌کننده NSAIDs و هیپوگلیسمی زایلیتول</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="closeToxicologyModal(); openMonographModal('acetylcysteine');" class="text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition">
              مونوگراف استیل‌سیستئین (NAC)
            </button>
            <button onclick="closeToxicologyModal(); openMonographModal('misoprostol');" class="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-200 transition">
              مونوگراف میزوپروستول
            </button>
          </div>
        </div>

        <!-- ۳ پانل مجزای سموم انسانی -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <!-- استامینوفن در گربه -->
          <div class="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-rose-950 text-xs">🐱 استامینوفن در گربه (فوق‌العاده کشنده):</span>
              <span class="text-[10px] bg-rose-200 text-rose-900 font-bold px-1.5 py-0.5 rounded-md">متهیموگلوبینمی</span>
            </div>
            <p class="text-[11px] text-rose-900 leading-relaxed">
              گربه به دلیل کمبود آنزیم گلوکورونیل ترانسفراز حتی با نصف قرص دچار متهیموگلوبینمی، سیانوز، خون شکلاتی، ادم صورت و خفگی می‌شود.
            </p>
            <div class="bg-white p-2.5 rounded-xl border border-rose-200 space-y-1">
              <span class="text-[10px] text-slate-500 block">پادزهر N-استیل‌سیستئین (NAC 200 mg/mL):</span>
              <span class="text-xs font-black font-mono text-rose-950 block latin-text">لودینگ (140 mg/kg): ${nacLoadingVol} mL</span>
              <span class="text-xs font-black font-mono text-rose-950 block latin-text">نگهدارنده (70 mg/kg q4h): ${nacMaintVol} mL</span>
            </div>
            <p class="text-[10px] text-rose-800">ویتامین C (30 mg/kg PO/SC) نیز جهت احیای هموگلوبین اضافه شود.</p>
          </div>

          <!-- مسکن‌های NSAID انسانی -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900 text-xs">🐶 مسکن‌های NSAID (ژلوفن، ایبوپروفن):</span>
              <span class="text-[10px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded-md">اولسر و کلیه</span>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              افت شدید پروستاگلاندین‌های مخاطی، سوراخ شدن حاد معده و دوازدهه (پریتونیت کشنده) و نارسایی حاد ایسکمیک کلیه.
            </p>
            <div class="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
              <span class="text-[10px] text-slate-500 block">پروتکل سه‌گانه محافظ گوارش:</span>
              <span class="text-xs font-bold text-slate-900 block">• میزوپروستول (PGE1): ${misoDoseMcg} میکروگرم PO q8h</span>
              <span class="text-xs font-bold text-slate-900 block">• سوکرالفات: ۱ گرم PO q8h</span>
              <span class="text-xs font-bold text-slate-900 block">• امپرازول: ۱ mg/kg IV/PO q12h</span>
            </div>
            <p class="text-[10px] text-slate-500">مایع‌درمانی وریدی با سرعت دو برابر نگهداری جهت حفظ پرفیوژن کلیه.</p>
          </div>

          <!-- زایلیتول در سگ -->
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-bold text-slate-900 text-xs">🍬 شیرین‌کننده زایلیتول (Xylitol):</span>
              <span class="text-[10px] bg-purple-100 text-purple-900 font-bold px-1.5 py-0.5 rounded-md">هیپوگلیسمی حاد</span>
            </div>
            <p class="text-[11px] text-slate-600 leading-relaxed">
              شربت‌های انسانی، آدامس‌های رژیمی و خمیردندان‌ها حاوی زایلیتول در سگ ترشح ۶ برابری انسولین و نکروز حاد کبد ایجاد می‌کنند.
            </p>
            <div class="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
              <span class="text-[10px] text-slate-500 block">پروتکل درمانی نجات:</span>
              <span class="text-xs font-bold text-purple-950 block">• بولوس دکستروز ۵۰٪: ۱ mL/kg رقیق با سالین</span>
              <span class="text-xs font-bold text-purple-950 block">• سرم قندی ۲.۵ تا ۵٪ مداوم (CRI)</span>
              <span class="text-xs font-bold text-purple-950 block">• پایش قند خون بیمار هر ۱ الی ۲ ساعت</span>
            </div>
            <p class="text-[10px] text-slate-500">زغال فعال در جذب زایلیتول اثربخشی پایینی دارد؛ تمرکز بر گلوکز و محافظت کبد باشد.</p>
          </div>
        </div>
      </div>
    `;
  } else if (tabName === 'antidotes') {
    container.innerHTML = renderAntidotesTableHtml(w);
  }

  if (window.lucide) lucide.createIcons();
}

function renderAntidotesTableHtml(weight) {
  const w = weight || 10;

  const antidotes = [
    {
      name: 'فومپیزول / ۴-متیل‌پیرازول (Fomepizole 4-MP 1000 mg/mL)',
      target: 'پادزهر اختصاصی مسمومیت اتیلن گلیکول (ضدیخ خودرو) و متانول',
      dose: 'سگ: 20 mg/kg لودینگ | گربه: 125 mg/kg',
      vol: 'سگ: ' + (w * 0.02).toFixed(2) + ' mL | گربه: ' + (w * 0.125).toFixed(2) + ' mL',
      route: 'IV آهسته رقیق‌شده در سالین طی ۱۵ دقیقه در ساعت‌های ۰، ۱۲، ۲۴، ۳۶',
      drugId: 'fomepizole'
    },
    {
      name: 'نالوکسان هیدروکلراید (Naloxone HCl 0.4 mg/mL)',
      target: 'پادزهر اورژانسی اوردوز اوپیوئیدها (مورفین، متادون، فنتانیل، ترامادول)',
      dose: '0.02 الی 0.04 mg/kg',
      vol: (w * 0.05).toFixed(2) + ' الی ' + (w * 0.1).toFixed(2) + ' mL',
      route: 'IV آهسته، IM یا قطره زیرزبانی نوزادان سزارینی',
      drugId: 'naloxone'
    },
    {
      name: 'فلومازنیل (Flumazenil 0.1 mg/mL)',
      target: 'پادزهر اختصاصی بنزودیازپین‌ها (میدازولام، دیازپام، زولپیدم)',
      dose: '0.01 الی 0.02 mg/kg',
      vol: (w * 0.1).toFixed(1) + ' الی ' + (w * 0.2).toFixed(1) + ' mL',
      route: 'IV آهسته طی ۱ تا ۲ دقیقه (در مسمومیت همزمان TCA ممنوع)',
      drugId: 'flumazenil'
    },
    {
      name: 'آپومورفین (Apomorphine 5 mg/mL / Sublingual)',
      target: 'داروی خط اول تخلیه اورژانسی معده و القای استفراغ سگ ظرف ۲ تا ۵ دقیقه',
      dose: '0.03 الی 0.04 mg/kg IV یا ۱ قطره ملتحمه چشم',
      vol: (w * 0.007).toFixed(2) + ' mL وریدی یا موضعی چشم',
      route: 'وریدی یا کیسه ملتحمه چشم (شستشو با سالین بلافاصله پس از استفراغ)',
      drugId: 'apomorphine_sublingual'
    },
    {
      name: 'آتروپین سولفات (Atropine Sulfate 0.5 mg/mL)',
      target: 'سموم ارگانوفسفره، کاربامات‌ها و برادی‌کاردی شدید واگال',
      dose: '0.2 الی 0.5 mg/kg',
      vol: (w * 0.4).toFixed(1) + ' الی ' + (w * 1.0).toFixed(1) + ' mL',
      route: '۱/۴ دوز IV آهسته، باقیمانده IM یا SC',
      drugId: 'atropine'
    },
    {
      name: 'پرالیدوکسیم کلراید ۲-پام (Pralidoxime 2-PAM 50 mg/mL)',
      target: 'حشره‌کش‌های ارگانوفسفره (احیای کولین‌استراز و رفع فلج تنفس)',
      dose: '20 الی 50 mg/kg',
      vol: (w * 0.4).toFixed(1) + ' الی ' + (w * 1.0).toFixed(1) + ' mL',
      route: 'IV آهسته در ۱۵ دقیقه یا IM هر ۸-۱۲ ساعت (زیر ۲۴ ساعت اول)',
      drugId: 'pralidoxime'
    },
    {
      name: 'N-استیل‌سیستئین (N-Acetylcysteine 200 mg/mL)',
      target: 'مسمومیت استامینوفن (به‌ویژه گربه) و نارسایی حاد کبدی',
      dose: '140 mg/kg لودینگ، سپس 70 mg/kg q4h',
      vol: 'لودینگ: ' + (w * 0.7).toFixed(1) + ' mL (رقیق در سالین)',
      route: 'IV رقیق با فیلتر در ۲۰ دقیقه، یا خوراکی',
      drugId: 'acetylcysteine'
    },
    {
      name: 'ویتامین K1 فیتونادیون (Vitamin K1 10 mg/mL)',
      target: 'مرگ موش و جونده‌کش‌های ضدانعقادی (برودیفاکوم و وارفارین)',
      dose: '2.5 الی 5 mg/kg/day',
      vol: (w * 0.25).toFixed(1) + ' الی ' + (w * 0.5).toFixed(1) + ' mL',
      route: 'SC با سوزن گیج باریک در چند نقطه یا خوراکی با غذای چرب (IV ممنوع!)',
      drugId: 'vitamin_k1'
    },
    {
      name: 'متوکاربامول روباکسین (Methocarbamol 100 mg/mL)',
      target: 'مسمومیت حاد گربه با پرمترین سگی، استریکنین و اسپاسم IVDD',
      dose: '55 الی 100 mg/kg',
      vol: (w * 0.55).toFixed(1) + ' الی ' + (w * 1.0).toFixed(1) + ' mL',
      route: 'IV آهسته تا توقف لرزش‌های عضلانی',
      drugId: 'methocarbamol'
    },
    {
      name: 'اینترالیپید و امولسیون چربی ۲۰٪ (Intralipid 20% ILE)',
      target: 'سموم شدیداً لیپوفیل (پرمترین، آیورمکتین، موکسیدکتین، لیدوکائین)',
      dose: '1.5 mL/kg بولوس، سپس 0.25 mL/kg/min',
      vol: 'بولوس: ' + (w * 1.5).toFixed(1) + ' mL | سپس ' + (w * 0.25).toFixed(2) + ' mL/min',
      route: 'IV با ست سرم فیلتردار طی ۳۰ تا ۶۰ دقیقه',
      drugId: 'intralipid'
    },
    {
      name: 'زغال فعال دارویی سوسپانسیون (Activated Charcoal)',
      target: 'جاذب عمومی سموم خوراکی، شکلات، مسکن‌های NSAID، رودنتیسید',
      dose: '1 الی 2 g/kg',
      vol: Math.round(w * 1.5) + ' گرم پودر در ۵ برابر آب',
      route: 'خوراکی (PO) با سرنگ یا سوند معدی؛ دوز اول با سوربیتول',
      drugId: 'activated_charcoal'
    },
    {
      name: 'اتانول ۲۰٪ دارویی (Ethanol 20% IV)',
      target: 'مسمومیت با ضدیخ (اتیلن گلیکول)',
      dose: '5.5 mL/kg لودینگ',
      vol: (w * 5.5).toFixed(1) + ' mL (محلول ۲۰٪ با D5W)',
      route: 'IV آهسته طی ۳۰ دقیقه، سپس CRI',
      drugId: ''
    },
    {
      name: 'آپومورفین هیدروکلراید (Apomorphine 10 mg/mL)',
      target: 'القا فوری استفراغ در سگ (بلع سموم زیر ۲ ساعت)',
      dose: '0.03 الی 0.04 mg/kg',
      vol: (w * 0.003).toFixed(2) + ' mL',
      route: 'IV آهسته (القا در ۱ دقیقه)؛ در گربه ممنوع است',
      drugId: 'apomorphine'
    },
    {
      name: 'آتیپامزول آنتی‌سدان (Atipamezole 5 mg/mL)',
      target: 'پادزهر و برگشت‌دهنده دکسمدتومازین، مدتومازین و زایلازین',
      dose: '۵ برابر دوز دکسمدتومازین',
      vol: (w * 0.05).toFixed(2) + ' الی ' + (w * 0.1).toFixed(2) + ' mL',
      route: 'عضلانی (IM)؛ تزریق وریدی سریع اجتناب شود',
      drugId: 'atipamezole'
    },
    {
      name: 'نالوکسان هیدروکلراید (Naloxone 0.4 mg/mL)',
      target: 'پادزهر اوپیوئیدها (ترامادول، مرفین، فنتانیل، متادون)',
      dose: '0.02 الی 0.04 mg/kg',
      vol: (w * 0.05).toFixed(2) + ' الی ' + (w * 0.1).toFixed(2) + ' mL',
      route: 'IV / IM / SC (تکرار هر ۲۰-۳۰ دقیقه در صورت نیاز)',
      drugId: 'naloxone'
    },
    {
      name: 'فلومازنیل (Flumazenil 0.1 mg/mL)',
      target: 'پادزهر بنزودیازپین‌ها (دیازپام، میدازولام، آلپرازولام)',
      dose: '0.01 الی 0.02 mg/kg',
      vol: (w * 0.1).toFixed(1) + ' الی ' + (w * 0.2).toFixed(1) + ' mL',
      route: 'IV آهسته',
      drugId: 'flumazenil'
    },
    {
      name: 'کلسیم گلوکونات ۱۰٪ (Calcium Gluconate 10%)',
      target: 'محافظ قلب در هیپرکالمی شدید، مسمومیت کلسیم چنل بلوکرها، تب شیر',
      dose: '0.5 الی 1.0 mL/kg',
      vol: (w * 0.5).toFixed(1) + ' الی ' + (w * 1.0).toFixed(1) + ' mL',
      route: 'IV بسیار آهسته تحت مانیتورینگ ECG (توقف در صورت برادی‌کاردی)',
      drugId: 'calcium_borogluconate'
    }
  ];

  return `
    <div class="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div class="flex items-center justify-between flex-wrap gap-2 border-b border-slate-100 pb-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center font-bold">
            🛡️
          </div>
          <div>
            <h4 class="font-black text-slate-800 text-sm">اطلس و فرمولاری جامع پادزهرهای اورژانس دامپزشکی</h4>
            <p class="text-[11px] text-slate-400">محاسبه آنی حجم سرنگ (mL) تمام پادزهرها برای بیمار ${w} کیلوگرمی</p>
          </div>
        </div>
        <span class="text-xs bg-emerald-100 text-emerald-900 font-bold px-2.5 py-1 rounded-xl font-mono">وزن فعال: ${w} kg</span>
      </div>

      <div class="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
        <table class="w-full text-right text-xs">
          <thead class="bg-slate-900 text-white text-[11px]">
            <tr>
              <th class="p-3">پادزهر و فرمولاسیون</th>
              <th class="p-3">سم یا داروی هدف</th>
              <th class="p-3">دوز پلامبز</th>
              <th class="p-3 text-center text-emerald-300 font-black">حجم سرنگ (${w} kg)</th>
              <th class="p-3">مسیر و احتیاطات</th>
              <th class="p-3 text-center">مونوگراف</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            ${antidotes.map(item => `
              <tr class="hover:bg-slate-50 transition">
                <td class="p-3 font-bold text-slate-900">${item.name}</td>
                <td class="p-3 text-slate-600">${item.target}</td>
                <td class="p-3 font-mono text-[11px] text-slate-700 latin-text">${item.dose}</td>
                <td class="p-3 text-center font-black font-mono text-emerald-700 bg-emerald-50/50 latin-text">${item.vol}</td>
                <td class="p-3 text-[11px] text-slate-500">${item.route}</td>
                <td class="p-3 text-center">
                  ${item.drugId ? `
                    <button onclick="closeToxicologyModal(); openMonographModal('${item.drugId}')" class="px-2.5 py-1 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-lg border border-teal-200 text-[11px] transition">
                      مشاهده
                    </button>
                  ` : `
                    <span class="text-slate-300 text-[10px]">بیمارستانی</span>
                  `}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}


// =================================================================
// موتور محاسباتی مساحت سطح بدن (BSA) و شیمی‌درمانی انکولوژی پلامبز
// Veterinary Oncology & Body Surface Area (BSA) Chemotherapy Engine
// =================================================================

function calculateBSA(weight, species = 'canine') {
  const w = parseFloat(weight);
  if (isNaN(w) || w <= 0) return 0;
  const k = (species === 'feline' || species === 'cat') ? 10.0 : 10.1;
  // فرمول پلامبز: K * (W ^ (2/3)) / 100
  return (k * Math.pow(w, 2 / 3)) / 100;
}

var ONCO_DRUG_PRESETS = {
  vincristine: {
    name: 'وینکریستین سولفات (Vincristine Sulfate)',
    doseRate: 0.7,
    unit: 'mg_m2',
    stockConc: 1.0,
    syringeType: 'سرنگ ۱ یا ۲.۵ سی‌سی با سوزن گیج باریک',
    smallDogNote: 'در سگ‌های زیر ۱۰ کیلوگرم، دوز 0.02 mg/kg جایگزین mg/m² شود تا از میلوتوکسیسیتی مفرط جلوگیری گردد.',
    safetyAdvice: '⚠️ وزیکانت شدید (Vesicant): نشت زیرجلدی مساوی با اسلافینگ بافت و خطر قطع عضو. در نژادهای موتاسیون MDR1 (کولی، استرالین شپرد) دوز دارو ۲۵ تا ۵۰٪ کاهش یابد.'
  },
  doxorubicin: {
    name: 'دوکسوروبیسین / آدریامایسین (Doxorubicin HCl)',
    doseRate: 30.0,
    unit: 'mg_m2',
    stockConc: 2.0,
    syringeType: 'انفوزیون وریدی آهسته در ۲۰ الی ۳۰ دقیقه',
    smallDogNote: 'در سگ‌های زیر ۱۵ کیلوگرم و کلیه گربه‌ها، دوز 1 mg/kg استفاده شود (نه دوز بر حسب BSA!).',
    safetyAdvice: '⚠️ سمیت قلبی تجمعی در سگ (حداکثر دوز مادام‌العمر 180-240 mg/m²)؛ قبل از شروع اکوکاردیوگرافی الزامی است. دیفن‌هیدرامین قبل از تزریق جهت جلوگیری از شوک هیستامینی.'
  },
  cyclophosphamide_inj: {
    name: 'سیکلوفسفامید تزریقی (Cyclophosphamide IV)',
    doseRate: 200.0,
    unit: 'mg_m2',
    stockConc: 20.0,
    syringeType: 'تزریق وریدی یا انفوزیون رقیق‌شده با سالین',
    smallDogNote: 'در سگ‌های کوچک بر اساس مساحت سطح بدن محاسبه شود ولی همراه با هیدراتاسیون فراوان.',
    safetyAdvice: '⚠️ پیشگیری از سیستیت هموراژیک استریل: همراهی با فوروزماید (1 mg/kg) و تخلیه مکرر مثانه الزامی است.'
  },
  cyclophosphamide_po: {
    name: 'سیکلوفسفامید خوراکی (Cyclophosphamide PO)',
    doseRate: 50.0,
    unit: 'mg_m2',
    stockConc: 50.0, // قرص ۵۰ میلی‌گرم
    syringeType: 'قرص روکش‌دار ۵۰ میلی‌گرم خوراکی',
    smallDogNote: 'قرص‌ها نباید خرد یا نصف شوند؛ دوز بر اساس تعداد قرص‌های کامل ۵۰ میلی‌گرم تنظیم شود.',
    safetyAdvice: 'قرص‌ها حتماً صبح‌ها با آب فراوان داده شود تا ادرار حاوی آکرولئین در طول شب در مثانه راکد نماند.'
  },
  carboplatin: {
    name: 'کربوپلاتین (Carboplatin)',
    doseRate: 300.0,
    unit: 'mg_m2',
    stockConc: 10.0,
    syringeType: 'انفوزیون وریدی طی ۱۵ الی ۳۰ دقیقه با D5W',
    smallDogNote: 'در گربه‌ها دوز 200 تا 240 mg/m² است؛ در سگ‌های زیر ۵ کیلوگرم با احتیاط تیتراسیون شود.',
    safetyAdvice: 'برخلاف سیس‌پلاتین در گربه ایجاد ادم ریه کشنده نمی‌کند اما پایش عملکرد کلیه و CBC در روز ۲۱ الزامی است.'
  },
  lomustine: {
    name: 'لوموستین خوراکی (Lomustine / CCNU)',
    doseRate: 60.0,
    unit: 'mg_m2',
    stockConc: 40.0, // کپسول ۴۰ میلی‌گرم
    syringeType: 'کپسول‌های خوراکی ۱۰ و ۴۰ میلی‌گرم',
    smallDogNote: 'در سگ‌های زیر ۱۰ کیلوگرم، دوز 1 الی 2 mg/kg تجویز شود.',
    safetyAdvice: '⚠️ سمیت کبدی کشنده: تجویز همزمان با دنامارین (SAME + سیلیبینین) و پایش آنزیم‌های کبد قبل از هر نوبت الزامی است.'
  }
};

function onOncoDrugPresetChange() {
  const select = document.getElementById('oncoDrugPresetSelect');
  if (!select) return;
  const key = select.value;
  const preset = ONCO_DRUG_PRESETS[key];
  if (!preset) return;

  const doseInput = document.getElementById('oncoDoseRate');
  const unitSelect = document.getElementById('oncoDoseUnit');
  const concInput = document.getElementById('oncoStockConc');

  if (doseInput) doseInput.value = preset.doseRate;
  if (unitSelect) unitSelect.value = preset.unit;
  if (concInput) concInput.value = preset.stockConc;

  runOncologyBsaCalculation();
}

function runOncologyBsaCalculation() {
  const speciesSelect = document.getElementById('oncoSpeciesSelect');
  const species = speciesSelect ? speciesSelect.value : 'canine';

  const wInput = document.getElementById('oncoWeight');
  const weight = parseFloat(wInput ? wInput.value : currentPatientWeight) || 10;

  const doseInput = document.getElementById('oncoDoseRate');
  const doseRate = parseFloat(doseInput ? doseInput.value : 0.7) || 0.7;

  const unitSelect = document.getElementById('oncoDoseUnit');
  const unit = unitSelect ? unitSelect.value : 'mg_m2';

  const concInput = document.getElementById('oncoStockConc');
  const stockConc = parseFloat(concInput ? concInput.value : 1.0) || 1.0;

  const bsa = calculateBSA(weight, species);

  let totalMg = 0;
  if (unit === 'mg_m2') {
    totalMg = doseRate * bsa;
  } else {
    // mg/kg
    totalMg = doseRate * weight;
  }

  const syringeVol = totalMg / stockConc;

  // به‌روزرسانی DOM
  const bsaDisplay = document.getElementById('oncoBsaDisplay');
  const resMg = document.getElementById('oncoResTotalMg');
  const resVol = document.getElementById('oncoResSyringeVol');
  const formulaBadge = document.getElementById('oncoFormulaBadge');
  const syringeTypeBadge = document.getElementById('oncoSyringeTypeBadge');
  const smallDogText = document.getElementById('oncoSmallDogRuleText');
  const safetyAdvice = document.getElementById('oncoSafetyAdvice');

  if (bsaDisplay) bsaDisplay.textContent = bsa.toFixed(3) + ' m²';
  if (resMg) resMg.textContent = totalMg < 1 ? totalMg.toFixed(3) : totalMg.toFixed(2);
  if (resVol) resVol.textContent = syringeVol < 1 ? syringeVol.toFixed(3) : syringeVol.toFixed(2);

  if (formulaBadge) {
    if (unit === 'mg_m2') {
      formulaBadge.textContent = `بر اساس ${doseRate} mg/m² × ${bsa.toFixed(3)} m²`;
    } else {
      formulaBadge.textContent = `بر اساس ${doseRate} mg/kg × ${weight} kg`;
    }
  }

  const presetKey = document.getElementById('oncoDrugPresetSelect')?.value;
  const preset = ONCO_DRUG_PRESETS[presetKey];

  if (preset) {
    if (syringeTypeBadge) syringeTypeBadge.textContent = preset.syringeType;
    if (smallDogText) smallDogText.textContent = preset.smallDogNote;
    if (safetyAdvice) safetyAdvice.innerHTML = preset.safetyAdvice + '<br>• <strong>گیت‌وی ANC:</strong> نوتروفیل تام بالای ۳۰۰۰ و پلاکت بالای ۱۰۰,۰۰۰.';
  }

  return {
    bsa,
    totalMg,
    syringeVol,
    weight,
    species
  };
}

// =================================================================
// سامانه تخصصی انتقال خون، فرآورده‌ها و کراس‌مچ (Transfusion Engine)
// Plumb's & ACVIM Blood Transfusion & Crossmatching Decision Support
// =================================================================

function calculateTransfusionVolume(species, weightKg, recipientPcv, targetPcv, productType = 'wb', donorPcv = 40, rateMode = 'standard') {
  const w = parseFloat(weightKg) || 10;
  const curPcv = parseFloat(recipientPcv) || 12;
  const tgtPcv = parseFloat(targetPcv) || 25;
  const donPcv = parseFloat(donorPcv) || (productType === 'prbc' ? 70 : (species === 'feline' ? 35 : 40));

  // ضریب حجم خون نرمال گونه: سگ 90 mL/kg، گربه 60 mL/kg
  const bloodVolumeFactor = (species === 'feline' || species === 'cat') ? 60 : 90;

  let totalVolumeMl = 0;
  let ruleOfThumbText = '';

  if (productType === 'ffp') {
    // پلاسما منجمد تازه: ۱۰ الی ۲۰ میلی‌لیتر بر کیلوگرم
    totalVolumeMl = w * 15;
    ruleOfThumbText = `معادل ۱۵ mL/kg (محدوده ۱۰ تا ۲۰ mL/kg جهت کواگولوپاتی و مسمومیت موش‌کش)`;
  } else if (productType === 'prbc') {
    // گلبول‌های قرمز فشرده
    totalVolumeMl = w * bloodVolumeFactor * ((tgtPcv - curPcv) / donPcv);
    ruleOfThumbText = `تقریباً ${(totalVolumeMl / w).toFixed(1)} mL/kg (قانون طلایی: ۱ mL/kg از pRBC هماتوکریت را ۱٪ افزایش می‌دهد)`;
  } else {
    // خون کامل Whole Blood (WB)
    totalVolumeMl = w * bloodVolumeFactor * ((tgtPcv - curPcv) / donPcv);
    ruleOfThumbText = `تقریباً ${(totalVolumeMl / w).toFixed(1)} mL/kg (قانون طلایی: ۲ mL/kg از WB هماتوکریت را ۱٪ افزایش می‌دهد)`;
  }

  if (totalVolumeMl < 0) totalVolumeMl = 0;

  // سرعت تزریق
  // سرعت تست (۱۵ تا ۳۰ دقیقه اول): 0.25 تا 0.5 mL/kg/hr
  const testRateMin = w * 0.25;
  const testRateMax = w * 0.50;

  // سرعت نگهداری بر اساس مد
  let mainRateMin = 0;
  let mainRateMax = 0;
  if (rateMode === 'emergency') {
    mainRateMin = w * 10;
    mainRateMax = w * 20;
  } else if (rateMode === 'cardiac') {
    mainRateMin = w * 1;
    mainRateMax = w * 2;
  } else {
    // استاندارد
    mainRateMin = w * 4;
    mainRateMax = w * 5;
  }

  // قطره در دقیقه برای ست خون ۱۵ قطره استاندارد: Drops = (mL/hr * 15) / 60 = mL/hr / 4
  const testDropsMin = (testRateMin * 15 / 60);
  const testDropsMax = (testRateMax * 15 / 60);
  const mainDropsMin = (mainRateMin * 15 / 60);
  const mainDropsMax = (mainRateMax * 15 / 60);

  return {
    species,
    weightKg: w,
    recipientPcv: curPcv,
    targetPcv: tgtPcv,
    donorPcv: donPcv,
    productType,
    rateMode,
    totalVolumeMl: Math.round(totalVolumeMl * 10) / 10,
    ruleOfThumbText,
    testRateText: `${testRateMin.toFixed(1)} الی ${testRateMax.toFixed(1)} mL/h`,
    testDropsText: testDropsMax < 1 ? `تقریباً ۱ قطره هر ${Math.round(60 / testDropsMax)} ثانیه (ست ۱۵ قطره)` : `${testDropsMin.toFixed(1)} الی ${testDropsMax.toFixed(1)} قطره در دقیقه`,
    mainRateText: `${mainRateMin.toFixed(1)} الی ${mainRateMax.toFixed(1)} mL/h`,
    mainDropsText: `${Math.round(mainDropsMin)} الی ${Math.round(mainDropsMax)} قطره در دقیقه (ست خون ۱۵ قطره)`
  };
}

function onTransfusionProductChange() {
  const productSelect = document.getElementById('transfusionProduct');
  const donorPcvInput = document.getElementById('transfusionDonorPcv');
  const speciesSelect = document.getElementById('transfusionSpecies');
  if (!productSelect || !donorPcvInput) return;

  const product = productSelect.value;
  const species = speciesSelect ? speciesSelect.value : 'canine';

  if (product === 'prbc') {
    donorPcvInput.value = 70;
    donorPcvInput.disabled = false;
  } else if (product === 'ffp') {
    donorPcvInput.value = 0;
    donorPcvInput.disabled = true;
  } else {
    // WB
    donorPcvInput.value = (species === 'feline' ? 35 : 40);
    donorPcvInput.disabled = false;
  }

  runTransfusionCalculation();
}

function runTransfusionCalculation() {
  const speciesSelect = document.getElementById('transfusionSpecies');
  const species = speciesSelect ? speciesSelect.value : 'canine';

  const wInput = document.getElementById('transfusionWeight');
  const weight = parseFloat(wInput ? wInput.value : currentPatientWeight) || 10;

  const recPcvInput = document.getElementById('transfusionRecipientPcv');
  const recipientPcv = parseFloat(recPcvInput ? recPcvInput.value : 12) || 12;

  const tgtPcvInput = document.getElementById('transfusionTargetPcv');
  const targetPcv = parseFloat(tgtPcvInput ? tgtPcvInput.value : 25) || 25;

  const prodSelect = document.getElementById('transfusionProduct');
  const productType = prodSelect ? prodSelect.value : 'wb';

  const donPcvInput = document.getElementById('transfusionDonorPcv');
  const donorPcv = parseFloat(donPcvInput ? donPcvInput.value : 40) || 40;

  const rateSelect = document.getElementById('transfusionRateMode');
  const rateMode = rateSelect ? rateSelect.value : 'standard';

  const res = calculateTransfusionVolume(species, weight, recipientPcv, targetPcv, productType, donorPcv, rateMode);

  // به‌روزرسانی DOM
  const volDisplay = document.getElementById('transfusionResVolume');
  const ruleThumbDisplay = document.getElementById('transfusionResRuleOfThumb');
  const testRateDisplay = document.getElementById('transfusionResTestRate');
  const testDropsDisplay = document.getElementById('transfusionResTestDrops');
  const mainRateDisplay = document.getElementById('transfusionResMainRate');
  const mainDropsDisplay = document.getElementById('transfusionResMainDrops');
  const badgeDisplay = document.getElementById('transfusionSpeciesBadge');
  const notesDisplay = document.getElementById('transfusionClinicalNotes');

  if (volDisplay) volDisplay.textContent = res.totalVolumeMl + ' mL';
  if (ruleThumbDisplay) ruleThumbDisplay.textContent = res.ruleOfThumbText;
  if (testRateDisplay) testRateDisplay.textContent = res.testRateText;
  if (testDropsDisplay) testDropsDisplay.textContent = res.testDropsText;
  if (mainRateDisplay) mainRateDisplay.textContent = res.mainRateText;
  if (mainDropsDisplay) mainDropsDisplay.textContent = res.mainDropsText;

  if (badgeDisplay) {
    badgeDisplay.textContent = species === 'feline' ? '🐱 گونه گربه (هشدار حساسیت گروه خونی)' : '🐶 گونه سگ (سیستم DEA 1.1)';
  }

  if (notesDisplay) {
    if (species === 'feline') {
      notesDisplay.innerHTML = `
        <div class="p-2.5 bg-rose-50 border border-rose-300 rounded-lg text-rose-950 font-bold mb-1">
          🔴 <strong>هشدار قرمز مرگبار در گربه (Fatal Type B Mismatch):</strong>
          گربه‌های گروه خونی B (شایع در بریتیش، رکس، پرشین و DSH) دارای آنتی‌بادی‌های طبیعی بسیار قوی و کشنده ضد آنتی‌ژن A هستند. تجویز حتی ۱ میلی‌لیتر خون A به گربه B باعث همولیز درون‌عروقی فوق‌حاد، شوک آنافیلاکتیک و مرگ فوری می‌شود! تعیین گروه خونی یا کراس‌مچ قبل از هر تزریق الزامی است.
        </div>
        <p>• <strong>کراس‌مچ ماژور (Major Crossmatch):</strong> سرم گیرنده (گربه بیمار) + گلبول‌های شسته‌شده دهنده (Donor RBC). در صورت آگلوتیناسیون یا همولیز، انتقال خون مطلقاً ممنوع است.</p>
        <p>• <strong>کراس‌مچ مینور (Minor Crossmatch):</strong> سرم دهنده + گلبول‌های شسته‌شده گیرنده (Recipient RBC).</p>
      `;
    } else {
      notesDisplay.innerHTML = `
        <p>• <strong>سیستم آنتی‌ژن اریتروسیت سگ (DEA 1.1):</strong> سگ‌های DEA 1.1 منفی دهنده عمومی جهانی (Universal Donor) هستند. سگ‌های DEA 1.1 مثبت فقط به گیرنده‌های مثبت خون می‌دهند.</p>
        <p>• <strong>قانون اولین ترانسفیوژن سگ:</strong> سگ‌ها فاقد آنتی‌بادی‌های طبیعی ضد DEA 1.1 قبل از اولین ترانسفیوژن هستند؛ لذا در شرایط اورژانس نجات حیات، اولین انتقال خون معمولاً بدون واکنش حاد انجام می‌شود. اما ظرف ۴ الی ۷ روز آنتی‌بادی ساخته می‌شود و ترانسفیوژن دوم بدون کراس‌مچ ماژور خطر واکنش همولیتیک شدید دارد.</p>
        <p>• <strong>کراس‌مچ ماژور (Major):</strong> ۲ قطره سرم سگ گیرنده + ۱ قطره سوسپانسیون ۴٪ شسته‌شده گلبول قرمز دهنده؛ انکوباسیون ۱۵ دقیقه در دمای اتاق و ۳۷ درجه و سانتریفیوژ جهت مشاهده آگلوتیناسیون یا همولیز.</p>
      `;
    }
  }

  return res;
}

// =================================================================
// ماشین‌حساب تقویم شمسی دوره پرهیز از مصرف دام و طیور (Withdrawal Times & Solar Calendar)
// Iranian Food-Animal Residue Avoidance & Solar Clearance Engine
// =================================================================

function gregorianToJalali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = (gy <= 1600) ? 0 : 979;
  gy -= (gy <= 1600) ? 621 : 1600;
  let gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = (365 * gy) + parseInt((gy2 + 3) / 4) - parseInt((gy2 + 99) / 100) + parseInt((gy2 + 399) / 400) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * parseInt(days / 12053);
  days %= 12053;
  jy += 4 * parseInt(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += parseInt((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm = (days < 186) ? 1 + parseInt(days / 31) : 7 + parseInt((days - 186) / 30);
  let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  return { jy, jm, jd };
}

function jalaliToGregorian(jy, jm, jd) {
  let gy = (jy <= 979) ? 621 : 1600;
  jy -= (jy <= 979) ? 0 : 979;
  let days = (365 * jy) + parseInt(jy / 33) * 8 + parseInt((jy % 33 + 3) / 4) + 78 + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  gy += 400 * parseInt(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * parseInt(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * parseInt(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += parseInt((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  let gm = 0;
  for (let i = 0; i < 12; i++) {
    let dim = (i === 1) ? (((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28) : (i === 3 || i === 5 || i === 8 || i === 10) ? 30 : 31;
    if (gd <= dim) {
      gm = i + 1;
      break;
    }
    gd -= dim;
  }
  return { gy, gm, gd };
}

var WITHDRAWAL_DRUG_PRESETS = {
  ceftiofur: {
    name: 'سفتیوفور (اگزنل / اگزیدر)',
    milkDays: 0,
    meatDays: 4,
    eggsDays: 0,
    advice: '🌟 ویژگی استثنایی: زمان پرهیز شیر صفر روز (Zero Milk Discard) است. شیر تولیدی بدون توقف قابل تحویل به کارخانه است.'
  },
  ketoprofen: {
    name: 'کتوپروفن ۱۰٪ دامی (کتوون)',
    milkDays: 0,
    meatDays: 4,
    eggsDays: 0,
    advice: '🌟 تب‌بر و ضددرد برتر با زمان پرهیز شیر صفر روزه؛ ایده‌آل در ورم پستان حاد و فلج زایمان.'
  },
  oxytetracycline_la: {
    name: 'اکسی‌تتراسایکلین ۲۰٪ LA',
    milkDays: 7,
    meatDays: 28,
    eggsDays: 0,
    advice: 'فرمولاسیون لانگ اکتینگ ماندگاری بافتی بالایی دارد؛ عدم تحویل گوشت تا ۲۸ روز پس از تزریق.'
  },
  tulathromycin: {
    name: 'تولاتروماینسین (دراکسین)',
    milkDays: -1, // منع مصرف در شیر
    meatDays: 22,
    eggsDays: 0,
    advice: '⛔ منع مصرف مطلق در دام‌های شیری تولیدکننده شیر انسانی؛ دوره پرهیز گوشت ۲۲ روز است.'
  },
  danofloxacin: {
    name: 'دانوفلوکساسین ۱۸٪ (ادووسین)',
    milkDays: 1.5, // ۳۶ ساعت
    meatDays: 5,
    eggsDays: 0,
    advice: 'دوره پرهیز شیر ۳۶ ساعت (۳ وعده دوشش) و گوشت ۵ روز در تک‌دوز استاندارد BRD.'
  },
  marbofloxacin: {
    name: 'ماربوفلوکساسین ۱۰٪ (ماربوسیل)',
    milkDays: 1.5, // ۳۶ ساعت
    meatDays: 3,
    eggsDays: 0,
    advice: 'پرهیز شیر ۳۶ ساعت و گوشت ۳ روز در درمان تک‌دوز ورم پستان کلی‌فرمی.'
  },
  flunixin: {
    name: 'فلونیکسین مگلومین دامی',
    milkDays: 1.5, // ۳۶ ساعت
    meatDays: 4,
    eggsDays: 0,
    advice: 'پرهیز شیر ۳۶ ساعت و گوشت ۴ روز پس از آخرین تزریق وریدی.'
  },
  pen_strep: {
    name: 'پنی‌سیلین + استرپتومایسین',
    milkDays: 3,
    meatDays: 30,
    eggsDays: 0,
    advice: 'پرهیز شیر ۷۲ ساعت (۳ روز) و گوشت ۳۰ روز به علت دفع کند استرپتومایسین از عضله.'
  },
  florfenicol: {
    name: 'فلورفنیکل ۳۰٪ دامی',
    milkDays: -1,
    meatDays: 28,
    eggsDays: 0,
    advice: '⛔ منع مصرف مطلق در گاوهای دوشا؛ دوره پرهیز گوشت ۲۸ روز در تزریق عضلانی و ۳۸ روز در زیرجلدی.'
  },
  ivermectin_la: {
    name: 'آیورمکتین ۳.۱۵٪ LA',
    milkDays: -1,
    meatDays: 122,
    eggsDays: 0,
    advice: '⛔ منع مصرف در دام شیری؛ دوره پرهیز گوشت ۱۲۲ روز است (نباید نزدیک به کشتار تزریق شود).'
  },
  levamisole: {
    name: 'لوامیزول ۷.۵٪ تزریقی',
    milkDays: 2,
    meatDays: 3,
    eggsDays: 0,
    advice: 'پرهیز شیر ۴۸ ساعت (۴ وعده دوشش) و گوشت ۳ روز؛ پاکسازی سریع از بدن.'
  },
  enrofloxacin: {
    name: 'انروفلوکساسین دامی',
    milkDays: -1,
    meatDays: 14,
    eggsDays: 0,
    advice: '⛔ در گاو شیری دوشا به علت باقیمانده دارویی در شیر ممنوع است؛ پرهیز گوشت ۱۴ روز.'
  },
  amprolium: {
    name: 'آمپرولیوم ۲۰٪ طیور',
    milkDays: 0,
    meatDays: 0,
    eggsDays: 0,
    advice: '🌟 ویژگی طلایی: پرهیز گوشت و تخم‌مرغ خوراکی صفر روز است (Zero Withdrawal Time).'
  },
  diclazuril: {
    name: 'دیکلازوریل ۰.۵٪ دامی',
    milkDays: -1,
    meatDays: 0,
    eggsDays: 0,
    advice: '🌟 داروی تک‌دوز؛ زمان پرهیز گوشت بره و گوساله صفر روز است.'
  },
  tilmicosin: {
    name: 'تایلمیکوزین ۳۰۰ دامی (مایکوتیک)',
    milkDays: -1,
    meatDays: 28,
    eggsDays: 0,
    advice: '⛔ منع مصرف مطلق در گاو شیری دوشا؛ پرهیز گوشت ۲۸ روز است. تزریق فقط زیرجلدی.'
  },
  phenylbutazone: {
    name: 'فنیل‌بوتازون دامی (بیوت)',
    milkDays: -1,
    meatDays: 999,
    eggsDays: 0,
    advice: '⛔ منع مصرف مادام‌العمر در تمام دام‌های تولیدکننده گوشت یا شیر مصرف انسانی (خطر آنمی آپلاستیک).'
  },
  tylosin_tartrate: {
    name: 'تایلوزین تارتارات طیور',
    milkDays: -1,
    meatDays: 1,
    eggsDays: -1,
    advice: 'پرهیز گوشت طیور ۱ روز؛ منع مصرف در مرغ تخم‌گذار خوراکی.'
  },
  colistin_sulfate: {
    name: 'کولیستین سولفات طیور',
    milkDays: -1,
    meatDays: 1,
    eggsDays: 0,
    advice: 'پرهیز گوشت ۱ روز؛ تخم‌مرغ صفر روز به علت عدم جذب سیستمیک از روده.'
  }
};

function calculateWithdrawalDate(jy, jm, jd, hour, withdrawalDays) {
  const g = jalaliToGregorian(jy, jm, jd);
  const startMs = Date.UTC(g.gy, g.gm - 1, g.gd, hour, 0, 0);
  const addedMs = withdrawalDays * 24 * 60 * 60 * 1000;
  const targetDate = new Date(startMs + addedMs);

  const targetJ = gregorianToJalali(targetDate.getUTCFullYear(), targetDate.getUTCMonth() + 1, targetDate.getUTCDate());
  const targetHour = targetDate.getUTCHours();

  const jMonths = ['', 'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];

  const formattedDate = `${targetJ.jy}/${String(targetJ.jm).padStart(2, '0')}/${String(targetJ.jd).padStart(2, '0')} ساعت ${String(targetHour).padStart(2, '0')}:00`;
  const readableDate = `${targetJ.jd} ${jMonths[targetJ.jm]} ${targetJ.jy}`;

  return {
    jy: targetJ.jy,
    jm: targetJ.jm,
    jd: targetJ.jd,
    hour: targetHour,
    formattedDate,
    readableDate,
    withdrawalDays,
    targetDateMs: targetDate.getTime()
  };
}

function onWithdrawalPresetChange() {
  const select = document.getElementById('wdrDrugPresetSelect');
  const matrixSelect = document.getElementById('wdrMatrix');
  const daysInput = document.getElementById('wdrDaysInput');
  if (!select || !daysInput) return;

  const key = select.value;
  const matrix = matrixSelect ? matrixSelect.value : 'milk';
  const preset = WITHDRAWAL_DRUG_PRESETS[key];

  if (!preset) return;

  if (matrix === 'milk') {
    if (preset.milkDays === -1) {
      daysInput.value = 999;
    } else {
      daysInput.value = preset.milkDays;
    }
  } else if (matrix === 'meat') {
    daysInput.value = preset.meatDays;
  } else {
    daysInput.value = preset.eggsDays || 0;
  }

  runWithdrawalCalculation();
}

function runWithdrawalCalculation() {
  const yEl = document.getElementById('wdrYear');
  const mEl = document.getElementById('wdrMonth');
  const dEl = document.getElementById('wdrDay');
  const hEl = document.getElementById('wdrHour');
  const daysEl = document.getElementById('wdrDaysInput');
  const matrixEl = document.getElementById('wdrMatrix');
  const presetSelect = document.getElementById('wdrDrugPresetSelect');

  const jy = parseInt(yEl ? yEl.value : 1405) || 1405;
  const jm = parseInt(mEl ? mEl.value : 7) || 7;
  const jd = parseInt(dEl ? dEl.value : 28) || 28;
  const hour = parseInt(hEl ? hEl.value : 12) || 12;
  const wdrDays = parseFloat(daysEl ? daysEl.value : 0) || 0;
  const matrix = matrixEl ? matrixEl.value : 'milk';

  const presetKey = presetSelect ? presetSelect.value : 'ceftiofur';
  const preset = WITHDRAWAL_DRUG_PRESETS[presetKey];

  const dateRes = calculateWithdrawalDate(jy, jm, jd, hour, wdrDays >= 900 ? 0 : wdrDays);

  const clearDateEl = document.getElementById('wdrResClearanceDate');
  const badgeEl = document.getElementById('wdrResStatusBadge');
  const countdownEl = document.getElementById('wdrResCountdown');
  const adviceEl = document.getElementById('wdrResLegalAdvice');

  if (wdrDays >= 900 || (preset && matrix === 'milk' && preset.milkDays === -1)) {
    if (clearDateEl) clearDateEl.textContent = '⛔ منع مصرف مطلق در دام شیری';
    if (badgeEl) {
      badgeEl.className = 'px-3.5 py-1.5 rounded-xl font-black text-xs bg-rose-100 text-rose-950 border border-rose-300 shadow-2xs';
      badgeEl.textContent = '⛔ منع مصرف مطلق (عدم تحویل شیر به کارخانه تحت هر شرایط)';
    }
    if (countdownEl) countdownEl.textContent = 'غیرقابل ترخیص برای شیر';
    if (adviceEl) adviceEl.textContent = preset ? preset.advice : 'این دارو در دام شیری دوشا به علت رسوب در چربی شیر منع مصرف مطلق دارد.';
  } else if (wdrDays === 0) {
    if (clearDateEl) clearDateEl.textContent = `${dateRes.formattedDate} (${dateRes.readableDate})`;
    if (badgeEl) {
      badgeEl.className = 'px-3.5 py-1.5 rounded-xl font-black text-xs bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs';
      badgeEl.textContent = '✅ ترخیص فوری / زمان پرهیز صفر روز (مجاز به مصرف)';
    }
    if (countdownEl) countdownEl.textContent = 'بدون باقیمانده دارویی (صفر روز)';
    if (adviceEl) adviceEl.textContent = preset ? preset.advice : 'دوره پرهیز این فرآورده صفر روز است.';
  } else {
    if (clearDateEl) clearDateEl.textContent = `${dateRes.formattedDate} (${dateRes.readableDate})`;
    if (badgeEl) {
      badgeEl.className = 'px-3.5 py-1.5 rounded-xl font-black text-xs bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs';
      badgeEl.textContent = `⏳ تحت دوره پرهیز (${wdrDays} روز تا ترخیص کامل)`;
    }
    if (countdownEl) countdownEl.textContent = `${wdrDays} روز پس از آخرین نوبت تزریق`;
    if (adviceEl) adviceEl.textContent = preset ? preset.advice : `تا پایان تاریخ ${dateRes.formattedDate} تحویل فرآورده به بازار ممنوع است.`;
  }

  return {
    jy, jm, jd, hour, wdrDays, matrix, dateRes
  };
}

function printWithdrawalCertificate() {
  const farm = document.getElementById('wdrFarmName')?.value || 'گاوداری صنعتی';
  const tag = document.getElementById('wdrAnimalTag')?.value || 'پلاک دام';
  const drug = document.getElementById('wdrDrugPresetSelect')?.selectedOptions[0]?.text || 'داروی مصرفی';
  const clearDate = document.getElementById('wdrResClearanceDate')?.textContent || '';
  const status = document.getElementById('wdrResStatusBadge')?.textContent || '';

  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="UTF-8">
      <title>گواهی رسمی دوره پرهیز از مصرف - فارم</title>
      <style>
        body { font-family: Tahoma, sans-serif; padding: 30px; line-height: 1.8; color: #1e293b; }
        .cert-box { border: 3px double #0f766e; padding: 25px; border-radius: 15px; }
        .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 15px; margin-bottom: 20px; }
        .title { font-size: 20px; font-weight: bold; color: #0f766e; }
        .field { margin: 12px 0; font-size: 14px; }
        .label { font-weight: bold; color: #334155; }
        .val { font-weight: bold; color: #0f766e; }
        .status-box { background: #f0fdf4; border: 1px solid #86efac; padding: 12px; border-radius: 8px; margin: 20px 0; font-weight: bold; }
        .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; }
      </style>
    </head>
    <body onload="window.print()">
      <div class="cert-box">
        <div class="header">
          <div class="title">گواهی رسمی سلامت و اتمام دوره پرهیز از مصرف دارویی (Withdrawal Certificate)</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 5px;">مطابق با ضوابط سازمان دامپزشکی کشور و فارماکوپه پلامبز ایران</div>
        </div>
        <div class="field"><span class="label">نام واحد تولیدی / دامداری / مرغداری:</span> <span class="val">${farm}</span></div>
        <div class="field"><span class="label">مشخصات و شماره پلاک دام / گله:</span> <span class="val">${tag}</span></div>
        <div class="field"><span class="label">داروی تجویز شده و دوز:</span> <span class="val">${drug}</span></div>
        <div class="field"><span class="label">تاریخ و ساعت دقیق پایان دوره پرهیز و ترخیص:</span> <span class="val">${clearDate}</span></div>
        <div class="status-box">${status}</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 15px;">
          بدینوسیله گواهی می‌شود پس از تاریخ فوق، باقیمانده دارویی در بافت‌های مصرفی زیر حد مجاز MRL استاندارد بین‌المللی بوده و عرضه فرآورده بلامانع است.
        </div>
        <div class="footer">
          <div>مهر و امضای مدیر فارم</div>
          <div>مهر و امضای دکتر دامپزشک فارم / مسئول فنی بهداشتی</div>
        </div>
      </div>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// =================================================================
// موتورهای محاسباتی اختصاصی ۳ پنل جدید ماشین‌حساب پلامبز
// 1. Ophthalmology Drop Sequencer & Pairwise Simulator
// 2. Aquaculture PPM & Bath Immersion Calculator
// 3. Camelids & Wildlife Immobilization Engine
// =================================================================

function runOphthalmicOutcomeCalculation() {
  const d1Select = document.getElementById('ophtDrop1Select');
  const d2Select = document.getElementById('ophtDrop2Select');
  if (!d1Select || !d2Select) return;

  const d1 = d1Select.value;
  const d2 = d2Select.value;

  const titleEl = document.getElementById('ophtOutcomeTitle');
  const badgeEl = document.getElementById('ophtOutcomeBadge');
  const descEl = document.getElementById('ophtOutcomeDesc');
  const timingEl = document.getElementById('ophtOutcomeTiming');
  const actionEl = document.getElementById('ophtOutcomeAction');

  if (d1 === d2) {
    if (titleEl) titleEl.textContent = '⚠️ تکرار داروی مشابه';
    if (badgeEl) {
      badgeEl.className = 'text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300';
      badgeEl.textContent = 'اورلود چشمی بدون فایده اضافی';
    }
    if (descEl) descEl.textContent = 'چکاندن دو قطره یکسان به فاصله کم، صرفاً باعث شسته شدن قطره قبلی از کیسه ملتحمه و هدررفت دارو می‌شود. بین دو وعده همان قطره حداقل ۴ تا ۸ ساعت فاصله بگذارید.';
    if (timingEl) timingEl.innerHTML = '⏱️ فاصله استاندارد مصرف: بر اساس دستور تجویز (q8h یا q12h)';
    if (actionEl) actionEl.textContent = 'تنها یک قطره در هر بار کافی است (حجم کیسه ملتحمه حداکثر ۳۰ میکرولیتر است)';
    return;
  }

  const key1 = `${d1}+${d2}`;
  const key2 = `${d2}+${d1}`;
  const pair = DRUG_SPECIALTY_KNOWLEDGE.ophthalmicPairs[key1] || DRUG_SPECIALTY_KNOWLEDGE.ophthalmicPairs[key2];

  if (pair) {
    if (titleEl) titleEl.textContent = pair.title;
    if (badgeEl) {
      if (pair.severity === 'major') {
        badgeEl.className = 'text-[10px] font-black px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300';
      } else {
        badgeEl.className = 'text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300';
      }
      badgeEl.textContent = pair.badge;
    }
    if (descEl) descEl.textContent = pair.outcome;
    if (timingEl) timingEl.innerHTML = `⏱️ ${pair.timing}`;
    if (actionEl) actionEl.textContent = pair.action;
  } else {
    if (titleEl) titleEl.textContent = '🔵 برهم‌کنش استاندارد قطره‌های ترکیبی چشمی';
    if (badgeEl) {
      badgeEl.className = 'text-[10px] font-black px-2.5 py-0.5 rounded-full bg-cyan-100 text-cyan-900 border border-cyan-300';
      badgeEl.textContent = 'سازگار با رعایت توالی زمانی';
    }
    if (descEl) {
      descEl.textContent = 'ترکیب این دو قطره در برنامه درمانی بیمار مجاز است. به دلیل محدودیت حجم کیسه ملتحمه چشم (۲۵ الی ۳۰ میکرولیتر)، چکاندن همزمان باعث سرریز و شسته شدن قطره اول می‌شود.';
    }
    if (timingEl) timingEl.innerHTML = '⏱️ رعایت حداقل <strong>۵ الی ۱۰ دقیقه</strong> فاصله زمانی بین دو قطره الزامی است.';
    if (actionEl) actionEl.textContent = 'ترتیب مصرف: ابتدا محلول شفاف (قطره مایع) سپس قطره سوسپانسیون یا روغنی/پماد';
  }
}

const AQUATICS_PRESETS = {
  ms222: { ppm: 75, purity: 100, advice: 'برای بیهوشی با MS-222، مقدار مساوی بی‌کربنات سدیم (۷۵ گرم به ازای ۷۵ گرم دارو) به آب اضافه کنید تا از اسیدوز کشنده جلوگیری شود. هوادهی شدید با دیفیوزر در طول حمام الزامی است.', withdrawal: '🗓️ دوره پرهیز گوشت: ۲۱ روز (یا ۵۰۰ روز-درجه)', monitoring: 'پایش مداوم حرکات سرپوش آبششی (Operculum)' },
  eugenol: { ppm: 50, purity: 100, advice: 'روغن گل میخک / اوژنول: بیهوشی ملایم و ایمن، بدون افت شدید pH آب. مناسب برای بیوپسی و سونوگرافی مولدین قزل‌آلا و کپور.', withdrawal: '🗓️ دوره پرهیز گوشت: صفر تا ۳ روز', monitoring: 'ریکاوری سریع پس از انتقال به آب تازه پر اکسیژن' },
  formalin_bath: { ppm: 200, purity: 100, advice: 'حمام کوتاه‌مدت ۳۰ الی ۶۰ دقیقه ضد انگل‌های تک‌یاخته (ایک، تریکودینا و کلوستلا). به ازای هر ۵ ppm فرمالین، ۱ ppm اکسیژن آب کاهش می‌یابد؛ اکسیژن‌رسانی حداکثری الزامی است.', withdrawal: '🗓️ دوره پرهیز گوشت: بدون باقیمانده طولانی در بافت', monitoring: 'خروج فوری ماهیان در صورت تنفس در سطح آب (Gasping)' },
  formalin_pond: { ppm: 20, purity: 100, advice: 'درمان استخری بلندمدت ضد انگل سفیدک موضعی (ایک). از مصرف در آب‌های زیر ۱۰ درجه سانتی‌گراد یا آب‌های کدر خودداری شود.', withdrawal: '🗓️ دوره پرهیز: ۷ روز', monitoring: 'پایش سطح اکسیژن محلول (حداقل ۵ mg/L)' },
  salt_short: { ppm: 25000, purity: 100, advice: 'حمام شوک اسمزی نمک طعام بدون ید (۲.۵٪ به مدت ۳ تا ۵ دقیقه): ریزش انگل‌های خارجی آبشش و پوست؛ کاهش استرس بارگیری.', withdrawal: '🗓️ بدون باقیمانده دارویی (زمان پرهیز صفر)', monitoring: 'انتقال بلادرنگ به تانک آب تازه در صورت از دست رفتن تعادل' },
  salt_prolonged: { ppm: 2000, purity: 100, advice: 'نمک نگهداری و التیام بافتی (۰.۲٪ پیوسته): کاهش استرس اسمزی ماهیان آسیب‌دیده و محافظت در برابر سمیت نیتریت.', withdrawal: '🗓️ بدون باقیمانده دارویی (زمان پرهیز صفر)', monitoring: 'پایش شوری‌سنج (Salinometer)' },
  h2o2: { ppm: 150, purity: 35, advice: 'هیدروژن پراکسید (پراکسید هیدروژن ۳۵٪) جهت مهار قارچ ساپرولگنیا در انکوباتور تخم‌ها و باله‌های ماهیان. تجزیه خودبخودی به آب و اکسیژن بدون سمیت بافتی.', withdrawal: '🗓️ بدون باقیمانده شیمیایی (زمان پرهیز صفر)', monitoring: 'پایش شفافیت تخم‌ها و حذف تخم‌های مرده سفید' },
  praziquantel: { ppm: 5, purity: 100, advice: 'پرازیکوانتل حمام: اختصاصی انگل‌های منوژن کرم قلاب‌دار داکتیلوژیروس و ژیروداکتیلوس. حل کردن اولیه در مقدار کمی الکل جهت پخش یکنواخت.', withdrawal: '🗓️ دوره پرهیز گوشت: ۵۰۰ روز-درجه', monitoring: 'بررسی مجدد لام میکروسکوپی مخاط آبشش پس از ۴۸ ساعت' },
  kmno4: { ppm: 2, purity: 100, advice: 'پرمنگنات پتاسیم ضد باکتری و انگل خارجی: آب باید حداقل ۴ ساعت به رنگ صورتی روشن باقی بماند؛ تغییر رنگ به قهوه‌ای نشانه غیرفعال شدن است.', withdrawal: '🗓️ دوره پرهیز: ۱۴ روز', monitoring: 'در آب‌های با بار آلی بالا سریعاً خنثی می‌شود' },
  chloramine_t: { ppm: 15, purity: 100, advice: 'کلرامین-تی ضد باکتری فلاووباکتریوم و پوسیدگی باکتریایی باله و آبشش (BGD). در آب‌های نرم و اسیدی دوز باید کاهش یابد.', withdrawal: '🗓️ دوره پرهیز: ۲۱ روز', monitoring: 'پایش سختی و قلیائیت آب استخر' },
  custom: { ppm: 10, purity: 100, advice: 'محاسبه سفارشی بر اساس پی‌پی‌ام و درصد خلوص تجاری دارو.', withdrawal: '🗓️ مطابق بروشور استاندارد سازمان دامپزشکی', monitoring: 'پایش اکسیژن، pH و رفتار شنای ماهیان' }
};

function onAquaticsPresetChange() {
  const sel = document.getElementById('aquaDrugSelect');
  if (!sel) return;
  const key = sel.value;
  const preset = AQUATICS_PRESETS[key];
  if (!preset) return;

  const ppmInp = document.getElementById('aquaTargetPpm');
  const purInp = document.getElementById('aquaPurityPct');
  const guideEl = document.getElementById('aquaGuidanceText');
  const wdrEl = document.getElementById('aquaWithdrawalText');
  const monEl = document.getElementById('aquaMonitoringText');

  if (ppmInp) ppmInp.value = preset.ppm;
  if (purInp) purInp.value = preset.purity;
  if (guideEl) guideEl.textContent = preset.advice;
  if (wdrEl) wdrEl.textContent = preset.withdrawal;
  if (monEl) monEl.textContent = preset.monitoring;

  runAquaticsCalculation();
}

function runAquaticsCalculation() {
  const volInp = document.getElementById('aquaWaterVol');
  const unitSel = document.getElementById('aquaVolUnit');
  const ppmInp = document.getElementById('aquaTargetPpm');
  const purInp = document.getElementById('aquaPurityPct');
  const tempInp = document.getElementById('aquaWaterTemp');

  const vol = parseFloat(volInp ? volInp.value : 1000) || 1000;
  const unit = unitSel ? unitSel.value : 'liters';
  const ppm = parseFloat(ppmInp ? ppmInp.value : 75) || 75;
  const purity = parseFloat(purInp ? purInp.value : 100) || 100;
  const temp = parseFloat(tempInp ? tempInp.value : 14) || 14;

  const volLiters = (unit === 'm3') ? (vol * 1000) : vol;
  const totalPureMg = ppm * volLiters;
  const totalPureGrams = totalPureMg / 1000;
  const totalCommercialGrams = totalPureGrams / (purity / 100);

  const resAmountEl = document.getElementById('aquaResAmount');
  const resVolEl = document.getElementById('aquaResVolText');

  if (resAmountEl) {
    if (totalCommercialGrams >= 1000) {
      resAmountEl.textContent = `${(totalCommercialGrams / 1000).toFixed(2)} کیلوگرم (kg)`;
    } else {
      resAmountEl.textContent = `${totalCommercialGrams.toFixed(2)} گرم (g)`;
    }
  }

  if (resVolEl) {
    resVolEl.textContent = `برای ${volLiters.toLocaleString('fa-IR')} لیتر آب (دمای ${temp} °C)`;
  }
}

const CAMELID_PRESETS = {
  camelid_stun: {
    badge: 'دوز ترکیبی در یک سرنگ',
    calc: (w) => {
      const xylMg = (0.2 * w).toFixed(1);
      const xylMl = (xylMg / 20).toFixed(2);
      const butMg = (0.05 * w).toFixed(2);
      const butMl = (butMg / 10).toFixed(2);
      const ketMg = (0.3 * w).toFixed(1);
      const ketMl = (ketMg / 100).toFixed(2);
      return `پروتکل استثنایی Camelid Stun: زایلازین 0.2 mg/kg (${xylMg} mg = ${xylMl} mL از ویال ۲٪) + بوتورفانول 0.05 mg/kg (${butMg} mg = ${butMl} mL از ویال ۱۰ mg/mL) + کتامین 0.3 mg/kg (${ketMg} mg = ${ketMl} mL از ویال ۱۰٪) در یک سرنگ عضلانی تزریق شود. آرام‌بخشی عمیق با حفظ تنفس به مدت ۳۰ الی ۴۵ دقیقه.`;
    }
  },
  ivermectin: {
    badge: 'تزریق زیرجلدی (SC)',
    calc: (w) => {
      const doseMg = (0.2 * w).toFixed(1);
      const doseMl = (doseMg / 10).toFixed(2);
      return `ایورمکتین ۱٪ زیرجلدی: دوز 0.2 mg/kg معادل ${doseMg} mg (${doseMl} mL از محلول ۱٪). ریشه‌کنی قطعی جرب سارکوپتس (Sarcoptic mange) شتر و کرم‌های نماتود گوارشی. تکرار پس از ۱۴ روز الزامی است.`;
    }
  },
  diminazene: {
    badge: 'تزریق عضلانی عمیق (Deep IM)',
    calc: (w) => {
      const doseMg = (3.5 * w).toFixed(1);
      const doseMl = (doseMg / 70).toFixed(2);
      return `دیمینازن استورات ۷٪: دوز 3.5 mg/kg عضلانی عمیق معادل ${doseMg} mg (${doseMl} mL). درمان انتخابی تریپانوزومیازیس / بیماری سورا (Surra - Trypanosoma evansi) در شتر. در صورت نیاز پس از ۴۸ ساعت تکرار شود.`;
    }
  },
  oxytet_la: {
    badge: 'تزریق عضلانی یا زیرجلدی LA',
    calc: (w) => {
      const doseMg = (20 * w).toFixed(0);
      const doseMl = (doseMg / 200).toFixed(1);
      return `اکسی‌تتراسایکلین ۲۰٪ LA: دوز 20 mg/kg معادل ${doseMg} mg (${doseMl} mL). حداکثر ۲۰ سی‌سی در هر موضع تزریق شود. درمان پنومونی باکتریایی، گندیدگی سم و ورم مفاصل شتر و لاما.`;
    }
  },
  flunixin_c3: {
    badge: '⚠️ احتیاط شدید زخم محفظه سوم C3',
    calc: (w) => {
      const doseMg = (1.1 * w).toFixed(1);
      const doseMl = (doseMg / 50).toFixed(2);
      return `فلونیکسین مگلومین دامی: دوز 1.1 mg/kg وریدی معادل ${doseMg} mg (${doseMl} mL). هشدار حیاتی: شترسانان به اولسراسیون و سوراخ‌شدگی محفظه سوم معده (C3 Ulceration) و نکروز پاپیلای کلیه بسیار حساسند. هیدراتاسیون قبل از تزریق و تجویز همزمان امپرازول (1 mg/kg IV) قویاً توصیه می‌شود.`;
    }
  },
  tilmicosin_fatal: {
    badge: '☠️ منع مصرف مطلق و کشنده',
    calc: () => {
      return `🔴 هشدار قرمز مرگبار (Fatal Alert): تزریق تیلمیکوزین در شتر، لاما و آلپاکا باعث آریتمی کشنده بطنی، انسداد کانال کلسیم قلبی و مرگ ناگهانی در عرض چند دقیقه می‌شود. هرگز و تحت هیچ شرایطی نباید در شترسانان تزریق شود! جایگزین ایمن: فلورفنیکل یا اکسی‌تتراسایکلین LA.`;
    }
  }
};

function onCamelidDrugChange() {
  runCamelidCalculation();
}

function runCamelidCalculation() {
  const spSel = document.getElementById('camSpeciesSelect');
  const wInp = document.getElementById('camWeight');
  const drugSel = document.getElementById('camDrugSelect');
  if (!drugSel) return;

  const drugKey = drugSel.value;
  const preset = CAMELID_PRESETS[drugKey];
  if (!preset) return;

  const w = parseFloat(wInp ? wInp.value : 450) || 450;
  const badgeEl = document.getElementById('camDoseBadge');
  const adviceEl = document.getElementById('camAdviceText');

  if (badgeEl) {
    if (drugKey === 'tilmicosin_fatal') {
      badgeEl.className = 'font-mono font-black text-rose-950 bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-300';
    } else if (drugKey === 'flunixin_c3') {
      badgeEl.className = 'font-mono font-black text-amber-950 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300';
    } else {
      badgeEl.className = 'font-mono font-black text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300';
    }
    badgeEl.textContent = preset.badge;
  }

  if (adviceEl) {
    adviceEl.textContent = preset.calc(w);
  }
}

function openSpecialtyCalculatorForDrug(drugId, specialtyType, event) {
  if (event) {
    event.stopPropagation();
  }

  if (specialtyType === 'icu') {
    openSpecialtyProtocolsModal('critical_care_icu');
    return;
  }
  if (specialtyType === 'wildlife') {
    openSpecialtyProtocolsModal('wildlife_darting');
    return;
  }

  openCalculatorModal();

  if (specialtyType === 'oncology') {
    switchCalcTab('oncology');
    const select = document.getElementById('oncoDrugPresetSelect');
    if (select) {
      if (select.querySelector(`option[value="${drugId}"]`)) {
        select.value = drugId;
        onOncologyPresetChange();
      } else {
        runOncologyBsaCalculation();
      }
    }
  } else if (specialtyType === 'cri') {
    switchCalcTab('cri');
    const select = document.getElementById('criPresetSelect');
    if (select) {
      if (select.querySelector(`option[value="${drugId}"]`)) {
        select.value = drugId;
        onCriPresetChange();
      } else {
        runCriCalculation();
      }
    }
  } else if (specialtyType === 'ophthalmology') {
    switchCalcTab('ophthalmology');
    const drop1 = document.getElementById('ophtDrop1Select');
    if (drop1 && drop1.querySelector(`option[value="${drugId}"]`)) {
      drop1.value = drugId;
    }
    runOphthalmicOutcomeCalculation();
  } else if (specialtyType === 'aquatics') {
    switchCalcTab('aquatics');
    const aquaSelect = document.getElementById('aquaDrugSelect');
    if (aquaSelect) {
      if (aquaSelect.querySelector(`option[value="${drugId}"]`)) {
        aquaSelect.value = drugId;
        onAquaticsPresetChange();
      } else {
        runAquaticsCalculation();
      }
    }
  } else if (specialtyType === 'camelids') {
    switchCalcTab('camelids');
    const camSelect = document.getElementById('camDrugSelect');
    if (camSelect) {
      if (camSelect.querySelector(`option[value="${drugId}"]`)) {
        camSelect.value = drugId;
        onCamelidDrugChange();
      } else {
        runCamelidCalculation();
      }
    }
  }
}

if (typeof window !== 'undefined') {
  window.toggleDrugSpecialtySection = toggleDrugSpecialtySection;
  window.openDrugSpecialtySection = openDrugSpecialtySection;
  window.handleInlineOphtChange = handleInlineOphtChange;
  window.getOphtPairOutcome = getOphtPairOutcome;
  window.openSpecialtyCalculatorForDrug = openSpecialtyCalculatorForDrug;
  window.runOphthalmicOutcomeCalculation = runOphthalmicOutcomeCalculation;
  window.onAquaticsPresetChange = onAquaticsPresetChange;
  window.runAquaticsCalculation = runAquaticsCalculation;
  window.onCamelidDrugChange = onCamelidDrugChange;
  window.runCamelidCalculation = runCamelidCalculation;
  window.getDrugSpecialtyProfile = getDrugSpecialtyProfile;
  window.getSpecialtyProtocolsForDrug = getSpecialtyProtocolsForDrug;
  window.renderDrugSpecialtyPillsHtml = renderDrugSpecialtyPillsHtml;
  window.renderDrugSpecialtySuiteHtml = renderDrugSpecialtySuiteHtml;
  window.renderDrugSpecialtyCardButtonHtml = renderDrugSpecialtyCardButtonHtml;
}


// ==============================================
// فلوچارت اورژانس تشنج و وضعیت صرعی (Status Epilepticus - BSAVA 12th Ed)
// ==============================================

function openSeizureFlowchartModal() {
  const modal = document.getElementById('seizureFlowchartModal');
  if (!modal) return;
  const w = (typeof currentPatientWeight !== 'undefined' && currentPatientWeight > 0) ? currentPatientWeight : 10;
  const inp = document.getElementById('seizureWeightInput');
  if (inp) inp.value = w;
  modal.classList.remove('hidden');
  if (document.body) document.body.style.overflow = 'hidden';
  runSeizureCalculation();
  if (window.lucide) lucide.createIcons();
}

function closeSeizureFlowchartModal() {
  const modal = document.getElementById('seizureFlowchartModal');
  if (modal) modal.classList.add('hidden');
  if (document.body) document.body.style.overflow = 'auto';
}

function onSeizureWeightChange(val) {
  runSeizureCalculation();
}

function runSeizureCalculation() {
  const inp = document.getElementById('seizureWeightInput');
  const weight = Math.max(0.1, parseFloat(inp ? inp.value : 10) || 10);

  // ۱. دکستروز ۵۰٪ (0.5 - 1.0 mL/kg)
  const dexLow = (weight * 0.5).toFixed(1);
  const dexHigh = (weight * 1.0).toFixed(1);
  const elDex = document.getElementById('szDextroseDose');
  if (elDex) elDex.textContent = `${dexLow} - ${dexHigh} mL`;

  // ۲. میدازولام (0.3 mg/kg - 5 mg/mL)
  const midMg = (weight * 0.3).toFixed(2);
  const midMl = (weight * 0.3 / 5).toFixed(2);
  const elMidMg = document.getElementById('szMidazolamMg');
  const elMidMl = document.getElementById('szMidazolamMl');
  if (elMidMg) elMidMg.textContent = `${midMg} mg`;
  if (elMidMl) elMidMl.textContent = `${midMl} mL`;

  // ۳. دیازپام (IV 0.5 mg/kg, PR 1.0 mg/kg - 5 mg/mL)
  const diazIvMl = (weight * 0.5 / 5).toFixed(2);
  const diazPrMl = (weight * 1.0 / 5).toFixed(2);
  const elDiazIv = document.getElementById('szDiazepamIvMl');
  const elDiazPr = document.getElementById('szDiazepamPrMl');
  if (elDiazIv) elDiazIv.textContent = `${diazIvMl} mL`;
  if (elDiazPr) elDiazPr.textContent = `${diazPrMl} mL`;

  // ۴. لوتیراستام (Keppra 60 mg/kg - 100 mg/mL)
  const kepMg = Math.round(weight * 60);
  const kepMl = (weight * 60 / 100).toFixed(2);
  const elKepMg = document.getElementById('szKeppraMg');
  const elKepMl = document.getElementById('szKeppraMl');
  if (elKepMg) elKepMg.textContent = `${kepMg} mg`;
  if (elKepMl) elKepMl.textContent = `${kepMl} mL`;

  // ۵. فنوباربیتال (4 mg/kg - 200 mg/mL)
  const phenoMg = (weight * 4).toFixed(1);
  const phenoMl = (weight * 4 / 200).toFixed(2);
  const elPhenoMg = document.getElementById('szPhenoMg');
  const elPhenoMl = document.getElementById('szPhenoMl');
  if (elPhenoMg) elPhenoMg.textContent = `${phenoMg} mg`;
  if (elPhenoMl) elPhenoMl.textContent = `${phenoMl} mL`;

  // ۶. میدازولام CRI (0.3 mg/kg/hr)
  const midCriMg = (weight * 0.3).toFixed(2);
  const midCriMl = (weight * 0.3 / 5).toFixed(2);
  const elMidCri = document.getElementById('szMidazolamCri');
  if (elMidCri) elMidCri.textContent = `${midCriMg} mg/hr (${midCriMl} mL/hr از ویال 5mg/mL)`;

  // ۷. کتامین بولوس و CRI (بولوس 2 mg/kg, CRI 1 mg/kg/hr - 50 mg/mL)
  const ketBolusMl = (weight * 2 / 50).toFixed(2);
  const ketCriMl = (weight * 1 / 50).toFixed(2);
  const elKetBolus = document.getElementById('szKetamineBolusMl');
  const elKetCri = document.getElementById('szKetamineCriMl');
  if (elKetBolus) elKetBolus.textContent = `${ketBolusMl} mL`;
  if (elKetCri) elKetCri.textContent = `${ketCriMl} mL/hr`;

  // ۸. پروپوفول بولوس و CRI (بولوس 2 mg/kg, CRI 0.2 mg/kg/min = 12 mg/kg/hr - 10 mg/mL)
  const propBolusMl = (weight * 2 / 10).toFixed(2);
  const propCriMl = (weight * 12 / 10).toFixed(1);
  const elPropBolus = document.getElementById('szPropofolBolusMl');
  const elPropCri = document.getElementById('szPropofolCriMl');
  if (elPropBolus) elPropBolus.textContent = `${propBolusMl} mL`;
  if (elPropCri) elPropCri.textContent = `${propCriMl} mL/hr`;
}

/* ========================================================
   سامانه پروتکل‌های فوق‌تخصصی و تصمیم‌یار بالینی دامپزشکی (۳۵ پروتکل جامع)
   (انکولوژی، بیهوشی و CRI، چشم‌پزشکی، ICU، شترسانان و حیات‌وحش)
   ======================================================== */

let currentSpecialtyTab = 'oncology';
let specialtySearchTerm = '';

function calculateSpecialtyBsa(weight) {
  const w = parseFloat(weight);
  if (isNaN(w) || w <= 0) return 0.47;
  // فرمول مکانیکی و استاندارد Mechtild & Meeh برای مساحت سطح بدن (m²)
  const bsa = (10.1 * Math.pow(w, 2 / 3)) / 100;
  return parseFloat(bsa.toFixed(2));
}

function updateSpecialtyWeightUI(weight) {
  const w = parseFloat(weight) || 10;
  const bsa = calculateSpecialtyBsa(w);
  const bsaEl = document.getElementById('specialtyBsaDisplay');
  if (bsaEl) bsaEl.innerText = `${bsa.toFixed(2)} m²`;

  // به‌روزرسانی ظاهر دکمه‌های وزن سریع
  const pills = document.querySelectorAll('.sp-weight-pill');
  pills.forEach(pill => {
    const pillW = parseFloat(pill.getAttribute('data-spw'));
    if (pillW === w) {
      pill.className = 'sp-weight-pill active px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 font-bold transition';
    } else {
      pill.className = 'sp-weight-pill px-2.5 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition';
    }
  });
}

function handleSpecialtyWeightChange(val) {
  const w = parseFloat(val) || 10;
  updateSpecialtyWeightUI(w);
  renderSpecialtyProtocolsList();
  if (window.lucide) lucide.createIcons();
}

function setSpecialtyWeight(val) {
  const specWInp = document.getElementById('specialtyPatientWeight');
  if (specWInp) specWInp.value = val;
  handleSpecialtyWeightChange(val);
}

function openSpecialtyProtocolsModal(tab = 'oncology') {
  const modal = document.getElementById('specialtyProtocolsModal');
  if (!modal) return;
  currentSpecialtyTab = tab;
  specialtySearchTerm = '';
  const searchInp = document.getElementById('specialtySearchInput');
  if (searchInp) searchInp.value = '';

  // همگام‌سازی وزن با نوار وزن عمومی بالا در صورت وجود
  const globalW = document.getElementById('globalPatientWeight');
  const specWInp = document.getElementById('specialtyPatientWeight');
  let initialW = 10;
  if (specWInp && specWInp.value) {
    initialW = parseFloat(specWInp.value) || 10;
  } else if (globalW && globalW.value) {
    initialW = parseFloat(globalW.value) || 10;
    if (specWInp) specWInp.value = initialW;
  }

  updateSpecialtyWeightUI(initialW);
  updateSpecialtyTabButtons();
  renderSpecialtyProtocolsList();

  modal.classList.remove('hidden');
  if (document.body) document.body.style.overflow = 'hidden';
  if (window.lucide) lucide.createIcons();
}

function closeSpecialtyProtocolsModal() {
  const modal = document.getElementById('specialtyProtocolsModal');
  if (!modal) return;
  modal.classList.add('hidden');
  if (document.body) document.body.style.overflow = '';
}

function switchSpecialtyTab(tab) {
  currentSpecialtyTab = tab;
  updateSpecialtyTabButtons();
  renderSpecialtyProtocolsList();
  if (window.lucide) lucide.createIcons();
}

function updateSpecialtyTabButtons() {
  const tabs = [
    'oncology',
    'anesthesia_cri',
    'ophthalmology',
    'critical_care_icu',
    'camelids_large_animal',
    'wildlife_darting',
    'aquaculture'
  ];
  tabs.forEach(t => {
    const btn = document.getElementById(`tabBtn_${t}`);
    if (!btn) return;
    if (t === currentSpecialtyTab) {
      btn.className = 'specialty-tab-btn px-3 py-1.5 rounded-xl font-black transition flex items-center gap-1.5 bg-indigo-600 text-white shadow-sm whitespace-nowrap';
    } else {
      btn.className = 'specialty-tab-btn px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 bg-white text-slate-700 hover:bg-slate-200 border border-slate-300 whitespace-nowrap';
    }
  });
}

function handleSpecialtySearch() {
  const searchInp = document.getElementById('specialtySearchInput');
  specialtySearchTerm = (searchInp ? searchInp.value : '').trim().toLowerCase();
  renderSpecialtyProtocolsList();
  if (window.lucide) lucide.createIcons();
}

function getSpecialtyDataByTab(tab) {
  const allProtocols = (typeof SUPER_SPECIALTY_PROTOCOLS_DATA !== 'undefined')
    ? SUPER_SPECIALTY_PROTOCOLS_DATA
    : ((typeof window !== 'undefined' && window.SUPER_SPECIALTY_PROTOCOLS_DATA) ? window.SUPER_SPECIALTY_PROTOCOLS_DATA : []);

  if (!Array.isArray(allProtocols) || allProtocols.length === 0) return [];

  // مپینگ تب‌های سازگار قدیمی
  let normalizedTab = tab;
  if (tab === 'anesthesia') normalizedTab = 'anesthesia_cri';
  if (tab === 'camelids') normalizedTab = 'camelids_large_animal';
  if (tab === 'wildlife') normalizedTab = 'wildlife_darting';
  if (tab === 'icu') normalizedTab = 'critical_care_icu';
  if (tab === 'aquatics' || tab === 'fish') normalizedTab = 'aquaculture';

  if (!normalizedTab || normalizedTab === 'all') return allProtocols;
  return allProtocols.filter(p => p.category === normalizedTab);
}

function renderSpecialtyProtocolsList() {
  const container = document.getElementById('specialtyProtocolsContent');
  if (!container) return;

  const rawList = getSpecialtyDataByTab(currentSpecialtyTab);
  let list = rawList;

  if (specialtySearchTerm) {
    const q = specialtySearchTerm;
    list = rawList.filter(item => {
      const text = (
        (item.title_fa || '') + ' ' +
        (item.title_en || '') + ' ' +
        (item.indication_fa || '') + ' ' +
        (item.quick_summary?.first_line_drug || '') + ' ' +
        (item.quick_summary?.key_point || '') + ' ' +
        JSON.stringify(item.calc_items || []) + ' ' +
        JSON.stringify(item.red_flags || []) + ' ' +
        JSON.stringify(item.deep_study || {})
      ).toLowerCase();
      return text.includes(q);
    });
  }

  if (list.length === 0) {
    container.innerHTML = `
      <div class="bg-white rounded-2xl p-8 text-center border border-slate-200">
        <div class="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
          <i data-lucide="search-x" class="w-6 h-6"></i>
        </div>
        <h4 class="text-slate-800 font-bold text-sm mb-1">موردی با این عبارت جستجو یافت نشد</h4>
        <p class="text-slate-500 text-xs">لطفاً واژه جستجو را تغییر داده یا از تب‌های دیگر استفاده فرمایید.</p>
      </div>
    `;
    return;
  }

  const specWInp = document.getElementById('specialtyPatientWeight');
  const weight = parseFloat(specWInp?.value) || 10;
  const bsa = calculateSpecialtyBsa(weight);

  container.innerHTML = list.map(item => renderUnifiedSpecialtyProtocolCard(item, weight, bsa)).join('');
}

function renderUnifiedSpecialtyProtocolCard(p, weight, bsa) {
  const catMeta = {
    oncology: { name: 'انکولوژی و شیمی‌درمانی', icon: 'dna', badgeBg: 'bg-rose-50 text-rose-800 border-rose-200' },
    anesthesia_cri: { name: 'بیهوشی، تسکین و CRI', icon: 'syringe', badgeBg: 'bg-teal-50 text-teal-800 border-teal-200' },
    ophthalmology: { name: 'چشم‌پزشکی و فرمولاسیون', icon: 'eye', badgeBg: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
    critical_care_icu: { name: 'مراقبت ویژه و ICU', icon: 'activity', badgeBg: 'bg-amber-50 text-amber-800 border-amber-200' },
    camelids_large_animal: { name: 'شترسانان و دام بزرگ', icon: 'git-pull-request', badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    wildlife_darting: { name: 'دارت و حیات‌وحش', icon: 'crosshair', badgeBg: 'bg-purple-50 text-purple-800 border-purple-200' },
    aquaculture: { name: 'فارماکولوژی و درمان آبزیان', icon: 'fish', badgeBg: 'bg-cyan-50 text-cyan-900 border-cyan-300' }
  };

  const meta = catMeta[p.category] || { name: 'پروتکل تخصصی', icon: 'sparkles', badgeBg: 'bg-indigo-50 text-indigo-800 border-indigo-200' };

  // ۱. رندر اقلام محاسباتی سریع
  let calcItemsHtml = '';
  if (Array.isArray(p.calc_items) && p.calc_items.length > 0) {
    const itemsRows = p.calc_items.map(ci => {
      if (ci.formula === 'bsa') {
        const mg = ci.dose * bsa;
        const mgStr = mg >= 10 ? mg.toFixed(1) : mg.toFixed(2);
        let volBadge = '';
        if (ci.stock_conc) {
          const vol = mg / ci.stock_conc;
          const volStr = vol >= 10 ? vol.toFixed(1) : vol.toFixed(2);
          volBadge = `<span class="bg-emerald-600 text-white px-2 py-0.5 rounded-lg font-mono font-black text-xs shadow-sm">${volStr} ${ci.stock_unit || 'mL'}</span>`;
        }
        return `
          <div class="bg-white p-3 rounded-xl border border-emerald-200/90 shadow-xs flex flex-col justify-between gap-1.5">
            <div class="flex items-center justify-between flex-wrap gap-1">
              <span class="font-black text-xs text-slate-900">${ci.name}</span>
              <div class="flex items-center gap-1.5">
                <span class="font-mono font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">${mgStr} mg</span>
                ${volBadge}
              </div>
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span>دوز مبنا: ${ci.dose} ${ci.unit}</span>
              ${ci.stock_conc ? `<span class="font-mono">غلظت: ${ci.stock_conc} ${ci.stock_unit || 'mg/mL'}</span>` : ''}
            </div>
            ${ci.note ? `<p class="text-[11px] text-slate-600 leading-snug">${ci.note}</p>` : ''}
          </div>
        `;
      } else if (ci.formula === 'bsa_or_wt') {
        const cutoff = ci.wt_cutoff || 15;
        let mg = 0;
        let noteExtra = '';
        if (weight < cutoff) {
          mg = ci.wt_dose * weight;
          noteExtra = `وزن زیر ${cutoff}kg (مبنا: ${ci.wt_dose} mg/kg)`;
        } else {
          mg = ci.bsa_dose * bsa;
          noteExtra = `وزن بالای ${cutoff}kg (مبنا: ${ci.bsa_dose} mg/m²)`;
        }
        const mgStr = mg >= 10 ? mg.toFixed(1) : mg.toFixed(2);
        let volBadge = '';
        if (ci.stock_conc) {
          const vol = mg / ci.stock_conc;
          const volStr = vol >= 10 ? vol.toFixed(1) : vol.toFixed(2);
          volBadge = `<span class="bg-emerald-600 text-white px-2 py-0.5 rounded-lg font-mono font-black text-xs shadow-sm">${volStr} ${ci.stock_unit || 'mL'}</span>`;
        }
        return `
          <div class="bg-white p-3 rounded-xl border border-emerald-200/90 shadow-xs flex flex-col justify-between gap-1.5">
            <div class="flex items-center justify-between flex-wrap gap-1">
              <span class="font-black text-xs text-slate-900">${ci.name}</span>
              <div class="flex items-center gap-1.5">
                <span class="font-mono font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">${mgStr} mg</span>
                ${volBadge}
              </div>
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span class="text-amber-800 font-bold">${noteExtra}</span>
              ${ci.stock_conc ? `<span class="font-mono">غلظت: ${ci.stock_conc} ${ci.stock_unit || 'mg/mL'}</span>` : ''}
            </div>
            ${ci.note ? `<p class="text-[11px] text-slate-600 leading-snug">${ci.note}</p>` : ''}
          </div>
        `;
      } else if (ci.formula === 'wt') {
        const mg = ci.dose * weight;
        const mgStr = mg >= 10 ? mg.toFixed(1) : mg.toFixed(2);
        let volBadge = '';
        if (ci.stock_conc) {
          const vol = mg / ci.stock_conc;
          const volStr = vol >= 10 ? vol.toFixed(1) : vol.toFixed(2);
          volBadge = `<span class="bg-emerald-600 text-white px-2 py-0.5 rounded-lg font-mono font-black text-xs shadow-sm">${volStr} ${ci.stock_unit || 'mL'}</span>`;
        }
        return `
          <div class="bg-white p-3 rounded-xl border border-emerald-200/90 shadow-xs flex flex-col justify-between gap-1.5">
            <div class="flex items-center justify-between flex-wrap gap-1">
              <span class="font-black text-xs text-slate-900">${ci.name}</span>
              <div class="flex items-center gap-1.5">
                <span class="font-mono font-bold text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">${mgStr} mg</span>
                ${volBadge}
              </div>
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span>دوز مبنا: ${ci.dose} ${ci.unit}</span>
              ${ci.stock_conc ? `<span class="font-mono">غلظت: ${ci.stock_conc} ${ci.stock_unit || 'mg/mL'}</span>` : ''}
            </div>
            ${ci.note ? `<p class="text-[11px] text-slate-600 leading-snug">${ci.note}</p>` : ''}
          </div>
        `;
      } else if (ci.formula === 'wt_rate') {
        const rateMg = ci.dose * weight;
        const rateMgStr = rateMg >= 10 ? rateMg.toFixed(1) : rateMg.toFixed(2);
        let volBadge = '';
        if (ci.stock_conc) {
          const rateVol = rateMg / ci.stock_conc;
          const rateVolStr = rateVol >= 10 ? rateVol.toFixed(1) : rateVol.toFixed(2);
          volBadge = `<span class="bg-teal-700 text-white px-2 py-0.5 rounded-lg font-mono font-black text-xs shadow-sm">${rateVolStr} mL/h</span>`;
        }
        return `
          <div class="bg-white p-3 rounded-xl border border-teal-200/90 shadow-xs flex flex-col justify-between gap-1.5">
            <div class="flex items-center justify-between flex-wrap gap-1">
              <span class="font-black text-xs text-slate-900">${ci.name}</span>
              <div class="flex items-center gap-1.5">
                <span class="font-mono font-bold text-xs text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">${rateMgStr} mg/h</span>
                ${volBadge}
              </div>
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span>نرخ انفوزیون: ${ci.dose} ${ci.unit}</span>
              ${ci.stock_conc ? `<span class="font-mono">غلظت محلول: ${ci.stock_conc} ${ci.stock_unit || 'mg/mL'}</span>` : ''}
            </div>
            ${ci.note ? `<p class="text-[11px] text-slate-600 leading-snug">${ci.note}</p>` : ''}
          </div>
        `;
      } else if (ci.formula === 'ml_wt') {
        const vol = ci.dose * weight;
        const volStr = vol >= 10 ? vol.toFixed(1) : vol.toFixed(2);
        return `
          <div class="bg-white p-3 rounded-xl border border-purple-200/90 shadow-xs flex flex-col justify-between gap-1.5">
            <div class="flex items-center justify-between flex-wrap gap-1">
              <span class="font-black text-xs text-slate-900">${ci.name}</span>
              <span class="bg-purple-700 text-white px-2.5 py-0.5 rounded-lg font-mono font-black text-xs shadow-sm">${volStr} mL</span>
            </div>
            <div class="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span>حجم دارت پرتابی: ${ci.dose} ${ci.unit}</span>
            </div>
            ${ci.note ? `<p class="text-[11px] text-slate-600 leading-snug">${ci.note}</p>` : ''}
          </div>
        `;
      } else {
        // بدون فرمول محاسباتی (فرمولاسیون داروسازی، ترکیب یا پادزهر ثابت)
        return `
          <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-1">
            <div class="font-black text-xs text-slate-900">${ci.name}</div>
            <p class="text-[11px] text-slate-700 leading-relaxed">${ci.note || ''}</p>
          </div>
        `;
      }
    }).join('');

    calcItemsHtml = `
      <div class="mt-2.5 pt-2.5 border-t border-emerald-200/70 space-y-2">
        <div class="flex items-center justify-between text-xs font-black text-emerald-950 flex-wrap gap-1">
          <span class="flex items-center gap-1.5">
            <i data-lucide="calculator" class="w-3.5 h-3.5 text-emerald-700"></i>
            <span>دوز و حجم محاسبه‌شده آنی برای این بیمار (${weight} kg | BSA: ${bsa} m²):</span>
          </span>
          <span class="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full font-bold">بدون نیاز به ضرب و تقسیم</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          ${itemsRows}
        </div>
      </div>
    `;
  }

  // ۲. بخش هشدارهای خط قرمز و پادزهر فوری
  let redFlagsHtml = '';
  if (Array.isArray(p.red_flags) && p.red_flags.length > 0) {
    const flags = p.red_flags.map(f => `
      <li class="flex items-start gap-2 leading-relaxed">
        <span class="shrink-0 mt-0.5">•</span>
        <span>${f}</span>
      </li>
    `).join('');
    redFlagsHtml = `
      <div class="bg-rose-50/90 border border-rose-200 rounded-2xl p-3.5 text-xs text-rose-950 space-y-1.5 shadow-xs">
        <div class="font-black flex items-center gap-1.5 text-rose-900">
          <i data-lucide="alert-octagon" class="w-4 h-4 text-rose-600 shrink-0"></i>
          <span>هشدارهای خط قرمز، پادزهر فوری و تداخلات مرگبار:</span>
        </div>
        <ul class="space-y-1 pr-1 text-rose-900 font-medium">
          ${flags}
        </ul>
      </div>
    `;
  }

  // ۳. بخش مطالعه عمیق، جدول چرخه‌ای و نکات بالینی (آکاردئون بسته)
  let deepStudyHtml = '';
  if (p.deep_study) {
    let scheduleTableHtml = '';
    if (Array.isArray(p.deep_study.schedule_table) && p.deep_study.schedule_table.length > 0) {
      const rows = p.deep_study.schedule_table.map(s => `
        <tr class="border-b border-slate-100 hover:bg-slate-50 transition text-xs">
          <td class="py-2.5 px-3 font-bold text-indigo-900 whitespace-nowrap">${s.week || '-'}</td>
          <td class="py-2.5 px-3 font-black text-slate-900">${s.drug || '-'}</td>
          <td class="py-2.5 px-3 font-mono font-bold text-teal-800">${s.dose || '-'}</td>
          <td class="py-2.5 px-3 text-slate-600 leading-relaxed">${s.note || '-'}</td>
        </tr>
      `).join('');

      scheduleTableHtml = `
        <div class="overflow-x-auto rounded-xl border border-slate-200">
          <table class="w-full text-right border-collapse">
            <thead class="bg-slate-100 text-[11px] text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th class="py-2 px-3">مرحله / هفته</th>
                <th class="py-2 px-3">دارو / ترکیب</th>
                <th class="py-2 px-3">دوزاژ مرجع بالینی</th>
                <th class="py-2 px-3">دستورالعمل، پایش و ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      `;
    }

    let landmarksHtml = '';
    if (p.deep_study.landmarks) {
      landmarksHtml = `
        <div class="bg-slate-100 p-3 rounded-xl border border-slate-200 text-xs text-slate-800 space-y-1">
          <div class="font-bold text-slate-900 flex items-center gap-1.5">
            <i data-lucide="map-pin" class="w-3.5 h-3.5 text-indigo-600"></i>
            <span>لندمارک‌های تشریحی و تکنیک تزریق:</span>
          </div>
          <p class="leading-relaxed">${p.deep_study.landmarks}</p>
        </div>
      `;
    }

    let pearlsHtml = '';
    if (p.deep_study.pearls) {
      pearlsHtml = `
        <div class="bg-indigo-50/70 p-3 rounded-xl border border-indigo-200 text-xs text-indigo-950 space-y-1">
          <div class="font-bold text-indigo-900 flex items-center gap-1.5">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-indigo-600"></i>
            <span>نکات کلیدی پاتوفیزیولوژی و مرواریدهای بالینی (Clinical Pearls):</span>
          </div>
          <p class="leading-relaxed">${p.deep_study.pearls}</p>
        </div>
      `;
    }

    deepStudyHtml = `
      <details class="group bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs transition">
        <summary class="px-4 py-3 bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-bold text-slate-800 flex items-center justify-between select-none">
          <span class="flex items-center gap-2">
            <i data-lucide="book-open" class="w-4 h-4 text-indigo-600"></i>
            <span>مطالعه عمیق بالینی، جدول زمان‌بندی پروتکل و نکات پاتوفیزیولوژی</span>
          </span>
          <i data-lucide="chevron-down" class="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform"></i>
        </summary>
        <div class="p-4 space-y-3 border-t border-slate-200 text-xs">
          ${scheduleTableHtml}
          ${landmarksHtml}
          ${pearlsHtml}
        </div>
      </details>
    `;
  }

  return `
    <div class="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-md space-y-3.5 transition hover:shadow-lg" id="sp_card_${p.id}">
      
      <!-- سربرگ پروتکل -->
      <div class="flex items-start justify-between flex-wrap gap-2 pb-3 border-b border-slate-100">
        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-[11px] ${meta.badgeBg} font-black px-2.5 py-0.5 rounded-full border">
              ${meta.name}
            </span>
            <h4 class="font-black text-sm sm:text-base text-slate-900">${p.title_fa}</h4>
          </div>
          <p class="text-xs font-mono text-slate-500 dir-ltr text-right">${p.title_en || ''}</p>
        </div>
        ${p.cycle_duration ? `
          <span class="text-[11px] bg-slate-100 text-slate-800 font-bold px-3 py-1 rounded-full border border-slate-200 whitespace-nowrap">
            ⏳ ${p.cycle_duration}
          </span>
        ` : ''}
      </div>

      <!-- اندیکاسیون بالینی -->
      <div class="bg-slate-50 p-3 rounded-2xl text-xs text-slate-700 leading-relaxed flex items-start gap-2 border border-slate-200">
        <i data-lucide="target" class="w-4 h-4 text-indigo-600 shrink-0 mt-0.5"></i>
        <div>
          <strong class="text-slate-900">اندیکاسیون بالینی:</strong>
          <span class="mr-1">${p.indication_fa || ''}</span>
        </div>
      </div>

      <!-- بخش اول: دسترسی سریع بالینی در ۳۰ ثانیه و محاسبه آنی دوز بر اساس وزن -->
      <div class="bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white border border-emerald-300/80 rounded-2xl p-4 space-y-2.5 shadow-xs">
        <div class="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-emerald-200/60">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-black text-xs text-emerald-950">⚡ پاسخ فوری و تصمیم‌یار بالینی (دسترسی سریع در ۳۰ ثانیه):</span>
          </div>
          ${p.quick_summary?.route ? `
            <span class="text-[11px] bg-emerald-100 text-emerald-900 font-bold px-2.5 py-0.5 rounded-md border border-emerald-300">
              مسیر مصرف: ${p.quick_summary.route}
            </span>
          ` : ''}
        </div>

        <div class="space-y-1.5 text-xs">
          ${p.quick_summary?.first_line_drug ? `
            <div class="text-slate-800 font-medium">
              <strong class="text-slate-900">داروی خط اول و استراتژی:</strong>
              <span class="mr-1 font-bold text-emerald-950">${p.quick_summary.first_line_drug}</span>
            </div>
          ` : ''}

          ${p.quick_summary?.quick_dose_str ? `
            <div class="text-slate-700">
              <strong class="text-slate-900">خلاصه دوز:</strong>
              <span class="mr-1">${p.quick_summary.quick_dose_str}</span>
            </div>
          ` : ''}

          ${p.quick_summary?.key_point ? `
            <div class="text-slate-700">
              <strong class="text-slate-900">نکته کلیدی:</strong>
              <span class="mr-1">${p.quick_summary.key_point}</span>
            </div>
          ` : ''}
        </div>

        ${calcItemsHtml}
      </div>

      <!-- بخش دوم: هشدارهای خط قرمز، پادزهر فوری و تداخلات مرگبار -->
      ${redFlagsHtml}

      <!-- بخش سوم: مطالعه عمیق، جدول چرخه‌ای و نکات بالینی -->
      ${deepStudyHtml}

    </div>
  `;
}

// توابع سازگاری عقب‌رو (Legacy Fallbacks)
function renderOncologyProtocolCard(p) { return renderUnifiedSpecialtyProtocolCard(p, 10, 0.47); }
function renderAnesthesiaProtocolCard(p) { return renderUnifiedSpecialtyProtocolCard(p, 10, 0.47); }
function renderOphthalmologyCard(p) { return renderUnifiedSpecialtyProtocolCard(p, 10, 0.47); }
function renderCamelidProtocolCard(p) { return renderUnifiedSpecialtyProtocolCard(p, 10, 0.47); }
function renderWildlifeProtocolCard(p) { return renderUnifiedSpecialtyProtocolCard(p, 10, 0.47); }

// ثبت سرویس ورکر برای کاربری کاملاً آفلاین (PWA Offline Service Worker)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js?v=2.10.0').then((reg) => {
      reg.update();
      console.log('✅ وت‌دوز (VetDose): سرویس ورکر PWA v3.0 با موفقیت به‌روزرسانی شد:', reg.scope);
    }).catch((err) => {
      console.log('⚠️ خطا در ثبت سرویس ورکر PWA:', err);
    });
  });
}



if (typeof window !== 'undefined') {
  window.switchCalcTab = switchCalcTab;
  window.initUniversalCalculator = initUniversalCalculator;
  window.setUniversalSpecies = setUniversalSpecies;
  window.setUniversalFormRoute = setUniversalFormRoute;
  window.populateUniversalDrugSelect = populateUniversalDrugSelect;
  window.onUniversalDrugChange = onUniversalDrugChange;
  window.runUniversalCalculation = runUniversalCalculation;
  window.runChocolateCalculation = runChocolateCalculation;
  window.renderLabRefTable = renderLabRefTable;
  window.runOphthalmologyDiag = runOphthalmologyDiag;
  window.runIrisCalculation = runIrisCalculation;
  window.runAnesthesiaCalculation = runAnesthesiaCalculation;
  window.runNutritionCalculation = runNutritionCalculation;
  window.openCalculatorModal = openCalculatorModal;
  window.closeCalculatorModal = closeCalculatorModal;
  window.openCalculatorWithTab = openCalculatorWithTab;
}


// ==============================================
// موتور بررسی سازگاری سرمی و اختلاط در سرنگ (Y-Site & Syringe Admixture Matrix)
// ==============================================
let currentSyringeDrug1 = 'ketamine';
let currentSyringeDrug2 = 'xylazine';

function openSyringeCompatibilityModal(focusDrugId = null) {
  const modal = document.getElementById('syringeCompatibilityModal');
  if (!modal) return;

  populateSyringeCompatibilitySelects();

  if (focusDrugId) {
    currentSyringeDrug1 = focusDrugId;
    const sel1 = document.getElementById('syringeDrugSelect1');
    if (sel1) sel1.value = focusDrugId;
  }

  runSyringeCompatibilityCheck();

  modal.classList.remove('hidden');
  if (window.lucide) lucide.createIcons();
}

function closeSyringeCompatibilityModal() {
  const modal = document.getElementById('syringeCompatibilityModal');
  if (modal) modal.classList.add('hidden');
}

function populateSyringeCompatibilitySelects() {
  const sel1 = document.getElementById('syringeDrugSelect1');
  const sel2 = document.getElementById('syringeDrugSelect2');
  if (!sel1 || !sel2) return;

  const fluids = (typeof IV_FLUIDS_LIST !== 'undefined') ? IV_FLUIDS_LIST : [];
  
  const keyInjectableIds = [
    'ketamine', 'xylazine', 'diazepam', 'midazolam', 'propofol', 'etomidate',
    'fentanyl', 'butorphanol', 'dexmedetomidine', 'atipamezole', 'ceftriaxone',
    'ampicillin', 'enrofloxacin', 'metronidazole', 'furosemide', 'potassium_chloride',
    'calcium_gluconate_iv', 'sodium_bicarbonate_84', 'epinephrine', 'atropine',
    'lidocaine', 'dexamethasone'
  ];

  const drugItems = [];
  keyInjectableIds.forEach(id => {
    const d = DRUGS_DATA.find(x => x.id === id);
    if (d) {
      drugItems.push({ id: d.id, name: `${d.generic_name_fa} (${d.generic_name_en})`, type: 'drug' });
    }
  });

  const fluidItems = fluids.map(f => ({ id: f.id, name: `💧 ${f.name_fa}`, type: 'fluid' }));
  const allItems = [...fluidItems, ...drugItems];

  const html1 = allItems.map(item => `
    <option value="${item.id}" ${item.id === currentSyringeDrug1 ? 'selected' : ''}>
      ${item.name}
    </option>
  `).join('');

  const html2 = allItems.map(item => `
    <option value="${item.id}" ${item.id === currentSyringeDrug2 ? 'selected' : ''}>
      ${item.name}
    </option>
  `).join('');

  sel1.innerHTML = html1;
  sel2.innerHTML = html2;
}

function setSyringeCompatPreset(drug1, drug2) {
  currentSyringeDrug1 = drug1;
  currentSyringeDrug2 = drug2;
  const sel1 = document.getElementById('syringeDrugSelect1');
  const sel2 = document.getElementById('syringeDrugSelect2');
  if (sel1) sel1.value = drug1;
  if (sel2) sel2.value = drug2;
  runSyringeCompatibilityCheck();
}

function runSyringeCompatibilityCheck() {
  const sel1 = document.getElementById('syringeDrugSelect1');
  const sel2 = document.getElementById('syringeDrugSelect2');
  if (sel1) currentSyringeDrug1 = sel1.value;
  if (sel2) currentSyringeDrug2 = sel2.value;

  const resultContainer = document.getElementById('syringeCompatResult');
  if (!resultContainer) return;

  const d1 = currentSyringeDrug1;
  const d2 = currentSyringeDrug2;

  if (d1 === d2) {
    resultContainer.innerHTML = `
      <div class="p-6 bg-slate-50 border border-slate-200 rounded-3xl text-center">
        <i data-lucide="info" class="w-8 h-8 mx-auto text-slate-400 mb-2"></i>
        <p class="text-xs text-slate-600 font-bold">لطفاً دو داروی متفاوت یا یک دارو و یک سرم را برای بررسی انتخاب کنید.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  let match = null;
  if (typeof checkSyringeAndYSiteCompatibility === 'function') {
    match = checkSyringeAndYSiteCompatibility(d1, d2);
  }

  const name1 = sel1 ? (sel1.options[sel1.selectedIndex]?.text || d1) : d1;
  const name2 = sel2 ? (sel2.options[sel2.selectedIndex]?.text || d2) : d2;

  if (match) {
    const isFatal = match.status === 'critical_hazard' || match.severity === 'fatal';
    const isIncompat = match.status === 'incompatible';
    const isCompat = match.status === 'compatible';

    const headerBg = isFatal ? 'bg-rose-950/90 border-rose-500 text-rose-100' : (isIncompat ? 'bg-amber-950/90 border-amber-500 text-amber-100' : 'bg-emerald-950/90 border-emerald-500 text-emerald-100');
    const badgeText = isFatal ? '🔴 خط قرمز تزریقات / رسوب مرگبار' : (isIncompat ? '❌ ناسازگار فیزیکوشیمیایی' : (match.status === 'conditional_compatible' ? '⚠️ سازگار مشروط (تزریق فوری)' : '✅ کاملاً سازگار در یک سرنگ'));
    const badgeBg = isFatal ? 'bg-rose-600 text-white' : (isIncompat ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white');

    resultContainer.innerHTML = `
      <div class="rounded-3xl border ${headerBg} p-5 space-y-4 shadow-lg">
        <div class="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10">
          <div>
            <span class="text-[10px] font-mono text-slate-300 block mb-0.5">بررسی اختلاط فیزیکوشیمیایی:</span>
            <h4 class="text-base font-black text-white">${name1} + ${name2}</h4>
          </div>
          <span class="text-xs font-black px-3 py-1 rounded-full ${badgeBg} shadow-sm">
            ${badgeText}
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div class="bg-black/20 p-3 rounded-2xl border border-white/10">
            <span class="text-emerald-400 font-bold block mb-1">💉 وضعیت اختلاط در یک سرنگ (Syringe Admixture):</span>
            <span class="text-sm font-black text-white block">${match.syringe_mix}</span>
          </div>
          <div class="bg-black/20 p-3 rounded-2xl border border-white/10">
            <span class="text-blue-400 font-bold block mb-1">💧 وضعیت لاین سرم مشترک (Y-Site Piggyback):</span>
            <span class="text-sm font-black text-white block">${match.y_site}</span>
          </div>
        </div>

        <div class="bg-black/30 p-3.5 rounded-2xl border border-white/10 text-xs space-y-2">
          <div>
            <span class="text-amber-300 font-bold block mb-1">🔬 پدیده فیزیکوشیمیایی (Trissel's / Physical-Chemical Mechanism):</span>
            <p class="text-slate-200 text-xs leading-relaxed">${match.phenomenon}</p>
          </div>
          <div class="pt-2 border-t border-white/10">
            <span class="text-emerald-300 font-bold block mb-1">🛡️ دستورالعمل بالینی و راهکار جایگزین:</span>
            <p class="text-slate-200 text-xs leading-relaxed font-bold">${match.action}</p>
          </div>
        </div>

        <div class="flex items-center justify-between text-[11px] text-slate-300 pt-1 flex-wrap gap-2">
          <span>📚 <strong>مرجع علمی:</strong> ${match.reference || "Trissel's Handbook on Injectable Drugs"}</span>
          ${isCompat ? '<span class="text-emerald-400 font-bold">✓ این ترکیب به طور ایمن در کار بالینی قابل اختلاط است</span>' : '<span class="text-rose-400 font-bold">⚠️ از کشیدن در یک سرنگ مشترک اکیداً خودداری فرمایید</span>'}
        </div>
      </div>
    `;
  } else {
    resultContainer.innerHTML = `
      <div class="rounded-3xl border border-blue-500/30 bg-slate-900 text-white p-5 space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-800">
          <div>
            <h4 class="text-sm font-black text-blue-300">${name1} + ${name2}</h4>
            <span class="text-[11px] text-slate-400">راهنمای بالینی اختلاط و سرم درمانی</span>
          </div>
          <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            احتیاط و پایش فیزیکی
          </span>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">
          داده فیزیکوشیمیایی قطعی مبنی بر رسوب حاد برای این جفت در جدول Trissel's گزارش نشده است. با این حال، اصل احتیاط بالینی حکم می‌کند که هرگاه دو داروی تزریقی برای نخستین بار در یک سرنگ مخلوط می‌شوند:
        </p>
        <ul class="text-xs text-slate-300 space-y-1 list-disc list-inside">
          <li>سرنگ را در برابر نور مستقیم از نظر هرگونه کدر شدن (Turbidity)، تغییر رنگ یا تشکیل رسوب معلق بررسی کنید.</li>
          <li>در صورت هرگونه تغییر در شفافیت محلول، سرنگ را دور ریخته و داروها را به صورت مجزا با دو سرنگ تزریق فرمایید.</li>
          <li>در تزریق وریدی، لاین سرم را بین دو تزریق با حداقل ۳ تا ۵ سی‌سی نرمال سالین ۰.۹٪ فلاش (شستشو) دهید.</li>
        </ul>
      </div>
    `;
  }

  if (window.lucide) lucide.createIcons();
}

if (typeof window !== 'undefined') {
  window.openSyringeCompatibilityModal = openSyringeCompatibilityModal;
  window.closeSyringeCompatibilityModal = closeSyringeCompatibilityModal;
  window.setSyringeCompatPreset = setSyringeCompatPreset;
  window.runSyringeCompatibilityCheck = runSyringeCompatibilityCheck;
}


if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CARD_SPECIES_META,
    getSpeciesForDrug,
    renderSpeciesTabsButtons,
    getPlumbsSpeciesBoxHtml,
    getSpeciesIconsPreviewHtml,
    DRUG_SPECIALTY_KNOWLEDGE,
    getDrugSpecialtyProfile,
    getSpecialtyProtocolsForDrug,
    renderDrugSpecialtyPillsHtml,
    renderDrugSpecialtyCardButtonHtml,
    renderDrugSpecialtySuiteHtml,
    toggleDrugSpecialtySection,
    openDrugSpecialtySection,
    handleInlineOphtChange,
    getOphtPairOutcome,
    openSpecialtyCalculatorForDrug,
    runOphthalmicOutcomeCalculation,
    runAquaticsCalculation,
    runCamelidCalculation,
    switchCalcTab,
    quickCalculateForDrug,
    initUniversalCalculator,
    setUniversalSpecies,
    setUniversalFormRoute,
    populateUniversalDrugSelect,
    onUniversalDrugChange,
    runUniversalCalculation,
    runChocolateCalculation,
    renderLabRefTable,
    runOphthalmologyDiag,
    runIrisCalculation,
    runAnesthesiaCalculation,
    runNutritionCalculation,
    openCalculatorWithTab
  };
}

// لیسنرهای ناوبری مدرن و میانبرهای کیبورد (Google Stitch Shortcuts & Scroll)
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      scrollToSearchAndFocus();
    }
  });

  window.addEventListener('scroll', () => {
    const btn = document.getElementById('scrollTopBtn');
    if (btn) {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }
  });
}
