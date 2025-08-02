import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  PlusCircle,
  Trash2,
  ArrowLeft,
  Edit2,
  Check,
  X,
} from "lucide-react";

export default function DailyPlan() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editedTaskText, setEditedTaskText] = useState("");

  const doctorCode = localStorage.getItem("doctorSecretCode");
  console.log(doctorCode);

  // Load tasks from local storage
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("dailyPlan")) || [];
    const expiration = localStorage.getItem("dailyPlanExpiration");

    if (
      storedTasks.length > 0 &&
      expiration &&
      new Date() < new Date(expiration)
    ) {
      setTasks(storedTasks);
    } else {
      localStorage.removeItem("dailyPlan");
      localStorage.removeItem("dailyPlanExpiration");
    }
  }, []);

  // Save tasks to local storage with 32-hour expiration
  const saveTasksToLocalStorage = (updatedTasks) => {
    setTasks(updatedTasks);
    localStorage.setItem("dailyPlan", JSON.stringify(updatedTasks));
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 32);
    localStorage.setItem("dailyPlanExpiration", expiration.toISOString());
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      const updatedTasks = [...tasks, { id: Date.now(), task: newTask }];
      saveTasksToLocalStorage(updatedTasks);
      setNewTask("");
    }
  };

  const handleDeleteTask = (id) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    saveTasksToLocalStorage(updatedTasks);
  };

  const handleEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditedTaskText(task.task);
  };

  const handleSaveEdit = (id) => {
    if (editedTaskText.trim()) {
      const updatedTasks = tasks.map((task) =>
        task.id === id ? { ...task, task: editedTaskText } : task
      );
      saveTasksToLocalStorage(updatedTasks);
    }
    setEditingTaskId(null);
    setEditedTaskText("");
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null);
    setEditedTaskText("");
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center"
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">Daily Plan</h1>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
        {/* Task Input */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              onKeyPress={(e) => e.key === "Enter" && handleAddTask()}
            />
            <button
              onClick={handleAddTask}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          </div>
        </motion.div>

        {/* Task List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Your Tasks
          </h2>
          <AnimatePresence>
            {tasks.length > 0 ? (
              <ul className="space-y-4">
                {tasks.map((task) => (
                  <motion.li
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition"
                  >
                    {editingTaskId === task.id ? (
                      <div className="flex items-center gap-4 w-full">
                        <input
                          type="text"
                          value={editedTaskText}
                          onChange={(e) => setEditedTaskText(e.target.value)}
                          className="flex-1 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                          autoFocus
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSaveEdit(task.id)
                          }
                        />
                        <button
                          onClick={() => handleSaveEdit(task.id)}
                          className="text-green-500 hover:text-green-600 transition"
                          aria-label="Save edited task"
                        >
                          <Check className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-red-500 hover:text-red-600 transition"
                          aria-label="Cancel edit"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span
                          className="text-gray-800 flex-1 cursor-pointer"
                          onClick={() => handleEditTask(task)}
                        >
                          {task.task}
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditTask(task)}
                            className="text-indigo-500 hover:text-indigo-600 transition"
                            aria-label={`Edit task: ${task.task}`}
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="text-red-500 hover:text-red-600 transition"
                            aria-label={`Delete task: ${task.task}`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </>
                    )}
                  </motion.li>
                ))}
              </ul>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="text-gray-500 text-center"
              >
                No tasks added yet. Start by adding one above!
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer with Back Button */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <button
          onClick={() => navigate(`/doctor/${doctorCode}`)}
          className="flex items-center gap-2 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>
      </motion.footer>
    </div>
  );
}
