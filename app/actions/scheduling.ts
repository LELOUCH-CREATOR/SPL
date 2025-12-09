'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/app/actions/notifications'

export async function generateSlots({
    date,
    startTime,
    endTime,
    durationMinutes
}: {
    date: string
    startTime: string // "09:00"
    endTime: string   // "17:00"
    durationMinutes: number
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Parse times
    const start = new Date(`${date}T${startTime}:00`)
    const end = new Date(`${date}T${endTime}:00`)

    // Validate
    if (start >= end) throw new Error('Invalid time range')

    const slots = []
    let current = new Date(start)

    while (current < end) {
        let slotEnd = new Date(current.getTime() + durationMinutes * 60000)

        if (slotEnd > end) break; // Don't overflow

        slots.push({
            teacher_id: user.id,
            start_time: new Date(current).toISOString(),
            end_time: slotEnd.toISOString(),
            status: 'AVAILABLE'
        })

        // Advance
        current = slotEnd
    }

    const { error } = await supabase
        .from('conference_slots')
        .insert(slots)

    if (error) {
        console.error('Failed to generate slots:', error)
        throw new Error('Failed to generate slots')
    }

    revalidatePath('/dashboard/schedule')
}

export async function bookSlot({
    slotId,
    studentId
}: {
    slotId: string
    studentId: string
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 1. Get Slot to check availability
    const { data: slot } = await supabase
        .from('conference_slots')
        .select('*')
        .eq('id', slotId)
        .single()

    if (!slot || slot.status !== 'AVAILABLE') {
        throw new Error('Slot not available')
    }

    // 2. Book it
    const { error } = await supabase
        .from('conference_slots')
        .update({
            status: 'BOOKED',
            parent_id: user.id,
            student_id: studentId
        })
        .eq('id', slotId)
        .eq('status', 'AVAILABLE') // Optimistic locking

    if (error) {
        throw new Error('Failed to book slot')
    }

    // 3. Notify Teacher
    if (slot.teacher_id) {
        await createNotification({
            userId: slot.teacher_id,
            title: 'New Conference Booked',
            message: `A parent has booked a slot on ${new Date(slot.start_time).toLocaleString()}`,
            type: 'SUCCESS',
            link: '/dashboard/schedule'
        })
    }

    revalidatePath('/dashboard/schedule')
}

export async function cancelSlot(slotId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check ownership (either teacher or parent)
    const { data: slot } = await supabase.from('conference_slots').select('*').eq('id', slotId).single()
    if (!slot) throw new Error('Not found')

    if (slot.teacher_id !== user?.id && slot.parent_id !== user?.id) throw new Error('Unauthorized')

    // Cancel
    await supabase
        .from('conference_slots')
        .update({
            status: 'CANCELLED', // Or reset to AVAILABLE? Decision: Cancelled is safer history.
            // Actually, if a parent cancels, maybe it should become AVAILABLE again?
            // Let's stick to CANCELLED for now to preserve record that it WAS booked.
        })
        .eq('id', slotId)

    // Notify other party
    const targetId = (user?.id === slot.teacher_id) ? slot.parent_id : slot.teacher_id
    if (targetId) {
        await createNotification({
            userId: targetId,
            title: 'Conference Cancelled',
            message: `The conference on ${new Date(slot.start_time).toLocaleString()} was cancelled.`,
            type: 'WARNING',
            link: '/dashboard/schedule'
        })
    }

    revalidatePath('/dashboard/schedule')
}

export async function getBeforeTeacherSlots(teacherId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('conference_slots')
        .select('*')
        .eq('teacher_id', teacherId)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })

    return data || []
}
