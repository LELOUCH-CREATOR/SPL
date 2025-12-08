'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createClass(formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string
    const gradeId = formData.get('gradeId') as string
    const teacherId = formData.get('teacherId') as string

    // Get User School Scope
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    const { data: userData } = await supabase.from('users').select('school_id').eq('id', user.id).single()

    const { error } = await supabase
        .from('classes')
        .insert({
            name,
            grade_id: gradeId || null,
            homeroom_teacher_id: teacherId || null,
            school_id: userData?.school_id
        })

    if (error) throw new Error('Failed to create class')
    revalidatePath('/dashboard/classes')
}

export async function createSubject(formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string

    const { error } = await supabase
        .from('subjects')
        .insert({ name })

    if (error) throw new Error('Failed to create subject')
    revalidatePath('/dashboard/classes')
}

export async function deleteClass(classId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('classes').delete().eq('id', classId)
    if (error) throw new Error('Failed to delete class')
    revalidatePath('/dashboard/classes')
}
