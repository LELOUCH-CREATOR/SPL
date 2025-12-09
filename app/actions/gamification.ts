'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function awardBadge(userId: string, badgeName: string, schoolId: string) {
    const supabase = await createClient()

    // 1. Find or Create Badge Definition
    // For MVP, we auto-create badge definitions if they don't exist per school
    let { data: badge } = await supabase
        .from('badges')
        .select('id')
        .eq('school_id', schoolId)
        .eq('name', badgeName)
        .single()

    if (!badge) {
        const { data: newBadge, error } = await supabase
            .from('badges')
            .insert({
                school_id: schoolId,
                name: badgeName,
                icon: 'trophy', // Default
                description: 'Awarded for excellence'
            })
            .select()
            .single()

        if (error) throw new Error('Failed to create badge definition')
        badge = newBadge
    }

    if (!badge) throw new Error('Badge not found or could not be created')

    // 2. Award to User
    const { error: awardError } = await supabase
        .from('user_badges')
        .insert({
            user_id: userId,
            badge_id: badge.id
        })

    if (awardError) {
        // Ignore duplicate key error (already awarded)
        if (awardError.code !== '23505') {
            throw new Error('Failed to award badge')
        }
    }

    revalidatePath(`/dashboard/students/${userId}`)
    return { success: true }
}

export async function getBadges(userId: string) {
    const supabase = await createClient()
    const { data } = await supabase
        .from('user_badges')
        .select('*, badge:badges(*)')
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false })

    return data || []
}
