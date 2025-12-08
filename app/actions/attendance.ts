'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

interface AttendanceSubmission {
    studentId: string
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
}

export async function submitAttendance(classId: string, date: string, submissions: AttendanceSubmission[]) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    // We loop and upsert based on (student_id, class_id, date) constraint.
    // Note: Prisma schema defined @@unique([student_id, date, class_id]).
    // Supabase 'upsert' works if constraint matches.

    for (const s of submissions) {
        // Upsert logic
        // Supabase JS insert upsert option: .upsert({ ... }, { onConflict: 'student_id, date, class_id' })
        // BUT 'date' format must be exact.

        const { error } = await supabase
            .from('attendance_records')
            .upsert({
                student_id: s.studentId,
                class_id: classId,
                date: date,
                status: s.status,
                created_by: user.id
            }, {
                onConflict: 'student_id,date,class_id'
            })

        if (error) {
            console.error('Attendance Upsert Error', error)
            // We continue to try others
        }
    }

    revalidatePath('/dashboard/attendance')
}
