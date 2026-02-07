'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import axios from 'axios'
import { Plus, Sparkles, LogOut, Loader2 } from 'lucide-react'

// Import our modular components
import Auth from '@/components/Auth'
import TodoList from '@/components/TodoList'

// Types
interface Todo {
  id: string
  title: string
  is_complete: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  // 1. Handle Auth Session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) await fetchTodos(session.user.id)
      setInitialLoading(false)
    }
    
    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchTodos(session.user.id)
      else setTodos([])
    })

    return () => subscription.unsubscribe()
  }, [])

  // 2. API Functions
  const fetchTodos = async (userId: string) => {
    try {
      const res = await axios.get(`${API_URL}/todos/${userId}`)
      setTodos(res.data)
    } catch (error) {
      console.error('Error fetching todos:', error)
    }
  }

  const addTodo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!newTodo.trim() || !user) return

    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/todos`, {
        title: newTodo,
        user_id: user.id
      })
      // Add new todo to top of list
      setTodos([res.data, ...todos])
      setNewTodo('')
    } catch (error) {
      console.error('Error adding todo:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleTodo = async (id: string, currentStatus: boolean) => {
    // Optimistic Update (update UI immediately)
    setTodos(todos.map(t => t.id === id ? { ...t, is_complete: !currentStatus } : t))
    
    try {
      await axios.put(`${API_URL}/todos/${id}`, { is_complete: !currentStatus })
    } catch (error) {
      console.error('Error updating todo:', error)
      fetchTodos(user!.id) // Revert if API fails
    }
  }

  const deleteTodo = async (id: string) => {
    setTodos(todos.filter(t => t.id !== id))
    try {
      await axios.delete(`${API_URL}/todos/${id}`)
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  const suggestTask = async () => {
    if (!user) return
    setAiLoading(true)
    try {
      const res = await axios.post(`${API_URL}/generate-task`, {
        user_id: user.id,
        current_todos: todos.map(t => t.title)
      })
      setNewTodo(res.data.suggestion)
    } catch (error) {
      console.error("AI Error", error)
    } finally {
      setAiLoading(false)
    }
  }

  // 3. Render Logic
  if (initialLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
  }

  if (!user) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="text-indigo-600 w-5 h-5" />
            <h1 className="font-bold text-xl text-slate-800">AI Task Manager</h1>
          </div>
          <button 
            onClick={() => supabase.auth.signOut()} 
            className="text-sm font-medium text-slate-500 hover:text-red-600 flex items-center gap-2 transition-colors"
          >
            Sign Out <LogOut size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Input Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8">
          <h2 className="text-lg font-semibold mb-4 text-slate-800">Add a new task</h2>
          <form onSubmit={addTodo} className="relative">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="What needs to be done?"
              className="w-full p-4 pr-36 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            
            <div className="absolute right-2 top-2 bottom-2 flex gap-2">
              <button
                type="button"
                onClick={suggestTask}
                disabled={aiLoading}
                className="flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
                title="Ask AI to suggest the next task based on your list"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span className="hidden sm:inline">AI Suggest</span>
              </button>

              <button
                type="submit"
                disabled={loading || !newTodo}
                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          </form>
        </div>

        {/* Todo List Component */}
        <TodoList 
          todos={todos} 
          onToggle={toggleTodo} 
          onDelete={deleteTodo} 
        />
      </main>
    </div>
  )
}