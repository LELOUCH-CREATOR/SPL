'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createStudent(formData: FormData) {
    const supabase = await createClient()
    const name = formData.get('name') as string
    const classId = formData.get('classId') as string
    const studentCode = formData.get('studentCode') as string || undefined

    if (!name) throw new Error('Name is required')

    // Get User School Scope
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')
    const { data: userData } = await supabase.from('users').select('school_id').eq('id', user.id).single()

    // Validate School Scope
    if (!userData?.school_id) throw new Error('No School Assigned to User')

    const { error } = await supabase
        .from('students')
        .insert({
            name,
            class_id: classId || null,
            student_code: studentCode,
            enrollment_status: 'ACTIVE',
            school_id: userData.school_id // Scoped
        })

    if (error) {
        console.error('Error creating student:', error)
        throw new Error('Failed to create student')
    }
    revalidatePath('/dashboard/students')
    revalidatePath('/dashboard/classes') // To update student counts if we tracked them
}

export async function deleteStudent(studentId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('students').delete().eq('id', studentId)
    if (error) throw new Error('Failed to delete student')
    revalidatePath('/dashboard/students')
}
