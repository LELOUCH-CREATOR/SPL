'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function sendMessage(formData: FormData) {
    const supabase = await createClient()
    const content = formData.get('content') as string
    const recipientId = formData.get('recipientId') as string // User ID or Class ID logic ideally
    // For MVP, simplistic "Broadcast to Class" or "Direct to User"
    // Let's assume we implement "Broadcast to Class" for Teachers

    const classId = formData.get('classId') as string

    if (!content) throw new Error('Content is required')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('messages')
        .insert({
            from_user_id: user.id,
            class_id: classId || null,
            // to_user_id: recipientId || null, // Optional for direct
            content,
            // school_id? Should infer
        })

    if (error) {
        console.error('Message Send Error', error)
        throw new Error('Failed to send message')
    }
    revalidatePath('/dashboard/messages')
}
