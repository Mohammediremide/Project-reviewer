'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, LayoutDashboard, Star, Shield, Github, Mail,
  Trash2, ChevronDown, ChevronUp, Search, RefreshCw,
  Crown, UserCheck, UserX, Globe, ArrowLeft,
  TrendingUp, Activity, Database, Zap, Eye, X, Check, BarChart3
} from 'lucide-react'

// ─── Types ─────────────────────────────────────────────────────────────────

interface StatData {
  totalUsers: number
  totalProjects: number
  avgScore: string
  oauthUsers: number
  passwordUsers: number
  githubUsers: number
  googleUsers: number
  topUser: { name: string | null; email: string | null; count: number } | null
}

interface UserRow {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: string
  isTwoFactorEnabled: boolean
  providers: string[]
  projectCount: number
  avgScore: string | null
  latestProject: string | null
}

interface ProjectRow {
  id: string
  name: string
  score: number | null
  repoUrl: string | null
  deployedUrl: string | null
  createdAt: string
  user: { name: string | null; email: string | null; image: string | null }
}

interface AdminData {
  stats: StatData
  users: UserRow[]
  recentProjects: ProjectRow[]
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) return <span className="text-slate-600 text-xs font-bold">—</span>
  const color =
    score >= 4.5 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' :
    score >= 3.5 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
    score >= 2.5 ? 'text-orange-400 bg-orange-500/10 border-orange-500/30' :
                   'text-rose-400 bg-rose-500/10 border-rose-500/30'
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[11px] font-black ${color}`}>
      <Star size={10} className="fill-current" />
      {score.toFixed(1)}
    </span>
  )
}

function Avatar({ user }: { user: { name: string | null; email: string | null; image: string | null } }) {
  if (user.image) {
    return <img src={user.image} alt={user.name || ''} className="w-9 h-9 rounded-full border border-slate-700 object-cover" />
  }
  const initials = (user.name || user.email || '?').slice(0, 2).toUpperCase()
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-[11px] font-black text-white border border-brand-500/30 shrink-0">
      {initials}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'projects' | 'score'>('projects')
  const [sortAsc, setSortAsc] = useState(false)
  const [activeTab, setActiveTab] = useState<'users' | 'projects'>('users')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<UserRow | null>(null)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3000)
  }

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/stats')
      if (res.status === 401 || res.status === 403) {
        setError('FORBIDDEN')
        setLoading(false)
        return
      }
      if (!res.ok) throw new Error('Failed to load admin data')
      const json = await res.json()
      setData(json)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/signin')
    if (status === 'authenticated') fetchData()
  }, [status, fetchData, router])

  const handleDeleteUser = async (user: UserRow) => {
    setDeletingId(user.id)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const json = await res.json()
        showToast(`❌ ${json.error}`)
      } else {
        showToast(`✅ User "${user.name || user.email}" deleted`)
        fetchData()
      }
    } finally {
      setDeletingId(null)
      setConfirmDelete(null)
    }
  }

  const handleRoleToggle = async (user: UserRow) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      if (!res.ok) throw new Error('Failed')
      showToast(`✅ ${user.name || user.email} is now "${newRole}"`)
      fetchData()
    } catch {
      showToast('❌ Could not update role')
    }
  }

  // Filtered + Sorted users
  const filteredUsers = (data?.users ?? [])
    .filter(u =>
      (u.name?.toLowerCase().includes(search.toLowerCase()) || '') ||
      (u.email?.toLowerCase().includes(search.toLowerCase()) || '')
    )
    .sort((a, b) => {
      let va: number | string = 0, vb: number | string = 0
      if (sortBy === 'name') { va = a.name || ''; vb = b.name || '' }
      if (sortBy === 'projects') { va = a.projectCount; vb = b.projectCount }
      if (sortBy === 'score') { va = parseFloat(a.avgScore || '0'); vb = parseFloat(b.avgScore || '0') }
      if (va < vb) return sortAsc ? -1 : 1
      if (va > vb) return sortAsc ? 1 : -1
      return 0
    })

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortAsc(p => !p)
    else { setSortBy(col); setSortAsc(false) }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-3xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center animate-pulse">
            <Shield size={28} className="text-brand-400" />
          </div>
          <p className="text-slate-500 font-black text-xs uppercase tracking-widest animate-pulse">Loading Admin Core…</p>
        </div>
      </div>
    )
  }

  if (error === 'FORBIDDEN') {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="glass-card p-10 text-center max-w-md">
          <h1 className="text-2xl font-black text-rose-500 mb-3">Admins Only</h1>
          <p className="text-slate-400 mb-6 text-sm">
            Your account does not have access to the admin console.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/dashboard" className="btn-primary py-3 px-6">Go to Dashboard</Link>
            <Link href="/signin" className="btn-secondary py-3 px-6">Switch Account</Link>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="glass-card p-12 text-center max-w-md">
          <h1 className="text-2xl font-black text-rose-500 mb-4">Access Denied</h1>
          <p className="text-slate-400 mb-8 text-sm">{error}</p>
          <Link href="/dashboard" className="btn-primary py-4 px-8">← Return to Dashboard</Link>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/70 border border-slate-700 animate-pulse" />
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Preparing admin viewâ€¦</p>
        </div>
      </div>
    )
  }

  const { stats, users, recentProjects } = data

  return (
    <div className="min-h-screen bg-slate-950 text-white bg-dot-accent">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] glass-card px-8 py-4 text-sm font-bold border-brand-500/40 shadow-2xl animate-fade-in">
          {toastMsg}
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card p-10 max-w-md w-full shadow-2xl border-rose-500/20">
            <div className="w-14 h-14 rounded-3xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mb-6">
              <Trash2 size={24} className="text-rose-400" />
            </div>
            <h2 className="text-xl font-black mb-2">Delete User?</h2>
            <p className="text-slate-400 text-sm mb-2">
              You are about to permanently delete:
            </p>
            <div className="glass p-4 rounded-2xl mb-8 flex items-center gap-3">
              <Avatar user={confirmDelete} />
              <div>
                <p className="font-bold text-sm">{confirmDelete.name || 'No Name'}</p>
                <p className="text-slate-400 text-xs">{confirmDelete.email}</p>
              </div>
            </div>
            <p className="text-xs text-rose-400 mb-8 font-bold">⚠️ This will also delete all their projects. This cannot be undone.</p>
            <div className="flex gap-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="btn-secondary flex-1 py-4 rounded-2xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(confirmDelete)}
                disabled={deletingId === confirmDelete.id}
                className="flex-1 py-4 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deletingId === confirmDelete.id ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b border-slate-800/50 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all">
              <ArrowLeft size={18} />
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-brand-600/20 border border-brand-500/30 rounded-2xl">
                <Shield size={20} className="text-brand-400" />
              </div>
              <div>
                <h1 className="font-black text-lg leading-none">Admin Console</h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-0.5">System Control Panel</p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchData}
            className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all p-2.5 bg-slate-800 hover:bg-slate-700 rounded-2xl"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ── Stats Grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <StatCard icon={<Users size={18} />} label="Total Users" value={stats.totalUsers} color="text-brand-400" bg="bg-brand-500/10 border-brand-500/20" />
          <StatCard icon={<Database size={18} />} label="Projects" value={stats.totalProjects} color="text-indigo-400" bg="bg-indigo-500/10 border-indigo-500/20" />
          <StatCard icon={<Star size={18} />} label="Avg Score" value={stats.avgScore} color="text-amber-400" bg="bg-amber-500/10 border-amber-500/20" />
          <StatCard icon={<Globe size={18} />} label="OAuth Users" value={stats.oauthUsers} color="text-sky-400" bg="bg-sky-500/10 border-sky-500/20" />
          <StatCard icon={<Mail size={18} />} label="Password Auth" value={stats.passwordUsers} color="text-rose-400" bg="bg-rose-500/10 border-rose-500/20" />
          <StatCard icon={<Github size={18} />} label="GitHub" value={stats.githubUsers} color="text-slate-300" bg="bg-slate-700/40 border-slate-600/30" />
          <StatCard icon={<Activity size={18} />} label="Google" value={stats.googleUsers} color="text-emerald-400" bg="bg-emerald-500/10 border-emerald-500/20" />
        </div>

        {/* Top Contributor Banner */}
        {stats.topUser && (
          <div className="glass-card p-6 sm:p-8 bg-gradient-to-r from-amber-500/10 to-brand-500/10 border-amber-500/20 flex items-center gap-6 flex-wrap">
            <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/30">
              <Crown size={22} className="text-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Top Contributor</p>
              <p className="font-black text-lg leading-none">{stats.topUser.name || stats.topUser.email}</p>
              <p className="text-slate-400 text-sm mt-1">{stats.topUser.count} projects submitted</p>
            </div>
            <div className="ml-auto flex items-center gap-2 text-amber-400 font-black text-sm">
              <TrendingUp size={16} />
              Most Active
            </div>
          </div>
        )}

        {/* ── Tab Navigation ─────────────────────────────────────── */}
        <div className="flex gap-2 border-b border-slate-800/50 pb-0">
          {(['users', 'projects'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3.5 text-xs font-black uppercase tracking-widest rounded-t-2xl border border-b-0 transition-all ${
                activeTab === tab
                  ? 'bg-slate-800 border-slate-700 text-white'
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab === 'users' ? <><Users size={14} className="inline mr-2" />Users ({stats.totalUsers})</> : <><BarChart3 size={14} className="inline mr-2" />Projects ({stats.totalProjects})</>}
            </button>
          ))}
        </div>

        {/* ── Users Tab ─────────────────────────────────────────── */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Search + sort bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search users by name or email…"
                  className="w-full bg-slate-900/60 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-sm placeholder:text-slate-600 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                Sort:
                {(['name', 'projects', 'score'] as const).map(col => (
                  <button
                    key={col}
                    onClick={() => toggleSort(col)}
                    className={`px-3 py-2 rounded-xl border transition-all flex items-center gap-1 ${
                      sortBy === col
                        ? 'bg-brand-600/20 border-brand-500/30 text-brand-300'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-white'
                    }`}
                  >
                    {col}
                    {sortBy === col && (sortAsc ? <ChevronUp size={10} /> : <ChevronDown size={10} />)}
                  </button>
                ))}
              </div>
            </div>

            {/* Users Table */}
            <div className="glass-card overflow-hidden rounded-3xl border-slate-800/40">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-800/60 bg-slate-900/60">
                      <th className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">User</th>
                      <th className="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hidden sm:table-cell">Auth</th>
                      <th className="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Projects</th>
                      <th className="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hidden md:table-cell">Avg Score</th>
                      <th className="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500 hidden lg:table-cell">Last Active</th>
                      <th className="text-left px-4 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Role</th>
                      <th className="text-right px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-16 text-slate-600 font-bold">
                          No users match your search
                        </td>
                      </tr>
                    )}
                    {filteredUsers.map((user, i) => (
                      <tr
                        key={user.id}
                        className={`border-b border-slate-800/30 hover:bg-slate-800/30 transition-all group ${i % 2 === 0 ? '' : 'bg-slate-900/20'}`}
                      >
                        {/* Avatar + name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar user={user} />
                            <div className="min-w-0">
                              <p className="font-bold text-sm truncate max-w-[140px]">{user.name || <span className="text-slate-500 italic">No Name</span>}</p>
                              <p className="text-slate-500 text-[11px] truncate max-w-[160px]">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Providers */}
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {user.providers.includes('github') && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-700/60 border border-slate-600/40 rounded-lg text-[10px] font-black text-slate-300">
                                <Github size={10} /> GitHub
                              </span>
                            )}
                            {user.providers.includes('google') && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-sky-500/10 border border-sky-500/30 rounded-lg text-[10px] font-black text-sky-300">
                                <Globe size={10} /> Google
                              </span>
                            )}
                            {user.providers.length === 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800/60 border border-slate-700/40 rounded-lg text-[10px] font-black text-slate-500">
                                <Mail size={10} /> Email
                              </span>
                            )}
                            {user.isTwoFactorEnabled && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-[10px] font-black text-emerald-400">
                                <Shield size={10} /> 2FA
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Project count */}
                        <td className="px-4 py-4">
                          <span className="text-sm font-black">{user.projectCount}</span>
                          <span className="text-slate-600 text-xs ml-1">proj</span>
                        </td>

                        {/* Avg Score */}
                        <td className="px-4 py-4 hidden md:table-cell">
                          <ScoreBadge score={user.avgScore ? parseFloat(user.avgScore) : null} />
                        </td>

                        {/* Last active */}
                        <td className="px-4 py-4 hidden lg:table-cell text-slate-500 text-xs font-bold">
                          {user.latestProject
                            ? new Date(user.latestProject).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                            : '—'}
                        </td>

                        {/* Role */}
                        <td className="px-4 py-4">
                          {user.role === 'admin' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-600/20 border border-brand-500/30 rounded-xl text-[10px] font-black text-brand-300 uppercase tracking-wider">
                              <Crown size={10} /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/60 border border-slate-700/40 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-wider">
                              <UserCheck size={10} /> User
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                                title="View detailed profile"
                                onClick={() => setSelectedUserId(user.id)}
                                className="p-2 rounded-xl border bg-slate-800 border-slate-700 hover:text-brand-400 hover:bg-brand-500/10 hover:border-brand-500/30 transition-all"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              title={user.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                              onClick={() => handleRoleToggle(user)}
                              className={`p-2 rounded-xl border transition-all text-xs ${
                                user.role === 'admin'
                                  ? 'bg-slate-800 border-slate-700 hover:text-rose-400 hover:border-rose-500/40'
                                  : 'bg-slate-800 border-slate-700 hover:text-brand-400 hover:border-brand-500/40'
                              }`}
                            >
                              {user.role === 'admin' ? <UserX size={14} /> : <Crown size={14} />}
                            </button>
                            <button
                              title="Delete user"
                              onClick={() => setConfirmDelete(user)}
                              className="p-2 rounded-xl border bg-slate-800 border-slate-700 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Projects Tab ──────────────────────────────────────── */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            {recentProjects.length === 0 ? (
              <div className="glass-card p-16 text-center text-slate-500 font-bold">No projects yet.</div>
            ) : (
              recentProjects.map(project => (
                <div key={project.id} className="glass-card p-6 sm:p-8 border-slate-800/40 hover:bg-slate-800/40 transition-all flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-black text-base leading-none">{project.name}</h3>
                      <ScoreBadge score={project.score} />
                    </div>
                    <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500 flex-wrap">
                      {project.repoUrl && project.repoUrl !== 'N/A' && (
                        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white transition-colors">
                          <Github size={12} /> {project.repoUrl.replace('https://github.com/', '')}
                        </a>
                      )}
                      {project.deployedUrl && (
                        <span className="text-slate-600">·</span>
                      )}
                      <span className="text-slate-600">{new Date(project.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Avatar user={project.user} />
                    <div className="text-right">
                      <p className="text-sm font-bold leading-none">{project.user.name || '—'}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">{project.user.email}</p>
                    </div>
                  </div>

                  {project.repoUrl && project.repoUrl !== 'N/A' && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-2xl transition-all shrink-0"
                    >
                      <Eye size={16} />
                    </a>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* ── User Details Drawer ────────────────────────────────── */}
        <UserDetailsDrawer 
          userId={selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
        />

      </div>
    </div>
  )
}

interface UserDetails {
  user: UserRow & { createdAt: string }
  projects: (ProjectRow & { reviewText: string | null; amends: string | null })[]
}

function UserDetailsDrawer({ 
  userId, 
  onClose,
}: { 
  userId: string | null
  onClose: () => void
}) {
  const [dbData, setDbData] = useState<UserDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetails = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${id}/details`)
      if (!res.ok) throw new Error('Failed to fetch node details')
      const json = await res.json()
      setDbData(json)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (userId) fetchDetails(userId)
    else setDbData(null)
  }, [userId, fetchDetails])

  if (!userId) return null

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-slate-900 shadow-2xl border-l border-slate-800 relative h-full flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-slate-800/50 bg-slate-900/80 sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl transition-all">
                  <X size={20} className="text-slate-400" />
                </button>
                <h2 className="text-lg font-black tracking-tight">User Integrity Profile</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Node: {userId.slice(0,12)}</span>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-12 h-12 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500">Accessing User Record...</p>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <Zap size={48} className="text-rose-500 mx-auto mb-4" />
                  <p className="text-rose-400 font-bold">{error}</p>
                </div>
              ) : dbData ? (
                <div className="space-y-12">
                  <section className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-2xl font-black shadow-xl shadow-brand-500/20 overflow-hidden">
                        {dbData.user.image ? (
                          <img src={dbData.user.image} className="w-full h-full object-cover" />
                        ) : (
                          (dbData.user.name || dbData.user.email || '?')[0].toUpperCase()
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black leading-none mb-2">{dbData.user.name || 'Anonymous User'}</h3>
                        <p className="text-slate-400 font-bold text-sm tracking-tight">{dbData.user.email}</p>
                        <div className="flex items-center gap-2 mt-4">
                          <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                            dbData.user.role === 'admin' ? 'bg-brand-500/10 border-brand-500/30 text-brand-300' : 'bg-slate-800 border-slate-700 text-slate-500'
                          }`}>
                            {dbData.user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-card p-4 border-slate-800/60">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Submissions</p>
                        <p className="text-2xl font-black">{dbData.user.projectCount}</p>
                      </div>
                      <div className="glass-card p-4 border-slate-800/60">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Avg Score</p>
                        <p className="text-2xl font-black">{dbData.user.avgScore || '—'}</p>
                      </div>
                    </div>
                  </section>
                  <section className="space-y-6 pb-20">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Audit Logs</h4>
                    <div className="space-y-6">
                      {dbData.projects.map((proj) => (
                        <div key={proj.id} className="glass-card p-6 border-slate-800/40 space-y-4">
                          <div className="flex items-center justify-between gap-4">
                             <h5 className="font-bold text-base truncate">{proj.name}</h5>
                             <ScoreBadge score={proj.score} />
                          </div>
                          {proj.reviewText && (
                            <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-sm text-slate-300 italic">{proj.reviewText}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
              ) : null}
            </div>
        </div>
      </div>
    </div>
  )
}


// ── StatCard Sub-component ─────────────────────────────────────────────────

function StatCard({
  icon, label, value, color, bg
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  bg: string
}) {
  return (
    <div className={`glass-card p-5 border ${bg} flex flex-col gap-3 hover:scale-[1.03] transition-transform`}>
      <div className={`${color} ${bg} w-10 h-10 rounded-2xl border flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</p>
        <p className="text-2xl font-black leading-none">{value}</p>
      </div>
    </div>
  )
}
