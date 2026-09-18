import { useState, useEffect } from 'react';

export default function App() {
  // LocalStorage Persistence
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('todo_app_tasks');
    return saved
      ? JSON.parse(saved)
      : [
          { id: '1', text: 'Set up Vite + React + Tailwind v4', completed: true, priority: 'high' },
          { id: '2', text: 'Deploy to GitHub Pages via Actions', completed: true, priority: 'medium' },
          { id: '3', text: 'Add task priorities and local storage', completed: false, priority: 'high' },
        ];
  });

  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState('medium');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('todo_app_tasks', JSON.stringify(todos));
  }, [todos]);

  // Actions
  const addTodo = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    const newTodo = {
      id: Date.now().toString(),
      text: inputText.trim(),
      completed: false,
      priority,
    };
    setTodos([newTodo, ...todos]);
    setInputText('');
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, text: editText.trim() } : todo
      )
    );
    setEditingId(null);
  };

  const clearCompleted = () => {
    setTodos(todos.filter((todo) => !todo.completed));
  };

  // Filtered Todos
  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  // Metrics
  const completedCount = todos.filter((t) => t.completed).length;
  const progress = todos.length ? Math.round((completedCount / todos.length) * 100) : 0;

  const priorityColors = {
    high: 'bg-red-500/10 text-red-500 border-red-500/20',
    medium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    low: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Task Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">Manage your daily priorities</p>
          </div>
          <span className="text-xs px-3 py-1 bg-slate-800 text-slate-300 rounded-full border border-slate-700">
            {completedCount}/{todos.length} Done
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-2 rounded-full mb-6 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Input Form */}
        <form onSubmit={addTodo} className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Add a new task..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-slate-100 placeholder-slate-500 transition-colors"
          />
          <div className="flex gap-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-3 text-xs focus:outline-none focus:border-cyan-500 text-slate-300 capitalize cursor-pointer"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium text-sm px-5 py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
            >
              Add
            </button>
          </div>
        </form>

        {/* Filter Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            {['all', 'active', 'completed'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  filter === type
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
            >
              Clear completed
            </button>
          )}
        </div>

        {/* Task List */}
        <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
          {filteredTodos.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No tasks found. Time to relax!
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                className={`group flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                  todo.completed
                    ? 'bg-slate-950/40 border-slate-800/50 opacity-60'
                    : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0 pr-3">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 bg-slate-900 cursor-pointer"
                  />
                  {editingId === todo.id ? (
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onBlur={() => saveEdit(todo.id)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit(todo.id)}
                      autoFocus
                      className="flex-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-slate-100 focus:outline-none"
                    />
                  ) : (
                    <span
                      onClick={() => toggleTodo(todo.id)}
                      className={`text-sm cursor-pointer truncate ${
                        todo.completed ? 'line-through text-slate-500' : 'text-slate-200'
                      }`}
                    >
                      {todo.text}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] uppercase font-semibold px-2 py-0.5 rounded border ${
                      priorityColors[todo.priority]
                    }`}
                  >
                    {todo.priority}
                  </span>
                  
                  {editingId !== todo.id && (
                    <button
                      onClick={() => startEditing(todo)}
                      className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-cyan-400 text-xs px-1.5 py-1 transition-opacity"
                    >
                      Edit
                    </button>
                  )}

                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-400 text-xs px-1.5 py-1 transition-opacity"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
