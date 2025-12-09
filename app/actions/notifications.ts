'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createNotification({
    userId,
    title,
    message,
    type = 'INFO',
    link
}: {
    userId: string
    title: string
    message: string
    type?: 'INFO' | 'ALERT' | 'SUCCESS' | 'WARNING'
    link?: string
}) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('notifications')
        .insert({
            user_id: userId,
            title,
            message,
            type,
            link
        })

    if (error) {
        console.error('Error creating notification:', error)
        // Don't throw, notifications are often non-critical
    }
}

export async function getNotifications(userId: string) {
    const supabase = await createClient()

    const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20)

    return data || []
}

export async function markAsRead(notificationId: string) {
    const supabase = await createClient()

    await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

    revalidatePath('/dashboard')
}
