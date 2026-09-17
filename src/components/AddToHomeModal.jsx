import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X, Smartphone, CheckCircle2, Share2, PlusSquare } from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: 'Tap the Share Button',
    subtitle: 'At the bottom of Safari, tap the Share icon (the square with an arrow pointing up).',
    image: '/guides/step-1.jpg',
    icon: Share2,
    badgeColor: '#10b981'
  },
  {
    step: 2,
    title: "Select 'Add to Home Screen'",
    subtitle: "Scroll down the share sheet and tap the 'Add to Home Screen' option.",
    image: '/guides/step-2.jpg',
    icon: PlusSquare,
    badgeColor: '#3b82f6'
  },
  {
    step: 3,
    title: "Tap 'Add' in Top Right",
    subtitle: "Confirm 'HabitWave' and tap Add. Launch it directly from your home screen anytime!",
    image: '/guides/step-3.jpg',
    icon: CheckCircle2,
    badgeColor: '#f59e0b'
  }
];

export default function AddToHomeModal({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const stepData = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;
  const isFirst = currentStep === 0;

  const handleNext = () => {
    if (isLast) {
      if (onComplete) onComplete();
      else if (onClose) onClose();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirst) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
  };

  const StepIcon = stepData.icon;

  return (
    <div className="modal-overlay" onClick={handleClose} style={{ zIndex: 100000 }}>
      <div 
        className="modal-content add-to-home-modal glass-card"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="ath-header">
          <div className="ath-header-left">
            <div className="ath-icon-badge">
              <Smartphone size={20} color="#10b981" />
            </div>
            <div>
              <h2 className="ath-title">Add to Home Screen</h2>
              <p className="ath-subtitle">Install HabitWave for instant offline access</p>
            </div>
          </div>
          <button 
            className="btn-icon-subtle ath-close-btn"
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Indicator Progress Bar */}
        <div className="ath-step-progress">
          <div className="ath-step-indicator">
            <span className="ath-step-badge" style={{ backgroundColor: `${stepData.badgeColor}22`, color: stepData.badgeColor }}>
              <StepIcon size={14} style={{ marginRight: 5 }} />
              Step {stepData.step} of 3
            </span>
          </div>

          <div className="ath-dots">
            {STEPS.map((s, idx) => (
              <button
                key={s.step}
                type="button"
                className={`ath-dot ${idx === currentStep ? 'active' : ''}`}
                onClick={() => setCurrentStep(idx)}
                aria-label={`Go to step ${s.step}`}
              />
            ))}
          </div>
        </div>

        {/* Step Title & Description */}
        <div className="ath-step-info">
          <h3 className="ath-step-title">{stepData.title}</h3>
          <p className="ath-step-desc">{stepData.subtitle}</p>
        </div>

        {/* Image Display Frame (100% uncropped display) */}
        <div className="ath-image-container">
          <div className="ath-image-wrapper">
            <img 
              src={stepData.image} 
              alt={`Step ${stepData.step}: ${stepData.title}`} 
              className="ath-guide-img"
              loading="eager"
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="ath-actions">
          <button
            type="button"
            className="ath-btn-prev"
            onClick={handlePrev}
            disabled={isFirst}
            style={{ visibility: isFirst ? 'hidden' : 'visible' }}
          >
            <ChevronLeft size={18} /> Back
          </button>

          <button
            type="button"
            className={`ath-btn-next ${isLast ? 'ath-btn-finish' : ''}`}
            onClick={handleNext}
          >
            {isLast ? (
              <>Got it, I'm Ready! 🎉</>
            ) : (
              <>Next Step <ChevronRight size={18} /></>
            )}
          </button>
        </div>

        {/* Skip note */}
        <div className="ath-footer-note">
          <button type="button" className="ath-skip-link" onClick={handleClose}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
