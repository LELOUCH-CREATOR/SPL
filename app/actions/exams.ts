'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createExam(formData: FormData) {
    const supabase = await createClient()

    const subjectId = formData.get('subjectId') as string
    const classId = formData.get('classId') as string
    const date = formData.get('date') as string
    const duration = formData.get('duration') as string // in minutes

    // Fetch current user as creator
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { error } = await supabase
        .from('exams')
        .insert({
            subject_id: subjectId,
            class_id: classId,
            created_by: user.id,
            available_from: new Date(date), // simplistic approximation
            duration: parseInt(duration) || 60,
            config: {}
        })

    if (error) {
        console.error('Error creating exam:', error)
        throw new Error('Failed to create exam')
    }
    revalidatePath('/dashboard/exams')
}

export async function deleteExam(examId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('exams').delete().eq('id', examId)
    if (error) throw new Error('Failed to delete exam')
    revalidatePath('/dashboard/exams')
}
