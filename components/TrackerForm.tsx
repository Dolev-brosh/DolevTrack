import React, { useState, useEffect } from 'react';
import { DailyLog, LogFormData, UserGoals } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { DatePicker } from './DatePicker';
import { Card } from './Card';
import { Save, Flame, Meh, Frown } from 'lucide-react';

interface TrackerFormProps {
  onSave: (log: DailyLog) => void;
  initialData?: DailyLog | null;
  existingDates: Set<string>;
  userGoals: UserGoals | null;
}

const defaultForm: LogFormData = {
  date: '', 
  weight: '',
  protein: '',
  fat: '',
  carbs: '',
  calories: 0,
};

const getFirstAvailableDate = (dates: Set<string>) => {
  let date = new Date();
  for (let i = 0; i < 365; i++) {
    const dateStr = date.toISOString().split('T')[0];
    if (!dates.has(dateStr)) {
      return dateStr;
    }
    date.setDate(date.getDate() + 1);
  }
  return new Date().toISOString().split('T')[0];
};

export const TrackerForm: React.FC<TrackerFormProps> = ({ onSave, initialData, existingDates, userGoals }) => {
  const [formData, setFormData] = useState<LogFormData>(defaultForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({ ...initialData });
      setErrors({});
    } else {
      const nextDate = getFirstAvailableDate(existingDates);
      setFormData({ ...defaultForm, date: nextDate });
      setErrors({});
    }
  }, [initialData, existingDates]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateForm(name, value);
  };

  const updateForm = (name: string, value: string | number) => {
    const nextFormData = { ...formData, [name]: value };

    // Auto-calculate calories if macros change
    if (name === 'protein' || name === 'carbs' || name === 'fat') {
        const p = Number(nextFormData.protein) || 0;
        const c = Number(nextFormData.carbs) || 0;
        const f = Number(nextFormData.fat) || 0;
        nextFormData.calories = Math.round((p * 4) + (c * 4) + (f * 9));
    }

    setFormData(nextFormData);

    // Date validation
    if (name === 'date') {
        const valStr = String(value);
        if (existingDates.has(valStr) && valStr !== initialData?.date) {
            setErrors(prev => ({ ...prev, date: 'Log already exists. Edit in History.' }));
        } else {
            setErrors(prev => {
                const next = { ...prev };
                delete next.date;
                return next;
            });
        }
    } else if (errors[name]) {
         setErrors(prev => {
            const next = { ...prev };
            delete next[name];
            return next;
        });
    }
  };

  const handleDateChange = (newDate: string) => {
    updateForm('date', newDate);
  };

  const validate = () => {
    const newErrors: Record<string, string> = { ...errors };
    if (!formData.date) newErrors.date = 'Date is required';
    if (formData.weight === '') newErrors.weight = 'Value required';
    if (formData.protein === '') newErrors.protein = 'Value required';
    if (formData.carbs === '') newErrors.carbs = 'Value required';
    if (formData.fat === '') newErrors.fat = 'Value required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (errors.date) return;
    if (!validate()) return;

    const log: DailyLog = {
      date: formData.date,
      weight: Number(formData.weight),
      protein: Number(formData.protein),
      fat: Number(formData.fat),
      carbs: Number(formData.carbs),
      calories: Number(formData.calories),
    };

    onSave(log);
  };

  // --- Logic for Colors and Icons based on Goals ---
  
  // For Carbs and Fat (Upper Limit targets)
  const getMacroColor = (value: number | string, goal: number) => {
    const val = Number(value);
    if (!userGoals) return 'text-white';
    
    if (val <= goal) return 'text-green-600 dark:text-green-400'; // Success
    if (val <= goal + 10) return 'text-orange-500 dark:text-orange-400'; // Neutral/Warning
    return 'text-red-600 dark:text-red-400'; // Fail
  };

  // For Protein (Minimum Target)
  const getProteinColor = (value: number | string, goal: number) => {
    const val = Number(value);
    if (!userGoals) return 'text-white';
    
    // Goal: 150
    // >= 150 -> Green
    // 120-149 (goal - 30) -> Orange
    // < 120 -> Red
    if (val >= goal) return 'text-green-600 dark:text-green-400';
    if (val >= goal - 30) return 'text-orange-500 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getCalorieStatus = (current: number, goal: number) => {
      if (current <= goal) {
          return { color: 'text-green-600 dark:text-green-400', icon: Flame };
      }
      if (current <= goal + 150) {
          return { color: 'text-orange-500 dark:text-orange-400', icon: Meh };
      }
      return { color: 'text-red-600 dark:text-red-400', icon: Frown };
  };

  // Determine calorie visual state
  let CalorieIcon = Flame;
  let calorieColor = 'text-white';
  
  if (userGoals) {
      const status = getCalorieStatus(Number(formData.calories), userGoals.calories);
      CalorieIcon = status.icon;
      calorieColor = status.color;
  } else if (formData.calories) {
      calorieColor = 'text-white';
      CalorieIcon = Flame;
  }

  return (
    <Card title={initialData ? "Edit Entry" : "New Entry"} className="mb-6">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        <DatePicker
          label="Date"
          value={formData.date}
          onChange={handleDateChange}
          error={errors.date}
          existingDates={existingDates}
        />
        
        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Protein (g)"
            type="number"
            name="protein"
            value={formData.protein}
            onChange={handleChange}
            placeholder="0"
            error={errors.protein}
            className={userGoals ? getProteinColor(formData.protein, userGoals.protein) : ''}
          />
          <Input
            label="Carbs (g)"
            type="number"
            name="carbs"
            value={formData.carbs}
            onChange={handleChange}
            placeholder="0"
            error={errors.carbs}
            className={userGoals ? getMacroColor(formData.carbs, userGoals.carbs) : ''}
          />
          <Input
            label="Fat (g)"
            type="number"
            name="fat"
            value={formData.fat}
            onChange={handleChange}
            placeholder="0"
            error={errors.fat}
            className={userGoals ? getMacroColor(formData.fat, userGoals.fat) : ''}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 items-end">
          <Input
            label="Weight (kg)"
            type="number"
            step="0.1"
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="0.0"
            error={errors.weight}
          />
          
          <div className="flex flex-col gap-1.5 w-full">
            <span className={`text-xs font-bold uppercase tracking-wider ml-1 ${calorieColor}`}>
              Total Calories
            </span>
            <div className={`w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 flex items-center justify-between shadow-inner`}>
               <span className={`text-xl font-bold tracking-wide ${calorieColor}`}>
                 {formData.calories || 0}
               </span>
               <CalorieIcon size={20} className={calorieColor} />
            </div>
          </div>
        </div>

        <div className="mt-2">
            <Button type="submit" fullWidth disabled={!!errors.date}>
                <Save size={20} />
                {initialData ? "Update Log" : "Save Log"}
            </Button>
        </div>
      </form>
    </Card>
  );
};