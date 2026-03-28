'use client'
import { signIn, useSession } from 'next-auth/react'
import { Github, Mail, Lock, LogIn, ArrowLeft, ShieldCheck, Zap, Sparkles, Binary, ChevronRight, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function SignInPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setMessage({ text: 'Invalid Credentials - Access Denied', type: 'error' })
        setTimeout(() => setMessage(null), 10000)
      } else {
        setMessage({ text: 'Login Successful - Redirecting...', type: 'success' })
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      }
    } catch (err) {
      console.error(err)
      setMessage({ text: 'System Error - Please try again', type: 'error' })
      setTimeout(() => setMessage(null), 10000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 py-32 relative bg-slate-950 overflow-hidden">
      {/* Visual Background Decor */}
      <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-brand-600/10 blur-[150px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="glass-card w-full max-w-xl p-16 flex flex-col items-center border-slate-800 bg-slate-900/60 shadow-2xl relative z-10"
      >
        <Link href="/" className="self-start flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-all mb-16 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
          Abort Base
        </Link>

        {/* Timed Notification */}
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`w-full mb-10 p-6 rounded-2xl border flex items-center gap-4 ${
              message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {message.type === 'success' ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">{message.text}</span>
          </motion.div>
        )}
        
        <div className="relative mb-12 group">
           <div className="absolute inset-0 bg-brand-600 blur-2xl opacity-20 scale-150 group-hover:opacity-50 transition-opacity"></div>
           <div className="p-5 bg-brand-600 rounded-3xl shadow-xl shadow-brand-500/40 transform -rotate-1 group-hover:rotate-6 transition-transform relative z-10">
             <LogIn size={40} className="text-white fill-white" />
           </div>
        </div>

        <div className="flex flex-col items-center mb-16">
           <h1 className="text-4xl md:text-5xl font-black font-display tracking-tight text-center">System Log</h1>
           <span className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-500 mt-2">Initialize Local Session Link</span>
        </div>

        {/* Credentials Form */}
        <form className="w-full flex flex-col gap-10" onSubmit={handleCredentialsSignIn}>
          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Access Identity</label>
            <div className="relative group/input">
              <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-brand-400 transition-colors" />
              <input 
                type="email" 
                placeholder="identity@neural.audit" 
                className="w-full pl-16 py-5 rounded-3xl bg-slate-950 border border-slate-800/30 focus:border-brand-500/50 shadow-inner shadow-slate-900 focus:bg-slate-900/40 transition-all text-base placeholder:text-slate-800"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Security Phrase</label>
            <div className="relative group/input">
              <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-brand-400 transition-colors" />
              <input 
                type="password" 
                placeholder="••••••••••••" 
                className="w-full pl-16 py-5 rounded-3xl bg-slate-950 border border-slate-800/30 focus:border-brand-500/50 shadow-inner shadow-slate-900 focus:bg-slate-900/40 transition-all text-base placeholder:text-slate-800"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] overflow-hidden group shadow-indigo-500/20 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4 mt-4"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-3 border-white/40 border-t-white rounded-full animate-spin"></div>
                Initializing...
              </>
            ) : (
              <>
                Confirm Entry Point 
                <Zap size={20} className="fill-white group-hover:scale-125 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Social Link Divider */}
        <div className="w-full flex items-center gap-6 my-16">
          <div className="h-[1px] bg-slate-800 flex-grow"></div>
          <span className="text-[9px] text-slate-600 uppercase tracking-[0.6em] font-black">OR FAST LOG</span>
          <div className="h-[1px] bg-slate-800 flex-grow"></div>
        </div>

        <button 
          onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
          className="btn-secondary w-full py-5 rounded-3xl flex items-center justify-center gap-5 group border-slate-800/60 bg-slate-800/20 group hover:bg-slate-800 hover:text-white transition-all shadow-lg active:scale-95"
        >
          <Github size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="text-[11px] font-black uppercase tracking-widest">Connect GitHub Profile</span>
        </button>

        <div className="mt-16 text-[10px] font-black tracking-[0.3em] uppercase text-slate-600 flex flex-col md:flex-row gap-4 md:gap-8 justify-center items-center">
          <span>New Identity? <Link href="/signup" className="text-brand-400 hover:underline hover:text-brand-300">Register</Link></span>
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800 hidden md:block"></div>
          <Link href="#" className="hover:text-slate-200">Reset Pattern</Link>
        </div>
      </motion.div>
    </div>
  )
}
