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
    <div className="flex h-screen bg-black text-white">
      <SideBar />
      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col lg:flex-row gap-10">
        {/* Today's Goals */}
        <div className="w-full lg:w-2/3">
          <h1 className="text-2xl font-light text-white mb-8 tracking-widest uppercase">
            Today&apos;s Goals
          </h1>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <p className="text-red-400 text-sm tracking-wide">{error}</p>
          ) : dailyGoals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 border border-white/10 rounded-sm">
              <p className="text-white/50 text-sm tracking-wider">No pending goals for today</p>
            </div>
          ) : (
            <ul className="space-y-5">
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
                      exit={{ 
                        opacity: 0, 
                        x: -100,
                        transition: { duration: 0.3, ease: "easeInOut" } 
                      }}
                      transition={{ duration: 0.4 }}
                      layout
                    >
                      <div className="bg-black border border-white/10 p-5 rounded-sm shadow-sm">
                        <div className="flex justify-between items-center">
                          <span className="font-light tracking-wide">{goal.description}</span>
                          {!timer?.hasStarted && (
                            <button
                              className="ml-4 px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider rounded-sm"
                              onClick={() => toggleTimer(goal._id)}
                            >
                              Start
                            </button>
                          )}
                        </div>

                        {timer && timer.hasStarted && (
                          <div className="mt-4">
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-sm font-light tracking-wider">{formatTime(timer.timeLeft)}</span>
                              <button
                                className="text-xs tracking-wider bg-white text-black px-3 py-1 rounded-sm hover:bg-gray-200 transition-colors duration-300 uppercase"
                                onClick={() => toggleTimer(goal._id)}
                              >
                                {timer.isRunning ? 'Pause' : 'Resume'}
                              </button>
                            </div>
                            
                            <div className="relative w-full h-[2px] bg-white/10">
                              <div
                                className="absolute top-0 left-0 h-full bg-white transition-all duration-500"
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
        <div className="w-full lg:w-1/3 bg-black border border-white/10 p-6 rounded-sm">
          <h2 className="text-xl font-light tracking-widest uppercase mb-6">
            Leaderboard
          </h2>

          <div className="flex gap-3 mb-8">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && searchTerm.trim() !== '') {
                  handleSearch();
                }
              }}
              className="flex-1 px-4 py-2 border border-white/20 bg-black text-white text-sm placeholder-white/40 focus:outline-none focus:border-white transition-colors duration-300"
              placeholder="Search goal..."
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-white text-black hover:bg-gray-200 transition-colors duration-300 text-xs uppercase tracking-wider"
            >
              Search
            </button>
          </div>

          {leaderboardLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          ) : leaderboardError ? (
            <p className="text-red-400 text-sm tracking-wide">{leaderboardError}</p>
          ) : leaderboard.length === 0 ? (
            <p className="text-white/50 text-sm tracking-wider text-center py-10">No results found</p>
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
                    className="flex items-center bg-black border border-white/10 p-3 rounded-sm gap-4 hover:border-white/30 transition-colors duration-300"
                  >
                    <img
                      src={user.avatar}
                      alt="avatar"
                      className="w-10 h-10 rounded-full object-cover border border-white/30"
                    />
                    <div className="flex-1">
                      <p className="font-light">
                        <span className="text-white/70 mr-1">#{index + 1}</span> {user.username}
                      </p>
                      <p className="text-xs text-white/50 mt-1 tracking-wider">
                        Goal: {user.goal} | Days: {user.daysCompleted}
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