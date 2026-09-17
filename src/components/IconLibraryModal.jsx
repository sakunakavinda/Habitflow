import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Search, Check, Sparkles } from 'lucide-react';
import { AVAILABLE_ICONS, ICON_CATEGORIES } from '../utils/habitIcons';

export function IconLibraryModal({
  isOpen,
  selectedIcon,
  selectedColor = '#f59e0b',
  onSelectIcon,
  onClose
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [previewIconId, setPreviewIconId] = useState(selectedIcon || 'dumbbell');
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPreviewIconId(selectedIcon || 'dumbbell');
      setSearchQuery('');
      setActiveCategory('all');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, selectedIcon]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter icons based on category and search query
  const filteredIcons = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return AVAILABLE_ICONS.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      // Search filter
      if (!query) return true;

      const labelMatch = item.label.toLowerCase().includes(query);
      const idMatch = item.id.toLowerCase().includes(query);
      const tagMatch = item.tags ? item.tags.toLowerCase().includes(query) : false;
      return labelMatch || idMatch || tagMatch;
    });
  }, [searchQuery, activeCategory]);

  const activeIconItem = useMemo(() => {
    return (
      AVAILABLE_ICONS.find((i) => i.id === previewIconId) ||
      AVAILABLE_ICONS.find((i) => i.id === selectedIcon) ||
      AVAILABLE_ICONS[0]
    );
  }, [previewIconId, selectedIcon]);

  if (!isOpen) return null;

  const handlePickIcon = (iconId) => {
    setPreviewIconId(iconId);
    onSelectIcon(iconId);
    onClose();
  };

  const handleSingleClick = (iconId) => {
    setPreviewIconId(iconId);
  };

  const handleConfirm = () => {
    if (previewIconId) {
      onSelectIcon(previewIconId);
    }
    onClose();
  };

  const ActiveIconComponent = activeIconItem.icon;

  return (
    <div className="modal-overlay icon-library-overlay" onClick={onClose}>
      <div
        className="modal-content icon-library-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-date-display">
            <span className="modal-day-name">Habit Icon Selector</span>
            <h2 className="modal-date-full" style={{ fontSize: '1.25rem', margin: 0 }}>
              Browse Icon Library
            </h2>
          </div>
          <button
            type="button"
            className="btn btn-icon"
            onClick={onClose}
            aria-label="Close Icon Library"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="icon-search-box">
          <Search size={16} className="icon-search-lens" />
          <input
            ref={searchInputRef}
            type="text"
            className="icon-search-input"
            placeholder="Search 85+ icons (e.g. gym, water, sleep, money, run, cook)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="icon-search-clear-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="icon-category-pills">
          {ICON_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                className={`category-pill-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Icon Results Count */}
        <div className="icon-results-header">
          <span className="results-count-text">
            Showing <strong>{filteredIcons.length}</strong> {filteredIcons.length === 1 ? 'icon' : 'icons'}
          </span>
          <span className="results-hint-text">
            Double-click or tap to select
          </span>
        </div>

        {/* Icons Grid Container */}
        <div className="icon-library-grid-scroll">
          {filteredIcons.length > 0 ? (
            <div className="icon-library-grid">
              {filteredIcons.map((item) => {
                const IconComp = item.icon;
                const isSelected = previewIconId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`icon-grid-tile ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSingleClick(item.id)}
                    onDoubleClick={() => handlePickIcon(item.id)}
                    style={
                      isSelected
                        ? {
                            borderColor: selectedColor,
                            boxShadow: `0 0 14px ${selectedColor}35`,
                            color: selectedColor
                          }
                        : {}
                    }
                    title={`${item.label} (Tap to select)`}
                  >
                    <div
                      className="icon-tile-visual"
                      style={
                        isSelected
                          ? {
                              backgroundColor: `${selectedColor}22`,
                              color: selectedColor
                            }
                          : {}
                      }
                    >
                      <IconComp size={22} />
                    </div>
                    <span className="icon-tile-label">{item.label}</span>
                    {isSelected && (
                      <span
                        className="icon-tile-check"
                        style={{ backgroundColor: selectedColor }}
                      >
                        <Check size={11} color="#000" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="icon-empty-state">
              <Sparkles size={32} color="#94a3b8" />
              <div className="empty-title">No icons match &quot;{searchQuery}&quot;</div>
              <p className="empty-desc">
                Try searching for broader keywords like <em>active</em>, <em>clean</em>, <em>food</em>, or clear the search.
              </p>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>

        {/* Selected Preview Footer */}
        <div className="icon-library-footer">
          <div className="selected-preview-pill">
            <div
              className="preview-mini-icon"
              style={{
                backgroundColor: `${selectedColor}22`,
                borderColor: `${selectedColor}66`,
                color: selectedColor
              }}
            >
              <ActiveIconComponent size={20} />
            </div>
            <div className="preview-details">
              <span className="preview-label-name">{activeIconItem.label}</span>
              <span className="preview-cat-name">Category: {activeIconItem.category}</span>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{
              background: `linear-gradient(135deg, ${selectedColor}, ${selectedColor}cc)`,
              color: '#000',
              fontWeight: 700,
              gap: '6px'
            }}
            onClick={handleConfirm}
          >
            <Check size={16} strokeWidth={3} />
            <span>Use Icon</span>
          </button>
        </div>
      </div>
    </div>
  );
}
