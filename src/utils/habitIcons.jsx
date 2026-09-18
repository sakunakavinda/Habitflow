import React from 'react';
import {
  // Fitness & Active
  Dumbbell,
  Bike,
  Footprints,
  Flame,
  Timer,
  Activity,
  Trophy,
  Medal,
  Zap,
  Mountain,
  Waves,
  Scale,
  Crosshair,
  FlameKindling,

  // Health & Wellness
  Heart,
  Droplets,
  GlassWater,
  Moon,
  Sun,
  Apple,
  Pill,
  ShieldCheck,
  Smile,
  SmilePlus,
  Wind,
  BatteryCharging,
  HeartPulse,
  CigaretteOff,

  // Mind & Focus
  Brain,
  Sparkles,
  Sparkle,
  Feather,
  Eye,
  Compass,
  Flower2,
  Sprout,
  Sunrise,
  Sunset,

  // Productivity & Learning
  BookOpen,
  BookMarked,
  Code,
  Laptop,
  Briefcase,
  Target,
  CheckCircle2,
  CheckCheck,
  Clock,
  AlarmClock,
  Watch,
  CalendarCheck,
  PenTool,
  Lightbulb,
  FileText,
  Award,
  Glasses,

  // Lifestyle & Hobbies
  Coffee,
  Music,
  Headphones,
  Camera,
  Palette,
  Gamepad2,
  Dog,
  Cat,
  Plane,
  Car,
  Tv,
  Radio,
  Luggage,

  // Daily & Home
  Home,
  Bed,
  ShowerHead,
  Bath,
  Utensils,
  Shirt,
  Brush,
  Scissors,
  Hammer,
  Wrench,
  Trash2,
  Trees,

  // Money & Finance
  Wallet,
  PiggyBank,
  DollarSign,
  Coins,
  CreditCard,
  ShoppingCart
} from 'lucide-react';

export const ICON_CATEGORIES = [
  { id: 'all', label: 'All Icons' },
  { id: 'fitness', label: '🏃 Fitness' },
  { id: 'wellness', label: '❤️ Health' },
  { id: 'mind', label: '🧠 Mind' },
  { id: 'productivity', label: '📚 Focus' },
  { id: 'lifestyle', label: '☕ Lifestyle' },
  { id: 'home', label: '🏠 Home' },
  { id: 'finance', label: '💰 Finance' }
];

export const POPULAR_ICON_IDS = [
  'dumbbell',
  'droplets',
  'book-open',
  'brain',
  'moon',
  'apple',
  'code',
  'heart',
  'bike',
  'flame',
  'coffee',
  'sparkles',
  'wallet',
  'home'
];

export const AVAILABLE_ICONS = [
  // Fitness & Active
  { id: 'dumbbell', label: 'Workout & Gym', icon: Dumbbell, category: 'fitness', tags: 'gym lifting weight training exercise muscles fitness workout' },
  { id: 'bike', label: 'Cycling', icon: Bike, category: 'fitness', tags: 'bike cycling bicycle ride spinning cardio wheels' },
  { id: 'footprints', label: 'Walking & Steps', icon: Footprints, category: 'fitness', tags: 'walking steps 10k stroll hike movement feet' },
  { id: 'flame', label: 'Calorie Burn', icon: Flame, category: 'fitness', tags: 'burn fire intensity sweat calories heat discipline' },
  { id: 'timer', label: 'Timed Workout', icon: Timer, category: 'fitness', tags: 'timer stopwatch interval hiit tabata duration' },
  { id: 'activity', label: 'Cardio & Heart Rate', icon: Activity, category: 'fitness', tags: 'cardio pulse heart rate bpm exercise run' },
  { id: 'trophy', label: 'Achievement', icon: Trophy, category: 'fitness', tags: 'trophy win victory champion goal target award' },
  { id: 'medal', label: 'Milestone / Race', icon: Medal, category: 'fitness', tags: 'medal race marathon podium competition rank' },
  { id: 'zap', label: 'High Energy', icon: Zap, category: 'fitness', tags: 'energy lightning electric power sprint speed boost' },
  { id: 'mountain', label: 'Hiking & Climbing', icon: Mountain, category: 'fitness', tags: 'hiking climb mountain trek trail summit nature' },
  { id: 'waves', label: 'Swimming & Ocean', icon: Waves, category: 'fitness', tags: 'swim pool waves water ocean surf sea' },
  { id: 'scale', label: 'Weight Tracking', icon: Scale, category: 'fitness', tags: 'scale weigh weight mass measure body progress' },
  { id: 'crosshair', label: 'Accuracy & Aim', icon: Crosshair, category: 'fitness', tags: 'aim focus sport target bullseye archery shooting' },
  { id: 'flame-kindling', label: 'Endurance & Grit', icon: FlameKindling, category: 'fitness', tags: 'fire stamina camp grit perseverance endurance' },

  // Health & Wellness
  { id: 'heart', label: 'Heart & Self-Care', icon: Heart, category: 'wellness', tags: 'heart health self-care love cardio vitals care' },
  { id: 'droplets', label: 'Hydration', icon: Droplets, category: 'wellness', tags: 'water drink hydration fluid 2l drops bottle' },
  { id: 'glass-water', label: 'Glass of Water', icon: GlassWater, category: 'wellness', tags: 'water glass drink hydration pure cold' },
  { id: 'moon', label: 'Sleep & Rest', icon: Moon, category: 'wellness', tags: 'sleep rest bedtime night 8hours recovery dream' },
  { id: 'sun', label: 'Morning Sunlight', icon: Sun, category: 'wellness', tags: 'sun morning daylight sunlight wake early light' },
  { id: 'apple', label: 'Healthy Eating', icon: Apple, category: 'wellness', tags: 'apple food healthy fruit nutrition diet clean snack' },
  { id: 'pill', label: 'Vitamins & Medicine', icon: Pill, category: 'wellness', tags: 'vitamins pill medicine supplement capsule doctor' },
  { id: 'shield-check', label: 'Immunity & Care', icon: ShieldCheck, category: 'wellness', tags: 'immune protection shield check doctor safe health' },
  { id: 'smile', label: 'Mental Wellbeing', icon: Smile, category: 'wellness', tags: 'smile happy mood positivity mental joy gratitude' },
  { id: 'smile-plus', label: 'Mood Boost', icon: SmilePlus, category: 'wellness', tags: 'smile positive uplift joy happiness mood cheer' },
  { id: 'wind', label: 'Breathwork & Air', icon: Wind, category: 'wellness', tags: 'breathe breathwork lungs oxygen air pranayama calm' },
  { id: 'battery-charging', label: 'Energy Recharge', icon: BatteryCharging, category: 'wellness', tags: 'battery recharge energy power nap recovery rest' },
  { id: 'heart-pulse', label: 'Vital Signs', icon: HeartPulse, category: 'wellness', tags: 'pulse bpm vitals ecg checkup doctor hospital' },
  { id: 'cigarette-off', label: 'Smoke-Free', icon: CigaretteOff, category: 'wellness', tags: 'smoke tobacco quit vape nicotine clean cessation' },

  // Mind & Focus
  { id: 'brain', label: 'Mindfulness & Meditation', icon: Brain, category: 'mind', tags: 'mind brain meditation headspace focus memory thought' },
  { id: 'sparkles', label: 'Inspiration', icon: Sparkles, category: 'mind', tags: 'sparkles magic good habit clean shiny positivity' },
  { id: 'sparkle', label: 'Daily Clarity', icon: Sparkle, category: 'mind', tags: 'clarity clean focus spark shine highlight' },
  { id: 'feather', label: 'Journaling', icon: Feather, category: 'mind', tags: 'journal write diary thoughts write poetry reflect' },
  { id: 'eye', label: 'Vision / Screen Rest', icon: Eye, category: 'mind', tags: 'vision screen eye 20-20-20 rest look sight' },
  { id: 'compass', label: 'Life Direction', icon: Compass, category: 'mind', tags: 'compass direction path guide purpose explore align' },
  { id: 'flower-2', label: 'Inner Peace & Zen', icon: Flower2, category: 'mind', tags: 'peace zen flower calm bloom nature quiet beauty' },
  { id: 'sprout', label: 'Personal Growth', icon: Sprout, category: 'mind', tags: 'growth plant sprout progress develop cultivate evolve' },
  { id: 'sunrise', label: 'Early Rise', icon: Sunrise, category: 'mind', tags: 'early morning 5am sunrise dawn wake routine' },
  { id: 'sunset', label: 'Evening Unwind', icon: Sunset, category: 'mind', tags: 'sunset dusk evening relax unwind wind down night' },

  // Productivity & Learning
  { id: 'book-open', label: 'Reading & Books', icon: BookOpen, category: 'productivity', tags: 'read book reading chapter literature study pages' },
  { id: 'book-marked', label: 'Study & Research', icon: BookMarked, category: 'productivity', tags: 'study research bookmark learn academic school' },
  { id: 'code', label: 'Coding & Dev', icon: Code, category: 'productivity', tags: 'code programming developer tech software python javascript' },
  { id: 'laptop', label: 'Deep Work Session', icon: Laptop, category: 'productivity', tags: 'work computer desk focus laptop typing session' },
  { id: 'briefcase', label: 'Career & Business', icon: Briefcase, category: 'productivity', tags: 'career job work business office clients projects' },
  { id: 'target', label: 'Daily Goals', icon: Target, category: 'productivity', tags: 'goal target objective aim bullseye achieve priority' },
  { id: 'check-circle-2', label: 'Task Completed', icon: CheckCircle2, category: 'productivity', tags: 'done finish check checkmark complete todo list' },
  { id: 'check-check', label: 'Daily Review', icon: CheckCheck, category: 'productivity', tags: 'review audit check verify double tasks inspect' },
  { id: 'clock', label: 'Time Management', icon: Clock, category: 'productivity', tags: 'clock time pomodoro schedule punctuality hours' },
  { id: 'alarm-clock', label: 'Waking Up on Time', icon: AlarmClock, category: 'productivity', tags: 'alarm wake morning early clock ring bell' },
  { id: 'watch', label: 'Punctuality', icon: Watch, category: 'productivity', tags: 'watch wrist time prompt punctuality track' },
  { id: 'calendar-check', label: 'Planning & Agenda', icon: CalendarCheck, category: 'productivity', tags: 'calendar plan schedule agenda day organize month' },
  { id: 'pen-tool', label: 'Writing & Design', icon: PenTool, category: 'productivity', tags: 'write draw vector design pen essay sketch art' },
  { id: 'lightbulb', label: 'Creativity & Ideas', icon: Lightbulb, category: 'productivity', tags: 'idea innovation creative brainstorm smart think light' },
  { id: 'file-text', label: 'Notes & Reports', icon: FileText, category: 'productivity', tags: 'notes doc report document paper draft summary' },
  { id: 'award', label: 'Skill Building', icon: Award, category: 'productivity', tags: 'award badge certify skill achievement diploma' },
  { id: 'glasses', label: 'Focused Study', icon: Glasses, category: 'productivity', tags: 'glasses read study look examine smart learn' },

  // Lifestyle & Hobbies
  { id: 'coffee', label: 'Morning Coffee / Limit', icon: Coffee, category: 'lifestyle', tags: 'coffee tea espresso caffeine mug cup beverage' },
  { id: 'music', label: 'Music & Instrument', icon: Music, category: 'lifestyle', tags: 'music instrument play song guitar piano tune audio' },
  { id: 'headphones', label: 'Podcasts & Audio', icon: Headphones, category: 'lifestyle', tags: 'podcast audiobook sound listen hear focus audio' },
  { id: 'camera', label: 'Photography', icon: Camera, category: 'lifestyle', tags: 'photo picture photography camera shoot memory lens' },
  { id: 'palette', label: 'Art & Painting', icon: Palette, category: 'lifestyle', tags: 'art paint draw sketch color canvas craft creative' },
  { id: 'gamepad-2', label: 'Gaming Balance', icon: Gamepad2, category: 'lifestyle', tags: 'gaming play video game console break leisure controller' },
  { id: 'dog', label: 'Dog Walk & Pet Care', icon: Dog, category: 'lifestyle', tags: 'dog pet walk puppy animal canine feed groom' },
  { id: 'cat', label: 'Cat Care', icon: Cat, category: 'lifestyle', tags: 'cat kitten pet animal feline meow purr feed' },
  { id: 'plane', label: 'Travel & Trips', icon: Plane, category: 'lifestyle', tags: 'plane flight travel vacation holiday voyage journey' },
  { id: 'car', label: 'Commute & Travel', icon: Car, category: 'lifestyle', tags: 'car drive ride auto vehicle commute travel' },
  { id: 'tv', label: 'Screen Time Limits', icon: Tv, category: 'lifestyle', tags: 'tv movie show screen streaming watch cinema' },
  { id: 'radio', label: 'News & Broadcast', icon: Radio, category: 'lifestyle', tags: 'radio broadcast news morning audio tune station' },
  { id: 'luggage', label: 'Pack & Organize', icon: Luggage, category: 'lifestyle', tags: 'luggage suitcase pack bag travel organize trip' },

  // Daily & Home
  { id: 'home', label: 'Home & Housekeeping', icon: Home, category: 'home', tags: 'home house domestic chore stay family roof' },
  { id: 'bed', label: 'Make Bed / Tidy Room', icon: Bed, category: 'home', tags: 'bed make bed tidy room sleep sheets morning routine' },
  { id: 'shower-head', label: 'Cold Shower / Bath', icon: ShowerHead, category: 'home', tags: 'shower cold water bathroom hygiene wash clean' },
  { id: 'bath', label: 'Relaxing Bath', icon: Bath, category: 'home', tags: 'bath tub soak relax unwind bubbles water warm' },
  { id: 'utensils', label: 'Cook at Home', icon: Utensils, category: 'home', tags: 'cook food meal kitchen dinner lunch prepare recipe knife fork' },
  { id: 'shirt', label: 'Laundry & Wardrobe', icon: Shirt, category: 'home', tags: 'shirt clothes laundry wardrobe fold dress clean outfit' },
  { id: 'brush', label: 'Cleaning & Tidying', icon: Brush, category: 'home', tags: 'clean brush sweep tidy chores house dust wash' },
  { id: 'scissors', label: 'Grooming & Hair', icon: Scissors, category: 'home', tags: 'hair cut groom trim salon barber craft' },
  { id: 'hammer', label: 'Repairs & Projects', icon: Hammer, category: 'home', tags: 'hammer tool build fix repair craft carpentry' },
  { id: 'wrench', label: 'Maintenance & DIY', icon: Wrench, category: 'home', tags: 'wrench tool fix repair maintain mechanics diy' },
  { id: 'trash-2', label: 'Declutter & Recycle', icon: Trash2, category: 'home', tags: 'trash recycle bin waste declutter throw tidy' },
  { id: 'trees', label: 'Gardening & Plants', icon: Trees, category: 'home', tags: 'garden plant yard trees outdoor park nature flora' },

  // Money & Finance
  { id: 'wallet', label: 'Daily Expense Tracking', icon: Wallet, category: 'finance', tags: 'wallet money cash budget expense spend track purse' },
  { id: 'piggy-bank', label: 'Savings Deposit', icon: PiggyBank, category: 'finance', tags: 'savings save piggy bank coin deposit invest fund' },
  { id: 'dollar-sign', label: 'Budgeting & Income', icon: DollarSign, category: 'finance', tags: 'money dollar currency income salary cash wealth' },
  { id: 'coins', label: 'Coin Jar & Micro-save', icon: Coins, category: 'finance', tags: 'coins change save penny cash gold invest' },
  { id: 'credit-card', label: 'No-Spend / Debt Payoff', icon: CreditCard, category: 'finance', tags: 'card credit debt pay bills banking spend limit' },
  { id: 'shopping-cart', label: 'Grocery / Mindful Spend', icon: ShoppingCart, category: 'finance', tags: 'shopping cart grocery buy market store store retail' }
];

export const AVAILABLE_COLORS = [
  { id: 'emerald', label: 'Emerald Green', hex: '#10b981' },
  { id: 'amber', label: 'Amber Gold', hex: '#f59e0b' },
  { id: 'blue', label: 'Sky Blue', hex: '#3b82f6' },
  { id: 'rose', label: 'Rose Red', hex: '#f43f5e' },
  { id: 'violet', label: 'Purple Violet', hex: '#8b5cf6' },
  { id: 'teal', label: 'Cyan Teal', hex: '#06b6d4' },
  { id: 'pink', label: 'Bright Pink', hex: '#ec4899' },
  { id: 'orange', label: 'Deep Orange', hex: '#f97316' },
  { id: 'indigo', label: 'Electric Indigo', hex: '#6366f1' },
  { id: 'lime', label: 'Neon Lime', hex: '#84cc16' },
  { id: 'mint', label: 'Fresh Mint', hex: '#2dd4bf' },
  { id: 'yellow', label: 'Sunburst Yellow', hex: '#eab308' },
  { id: 'fuchsia', label: 'Neon Fuchsia', hex: '#d946ef' },
  { id: 'crimson', label: 'Crimson Red', hex: '#dc2626' },
  { id: 'azure', label: 'Ocean Azure', hex: '#0284c7' },
  { id: 'coral', label: 'Sunset Coral', hex: '#fb7185' }
];

export function HabitIcon({ name, size = 18, color, className = '' }) {
  if (!name) return <Sparkles size={size} color={color} className={className} />;

  // Match by id or normalize
  const normalized = String(name).toLowerCase().trim();
  const match = AVAILABLE_ICONS.find(
    (item) => item.id === normalized || item.id === normalized.replace(/\s+/g, '-')
  );

  const IconComponent = match ? match.icon : Sparkles;
  return <IconComponent size={size} color={color} className={className} />;
}
