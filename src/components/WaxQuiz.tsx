import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, RotateCcw } from 'lucide-react';
import { AddToCartButton } from '@/components/AddToCartButton';
import { getProductById } from '@/lib/data';

interface Props {
  de: boolean;
  onClose: () => void;
}

type Answer = string | null;

const QUESTIONS_DE = [
  {
    q: 'Bei welchem Wetter fährst du hauptsächlich?',
    options: [
      { id: 'sun', label: '☀️ Trocken / Sommer' },
      { id: 'rain', label: '🌧️ Oft im Regen' },
      { id: 'both', label: '⛅ Beides / Ganzjahr' },
    ],
  },
  {
    q: 'Welches Fahrrad fährst du?',
    options: [
      { id: 'road', label: '🚴 Rennrad / Gravel' },
      { id: 'mtb', label: '🚵 MTB / Trekking' },
      { id: 'ebike', label: '⚡ E-Bike' },
    ],
  },
  {
    q: 'Wie oft fährst du pro Woche?',
    options: [
      { id: 'daily', label: '🔥 Fast täglich' },
      { id: 'regular', label: '🚲 2–3× pro Woche' },
      { id: 'occasional', label: '🗓️ Gelegentlich' },
    ],
  },
];

const QUESTIONS_EN = [
  {
    q: 'What conditions do you mainly ride in?',
    options: [
      { id: 'sun', label: '☀️ Dry / Summer' },
      { id: 'rain', label: '🌧️ Often in the rain' },
      { id: 'both', label: '⛅ Both / Year-round' },
    ],
  },
  {
    q: 'What type of bike do you ride?',
    options: [
      { id: 'road', label: '🚴 Road / Gravel' },
      { id: 'mtb', label: '🚵 MTB / Trekking' },
      { id: 'ebike', label: '⚡ E-Bike' },
    ],
  },
  {
    q: 'How often do you ride per week?',
    options: [
      { id: 'daily', label: '🔥 Almost daily' },
      { id: 'regular', label: '🚲 2–3× per week' },
      { id: 'occasional', label: '🗓️ Occasionally' },
    ],
  },
];

function getRecommendation(answers: Answer[]): 'pro' | 'classic' | 'classic-small' {
  const [weather, bike, freq] = answers;
  if (bike === 'ebike' || weather === 'rain' || weather === 'both' || freq === 'daily') return 'pro';
  if (freq === 'occasional') return 'classic-small';
  return 'classic';
}

const PRO_REASONS_DE = [
  'MoS₂-Formel für besseren Schutz bei Nässe und hohem Drehmoment',
  'Niedrigerer Reibungskoeffizient (0,03–0,06) — auch unter Last',
  'Funktioniert bis −8 °C ohne Einbußen',
];
const PRO_REASONS_EN = [
  'MoS₂ formula for better protection in wet conditions and high torque',
  'Lower friction coefficient (0.03–0.06) — even under load',
  'Works down to −8 °C without compromise',
];
const CLASSIC_REASONS_DE = [
  'Saubere, trockene Classic-Formel — ideal für Frühling bis Herbst',
  'Paraffin + PTFE: bewährt, einfach, effizient',
  '20–32 Anwendungen pro 500g Block — günstig pro km',
];
const CLASSIC_REASONS_EN = [
  'Clean, dry Classic formula — ideal from spring through autumn',
  'Paraffin + PTFE: proven, simple, efficient',
  '20–32 applications per 500g block — low cost per km',
];
const SMALL_REASONS_DE = [
  '300 g Block — ideal für Gelegenheitsfahrer (6–12 Anwendungen)',
  'Gleiche Classic-Formel: Paraffin + PTFE, sauber und effizient',
  'Günstiger Einstiegspreis — perfekt zum Ausprobieren',
];
const SMALL_REASONS_EN = [
  '300 g block — ideal for occasional riders (6–12 applications)',
  'Same Classic formula: paraffin + PTFE, clean and efficient',
  'Lower entry price — perfect for trying out wax lubing',
];

export function WaxQuiz({ de, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([null, null, null]);
  const [done, setDone] = useState(false);

  const questions = de ? QUESTIONS_DE : QUESTIONS_EN;
  const totalSteps = questions.length;

  const handleAnswer = (optionId: string) => {
    const next = [...answers];
    next[step] = optionId;
    setAnswers(next);
    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  };

  const restart = () => {
    setStep(0);
    setAnswers([null, null, null]);
    setDone(false);
  };

  const recommendation = done ? getRecommendation(answers) : null;
  const productId =
    recommendation === 'pro' ? 'wax-500-mos2' :
    recommendation === 'classic-small' ? 'wax-300' :
    'wax-500';
  const product = getProductById(productId);
  const reasons =
    recommendation === 'pro'
      ? (de ? PRO_REASONS_DE : PRO_REASONS_EN)
      : recommendation === 'classic-small'
      ? (de ? SMALL_REASONS_DE : SMALL_REASONS_EN)
      : (de ? CLASSIC_REASONS_DE : CLASSIC_REASONS_EN);

  return (
    <div
      className="rounded-xl overflow-hidden mt-4"
      style={{ border: '1px solid rgba(43,82,176,0.35)', background: 'rgba(43,82,176,0.05)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 border-b"
        style={{ borderColor: 'rgba(43,82,176,0.20)' }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: '#2B52B0' }}>
          {de ? 'Wachs-Empfehlung' : 'Wax Recommendation'}
        </p>
        <button
          onClick={onClose}
          className="p-1 text-wx-txf hover:text-wx-tx1 transition-colors"
          aria-label={de ? 'Schließen' : 'Close'}
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-5 py-5">
        {!done ? (
          <>
            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mb-5">
              {questions.map((_, i) => (
                <div
                  key={i}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? '20px' : '6px',
                    background: i <= step ? '#2B52B0' : 'var(--bd2)',
                  }}
                />
              ))}
            </div>

            {/* Question */}
            <p className="text-[15px] font-semibold text-wx-tx1 mb-4">
              {questions[step].q}
            </p>

            {/* Options */}
            <div className="grid grid-cols-1 gap-2">
              {questions[step].options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleAnswer(opt.id)}
                  className="text-left px-4 py-3 rounded-xl text-[14px] font-medium transition-all hover:opacity-90 active:scale-[0.98]"
                  style={{
                    background: 'var(--sf)',
                    border: '1px solid var(--bd)',
                    color: 'var(--tx1)',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#2B52B0';
                    (e.currentTarget as HTMLElement).style.background = 'rgba(43,82,176,0.08)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--bd)';
                    (e.currentTarget as HTMLElement).style.background = 'var(--sf)';
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Result */}
            <div className="flex items-start gap-4 mb-5">
              {product && (
                <img
                  src={product.image}
                  alt={de ? product.title : product.titleEn}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                  style={{ border: '1px solid var(--bd2)', objectPosition: product.imagePosition ?? 'center' }}
                />
              )}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: '#2B52B0' }}>
                  {de ? 'Dein Wachs' : 'Your wax'}
                </p>
                <p className="text-[16px] font-bold text-wx-tx1 leading-snug">
                  {product ? (de ? product.title : product.titleEn) : ''}
                </p>
              </div>
            </div>

            {/* Why it fits */}
            <ul className="space-y-2 mb-5">
              {reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-[13px]" style={{ color: 'var(--txm)' }}>
                  <span className="mt-0.5 text-[10px]" style={{ color: '#2B52B0' }}>✓</span>
                  {r}
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col gap-2">
              {product && <AddToCartButton product={product} fullWidth />}
              <div className="flex items-center justify-between gap-3">
                <Link
                  to={`/produkt/${productId}`}
                  className="text-[12px] hover:underline"
                  style={{ color: '#264E8C' }}
                >
                  {de ? 'Mehr erfahren →' : 'Learn more →'}
                </Link>
                <button
                  onClick={restart}
                  className="flex items-center gap-1 text-[12px] transition-colors hover:text-wx-tx1"
                  style={{ color: 'var(--txf)' }}
                >
                  <RotateCcw className="h-3 w-3" />
                  {de ? 'Neu starten' : 'Retake'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
