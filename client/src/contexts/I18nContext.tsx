import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "cs" | "de" | "es" | "fr" | "pt" | "hi" | "id" | "tl" | "bn" | "ur" | "vi" | "yo" | "sw";

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { code: "tl", label: "Filipino", flag: "🇵🇭" },
  { code: "bn", label: "বাংলা", flag: "🇧🇩" },
  { code: "ur", label: "اردو", flag: "🇵🇰" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "yo", label: "Yorùbá", flag: "🇳🇬" },
  { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "cs", label: "Čeština", flag: "🇨🇿" },
];

export type Translations = {
  hero_eyebrow: string;
  hero_h1_line1: string;
  hero_h1_line2: string;
  hero_sub: string;
  hero_cta: string;
  hero_guarantee: string;
  nav_cta: string;
  quiz_cta: string;
  footer_privacy: string;
  footer_terms: string;
  footer_affiliates: string;
  footer_contact: string;
  footer_feedback: string;
  asmr_badge: string;
  asmr_h2: string;
  asmr_sub: string;
  feedback_badge: string;
  feedback_h2: string;
};

const T: Record<Lang, Translations> = {
  en: {
    hero_eyebrow: "SCIENCE-BACKED SLEEP PROTOCOL",
    hero_h1_line1: "You're Not Tired.",
    hero_h1_line2: "You're Sleep-Deprived.",
    hero_sub: "The 7-night protocol that fixes insomnia without pills, supplements, or willpower.",
    hero_cta: "Fix My Sleep Tonight — $5",
    hero_guarantee: "30-day money-back guarantee · Instant access · No subscription",
    nav_cta: "Change My Sleep — $5",
    quiz_cta: "Take the Free Sleep Quiz →",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Service",
    footer_affiliates: "Affiliates",
    footer_contact: "Contact",
    footer_feedback: "Feedback",
    asmr_badge: "🎧 Free ASMR Sleep Sounds",
    asmr_h2: "Fall Asleep Faster Tonight",
    asmr_sub: "Science-backed sleep sounds engineered to slow your brainwaves from beta to delta. Try 2 free tracks now.",
    feedback_badge: "💬 Share Your Experience",
    feedback_h2: "How Did We Do?",
  },
  hi: {
    hero_eyebrow: "विज्ञान-समर्थित नींद प्रोटोकॉल",
    hero_h1_line1: "आप थके नहीं हैं।",
    hero_h1_line2: "आप नींद से वंचित हैं।",
    hero_sub: "7-रात का प्रोटोकॉल जो बिना गोलियों, सप्लीमेंट्स या इच्छाशक्ति के अनिद्रा को ठीक करता है।",
    hero_cta: "आज रात मेरी नींद ठीक करें — $5",
    hero_guarantee: "30-दिन की मनी-बैक गारंटी · तत्काल पहुंच · कोई सदस्यता नहीं",
    nav_cta: "मेरी नींद बदलें — $5",
    quiz_cta: "मुफ्त नींद क्विज़ लें →",
    footer_privacy: "गोपनीयता नीति",
    footer_terms: "सेवा की शर्तें",
    footer_affiliates: "सहयोगी",
    footer_contact: "संपर्क",
    footer_feedback: "प्रतिक्रिया",
    asmr_badge: "🎧 मुफ्त ASMR नींद की आवाजें",
    asmr_h2: "आज रात जल्दी सो जाएं",
    asmr_sub: "विज्ञान-समर्थित नींद की आवाजें जो आपकी मस्तिष्क तरंगों को बीटा से डेल्टा तक धीमा करती हैं। अभी 2 मुफ्त ट्रैक आज़माएं।",
    feedback_badge: "💬 अपना अनुभव साझा करें",
    feedback_h2: "हमने कैसा किया?",
  },
  id: {
    hero_eyebrow: "PROTOKOL TIDUR BERBASIS SAINS",
    hero_h1_line1: "Kamu Tidak Lelah.",
    hero_h1_line2: "Kamu Kekurangan Tidur.",
    hero_sub: "Protokol 7 malam yang mengatasi insomnia tanpa pil, suplemen, atau kekuatan tekad.",
    hero_cta: "Perbaiki Tidurku Malam Ini — $5",
    hero_guarantee: "Garansi uang kembali 30 hari · Akses instan · Tanpa langganan",
    nav_cta: "Ubah Tidurku — $5",
    quiz_cta: "Ikuti Kuis Tidur Gratis →",
    footer_privacy: "Kebijakan Privasi",
    footer_terms: "Syarat Layanan",
    footer_affiliates: "Afiliasi",
    footer_contact: "Kontak",
    footer_feedback: "Masukan",
    asmr_badge: "🎧 Suara ASMR Tidur Gratis",
    asmr_h2: "Tidur Lebih Cepat Malam Ini",
    asmr_sub: "Suara tidur berbasis sains yang dirancang untuk memperlambat gelombang otak dari beta ke delta. Coba 2 trek gratis sekarang.",
    feedback_badge: "💬 Bagikan Pengalamanmu",
    feedback_h2: "Bagaimana Kami?",
  },
  tl: {
    hero_eyebrow: "SLEEP PROTOCOL NA SUPORTADO NG AGHAM",
    hero_h1_line1: "Hindi Ka Pagod.",
    hero_h1_line2: "Kulang Ka sa Tulog.",
    hero_sub: "Ang 7-gabing protokol na nagaayos ng insomnia nang walang gamot, supplement, o lakas ng loob.",
    hero_cta: "Ayusin ang Aking Tulog Ngayong Gabi — $5",
    hero_guarantee: "30-araw na money-back guarantee · Instant na access · Walang subscription",
    nav_cta: "Baguhin ang Aking Tulog — $5",
    quiz_cta: "Kumuha ng Libreng Sleep Quiz →",
    footer_privacy: "Patakaran sa Privacy",
    footer_terms: "Mga Tuntunin ng Serbisyo",
    footer_affiliates: "Mga Kasamahan",
    footer_contact: "Makipag-ugnayan",
    footer_feedback: "Feedback",
    asmr_badge: "🎧 Libreng ASMR Sleep Sounds",
    asmr_h2: "Matulog nang Mas Mabilis Ngayong Gabi",
    asmr_sub: "Mga tunog na suportado ng agham na dinisenyo para pabagalin ang iyong mga brain wave mula beta hanggang delta. Subukan ang 2 libreng track ngayon.",
    feedback_badge: "💬 Ibahagi ang Iyong Karanasan",
    feedback_h2: "Paano Kami Nagawa?",
  },
  bn: {
    hero_eyebrow: "বিজ্ঞান-সমর্থিত ঘুমের প্রোটোকল",
    hero_h1_line1: "আপনি ক্লান্ত নন।",
    hero_h1_line2: "আপনি ঘুম-বঞ্চিত।",
    hero_sub: "৭-রাতের প্রোটোকল যা বড়ি, সাপ্লিমেন্ট বা ইচ্ছাশক্তি ছাড়াই অনিদ্রা ঠিক করে।",
    hero_cta: "আজ রাতে আমার ঘুম ঠিক করুন — $5",
    hero_guarantee: "৩০-দিনের মানি-ব্যাক গ্যারান্টি · তাৎক্ষণিক অ্যাক্সেস · কোনো সাবস্ক্রিপশন নেই",
    nav_cta: "আমার ঘুম পরিবর্তন করুন — $5",
    quiz_cta: "বিনামূল্যে ঘুমের কুইজ নিন →",
    footer_privacy: "গোপনীয়তা নীতি",
    footer_terms: "সেবার শর্তাবলী",
    footer_affiliates: "অ্যাফিলিয়েট",
    footer_contact: "যোগাযোগ",
    footer_feedback: "প্রতিক্রিয়া",
    asmr_badge: "🎧 বিনামূল্যে ASMR ঘুমের শব্দ",
    asmr_h2: "আজ রাতে দ্রুত ঘুমিয়ে পড়ুন",
    asmr_sub: "বিজ্ঞান-সমর্থিত ঘুমের শব্দ যা আপনার মস্তিষ্কের তরঙ্গকে বিটা থেকে ডেল্টায় ধীর করে। এখনই ২টি বিনামূল্যে ট্র্যাক চেষ্টা করুন।",
    feedback_badge: "💬 আপনার অভিজ্ঞতা শেয়ার করুন",
    feedback_h2: "আমরা কেমন করলাম?",
  },
  ur: {
    hero_eyebrow: "سائنس پر مبنی نیند کا پروٹوکول",
    hero_h1_line1: "آپ تھکے نہیں ہیں۔",
    hero_h1_line2: "آپ نیند سے محروم ہیں۔",
    hero_sub: "7 راتوں کا پروٹوکول جو گولیوں، سپلیمنٹس یا قوت ارادی کے بغیر بے خوابی کو ٹھیک کرتا ہے۔",
    hero_cta: "آج رات میری نیند ٹھیک کریں — $5",
    hero_guarantee: "30 دن کی منی بیک گارنٹی · فوری رسائی · کوئی سبسکرپشن نہیں",
    nav_cta: "میری نیند بدلیں — $5",
    quiz_cta: "مفت نیند کا کوئز لیں →",
    footer_privacy: "رازداری کی پالیسی",
    footer_terms: "سروس کی شرائط",
    footer_affiliates: "ایفیلیٹس",
    footer_contact: "رابطہ",
    footer_feedback: "رائے",
    asmr_badge: "🎧 مفت ASMR نیند کی آوازیں",
    asmr_h2: "آج رات جلدی سو جائیں",
    asmr_sub: "سائنس پر مبنی نیند کی آوازیں جو آپ کی دماغی لہروں کو بیٹا سے ڈیلٹا تک سست کرتی ہیں۔ ابھی 2 مفت ٹریک آزمائیں۔",
    feedback_badge: "💬 اپنا تجربہ شیئر کریں",
    feedback_h2: "ہم نے کیسا کیا؟",
  },
  vi: {
    hero_eyebrow: "GIAO THỨC NGỦ CÓ CƠ SỞ KHOA HỌC",
    hero_h1_line1: "Bạn Không Mệt.",
    hero_h1_line2: "Bạn Đang Thiếu Ngủ.",
    hero_sub: "Giao thức 7 đêm giúp chữa mất ngủ mà không cần thuốc, thực phẩm chức năng hay ý chí.",
    hero_cta: "Cải Thiện Giấc Ngủ Tối Nay — $5",
    hero_guarantee: "Đảm bảo hoàn tiền 30 ngày · Truy cập ngay · Không đăng ký",
    nav_cta: "Thay Đổi Giấc Ngủ — $5",
    quiz_cta: "Làm Bài Kiểm Tra Giấc Ngủ Miễn Phí →",
    footer_privacy: "Chính Sách Bảo Mật",
    footer_terms: "Điều Khoản Dịch Vụ",
    footer_affiliates: "Đối Tác",
    footer_contact: "Liên Hệ",
    footer_feedback: "Phản Hồi",
    asmr_badge: "🎧 Âm Thanh ASMR Ngủ Miễn Phí",
    asmr_h2: "Ngủ Nhanh Hơn Tối Nay",
    asmr_sub: "Âm thanh ngủ có cơ sở khoa học được thiết kế để làm chậm sóng não từ beta xuống delta. Thử 2 bản nhạc miễn phí ngay bây giờ.",
    feedback_badge: "💬 Chia Sẻ Trải Nghiệm Của Bạn",
    feedback_h2: "Chúng Tôi Làm Thế Nào?",
  },
  yo: {
    hero_eyebrow: "ÈTỌ OORUN TI IMỌ-ÈDÈ ṢE ÀTÌLẸYÌN",
    hero_h1_line1: "Ìrẹ̀wẹ̀sì Kọ́ Ni Ìṣòro Rẹ.",
    hero_h1_line2: "Àìsùn Ni Ìṣòro Rẹ.",
    hero_sub: "Ètò ọjọ 7 tí ó ṣe àtúnṣe àìsùn láìsí àwọn oogun, àfikún, tàbí agbára ìfẹ́.",
    hero_cta: "Ṣe Àtúnṣe Oorun Mi Alẹ́ Òní — $5",
    hero_guarantee: "Ìdánilójú ìpadàwọlé owó ọjọ 30 · Ìráàyèsí lẹ́sẹ̀kẹsẹ̀ · Kò sí ìforúkọsílẹ̀",
    nav_cta: "Yí Oorun Mi Padà — $5",
    quiz_cta: "Gba Idanwo Oorun Ọfẹ →",
    footer_privacy: "Ìlànà Àṣírí",
    footer_terms: "Àwọn Ìlànà Iṣẹ́",
    footer_affiliates: "Àwọn Alájọṣepọ̀",
    footer_contact: "Kàn Sí Wa",
    footer_feedback: "Ìdáhùn",
    asmr_badge: "🎧 Àwọn Ohùn ASMR Oorun Ọfẹ",
    asmr_h2: "Sùn Yára Sii Alẹ́ Òní",
    asmr_sub: "Àwọn ohùn oorun tí imọ-ẹ̀dẹ ṣe àtìlẹyìn tí a ṣe àpẹrẹ láti fa fifalẹ àwọn ìgbì ọpọlọ rẹ láti beta sí delta. Gbìyànjú 2 orin ọfẹ báyìí.",
    feedback_badge: "💬 Pín Ìrírí Rẹ",
    feedback_h2: "Báwo Ni A Ṣe?",
  },
  sw: {
    hero_eyebrow: "ITIFAKI YA USINGIZI INAYOUNGWA MKONO NA SAYANSI",
    hero_h1_line1: "Huchoka.",
    hero_h1_line2: "Una Upungufu wa Usingizi.",
    hero_sub: "Itifaki ya usiku 7 inayotatua usingizi bila vidonge, virutubisho, au nguvu ya mapenzi.",
    hero_cta: "Rekebisha Usingizi Wangu Usiku Huu — $5",
    hero_guarantee: "Dhamana ya kurudisha pesa siku 30 · Ufikiaji wa papo hapo · Hakuna usajili",
    nav_cta: "Badilisha Usingizi Wangu — $5",
    quiz_cta: "Fanya Jaribio la Usingizi Bure →",
    footer_privacy: "Sera ya Faragha",
    footer_terms: "Masharti ya Huduma",
    footer_affiliates: "Washirika",
    footer_contact: "Wasiliana",
    footer_feedback: "Maoni",
    asmr_badge: "🎧 Sauti za ASMR za Usingizi Bure",
    asmr_h2: "Lala Haraka Zaidi Usiku Huu",
    asmr_sub: "Sauti za usingizi zinazoundwa na sayansi zilizoundwa kupunguza mawimbi ya ubongo wako kutoka beta hadi delta. Jaribu nyimbo 2 bure sasa.",
    feedback_badge: "💬 Shiriki Uzoefu Wako",
    feedback_h2: "Tulifanyaje?",
  },
  cs: {
    hero_eyebrow: "VĚDECKY OVĚŘENÝ SPÁNKOVÝ PROTOKOL",
    hero_h1_line1: "Nejsi unavený.",
    hero_h1_line2: "Trpíš nedostatkem spánku.",
    hero_sub: "7noční protokol, který vyřeší nespavost bez prášků, doplňků nebo vůle.",
    hero_cta: "Oprav můj spánek dnes — $5",
    hero_guarantee: "30denní záruka vrácení peněz · Okamžitý přístup · Bez předplatného",
    nav_cta: "Změň svůj spánek — $5",
    quiz_cta: "Udělej bezplatný spánkový kvíz →",
    footer_privacy: "Zásady ochrany soukromí",
    footer_terms: "Podmínky služby",
    footer_affiliates: "Affiliate program",
    footer_contact: "Kontakt",
    footer_feedback: "Zpětná vazba",
    asmr_badge: "🎧 Bezplatné ASMR zvuky pro spánek",
    asmr_h2: "Usni rychleji dnes večer",
    asmr_sub: "Vědecky podložené zvuky pro spánek, které zpomalí tvoje mozkové vlny z beta na delta. Vyzkoušej 2 stopy zdarma.",
    feedback_badge: "💬 Sdílej svůj zážitek",
    feedback_h2: "Jak jsme si vedli?",
  },
  de: {
    hero_eyebrow: "WISSENSCHAFTLICH FUNDIERTES SCHLAFPROTOKOLL",
    hero_h1_line1: "Du bist nicht müde.",
    hero_h1_line2: "Du leidest unter Schlafmangel.",
    hero_sub: "Das 7-Nächte-Protokoll, das Schlaflosigkeit ohne Pillen, Nahrungsergänzungsmittel oder Willenskraft behebt.",
    hero_cta: "Meinen Schlaf heute Nacht reparieren — $5",
    hero_guarantee: "30-Tage-Geld-zurück-Garantie · Sofortiger Zugang · Kein Abonnement",
    nav_cta: "Meinen Schlaf ändern — $5",
    quiz_cta: "Kostenloses Schlaf-Quiz machen →",
    footer_privacy: "Datenschutzrichtlinie",
    footer_terms: "Nutzungsbedingungen",
    footer_affiliates: "Partnerprogramm",
    footer_contact: "Kontakt",
    footer_feedback: "Feedback",
    asmr_badge: "🎧 Kostenlose ASMR-Schlafklänge",
    asmr_h2: "Heute Nacht schneller einschlafen",
    asmr_sub: "Wissenschaftlich fundierte Schlafklänge, die deine Gehirnwellen von Beta auf Delta verlangsamen. Probiere jetzt 2 kostenlose Tracks.",
    feedback_badge: "💬 Teile deine Erfahrung",
    feedback_h2: "Wie haben wir abgeschnitten?",
  },
  es: {
    hero_eyebrow: "PROTOCOLO DE SUEÑO RESPALDADO POR LA CIENCIA",
    hero_h1_line1: "No estás cansado.",
    hero_h1_line2: "Tienes privación de sueño.",
    hero_sub: "El protocolo de 7 noches que soluciona el insomnio sin pastillas, suplementos ni fuerza de voluntad.",
    hero_cta: "Arreglar mi sueño esta noche — $5",
    hero_guarantee: "Garantía de devolución de 30 días · Acceso instantáneo · Sin suscripción",
    nav_cta: "Cambiar mi sueño — $5",
    quiz_cta: "Hacer el quiz de sueño gratis →",
    footer_privacy: "Política de privacidad",
    footer_terms: "Términos de servicio",
    footer_affiliates: "Afiliados",
    footer_contact: "Contacto",
    footer_feedback: "Comentarios",
    asmr_badge: "🎧 Sonidos ASMR para dormir gratis",
    asmr_h2: "Duerme más rápido esta noche",
    asmr_sub: "Sonidos de sueño respaldados por la ciencia diseñados para ralentizar tus ondas cerebrales de beta a delta. Prueba 2 pistas gratis ahora.",
    feedback_badge: "💬 Comparte tu experiencia",
    feedback_h2: "¿Cómo lo hicimos?",
  },
  fr: {
    hero_eyebrow: "PROTOCOLE DE SOMMEIL SOUTENU PAR LA SCIENCE",
    hero_h1_line1: "Tu n'es pas fatigué.",
    hero_h1_line2: "Tu souffres de privation de sommeil.",
    hero_sub: "Le protocole de 7 nuits qui résout l'insomnie sans pilules, suppléments ou volonté.",
    hero_cta: "Réparer mon sommeil ce soir — $5",
    hero_guarantee: "Garantie de remboursement 30 jours · Accès instantané · Sans abonnement",
    nav_cta: "Changer mon sommeil — $5",
    quiz_cta: "Faire le quiz de sommeil gratuit →",
    footer_privacy: "Politique de confidentialité",
    footer_terms: "Conditions d'utilisation",
    footer_affiliates: "Affiliés",
    footer_contact: "Contact",
    footer_feedback: "Commentaires",
    asmr_badge: "🎧 Sons ASMR pour dormir gratuits",
    asmr_h2: "S'endormir plus vite ce soir",
    asmr_sub: "Sons de sommeil scientifiquement prouvés conçus pour ralentir vos ondes cérébrales du bêta au delta. Essayez 2 pistes gratuites maintenant.",
    feedback_badge: "💬 Partagez votre expérience",
    feedback_h2: "Comment avons-nous fait?",
  },
  pt: {
    hero_eyebrow: "PROTOCOLO DE SONO BASEADO EM CIÊNCIA",
    hero_h1_line1: "Você não está cansado.",
    hero_h1_line2: "Você tem privação de sono.",
    hero_sub: "O protocolo de 7 noites que resolve a insônia sem pílulas, suplementos ou força de vontade.",
    hero_cta: "Consertar meu sono esta noite — $5",
    hero_guarantee: "Garantia de devolução de 30 dias · Acesso instantâneo · Sem assinatura",
    nav_cta: "Mudar meu sono — $5",
    quiz_cta: "Fazer o quiz de sono grátis →",
    footer_privacy: "Política de privacidade",
    footer_terms: "Termos de serviço",
    footer_affiliates: "Afiliados",
    footer_contact: "Contato",
    footer_feedback: "Feedback",
    asmr_badge: "🎧 Sons ASMR para dormir grátis",
    asmr_h2: "Adormeça mais rápido esta noite",
    asmr_sub: "Sons de sono com respaldo científico projetados para desacelerar suas ondas cerebrais de beta para delta. Experimente 2 faixas grátis agora.",
    feedback_badge: "💬 Compartilhe sua experiência",
    feedback_h2: "Como nos saímos?",
  },
};

interface I18nContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType>({
  lang: "en",
  setLang: () => {},
  t: T.en,
});

const LANG_KEY = "dsr_lang";

function detectBrowserLang(): Lang {
  // Always default to English — user can manually switch language
  // Auto-detect only for non-Latin script languages where user likely can't read English
  const nav = navigator.language.toLowerCase().split("-")[0];
  const autoDetect: Lang[] = ["hi", "bn", "ur", "vi"];
  return autoDetect.includes(nav as Lang) ? (nav as Lang) : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(LANG_KEY) as Lang | null;
    if (stored && T[stored]) return stored;
    return detectBrowserLang();
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t: T[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
