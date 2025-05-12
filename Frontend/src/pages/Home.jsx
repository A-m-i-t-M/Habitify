import React, { useEffect, useState } from 'react';
import SideBar from '../../components/SideBar';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dailyGoals, setDailyGoals] = useState([]);
  const [timers, setTimers] = useState([]);
  const [completingGoals, setCompletingGoals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState('');

  useEffect(() => {
    const storedTimers = JSON.parse(localStorage.getItem('timers')) || [];
    setTimers(storedTimers);

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
        const newTimers = dailyGoals.map((goal) => {
          const existing = timerMap.get(goal._id);
          return (
            existing || {
              id: goal._id,
              timeLeft: parseInt(goal.duration.hours) * 3600 + parseInt(goal.duration.minutes) * 60,
              isRunning: false,
              hasStarted: false,
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
      setLeaderboardError('Error fetching leaderboard');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      <SideBar />
      <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-6">
        {/* Today's Goals */}
        <div className="w-full lg:w-2/3">
          <h1 className="text-3xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
            Today's Goals
          </h1>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : dailyGoals.length === 0 ? (
            <p className="text-gray-500">No pending goals for today!</p>
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
                    <div className="bg-gray-900 p-4 rounded-lg shadow-md text-white">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{goal.description}</span>
                        {!timer?.hasStarted && (
                          <button
                            className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg shadow"
                            onClick={() => toggleTimer(goal._id)}
                          >
                            Start
                          </button>
                        )}
                      </div>

                      {timer && timer.hasStarted && (
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-300">{formatTime(timer.timeLeft)}</span>
                            <button
                              className="text-xs text-white bg-yellow-500 px-2 py-1 rounded"
                              onClick={() => toggleTimer(goal._id)}
                            >
                              {timer.isRunning ? 'Pause' : 'Play'}
                            </button>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
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
        {/* <div className="w-full lg:w-1/3 bg-gray-800 p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Search Leaderboard</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter goal name..."
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
            >
              Search
            </button>
          </div>

          {leaderboardLoading ? (
            <p className="text-gray-400">Loading leaderboard...</p>
          ) : leaderboardError ? (
            <p className="text-red-500">{leaderboardError}</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-gray-400">No results yet.</p>
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
                    className="flex items-center bg-gray-700 p-3 rounded-lg shadow-sm gap-3"
                  >
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border border-gray-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium">
                        #{index + 1} {user.username}
                      </p>
                      <p className="text-sm text-gray-400">
                        Goal: {user.goal} | Days: {user.daysCompleted}
                      </p>
                    </div>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </div> */}
        <div className="w-full lg:w-1/3 bg-gradient-to-b from-gray-900 to-gray-800 p-6 rounded-2xl shadow-2xl border border-green-500 backdrop-blur-md">
          <h2 className="text-xl font-extrabold text-green-400 mb-6 drop-shadow-[0_0_4px_#22c55e] tracking-wide">
            🔍 Search Leaderboard
          </h2>

          <div className="flex gap-3 mb-6">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchTerm.trim() !== '') {
                  handleSearch();
                }
              }}
              className="flex-1 px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 shadow-inner w-36"
              placeholder="Enter goal name..."
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-semibold shadow-md transition"
            >
              Search
            </button>
          </div>

          {leaderboardLoading ? (
            <p className="text-gray-400 italic">Loading leaderboard...</p>
          ) : leaderboardError ? (
            <p className="text-red-500 font-medium">{leaderboardError}</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-gray-400 italic">No results yet.</p>
          ) : (
            <ul className="space-y-4">
              <AnimatePresence>
                {leaderboard.map((user, index) => (
                  <motion.li
                    key={user.username + index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center bg-gray-800 p-3 rounded-lg shadow-md gap-4 border border-gray-700 hover:scale-[1.02] transition-transform"
                  >
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="w-11 h-11 rounded-full object-cover border-2 border-green-400"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-white">
                        <span className="text-green-400">#{index + 1}</span> {user.username}
                      </p>
                      <p className="text-sm text-gray-400">
                        🎯 Goal: {user.goal} | 📅 Days: {user.daysCompleted}
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