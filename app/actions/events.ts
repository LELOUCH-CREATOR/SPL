'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createEvent(formData: FormData) {
    const supabase = await createClient()

    // Get User School Scope
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: userData } = await supabase.from('users').select('school_id, role').eq('id', user.id).single()
    if (!userData?.school_id) throw new Error('No School Assigned')

    // Authenticated users can create events (Parents, Teachers, Admins)
    // Students can only view
    if (userData.role === 'STUDENT') {
        throw new Error('Unauthorized to create events')
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const date = formData.get('date') as string

    // Format date properly: '2024-05-20T10:00' -> ISO
    const eventDate = new Date(date).toISOString()

    const { error } = await supabase
        .from('events')
        .insert({
            title,
            description,
            event_date: eventDate,
            school_id: userData.school_id,
            created_by: user.id
        })

    if (error) {
        console.error('Create Event Error:', error)
        throw new Error('Failed to create event')
    }

    revalidatePath('/dashboard/schedule')
}

export async function deleteEvent(eventId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('events').delete().eq('id', eventId)
    if (error) throw new Error('Failed to delete event')
    revalidatePath('/dashboard/schedule')
}
