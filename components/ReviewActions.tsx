'use client'

import React from 'react'
import { Share2, Printer, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export function ReviewActions({ projectId }: { projectId: string }) {
  const [isDownloading, setIsDownloading] = React.useState(false)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Neural Audit Report',
          text: 'Check out the AI-generated architecture audit for this project!',
          url: window.location.href,
        })
      } catch (err) {
        console.log('User canceled share or error:', err)
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Public Audit Link copied to clipboard!')
    }
  }

  const handleDownload = async () => {
    try {
      setIsDownloading(true)
      // Dynamically import to avoid Next.js Server-Side Rendering crashes
      const html2pdf = (await import('html2pdf.js')).default

      const element = document.body
      
      const opt = {
        margin:       0.3,
        filename:     `Neural_Audit_${projectId}.pdf`,
        image:        { type: 'jpeg' as const, quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, letterRendering: true },
        jsPDF:        { unit: 'in', format: 'legal', orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(element).save()
    } catch (err) {
      console.error(err)
      alert("Failed to generate PDF. Please try again.")
    } finally {
      setIsDownloading(false)
    }
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
        disabled={isDownloading}
        className="btn-secondary py-4 px-8 rounded-2xl flex items-center gap-3 group bg-slate-900/40 border-slate-800 shadow-xl hover:bg-slate-800 hover:text-white active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className={`p-1 px-0 ${isDownloading ? 'animate-spin' : 'group-hover:-translate-y-1 transition-transform'}`}>
          {isDownloading ? <RefreshCw size={18} /> : <Printer size={18} />}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest leading-none">
          {isDownloading ? 'Generating...' : 'Download PDF'}
        </span>
      </button>

      <Link href="/import" className="btn-primary py-4 px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest leading-none shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform">
        <RefreshCw size={18} /> Re-Analyze Unit
      </Link>
    </div>
  )
}
