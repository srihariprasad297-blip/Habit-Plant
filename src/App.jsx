import React, { useEffect, useMemo, useState } from "react";
import HabitCard from "./components/HabitCard";
import { motion, AnimatePresence } from "framer-motion";
import PlantSVG from "./components/PlantSVG";


const STORAGE_KEY = "habit-plant-v2";
const MISS_THRESHOLD = 2;
const REVIVE_THRESHOLD = 3;

const formatDate = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
const todayKey = formatDate(new Date());

function computeStreakFromHistory(history = []) {
  if (!history.length) return 0;
  const set = new Set(history.map(d => d));
  const sorted = Array.from(set).sort();
  let cursor = new Date(sorted[sorted.length - 1]);
  let count = 0;
  while (set.has(new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate()).toISOString().slice(0, 10))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export default function App() {
  const [habits, setHabits] = useState([]);
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setHabits(JSON.parse(raw));
      } catch {
        setHabits([]);
      }
    }
    // pick theme from daisyUI
    const savedTheme = localStorage.getItem("hp-theme");
    if (savedTheme) setTheme(savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : theme);
    localStorage.setItem("hp-theme", theme);
  }, [theme]);

  const addOrUpdateHabit = (payload) => {
    if (payload.id) {
      setHabits(habits.map(h => h.id === payload.id ? { ...h, ...payload } : h));
    } else {
      const newH = {
        id: Date.now().toString(),
        name: payload.name,
        note: payload.note || "",
        history: [],
        createdAt: new Date().toISOString(),
        withered: false
      };
      setHabits([newH, ...habits]);
    }
    setShowModal(false);
    setEditing(null);
  };

  const markToday = (id) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const hist = Array.from(new Set([...(h.history||[]), todayKey])).sort();
      // check if missed before today -> withered logic
      const lastBefore = (h.history||[]).length ? (h.history||[]).sort().slice(-1)[0] : null;
      let withered = !!h.withered;
      if (lastBefore) {
        const misses = (new Date(todayKey) - new Date(lastBefore)) / (1000*60*60*24) - 1;
        if (misses >= MISS_THRESHOLD) withered = true;
      }
      const streak = computeStreakFromHistory(hist);
      if (withered && streak >= REVIVE_THRESHOLD) withered = false;
      return { ...h, history: hist, withered };
    }));
  };

  const undoToday = (id) => {
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const hist = (h.history || []).filter(d => d !== todayKey);
      // recompute withered status
      const last = hist.length ? hist.sort().slice(-1)[0] : null;
      let withered = !!h.withered;
      if (last) {
        const misses = (new Date(todayKey) - new Date(last)) / (1000*60*60*24) - 1;
        if (misses >= MISS_THRESHOLD) withered = true;
      } else {
        withered = false;
      }
      return { ...h, history: hist, withered };
    }));
  };

  const remove = (id) => {
    if (!confirm("Delete this habit?")) return;
    setHabits(habits.filter(h => h.id !== id));
  };

  const edit = (h) => {
    setEditing(h);
    setShowModal(true);
  };

  const clearAll = () => {
    if (!confirm("Reset everything? This clears all habits.")) return;
    setHabits([]);
  };

  const exportData = () => {
    const data = JSON.stringify(habits, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "habit-plant-export.json"; a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (file) => {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (Array.isArray(parsed)) {
          setHabits(parsed);
          alert("Imported successfully.");
        } else {
          alert("Invalid file format.");
        }
      } catch {
        alert("Failed to parse JSON.");
      }
    };
    reader.readAsText(file);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return habits;
    return habits.filter(h => h.name.toLowerCase().includes(q) || (h.note||"").toLowerCase().includes(q));
  }, [habits, query]);

  // quick stats
  const total = habits.length;
  const totalStreak = habits.reduce((acc, h) => acc + computeStreakFromHistory(h.history), 0);

  return (
    <div className="min-h-screen p-6">
      <header className="max-w-6xl mx-auto flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-br from-green-400 to-emerald-600 w-12 h-12 flex items-center justify-center text-white text-xl font-bold">🌱</div>
            <div>
              <h1 className="text-2xl font-bold">Habit Plant</h1>
              <div className="text-sm text-gray-500">Grow plants by keeping your habits alive</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-sm text-gray-600">Today: <span className="font-medium ml-1">{todayKey}</span></div>
          <button className="btn btn-ghost" onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}>
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          <button className="btn btn-primary" onClick={() => { setShowModal(true); setEditing(null); }}>+ Add Habit</button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        <section className="mb-6 grid md:grid-cols-3 gap-4">
          <div className="card bg-base-100 p-4">
            <div className="flex items-center gap-3">
              <PlantSVG stage={Math.min(3, Math.floor(totalStreak/5))} size={72} />
              <div>
                <div className="text-sm text-gray-500">Total Habits</div>
                <div className="text-2xl font-bold">{total}</div>
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xs text-gray-500">Total combined streak</div>
              <div className="font-medium">{totalStreak}</div>
            </div>
          </div>

          <div className="card p-4 bg-base-100">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search habits or notes..." className="input input-bordered w-full" />
            <div className="mt-3 flex gap-2">
              <label className="btn btn-outline btn-sm cursor-pointer">
                <input type="file" accept="application/json" onChange={(e) => importData(e.target.files[0])} className="hidden" />
                Import
              </label>
              <button className="btn btn-outline btn-sm" onClick={exportData}>Export</button>
              <button className="btn btn-error btn-sm ml-auto" onClick={clearAll}>Reset All</button>
            </div>
          </div>

          <div className="card p-4 bg-base-100">
            <div className="text-sm text-gray-500">Quick tips</div>
            <ul className="list-disc ml-4 mt-2 text-sm">
              <li>Mark daily to grow your plant.</li>
              <li>Skip more than 2 days → plant withers.</li>
              <li>3 consecutive days revive a withered plant.</li>
            </ul>
          </div>
        </section>

        <section>
          <AnimatePresence>
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(h => (
                <HabitCard
                  key={h.id}
                  habit={h}
                  todayKey={todayKey}
                  onMark={markToday}
                  onUndo={undoToday}
                  onDelete={remove}
                  onEdit={edit}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {filtered.length === 0 && (
            <div className="mt-8 text-center text-gray-500">No habits yet — add one using the <strong>+ Add Habit</strong> button.</div>
          )}
        </section>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => { setShowModal(false); setEditing(null); }} />
            <motion.div initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: 20 }} className="relative bg-base-100 rounded-lg p-6 shadow-lg w-full max-w-md">
              <HabitForm
                editing={editing}
                onClose={() => { setShowModal(false); setEditing(null); }}
                onSave={addOrUpdateHabit}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Habit Form Component (inline to keep single-file) */
function HabitForm({ editing, onClose, onSave }) {
  const [name, setName] = useState(editing?.name || "");
  const [note, setNote] = useState(editing?.note || "");

  useEffect(() => {
    setName(editing?.name || "");
    setNote(editing?.note || "");
  }, [editing]);

  const submit = (e) => {
    e?.preventDefault();
    if (!name.trim()) return alert("Name required");
    onSave({ id: editing?.id, name: name.trim(), note: note.trim() });
  };

  return (
    <form onSubmit={submit}>
      <h3 className="text-lg font-semibold mb-3">{editing ? "Edit Habit" : "Add Habit"}</h3>
      <div className="form-control mb-3">
        <label className="label"><span className="label-text">Habit name</span></label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="input input-bordered w-full" placeholder="e.g., Read 20 pages" />
      </div>
      <div className="form-control mb-3">
        <label className="label"><span className="label-text">Note (optional)</span></label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} className="textarea textarea-bordered w-full" rows="3"></textarea>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary">{editing ? "Save" : "Add"}</button>
      </div>
    </form>
  );
}
