'use client'
import { register } from '@/lib/actions'
import { Github, Mail, Lock, UserPlus, ArrowLeft, User, Sparkles, Binary, ChevronRight, Zap } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { motion } from 'framer-motion'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    formData.append('name', name)

    try {
      const res = await register(formData)
      if (res.error) {
        setError(res.error)
      } else {
        await signIn('credentials', {
           email,
           password,
           callbackUrl: '/dashboard'
        })
      }
    } catch (err) {
      setError('Registration failed. Internal Core Error.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-32 relative bg-slate-950 overflow-hidden">
      {/* Visual Background Decor */}
      <div className="absolute top-1/4 -right-40 w-[700px] h-[700px] bg-brand-600/10 blur-[200px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 -left-40 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card w-full max-w-2xl p-16 flex flex-col items-center border-slate-800 bg-slate-900/60 shadow-2xl relative z-10"
      >
        <Link href="/" className="self-start flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-all mb-16 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
          Cancel Protocol
        </Link>
        
        <div className="relative mb-12 group">
           <div className="absolute inset-0 bg-brand-600 blur-2xl opacity-20 scale-150 group-hover:opacity-50 transition-opacity"></div>
           <div className="p-6 bg-brand-600 rounded-3xl shadow-xl shadow-brand-500/40 relative z-10 group-hover:scale-110 group-active:scale-95 transition-all">
             <UserPlus size={40} className="text-white fill-white" />
           </div>
        </div>

        <div className="flex flex-col items-center mb-16">
           <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-center">Identity Unit</h1>
           <span className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-500 mt-2">Create Secure Access Hub Identifier</span>
        </div>

        {/* Credentials Form */}
        <form className="w-full flex flex-col gap-10" onSubmit={handleSignUp}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">FullName Identity</label>
              <div className="relative group/input">
                <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-brand-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Master Developer" 
                  className="w-full pl-16 py-5 rounded-3xl bg-slate-950 border border-slate-800/30 focus:border-brand-500/50 shadow-inner shadow-slate-900 focus:bg-slate-900/40 transition-all text-sm placeholder:text-slate-800"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Communication Terminal</label>
              <div className="relative group/input">
                <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-brand-400 transition-colors" />
                <input 
                  type="email" 
                  placeholder="name@audit.hub" 
                  className="w-full pl-16 py-5 rounded-3xl bg-slate-950 border border-slate-800/30 focus:border-brand-500/50 shadow-inner shadow-slate-900 focus:bg-slate-900/40 transition-all text-sm placeholder:text-slate-800"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Access Seq</label>
            <div className="relative group/input">
              <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-brand-400 transition-colors" />
              <input 
                type="password" 
                placeholder="••••••••••••" 
                className="w-full pl-16 py-5 rounded-3xl bg-slate-950 border border-slate-800/30 focus:border-brand-500/50 shadow-inner shadow-slate-900 focus:bg-slate-900/40 transition-all text-sm placeholder:text-slate-800"
                required
                min={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
             <motion.div 
               initial={{ opacity: 0, x: -10 }} 
               animate={{ opacity: 1, x: 0 }} 
               className="p-5 bg-rose-500/10 border border-rose-500/30 flex items-center gap-4 rounded-3xl"
             >
                <div className="p-2 bg-rose-500 rounded-xl"><Lock size={16} className="text-white" /></div>
                <div className="flex flex-col">
                   <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Critical Error</span>
                   <span className="text-xs font-bold text-rose-200">{error}</span>
                </div>
             </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] overflow-hidden group shadow-indigo-500/20 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4 mt-4"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-3 border-white/40 border-t-white rounded-full animate-spin"></div>
                Creating...
              </>
            ) : (
              <>
                Register Session Point 
                <Sparkles size={20} className="fill-white group-hover:scale-125 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="w-full h-[1px] bg-slate-800 relative my-16">
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950 px-6 text-[10px] uppercase tracking-[0.4em] font-black text-slate-600">Unified Sync</span>
        </div>

        <button 
          onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
          className="btn-secondary w-full py-5 rounded-3xl flex items-center justify-center gap-4 group hover:bg-slate-800 hover:text-white transition-all shadow-lg active:scale-95"
        >
          <Github size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-widest leading-none">Connect with GitHub Profile</span>
        </button>

        <p className="mt-16 text-[10px] font-black tracking-widest uppercase text-slate-600">
          Already Unified? <Link href="/signin" className="text-brand-400 hover:underline hover:text-brand-300 ml-2">Sign In Hub</Link>
        </p>
      </motion.div>
    </div>
  )
}
