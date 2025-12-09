'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createLiveSession({
    classId,
    type,
    resourceId,
    config
}: {
    classId: string
    type: 'WHITEBOARD' | 'QUIZ' | 'POLL'
    resourceId?: string
    config?: any
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
        .from('live_sessions')
        .insert({
            class_id: classId,
            teacher_id: user.id,
            type,
            active_resource_id: resourceId,
            config,
            status: 'ACTIVE'
        })
        .select()
        .single()

    if (error) {
        console.error('Failed to create session:', error)
        throw new Error('Failed to create live session')
    }

    revalidatePath(`/dashboard/classes/${classId}`)
    return data
}

export async function endLiveSession(sessionId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('live_sessions')
        .update({
            status: 'ENDED',
            ended_at: new Date().toISOString()
        })
        .eq('id', sessionId)

    if (error) {
        console.error('Failed to end session:', error)
    }

    revalidatePath('/dashboard/classes')
}

export async function submitQuizResult({
    sessionId,
    studentId,
    score,
    answers
}: {
    sessionId: string
    studentId: string
    score: number
    answers: any
}) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('quiz_results')
        .insert({
            session_id: sessionId,
            student_id: studentId,
            score,
            answers
        })

    if (error) {
        console.error('Failed to submit quiz result:', error)
        throw new Error('Failed to submit result')
    }
}
