'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, X, AlertCircle } from 'lucide-react';

interface Todo {
    id: string;
    text: string;
    completed: boolean;
    createdAt: number;
}

export default function TodoList() {
    const [todos, setTodos] = useState<Todo[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('nexus_todos');
        if (saved) {
            try {
                setTodos(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to load todos", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to localStorage whenever todos change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('nexus_todos', JSON.stringify(todos));
        }
    }, [todos, isLoaded]);

    const addTodo = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const newTodo: Todo = {
            id: crypto.randomUUID(),
            text: inputValue.trim(),
            completed: false,
            createdAt: Date.now()
        };

        setTodos(prev => [newTodo, ...prev]);
        setInputValue('');
    };

    const toggleTodo = (id: string) => {
        setTodos(prev => prev.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const deleteTodo = (id: string) => {
        setTodos(prev => prev.filter(todo => todo.id !== id));
    };

    const clearCompleted = () => {
        setTodos(prev => prev.filter(todo => !todo.completed));
    };

    const completedCount = todos.filter(t => t.completed).length;

    if (!isLoaded) return null; // Avoid hydration mismatch

    return (
        <div className="h-full flex flex-col relative overflow-hidden">
            {/* Input Area */}
            <form onSubmit={addTodo} className="relative z-10 mb-4">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="ENTER_TASK_PROTOCOL..."
                    className="w-full bg-black/40 border border-white/10 rounded px-4 py-2.5 text-sm font-mono text-cyan-100 placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_15px_rgba(6,182,212,0.1)] transition-all"
                />
                <button
                    type="submit"
                    className="absolute right-1 top-1 bottom-1 px-3 bg-cyan-900/30 hover:bg-cyan-500/20 text-cyan-400 rounded flex items-center justify-center transition-colors font-mono text-xs border border-transparent hover:border-cyan-500/30"
                >
                    <Plus size={16} />
                </button>
            </form>

            {/* Task List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2 no-scrollbar">
                <AnimatePresence mode='popLayout'>
                    {todos.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-full text-white/20 gap-2 p-4 text-center border border-dashed border-white/5 rounded-lg"
                        >
                            <AlertCircle size={24} />
                            <span className="text-xs font-mono uppercase tracking-widest">No Active Protocols</span>
                        </motion.div>
                    )}

                    {todos.map(todo => (
                        <motion.div
                            key={todo.id}
                            layout
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`group relative flex items-center gap-3 p-3 rounded border transition-all ${todo.completed
                                    ? 'bg-white/5 border-transparent opacity-50'
                                    : 'bg-gradient-to-r from-white/5 to-transparent border-white/10 hover:border-cyan-500/30 hover:shadow-[0_0_10px_rgba(6,182,212,0.1)]'
                                }`}
                        >
                            {/* Checkbox / Status Indicator */}
                            <button
                                onClick={() => toggleTodo(todo.id)}
                                className={`flex-shrink-0 w-5 h-5 rounded-sm border flex items-center justify-center transition-all ${todo.completed
                                        ? 'bg-green-500/20 border-green-500 text-green-500'
                                        : 'border-white/30 text-transparent hover:border-cyan-400'
                                    }`}
                            >
                                <Check size={12} strokeWidth={3} />
                            </button>

                            {/* Text */}
                            <span className={`flex-1 text-xs font-mono break-all ${todo.completed ? 'line-through text-white/30' : 'text-white/90'
                                }`}>
                                {todo.text}
                            </span>

                            {/* Delete Action */}
                            <button
                                onClick={() => deleteTodo(todo.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-all"
                            >
                                <X size={14} />
                            </button>

                            {/* Decorative Corner (if active) */}
                            {!todo.completed && (
                                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500/30 rounded-tr-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Footer / Controls */}
            {completedCount > 0 && (
                <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                    <div className="text-[10px] text-white/40 font-mono">
                        {completedCount} COMPLETED
                    </div>
                    <button
                        onClick={clearCompleted}
                        className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded text-[10px] font-mono text-red-400 transition-all uppercase tracking-wide"
                    >
                        <Trash2 size={10} />
                        <span>Clear All</span>
                    </button>
                </div>
            )}
        </div>
    );
}
