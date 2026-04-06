'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Camera, Smartphone, Shirt, Monitor, Loader2, Star, Upload, Home, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { rateItem } from '@/lib/actions'
import { useSession } from 'next-auth/react'


export default function RatePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <Loader2 className="animate-spin text-brand-500 w-12 h-12" />
      </div>
    }>
      <RateContent />
    </Suspense>
  )
}

function RateContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { data: session } = useSession()
  const type = searchParams.get('type') || 'outfit'
  
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [base64Image, setBase64Image] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return;

    const reader = new FileReader()
    reader.onloadend = () => {
      // Create an image element to draw and compress
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800; // Resize to max 800px width
        const scaleSize = MAX_WIDTH / img.width;
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Compress as JPEG with 0.7 quality to keep base64 tiny
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setBase64Image(compressedBase64);
      };
      img.src = reader.result as string;
    }
    reader.readAsDataURL(file)
  }

  const handleRate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session) {
      router.push('/signin')
      return
    }
    setLoading(true)
    try {
      const res = await rateItem(type, description, base64Image || imageUrl)
      setResult(res)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const icons: any = {
    outfit: <Shirt className="w-12 h-12 text-pink-400" />,
    phone: <Smartphone className="w-12 h-12 text-blue-400" />,
    setup: <Monitor className="w-12 h-12 text-emerald-400" />,
    tech: <Sparkles className="w-12 h-12 text-brand-400" />
  }

  const titles: any = {
    outfit: "Rate My Outfit",
    phone: "Rate My Phone",
    setup: "Rate My Setup",
    tech: "Rate My Tech Stack"
  }

  if (result) {
     return (
       <div className="flex flex-col items-center justify-center min-h-screen pt-32 pb-16 px-4 bg-slate-950">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl glass-card p-8 md:p-12 text-center space-y-8"
          >
             <div className="flex justify-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={32} className={i < Math.floor(result.score) ? "fill-brand-500 text-brand-500" : "text-slate-700"} />
                ))}
             </div>
             <h1 className="text-6xl font-black gradient-heading">{result.score}/5</h1>
             <p className="text-xl text-slate-300 leading-relaxed italic">"{result.reviewText}"</p>
             <div className="text-left space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-brand-400">Trendsetter Tips</h3>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 text-slate-400 whitespace-pre-wrap">
                   {result.amends}
                </div>
             </div>
             <div className="flex flex-col gap-4">
                <button 
                  onClick={() => setResult(null)} 
                  className="btn-primary w-full py-4 rounded-2xl font-black uppercase tracking-widest"
                >
                  Rate Something Else
                </button>
                <Link 
                  href="/"
                  className="btn-secondary w-full py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Home size={18} />
                  Back to Home
                </Link>
             </div>
          </motion.div>
       </div>
     )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen pt-32 pb-16 px-4 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-600/10 blur-[150px] rounded-full"></div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl relative z-10 space-y-6"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest transition-colors">
           <ArrowLeft size={16} />
           Back to Home
        </Link>

        <div className="glass-card p-8 md:p-10 space-y-8">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800">
                 {icons[type] || icons.outfit}
              </div>
              <div>
                 <h1 className="text-3xl font-black tracking-tight">{titles[type] || "AI Rating"}</h1>
                 <p className="text-slate-400">Groq AI is ready to judge you.</p>
              </div>
           </div>

           <form onSubmit={handleRate} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-xs font-black uppercase tracking-widest text-slate-500">
                    Describe it {base64Image && <span className="text-brand-500 lowercase">(Optional)</span>}
                 </label>
                 <textarea 
                   required={!base64Image}
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   placeholder={type === 'outfit' ? "E.g. Oversized black hoodie, baggy jeans, and retro sneakers..." : "Tell us about it..."}
                   className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl p-4 text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none transition-all h-32"
                 />
              </div>

              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500">Upload Photo</label>
                    <div className="relative group">
                       <input 
                         type="file"
                         accept="image/*"
                         onChange={handleFileChange}
                         className="hidden"
                         id="file-upload"
                       />
                       <label 
                         htmlFor="file-upload"
                         className={`w-full flex flex-col items-center justify-center border-2 border-dashed ${base64Image ? 'border-brand-500 bg-brand-500/5' : 'border-slate-800 bg-slate-900/30'} rounded-2xl p-8 cursor-pointer hover:border-brand-500/50 transition-all`}
                       >
                          {base64Image ? (
                            <img src={base64Image} className="w-24 h-24 object-cover rounded-xl mb-2" />
                          ) : (
                            <Upload className="w-10 h-10 text-slate-600 mb-2 group-hover:text-brand-400" />
                          )}
                          <span className="text-xs font-bold text-slate-500">
                             {base64Image ? 'Change Photo' : 'Click to Upload Image'}
                          </span>
                       </label>
                    </div>
                 </div>

               </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full py-5 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Get Rating"}
                {!loading && <ArrowRight size={20} />}
              </button>
           </form>
        </div>
      </motion.div>
    </div>
  )
}
