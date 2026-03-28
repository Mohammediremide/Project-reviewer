'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { reviewProject } from '@/lib/actions'
import { Github, Globe, Loader2, Sparkles, MoveLeft, Terminal, Shield, CheckCircle, Zap, Cpu, AlertTriangle, ChevronRight, BinaryIcon } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function ImportPage() {
  const router = useRouter()
  const [repoUrl, setRepoUrl] = useState('')
  const [projectUrl, setProjectUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!repoUrl && !projectUrl) {
      setError('System Error: No valid URL input detected.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const project = await reviewProject(projectUrl, repoUrl)
      router.push(`/reviews/${project.id}`)
    } catch (err: any) {
      // Show the real error so we can diagnose what's failing
      const msg = err?.message || String(err) || 'Unknown server error'
      setError(`Server Error: ${msg}`)
      console.error('Full import error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-40 min-h-screen px-6 flex flex-col items-center justify-center relative bg-slate-950 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-600/10 blur-[200px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl relative z-10"
      >
        <Link href="/dashboard" className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all mb-16 group">
           <MoveLeft size={16} className="group-hover:-translate-x-3 transition-transform" />
           Audit Base Hub
        </Link>

        <div className="text-left mb-24 space-y-6">
          <div className="p-4 bg-brand-600 rounded-3xl shadow-2xl shadow-brand-500/30 w-fit mb-8 group hover:-rotate-12 transition-transform">
             <Cpu size={32} className="text-white fill-white" />
          </div>
          <h1 className="text-6xl md:text-8xl font-black font-display tracking-tighter leading-none"><span className="gradient-heading">Engage Audit Engine</span></h1>
          <p className="text-xl text-slate-400 max-w-2xl font-medium leading-relaxed">Provide the project coordinates. Our neural engine will perform architecture ingestion, security scoring, and performance auditing in real-time.</p>
        </div>

        <form onSubmit={handleReview} className="grid grid-cols-1 gap-12 items-start">
           <div className="glass-card p-16 space-y-16 border-slate-800/40 bg-slate-950/40 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-brand-500 blur-[100px] opacity-0 group-hover:opacity-5 transition-opacity"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                <div className="space-y-8 flex flex-col justify-center">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-brand-600/10 border border-brand-500/30 text-brand-400 rounded-2xl group-hover:rotate-6 transition-transform">
                        <Github size={24} />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 leading-none mb-1">Source Repository</label>
                        <span className="text-xs font-bold text-slate-300">GitHub, GitLab, or Bitbucket Linked URL</span>
                      </div>
                   </div>
                   <input 
                      type="url" 
                      placeholder="https://github.com/unit/protocol"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      className="w-full py-6 px-8 text-lg rounded-3xl bg-slate-950/80 border border-slate-800 focus:border-brand-500/50 shadow-inner shadow-slate-900 group-hover:bg-slate-900/50 transition-all text-white placeholder:text-slate-800"
                   />
                </div>

                <div className="space-y-8 flex flex-col justify-center">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 rounded-2xl group-hover:rotate-6 transition-transform">
                        <Globe size={24} />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 leading-none mb-1">Production Link</label>
                        <span className="text-xs font-bold text-slate-300">Live URL for UI & Performance Analysis</span>
                      </div>
                   </div>
                   <input 
                      type="url" 
                      placeholder="https://live-protocol.sh"
                      value={projectUrl}
                      onChange={(e) => setProjectUrl(e.target.value)}
                      className="w-full py-6 px-8 text-lg rounded-3xl bg-slate-950/80 border border-slate-800 focus:border-brand-500/50 shadow-inner shadow-slate-900 group-hover:bg-slate-900/50 transition-all text-white placeholder:text-slate-800"
                   />
                </div>
              </div>

              <div className="h-[1px] bg-slate-800/50 relative z-10">
                 <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 px-6 text-[10px] font-black text-slate-700 uppercase tracking-[0.8em]">UNIFIED FLOW</span>
              </div>

              {error && (
                <motion.div 
                   initial={{ opacity: 0, x: -10 }} 
                   animate={{ opacity: 1, x: 0 }} 
                   className="p-8 bg-rose-500/10 border border-rose-500/30 flex items-center gap-6 rounded-[2rem] relative z-10"
                >
                  <div className="p-3 bg-rose-500 rounded-2xl shadow-lg shadow-rose-500/20"><AlertTriangle size={24} className="text-slate-100" /></div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-black uppercase tracking-[0.5em] text-rose-400">Security Breach Detected</span>
                     <span className="text-xs font-bold text-rose-200 mt-1">{error}</span>
                  </div>
                </motion.div>
              )}

              <button 
                type="submit" 
                disabled={loading || (!repoUrl && !projectUrl)}
                className="btn-primary w-full py-8 rounded-full text-[12px] font-black uppercase tracking-[0.5em] disabled:opacity-30 flex items-center justify-center gap-6 group transform relative overflow-hidden"
              >
                <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 transform translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : <Sparkles className="fill-white w-6 h-6 group-hover:scale-125 group-hover:rotate-45 transition-transform" />}
                {loading ? 'Neural Synthesis Initialized...' : 'Activate Analysis Loop'}
              </button>
           </div>
        </form>

        {/* System Pillars */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-12 opacity-30 group-hover:opacity-100 transition-all duration-700 max-w-4xl mx-auto">
           <Pillar icon={<Shield className="text-brand-500" />} text="Security Audit" />
           <Pillar icon={<Terminal className="text-brand-500" />} text="Logic Pattern" />
           <Pillar icon={<CheckCircle size={20} className="text-brand-500" />} text="Rating Lock" />
           <Pillar icon={<BinaryIcon className="text-brand-500" />} text="Full Engine" />
        </div>
      </motion.div>
    </div>
  )
}

function Pillar({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
       <div className="p-4 bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center shadow-lg transition-transform hover:scale-110 hover:shadow-brand-500/10">{icon}</div>
       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">{text}</span>
    </div>
  )
}
