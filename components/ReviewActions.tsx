'use client'

import React from 'react'
import { Share2, Printer, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export function ReviewActions({ projectId }: { projectId: string }) {
  const [isDownloading, setIsDownloading] = React.useState(false)
  const [toast, setToast] = React.useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const toastTimer = React.useRef<number | null>(null)

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type })
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current)
    }
    toastTimer.current = window.setTimeout(() => {
      setToast(null)
    }, 2600)
  }

  React.useEffect(() => {
    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current)
      }
    }
  }, [])

  const fallbackCopyTextToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Public Audit Link copied to clipboard!', 'success');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        showToast('Public Audit Link copied to clipboard!', 'success');
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        showToast('Please copy the URL manually from your address bar.', 'error');
      }
      document.body.removeChild(textArea);
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Neural Audit Report',
          text: 'Check out the AI-generated architecture audit for this project!',
          url: window.location.href,
        })
      } catch (err) {
        // Desktop browsers often trip the catch block if native share UI isn't fully configured
        await fallbackCopyTextToClipboard();
      }
    } else {
      await fallbackCopyTextToClipboard();
    }
  }

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      
      // Dynamic imports to bypass SSR issues
      const htmlToImageModule = await import('html-to-image');
      const jsPDFModule = (await import('jspdf')) as any;
      const jsPDF = jsPDFModule.jsPDF || (jsPDFModule.default && jsPDFModule.default.jsPDF) || jsPDFModule.default || jsPDFModule;

      const element = document.getElementById('audit-report') || document.body;
      
      // html-to-image natively supports oklch and modern CSS features
      const imgData = await htmlToImageModule.toJpeg(element, { 
        pixelRatio: 2, 
        backgroundColor: '#020617', // slate-950 to ensure dark mode prints perfectly
        style: {
          transform: 'scale(1)' // Ensure transform doesn't cause overflow cutoff
        }
      });
      
      const elementWidth = element.scrollWidth || element.offsetWidth || 800;
      const elementHeight = element.scrollHeight || element.offsetHeight || 1000;
      
      const pdf = new jsPDF({
        orientation: elementWidth > elementHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [elementWidth, elementHeight]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, elementWidth, elementHeight);
      pdf.save(`Neural_Audit_${projectId}.pdf`);
      
    } catch (err: any) {
      console.error("PDF engine crash:", err);
      showToast(`Failed to generate PDF. ${err?.message || err?.toString() || 'Unknown'}`, 'error');
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <>
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

      {toast && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            className={`glass-card px-6 py-4 border ${
              toast.type === 'success'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-300'
            } text-sm font-semibold`}
          >
            {toast.text}
          </div>
        </div>
      )}
    </>
  )
}
