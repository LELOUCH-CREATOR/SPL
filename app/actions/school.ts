'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateSchool(formData: FormData) {
    const supabase = await createClient()

    // Get Current User context
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data: userData } = await supabase.from('users').select('school_id, role').eq('id', user.id).single()

    if (!userData?.school_id) throw new Error('No School Assigned')

    // Simple Authorization Check
    // In real app, only ADMIN/PRINCIPAL
    if (userData.role !== 'SUPERADMIN' && userData.role !== 'PRINCIPAL' && userData.role !== 'TEACHER') {
        throw new Error('Not authorized to edit school settings')
    }

    const name = formData.get('name') as string
    const schoolCode = formData.get('schoolCode') as string
    // const domain = formData.get('domain') as string

    const { error } = await supabase
        .from('schools')
        .update({
            name,
            school_code: schoolCode,
        })
        .eq('id', userData.school_id)

    if (error) throw new Error('Failed to update school')

    revalidatePath('/dashboard/settings')
}
