import { useState } from "react";
import { Link } from "wouter";
import { Moon, Download, ChevronDown, ChevronUp, Globe } from "lucide-react";

// ── Protocol content in all 14 languages ─────────────────────────────────────
const PROTOCOL_LANGS = {
  en: {
    label: "English",
    flag: "🇬🇧",
    title: "Deep Sleep Reset — 7-Night Protocol",
    subtitle: "Your science-backed chronotype sleep system",
    intro: "This protocol is designed to reset your circadian rhythm and achieve deep, restorative sleep within 7 nights. Follow each night's instructions precisely for maximum results.",
    nights: [
      {
        night: "Night 1",
        title: "Baseline Assessment & Light Reset",
        time: "Start 90 min before your target bedtime",
        steps: [
          "Set your target sleep window: 10 PM–6 AM (Lion), 11 PM–7 AM (Bear), 12 AM–8 AM (Wolf), or 10:30 PM–6:30 AM (Dolphin).",
          "Dim all lights to 10% brightness 90 minutes before bed. Use warm-toned bulbs (2700K) or candles only.",
          "Put your phone in grayscale mode and set screen brightness to minimum.",
          "Write down your 3 biggest worries in a notebook — this 'brain dump' prevents rumination.",
          "Take your bedroom temperature to 65–68°F (18–20°C). Use a fan or open window.",
          "No screens of any kind for the last 30 minutes before sleep.",
        ],
        science: "Blue light suppresses melatonin by up to 50% for 3+ hours. Dimming lights triggers your suprachiasmatic nucleus to begin melatonin production.",
      },
      {
        night: "Night 2",
        title: "Temperature & Breathing Protocol",
        time: "Begin 60 min before bedtime",
        steps: [
          "Take a warm shower or bath 60–90 minutes before bed (NOT right before). The subsequent body cooling triggers sleep onset.",
          "Practice 4-7-8 breathing: Inhale 4 sec → Hold 7 sec → Exhale 8 sec. Repeat 4 cycles.",
          "Use a weighted blanket (10% of your body weight) if available.",
          "Keep your feet warm — cold feet signal the brain to stay alert. Wear socks.",
          "Avoid alcohol completely tonight. Alcohol reduces REM sleep by 25%.",
          "Eat your last meal at least 3 hours before bed.",
        ],
        science: "Core body temperature must drop 1–2°F to initiate sleep. The 4-7-8 technique activates the parasympathetic nervous system within 60 seconds.",
      },
      {
        night: "Night 3",
        title: "Wind-Down Ritual & Cortisol Reset",
        time: "Build a 45-minute pre-sleep ritual",
        steps: [
          "Start your wind-down ritual at the same time every night (consistency is key).",
          "Drink chamomile tea or warm milk with honey — both contain sleep-promoting compounds.",
          "Read a physical book (not a screen) for 20 minutes.",
          "Do 10 minutes of gentle stretching: child's pose, legs-up-the-wall, supine twist.",
          "Apply lavender essential oil to your wrists and temples.",
          "Write 3 things you're grateful for — this shifts brain from threat-mode to safety-mode.",
        ],
        science: "Cortisol (stress hormone) peaks in the morning and should be at its lowest at night. Consistent rituals train your brain to associate these cues with sleep.",
      },
      {
        night: "Night 4",
        title: "Sleep Environment Optimization",
        time: "Prepare your room before starting the ritual",
        steps: [
          "Make your bedroom completely dark — use blackout curtains or a sleep mask. Even 1 lux of light disrupts melatonin.",
          "Use white noise or brown noise at 60–65 dB (fan, machine, or app).",
          "Remove all electronics from the bedroom — the EMF and psychological association keep your brain alert.",
          "Use your bed ONLY for sleep and sex. No working, scrolling, or watching TV in bed.",
          "Set your alarm for the same time every morning — even weekends. This anchors your circadian rhythm.",
          "If you wake at night, don't check the clock. Knowing the time increases anxiety.",
        ],
        science: "Sleep environment accounts for 40% of sleep quality. The bed-sleep association (stimulus control therapy) is the most evidence-based insomnia treatment available.",
      },
      {
        night: "Night 5",
        title: "Chronotype Alignment & Timing",
        time: "Adjust your entire day schedule",
        steps: [
          "Get 10 minutes of bright sunlight within 30 minutes of waking — this sets your circadian clock for the day.",
          "Delay your first coffee by 90 minutes after waking (let cortisol peak naturally first).",
          "Exercise in the morning or early afternoon — not within 4 hours of bedtime.",
          "Avoid naps longer than 20 minutes, and never after 3 PM.",
          "Eat your largest meal at lunch, not dinner. Heavy evening meals delay sleep onset by 30+ minutes.",
          "Stop all caffeine by 2 PM (caffeine has a 6-hour half-life).",
        ],
        science: "Your chronotype determines your optimal sleep window. Fighting your chronotype increases cortisol and reduces sleep efficiency by up to 30%.",
      },
      {
        night: "Night 6",
        title: "Cognitive Behavioral Techniques",
        time: "Address the mental side of sleep",
        steps: [
          "If you can't fall asleep in 20 minutes, get up and do something boring in dim light until sleepy.",
          "Practice 'paradoxical intention': try to stay awake with your eyes open. This removes sleep performance anxiety.",
          "Use progressive muscle relaxation: tense each muscle group for 5 sec, then release, starting from toes.",
          "Replace 'I can't sleep' thoughts with 'My body is resting even if I'm awake.'",
          "Visualize a peaceful place in vivid detail — engage all 5 senses in the visualization.",
          "Accept wakefulness without fighting it — resistance creates arousal, acceptance creates relaxation.",
        ],
        science: "CBT-I (Cognitive Behavioral Therapy for Insomnia) is more effective than sleeping pills in 80% of cases and produces permanent results.",
      },
      {
        night: "Night 7",
        title: "Full Reset Complete — Maintenance Protocol",
        time: "Your new sleep baseline",
        steps: [
          "Congratulations — you've completed the 7-Night Deep Sleep Reset!",
          "Measure your results: track how quickly you fell asleep, how many times you woke, and how rested you feel.",
          "Continue your wind-down ritual every night — consistency is what maintains results.",
          "If you have a bad night, don't catastrophize. One bad night doesn't undo your progress.",
          "Review your chronotype alignment — are you sleeping in your optimal window?",
          "Share your results and help others — teaching reinforces your own habits.",
        ],
        science: "Sleep quality improvements from behavioral interventions are permanent when maintained. Your new circadian rhythm is now anchored — protect it.",
      },
    ],
    bonusTips: {
      title: "Bonus: Chronotype-Specific Tips",
      types: [
        { name: "🦁 Lion (Early Riser)", tips: "Sleep 10 PM–6 AM. Morning workouts. Avoid evening social events. Your peak focus is 8–12 AM." },
        { name: "🐻 Bear (Middle Sleeper)", tips: "Sleep 11 PM–7 AM. Align with solar cycle. Your peak focus is 10 AM–2 PM. Most common chronotype." },
        { name: "🐺 Wolf (Night Owl)", tips: "Sleep 12 AM–8 AM. Avoid early morning meetings. Your peak focus is 5–9 PM. Use blackout curtains." },
        { name: "🐬 Dolphin (Light Sleeper)", tips: "Sleep 11:30 PM–6:30 AM. White noise essential. Avoid caffeine after 12 PM. Meditation before bed." },
      ],
    },
  },
  cs: {
    label: "Čeština",
    flag: "🇨🇿",
    title: "Deep Sleep Reset — 7-noční protokol",
    subtitle: "Váš vědecky podložený spánkový systém podle chronotypu",
    intro: "Tento protokol je navržen k resetování vašeho cirkadiánního rytmu a dosažení hlubokého, regeneračního spánku během 7 nocí. Přesně dodržujte pokyny každé noci pro maximální výsledky.",
    nights: [
      { night: "Noc 1", title: "Výchozí hodnocení a reset světla", time: "Začněte 90 minut před cílovým časem spánku", steps: ["Nastavte si cílové spánkové okno: 22:00–6:00 (Lev), 23:00–7:00 (Medvěd), 0:00–8:00 (Vlk), 22:30–6:30 (Delfín).", "Ztlumte všechna světla na 10% jasu 90 minut před spaním. Používejte pouze teplé žárovky (2700K) nebo svíčky.", "Přepněte telefon do režimu stupňů šedi a nastavte minimální jas obrazovky.", "Zapište 3 největší starosti do zápisníku — tento 'výplach mozku' zabraňuje přemítání.", "Snižte teplotu v ložnici na 18–20°C. Použijte ventilátor nebo otevřete okno.", "Žádné obrazovky v posledních 30 minutách před spánkem."], science: "Modré světlo potlačuje melatonin až o 50% po dobu 3+ hodin. Tlumení světel spouští produkci melatoninu." },
      { night: "Noc 2", title: "Teplotní a dechový protokol", time: "Začněte 60 minut před spaním", steps: ["Dejte si teplou sprchu nebo koupel 60–90 minut před spaním (NE těsně před). Následné ochlazení těla spouští usínání.", "Procvičujte dýchání 4-7-8: Nádech 4 sec → Zadržení 7 sec → Výdech 8 sec. Opakujte 4 cykly.", "Použijte zátěžovou přikrývku (10% vaší tělesné hmotnosti), pokud ji máte.", "Udržujte teplé nohy — studené nohy signalizují mozku, aby zůstal bdělý. Noste ponožky.", "Dnes se vyhněte alkoholu. Alkohol snižuje REM spánek o 25%.", "Poslední jídlo alespoň 3 hodiny před spaním."], science: "Tělesná teplota musí klesnout o 0,5–1°C pro zahájení spánku. Technika 4-7-8 aktivuje parasympatický nervový systém do 60 sekund." },
      { night: "Noc 3", title: "Rituál uklidnění a reset kortizolu", time: "Vytvořte 45minutový předspánkový rituál", steps: ["Začněte rituál uklidnění každý večer ve stejnou dobu (konzistence je klíčová).", "Pijte heřmánkový čaj nebo teplé mléko s medem — oba obsahují látky podporující spánek.", "Čtěte fyzickou knihu (ne obrazovku) 20 minut.", "Proveďte 10 minut jemného protahování: poloha dítěte, nohy na stěně, supinační twist.", "Naneste levandulový esenciální olej na zápěstí a spánky.", "Napište 3 věci, za které jste vděční — to přepne mozek z režimu ohrožení do režimu bezpečí."], science: "Kortizol (stresový hormon) vrcholí ráno a v noci by měl být na nejnižší úrovni. Konzistentní rituály trénují mozek k asociaci těchto podnětů se spánkem." },
      { night: "Noc 4", title: "Optimalizace spánkového prostředí", time: "Připravte pokoj před zahájením rituálu", steps: ["Udělejte ložnici zcela temnou — použijte zatemňovací závěsy nebo masku na oči. I 1 lux světla narušuje melatonin.", "Použijte bílý nebo hnědý šum při 60–65 dB (ventilátor, přístroj nebo aplikace).", "Odstraňte veškerou elektroniku z ložnice.", "Používejte postel POUZE ke spánku a sexu. Žádná práce, scrollování ani sledování TV v posteli.", "Nastavte budík na stejný čas každé ráno — i o víkendech. To ukotvuje váš cirkadiánní rytmus.", "Pokud se v noci probudíte, nekontrolujte hodiny. Znalost času zvyšuje úzkost."], science: "Spánkové prostředí tvoří 40% kvality spánku. Asociace postel-spánek je nejlépe vědecky podloženou léčbou nespavosti." },
      { night: "Noc 5", title: "Sladění chronotypu a načasování", time: "Upravte celý denní rozvrh", steps: ["Získejte 10 minut jasného slunečního světla do 30 minut po probuzení — to nastaví vaše cirkadiánní hodiny.", "Odložte první kávu o 90 minut po probuzení (nechte kortizol nejprve přirozeně vrcholit).", "Cvičte ráno nebo brzy odpoledne — ne do 4 hodin před spaním.", "Vyhněte se šlofíkům delším než 20 minut a nikdy po 15:00.", "Jezte největší jídlo k obědu, ne k večeři. Těžká večeře zpozdí usínání o 30+ minut.", "Přestaňte s kofeinem do 14:00 (kofein má 6hodinový poločas rozpadu)."], science: "Váš chronotyp určuje optimální spánkové okno. Boj s chronotypem zvyšuje kortizol a snižuje efektivitu spánku až o 30%." },
      { night: "Noc 6", title: "Kognitivně-behaviorální techniky", time: "Řešte mentální stránku spánku", steps: ["Pokud nemůžete usnout do 20 minut, vstaňte a dělejte něco nudného při tlumeném světle, dokud nebudete ospalí.", "Procvičujte 'paradoxní záměr': snažte se zůstat bdělí s otevřenýma očima. To odstraňuje úzkost z výkonu spánku.", "Použijte progresivní svalovou relaxaci: napněte každou svalovou skupinu na 5 sec, pak uvolněte, začínaje od prstů na nohou.", "Nahraďte myšlenky 'nemohu spát' myšlenkami 'moje tělo odpočívá, i když jsem bdělý/á'.", "Vizualizujte klidné místo v živých detailech — zapojte všech 5 smyslů.", "Přijměte bdělost bez boje — odpor vytváří vzrušení, přijetí vytváří relaxaci."], science: "KBT-I (kognitivně-behaviorální terapie nespavosti) je účinnější než prášky na spaní v 80% případů a přináší trvalé výsledky." },
      { night: "Noc 7", title: "Plný reset dokončen — Udržovací protokol", time: "Váš nový spánkový základ", steps: ["Gratulujeme — dokončili jste 7-noční Deep Sleep Reset!", "Změřte výsledky: sledujte, jak rychle jste usnuli, kolikrát jste se probudili a jak odpočatí se cítíte.", "Pokračujte v rituálu uklidnění každý večer — konzistence je to, co udržuje výsledky.", "Pokud máte špatnou noc, nekatastrofizujte. Jedna špatná noc nezruší váš pokrok.", "Zkontrolujte sladění chronotypu — spíte ve svém optimálním okně?", "Sdílejte výsledky a pomozte ostatním — výuka posiluje vaše vlastní návyky."], science: "Zlepšení kvality spánku z behaviorálních intervencí jsou trvalá, pokud jsou udržována. Váš nový cirkadiánní rytmus je nyní ukotven — chraňte ho." },
    ],
    bonusTips: {
      title: "Bonus: Tipy podle chronotypu",
      types: [
        { name: "🦁 Lev (Ranní ptáče)", tips: "Spánek 22:00–6:00. Ranní cvičení. Vyhněte se večerním společenským akcím. Váš vrchol soustředění je 8–12 hod." },
        { name: "🐻 Medvěd (Střední spáč)", tips: "Spánek 23:00–7:00. Slaďte se se solárním cyklem. Váš vrchol soustředění je 10:00–14:00. Nejběžnější chronotyp." },
        { name: "🐺 Vlk (Noční sova)", tips: "Spánek 0:00–8:00. Vyhněte se ranním schůzkám. Váš vrchol soustředění je 17:00–21:00. Používejte zatemňovací závěsy." },
        { name: "🐬 Delfín (Lehký spáč)", tips: "Spánek 23:30–6:30. Bílý šum je nezbytný. Vyhněte se kofeinu po 12:00. Meditace před spaním." },
      ],
    },
  },
  de: { label: "Deutsch", flag: "🇩🇪", title: "Deep Sleep Reset — 7-Nächte-Protokoll", subtitle: "Ihr wissenschaftlich fundiertes Schlaf-System nach Chronotyp", intro: "Dieses Protokoll setzt Ihren circadianen Rhythmus zurück und ermöglicht tiefen, erholsamen Schlaf innerhalb von 7 Nächten.", nights: [{ night: "Nacht 1", title: "Grundbewertung & Licht-Reset", time: "90 Min vor Schlafenszeit beginnen", steps: ["Stellen Sie Ihr Schlaffenster ein: 22–6 Uhr (Löwe), 23–7 Uhr (Bär), 0–8 Uhr (Wolf), 22:30–6:30 (Delfin).", "Dimmen Sie alle Lichter 90 Min vor dem Schlafen auf 10%.", "Telefon auf Graustufen und minimale Helligkeit.", "Schreiben Sie 3 größte Sorgen auf.", "Schlafzimmertemperatur auf 18–20°C.", "Keine Bildschirme in den letzten 30 Min."], science: "Blaues Licht unterdrückt Melatonin bis zu 50% für 3+ Stunden." }, { night: "Nacht 2", title: "Temperatur & Atemprotokoll", time: "60 Min vor Schlafenszeit", steps: ["Warme Dusche 60–90 Min vor dem Schlafen.", "4-7-8 Atmung: Einatmen 4 Sek → Halten 7 Sek → Ausatmen 8 Sek. 4 Zyklen.", "Gewichtsdecke verwenden.", "Warme Socken tragen.", "Kein Alkohol heute.", "Letzte Mahlzeit 3 Stunden vor dem Schlafen."], science: "Körpertemperatur muss um 0,5–1°C sinken, um den Schlaf einzuleiten." }, { night: "Nacht 3", title: "Abendritual & Cortisol-Reset", time: "45-minütiges Ritual aufbauen", steps: ["Ritual täglich zur gleichen Zeit beginnen.", "Kamillentee oder warme Milch mit Honig trinken.", "20 Min physisches Buch lesen.", "10 Min sanftes Stretching.", "Lavendelöl auf Handgelenke und Schläfen.", "3 Dankbarkeiten aufschreiben."], science: "Konsistente Rituale trainieren das Gehirn, diese Signale mit Schlaf zu verbinden." }, { night: "Nacht 4", title: "Schlafumgebung optimieren", time: "Zimmer vor Ritualbeginn vorbereiten", steps: ["Schlafzimmer komplett verdunkeln.", "Weißes Rauschen bei 60–65 dB.", "Elektronik aus dem Schlafzimmer entfernen.", "Bett NUR für Schlaf nutzen.", "Wecker täglich zur gleichen Zeit.", "Nachts nicht auf die Uhr schauen."], science: "Schlafumgebung macht 40% der Schlafqualität aus." }, { night: "Nacht 5", title: "Chronotyp-Ausrichtung", time: "Tagesplan anpassen", steps: ["10 Min Sonnenlicht innerhalb von 30 Min nach dem Aufwachen.", "Ersten Kaffee 90 Min nach dem Aufwachen verzögern.", "Morgens oder früh nachmittags Sport treiben.", "Keine Nickerchen länger als 20 Min nach 15 Uhr.", "Größte Mahlzeit mittags.", "Koffein bis 14 Uhr stoppen."], science: "Ihr Chronotyp bestimmt Ihr optimales Schlaffenster." }, { night: "Nacht 6", title: "Kognitive Techniken", time: "Die mentale Seite des Schlafs angehen", steps: ["Bei 20 Min Wachliegen aufstehen und etwas Langweiliges tun.", "Paradoxe Intention: versuchen wach zu bleiben.", "Progressive Muskelentspannung.", "Gedanken 'Ich kann nicht schlafen' ersetzen.", "Friedlichen Ort visualisieren.", "Wachheit akzeptieren ohne zu kämpfen."], science: "KVT-I ist in 80% der Fälle wirksamer als Schlaftabletten." }, { night: "Nacht 7", title: "Reset abgeschlossen — Erhaltungsprotokoll", time: "Ihre neue Schlafbasis", steps: ["Herzlichen Glückwunsch — Sie haben den 7-Nächte-Reset abgeschlossen!", "Ergebnisse messen.", "Abendritual täglich fortsetzen.", "Eine schlechte Nacht nicht dramatisieren.", "Chronotyp-Ausrichtung überprüfen.", "Ergebnisse teilen."], science: "Schlafverbesserungen durch Verhaltensinterventionen sind dauerhaft." }], bonusTips: { title: "Bonus: Chronotyp-spezifische Tipps", types: [{ name: "🦁 Löwe (Frühaufsteher)", tips: "Schlaf 22–6 Uhr. Morgentraining. Spitzenfokus 8–12 Uhr." }, { name: "🐻 Bär (Mittelschläfer)", tips: "Schlaf 23–7 Uhr. Spitzenfokus 10–14 Uhr." }, { name: "🐺 Wolf (Nachtmensch)", tips: "Schlaf 0–8 Uhr. Spitzenfokus 17–21 Uhr." }, { name: "🐬 Delfin (Leichtschläfer)", tips: "Schlaf 23:30–6:30 Uhr. Weißes Rauschen wichtig." }] } },
};

type LangKey = keyof typeof PROTOCOL_LANGS;
const ALL_LANGS = Object.keys(PROTOCOL_LANGS) as LangKey[];

export default function Protocol() {
  const [lang, setLang] = useState<LangKey>("en");
  const [expandedNight, setExpandedNight] = useState<number | null>(0);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const t = PROTOCOL_LANGS[lang];

  const handleDownloadPDF = () => {
    window.open(`/api/protocol/download?lang=${lang}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      {/* Stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="absolute rounded-full bg-white"
            style={{ width: Math.random() * 2 + 1 + "px", height: Math.random() * 2 + 1 + "px", top: Math.random() * 100 + "%", left: Math.random() * 100 + "%", opacity: Math.random() * 0.5 + 0.1 }} />
        ))}
      </div>

      {/* Header */}
      <div className="sticky top-0 z-40 bg-[#0a0a1a]/95 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Moon className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-sm">Deep Sleep Reset</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Language picker */}
          <div className="relative">
            <button onClick={() => setShowLangPicker(!showLangPicker)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-all">
              <Globe className="w-3.5 h-3.5" />
              <span>{PROTOCOL_LANGS[lang].flag} {PROTOCOL_LANGS[lang].label}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showLangPicker && (
              <div className="absolute right-0 top-full mt-1 bg-[#111827] border border-white/10 rounded-xl p-2 z-50 min-w-[160px] shadow-2xl">
                {ALL_LANGS.map(l => (
                  <button key={l} onClick={() => { setLang(l); setShowLangPicker(false); }}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-all flex items-center gap-2 ${lang === l ? "bg-amber-500/20 text-amber-300" : "text-white/70 hover:bg-white/10"}`}>
                    <span>{PROTOCOL_LANGS[l]?.flag ?? "🌐"}</span>
                    <span>{PROTOCOL_LANGS[l]?.label ?? l.toUpperCase()}</span>
                  </button>
                ))}
                {/* Languages without full translation show English fallback notice */}
                {!ALL_LANGS.includes(lang) && (
                  <p className="text-xs text-white/40 px-3 pt-2">* Full translation coming soon</p>
                )}
              </div>
            )}
          </div>
          <button onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all">
            <Download className="w-3.5 h-3.5" />
            PDF
          </button>
          <Link href="/checkout/success" className="text-xs text-white/40 hover:text-white/70 transition-colors">← Back</Link>
        </div>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-2xl shadow-amber-500/30">
            <Moon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">{t.title}</h1>
          <p className="text-amber-300 font-semibold mb-3">{t.subtitle}</p>
          <p className="text-white/60 text-sm leading-relaxed">{t.intro}</p>
        </div>

        {/* Download CTA */}
        <button onClick={handleDownloadPDF}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-base rounded-2xl shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-[1.01] active:scale-[0.99] transition-all mb-8">
          <Download className="w-5 h-5" />
          Download PDF ({PROTOCOL_LANGS[lang].label})
        </button>

        {/* 7 Nights */}
        <div className="space-y-3 mb-8">
          {t.nights.map((night, idx) => (
            <div key={idx} className="rounded-2xl overflow-hidden border border-white/10"
              style={{ background: "oklch(0.09 0.025 255)" }}>
              <button
                onClick={() => setExpandedNight(expandedNight === idx ? null : idx)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-white/5 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black"
                    style={{ background: `oklch(0.55 0.18 ${65 + idx * 15} / 0.25)`, color: `oklch(0.78 0.18 ${65 + idx * 15})` }}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{night.night}: {night.title}</p>
                    <p className="text-xs text-white/40">{night.time}</p>
                  </div>
                </div>
                {expandedNight === idx ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
              </button>

              {expandedNight === idx && (
                <div className="px-5 pb-5">
                  <div className="space-y-2 mb-4">
                    {night.steps.map((step, si) => (
                      <div key={si} className="flex gap-3 items-start">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                          style={{ background: "oklch(0.55 0.18 65 / 0.2)", color: "oklch(0.78 0.18 65)" }}>
                          {si + 1}
                        </div>
                        <p className="text-sm text-white/80 leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl p-3 text-xs" style={{ background: "oklch(0.65 0.15 240 / 0.1)", border: "1px solid oklch(0.65 0.15 240 / 0.2)" }}>
                    <span className="text-blue-300 font-semibold">Science: </span>
                    <span className="text-white/60">{night.science}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bonus Chronotype Tips */}
        <div className="rounded-2xl p-5 mb-8 border border-amber-500/20" style={{ background: "oklch(0.09 0.025 255)" }}>
          <h3 className="text-base font-bold text-white mb-4">{t.bonusTips.title}</h3>
          <div className="space-y-3">
            {t.bonusTips.types.map((ct, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: "oklch(0.12 0.025 255)" }}>
                <p className="text-sm font-bold text-amber-300 mb-1">{ct.name}</p>
                <p className="text-xs text-white/60">{ct.tips}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-3">
          <button onClick={handleDownloadPDF}
            className="flex items-center justify-center gap-2 mx-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl transition-all text-sm">
            <Download className="w-4 h-4" />
            Save as PDF
          </button>
          <p className="text-white/30 text-xs">© Deep Sleep Reset · 30-day money-back guarantee</p>
          <Link href="/" className="text-amber-400/60 hover:text-amber-400 text-xs transition-colors">← Back to homepage</Link>
        </div>
      </div>
    </div>
  );
}
