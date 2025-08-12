import React, { useState, useEffect } from "react";
import PlantSVG from "./PlantSVG";

const STORAGE_KEY = "habit-plant-tracker-v1";
const MISS_THRESHOLD = 2;
const REVIVE_THRESHOLD = 3;

const formatDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));
const prevDay = (date) => { const d = new Date(date); d.setDate(d.getDate() - 1); return d; };

const computeStreak = (history) => {
  if (!history.length) return 0;
  const set = new Set(history);
  let cursor = new Date(history.sort().slice(-1)[0]);
  let count = 0;
  while (set.has(formatDate(cursor))) {
    count++;
    cursor = prevDay(cursor);
  }
  return count;
};

export default function App() {
  const [habits, setHabits] = useState([]);
  const [newName, setNewName] = useState("");
  const today = formatDate(new Date());

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    setHabits(data);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  const addHabit = () => {
    if (!newName.trim()) return;
    setHabits([{ id: Date.now(), name: newName.trim(), history: [], withered: false }, ...habits]);
    setNewName("");
  };

  const markToday = (id) => {
    setHabits(habits.map(h => {
      if (h.id !== id) return h;
      const updated = [...new Set([...h.history, today])];
      const streak = computeStreak(updated);
      return { ...h, history: updated, withered: h.withered && streak < REVIVE_THRESHOLD };
    }));
  };

  const undoToday = (id) => {
    setHabits(habits.map(h => h.id === id ? { ...h, history: h.history.filter(d => d !== today) } : h));
  };

  const removeHabit = (id) => setHabits(habits.filter(h => h.id !== id));

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-green-50 to-white">
      <h1 className="text-2xl font-bold mb-4">🌱 Habit Plant Tracker</h1>
      <div className="flex gap-2 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New habit"
          className="flex-1 border rounded px-3 py-2"
        />
        <button onClick={addHabit} className="bg-green-500 text-white px-4 py-2 rounded">Add</button>
      </div>
      <div className="space-y-4">
        {habits.map(h => {
          const streak = computeStreak(h.history);
          const doneToday = h.history.includes(today);
          let stage = streak <= 0 ? 0 : streak <= 2 ? 1 : streak <= 6 ? 2 : 3;
          if (h.withered) stage = 0;
          return (
            <div key={h.id} className="bg-white p-4 rounded shadow flex gap-4 items-center">
              <PlantSVG stage={stage} withered={h.withered} />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold">{h.name}</h2>
                  <span className="text-sm text-gray-500">Streak: {streak}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  {!doneToday ? (
                    <button onClick={() => markToday(h.id)} className="bg-green-500 text-white px-3 py-1 rounded">Done Today</button>
                  ) : (
                    <button onClick={() => undoToday(h.id)} className="bg-yellow-400 text-white px-3 py-1 rounded">Undo</button>
                  )}
                  <button onClick={() => removeHabit(h.id)} className="bg-red-500 text-white px-3 py-1 rounded">Delete</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
