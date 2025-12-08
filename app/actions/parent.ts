'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function linkChild(formData: FormData) {
    const supabase = await createClient()
    const studentCode = formData.get('studentCode') as string

    if (!studentCode) throw new Error('Student Code is required')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Find Student
    const { data: student } = await supabase
        .from('students')
        .select('id')
        .eq('student_code', studentCode)
        .single()

    if (!student) {
        throw new Error('Student not found with that code')
    }

    // Create Link
    const { error } = await supabase
        .from('parent_student_links')
        .insert({
            parent_id: user.id,
            student_id: student.id,
            pairing_method: 'CODE',
            verified_at: new Date().toISOString() // Auto verify for MVP
        })

    if (error) {
        // Check for duplicate
        if (error.code === '23505') return // Already linked, ignore
        console.error('Link Error', error)
        throw new Error('Failed to link student')
    }

    revalidatePath('/dashboard/family')
}
