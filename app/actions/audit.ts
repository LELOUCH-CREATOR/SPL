'use server'

import { createClient } from '@/lib/supabase-server'
import { headers } from 'next/headers'

export async function logAction(action: string, resourceType: string, resourceId?: string, details?: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return // Anonymous actions not logged strictly or logged with null

    // Get IP (Approximate)
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || 'unknown'

    await supabase.from('audit_logs').insert({
        user_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId,
        after: details,
        ip
    })
}

export async function getAuditLogs(page = 1, limit = 50) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Auth Check
    const { data: userData } = await supabase.from('users').select('role').eq('id', user?.id).single()
    if (userData?.role !== 'SUPERADMIN' && userData?.role !== 'PRINCIPAL') {
        throw new Error('Unauthorized')
    }

    const { data, count } = await supabase
        .from('audit_logs')
        .select('*, user:users(name, email, role)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    return { logs: data, count }
}
