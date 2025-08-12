import React from "react";
import PlantSVG from "./PlantSVG";
import { motion } from "framer-motion";

export default function HabitCard({ habit, todayKey, onMark, onUndo, onDelete, onEdit }) {
  const history = habit.history || [];
  const doneToday = history.includes(todayKey);
  // compute streak
  const set = new Set(history);
  let streak = 0;
  if (history.length) {
    const sorted = [...set].sort();
    let cursor = new Date(sorted[sorted.length - 1]);
    while (set.has(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()).toISOString().slice(0, 10))) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
  }
  // stage logic
  let stage = 0;
  if (habit.withered) stage = 0;
  else if (streak <= 0) stage = 0;
  else if (streak <= 2) stage = 1;
  else if (streak <= 6) stage = 2;
  else stage = 3;
  const progress = Math.min(100, Math.round((streak > 0 ? Math.min(14, streak) : 0) / 14 * 100));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      className="card bg-base-100 shadow-xl p-3"
    >
      <div className="flex gap-3">
        <div className="w-24 flex items-center justify-center">
          <PlantSVG stage={stage} withered={habit.withered} size={96} />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{habit.name}</h3>
              <p className="text-sm text-muted mt-1">{habit.note || "No note"}</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Streak</div>
              <div className="font-bold text-xl">{streak}</div>
            </div>
          </div>

          <div className="mt-3">
            <progress className="progress progress-success w-full" value={progress} max="100"></progress>
            <div className="flex items-center justify-between mt-2">
              <div className="text-xs text-gray-500">{habit.withered ? "Withered" : `${progress}%`}</div>
              <div className="flex gap-2">
                {!doneToday ? (
                  <button onClick={() => onMark(habit.id)} className="btn btn-sm btn-primary">Mark Done</button>
                ) : (
                  <button onClick={() => onUndo(habit.id)} className="btn btn-sm btn-warning">Undo</button>
                )}
                <button onClick={() => onEdit(habit)} className="btn btn-sm">Edit</button>
                <button onClick={() => onDelete(habit.id)} className="btn btn-sm btn-outline btn-error">Delete</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
