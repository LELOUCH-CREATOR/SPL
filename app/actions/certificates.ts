'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function issueCertificate(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('Unauthorized')

    // Role check: Only Teachers/Admins
    const { data: userData } = await supabase.from('users').select('role, school_id').eq('id', user.id).single()
    if (!userData || (userData.role === 'STUDENT' || userData.role === 'PARENT')) {
        throw new Error('Unauthorized')
    }

    const studentId = formData.get('studentId') as string
    const type = formData.get('type') as string

    // Mock PDF URL for now
    const pdfUrl = `/certificates/${type.toLowerCase().replace(/\s/g, '-')}-${Date.now()}.pdf`

    const { error } = await supabase
        .from('certificates')
        .insert({
            student_id: studentId,
            issued_by: user.id,
            type,
            pdf_url: pdfUrl
        })

    if (error) throw new Error('Failed to issue certificate')
    revalidatePath('/dashboard/certificates')
}
