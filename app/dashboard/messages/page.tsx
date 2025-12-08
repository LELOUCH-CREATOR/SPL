import { createClient } from '@/lib/supabase-server'
import { sendMessage } from '@/app/actions/messages'
import { Plus, MessageSquare, Send, User, Users } from 'lucide-react'

export default async function MessagesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch Messages (Received or Class Broadcasts)
    // Logic: 
    // 1. Direct messages where to_user_id = me
    // 2. Class messages where class_id IN (my Classes)
    // For Teacher: Sent messages too.

    // Checking user role to optimize query
    const role = user?.user_metadata?.role || 'STUDENT'

    let query = supabase
        .from('messages')
        .select('*, from:users!from_user_id(name, role), class:classes(name)')
        .order('created_at', { ascending: false })

    if (role === 'TEACHER') {
        // Teachers see messages they sent OR messages to them
        query = query.or(`from_user_id.eq.${user?.id},to_user_id.eq.${user?.id}`)
    } else {
        // Students/Parents see messages to them OR in their class
        // This requires knowing their class_id.
        // For MVP, let's just show "Broadcasts" (where class_id is NOT NULL) + Direct
        query = query.or(`to_user_id.eq.${user?.id},class_id.not.is.null`)
        // Note: Proper RLS is better for this filtering, but UI filtering helps too.
    }

    const { data: messages } = await query

    // Classes for Compose Form
    const { data: classes } = await supabase.from('classes').select('id, name')

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                    <p className="text-sm text-gray-500 mt-1">Communications center</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
                {/* Message List */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700">
                        Recent Conversations
                    </div>
                    <div className="overflow-y-auto flex-1 p-0">
                        {messages?.map((msg) => (
                            <div key={msg.id} className="p-4 border-b border-gray-100 hover:bg-blue-50 transition-colors flex gap-4">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">
                                    {(msg.from as any)?.name?.[0] || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="text-sm font-semibold text-gray-900">
                                            {(msg.from as any)?.name || 'Unknown'}
                                            <span className="text-xs font-normal text-gray-500 ml-2">
                                                {msg.class ? `to ${msg.class.name}` : 'Direct Message'}
                                            </span>
                                        </h4>
                                        <span className="text-xs text-gray-400">
                                            {new Date(msg.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 truncate">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {(!messages || messages.length === 0) && (
                            <div className="p-12 text-center text-gray-500">
                                No messages found.
                            </div>
                        )}
                    </div>
                </div>

                {/* Compose Box */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-auto lg:h-fit">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <Send className="w-5 h-5 mr-2 text-indigo-600" />
                        Compose
                    </h3>

                    <form action={sendMessage} className="space-y-4 flex-1">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">To Class (Broadcast)</label>
                            <select name="classId" className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50">
                                <option value="">Select Target...</option>
                                {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>

                        <div className="flex-1 flex flex-col">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Message</label>
                            <textarea
                                name="content"
                                className="w-full flex-1 min-h-[150px] px-3 py-2 border rounded-lg text-sm bg-gray-50 focus:bg-white transition-colors resize-none"
                                placeholder="Type your announcement here..."
                                required
                            />
                        </div>

                        <button type="submit" className="w-full py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center justify-center">
                            <Send className="w-4 h-4 mr-2" /> Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
