'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/app/actions/notifications'

export async function createExam(formData: FormData) {
    const supabase = await createClient()

    const subjectId = formData.get('subjectId') as string
    const classId = formData.get('classId') as string
    const date = formData.get('date') as string
    const duration = formData.get('duration') as string // in minutes

    // Fetch current user as creator
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const { data, error } = await supabase
        .from('exams')
        .insert({
            subject_id: subjectId,
            class_id: classId,
            created_by: user.id,
            available_from: new Date(date), // simplistic approximation
            duration: parseInt(duration) || 60,
            config: {}
        })
        .select('class_id, subject_id')

    if (error) {
        console.error('Error creating exam:', error)
        throw new Error('Failed to create exam')
    }

    // Notify all students in the class
    if (data && data.length > 0) {
        const { class_id: classId, subject_id: subjectId } = data[0];

        if (classId) {
            const { data: students } = await supabase
                .from('students')
                .select('id')
                .eq('class_id', classId)

            if (students) {
                // Ideally use a queue/batch job for large classes, relying on simple loops for MVP
                await Promise.all(students.map(student =>
                    createNotification({
                        userId: student.id,
                        title: 'New Exam Scheduled',
                        message: `An exam for subject ${subjectId} has been scheduled.`,
                        type: 'ALERT',
                        link: `/dashboard/exams`
                    })
                ))
            }
        }
    }

    revalidatePath('/dashboard/exams')
}

export async function deleteExam(examId: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('exams').delete().eq('id', examId)
    if (error) throw new Error('Failed to delete exam')
    revalidatePath('/dashboard/exams')
    revalidatePath('/dashboard/exams')
}

export async function startExam(examId: string, ip: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // 1. Fetch Exam Config
    const { data: exam } = await supabase.from('exams').select('config').eq('id', examId).single()

    if (!exam) throw new Error('Exam not found')

    // 2. IP Check
    const config = exam.config as any
    if (config?.allowed_ips && Array.isArray(config.allowed_ips) && config.allowed_ips.length > 0) {
        if (!config.allowed_ips.includes(ip)) {
            // Log security event
            await supabase.from('exam_audits').insert({
                exam_attempt_id: null, // No attempt created yet
                event_type: 'SECURITY_BLOCK',
                details: { userId: user.id, ip, required: config.allowed_ips }
            })
            throw new Error('Access denied: You are not on a permitted network.')
        }
    }

    // 3. Create Attempt
    const { data: attempt, error } = await supabase
        .from('exam_attempts')
        .insert({
            exam_id: examId,
            student_id: user.id as string,
            started_at: new Date().toISOString(),
            status: 'PENDING'
        })
        .select()
        .single()

    if (error) throw new Error('Failed to start exam')

    revalidatePath(`/dashboard/exams/${examId}`)
    return attempt
}
