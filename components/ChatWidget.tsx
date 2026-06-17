'use client'
import { useState, useEffect, useRef } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'

export default function ChatWidget() {
  const { status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchMessages = async () => {
    const res = await fetch('/api/chat')
    if (res.ok) {
      const data = await res.json()
      setMessages(data)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchMessages()
    }
  }, [isOpen])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const content = newMessage.trim()
    setNewMessage('')
    setLoading(true)

    // Optimistic update
    const tempMsg = { id: Date.now().toString(), content, isAdmin: false, createdAt: new Date().toISOString() }
    setMessages(prev => [...prev, tempMsg])

    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    })

    if (res.ok) {
      const savedMsg = await res.json()
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? savedMsg : m))
    }
    setLoading(false)
  }

  if (status !== 'authenticated') return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 left-6 h-14 px-6 bg-brand-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-50 gap-3 ${isOpen ? 'hidden' : 'flex'}`}
      >
        <MessageCircle className="text-white" size={20} />
        <span className="text-white font-black text-xs uppercase tracking-widest">Contact Admin</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 left-6 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
            style={{ height: '500px', maxHeight: '80vh' }}
          >
            {/* Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-black text-brand-500 uppercase tracking-widest text-sm">Support Chat</h3>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-bold">Admin Connection</p>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <MessageCircle size={32} className="opacity-50" />
                  <p className="text-xs uppercase font-black tracking-widest">Start a conversation</p>
                </div>
              ) : (
                messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.isAdmin ? 'bg-slate-800 text-slate-200 rounded-tl-sm' : 'bg-brand-600 text-white rounded-tr-sm'}`}>
                      <p className="text-sm">{msg.content}</p>
                      <span className="text-[9px] uppercase tracking-widest opacity-50 block mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              <form onSubmit={sendMessage} className="flex items-center gap-2 relative">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button 
                  type="submit" 
                  disabled={!newMessage.trim() || loading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-brand-600 rounded-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-500 transition-colors"
                >
                  <Send size={14} className="text-white ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
