'use client'

import { Sparkles, Github } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Auth() {
  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        // Redirect to home page directly. 
        // Supabase client will detect the token in the URL hash automatically.
        redirectTo: `${location.origin}/`, 
      },
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white p-4">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl text-center max-w-md w-full border border-white/20">
        <div className="flex justify-center mb-6">
          <div className="bg-white p-4 rounded-full shadow-lg">
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold mb-2">AI Todo List</h1>
        <p className="text-white/80 mb-8">
          Supercharge your productivity with an AI-powered task manager.
        </p>

        <button
          onClick={handleLogin}
          className="w-full bg-white text-indigo-600 py-3 px-6 rounded-xl font-bold shadow-lg hover:bg-indigo-50 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
        >
          <Github className="w-5 h-5" />
          Sign in with GitHub
        </button>
        
        <p className="mt-6 text-xs text-white/50">
          Powered by Next.js, FastAPI & Llama 3
        </p>
      </div>
    </div>
  )
}