import React, { useState, useEffect } from 'react';
import { DailyLog, UserGoals } from './types';
import { TrackerForm } from './components/TrackerForm';
import { Charts } from './components/Charts';
import { LogList } from './components/LogList';
import { BottomNav } from './components/BottomNav';
import { GoalForm } from './components/GoalForm';
import { Badges, BADGE_CONFIG } from './components/Badges';
import { Toast } from './components/Toast';
import { Modal } from './components/Modal';
import { Download, Activity, Database, Sun, Moon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const STORAGE_KEY = 'nutrition_tracker_data_v1';
const GOALS_KEY = 'nutrition_tracker_goals_v1';
const THEME_KEY = 'nutrition_tracker_theme';

type Tab = 'entry' | 'history' | 'stats' | 'goals' | 'badges';
type Theme = 'light' | 'dark';

// Helper to get local YYYY-MM-DD string
const getLocalISODate = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().split('T')[0];
};

function App() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [userGoals, setUserGoals] = useState<UserGoals | null>(null);
  const [editingLog, setEditingLog] = useState<DailyLog | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [historyExpandedDate, setHistoryExpandedDate] = useState<string | null>(null);
  const [highlightedFields, setHighlightedFields] = useState<string[]>([]);
  
  // Modal States
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; date: string | null }>({
    isOpen: false,
    date: null
  });

  const [showFirstLogModal, setShowFirstLogModal] = useState(false);
  
  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(THEME_KEY);
        if (stored === 'light' || stored === 'dark') return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // Clear expanded date history when leaving the history tab
  useEffect(() => {
    if (activeTab !== 'history') {
      setHistoryExpandedDate(null);
      setHighlightedFields([]);
    }
  }, [activeTab]);

  // Preload Images for Performance
  useEffect(() => {
    const preloadImages = () => {
        const urlsToLoad = [
            ...Object.values(BADGE_CONFIG.protein),
            ...Object.values(BADGE_CONFIG.calories)
        ];
        
        urlsToLoad.forEach(url => {
            const img = new Image();
            img.src = url;
        });
    };
    
    // Execute after initial render to avoid blocking critical path
    setTimeout(preloadImages, 1000);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Load from LocalStorage
  useEffect(() => {
    try {
      const storedLogs = localStorage.getItem(STORAGE_KEY);
      const storedGoals = localStorage.getItem(GOALS_KEY);
      
      let parsedLogs: DailyLog[] = [];

      if (storedLogs) {
        parsedLogs = JSON.parse(storedLogs);
        setLogs(parsedLogs);
      }
      if (storedGoals) {
        setUserGoals(JSON.parse(storedGoals));
      }

      // --- FIRST TIME USER LOGIC ---
      // If no logs exist, force landing on 'goals'.
      // Otherwise, land on 'stats' as requested.
      if (parsedLogs.length === 0) {
        setActiveTab('goals');
      } else {
        setActiveTab('stats');
      }

    } catch (e) {
      console.error("Failed to load data", e);
      setActiveTab('stats'); // Fallback
    } finally {
        setIsLoaded(true);
    }
  }, []);

  // Save to LocalStorage whenever logs change
  useEffect(() => {
    if (isLoaded) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    }
  }, [logs, isLoaded]);

  // Save Goals to LocalStorage
  useEffect(() => {
    if (isLoaded && userGoals) {
        localStorage.setItem(GOALS_KEY, JSON.stringify(userGoals));
    }
  }, [userGoals, isLoaded]);

  const handleSaveLog = (newLog: DailyLog) => {
    const isEdit = !!editingLog; 
    let changedFields: string[] = [];

    // Calculate diff if editing
    if (isEdit && editingLog) {
      if (editingLog.weight !== newLog.weight) changedFields.push('weight');
      if (editingLog.protein !== newLog.protein) changedFields.push('protein');
      if (editingLog.carbs !== newLog.carbs) changedFields.push('carbs');
      if (editingLog.fat !== newLog.fat) changedFields.push('fat');
      if (editingLog.calories !== newLog.calories) changedFields.push('calories');
    }

    setLogs(prev => {
      // Remove existing entry for that date if it exists (overwrite logic)
      const filtered = prev.filter(l => l.date !== newLog.date);
      return [...filtered, newLog];
    });
    setEditingLog(null);
    setToastMessage("Log saved successfully!");
    
    if (isEdit) {
      // If we were editing, return to history with the item expanded and set diffs
      setHistoryExpandedDate(newLog.date);
      setHighlightedFields(changedFields);
      setActiveTab('history');
    } else {
      // If new log, go to stats and scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveTab('stats');
    }
  };

  const handleSaveGoals = (goals: UserGoals) => {
    setUserGoals(goals);
    
    // --- FIRST TIME USER LOGIC ---
    // If saving goals and we have 0 logs, assume this is the setup flow.
    // Show modal to prompt for first log.
    if (logs.length === 0) {
        setShowFirstLogModal(true);
    } else {
        setToastMessage("Goals updated successfully!");
        setActiveTab('stats'); 
    }
  };

  const startFirstLog = () => {
      setShowFirstLogModal(false);
      setActiveTab('entry');
  };

  const skipFirstLog = () => {
      setShowFirstLogModal(false);
      setToastMessage("Goals saved!");
      setActiveTab('stats');
  };

  const handleEdit = (log: DailyLog) => {
    setEditingLog(log);
    setActiveTab('entry'); // Switch to entry view when editing
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Opens the modal
  const handleDeleteRequest = (date: string) => {
    setDeleteModal({ isOpen: true, date });
  };

  // Actually deletes the item
  const confirmDelete = () => {
    if (deleteModal.date) {
        const dateToDelete = deleteModal.date;
        setLogs(prev => prev.filter(l => l.date !== dateToDelete));
        
        // If we are currently editing the log that was deleted, clear the edit state
        if (editingLog && editingLog.date === dateToDelete) {
            setEditingLog(null);
        }
        setToastMessage("Entry deleted successfully!");
    }
    setDeleteModal({ isOpen: false, date: null });
  };

  const handleLoadDemoData = () => {
    const demoLogs: DailyLog[] = [];
    const today = new Date();
    
    // Set default goals if not set, or use existing
    const currentGoals = userGoals || {
      calories: 2000,
      protein: 150,
      carbs: 200,
      fat: 60
    };
    
    if (!userGoals) {
        setUserGoals(currentGoals);
    }

    // Generate for last 100 days
    // Logic: ALWAYS meet goals to ensure 100 day streak
    for (let i = 99; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = getLocalISODate(d);

      // Simulate weight loss trend: Start around 90kg, end around 80kg
      const progress = (100 - i) / 100; // 0 to 1
      const baseWeight = 90 - (10 * progress); // 90 -> 80
      const fluctuation = (Math.random() * 0.8) - 0.4;
      const weight = Number((baseWeight + fluctuation).toFixed(1));

      // Perfect Streak Logic
      const proteinLog = Math.floor(currentGoals.protein + (Math.random() * 20)); 
      const caloriesLog = Math.floor(currentGoals.calories - (Math.random() * 100)); 

      demoLogs.push({
        date: dateStr,
        weight: weight,
        calories: caloriesLog,
        protein: proteinLog, 
        carbs: Math.floor(currentGoals.carbs + (Math.random() * 20 - 10)),
        fat: Math.floor(currentGoals.fat + (Math.random() * 10 - 5)),
      });
    }

    setLogs(demoLogs);
    setToastMessage("Demo data (100 days perfect streak) loaded!");
    setActiveTab('badges');
  };

  const handleExportCSV = () => {
    const headers = ['Date', 'Weight (kg)', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)'];
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.date,
        log.weight,
        log.calories,
        log.protein,
        log.carbs,
        log.fat
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `nutrition_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pb-24 transition-colors duration-300">
      <header className="fixed top-0 left-0 right-0 bg-dark-900/80 backdrop-blur-md border-b border-dark-700 z-40 h-16 flex items-center justify-between px-6 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="bg-neon-500 dark:bg-neon-400 p-1.5 rounded-lg shadow-lg shadow-neon-500/20 dark:shadow-neon-400/20 transition-colors">
             <Activity className="text-black" size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">
            Dolev<span className="text-neon-500 dark:text-neon-400 transition-colors">Track</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={toggleTheme}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
             
            <button
               onClick={handleExportCSV}
               className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
               title="Export CSV"
            >
               <Download size={20} />
            </button>

            <button
               onClick={handleLoadDemoData}
               className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
               title="Load Demo Data"
            >
               <Database size={20} />
            </button>
        </div>
      </header>

      <main className="px-4 pt-20 max-w-md mx-auto sm:max-w-2xl animate-in fade-in duration-300">
        {activeTab === 'entry' && (
          <TrackerForm 
              onSave={handleSaveLog} 
              initialData={editingLog} 
              existingDates={new Set(logs.map(l => l.date))}
              userGoals={userGoals}
          />
        )}

        {activeTab === 'history' && (
          <LogList 
            logs={logs} 
            onEdit={handleEdit} 
            onDelete={handleDeleteRequest} 
            initialExpandedDate={historyExpandedDate}
            highlightedFields={highlightedFields}
            userGoals={userGoals}
          />
        )}

        {activeTab === 'stats' && (
          <Charts logs={logs} userGoals={userGoals} theme={theme} />
        )}

        {activeTab === 'goals' && (
          <GoalForm currentGoals={userGoals} onSave={handleSaveGoals} />
        )}
        
        {activeTab === 'badges' && (
          <Badges logs={logs} userGoals={userGoals} />
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={(t) => {
          setActiveTab(t);
          if (t !== 'entry') setEditingLog(null);
      }} />

      <AnimatePresence>
        {toastMessage && <Toast message={toastMessage} onClose={() => setToastMessage(null)} />}
      </AnimatePresence>

      <Modal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({isOpen: false, date: null})}
        onConfirm={confirmDelete}
        title="Delete Entry"
        message="Are you sure you want to delete this log? This action cannot be undone."
        confirmText="Delete"
      />

      <Modal 
          isOpen={showFirstLogModal}
          onClose={skipFirstLog}
          onConfirm={startFirstLog}
          title="Goals Set!"
          message="Great! Now let's log your first day to start tracking your progress."
          confirmText="Log Now"
          cancelText="Skip for Now"
          confirmVariant="primary"
          icon="success"
      />
    </div>
  );
}

export default App;