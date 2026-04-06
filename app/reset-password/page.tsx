'use client'
import { ArrowLeft, ShieldCheck, Zap, Lock, Binary, Key, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { resetPassword } from '@/lib/actions'
import { motion } from 'framer-motion'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const router = useRouter()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return setError("Identity recall signal missing from broadcast")
    if (password !== confirmPassword) return setError("Authentication patterns do not match")
    if (password.length < 8) return setError("Neural phrase too short (min 8 characters)")

    setLoading(true)
    setError(null)

    try {
      const result = await resetPassword(token, password)
      if ('success' in result && result.success) {
        setSuccess(true)
        setTimeout(() => router.push('/signin'), 3000)
      } else if ('error' in result) {
        setError(result.error || "An unknown recalibration error occurred")
      }
    } catch (err) {
      console.error(err)
      setError("Critical system failure during pattern update")
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-6">
        <AlertTriangle size={48} className="text-rose-500 mx-auto" />
        <h2 className="text-xl font-black text-rose-500 uppercase tracking-widest">Invalid Signal</h2>
        <p className="text-slate-400 text-sm">The recovery broadcast is corrupted or missing. Please initiate a new recall link.</p>
        <Link href="/reset" className="btn-primary block py-4 rounded-2xl text-[10px] uppercase font-black tracking-widest bg-rose-600">Re-initiate Protocol</Link>
      </div>
    )
  }

  return (
    <div className="w-full">
      {success ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-8 py-10"
        >
          <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/20 mx-auto">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Identity Recalibrated</h2>
          <p className="text-slate-400 text-sm italic">New patterns have been merged with the neural core. Redirecting to access terminal...</p>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">New Security Phrase</label>
            <div className="relative group/input">
              <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-brand-400 transition-colors" />
              <input 
                type="password" 
                placeholder="••••••••••••" 
                className="w-full pl-14 sm:pl-16 py-4 sm:py-5 rounded-3xl bg-slate-950 border border-slate-800/30 focus:border-brand-500/50 shadow-inner shadow-slate-900 focus:bg-slate-900/40 transition-all text-base placeholder:text-slate-800"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Confirm Neural Pattern</label>
            <div className="relative group/input">
              <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-brand-400 transition-colors" />
              <input 
                type="password" 
                placeholder="••••••••••••" 
                className="w-full pl-14 sm:pl-16 py-4 sm:py-5 rounded-3xl bg-slate-950 border border-slate-800/30 focus:border-brand-500/50 shadow-inner shadow-slate-900 focus:bg-slate-900/40 transition-all text-base placeholder:text-slate-800"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest pl-2 font-mono">
                <AlertTriangle size={14} />
                {error}
              </div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-6 rounded-3xl font-black uppercase text-xs tracking-[0.3em] group shadow-brand-500/20 active:scale-95 disabled:opacity-30 flex items-center justify-center gap-4 relative overflow-hidden"
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-3 border-white/40 border-t-white rounded-full animate-spin"></div>
                <span>Recalibrating...</span>
              </div>
            ) : (
              <>
                <span className="relative z-10">Commit New Pattern</span>
                <Zap size={20} className="fill-white group-hover:translate-x-2 transition-transform relative z-10" />
              </>
            )}
          </button>
        </form>
      )}
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 py-20 md:py-32 relative bg-slate-950 overflow-hidden">
      {/* Visual Background Decor */}
      <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-brand-600/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-xl p-8 sm:p-12 md:p-16 flex flex-col items-center border-slate-800 bg-slate-900/60 shadow-2xl relative z-10"
      >
        <div className="relative mb-10 sm:mb-12 group">
          <div className="absolute inset-0 bg-brand-600 blur-2xl opacity-20 scale-150 transition-opacity"></div>
          <div className="p-4 sm:p-5 bg-brand-600 rounded-3xl shadow-xl shadow-brand-500/40 relative z-10">
            <Key size={40} className="text-white" />
          </div>
        </div>

        <div className="flex flex-col items-center mb-10 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-center text-white">Neural Reset</h1>
          <span className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-500 mt-2 italic">Pattern Reconstruction Active</span>
        </div>

        <Suspense fallback={<div className="text-slate-500 font-black animate-pulse uppercase tracking-widest text-[10px]">Scanning Neural Link...</div>}>
          <ResetPasswordForm />
        </Suspense>

        <div className="mt-16 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-4 opacity-30">
          <Binary size={16} />
          High-Level Identity Security Protocols
        </div>
      </motion.div>
    </div>
  )
}
