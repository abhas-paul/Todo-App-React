import { useState, useEffect } from 'react';

export default function TodoApp() {
  const [todos, setTodos] = useState(() => {
    const saved = localStorage.getItem('notion_todo_tasks');
    return saved
      ? JSON.parse(saved)
      : [
          {
            id: '1',
            text: 'Submit project report',
            completed: false,
            priority: 'high',
            dueDate: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
            notified: false,
          },
        ];
  });

  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState('all');
  const [notifPermission, setNotifPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );

  useEffect(() => {
    localStorage.setItem('notion_todo_tasks', JSON.stringify(todos));
  }, [todos]);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();

      setTodos((prevTodos) =>
        prevTodos.map((todo) => {
          if (todo.dueDate && !todo.completed && !todo.notified) {
            const taskDue = new Date(todo.dueDate);
            if (taskDue <= now) {
              if (Notification.permission === 'granted') {
                new Notification('⏰ Task Reminder!', {
                  body: `Due now: "${todo.text}"`,
                });
              }
              return { ...todo, notified: true };
            }
          }
          return todo;
        })
      );
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const addTodo = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newTodo = {
      id: Date.now().toString(),
      text: inputText.trim(),
      completed: false,
      priority,
      dueDate: dueDate || null,
      notified: false,
    };

    setTodos([newTodo, ...todos]);
    setInputText('');
    setDueDate('');
  };

  const toggleTodo = (id) => {
    setTodos(
      todos.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const deleteTodo = (id) => {
    setTodos(todos.filter((t) => t.id !== id));
  };

  const getDueDateBadge = (dateString, completed) => {
    if (!dateString) return null;
    if (completed) return <span className="text-slate-500 text-xs">Done</span>;

    const due = new Date(dateString);
    const now = new Date();
    const diffHours = (due - now) / (1000 * 60 * 60);

    if (diffHours < 0) {
      return (
        <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] px-2 py-0.5 rounded font-medium">
          Overdue
        </span>
      );
    } else if (diffHours <= 24) {
      return (
        <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] px-2 py-0.5 rounded font-medium">
          Due Today
        </span>
      );
    }
    return (
      <span className="bg-slate-800 text-slate-300 border border-slate-700 text-[11px] px-2 py-0.5 rounded font-medium">
        {due.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
      </span>
    );
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-lg">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
              TODOs: Tasks & Reminders
            </h1>
            <p className="text-slate-400 text-xs mt-1">Smart task tracking with automated alerts</p>
          </div>

          {notifPermission !== 'granted' && (
            <button
              onClick={requestNotificationPermission}
              className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/20 px-3 py-2 rounded-xl transition-all self-start sm:self-auto cursor-pointer"
            >
              🔔 Enable Notifications
            </button>
          )}
        </div>

        <form onSubmit={addTodo} className="flex flex-col gap-3 mb-6">
          <input
            type="text"
            placeholder="Task description..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-slate-100 placeholder-slate-600"
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>

            <input
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 [color-scheme:dark] cursor-pointer"
            />

            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:opacity-90 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              Add Task
            </button>
          </div>
        </form>

        <div className="flex gap-2 border-b border-slate-800 pb-3 mb-4">
          {['all', 'active', 'completed'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded-lg text-xs capitalize transition-all cursor-pointer ${
                filter === type
                  ? 'bg-slate-800 text-cyan-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center justify-between p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-0 bg-slate-900 cursor-pointer"
                />
                <span
                  className={`text-sm truncate ${
                    todo.completed ? 'line-through text-slate-500' : 'text-slate-200'
                  }`}
                >
                  {todo.text}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {getDueDateBadge(todo.dueDate, todo.completed)}

                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                    todo.priority === 'high'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      : todo.priority === 'medium'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {todo.priority}
                </span>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-slate-500 hover:text-rose-400 text-xs px-2 py-1 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
          {filteredTodos.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-sm">
              No tasks found in this view.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
