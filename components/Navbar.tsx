'use client'
import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { LayoutDashboard, LogOut, User as UserIcon, Menu, X, Rocket, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { APP_VERSION } from '@/lib/version'

export default function Navbar() {
  const { data: session, status } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 flex justify-center items-center ${scrolled ? 'py-4' : 'py-8'}`}>
      <div className={`w-full max-w-7xl mx-4 transition-all duration-500 ${scrolled ? 'scale-95' : 'scale-100'}`}>
        <div className={`flex items-center justify-between px-6 py-4 rounded-3xl transition-all duration-500 glass-card shadow-indigo-500/10 ${scrolled ? 'bg-slate-900/80' : 'bg-slate-900/40'}`}>
          <Link href="/" className="flex items-center gap-3 group">
            <div className="p-3 bg-brand-600 rounded-2xl shadow-lg shadow-brand-500/40 group-hover:rotate-12 transition-transform">
              <Rocket className="text-white fill-white w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div className="flex flex-col">
               <span className="text-lg md:text-xl font-black font-display tracking-tight leading-none">PROR <span className="text-brand-500">EVIEWER</span></span>
               <span className="text-[10px] font-black text-slate-500 tracking-[0.2em] uppercase">AI Forge {APP_VERSION}</span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-10">
            {status === 'loading' ? (
              <div className="w-16 h-4 bg-slate-800/50 rounded-full animate-pulse"></div>
            ) : session ? (
              <>
                <Link href="/" className="text-xs font-black tracking-widest text-slate-400 hover:text-white transition-all uppercase">Home</Link>
                <div className="h-4 w-[1px] bg-slate-800"></div>
                <Link href="/dashboard" className="text-xs font-black tracking-widest text-slate-400 hover:text-white transition-all uppercase">Dashboard</Link>
                <div className="h-6 w-[1px] bg-slate-800"></div>
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-bold">{session.user?.name || 'User'}</span>
                    <span className="text-[9px] font-black text-brand-500 uppercase tracking-widest">Active</span>
                  </div>
                  <button 
                    onClick={() => signOut()}
                    className="p-3 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 rounded-2xl transition-all"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-10">
                <Link href="/signin" className="text-xs font-black text-slate-400 hover:text-white tracking-[0.2em] uppercase transition-all">Sign In</Link>
                <Link href="/signup" className="btn-primary py-3.5 px-8 text-xs tracking-widest uppercase">Start Free Test</Link>
              </div>
            )}
          </div>

          {/* Mobile Button */}
          <button className="md:hidden p-3 bg-slate-800 rounded-2xl" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 10 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="md:hidden glass-card p-10 flex flex-col gap-6 shadow-2xl"
            >
               {session ? (
                 <>
                   <Link href="/" onClick={() => setIsOpen(false)} className="flex items-center justify-between text-lg font-bold hover:text-brand-400">
                      Home <ChevronRight size={18} />
                   </Link>
                   <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center justify-between text-lg font-bold hover:text-brand-400">
                      Dashboard <ChevronRight size={18} />
                   </Link>
                   <button onClick={() => signOut()} className="flex items-center justify-between text-lg font-bold text-rose-500">
                      Log Out <LogOut size={18} />
                   </button>
                 </>
               ) : (
                 <>
                   <Link href="/signin" onClick={() => setIsOpen(false)} className="text-lg font-bold tracking-tight">Sign In</Link>
                   <Link href="/signup" onClick={() => setIsOpen(false)} className="btn-primary py-5">Register New Account</Link>
                 </>
               )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
