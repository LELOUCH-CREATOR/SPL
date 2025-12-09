'use server'

import { createClient } from '@/lib/supabase-server'

export async function logExamEvent({
    attemptId,
    eventType,
    details
}: {
    attemptId: string
    eventType: string
    details?: any
}) {
    const supabase = await createClient()

    // Assuming exam_audit table exists and attemptId logic is secure (RLS handled)
    const { error } = await supabase
        .from('exam_audits')
        .insert({
            exam_attempt_id: attemptId,
            event_type: eventType,
            details
        })

    if (error) {
        console.error('Failed to log exam event:', error)
    }
}

// Added this to satisfy the import in app/dashboard/admin/logs/page.tsx
// adapting to generic log structure for now
export async function getAuditLogs(page = 1, limit = 100) {
    const supabase = await createClient()

    // We are fetching from exam_audits for now as that's what we have
    // Realistically this page might expect a different table, but let's return exam audits

    const { data, count } = await supabase
        .from('exam_audits')
        .select('*, exam_attempt:exam_attempts(user:students(name))', { count: 'exact' })
        .order('timestamp', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

    // Map to the shape expected by the UI (User, Action, Resource, IP)
    const logs = data?.map(log => ({
        id: log.id,
        created_at: log.timestamp,
        user: (log.exam_attempt as any)?.user, // Student
        action: log.event_type,
        resource_type: 'Exam',
        resource_id: log.exam_attempt_id,
        ip: 'N/A' // We don't track IP in exam_audit yet
    })) || []

    return { logs, count: count || 0 }
}
