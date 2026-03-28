'use client'

import React from 'react'
import { Share2, Printer, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export function ReviewActions({ projectId }: { projectId: string }) {
  const [isDownloading, setIsDownloading] = React.useState(false)

  const fallbackCopyTextToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('Public Audit Link copied to clipboard!');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Public Audit Link copied to clipboard!');
      } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        alert('Please copy the URL manually from your address bar.');
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
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default || html2canvasModule as any;
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.jsPDF || (jsPDFModule.default && jsPDFModule.default.jsPDF) || jsPDFModule as any;

      const element = document.getElementById('audit-report') || document.body;
      
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true, 
        logging: false,
        backgroundColor: '#020617' // slate-950 to ensure dark mode prints perfectly
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Neural_Audit_${projectId}.pdf`);
      
    } catch (err: any) {
      console.error("PDF engine crash:", err);
      alert(`Failed to generate PDF. Error: ${err?.message || err?.toString() || 'Unknown'}`);
    } finally {
      setIsDownloading(false);
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
