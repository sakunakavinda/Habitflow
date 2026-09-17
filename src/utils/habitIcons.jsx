import React from 'react';
import {
  Droplets,
  Dumbbell,
  CigaretteOff,
  BookOpen,
  Brain,
  Moon,
  Apple,
  Code,
  Heart,
  Bike,
  Footprints,
  Flame,
  Coffee,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const AVAILABLE_ICONS = [
  { id: 'cigarette-off', label: 'Smoke-Free', icon: CigaretteOff },
  { id: 'dumbbell', label: 'Workout', icon: Dumbbell },
  { id: 'droplets', label: 'Hydration / Water', icon: Droplets },
  { id: 'book-open', label: 'Reading / Study', icon: BookOpen },
  { id: 'brain', label: 'Mindfulness / Meditation', icon: Brain },
  { id: 'moon', label: 'Sleep & Rest', icon: Moon },
  { id: 'apple', label: 'Healthy Eating', icon: Apple },
  { id: 'code', label: 'Coding / Skills', icon: Code },
  { id: 'heart', label: 'Self Care', icon: Heart },
  { id: 'bike', label: 'Cycling', icon: Bike },
  { id: 'footprints', label: 'Walking / Steps', icon: Footprints },
  { id: 'flame', label: 'Discipline / Burn', icon: Flame },
  { id: 'coffee', label: 'Caffeine Limit', icon: Coffee },
  { id: 'sparkles', label: 'General Habit', icon: Sparkles }
];

export const AVAILABLE_COLORS = [
  { id: 'emerald', label: 'Emerald Green', hex: '#10b981' },
  { id: 'amber', label: 'Amber Gold', hex: '#f59e0b' },
  { id: 'blue', label: 'Sky Blue', hex: '#3b82f6' },
  { id: 'rose', label: 'Rose Red', hex: '#f43f5e' },
  { id: 'violet', label: 'Purple Violet', hex: '#8b5cf6' },
  { id: 'teal', label: 'Cyan Teal', hex: '#06b6d4' },
  { id: 'pink', label: 'Bright Pink', hex: '#ec4899' },
  { id: 'orange', label: 'Deep Orange', hex: '#f97316' }
];

export function HabitIcon({ name, size = 18, color, className = '' }) {
  const match = AVAILABLE_ICONS.find((item) => item.id === name);
  const IconComponent = match ? match.icon : Sparkles;
  return <IconComponent size={size} color={color} className={className} />;
}
