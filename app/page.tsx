'use client'
import { useSession } from 'next-auth/react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Star, ArrowRight, Code, Shield, Zap, Terminal, Sparkles, Binary, ChevronRight, Laptop, Cpu, ShieldCheck, Shirt, Smartphone, Monitor } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState, useRef } from 'react'
import { APP_VERSION } from '@/lib/version'

export default function LandingPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const item = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  }

  const { data: session } = useSession()

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-28 md:pt-40 pb-16 md:pb-24 px-4 sm:px-6 relative bg-grid bg-slate-950 overflow-hidden">
      {/* Dynamic Aesthetic Orbs */}
      <div className="absolute top-20 right-[15%] w-[600px] h-[600px] bg-brand-600/20 blur-[200px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-40 left-[10%] w-[500px] h-[500px] bg-indigo-500/10 blur-[180px] rounded-full"></div>

      {/* Hero Content */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="text-center relative z-10 w-full max-w-7xl"
      >
        <motion.div 
           variants={item}
           className="inline-flex items-center gap-3 px-5 sm:px-6 py-2 mb-10 md:mb-12 rounded-full glass bg-brand-500/10 border-brand-500/30 text-brand-400 text-xs sm:text-sm font-black tracking-[0.2em] uppercase shadow-lg shadow-brand-500/10"
        >
          <Sparkles size={16} className="animate-spin-slow" />
          <span>New AI Generation Core {APP_VERSION}</span>
        </motion.div>

        <motion.h1 
          variants={item}
          className="text-4xl sm:text-5xl md:text-9xl font-black mb-10 md:mb-12 leading-[1.05] tracking-tighter"
        >
          Code Smarter. <br /> 
          <span className="gradient-heading block mt-4">Review Instantly.</span>
        </motion.h1>

        <motion.p 
          variants={item}
          className="text-base sm:text-lg md:text-3xl text-slate-400 mb-12 md:mb-16 max-w-4xl mx-auto font-medium leading-relaxed"
        >
          High-velocity AI reviews for professional engineering teams. <br className="hidden md:block" />
          Sync repositories, get audits, and build 10x faster.
        </motion.p>

        <motion.div 
          variants={item}
          className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-10 mb-24 md:mb-32"
        >
          <Link 
            href={session ? "/dashboard" : "/signin"} 
            className="btn-primary text-xs sm:text-sm font-black tracking-widest uppercase px-10 sm:px-14 py-5 sm:py-6 rounded-3xl group scale-110"
          >
            Launch Project Review
            <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
          </Link>
          <Link href="#how-it-works" className="group flex items-center gap-4 text-xs font-black tracking-[0.2em] uppercase text-slate-500 hover:text-white transition-all">
            See Internal Engine <ChevronRight size={18} className="text-brand-500 group-hover:translate-x-2 transition-transform" />
          </Link>
        </motion.div>

        {/* Choice Section */}
        <motion.div 
           variants={item}
           className="relative max-w-7xl mx-auto mb-20 md:mb-32 overflow-x-auto pb-6 scrollbar-hide"
        >
          <div className="flex flex-nowrap sm:grid sm:grid-cols-4 gap-6 px-4">
             <Link href="/rate?type=outfit" className="choice-card group shrink-0 w-[240px] sm:w-auto">
                <div className="rounded-3xl glass p-8 space-y-6 border-slate-800/40 hover:border-pink-500/50 transition-all duration-500">
                   <div className="p-4 bg-pink-500/10 rounded-2xl w-fit group-hover:rotate-12 transition-transform">
                      <Shirt className="text-pink-400 w-8 h-8" />
                   </div>
                   <div className="text-left">
                      <h4 className="text-xl font-black mb-1">Rate Outfit</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Style Check</p>
                   </div>
                </div>
             </Link>
             <Link href="/rate?type=phone" className="choice-card group shrink-0 w-[240px] sm:w-auto">
                <div className="rounded-3xl glass p-8 space-y-6 border-slate-800/40 hover:border-blue-500/50 transition-all duration-500">
                   <div className="p-4 bg-blue-500/10 rounded-2xl w-fit group-hover:rotate-12 transition-transform">
                      <Smartphone className="text-blue-400 w-8 h-8" />
                   </div>
                   <div className="text-left">
                      <h4 className="text-xl font-black mb-1">Rate Phone</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Gadget Logic</p>
                   </div>
                </div>
             </Link>
             <Link href="/rate?type=setup" className="choice-card group shrink-0 w-[240px] sm:w-auto">
                <div className="rounded-3xl glass p-8 space-y-6 border-slate-800/40 hover:border-emerald-500/50 transition-all duration-500">
                   <div className="p-4 bg-emerald-500/10 rounded-2xl w-fit group-hover:rotate-12 transition-transform">
                      <Monitor className="text-emerald-400 w-8 h-8" />
                   </div>
                   <div className="text-left">
                      <h4 className="text-xl font-black mb-1">Rate Setup</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Workspace Vibe</p>
                   </div>
                </div>
             </Link>
             <Link href="/signin" className="choice-card group shrink-0 w-[240px] sm:w-auto">
                <div className="rounded-3xl glass p-8 space-y-6 border-slate-800/40 hover:border-brand-500/50 transition-all duration-500 bg-brand-500/5">
                   <div className="p-4 bg-brand-500/10 rounded-2xl w-fit group-hover:rotate-12 transition-transform">
                      <Code className="text-brand-400 w-8 h-8" />
                   </div>
                   <div className="text-left">
                      <h4 className="text-xl font-black mb-1">Rate Code</h4>
                      <p className="text-xs text-brand-500 font-bold uppercase tracking-widest">Review Engine</p>
                   </div>
                </div>
             </Link>
          </div>
        </motion.div>

        {/* Impact Stats */}
        <motion.div 
           variants={item}
           className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-5xl mx-auto mb-24 md:mb-40"
        >
           <StatBox value="1.5M+" label="Lines Audited" />
           <StatBox value="10s" label="Response Time" />
           <StatBox value="99.9%" label="AI Precision" />
           <StatBox value="500+" label="Team Active" />
        </motion.div>

        {/* Feature Grid */}
        <div id="how-it-works" className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 text-left">
           <FeatureBox 
             icon={<Binary className="w-8 h-8 text-brand-400" />}
             title="Neural Code Analysis"
             desc="Deeper than Linter. Our engine understands architectural patterns, not just syntax errors."
             gradient="from-brand-600/20 to-indigo-600/5"
           />
           <FeatureBox 
             icon={<Zap className="w-8 h-8 text-amber-400" />}
             title="Blazing Fast Audits"
             desc="Review complex PRs in seconds. Built for continuous integration and high-speed delivery."
             gradient="from-amber-600/20 to-orange-600/5"
           />
           <FeatureBox 
             icon={<ShieldCheck className="w-8 h-8 text-emerald-400" />}
             title="Secure Integration"
             desc="Enterprise-grade encryption for your private source code. We never store your keys long-term."
             gradient="from-emerald-600/20 to-teal-600/5"
           />
        </div>
      </motion.div>

      {/* Quote Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="mt-24 md:mt-40 w-full max-w-5xl relative group"
      >
        <div className="absolute inset-0 bg-brand-600 blur-[100px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
        <div className="glass-card p-10 sm:p-14 md:p-20 text-center relative overflow-hidden">
           <div className="flex justify-center gap-2 mb-8 sm:mb-12">
              {[1,2,3,4,5].map(i => <Star key={i} size={24} className="fill-brand-500 text-brand-500" />)}
           </div>
           <h2 className="text-xl sm:text-2xl md:text-5xl font-black italic tracking-tighter opacity-90 leading-[1.2] md:leading-[1.05] mb-6 sm:mb-10">
             "Our team's review time went from 2 days <br /> to 10 seconds. ProReviewer is literally a magic wand for code quality."
           </h2>
           <div className="flex flex-col items-center">
              <span className="text-[12px] font-black tracking-[0.4em] uppercase text-brand-500">Alex Rivera</span>
              <span className="text-[10px] uppercase tracking-widest opacity-30 mt-1">Lead Architect - FutureDev Labs</span>
           </div>
        </div>
      </motion.div>
    </div>
  )
}

function StatBox({ value, label }: { value: string, label: string }) {
  return (
    <div className="glass-card p-8 flex flex-col items-center justify-center gap-2 border-slate-800/40 bg-slate-900/30">
       <span className="text-2xl sm:text-3xl font-black font-display tracking-tighter self-start">{value}</span>
       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 self-start">{label}</span>
    </div>
  )
}

function FeatureBox({ icon, title, desc, gradient }: { icon: React.ReactNode, title: string, desc: string, gradient: string }) {
  return (
    <div className={`glass-card p-8 sm:p-10 md:p-12 space-y-8 relative overflow-hidden group bg-gradient-to-br ${gradient}`}>
       <div className="p-4 bg-slate-800 rounded-2xl w-fit shadow-xl group-hover:rotate-6 group-hover:bg-slate-7050 transition-all">{icon}</div>
       <div className="space-y-4">
          <h3 className="text-xl sm:text-2xl font-black tracking-tight group-hover:text-brand-400 transition-colors">{title}</h3>
          <p className="text-base text-slate-400 font-medium leading-relaxed group-hover:text-slate-200 transition-colors">{desc}</p>
       </div>
       <div className="pt-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-400 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
          Learn More <ChevronRight size={14} />
       </div>
    </div>
  )
}
