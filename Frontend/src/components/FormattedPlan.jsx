import React from 'react';
import { motion } from 'framer-motion';

const FormattedPlan = ({ planData }) => {
  if (!planData) return null;
  
  // Parse the plan data if it's a string
  let plan;
  try {
    plan = typeof planData === 'string' ? JSON.parse(planData) : planData;
  } catch (error) {
    console.error("Error parsing plan data:", error);
    return (
      <div className="bg-black text-white border border-white/20 p-5">
        <p className="text-white/70">Could not parse the plan data. Please try again.</p>
      </div>
    );
  }
  
  // Handle different structured formats
  const renderTasks = (tasks, category) => {
    if (!tasks || tasks.length === 0) return null;
    
    return (
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="mb-6"
      >
        <h3 className="text-sm uppercase tracking-widest font-light mb-3 text-white/70">{category || 'Tasks'}</h3>
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <motion.div 
              key={index} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.1 + (index * 0.05) }}
              className="flex items-start p-3 border border-white/10 bg-black hover:border-white/30 transition-colors"
            >
              <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center mr-4 flex-shrink-0 text-xs">
                {index + 1}
              </div>
              <div>
                <p className="font-light">{typeof task === 'string' ? task : task.title || task.task || task.name || 'Untitled Task'}</p>
                {task.description && <p className="text-white/50 text-sm mt-1">{task.description}</p>}
                {task.time && <p className="text-white/50 text-xs mt-1">Time: {task.time}</p>}
                {task.duration && <p className="text-white/50 text-xs mt-1">Duration: {task.duration}</p>}
                {task.priority && <p className="text-white/40 text-xs mt-1">Priority: {task.priority}</p>}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };
  
  const renderSchedule = (schedule) => {
    if (!schedule) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="mb-6"
      >
        <h3 className="text-sm uppercase tracking-widest font-light mb-3 text-white/70">Daily Schedule</h3>
        <div className="space-y-3">
          {Object.entries(schedule).map(([time, activity], index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: 0.2 + (index * 0.05) }}
              className="flex items-start p-3 border border-white/10 bg-black hover:border-white/30 transition-colors"
            >
              <div className="min-w-20 font-light mr-4">{time}</div>
              <div className="text-white/80 font-light">{activity}</div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };
  
  // Render notes/tips if available
  const renderNotes = (notes) => {
    if (!notes || (Array.isArray(notes) && notes.length === 0)) return null;
    
    const noteItems = Array.isArray(notes) ? notes : [notes];
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="mb-6"
      >
        <h3 className="text-sm uppercase tracking-widest font-light mb-3 text-white/70">Tips & Notes</h3>
        <div className="border border-white/10 p-4 bg-black">
          <ul className="space-y-2 list-disc pl-5">
            {noteItems.map((note, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.3 + (index * 0.05) }}
                className="text-white/70 text-sm"
              >
                {note}
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    );
  };
  
  return (
    <div className="formatted-plan py-4">
      <motion.h2 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-xl font-light tracking-wider uppercase mb-6"
      >
        Your Daily Plan
      </motion.h2>
      
      {/* Identify and render different parts of the plan based on the structure */}
      {plan.introduction && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/70 mb-6 border-l-2 border-white/20 pl-4"
        >
          <p>{plan.introduction}</p>
        </motion.div>
      )}
      
      {/* Morning tasks */}
      {plan.morning && renderTasks(plan.morning, 'Morning Tasks')}
      
      {/* Afternoon tasks */}
      {plan.afternoon && renderTasks(plan.afternoon, 'Afternoon Tasks')}
      
      {/* Evening tasks */}
      {plan.evening && renderTasks(plan.evening, 'Evening Tasks')}
      
      {/* General tasks */}
      {plan.tasks && renderTasks(plan.tasks)}
      
      {/* Schedule */}
      {plan.schedule && renderSchedule(plan.schedule)}
      
      {/* Notes, Tips, Recommendations */}
      {(plan.notes || plan.tips || plan.recommendations) && 
        renderNotes(plan.notes || plan.tips || plan.recommendations)}
      
      {/* Fallback if structure doesn't match expected format */}
      {!plan.tasks && !plan.morning && !plan.schedule && !plan.introduction && (
        <pre className="text-white/70 text-sm p-4 border border-white/10 whitespace-pre-wrap">
          {JSON.stringify(plan, null, 2)}
        </pre>
      )}
    </div>
  );
};

export default FormattedPlan; 