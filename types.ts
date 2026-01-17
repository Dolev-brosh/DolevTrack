export interface DailyLog {
  date: string;
  weight: number;
  protein: number;
  fat: number;
  carbs: number;
  calories: number;
}

export type LogFormData = Omit<DailyLog, 'weight' | 'protein' | 'fat' | 'carbs' | 'calories'> & {
  calories: number | string;
  weight: number | string;
  protein: number | string;
  fat: number | string;
  carbs: number | string;
};

export interface UserGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}