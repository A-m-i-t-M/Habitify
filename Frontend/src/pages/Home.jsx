import { useEffect, useState } from 'react';
import SideBar from '../../components/SideBar';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dailyGoals, setDailyGoals] = useState([]);
  const [timers, setTimers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState('');

  useEffect(() => {
    const storedTimers = JSON.parse(localStorage.getItem('timers')) || [];
    const today = new Date().toISOString().split('T')[0];
    const isSameDay = (timerDate) => timerDate === today;

    const validTimers = storedTimers.filter((timer) =>
      timer.lastUpdated ? isSameDay(timer.lastUpdated) : false
    );

    setTimers(validTimers);

    const fetchGoals = async () => {
      setLoading(true);
      try {
        const res = await fetch('/backend/goals/dailygoals');
        const data = await res.json();
        if (!res.ok) {
          setError(data.message);
          setLoading(false);
          return;
        }
        setDailyGoals(data.goals);
        setError(null);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchGoals();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const updated = prev.map((t) => {
          if (t.isRunning && t.timeLeft > 0) {
            return { ...t, timeLeft: t.timeLeft - 1 };
          }
          return t;
        });

        updated.forEach((timer) => {
          if (timer.isRunning && timer.timeLeft === 0) {
            handleMarkAsDone(timer.id);
          }
        });

        localStorage.setItem('timers', JSON.stringify(updated));
        return updated;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (dailyGoals.length > 0) {
      setTimers((prev) => {
        const timerMap = new Map(prev.map((t) => [t.id, t]));
        const today = new Date().toISOString().split('T')[0];

        const newTimers = dailyGoals.map((goal) => {
          const existing = timerMap.get(goal._id);
          return (
            existing || {
              id: goal._id,
              timeLeft: parseInt(goal.duration.hours) * 3600 + parseInt(goal.duration.minutes) * 60,
              isRunning: false,
              hasStarted: false,
              lastUpdated: today,
            }
          );
        });
        localStorage.setItem('timers', JSON.stringify(newTimers));
        return newTimers;
      });
    }
  }, [dailyGoals]);

  const handleMarkAsDone = async (goalId) => {
    try {
      const res = await fetch('/backend/goals/done', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId }),
      });
  
      const data = await res.json();
      if (!res.ok) {
        setError(data.message);
        return;
      }
  
      setDailyGoals((prev) =>
        prev.map((goal) =>
          goal._id === goalId ? { ...goal, isCompleting: true } : goal
        )
      );
  
      setTimeout(() => {
        setDailyGoals((prev) => prev.filter((goal) => goal._id !== goalId));
        setTimers((prev) => {
          const newTimers = prev.filter((timer) => timer.id !== goalId);
          localStorage.setItem('timers', JSON.stringify(newTimers));
          return newTimers;
        });
      }, 500); 
    } catch (err) {
      setError(err.message);
    }
  };
  

  const toggleTimer = (goalId) => {
    setTimers((prev) => {
      const updated = prev.map((timer) =>
        timer.id === goalId
          ? { ...timer, isRunning: !timer.isRunning, hasStarted: true }
          : timer
      );
      localStorage.setItem('timers', JSON.stringify(updated));
      return updated;
    });
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m ${secs}s`;
  };

  const getTimer = (goalId) => timers.find((t) => t.id === goalId);

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;

    setLeaderboardLoading(true);
    setLeaderboardError('');
    try {
      const res = await fetch('/backend/goals/leaderboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal: searchTerm }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLeaderboardError(data.message);
        setLeaderboard([]);
      } else {
        setLeaderboard(data.leaderboard);
      }
    } catch (err) {
      console.log(err);
      setLeaderboardError('Error fetching leaderboard');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-bg text-text-primary font-serif">
      <SideBar />
      <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
        {/* Today's Goals */}
        <div className="w-full lg:w-2/3">
          <h1 className="text-3xl font-bold text-primary mb-6 border-b border-secondary pb-2">
            Today&apos;s Goals
          </h1>
          {loading ? (
            <p className="text-text-muted">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : dailyGoals.length === 0 ? (
            <p className="text-text-muted">No pending goals for today!</p>
          ) : (
            <ul className="space-y-4">
            <AnimatePresence mode="popLayout">
              {dailyGoals.map((goal) => {
                const timer = getTimer(goal._id);
                const totalSeconds = parseInt(goal.duration.hours) * 3600 + parseInt(goal.duration.minutes) * 60;
                const percentComplete = timer
                  ? Math.max(0, Math.min(100, ((totalSeconds - timer.timeLeft) / totalSeconds) * 100))
                  : 0;

                return (
                  <motion.li
                    key={goal._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ duration: 0.5 }}
                    layout
                  >
                    <div className="bg-bg border border-secondary p-4 rounded-lg shadow-md text-text-primary">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-text-primary">{goal.description}</span>
                        {!timer?.hasStarted && (
                          <button
                            className="ml-4 px-4 py-2 bg-primary hover:bg-accent text-bg rounded-lg shadow-sm"
                            onClick={() => toggleTimer(goal._id)}
                          >
                            Start
                          </button>
                        )}
                      </div>

                      {timer && timer.hasStarted && (
                        <div className="mt-3">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm text-text-muted">{formatTime(timer.timeLeft)}</span>
                            <button
                              className="text-xs text-bg bg-secondary hover:bg-accent px-2.5 py-1.5 rounded-md shadow-sm"
                              onClick={() => toggleTimer(goal._id)}
                            >
                              {timer.isRunning ? 'Pause' : 'Play'}
                            </button>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-secondary h-2.5 rounded-full transition-all duration-500"
                              style={{ width: `${percentComplete}%` }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
            </ul>
          )}
        </div>

        {/* Leaderboard */}
        <div className="w-full lg:w-1/3 bg-bg border border-secondary p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold text-primary mb-6 pb-2 border-b border-secondary">
            Search Leaderboard
          </h2>

          <div className="flex gap-3 mb-6 ml-0 items-center justify-center">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchTerm.trim() !== '') {
                  handleSearch();
                }
              }}
              className="flex-1 px-4 py-2.5 rounded-lg bg-bg border border-secondary text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent shadow-sm w-48"
              placeholder="Enter goal name..."
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2.5 bg-primary hover:bg-accent text-bg rounded-lg font-semibold shadow-md transition"
            >
              Search
            </button>
          </div>

          {leaderboardLoading ? (
            <p className="text-text-muted italic">Loading leaderboard...</p>
          ) : leaderboardError ? (
            <p className="text-red-500 font-medium">{leaderboardError}</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-text-muted italic">No results yet.</p>
          ) : (
            <ul className="space-y-3">
              <AnimatePresence>
                {leaderboard.map((user, index) => (
                  <motion.li
                    key={user.username + index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center bg-bg border border-secondary p-3 rounded-lg shadow-sm gap-3 hover:shadow-md transition-shadow"
                  >
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-secondary"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-text-primary">
                        <span className="text-accent">#{index + 1}</span> {user.username}
                      </p>
                      <p className="text-sm text-text-muted">
                        Goal: {user.goalDescription} | Days: {user.daysCompleted}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}