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
  SlidersHorizontal,
  MousePointer,
  Share2,
  PlusSquare,
  Star,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { getTodayKey, formatDateKey } from '../utils/calendarUtils';

// ─── Reusable: Pulsing Tap Indicator ────────────────────────────────────────
function TapIndicator({ style = {} }) {
  return (
    <div className="ob-tap-wrap" style={style}>
      <div className="ob-tap-ripple" />
      <div className="ob-tap-cursor">
        <MousePointer size={14} color="#fff" />
      </div>
    </div>
  );
}

// ─── Reusable: Callout label with arrow ─────────────────────────────────────
function CalloutLabel({ children, align = 'left' }) {
  return (
    <div className={`ob-callout-label ob-callout-label--${align}`}>
      <span className="ob-callout-arrow">↑</span>
      <span className="ob-callout-text">{children}</span>
    </div>
  );
}

// ─── Step 1: Welcome ─────────────────────────────────────────────────────────
function WelcomeIllustration({ userName }) {
  return (
    <div className="ob-illustration ob-welcome">
      <div className="ob-hero-ring">
        <div className="ob-hero-icon">
          <CalendarHeart size={42} color="#10b981" />
        </div>
        <div className="ob-orbit ob-orbit-1">
          <div className="ob-orbit-dot" style={{ background: '#f59e0b' }}>
            <Dumbbell size={13} color="#fff" />
          </div>
        </div>
        <div className="ob-orbit ob-orbit-2">
          <div className="ob-orbit-dot" style={{ background: '#3b82f6' }}>
            <Flame size={13} color="#fff" />
          </div>
        </div>
        <div className="ob-orbit ob-orbit-3">
          <div className="ob-orbit-dot" style={{ background: '#a855f7' }}>
            <Star size={13} color="#fff" />
          </div>
        </div>
      </div>

      <h2 className="ob-slide-title">
        Welcome{userName ? `, ${userName.split(' ')[0]}` : ''}! 👋
      </h2>
      <p className="ob-slide-desc">
        HabitWave is your personal habit calendar. Here's what you can do:
      </p>

      <div className="ob-feature-list">
        <div className="ob-feature-item">
          <div className="ob-feature-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
            <Calendar size={15} />
          </div>
          <div>
            <div className="ob-feature-label">Calendar Logging</div>
            <div className="ob-feature-sub">Tap any day to record your habits</div>
          </div>
        </div>
        <div className="ob-feature-item">
          <div className="ob-feature-icon" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
            <Flame size={15} />
          </div>
          <div>
            <div className="ob-feature-label">Streak Tracking</div>
            <div className="ob-feature-sub">Watch your consistency grow day by day</div>
          </div>
        </div>
        <div className="ob-feature-item">
          <div className="ob-feature-icon" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7' }}>
            <SlidersHorizontal size={15} />
          </div>
          <div>
            <div className="ob-feature-label">Custom Habits</div>
            <div className="ob-feature-sub">Add goals with your own icons and colors</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Log Habits ───────────────────────────────────────────────────────
function LogHabitsIllustration() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return (
    <div className="ob-illustration ob-log">
      {/* Quick Mode bar replica */}
      <div className="ob-ui-section">
        <div className="ob-section-label">① Select your tap mode</div>
        <div className="ob-ui-quickmode">
          <div className="ob-ui-mode-btn">
            <MousePointer size={12} /> Detail View
          </div>
          <div className="ob-ui-mode-btn ob-ui-mode-btn--active">
            <Dumbbell size={12} color="#f59e0b" /> Worked Out
          </div>
          <div className="ob-ui-mode-btn">
            <Sparkles size={12} /> All Habits
          </div>
        </div>
        <div className="ob-hint-text">Choose a mode — "Detail View" opens a day panel, habit tabs toggle directly on the calendar.</div>
      </div>

      {/* Calendar row replica */}
      <div className="ob-ui-section">
        <div className="ob-section-label">② Tap a day cell to log</div>
        <div className="ob-mini-calendar">
          {days.map((day, i) => (
            <div key={day} className={`ob-mini-cell ${i < 3 ? 'ob-mini-cell--done' : ''} ${i === 4 ? 'ob-mini-cell--pulse' : ''}`}>
              <div className="ob-mini-cell-day">{day}</div>
              {i < 3 && <CheckCircle2 size={13} color="#10b981" />}
              {i === 3 && <div className="ob-mini-cell-empty" />}
              {i === 4 && (
                <div className="ob-mini-cell-empty" />
              )}
              {i === 4 && <TapIndicator style={{ position: 'absolute', bottom: -8, right: -8 }} />}
            </div>
          ))}
        </div>
        <CalloutLabel align="right">Tap to log today</CalloutLabel>
      </div>
    </div>
  );
}

// ─── Step 3: Manage Habits ────────────────────────────────────────────────────
function ManageHabitsIllustration() {
  return (
    <div className="ob-illustration ob-habits">
      {/* Header button replica */}
      <div className="ob-ui-section">
        <div className="ob-section-label">① Find the Habits button in the top bar</div>
        <div className="ob-ui-header-bar">
          <div className="ob-ui-brand">
            <CalendarHeart size={16} color="#10b981" />
            <span>HabitWave</span>
          </div>
          <div className="ob-ui-header-btns">
            <div className="ob-ui-header-btn ob-ui-header-btn--pulse">
              <SlidersHorizontal size={12} />
              <span>Habits</span>
              <TapIndicator style={{ top: -10, right: -10 }} />
            </div>
            <div className="ob-ui-header-btn">
              <Smartphone size={12} />
              <span>Widgets</span>
            </div>
          </div>
        </div>
        <CalloutLabel align="right">Tap "Habits" to manage</CalloutLabel>
      </div>

      {/* Habit panel replica */}
      <div className="ob-ui-section">
        <div className="ob-section-label">② Manage habits in the panel</div>
        <div className="ob-ui-habits-panel">
          <div className="ob-ui-habit-item">
            <div className="ob-ui-habit-dot" style={{ background: '#f59e0b' }}>
              <Dumbbell size={13} color="#fff" />
            </div>
            <span className="ob-ui-habit-name">Worked Out</span>
            <div className="ob-ui-habit-del"><Trash2 size={12} /></div>
          </div>
          <div className="ob-ui-add-habit-btn">
            <Plus size={13} /> Add New Habit
          </div>
        </div>
        <div className="ob-hint-text">Add custom habits with unique colors, icons, and names.</div>
      </div>
    </div>
  );
}

// ─── Step 4: Track Streaks ────────────────────────────────────────────────────
function TrackStreaksIllustration() {
  return (
    <div className="ob-illustration ob-streaks">
      <div className="ob-ui-section">
        <div className="ob-section-label">Your stats appear at the top of the app</div>
        {/* Stat card replica — uses real CSS classes */}
        <div className="ob-stat-replica">
          <div className="glass-card stat-card" style={{ borderLeft: '3px solid #f59e0b', margin: 0 }}>
            <div className="stat-top">
              <span className="stat-label">Worked Out</span>
              <div className="stat-icon" style={{ backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                <Dumbbell size={16} color="#f59e0b" />
              </div>
            </div>
            <div className="stat-number-row">
              <span className="stat-number" style={{ color: '#f59e0b' }}>14</span>
              <span className="stat-subtext">/ 30 days</span>
            </div>
            <div className="stat-progress-bar">
              <div className="stat-progress-fill" style={{ width: '47%', backgroundColor: '#f59e0b' }} />
            </div>
            <div className="stat-bottom-row">
              <span className="stat-subtext">47% consistency</span>
              <span className="stat-streak-badge" style={{ color: '#f59e0b' }}>🔥 14d</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ob-ui-section">
        <div className="ob-section-label">Plus summary cards for perfect days &amp; streaks</div>
        <div className="ob-mini-stat-row">
          <div className="glass-card stat-card double-win" style={{ flex: 1, margin: 0, padding: '0.65rem' }}>
            <div className="stat-top">
              <span className="stat-label" style={{ fontSize: '0.7rem' }}>All Habits</span>
              <Sparkles size={14} />
            </div>
            <div className="stat-number-row">
              <span className="stat-number" style={{ fontSize: '1.35rem' }}>8</span>
              <span className="stat-subtext">perfect days</span>
            </div>
          </div>
          <div className="glass-card stat-card streak" style={{ flex: 1, margin: 0, padding: '0.65rem' }}>
            <div className="stat-top">
              <span className="stat-label" style={{ fontSize: '0.7rem' }}>Top Streak</span>
              <Flame size={14} />
            </div>
            <div className="stat-number-row">
              <span className="stat-number" style={{ fontSize: '1.35rem' }}>14</span>
              <span className="stat-subtext">consecutive</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 5: Set Start Date ───────────────────────────────────────────────────
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

// ─── Step 6: Add to Home Screen (Swipable Guide Screenshots) ─────────────────
const ATH_GUIDE_SLIDES = [
  {
    step: 1,
    title: 'Tap the Share Button',
    instruction: "At the bottom of Safari, tap the Share button (square with arrow pointing up).",
    img: '/guides/step-1.jpg',
    badge: 'Step 1 of 3'
  },
  {
    step: 2,
    title: "Select 'Add to Home Screen'",
    instruction: "Scroll down the share sheet options and tap 'Add to Home Screen'.",
    img: '/guides/step-2.jpg',
    badge: 'Step 2 of 3'
  },
  {
    step: 3,
    title: "Tap 'Add' in Top Right",
    instruction: "Confirm 'HabitWave' and tap Add in the top-right corner to install.",
    img: '/guides/step-3.jpg',
    badge: 'Step 3 of 3'
  }
];

function AddToHomeStep() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(null);

  const prevSlide = () => {
    setActiveSlide(idx => Math.max(0, idx - 1));
  };

  const nextSlide = () => {
    setActiveSlide(idx => Math.min(ATH_GUIDE_SLIDES.length - 1, idx + 1));
  };

  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length === 1) {
      setTouchStartX(e.touches[0].clientX);
      setTouchStartY(e.touches[0].clientY);
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;

    if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
  };

  const handleMouseUp = (e) => {
    if (!isDragging || dragStartX === null) return;
    const deltaX = e.clientX - dragStartX;
    if (Math.abs(deltaX) > 35) {
      if (deltaX < 0) nextSlide();
      else prevSlide();
    }
    setIsDragging(false);
    setDragStartX(null);
  };

  const current = ATH_GUIDE_SLIDES[activeSlide];

  return (
    <div className="ob-illustration ob-pwa-swipable">
      <div className="ob-pwa-slide-header">
        <div className="ob-pwa-badge-row">
          <span className="ob-pwa-pill-badge">
            <Smartphone size={12} /> {current.badge}
          </span>
          <span className="ob-pwa-swipe-hint">👈 Swipe or use arrows 👉</span>
        </div>
        <h3 className="ob-pwa-step-heading">{current.title}</h3>
        <p className="ob-pwa-step-sub">{current.instruction}</p>
      </div>

      {/* Swipable Carousel Frame */}
      <div
        className="ob-carousel-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* Previous Button */}
        {activeSlide > 0 && (
          <button
            type="button"
            className="ob-carousel-arrow ob-carousel-arrow--left"
            onClick={(e) => { e.stopPropagation(); prevSlide(); }}
            aria-label="Previous step image"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Next Button */}
        {activeSlide < ATH_GUIDE_SLIDES.length - 1 && (
          <button
            type="button"
            className="ob-carousel-arrow ob-carousel-arrow--right"
            onClick={(e) => { e.stopPropagation(); nextSlide(); }}
            aria-label="Next step image"
          >
            <ChevronRight size={20} />
          </button>
        )}

        {/* Sliding Track */}
        <div
          className="ob-carousel-track"
          style={{ transform: `translateX(-${activeSlide * 100}%)` }}
        >
          {ATH_GUIDE_SLIDES.map((slide) => (
            <div className="ob-carousel-slide" key={slide.step}>
              <div className="ob-carousel-img-wrap">
                <img
                  src={slide.img}
                  alt={`Step ${slide.step}: ${slide.title}`}
                  className="ob-carousel-img"
                  draggable={false}
                  loading="eager"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="ob-pwa-pagination">
        {ATH_GUIDE_SLIDES.map((slide, idx) => (
          <button
            key={slide.step}
            type="button"
            className={`ob-pwa-dot ${idx === activeSlide ? 'active' : ''}`}
            onClick={() => setActiveSlide(idx)}
            aria-label={`Go to step image ${slide.step}`}
          >
            <span className="ob-pwa-dot-inner" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step Config ──────────────────────────────────────────────────────────────
const STEPS = [
  { id: 'welcome',    skippable: true  },
  { id: 'log',       skippable: true  },
  { id: 'habits',    skippable: true  },
  { id: 'streaks',   skippable: true  },
  { id: 'startdate', skippable: false },
  { id: 'pwa',       skippable: true  },
];

const STEP_TITLES = {
  welcome:   'Welcome to HabitWave',
  log:       'Log Habits Daily',
  habits:    'Manage Your Habits',
  streaks:   'Track Your Streaks',
  startdate: 'Set Your Start Date',
  pwa:       'Add to Home Screen',
};

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
      case 'habits':    return <ManageHabitsIllustration />;
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
        {/* Top bar: dots + step title + skip */}
        <div className="ob-topbar">
          <div className="ob-topbar-left">
            <div className="ob-dots">
              {STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={`ob-dot ${i === step ? 'ob-dot--active' : ''} ${i < step ? 'ob-dot--done' : ''}`}
                />
              ))}
            </div>
            <span className="ob-step-counter">{step + 1} / {STEPS.length}</span>
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

        {/* Start date error */}
        {startDateError && (
          <div className="ob-error">{startDateError}</div>
        )}

        {/* Footer */}
        <div className="ob-footer">
          {!isFirst ? (
            <button type="button" className="ob-back-btn" onClick={goPrev}>
              <ArrowLeft size={15} /> Back
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
              <>All Done! <CheckCircle2 size={15} /></>
            ) : isStartDateStep ? (
              <>Set Date & Continue <ArrowRight size={15} /></>
            ) : (
              <>Next <ArrowRight size={15} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
