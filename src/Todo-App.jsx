import { useState, useEffect, useRef } from 'react';
import './App.css';
import './util.css';
import { createRoot } from 'react-dom/client';
import add from './assets/plus.svg';
import edit from './assets/edit.svg';
import del from './assets/delete.svg';

function App() {
  // State to hold current date
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const dialogRef = useRef(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editedTask, setEditedTask] = useState('');
  const [showCompleted, setShowCompleted] = useState(false);
  const [completedTasks, setCompletedTasks] = useState([]);

  // Update date every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Load saved tasks and completed tasks from localStorage
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const storedCompleted = JSON.parse(localStorage.getItem('completedTasks')) || [];
    setTasks(storedTasks);
    setCompletedTasks(storedCompleted);
  }, []);

  // Pad single digits with 0
  const pad = (n) => (n < 10 ? '0' + n : n);
  const day = pad(currentDate.getDate());
  const month = pad(currentDate.getMonth() + 1);
  const year = currentDate.getFullYear();

  const openDialog = () => {
    if (dialogRef.current) dialogRef.current.showModal();
  };

  const handleAddTask = () => {
    if (newTask.trim() !== '') {
      const updatedTasks = [...tasks, newTask];
      setTasks(updatedTasks);
      setNewTask('');
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      dialogRef.current?.close();
    }
  };

  const handleDel = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
    setCompletedTasks(completedTasks.filter(i => i !== index));
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks.filter(i => i !== index)));
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setEditedTask(tasks[index]);
  };

  const saveEdit = (index) => {
    if (editedTask.trim() !== '') {
      const updatedTasks = [...tasks];
      updatedTasks[index] = editedTask;
      setTasks(updatedTasks);
      localStorage.setItem('tasks', JSON.stringify(updatedTasks));
      setEditingIndex(null);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  const handleTaskToggle = (index) => {
    let updatedCompleted;
    if (completedTasks.includes(index)) {
      updatedCompleted = completedTasks.filter(i => i !== index);
    } else {
      updatedCompleted = [...completedTasks, index];
    }
    setCompletedTasks(updatedCompleted);
    localStorage.setItem('completedTasks', JSON.stringify(updatedCompleted));
  };

  const handleShowCompletedChange = (e) => {
    setShowCompleted(e.target.checked);
  };

  return (
    <>
      <main className="bg-white rounded-2xl w-[80%] h-[90vh] overflow-auto">
        {/* Header with date */}
        <h1 className="ml-4 mt-4 font-bold text-2xl text-gray-800">Today</h1>
        <h3 className="ml-4 text-[10px]">{day}/{month}/{year}</h3>
        <hr className="ml-[1rem] mr-[1rem] mt-[10px]" />

        {/* Add New Task Button */}
        <figure
          onClick={openDialog}
          className="flex ml-4 mt-4 gap-2 items-center bg-gray-300 w-40 justify-center p-2 rounded-full transition-all duration-300 ease-in-out hover:scale-105 hover:cursor-pointer hover:bg-gray-600"
        >
          <img className="invert" src={add} alt="" />
          <span>Add New Task</span>
        </figure>

        {/* Show completed tasks toggle */}
        <figure className="flex items-center">
          <input 
            className="ml-4 mt-3" 
            type="checkbox" 
            checked={showCompleted}
            onChange={handleShowCompletedChange} 
          />
          <span className="ml-4 mt-3">Show Completed Tasks</span>
        </figure>

        {/* Modal dialog for adding new task */}
        <dialog ref={dialogRef} className="h-[20rem] w-[20rem] rounded-xl p-4 text-center">
          <h2 className="text-lg font-bold mb-4">Enter New Task</h2>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            className="border border-gray-400 p-2 w-full rounded mb-4"
            placeholder="Your task here..."
          />
          <button
            onClick={handleAddTask}
            className="bg-gray-300 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Done
          </button>
        </dialog>

        {/* Display all tasks */}
        <section>
          <h2 className="ml-4 mt-2 font-bold text-gray-800 underline">Your Assignment Awaits</h2>
          <figure>
            {tasks.map((task, index) => {
              if (!showCompleted && completedTasks.includes(index)) return null;
              
              return (
                <section key={index} className="flex items-center justify-between">
                  <section className="ml-4 mt-2 flex items-center gap-2 font-semibold">
                    <input 
                      type="checkbox" 
                      checked={completedTasks.includes(index)}
                      onChange={() => handleTaskToggle(index)}
                    />
                    {editingIndex === index ? (
                      <input
                        type="text"
                        value={editedTask}
                        onChange={(e) => setEditedTask(e.target.value)}
                        className="border border-gray-400 p-1 rounded"
                        autoFocus
                      />
                    ) : (
                      <h1 className={completedTasks.includes(index) ? 'line-through text-gray-400' : ''}>
                        {task}
                      </h1>
                    )}
                  </section>
                  <section className="flex items-center gap-4 mr-4">
                    {editingIndex === index ? (
                      <>
                        <button
                          onClick={() => saveEdit(index)}
                          className="text-green-600 hover:text-green-800 cursor-pointer transition-colors duration-200 text-xl"
                          title="Save"
                        >
                          ✓
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="text-red-600 hover:text-red-800 cursor-pointer transition-colors duration-200 text-xl"
                          title="Cancel"
                        >
                          ✗
                        </button>
                      </>
                    ) : (
                      <>
                        <img
                          className="invert cursor-pointer hover:opacity-80 transition-opacity duration-200"
                          onClick={() => handleEdit(index)}
                          src={edit}
                          alt="Edit"
                          title="Edit task"
                        />
                        <img
                          className="invert cursor-pointer hover:opacity-80 transition-opacity duration-200"
                          onClick={() => handleDel(index)}
                          src={del}
                          alt="Delete"
                          title="Delete task"
                        />
                      </>
                    )}
                  </section>
                </section>
              );
            })}
          </figure>
        </section>
      </main>
    </>
  );
}

createRoot(document.getElementById('root')).render(<App />);