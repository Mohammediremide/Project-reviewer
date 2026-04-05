'use client'
import { ArrowLeft, ShieldCheck, Zap, Mail, Binary, Rocket, Sparkles, Key, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'

import { requestPasswordReset } from '@/lib/actions'

export default function ResetPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await requestPasswordReset(email)
      if (result && 'success' in result && result.success) {
        setSuccess(true)
      } else if (result && 'error' in result) {
        setError(result.error || "Recall pulse transmission failed")
      }
    } catch (err) {
      console.error(err)
      setError("System critical error during link generation")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 sm:px-6 py-20 md:py-32 relative bg-slate-950 overflow-hidden">
      {/* Visual Background Decor */}
      <div className="absolute top-1/4 -left-40 w-[600px] h-[600px] bg-brand-600/10 blur-[150px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 -right-40 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass-card w-full max-w-xl p-8 sm:p-12 md:p-16 flex flex-col items-center border-slate-800 bg-slate-900/60 shadow-2xl relative z-10 overflow-hidden"
      >
        {/* Animated Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-500 to-transparent opacity-50"></div>

        <Link href="/signin" className="self-start flex items-center gap-3 text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] opacity-40 hover:opacity-100 transition-all mb-10 sm:mb-16 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
          Abort Recovery
        </Link>

        {success ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-10 py-10"
          >
            <div className="w-24 h-24 bg-emerald-500 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-bounce-slow">
              <ShieldCheck size={48} className="text-white" />
            </div>
            
            <div className="space-y-4">
              <h2 className="text-3xl font-black tracking-tight text-white">Neural Link Established</h2>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs font-medium">A recalibration pattern has been beamed to your identity hub. Please verify the pulse in your inbox.</p>
            </div>

            <Link href="/signin" className="btn-primary px-12 py-5 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 hover:scale-105 active:scale-95 transition-all">
              Return to Access Point
            </Link>
          </motion.div>
        ) : (
          <>
            <div className="relative mb-10 sm:mb-12 group">
              <div className="absolute inset-0 bg-brand-600 blur-2xl opacity-20 scale-150 group-hover:opacity-40 transition-opacity"></div>
              <div className="p-4 sm:p-5 bg-brand-600 rounded-3xl shadow-xl shadow-brand-500/40 relative z-10 transform scale-110">
                <Key size={40} className="text-white animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col items-center mb-10 sm:mb-16">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight text-center">Reset Pattern</h1>
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-slate-500 mt-2">Identity Recovery Terminal</span>
            </div>

            <form onSubmit={handleReset} className="w-full space-y-12">
               <div className="flex flex-col gap-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Target Identity (Email)</label>
                <div className="relative group/input">
                  <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within/input:text-brand-400 transition-colors" />
                  <input 
                    type="email" 
                    placeholder="identity@neural.audit" 
                    className="w-full pl-14 sm:pl-16 py-4 sm:py-5 rounded-3xl bg-slate-950 border border-slate-800/30 focus:border-brand-500/50 shadow-inner shadow-slate-900 focus:bg-slate-900/40 transition-all text-base placeholder:text-slate-800"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest pl-2"
                  >
                    <AlertTriangle size={14} />
                    {error}
                  </motion.div>
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
                    <span>Probing Hub...</span>
                  </div>
                ) : (
                  <>
                    <span className="relative z-10">Request Neural Link</span>
                    <Zap size={20} className="fill-white group-hover:translate-x-2 transition-transform relative z-10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                  </>
                )}
              </button>
            </form>

            <div className="mt-16 text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
               <Binary size={16} />
               Secure Pattern Recalibration Core 1.0
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
