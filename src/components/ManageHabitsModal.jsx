import React, { useState } from 'react';
import { X, Plus, Trash2, Check, Sparkles, AlertCircle, Search, Calendar, Edit2 } from 'lucide-react';
import { AVAILABLE_ICONS, AVAILABLE_COLORS, POPULAR_ICON_IDS, HabitIcon } from '../utils/habitIcons';
import { IconLibraryModal } from './IconLibraryModal';
import { getTodayKey } from '../utils/calendarUtils';

export function ManageHabitsModal({ habits, onAddHabit, onUpdateHabit, onDeleteHabit, onClose }) {
  const [isAdding, setIsAdding] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [habitStartDate, setHabitStartDate] = useState(getTodayKey);
  const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0].hex);
  const [selectedIcon, setSelectedIcon] = useState(AVAILABLE_ICONS[0].id);
  const [showIconLibrary, setShowIconLibrary] = useState(false);
  const [error, setError] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [editingStartDateId, setEditingStartDateId] = useState(null);

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!habitName.trim()) {
      setError('Please enter a habit name.');
      return;
    }
    setError(null);
    try {
      await onAddHabit({
        name: habitName.trim(),
        frequency,
        color: selectedColor,
        icon: selectedIcon,
        startDate: habitStartDate
      });
      setHabitName('');
      setHabitStartDate(getTodayKey());
      setIsAdding(false);
    } catch (err) {
      console.error('Error adding habit:', err);
      setError(err.message || 'Failed to create habit.');
    }
  };

  const handleUpdateStartDate = async (habitId, newStartDate) => {
    try {
      if (onUpdateHabit) {
        await onUpdateHabit(habitId, { startDate: newStartDate });
      }
      setEditingStartDateId(null);
    } catch (err) {
      console.error('Error updating habit start date:', err);
      setError(err.message || 'Failed to update start date.');
    }
  };

  const handleDelete = async (habitId) => {
    try {
      await onDeleteHabit(habitId);
      setConfirmDeleteId(null);
    } catch (err) {
      console.error('Error deleting habit:', err);
      setError(err.message || 'Failed to delete habit.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content manage-habits-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <h2 className="modal-title">Manage Habits</h2>
            <p className="modal-subtitle">
              Add, customize, or remove the habits
            </p>
          </div>
          <button
            type="button"
            className="btn btn-icon"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="auth-alert error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Existing Habits List */}
        <div className="manage-habits-list">
          {habits.map((habit) => (
            <div key={habit.id} className="manage-habit-item">
              <div className="manage-habit-left">
                <div
                  className="manage-habit-icon-wrap"
                  style={{
                    backgroundColor: `${habit.color}22`,
                    borderColor: `${habit.color}55`,
                    color: habit.color
                  }}
                >
                  <HabitIcon name={habit.icon} color={habit.color} size={18} />
                </div>
                <div className="manage-habit-details">
                  <div className="manage-habit-name">{habit.name}</div>
                  <div className="manage-habit-sub">
                    <span
                      className="habit-color-pill"
                      style={{ backgroundColor: habit.color }}
                    />
                    <span>{habit.frequency || 'daily'}</span>
                    
                    {editingStartDateId === habit.id ? (
                      <div className="habit-start-edit-group">
                        <input
                          type="date"
                          className="habit-start-date-inline-input"
                          defaultValue={habit.startDate || getTodayKey()}
                          max={getTodayKey()}
                          onChange={(e) => {
                            if (e.target.value) {
                              handleUpdateStartDate(habit.id, e.target.value);
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="btn-icon-xs"
                          onClick={() => setEditingStartDateId(null)}
                          title="Done"
                        >
                          <Check size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="habit-starts-badge editable"
                        onClick={() => setEditingStartDateId(habit.id)}
                        title="Click to edit start date"
                      >
                        <Calendar size={10} />
                        <span>
                          {habit.startDate
                            ? new Date(habit.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'Set start date'}
                        </span>
                        <Edit2 size={9} style={{ opacity: 0.65, marginLeft: 2 }} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="manage-habit-actions">
                {confirmDeleteId === habit.id ? (
                  <div className="confirm-delete-group">
                    <button
                      type="button"
                      className="btn btn-danger-sm"
                      onClick={() => handleDelete(habit.id)}
                    >
                      Confirm
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary-sm"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn btn-icon-sm btn-ghost-danger"
                    onClick={() => setConfirmDeleteId(habit.id)}
                    title="Delete habit"
                    aria-label={`Delete habit ${habit.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}

          {habits.length === 0 && (
            <div className="empty-habits-state">
              <Sparkles size={24} color="#94a3b8" />
              <p>No habits added yet. Click &quot;Add New Habit&quot; to begin!</p>
            </div>
          )}
        </div>

        {/* Add Habit Collapsible / Form */}
        {!isAdding ? (
          <button
            type="button"
            className="btn btn-full btn-outline"
            onClick={() => setIsAdding(true)}
            style={{ marginTop: '0.8rem' }}
          >
            <Plus size={16} />
            <span>Add New Habit</span>
          </button>
        ) : (
          <form onSubmit={handleCreateHabit} className="new-habit-form">
            <div className="new-habit-form-header">
              <h3>New Habit Details</h3>
              <button
                type="button"
                className="btn btn-icon-sm"
                onClick={() => setIsAdding(false)}
              >
                <X size={16} />
              </button>
            </div>

            <div className="form-group">
              <label htmlFor="new-habit-name">Habit Name</label>
              <input
                id="new-habit-name"
                type="text"
                className="form-input"
                placeholder="e.g. Drink 2L Water, Read 20 Mins"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-habit-freq">Frequency</label>
              <select
                id="new-habit-freq"
                className="form-input form-select"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekends">Weekends</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="new-habit-start">Start Tracking From</label>
              <input
                id="new-habit-start"
                type="date"
                className="form-input"
                value={habitStartDate}
                max={getTodayKey()}
                onChange={(e) => setHabitStartDate(e.target.value)}
              />
            </div>

            {/* Color Swatch Picker */}
            <div className="form-group">
              <label>Highlight Color</label>
              <div className="color-swatches-grid">
                {AVAILABLE_COLORS.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`color-swatch-btn ${selectedColor === c.hex ? 'selected' : ''}`}
                    style={{ backgroundColor: c.hex }}
                    onClick={() => setSelectedColor(c.hex)}
                    title={c.label}
                  >
                    {selectedColor === c.hex && <Check size={14} color="#000" strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                <label style={{ margin: 0 }}>Habit Icon</label>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                  Selected: <strong style={{ color: selectedColor }}>{AVAILABLE_ICONS.find(i => i.id === selectedIcon)?.label || selectedIcon}</strong>
                </span>
              </div>

              {/* Popular Quick Icons */}
              <div className="icon-picker-grid">
                {(() => {
                  const popularItems = AVAILABLE_ICONS.filter((item) =>
                    POPULAR_ICON_IDS.includes(item.id)
                  );
                  const isSelectedInPopular = popularItems.some((item) => item.id === selectedIcon);
                  const selectedItem = AVAILABLE_ICONS.find((item) => item.id === selectedIcon);
                  const displayedIcons = isSelectedInPopular
                    ? popularItems
                    : (selectedItem ? [selectedItem, ...popularItems.slice(0, 13)] : popularItems);

                  return displayedIcons.filter(Boolean).map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedIcon === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`icon-picker-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedIcon(item.id)}
                        title={item.label}
                        style={isSelected ? { borderColor: selectedColor, color: selectedColor } : {}}
                      >
                        <Icon size={18} />
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Trigger Button to Open Full 85+ Icon Library */}
              <button
                type="button"
                className="browse-icons-trigger-btn"
                onClick={() => setShowIconLibrary(true)}
              >
                <Search size={15} />
                <span>Browse Full Icon Library</span>
                <span className="badge-count-tag">85+ Icons</span>
              </button>
            </div>

            {/* Realtime Preview */}
            <div className="habit-preview-box">
              <span className="preview-label">Calendar Line Preview:</span>
              <div className="preview-item">
                <span
                  className="preview-line"
                  style={{ backgroundColor: selectedColor }}
                />
                <span className="preview-text">
                  {habitName || 'Habit Name'}
                </span>
              </div>
            </div>

            <div className="new-habit-buttons">
              <button
                type="submit"
                className="btn btn-full btn-primary"
              >
                <Plus size={16} />
                <span>Save Habit</span>
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Footer */}
        {!isAdding && (
          <div className="modal-footer">
            <button type="button" className="btn btn-full" onClick={onClose}>
              Done
            </button>
          </div>
        )}

        {/* Full Icon Library Browser Modal */}
        <IconLibraryModal
          isOpen={showIconLibrary}
          selectedIcon={selectedIcon}
          selectedColor={selectedColor}
          onSelectIcon={(iconId) => setSelectedIcon(iconId)}
          onClose={() => setShowIconLibrary(false)}
        />
      </div>
    </div>
  );
}
