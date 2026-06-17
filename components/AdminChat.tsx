'use client'
import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Send, User, ChevronRight, Check, ArrowLeft } from 'lucide-react'

export default function AdminChat({ initialUserId, initialUserName, initialUserEmail }: {
  initialUserId?: string | null
  initialUserName?: string | null
  initialUserEmail?: string | null
}) {
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/chat')
    if (res.ok) {
      const data = await res.json()
      setUsers(data)
    }
  }

  const fetchMessages = async (userId: string) => {
    const res = await fetch(`/api/admin/chat?userId=${userId}`)
    if (res.ok) {
      const data = await res.json()
      setMessages(data)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // When an initialUserId is passed (from clicking message icon on a user row),
  // immediately open that user's chat. If they're not in the chat list yet,
  // create a placeholder so the admin can start the conversation.
  useEffect(() => {
    if (!initialUserId) return
    const openUser = async () => {
      // Try to find in already-loaded user list first
      const existing = users.find((u: any) => u.id === initialUserId)
      if (existing) {
        setSelectedUser(existing)
        return
      }
      // Fallback: use the name/email passed as props
      if (initialUserId) {
        setSelectedUser({ id: initialUserId, name: initialUserName || null, email: initialUserEmail || 'User' })
      }
    }
    openUser()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialUserId])

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id)
      const interval = setInterval(() => fetchMessages(selectedUser.id), 5000)
      return () => clearInterval(interval)
    }
  }, [selectedUser])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedUser) return

    const content = newMessage.trim()
    setNewMessage('')
    setLoading(true)

    const tempMsg = { id: Date.now().toString(), content, isAdmin: true, createdAt: new Date().toISOString(), userId: selectedUser.id }
    setMessages(prev => [...prev, tempMsg])

    const res = await fetch('/api/admin/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, userId: selectedUser.id })
    })

    if (res.ok) {
      const savedMsg = await res.json()
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? savedMsg : m))
      fetchUsers() // Refresh user list to update latest message
    }
    setLoading(false)
  }

  return (
    <div className="flex h-[600px] border border-slate-800 rounded-3xl overflow-hidden glass-card">
      {/* Users List */}
      <div className="w-1/3 border-r border-slate-800 bg-slate-900/50 flex flex-col">
        <div className="p-4 border-b border-slate-800 bg-slate-950/50">
          <h3 className="font-black text-brand-500 uppercase tracking-widest text-sm flex items-center gap-2">
            <MessageCircle size={16} /> Active Chats
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {users.length === 0 ? (
            <div className="p-4 text-center text-slate-500 text-xs font-bold">No active chats</div>
          ) : (
            users.map(u => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u)}
                className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between ${
                  selectedUser?.id === u.id ? 'bg-slate-800 border-slate-700' : 'hover:bg-slate-800/50 border-transparent'
                } border`}
              >
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{u.name || u.email}</p>
                  <p className="text-xs text-slate-500 truncate mt-1">
                    {u.messages?.[0]?.content || 'No messages'}
                  </p>
                </div>
                <ChevronRight size={16} className="text-slate-500 shrink-0" />
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-slate-950 flex flex-col">
        {selectedUser ? (
          <>
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                <User size={16} className="text-slate-400" />
              </div>
              <div>
                <p className="font-bold text-sm">{selectedUser.name || selectedUser.email}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">{selectedUser.id}</p>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-2xl px-5 py-3 ${
                    msg.isAdmin 
                      ? 'bg-brand-600 text-white rounded-tr-sm' 
                      : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                    <span className="text-[9px] uppercase tracking-widest opacity-50 block mt-2 flex items-center gap-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.isAdmin && <Check size={10} />}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-slate-800 bg-slate-900/50">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder={`Reply to ${selectedUser.name || selectedUser.email}...`}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-brand-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || loading}
                  className="px-6 bg-brand-600 rounded-2xl flex items-center justify-center hover:bg-brand-500 transition-colors disabled:opacity-50"
                >
                  <Send size={16} className="text-white" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <MessageCircle size={48} className="opacity-20 mb-4" />
            <p className="text-sm font-black uppercase tracking-widest">Select a chat to begin</p>
          </div>
        )}
      </div>
    </div>
  )
}
