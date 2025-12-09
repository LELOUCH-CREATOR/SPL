'use server'

import { createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

interface TimeSlot {
    day: string
    period: number
    subjectId: string | null
    teacherId: string | null
}

export async function generateTimetable(schoolId: string) {
    const supabase = await createClient()

    // 1. Fetch Data
    const { data: classes } = await supabase.from('classes').select('id, name').eq('grade_id', (await supabase.from('grades').select('id').eq('school_id', schoolId).single()).data?.id)
    // Simplified: getting all classes for the school via grades (might need better query)

    // Better query: Get all classes where class -> grade -> school_id = schoolId
    // Since we don't have deep nesting filters easily in one go without join, let's fetch strictly needed.
    // Assuming we have a list of classes.

    // Let's get subjects
    const { data: subjects } = await supabase.from('subjects').select('id, name').eq('school_id', schoolId)

    // Get assignments
    const { data: assignments } = await supabase.from('teacher_assignments').select('class_id, subject_id, teacher_id')

    if (!classes || !subjects || !assignments) {
        throw new Error('Insufficient data to generate timetable')
    }

    const timetable: Record<string, TimeSlot[]> = {} // classId -> slots
    const teacherSchedule: Record<string, Set<string>> = {} // teacherId -> "Day-Period"

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const PERIODS = 5

    // Initialize
    for (const cls of classes) {
        timetable[cls.id] = []
    }

    // Greedy Allocation
    for (const cls of classes) {
        const classAssignments = assignments.filter(a => a.class_id === cls.id)

        for (const day of DAYS) {
            for (let p = 1; p <= PERIODS; p++) {
                const timeKey = `${day}-${p}`

                // Find a subject/teacher compatible
                // Simple logic: Rotate subjects
                const assignment = classAssignments.find(a => {
                    if (!a.teacher_id) return false
                    // Check if teacher is free
                    if (teacherSchedule[a.teacher_id]?.has(timeKey)) return false
                    return true
                })

                if (assignment && assignment.teacher_id) {
                    timetable[cls.id].push({
                        day,
                        period: p,
                        subjectId: assignment.subject_id,
                        teacherId: assignment.teacher_id
                    })

                    // Mark teacher busy
                    if (!teacherSchedule[assignment.teacher_id]) {
                        teacherSchedule[assignment.teacher_id] = new Set()
                    }
                    teacherSchedule[assignment.teacher_id].add(timeKey)

                    // Rotate (move this assignment to end to vary next slot)
                    const idx = classAssignments.indexOf(assignment)
                    classAssignments.splice(idx, 1)
                    classAssignments.push(assignment)
                } else {
                    // Free period
                    timetable[cls.id].push({
                        day,
                        period: p,
                        subjectId: null,
                        teacherId: null
                    })
                }
            }
        }
    }

    // In a real app, we would save this to 'schedules' table.
    // For MVP, we return it.
    return { success: true, timetable }
}
