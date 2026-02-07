'use client'

import { Trash2, CheckCircle, Circle } from 'lucide-react'

// Define the shape of a Todo item
interface Todo {
  id: string
  title: string
  is_complete: boolean
}

// Define the props this component expects
interface TodoListProps {
  todos: Todo[]
  onToggle: (id: string, currentStatus: boolean) => void
  onDelete: (id: string) => void
}

export default function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
        <p className="text-slate-400">No tasks yet. Start by adding one above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className={`group flex items-center justify-between p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 ${
            todo.is_complete ? 'opacity-60 bg-slate-50' : ''
          }`}
        >
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => onToggle(todo.id, todo.is_complete)}
              className={`transition-colors duration-200 ${
                todo.is_complete 
                  ? 'text-green-500 hover:text-green-600' 
                  : 'text-slate-300 hover:text-indigo-600'
              }`}
            >
              {todo.is_complete ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <Circle className="w-6 h-6" />
              )}
            </button>
            
            <span
              className={`text-lg transition-all duration-200 ${
                todo.is_complete 
                  ? 'line-through text-slate-400' 
                  : 'text-slate-700 font-medium'
              }`}
            >
              {todo.title}
            </span>
          </div>

          <button
            onClick={() => onDelete(todo.id)}
            className="text-slate-300 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
            aria-label="Delete task"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  )
}