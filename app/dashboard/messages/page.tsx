import { createClient } from '@/lib/supabase-server'
import ChatInterface from './ChatInterface'

export default async function MessagesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return <div>Please log in</div>

    // Fetch initial messages (Limit 50)
    // We fetch messages relevant to the user (sent by them or to them, or broadcast)
    // For specific MVP scope, we can fetch all or specific. 
    // Let's implement a simple "School Global Chat" style for the demo if no filters.
    // OR keep the existing logic but pass it to client.
    // For Realtime demo, a single channel is easiest. Let's assume a "General" room.

    const { data: initialMessages } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: true }) // Oldest first for chat log
        .limit(50)

    const userName = user.user_metadata?.name || 'User'

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500">
            <div className="shrink-0">
                <h1 className="text-3xl font-bold text-slate-900 font-heading">Messages</h1>
                <p className="text-slate-500 mt-1">Real-time collaboration & Announcements</p>
            </div>

            <ChatInterface
                userId={user.id}
                userName={userName}
                initialMessages={initialMessages || []}
            />
        </div>
    )
}
