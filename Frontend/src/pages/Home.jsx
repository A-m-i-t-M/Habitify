import React, { useEffect, useState } from 'react';
import SideBar from '../../components/SideBar';

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

      setDailyGoals((prev) => prev.filter((goal) => goal._id !== goalId));
      setTimers((prev) => {
        const newTimers = prev.filter((timer) => timer.id !== goalId);
        localStorage.setItem('timers', JSON.stringify(newTimers));
        return newTimers;
      });

      setError(null);
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
    <div className="flex h-screen bg-gray-800">
      <SideBar />
      <div className="flex-1 h-full overflow-y-auto p-4 flex flex-col lg:flex-row gap-4">
        {/* Left: Today's Goals */}
        <div className="w-full lg:w-2/3">
          <p className="text-2xl font-semibold italic text-white mb-4">Today's Goals</p>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : dailyGoals.length === 0 ? (
            <p className="text-gray-400">No pending goals for today!</p>
          ) : (
            <ul className="flex flex-col gap-4">
            {dailyGoals.map((goal) => {
  const timer = getTimer(goal._id);
  const totalSeconds = parseInt(goal.duration.hours) * 3600 + parseInt(goal.duration.minutes) * 60;
  const percentComplete = timer
    ? Math.max(0, Math.min(100, ((totalSeconds - timer.timeLeft) / totalSeconds) * 100))
    : 0;

  return (
    <li key={goal._id} className="bg-gray-900 p-4 rounded-lg shadow-md text-white">
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
    </li>
  );
})}
            </ul>
          )}
        </div>

        {/* Right: Leaderboard */}
        <div className="w-full lg:w-1/3 bg-gray-900 p-4 rounded-lg shadow-md text-white">
          <h2 className="text-xl font-bold mb-2">Search Leaderboard</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-2 rounded bg-gray-700 text-white placeholder-gray-400"
              placeholder="Enter goal name..."
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded"
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
            <ul className="space-y-2">
              {leaderboard.map((user, index) => (
                <li key={index} className="bg-gray-800 p-2 rounded-lg flex items-center gap-2">
                  <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                  <div className="flex-1">
                    <p className="font-semibold">
                      {index + 1}. {user.username}
                    </p>
                    <p className="text-sm text-gray-400">
                      Goal: {user.goal} | Days Completed: {user.daysCompleted}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
