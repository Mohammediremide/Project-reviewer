'use client'

import React from 'react'
import { Share2, Printer, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export function ReviewActions({ projectId }: { projectId: string }) {
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href)
    alert('Public Audit Link copied to clipboard!')
  }

  const handleDownload = () => {
    window.print()
  }

  return (
    <div className="flex flex-wrap gap-4 print:hidden">
      <button 
        onClick={handleShare}
        className="btn-secondary py-4 px-8 rounded-2xl flex items-center gap-3 group bg-slate-900/40 border-slate-800 shadow-xl hover:bg-slate-800 hover:text-white active:scale-95 transition-all"
      >
        <div className="p-1 px-0 group-hover:rotate-12 transition-transform"><Share2 size={18} /></div>
        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Share Link</span>
      </button>

      <button 
        onClick={handleDownload}
        className="btn-secondary py-4 px-8 rounded-2xl flex items-center gap-3 group bg-slate-900/40 border-slate-800 shadow-xl hover:bg-slate-800 hover:text-white active:scale-95 transition-all"
      >
        <div className="p-1 px-0 group-hover:-translate-y-1 transition-transform"><Printer size={18} /></div>
        <span className="text-[10px] font-black uppercase tracking-widest leading-none">Download PDF</span>
      </button>

      <Link href="/import" className="btn-primary py-4 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest leading-none shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform">
        <RefreshCw size={18} /> Re-Analyze Unit
      </Link>
    </div>
  )
}
