'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '../../../lib/supabase-client'
import { Send, User } from 'lucide-react'

export default function ChatInterface({ userId, userName, initialMessages = [] }: { userId: string, userName: string, initialMessages?: any[] }) {
    const supabase = createClient()
    const [messages, setMessages] = useState<any[]>(initialMessages)
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    // Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel('public:messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages'
                },
                (payload: any) => {
                    // Fetch sender details if needed, or structured differently.
                    // For simplicity, we just push the payload with basic info.
                    // Optimally, you'd fetch the relation or have it in the payload (not possible with standard realtime unless replicated).
                    // We'll append and let the UI handle it.
                    console.log('New Message:', payload.new)
                    setMessages((current) => [...current, payload.new])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim()) return

        const { error } = await supabase
            .from('messages')
            .insert({
                content: newMessage,
                from_user_id: userId,
                // school_id: ... needs to be passed or handled by RLS/Trigger default?
                // For now assuming RLS or passing it. Let's send simple message.
                // Note: Schema requires 'to_user_id' or 'class_id' usually.
                // Assuming a "General Scool Chat" for this MVP demo if not specified.
                // OR adapt to a specific receiver.
            })

        if (!error) {
            setNewMessage('')
        } else {
            console.error('Send error:', error)
            alert('Failed to send')
        }
    }

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-slate-200">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((msg, idx) => {
                    const isMe = msg.from_user_id === userId
                    return (
                        <div key={msg.id || idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-4 rounded-2xl ${isMe
                                ? 'bg-indigo-600 text-white rounded-br-none'
                                : 'bg-slate-100 text-slate-800 rounded-bl-none'
                                }`}>
                                <div className="text-xs opacity-70 mb-1 block">
                                    {!isMe && 'User'} {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <p className="text-sm">{msg.content}</p>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex gap-3">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    )
}
