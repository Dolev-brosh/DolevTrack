import React, { useState, useEffect } from 'react';
import { UserGoals } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Card } from './Card';
import { Save, Target } from 'lucide-react';

interface GoalFormProps {
  currentGoals: UserGoals | null;
  onSave: (goals: UserGoals) => void;
}

const defaultGoals: UserGoals = {
  calories: 2000,
  protein: 150,
  carbs: 200,
  fat: 60,
};

export const GoalForm: React.FC<GoalFormProps> = ({ currentGoals, onSave }) => {
  const [formData, setFormData] = useState<UserGoals>(defaultGoals);

  useEffect(() => {
    if (currentGoals) {
      setFormData(currentGoals);
    }
  }, [currentGoals]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card title="Daily Targets" className="mb-6">
      <div className="mb-6 bg-dark-900/50 p-4 rounded-xl border border-dark-700 text-sm text-gray-400 flex gap-3">
        <Target className="shrink-0 text-neon-400" size={20} />
        <p>Set your daily nutrition targets here. These values will be used to show your progress and provide feedback while logging.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Input
          label="Daily Calories"
          type="number"
          name="calories"
          value={formData.calories || ''}
          onChange={handleChange}
          placeholder="2000"
        />

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Protein (g)"
            type="number"
            name="protein"
            value={formData.protein || ''}
            onChange={handleChange}
            placeholder="150"
          />
          <Input
            label="Carbs (g)"
            type="number"
            name="carbs"
            value={formData.carbs || ''}
            onChange={handleChange}
            placeholder="200"
          />
          <Input
            label="Fat (g)"
            type="number"
            name="fat"
            value={formData.fat || ''}
            onChange={handleChange}
            placeholder="60"
          />
        </div>

        <div className="mt-2">
            <Button type="submit" fullWidth>
                <Save size={20} />
                Save Targets
            </Button>
        </div>
      </form>
    </Card>
  );
};