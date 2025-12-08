import { createClient } from '@/lib/supabase-server'
import CalendarView from './CalendarView'
import CreateEventModal from './CreateEventModal'

export default async function SchedulePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check role for button visibility
    const { data: profile } = await supabase.from('users').select('role').eq('id', user?.id).single()
    const canCreate = profile?.role === 'TEACHER' || profile?.role === 'SUPERADMIN' || profile?.role === 'PRINCIPAL' || profile?.role === 'PARENT'

    // Fetch Exams
    const { data: exams } = await supabase.from('exams').select('*, subject:subjects(name), class:classes(name)').order('available_from', { ascending: true })

    // Fetch Events
    const { data: dbEvents } = await supabase.from('events').select('*').order('event_date')

    // Transform... [unchanged]
    const events = [
        ...(exams || []).map(exam => ({
            id: exam.id,
            title: `${(exam.subject as any)?.name || 'Exam'} - ${(exam.class as any)?.name || 'Class'}`,
            date: new Date(exam.available_from),
            type: 'exam' as const,
            details: 'Exam scheduled',
            location: (exam.class as any)?.name || 'Exam Hall'
        })),
        ...(dbEvents || []).map(evt => ({
            id: evt.id,
            title: evt.title,
            date: new Date(evt.event_date),
            type: 'event' as const,
            details: evt.description,
            location: 'School'
        }))
    ]

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-heading">Schedule</h1>
                    <p className="text-slate-500 mt-1">Interactive academic calendar and timeline</p>
                </div>
                {canCreate && <CreateEventModal />}
            </div>

            <CalendarView events={events} />
        </div>
    )
}
