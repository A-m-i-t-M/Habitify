import React, { useEffect, useState } from 'react';
import SideBar from '../../components/SideBar';

export default function Home() {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dailyGoals, setDailyGoals] = useState([]);
  const [timers, setTimers] = useState([]);

  useEffect(() => {
    //getting the previous timers, incase the page was refreshed when a goal was ongoing
    const storedTimers = JSON.parse(localStorage.getItem('timers')) || [];
    setTimers(storedTimers);

    //getting all of the goals over here
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
          return t; //har ek timer hai ye basically
        });

        //check kar rhe h ki agar kisi goal ki aaj ka hissa khatham hua hai toh
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
    //syncing all of the goals with their respective time left
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

  //when you wanna start/resume the timer
  const toggleTimer = (goalId) => {
    setTimers((prev) => {
      const updated = prev.map((timer) => timer.id === goalId ? {...timer, isRunning: !timer.isRunning, hasStarted: true,} : timer);
      localStorage.setItem('timers', JSON.stringify(updated));
      return updated;
    });
  };

  //display karne ke liye
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    const hStr = hrs > 0 ? `${hrs}h ` : '';
    const mStr = mins > 0 ? `${mins}m ` : '';
    const sStr = `${secs}s`;

    return `${hStr}${mStr}${sStr}`.trim();
  };

  const getTimer = (goalId) => timers.find((t) => t.id === goalId);

  return (
    <div className="flex h-screen bg-gray-800">
      <SideBar />
      <div className="flex-1 h-full overflow-y-auto">
        <div className="mx-auto p-4 h-full flex flex-col gap-4 items-center text-center">
          <p className="text-center text-2xl font-semibold italic text-white">
            Today's Goals
          </p>
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : dailyGoals.length === 0 ? (
            <p className="text-gray-400">No pending goals for today!</p>
          ) : (
            <ul className="w-full max-w-2xl flex flex-col gap-4">
              {dailyGoals.map((goal) => {
                const timer = getTimer(goal._id);
                const totalSeconds = parseInt(goal.duration.hours) * 3600 + parseInt(goal.duration.minutes) * 60;
                const percentComplete = timer ? Math.max(0, Math.min( 100, ((totalSeconds - timer.timeLeft) / totalSeconds) * 10)): 0;
                return (
                  <li
                    key={goal._id}
                    className="flex justify-between items-center bg-gray-900 px-4 py-3 rounded-lg shadow-md"
                  >
                    <div className="flex flex-col items-start text-left text-white w-full">
                      <span className="font-medium">{goal.description}</span>
                      {timer && timer.hasStarted && (
                        <div className="w-full mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm text-gray-300">
                              {formatTime(timer.timeLeft)}
                            </span>
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
                    {!timer?.hasStarted && (
                      <button
                        className="ml-4 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg shadow"
                        onClick={() => toggleTimer(goal._id)}
                      >
                        Start
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
