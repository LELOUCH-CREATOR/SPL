'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function createInvitation(role: string, email?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // Get Admin School
    const { data: admin } = await supabase.from('users').select('school_id, role').eq('id', user.id).single()
    if (!admin?.school_id || (admin.role !== 'SUPERADMIN' && admin.role !== 'PRINCIPAL')) {
        throw new Error('Unauthorized')
    }

    const code = `${role}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    const { error } = await supabase.from('invitations').insert({
        school_id: admin.school_id,
        role,
        email,
        code,
        status: 'PENDING',
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    })

    if (error) throw new Error('Failed to create invitation')
    revalidatePath('/dashboard/settings')
    return { success: true, code }
}

export async function validateInvitation(code: string) {
    const supabase = await createClient()
    const { data, error } = await supabase
        .from('invitations')
        .select('*, school:schools(name)')
        .eq('code', code)
        .eq('status', 'PENDING')
        .single()

    if (error || !data) return { valid: false }
    if (new Date(data.expires_at) < new Date()) return { valid: false, expired: true }

    return { valid: true, data }
}

export async function consumeInvitation(code: string, userId: string) {
    const supabase = await createClient()

    // 1. Verify
    const { data: invite } = await supabase
        .from('invitations')
        .select('*')
        .eq('code', code)
        .eq('status', 'PENDING')
        .single()

    if (!invite) throw new Error('Invalid or used invitation')

    // 2. Update User
    const { error: userError } = await supabase
        .from('users')
        .update({
            school_id: invite.school_id,
            role: invite.role,
            verified: true // Auto-verify invited users
        })
        .eq('id', userId)

    if (userError) throw new Error('Failed to link user')

    // 3. Mark Used
    await supabase
        .from('invitations')
        .update({ status: 'USED' })
        .eq('id', invite.id)

    // 4. Log Audit (Optional logic here or via triggers)
}
