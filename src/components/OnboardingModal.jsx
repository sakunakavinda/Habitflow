import React, { useState, useEffect } from 'react';
import {
  CalendarHeart,
  Dumbbell,
  Flame,
  Calendar,
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  BarChart3,
  Share2,
  PlusSquare,
  Star
} from 'lucide-react';
import { getTodayKey, formatDateKey } from '../utils/calendarUtils';

// ─── Step Illustrations ──────────────────────────────────────────────────────

function WelcomeIllustration({ userName }) {
  return (
    <div className="ob-illustration ob-welcome">
      <div className="ob-hero-ring">
        <div className="ob-hero-icon">
          <CalendarHeart size={44} color="#10b981" />
        </div>
        <div className="ob-orbit ob-orbit-1">
          <div className="ob-orbit-dot" style={{ background: '#f59e0b' }}>
            <Dumbbell size={14} color="#fff" />
          </div>
        </div>
        <div className="ob-orbit ob-orbit-2">
          <div className="ob-orbit-dot" style={{ background: '#3b82f6' }}>
            <Flame size={14} color="#fff" />
          </div>
        </div>
        <div className="ob-orbit ob-orbit-3">
          <div className="ob-orbit-dot" style={{ background: '#a855f7' }}>
            <Star size={14} color="#fff" />
          </div>
        </div>
      </div>
      <h2 className="ob-slide-title">
        Welcome{userName ? `, ${userName.split(' ')[0]}` : ''}! 👋
      </h2>
      <p className="ob-slide-desc">
        HabitWave helps you build lasting habits with a beautiful calendar, streak tracking, and daily insights — all in one place.
      </p>
    </div>
  );
}

function LogHabitsIllustration() {
  return (
    <div className="ob-illustration">
      <div className="ob-demo-calendar">
        {[1,2,3,4,5,6,7].map(d => (
          <div
            key={d}
            className={`ob-demo-cell ${d <= 5 ? 'ob-demo-cell--done' : ''} ${d === 6 ? 'ob-demo-cell--today' : ''}`}
          >
            {d <= 5 && <CheckCircle2 size={14} color="#10b981" />}
            {d === 6 && <span className="ob-today-dot" />}
          </div>
        ))}
      </div>
      <h2 className="ob-slide-title">Log Your Habits Daily</h2>
      <p className="ob-slide-desc">
        Tap any day on the calendar to log your habits. Use <strong>Quick Mode</strong> to tap cells directly on the grid for even faster logging.
      </p>
    </div>
  );
}

function TrackStreaksIllustration() {
  return (
    <div className="ob-illustration">
      <div className="ob-stats-preview">
        <div className="ob-stat-card">
          <Flame size={22} color="#f59e0b" />
          <div className="ob-stat-num">12</div>
          <div className="ob-stat-label">Day Streak</div>
        </div>
        <div className="ob-stat-card ob-stat-card--accent">
          <BarChart3 size={22} color="#10b981" />
          <div className="ob-stat-num">87%</div>
          <div className="ob-stat-label">This Month</div>
        </div>
        <div className="ob-stat-card">
          <Star size={22} color="#a855f7" />
          <div className="ob-stat-num">34</div>
          <div className="ob-stat-label">Total Days</div>
        </div>
      </div>
      <h2 className="ob-slide-title">Watch Your Progress Grow</h2>
      <p className="ob-slide-desc">
        HabitWave automatically tracks streaks and monthly consistency. The longer your streak, the more satisfying it gets — don't break the chain! 🔥
      </p>
    </div>
  );
}

function StartDateStep({ selectedDate, setSelectedDate }) {
  const todayKey = getTodayKey();
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = formatDateKey(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
  const firstOfMonthKey = formatDateKey(now.getFullYear(), now.getMonth(), 1);

  const presets = [
    { label: 'Today', key: todayKey },
    { label: 'Yesterday', key: yesterdayKey },
    { label: 'Start of Month', key: firstOfMonthKey }
  ];

  const [y, m, d] = selectedDate.split('-').map(Number);
  const displayDate = new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
  });

  return (
    <div className="ob-illustration ob-start-date">
      <div className="ob-start-icon-badge">
        <CalendarHeart size={30} color="#10b981" />
      </div>
      <h2 className="ob-slide-title">When Did You Start?</h2>
      <p className="ob-slide-desc">
        Choose your journey start date. All streaks and stats count from this day forward.
      </p>

      <div className="ob-callout">
        <Sparkles size={14} color="#f59e0b" />
        <span>This sets the baseline for all your habit stats.</span>
      </div>

      <div className="ob-presets">
        {presets.map(p => (
          <button
            key={p.key}
            type="button"
            className={`ob-preset-btn ${selectedDate === p.key ? 'active' : ''}`}
            onClick={() => setSelectedDate(p.key)}
          >
            {selectedDate === p.key && <CheckCircle2 size={12} />}
            {p.label}
          </button>
        ))}
      </div>

      <div className="ob-date-input-wrap">
        <label htmlFor="ob-date-input" className="ob-date-label">
          <Calendar size={13} /> Custom date:
        </label>
        <input
          id="ob-date-input"
          type="date"
          className="sdm-date-input"
          value={selectedDate}
          max={todayKey}
          onChange={e => e.target.value && setSelectedDate(e.target.value)}
        />
      </div>

      <div className="ob-date-preview">
        <span className="ob-date-preview-label">Tracking starts:</span>
        <span className="ob-date-preview-value">{displayDate}</span>
      </div>
    </div>
  );
}

function AddToHomeStep() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return (
    <div className="ob-illustration ob-pwa">
      <div className="ob-pwa-icon-wrap">
        <div className="ob-pwa-phone">
          <Smartphone size={40} color="#3b82f6" />
          <div className="ob-pwa-badge-dot" />
        </div>
      </div>
      <h2 className="ob-slide-title">Add to Home Screen</h2>
      <p className="ob-slide-desc">
        Install HabitWave for one-tap access, offline support, and live streak badges on your app icon.
      </p>

      {isIOS && (
        <div className="ob-pwa-steps">
          <div className="ob-pwa-step">
            <div className="ob-pwa-step-num">1</div>
            <div>Tap the <strong>Share</strong> button <Share2 size={13} style={{ verticalAlign: 'middle' }} /> in Safari</div>
          </div>
          <div className="ob-pwa-step">
            <div className="ob-pwa-step-num">2</div>
            <div>Select <strong>"Add to Home Screen"</strong> <PlusSquare size={13} style={{ verticalAlign: 'middle' }} /></div>
          </div>
          <div className="ob-pwa-step">
            <div className="ob-pwa-step-num">3</div>
            <div>Tap <strong>Add</strong> in the top right corner</div>
          </div>
        </div>
      )}

      {isAndroid && (
        <div className="ob-pwa-steps">
          <div className="ob-pwa-step">
            <div className="ob-pwa-step-num">1</div>
            <div>Tap the <strong>⋮ menu</strong> in Chrome</div>
          </div>
          <div className="ob-pwa-step">
            <div className="ob-pwa-step-num">2</div>
            <div>Tap <strong>"Add to Home screen"</strong></div>
          </div>
        </div>
      )}

      {!isIOS && !isAndroid && (
        <div className="ob-pwa-steps">
          <div className="ob-pwa-step">
            <div className="ob-pwa-step-num">💡</div>
            <div>On mobile, open HabitWave in your browser and use the browser menu to install it to your home screen.</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step Config ─────────────────────────────────────────────────────────────

const STEPS = [
  { id: 'welcome',    skippable: true  },
  { id: 'log',       skippable: true  },
  { id: 'streaks',   skippable: true  },
  { id: 'startdate', skippable: false },
  { id: 'pwa',       skippable: true  },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OnboardingModal({ isOpen, userName, onComplete }) {
  const todayKey = getTodayKey();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState('forward');
  const [animKey, setAnimKey] = useState(0);
  const [startDate, setStartDate] = useState(todayKey);
  const [startDateError, setStartDateError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setDirection('forward');
      setStartDate(todayKey);
      setStartDateError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentStep = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const isFirst = step === 0;
  const isStartDateStep = currentStep.id === 'startdate';

  const goNext = () => {
    if (isStartDateStep && !startDate) {
      setStartDateError('Please select a start date to continue.');
      return;
    }
    setStartDateError('');
    if (isLast) {
      onComplete(startDate);
      return;
    }
    setDirection('forward');
    setAnimKey(k => k + 1);
    setStep(s => s + 1);
  };

  const goPrev = () => {
    if (isFirst) return;
    setDirection('back');
    setAnimKey(k => k + 1);
    setStep(s => s - 1);
  };

  const handleSkip = () => {
    if (!currentStep.skippable) return;
    if (isLast) {
      onComplete(startDate);
      return;
    }
    setDirection('forward');
    setAnimKey(k => k + 1);
    setStep(s => s + 1);
  };

  const renderSlide = () => {
    switch (currentStep.id) {
      case 'welcome':   return <WelcomeIllustration userName={userName} />;
      case 'log':       return <LogHabitsIllustration />;
      case 'streaks':   return <TrackStreaksIllustration />;
      case 'startdate': return <StartDateStep selectedDate={startDate} setSelectedDate={setStartDate} />;
      case 'pwa':       return <AddToHomeStep />;
      default:          return null;
    }
  };

  return (
    <div className="modal-overlay ob-overlay">
      <div
        className="modal-content onboarding-modal"
        onClick={e => e.stopPropagation()}
      >
        {/* Top bar — step dots + skip */}
        <div className="ob-topbar">
          <div className="ob-dots">
            {STEPS.map((s, i) => (
              <div
                key={s.id}
                className={`ob-dot ${i === step ? 'ob-dot--active' : ''} ${i < step ? 'ob-dot--done' : ''}`}
              />
            ))}
          </div>
          {currentStep.skippable && !isLast && (
            <button type="button" className="ob-skip-btn" onClick={handleSkip}>
              Skip
            </button>
          )}
        </div>

        {/* Animated slide */}
        <div key={animKey} className={`ob-slide ob-slide--${direction}`}>
          {renderSlide()}
        </div>

        {/* Start date validation error */}
        {startDateError && (
          <div className="ob-error">{startDateError}</div>
        )}

        {/* Footer navigation */}
        <div className="ob-footer">
          {!isFirst ? (
            <button type="button" className="ob-back-btn" onClick={goPrev}>
              <ArrowLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            className={`ob-next-btn${isStartDateStep ? ' ob-next-btn--required' : ''}`}
            onClick={goNext}
          >
            {isLast ? (
              <>Done! <CheckCircle2 size={16} /></>
            ) : isStartDateStep ? (
              <>Set Date & Continue <ArrowRight size={16} /></>
            ) : (
              <>Next <ArrowRight size={16} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
