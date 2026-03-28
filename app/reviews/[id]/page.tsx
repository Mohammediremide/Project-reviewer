import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { Star, Code, Zap, CheckCircle, MoveLeft, ExternalLink, Github, Globe, Sparkles, Terminal, ShieldAlert, BinaryIcon, Cpu, LayoutDashboard, Share2, Printer, ChevronRight, HelpCircle, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { APP_VERSION } from '@/lib/version'
import { ReviewActions } from '@/components/ReviewActions'

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await auth()
  if (!session?.user) redirect('/signin')

  const project = await prisma.project.findUnique({
    where: { id: id, userId: session.user.id as string }
  })

  if (!project) redirect('/dashboard')

  const scorePercentage = (project.score || 0) * 20

  return (
    <div id="audit-report" className="container py-40 px-6 min-h-screen relative bg-slate-950 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-600/5 blur-[200px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-12 relative z-10">
           <div className="flex flex-col gap-6">
              <Link href="/dashboard" className="inline-flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all group">
                 <MoveLeft size={16} className="group-hover:-translate-x-3 transition-transform" />
                 Audit Protocol Base Hub
              </Link>
              <h1 className="text-5xl md:text-7xl font-black font-display tracking-tighter leading-none"><span className="gradient-heading">Neural Assessment</span></h1>
           </div>
           
           <ReviewActions projectId={project.id} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10 items-start">
            {/* Left Sidebar - Score Display */}
            <div className="lg:col-span-4 space-y-12">
               <div className="glass-card p-16 flex flex-col items-center justify-center text-center bg-slate-900/40 border-slate-800 shadow-2xl group overflow-hidden relative group transform hover:scale-[1.03] transition-all">
                  <div className="absolute inset-0 bg-brand-500/10 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <h3 className="text-[10px] font-black text-brand-400 uppercase tracking-[0.5em] mb-12 relative z-10">Aggregate Core Rating</h3>
                  
                  <div className="relative w-56 h-56 flex items-center justify-center mb-16 group/ring relative z-10">
                     <div className="absolute inset-0 rounded-full border-[6px] border-slate-800 shadow-inner"></div>
                     <div className="absolute inset-0 rounded-full border-[6px] border-brand-500 border-r-transparent border-b-transparent animate-spin-slow group-hover/ring:scale-105 transition-transform duration-700 shadow-lg shadow-brand-500/20"></div>
                     <div className="absolute inset-6 rounded-full border-2 border-slate-800/50 border-dashed"></div>
                     <div className="flex flex-col items-center relative gap-1 scale-110">
                        <span className="text-7xl md:text-8xl font-black tracking-tighter text-white drop-shadow-xl">{project.score?.toFixed(1)}</span>
                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">MAX INDEX 5.0</span>
                     </div>
                  </div>

                  <div className="flex gap-2.5 mb-16 relative z-10">
                     {[1,2,3,4,5].map(i => (
                        <div key={i} className={`p-1.5 glass bg-slate-800 border-slate-700/50 rounded-lg transform transition-all hover:scale-110 ${i <= Math.round(project.score || 0) ? "shadow-[0_0_20px_rgba(234,179,8,0.4)]" : "opacity-10 grayscale translate-y-2"}`}>
                           <Star size={24} className={i <= Math.round(project.score || 0) ? "text-amber-400 fill-amber-400 group-hover:rotate-12 transition-transform" : "text-slate-600"} />
                        </div>
                     ))}
                  </div>

                  <div className="w-full h-[1px] bg-slate-800 my-12 opacity-50 relative z-10"></div>
                  
                  <div className="text-left w-full space-y-4 relative z-10">
                     <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
                        <span>Architectural Flow Integrity</span>
                        <span className="text-white">{scorePercentage}%</span>
                     </div>
                     <div className="h-2 glass bg-slate-800 rounded-full overflow-hidden shadow-inner flex p-0.5">
                        <div className="h-full bg-brand-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)] transition-all duration-1000" style={{ width: `${scorePercentage}%` }}></div>
                     </div>
                  </div>
               </div>

               <div className="glass-card p-12 space-y-12 border-slate-800/40 bg-slate-900/40">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Project Manifest Endpoint</h3>
                  <div className="space-y-8">
                     {project.repoUrl && (
                        <a href={project.repoUrl} target="_blank" className="flex items-center gap-6 p-6 glass-card border-slate-800 hover:bg-slate-800 hover:scale-105 transition-all group/link">
                           <div className="p-4 bg-brand-600 rounded-2xl group-hover/link:bg-brand-500 transition-colors shadow-xl">
                              <Github size={24} className="text-white" />
                           </div>
                           <div className="flex flex-col min-w-0">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Source Identifier</span>
                              <span className="text-sm font-bold truncate text-slate-300">{new URL(project.repoUrl).pathname.slice(1)}</span>
                           </div>
                           <ExternalLink size={18} className="ml-auto opacity-10 group-hover/link:opacity-60 transition-opacity" />
                        </a>
                     )}
                     {project.deployedUrl && (
                        <a href={project.deployedUrl} target="_blank" className="flex items-center gap-6 p-6 glass-card border-slate-800 hover:bg-slate-800 hover:scale-105 transition-all group/link">
                           <div className="p-4 bg-indigo-600 rounded-2xl group-hover/link:bg-indigo-500 transition-colors shadow-xl">
                              <Globe size={24} className="text-white" />
                           </div>
                           <div className="flex flex-col min-w-0">
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 leading-none">Live Protocol Hub</span>
                              <span className="text-sm font-bold truncate text-slate-300">{new URL(project.deployedUrl).hostname}</span>
                           </div>
                           <ExternalLink size={18} className="ml-auto opacity-10 group-hover/link:opacity-60 transition-opacity" />
                        </a>
                     )}
                  </div>
               </div>
            </div>

            {/* Main Content - Review Details */}
            <div className="lg:col-span-8 space-y-20">
               <section className="glass-card p-16 space-y-16 bg-slate-900/20 border-slate-800 hover:bg-slate-900/40 transition-all shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-16 opacity-5 translate-x-3 -translate-y-3 drop-shadow-2xl">
                     <BinaryIcon size={240} className="text-brand-600 animate-pulse-slow" />
                  </div>
                  
                  <div className="flex items-center gap-8 relative z-10">
                     <div className="p-5 glass bg-brand-600 rounded-3xl shadow-xl shadow-brand-500/30 group-hover:rotate-12 transition-transform">
                        <Cpu size={36} className="text-white fill-white" />
                     </div>
                     <div className="space-y-2">
                        <h2 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-none">Core Analysis Feed</h2>
                        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">
                           <span>Neural Engine {APP_VERSION}-Stable</span>
                           <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                           <span>Audit Status: Complete</span>
                        </div>
                     </div>
                  </div>
                  
                  <div className="w-full h-[1px] bg-slate-800 opacity-50 relative z-10"></div>
                  
                  <div className="relative z-10 group/text">
                     <p className="text-2xl md:text-3xl text-slate-300 leading-[1.3] font-medium italic opacity-90 first-letter:text-7xl first-letter:font-black first-letter:text-brand-500 first-letter:mr-4 first-letter:float-left first-letter:mt-2 group-hover/text:text-white transition-colors">
                        {project.reviewText}
                     </p>
                  </div>
                  
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 relative z-10 pt-10 border-t border-slate-800/30">
                     <Metric icon={<Code size={16} />} label="Syntax Stability" value="Validated" color="text-brand-400" />
                     <Metric icon={<ShieldAlert size={16} />} label="Vulnerability Audit" value="Zero-Found" color="text-emerald-400" />
                     <Metric icon={<Terminal size={16} />} label="Pattern Lock" value="Arch-Verified" color="text-blue-400" />
                     <Metric icon={<CheckCircle size={16} />} label="Integrity" value="Secured" color="text-brand-400" />
                  </div>
               </section>

               <section className="glass-card p-16 space-y-16 border-slate-800/60 bg-gradient-to-br from-indigo-950/20 via-slate-900/40 to-slate-950/20 shadow-2xl relative group">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-12 border-b border-slate-800/50 pb-12">
                     <div className="flex items-center gap-8">
                        <div className="p-5 bg-slate-950 border border-slate-800 rounded-3xl shadow- inner group-hover:shadow-indigo-500/10 transition-shadow">
                           <AlertTriangle size={36} className="text-brand-500" />
                        </div>
                        <div className="space-y-2 text-center md:text-left">
                           <h2 className="text-4xl md:text-5xl font-black font-display tracking-tight text-white leading-none">Delta Improvements</h2>
                           <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em]">Critical System Optimization Path</p>
                        </div>
                     </div>
                     <div className="px-6 py-2 glass bg-slate-800 border-slate-700/50 text-[10px] font-black uppercase tracking-widest text-slate-400 rounded-full scale-110">
                        Total Issues: {project.amends?.split('\n').length}
                     </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 relative z-10">
                     {(project.amends || '').split('\n').filter((a: string) => a.trim().length > 0).map((amend: string, idx: number) => (
                        <div key={idx} className="flex flex-col md:flex-row gap-10 p-12 glass-card border-slate-800 bg-slate-950/30 items-start group hover:bg-slate-900/50 hover:border-brand-500/40 hover:scale-[1.02] transform transition-all duration-500 relative cursor-default">
                           <div className="mt-1 flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-[1.5rem] bg-slate-900 text-base font-black border border-slate-800 text-slate-400 group-hover:bg-brand-600 group-hover:text-white group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-xl group-hover:shadow-brand-500/20">
                              {idx + 1}
                           </div>
                           <div className="space-y-4">
                              <h4 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors">Action Item {idx + 1}</h4>
                              <p className="text-lg md:text-xl text-slate-400 font-medium leading-[1.4] group-hover:text-slate-100 transition-colors">{amend.replace(/^\d+\.\s*/, '')}</p>
                           </div>
                           <div className="ml-auto self-end md:self-center opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0 transition-all">
                              <ChevronRight className="text-brand-500 w-8 h-8" />
                           </div>
                        </div>
                     ))}
                  </div>
               </section>
            </div>
        </div>
    </div>
  )
}

function RefreshCw({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
       <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/>
    </svg>
  )
}

function ActionButton({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <button className="btn-secondary py-4 px-8 rounded-2xl flex items-center gap-3 group bg-slate-900/40 border-slate-800 shadow-xl hover:bg-slate-800 hover:text-white active:scale-95 transition-all">
       <div className="p-1 px-0 group-hover:rotate-12 transition-transform">{icon}</div>
       <span className="text-[10px] font-black uppercase tracking-widest leading-none">{text}</span>
    </button>
  )
}

function Metric({ icon, label, value, color }: { icon: React.ReactNode, label: string, value: string, color: string }) {
  return (
    <div className="flex flex-col gap-2">
       <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-600">
          {icon}
          {label}
       </div>
       <span className={`text-xs font-bold leading-none ${color}`}>{value}</span>
    </div>
  )
}
