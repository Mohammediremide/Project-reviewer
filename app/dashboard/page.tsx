import { auth, signIn } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Github, Plus, RefreshCw, Star, ExternalLink, AlertTriangle, CheckCircle2, LayoutDashboard, Rocket, Zap, ArrowRight, User as UserIcon, Binary, ChevronRight, Sparkles, BinaryIcon } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { clearAuditLog } from "@/lib/actions"
import { ConfirmActionForm } from "@/components/ConfirmActionForm"

async function getDashboardData() {
  const session = await auth()
  if (!session || !session.user) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      accounts: true,
      projects: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  return { user, session }
}

export default async function Dashboard() {
  const data = await getDashboardData()
  if (!data) redirect('/')
  
  const { user, session } = data
  const hasGithub = user?.accounts.some(acc => acc.provider === 'github')

  const avgScore = user?.projects?.length 
    ? (user.projects.reduce((acc, p) => acc + (p.score || 0), 0) / user.projects.length).toFixed(1)
    : '0.0'

  return (
    <div className="container py-24 md:py-40 px-4 sm:px-6 min-h-screen relative bg-dot-accent">
      {/* Background Decor */}
      <div className="absolute top-20 right-0 w-[800px] h-[800px] bg-brand-600/5 blur-[150px] rounded-full pointer-events-none"></div>

      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-16 md:mb-24 gap-10 md:gap-12 relative z-10">
        <div className="space-y-6">
          <div className="px-5 py-2 glass-card bg-brand-500/10 border-brand-500/30 text-brand-400 text-[10px] font-black uppercase tracking-[0.2em] w-fit shadow-lg shadow-brand-500/10">
            Audit Command Terminal Active
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black font-display tracking-tight text-white leading-none">
            Welcome back, <br />
            <span className="gradient-heading">{user?.name?.split(' ')[0] || 'Member'}</span>
          </h1>
        </div>
        
        <div className="flex flex-wrap gap-6 w-full xl:w-auto">
          <StatCard label="Total Audits" value={user?.projects?.length || 0} icon={<RefreshCw size={16} className="text-brand-400" />} />
          <StatCard label="Avg Core Rating" value={avgScore} icon={<Star size={16} className="text-amber-400" />} />
          <StatCard label="Active Sync" value={hasGithub ? 'GH' : 'None'} icon={<Github size={16} className="text-slate-400" />} />
          
          <Link href="/import" className="btn-primary px-8 sm:px-12 py-5 sm:py-6 rounded-3xl group scale-105 shadow-2xl">
            <Plus size={24} className="group-hover:rotate-90 transition-transform" />
            <span className="text-xs font-black uppercase tracking-[0.2em] leading-none">Initiate Audit Loop</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        {/* Sidebar Space */}
        <div className="lg:col-span-4 space-y-10">
          {!hasGithub && (
            <div className="glass-card p-8 sm:p-10 md:p-12 bg-gradient-to-br from-indigo-600/20 to-slate-900/50 border-indigo-500/30 group relative overflow-hidden">
               <div className="absolute top-[-40px] right-[-40px] p-8 opacity-5 group-hover:opacity-10 group-hover:scale-110 transition-all duration-700">
                  <Github size={160} />
               </div>
               <div className="space-y-6 relative z-10">
                 <div className="w-14 h-14 bg-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20"><Github size={28} /></div>
                 <h3 className="text-2xl font-black tracking-tight leading-none text-white">Sync GitHub Core</h3>
                 <p className="text-base text-slate-400 font-medium leading-relaxed">
                   Connect your repositories directly to our neural audit engine for deep architectural investigation.
                 </p>
               </div>
               <form 
                 className="relative z-10 pt-8"
                 action={async () => {
                    'use server'
                    await signIn('github')
                 }}
               >
                 <button className="btn-secondary w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-indigo-500/30 text-indigo-100 hover:bg-brand-600 hover:text-white transition-all">
                   Join Identity Loop
                 </button>
               </form>
            </div>
          )}

              <div className="glass-card p-8 sm:p-10 md:p-12 border-slate-800/40 bg-slate-900/40 shadow-xl space-y-12">
             <div className="flex items-center justify-between pb-6 border-b border-slate-800/50">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">System Logs</span>
                <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
             </div>
             <div className="space-y-8">
                <LogEntry icon={<Zap size={16} />} color="text-amber-400" text="Deployment sync successful" time="2m ago" />
                <LogEntry icon={<CheckCircle2 size={16} />} color="text-emerald-400" text="Prisma Engine V7 initialized" time="15m ago" />
                <LogEntry icon={<AlertTriangle size={16} />} color="text-rose-400" text="Identity link missing" time="1h ago" />
             </div>
             <ConfirmActionForm
               action={clearAuditLog}
               message="Clear audit log history?"
               confirmLabel="Yes"
               cancelLabel="No"
             >
                <button type="submit" className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Clear Audit Log HISTORY</button>
             </ConfirmActionForm>
          </div>
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-white flex items-center gap-4 opacity-50">
              <BinaryIcon size={20} className="text-brand-500" />
              Historical Audit Stream
            </h2>
            <div className="text-[10px] uppercase tracking-widest text-slate-600 font-black">Filtered by: ALL CORES</div>
          </div>

          {(user?.projects?.length || 0) === 0 ? (
            <div className="glass-card p-12 sm:p-16 md:p-24 flex flex-col items-center justify-center text-center bg-slate-900/20 border-dashed border-2 border-slate-800 transform hover:scale-[1.01] transition-all">
               <div className="w-24 h-24 rounded-[3rem] bg-slate-800 flex items-center justify-center mb-10 border border-slate-700/50 shadow-inner group">
                 <Rocket size={40} className="text-slate-600 group-hover:text-brand-500 transition-colors" />
               </div>
              <h3 className="text-2xl sm:text-3xl font-black mb-4 tracking-tight">Empty Manifest</h3>
              <p className="text-base sm:text-lg text-slate-500 max-w-sm font-medium leading-relaxed">System awaits first input stream. Initialize a project audit to begin tracking history.</p>
              <Link href="/import" className="btn-secondary px-8 sm:px-10 py-4 rounded-2xl mt-10 sm:mt-12 text-[10px] font-black uppercase tracking-widest border-slate-700">Audit Protocol Alpha</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10">
              {user?.projects?.map(project => (
                <Link 
                  href={`/reviews/${project.id}`} 
                  key={project.id} 
                  className="glass-card p-8 sm:p-10 md:p-12 group hover:bg-slate-800/80 hover:scale-[1.02] transform transition-all duration-500 relative flex flex-col md:flex-row gap-8 md:gap-12 border-slate-800/40"
                >
                  <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-6 -translate-y-6 scale-150 rotate-12 group-hover:rotate-0 group-hover:scale-100 transition-all duration-700 pointer-events-none">
                    <Sparkles size={160} className="text-brand-600" />
                  </div>

                  <div className="flex-grow space-y-8 relative z-10">
                    <div className="flex flex-wrap items-center gap-6">
                      <h3 className="text-2xl sm:text-3xl font-black tracking-tighter group-hover:text-brand-400 transition-colors leading-none">
                         {project.name}
                      </h3>
                      {project.score && project.score >= 4.5 && (
                        <div className="px-5 py-2 glass bg-emerald-500/10 border-emerald-500/30 text-emerald-400 text-[10px] font-black tracking-[0.2em] rounded-2xl uppercase">
                           Supreme Audit Core
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-8 text-[11px] font-black text-slate-600 uppercase tracking-widest">
                       <span className="flex items-center gap-2 group-hover:text-white transition-colors"><Github size={14} className="text-brand-500"/> {project.repoUrl ? new URL(project.repoUrl).pathname.slice(1) : 'Local Hub Sync'}</span>
                       <div className="w-2 h-2 rounded-full bg-slate-800 hidden md:block"></div>
                       <span className="flex items-center gap-2 group-hover:text-white transition-colors"><RefreshCw size={14}/> {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <p className="text-base sm:text-lg text-slate-400 line-clamp-2 max-w-3xl font-medium group-hover:text-slate-200 transition-colors italic leading-relaxed">
                       "{project.reviewText}"
                    </p>
                  </div>

                  <div className="flex flex-col items-center md:items-end justify-center gap-6 min-w-[160px] sm:min-w-[180px] relative z-10 border-t md:border-t-0 md:border-l border-slate-800/50 pt-8 sm:pt-10 md:pt-0 md:pl-10">
                    <div className="flex flex-col items-center p-6 sm:p-8 bg-slate-950 rounded-[3rem] shadow-inner shadow-slate-900 border border-slate-800 group-hover:shadow-brand-500/10 transition-all scale-110">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">Index</span>
                      <div className="flex items-end gap-1">
                        <span className="text-4xl sm:text-5xl font-black text-white">{project.score?.toFixed(1)}</span>
                        <span className="text-xs opacity-20 font-black mb-2">/ 5.0</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-brand-500 uppercase tracking-[0.2em] opacity-30 group-hover:opacity-100 group-hover:translate-x-3 transition-all duration-500">
                       Deep Dive <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon }: { label: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="glass-card px-6 sm:px-10 py-4 sm:py-6 flex flex-col gap-2 min-w-[150px] sm:min-w-[170px] bg-slate-950/40 border-slate-800 shadow-xl scale-100 hover:scale-[1.03] transition-transform shadow-inner shadow-slate-900">
      <div className="flex items-center gap-3 text-[9px] font-black uppercase text-slate-500 tracking-[0.3em]">
        {icon}
        {label}
      </div>
      <div className="text-2xl sm:text-3xl font-black tracking-tighter text-white leading-none">{value}</div>
    </div>
  )
}

function LogEntry({ icon, color, text, time }: { icon: React.ReactNode, color: string, text: string, time: string }) {
  return (
    <div className="flex items-center gap-4 group">
       <div className={`p-2.5 rounded-xl bg-slate-950 border border-slate-800 ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
       <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors capitalize">{text}</span>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{time}</span>
       </div>
    </div>
  )
}
