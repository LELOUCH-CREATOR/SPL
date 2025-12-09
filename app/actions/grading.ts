'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { awardBadge } from '@/app/actions/gamification'
import { createNotification } from '@/app/actions/notifications'

interface GradeSubmission {
    studentId: string
    score: number | null
}

export async function submitGrades(examId: string, grades: GradeSubmission[]) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    for (const g of grades) {
        if (g.score === null) continue;

        // Check if exists
        const { data: existing } = await supabase
            .from('grades_records')
            .select('id')
            .eq('exam_id', examId)
            .eq('student_id', g.studentId)
            .single()

        if (existing) {
            await supabase
                .from('grades_records')
                .update({ score: g.score, created_by: user.id })
                .eq('id', existing.id)
        } else {
            await supabase
                .from('grades_records')
                .insert({
                    exam_id: examId,
                    student_id: g.studentId,
                    score: g.score,
                    created_by: user.id
                })
        }

        // Award badge if score >= 90
        try {
            if (Number(g.score) >= 90) {
                const { data: examData } = await supabase.from('exams').select('class_id').eq('id', examId).single()
                const { data: classData } = await supabase.from('classes').select('school_id').eq('id', examData?.class_id).single()

                if (classData?.school_id) {
                    await awardBadge(g.studentId, 'High Achiever', classData.school_id)
                }
            }
        } catch (e) {
            console.error('Failed to auto-award badge', e)
        }

        // Notify Student
        await createNotification({
            userId: g.studentId,
            title: 'New Grade Posted',
            message: `You received a score of ${g.score}% on your exam.`,
            type: 'INFO',
            link: `/dashboard/grades`
        })
    }

    revalidatePath(`/dashboard/exams/${examId}`)
    revalidatePath('/dashboard/exams')
    revalidatePath('/dashboard/teacher/exams/[id]')
}
