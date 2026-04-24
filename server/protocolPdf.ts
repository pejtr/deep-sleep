import type { Express } from "express";
import PDFDocument from "pdfkit";

// ── Protocol content per language ─────────────────────────────────────────────
const PROTOCOL_DATA: Record<string, {
  title: string;
  subtitle: string;
  intro: string;
  nights: Array<{ night: string; title: string; steps: string[]; science: string }>;
  bonusTitle: string;
  chronotypes: Array<{ name: string; tips: string }>;
}> = {
  en: {
    title: "Deep Sleep Reset — 7-Night Protocol",
    subtitle: "Your science-backed chronotype sleep system",
    intro: "This protocol is designed to reset your circadian rhythm and achieve deep, restorative sleep within 7 nights. Follow each night's instructions precisely for maximum results.",
    nights: [
      { night: "Night 1", title: "Baseline Assessment & Light Reset", steps: ["Set your target sleep window: 10 PM–6 AM (Lion), 11 PM–7 AM (Bear), 12 AM–8 AM (Wolf), 10:30 PM–6:30 AM (Dolphin).", "Dim all lights to 10% brightness 90 minutes before bed. Use warm-toned bulbs (2700K) or candles only.", "Put your phone in grayscale mode and set screen brightness to minimum.", "Write down your 3 biggest worries in a notebook — this 'brain dump' prevents rumination.", "Take your bedroom temperature to 65–68°F (18–20°C). Use a fan or open window.", "No screens of any kind for the last 30 minutes before sleep."], science: "Blue light suppresses melatonin by up to 50% for 3+ hours. Dimming lights triggers your suprachiasmatic nucleus to begin melatonin production." },
      { night: "Night 2", title: "Temperature & Breathing Protocol", steps: ["Take a warm shower or bath 60–90 minutes before bed (NOT right before). The subsequent body cooling triggers sleep onset.", "Practice 4-7-8 breathing: Inhale 4 sec → Hold 7 sec → Exhale 8 sec. Repeat 4 cycles.", "Use a weighted blanket (10% of your body weight) if available.", "Keep your feet warm — cold feet signal the brain to stay alert. Wear socks.", "Avoid alcohol completely tonight. Alcohol reduces REM sleep by 25%.", "Eat your last meal at least 3 hours before bed."], science: "Core body temperature must drop 1–2°F to initiate sleep. The 4-7-8 technique activates the parasympathetic nervous system within 60 seconds." },
      { night: "Night 3", title: "Wind-Down Ritual & Cortisol Reset", steps: ["Start your wind-down ritual at the same time every night (consistency is key).", "Drink chamomile tea or warm milk with honey — both contain sleep-promoting compounds.", "Read a physical book (not a screen) for 20 minutes.", "Do 10 minutes of gentle stretching: child's pose, legs-up-the-wall, supine twist.", "Apply lavender essential oil to your wrists and temples.", "Write 3 things you're grateful for — this shifts brain from threat-mode to safety-mode."], science: "Cortisol (stress hormone) peaks in the morning and should be at its lowest at night. Consistent rituals train your brain to associate these cues with sleep." },
      { night: "Night 4", title: "Sleep Environment Optimization", steps: ["Make your bedroom completely dark — use blackout curtains or a sleep mask. Even 1 lux of light disrupts melatonin.", "Use white noise or brown noise at 60–65 dB (fan, machine, or app).", "Remove all electronics from the bedroom — the EMF and psychological association keep your brain alert.", "Use your bed ONLY for sleep and sex. No working, scrolling, or watching TV in bed.", "Set your alarm for the same time every morning — even weekends. This anchors your circadian rhythm.", "If you wake at night, don't check the clock. Knowing the time increases anxiety."], science: "Sleep environment accounts for 40% of sleep quality. The bed-sleep association (stimulus control therapy) is the most evidence-based insomnia treatment available." },
      { night: "Night 5", title: "Chronotype Alignment & Timing", steps: ["Get 10 minutes of bright sunlight within 30 minutes of waking — this sets your circadian clock for the day.", "Delay your first coffee by 90 minutes after waking (let cortisol peak naturally first).", "Exercise in the morning or early afternoon — not within 4 hours of bedtime.", "Avoid naps longer than 20 minutes, and never after 3 PM.", "Eat your largest meal at lunch, not dinner. Heavy evening meals delay sleep onset by 30+ minutes.", "Stop all caffeine by 2 PM (caffeine has a 6-hour half-life)."], science: "Your chronotype determines your optimal sleep window. Fighting your chronotype increases cortisol and reduces sleep efficiency by up to 30%." },
      { night: "Night 6", title: "Cognitive Behavioral Techniques", steps: ["If you can't fall asleep in 20 minutes, get up and do something boring in dim light until sleepy.", "Practice 'paradoxical intention': try to stay awake with your eyes open. This removes sleep performance anxiety.", "Use progressive muscle relaxation: tense each muscle group for 5 sec, then release, starting from toes.", "Replace 'I can't sleep' thoughts with 'My body is resting even if I'm awake.'", "Visualize a peaceful place in vivid detail — engage all 5 senses in the visualization.", "Accept wakefulness without fighting it — resistance creates arousal, acceptance creates relaxation."], science: "CBT-I (Cognitive Behavioral Therapy for Insomnia) is more effective than sleeping pills in 80% of cases and produces permanent results." },
      { night: "Night 7", title: "Full Reset Complete — Maintenance Protocol", steps: ["Congratulations — you've completed the 7-Night Deep Sleep Reset!", "Measure your results: track how quickly you fell asleep, how many times you woke, and how rested you feel.", "Continue your wind-down ritual every night — consistency is what maintains results.", "If you have a bad night, don't catastrophize. One bad night doesn't undo your progress.", "Review your chronotype alignment — are you sleeping in your optimal window?", "Share your results and help others — teaching reinforces your own habits."], science: "Sleep quality improvements from behavioral interventions are permanent when maintained. Your new circadian rhythm is now anchored — protect it." },
    ],
    bonusTitle: "Bonus: Chronotype-Specific Tips",
    chronotypes: [
      { name: "Lion (Early Riser)", tips: "Sleep 10 PM–6 AM. Morning workouts. Avoid evening social events. Peak focus: 8–12 AM." },
      { name: "Bear (Middle Sleeper)", tips: "Sleep 11 PM–7 AM. Align with solar cycle. Peak focus: 10 AM–2 PM. Most common chronotype." },
      { name: "Wolf (Night Owl)", tips: "Sleep 12 AM–8 AM. Avoid early morning meetings. Peak focus: 5–9 PM. Use blackout curtains." },
      { name: "Dolphin (Light Sleeper)", tips: "Sleep 11:30 PM–6:30 AM. White noise essential. Avoid caffeine after 12 PM. Meditate before bed." },
    ],
  },
  cs: {
    title: "Deep Sleep Reset — 7-nocni protokol",
    subtitle: "Vas vedecky podlozeny spankov system podle chronotypu",
    intro: "Tento protokol je navrzeny k resetovani vaseho cirkadianiho rytmu a dosazeni hlubokeho, regeneracniho spanku behem 7 noci.",
    nights: [
      { night: "Noc 1", title: "Vychozi hodnoceni a reset svetla", steps: ["Nastavte si cilove spankove okno: 22:00-6:00 (Lev), 23:00-7:00 (Medved), 0:00-8:00 (Vlk), 22:30-6:30 (Delfin).", "Ztlumte vsechna svetla na 10% jasu 90 minut pred spanim.", "Prepnete telefon do rezimu stupnu sedi a nastavte minimalni jas.", "Zapiste 3 nejvetsi starosti do zapisniku.", "Snizujte teplotu v loznici na 18-20 C.", "Zadne obrazovky v poslednich 30 minutach pred spanim."], science: "Modre svetlo potlacuje melatonin az o 50% po dobu 3+ hodin." },
      { night: "Noc 2", title: "Teplotni a dechovy protokol", steps: ["Dejte si teplou sprchu 60-90 minut pred spanim.", "Dychani 4-7-8: Nadech 4 sek, Zadrzeni 7 sek, Vydech 8 sek. 4 cykly.", "Pouzijte zatezovou priklyvku.", "Noste ponozky.", "Vyhybejte se alkoholu.", "Posledni jidlo 3 hodiny pred spanim."], science: "Telesna teplota musi klesnout o 0,5-1 C pro zahajeni spanku." },
      { night: "Noc 3", title: "Ritual uklidneni a reset kortizolu", steps: ["Zacinejte ritual kazdy vecer ve stejnou dobu.", "Pijte heřmankovy caj nebo teplé mleko s medem.", "Ctete fyzickou knihu 20 minut.", "10 minut jemneho protahovani.", "Naneste levandulovy olej na zapesti a spanky.", "Napiste 3 veci, za ktere jste vdecni."], science: "Konzistentni ritualy trenují mozek k asociaci techto podnetu se spankem." },
      { night: "Noc 4", title: "Optimalizace spankoveho prostredi", steps: ["Udelejte loznici uplne temnou.", "Pouzijte bily sum pri 60-65 dB.", "Odstrante elektroniku z loznice.", "Pouzivejte postel POUZE ke spanku.", "Nastavte budik na stejny cas kazde rano.", "Pokud se v noci probudite, nekontrolujte hodiny."], science: "Spankove prostredi tvori 40% kvality spanku." },
      { night: "Noc 5", title: "Sladeni chronotypu a nacasovani", steps: ["10 minut slunecniho svetla do 30 minut po probuzeni.", "Odlozte prvni kavu o 90 minut po probuzeni.", "Cvicte rano nebo brzy odpoledne.", "Vyhybejte se slofikum delsim nez 20 minut.", "Jezte nejvetsi jidlo k obedu.", "Prestante s kofeinem do 14:00."], science: "Vas chronotyp urcuje optimalni spankove okno." },
      { night: "Noc 6", title: "Kognitivne-behavioralni techniky", steps: ["Pokud nemuzete usnout do 20 minut, vstante.", "Procvicujte paradoxni zamer: snazit se zustat bdeli.", "Pouzijte progresivni svalovou relaxaci.", "Nahradte myslenky 'nemohu spat' pozitivnimi.", "Vizualizujte klidne misto.", "Prijmete bdelost bez boje."], science: "KBT-I je ucinnejsi nez prasky na spani v 80% pripadu." },
      { night: "Noc 7", title: "Plny reset dokoncen", steps: ["Gratulujeme — dokoncili jste 7-nocni Deep Sleep Reset!", "Zmerte vysledky.", "Pokracujte v ritualu uklidneni kazdy vecer.", "Pokud mate spatnou noc, nekatastrofizujte.", "Zkontrolujte sladeni chronotypu.", "Sdílejte vysledky."], science: "Zlepseni kvality spanku z behavioralnich intervenci jsou trvala." },
    ],
    bonusTitle: "Bonus: Tipy podle chronotypu",
    chronotypes: [
      { name: "Lev (Ranni ptace)", tips: "Spanek 22:00-6:00. Ranni cviceni. Vrchol soustredeni: 8-12 hod." },
      { name: "Medved (Stredni spac)", tips: "Spanek 23:00-7:00. Vrchol soustredeni: 10:00-14:00." },
      { name: "Vlk (Nocni sova)", tips: "Spanek 0:00-8:00. Vrchol soustredeni: 17:00-21:00." },
      { name: "Delfin (Lehky spac)", tips: "Spanek 23:30-6:30. Bily sum nezbytny." },
    ],
  },
  de: {
    title: "Deep Sleep Reset — 7-Nachte-Protokoll",
    subtitle: "Ihr wissenschaftlich fundiertes Schlaf-System nach Chronotyp",
    intro: "Dieses Protokoll setzt Ihren circadianen Rhythmus zuruck und ermoglicht tiefen, erholsamen Schlaf innerhalb von 7 Nachten.",
    nights: [
      { night: "Nacht 1", title: "Grundbewertung & Licht-Reset", steps: ["Schlaffenster einstellen: 22-6 Uhr (Lowe), 23-7 Uhr (Bar), 0-8 Uhr (Wolf), 22:30-6:30 (Delfin).", "Alle Lichter 90 Min vor dem Schlafen auf 10% dimmen.", "Telefon auf Graustufen.", "3 grosste Sorgen aufschreiben.", "Schlafzimmertemperatur auf 18-20 C.", "Keine Bildschirme in den letzten 30 Min."], science: "Blaues Licht unterdrueckt Melatonin bis zu 50% fuer 3+ Stunden." },
      { night: "Nacht 2", title: "Temperatur & Atemprotokoll", steps: ["Warme Dusche 60-90 Min vor dem Schlafen.", "4-7-8 Atmung: Einatmen 4 Sek, Halten 7 Sek, Ausatmen 8 Sek.", "Gewichtsdecke verwenden.", "Warme Socken tragen.", "Kein Alkohol.", "Letzte Mahlzeit 3 Stunden vor dem Schlafen."], science: "Koerpertemperatur muss um 0,5-1 C sinken." },
      { night: "Nacht 3", title: "Abendritual & Cortisol-Reset", steps: ["Ritual taeglich zur gleichen Zeit beginnen.", "Kamillentee oder warme Milch mit Honig.", "20 Min physisches Buch lesen.", "10 Min sanftes Stretching.", "Lavendeloel auf Handgelenke.", "3 Dankbarkeiten aufschreiben."], science: "Konsistente Rituale trainieren das Gehirn." },
      { night: "Nacht 4", title: "Schlafumgebung optimieren", steps: ["Schlafzimmer komplett verdunkeln.", "Weisses Rauschen bei 60-65 dB.", "Elektronik entfernen.", "Bett NUR fuer Schlaf.", "Wecker taeglich zur gleichen Zeit.", "Nachts nicht auf die Uhr schauen."], science: "Schlafumgebung macht 40% der Schlafqualitaet aus." },
      { night: "Nacht 5", title: "Chronotyp-Ausrichtung", steps: ["10 Min Sonnenlicht innerhalb von 30 Min nach dem Aufwachen.", "Ersten Kaffee 90 Min verzoegern.", "Morgens Sport treiben.", "Keine Nickerchen laenger als 20 Min.", "Groesste Mahlzeit mittags.", "Koffein bis 14 Uhr stoppen."], science: "Ihr Chronotyp bestimmt Ihr optimales Schlaffenster." },
      { night: "Nacht 6", title: "Kognitive Techniken", steps: ["Bei 20 Min Wachliegen aufstehen.", "Paradoxe Intention ueben.", "Progressive Muskelentspannung.", "Negative Gedanken ersetzen.", "Friedlichen Ort visualisieren.", "Wachheit akzeptieren."], science: "KVT-I ist in 80% der Faelle wirksamer als Schlaftabletten." },
      { night: "Nacht 7", title: "Reset abgeschlossen", steps: ["Herzlichen Glueckwunsch!", "Ergebnisse messen.", "Abendritual fortsetzen.", "Eine schlechte Nacht nicht dramatisieren.", "Chronotyp-Ausrichtung ueberpruefen.", "Ergebnisse teilen."], science: "Schlafverbesserungen durch Verhaltensinterventionen sind dauerhaft." },
    ],
    bonusTitle: "Bonus: Chronotyp-spezifische Tipps",
    chronotypes: [
      { name: "Lowe (Fruehaufsteher)", tips: "Schlaf 22-6 Uhr. Morgentraining. Spitzenfokus 8-12 Uhr." },
      { name: "Bar (Mittelschlaefer)", tips: "Schlaf 23-7 Uhr. Spitzenfokus 10-14 Uhr." },
      { name: "Wolf (Nachtmensch)", tips: "Schlaf 0-8 Uhr. Spitzenfokus 17-21 Uhr." },
      { name: "Delfin (Leichtschlaefer)", tips: "Schlaf 23:30-6:30 Uhr. Weisses Rauschen wichtig." },
    ],
  },
};

// Fallback to English for languages without full translation
const getLangData = (lang: string) => PROTOCOL_DATA[lang] ?? PROTOCOL_DATA.en;

export function registerProtocolPdfRoute(app: Express) {
  app.get("/api/protocol/download", (req, res) => {
    const lang = (req.query.lang as string) ?? "en";
    const data = getLangData(lang);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="deep-sleep-reset-protocol-${lang}.pdf"`
    );

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res);

    // ── Cover ──────────────────────────────────────────────────────────────────
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#0a0a1a");

    // Title area
    doc.fillColor("#f59e0b")
      .fontSize(28)
      .font("Helvetica-Bold")
      .text(data.title, 50, 120, { align: "center", width: doc.page.width - 100 });

    doc.fillColor("#fbbf24")
      .fontSize(14)
      .font("Helvetica")
      .text(data.subtitle, 50, 165, { align: "center", width: doc.page.width - 100 });

    // Moon icon (circle)
    doc.circle(doc.page.width / 2, 240, 35).fill("#f59e0b");
    doc.circle(doc.page.width / 2 + 12, 228, 28).fill("#0a0a1a");

    doc.fillColor("#9ca3af")
      .fontSize(11)
      .text(data.intro, 60, 300, { align: "center", width: doc.page.width - 120, lineGap: 4 });

    doc.fillColor("#374151")
      .fontSize(9)
      .text("© Deep Sleep Reset · 30-day money-back guarantee · deepsleep-reset.com", 50, doc.page.height - 60, { align: "center", width: doc.page.width - 100 });

    // ── Nights ─────────────────────────────────────────────────────────────────
    const nightColors = ["#f59e0b", "#10b981", "#3b82f6", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];

    data.nights.forEach((night, idx) => {
      doc.addPage();
      doc.rect(0, 0, doc.page.width, doc.page.height).fill("#0a0a1a");

      const color = nightColors[idx] ?? "#f59e0b";

      // Night badge
      doc.roundedRect(50, 40, 90, 28, 6).fill(color + "33");
      doc.fillColor(color).fontSize(12).font("Helvetica-Bold")
        .text(night.night, 50, 48, { width: 90, align: "center" });

      // Title
      doc.fillColor("#f9fafb").fontSize(20).font("Helvetica-Bold")
        .text(night.title, 50, 82, { width: doc.page.width - 100 });

      // Steps
      let y = 120;
      night.steps.forEach((step, si) => {
        // Step number circle
        doc.circle(65, y + 7, 9).fill(color + "44");
        doc.fillColor(color).fontSize(9).font("Helvetica-Bold")
          .text(String(si + 1), 61, y + 2, { width: 9, align: "center" });

        doc.fillColor("#d1d5db").fontSize(10).font("Helvetica")
          .text(step, 82, y, { width: doc.page.width - 140, lineGap: 2 });

        const textHeight = doc.heightOfString(step, { width: doc.page.width - 140 });
        y += textHeight + 14;
      });

      // Science box
      y += 8;
      doc.roundedRect(50, y, doc.page.width - 100, 2).fill("#1e3a5f");
      y += 10;
      doc.fillColor("#60a5fa").fontSize(9).font("Helvetica-Bold")
        .text("SCIENCE: ", 50, y, { continued: true });
      doc.fillColor("#9ca3af").font("Helvetica")
        .text(night.science, { width: doc.page.width - 100 });
    });

    // ── Bonus chronotype tips ──────────────────────────────────────────────────
    doc.addPage();
    doc.rect(0, 0, doc.page.width, doc.page.height).fill("#0a0a1a");

    doc.fillColor("#f59e0b").fontSize(22).font("Helvetica-Bold")
      .text(data.bonusTitle, 50, 50, { width: doc.page.width - 100 });

    let by = 100;
    data.chronotypes.forEach((ct, i) => {
      const colors2 = ["#f59e0b", "#10b981", "#8b5cf6", "#3b82f6"];
      const c = colors2[i] ?? "#f59e0b";
      doc.roundedRect(50, by, doc.page.width - 100, 60, 8).fill(c + "18");
      doc.fillColor(c).fontSize(13).font("Helvetica-Bold")
        .text(ct.name, 65, by + 12, { width: doc.page.width - 130 });
      doc.fillColor("#9ca3af").fontSize(10).font("Helvetica")
        .text(ct.tips, 65, by + 30, { width: doc.page.width - 130 });
      by += 76;
    });

    // Footer
    doc.fillColor("#374151").fontSize(9)
      .text("© Deep Sleep Reset · 30-day money-back guarantee", 50, doc.page.height - 50, { align: "center", width: doc.page.width - 100 });

    doc.end();
  });
}
