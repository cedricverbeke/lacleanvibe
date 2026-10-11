export interface UserProfile {
  id: string;
  pseudo: string;
  birth_year: number | null;
  parental_consent: boolean;
}

export interface SkincareAnswers {
  skinType: string;
  skinTone: string;
  concerns: string[];
  sensitivity: string[];
  climate: string;
  sunExposure: string;
  screenTime: string;
  ageRange: string;
  commitmentLevel: string;
  formulaPreference: string;
  budget: string;
}

export interface MealAnswers {
  lovedIngredients: string[];
  hatedIngredients: string[];
  cuisineStyle: string;
  diet: string;
  allergies: string[];
  goal: string;
  prepTime: string;
  equipment: string[];
  servings: string;
}

export interface HaircareAnswers {
  hairType: string;
  hairThickness: string;
  porosity: string;
  scalpCondition: string;
  hairDensity: string;
  chemicalTreatments: string[];
  stylingHabits: string[];
  mainGoal: string;
  routinePreference: string;
}

export interface CycleLog {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string | null;
  cycle_length: number;
  notes: string | null;
  created_at: string;
}

export interface CycleSymptom {
  id: string;
  user_id: string;
  log_date: string;
  mood: string | null;
  energy: string | null;
  cramps: string | null;
  skin_condition: string | null;
  notes: string | null;
}

export interface GeneratedRoutine {
  id: string;
  user_id: string;
  type: 'skincare' | 'meal' | 'haircare';
  content: RoutineContent;
  created_at: string;
}

export interface RoutineContent {
  diagnosis?: string;
  steps?: RoutineStep[];
  meals?: MealPlanItem[];
  deepCare?: string;
  tips?: string[];
  rawText?: string;
}

export interface RoutineStep {
  name: string;
  product: string;
  description: string;
  timing: string;
}

export interface MealPlanItem {
  meal: string;
  name: string;
  ingredients: string[];
  steps: string[];
  benefits: string;
}

export interface RoutineEvaluation {
  id: string;
  user_id: string;
  routine_type: 'skincare' | 'haircare';
  feeling: string;
  improvements: string | null;
  skin_changes: string | null;
  notes: string | null;
  created_at: string;
}

export interface WeeklyMealPlan {
  id: string;
  user_id: string;
  week_start: string;
  content: WeeklyMealContent;
  created_at: string;
}

export interface WeeklyMealContent {
  days: DayMealPlan[];
}

export interface DayMealPlan {
  day: string;
  meals: MealPlanItem[];
}

export interface HealthLog {
  id: string;
  user_id: string;
  log_date: string;
  sleep_hours: number | null;
  sleep_quality: string | null;
  sport_activity: string | null;
  sport_duration: number | null;
  energy_level: string | null;
  mood: string | null;
  water_glasses: number | null;
  notes: string | null;
}

export interface StyleAdvice {
  makeup: { step: string; product: string; description: string }[];
  outfitFeedback: { ok: boolean; suggestions: string[] };
  colors: string[];
  overallTip: string;
}

export interface StyleLookup {
  id: string;
  user_id: string;
  event_type: string;
  event_details: string | null;
  advice: StyleAdvice;
  created_at: string;
}

export interface MentalCheckIn {
  id: string;
  user_id: string;
  entry_text: string;
  mood_detected: 'super' | 'moyen' | 'down';
  advice: string | null;
  question: string | null;
  safety_alert: boolean;
  created_at: string;
}

export interface MentalChallenge {
  id: string;
  user_id: string;
  challenge_text: string;
  status: 'proposed' | 'accepted' | 'completed';
  week_key: string;
  level: number;
  difficulty_label: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface MentalVictory {
  id: string;
  user_id: string;
  victory_text: string;
  trophy: string;
  category: string;
  created_at: string;
}

export interface CBTExercise {
  name: string;
  description: string;
  steps: string[];
}

export interface OverthinkingResult {
  distortedThought: string;
  reframedThought: string;
  pattern: string;
  patternExplanation: string;
  encouragement: string;
  question: string;
  exercises: CBTExercise[];
}

export interface CheckInAnalysis {
  mood: 'super' | 'moyen' | 'down';
  advice: string;
  question: string;
  safetyAlert: boolean;
  exercises: CBTExercise[];
}
