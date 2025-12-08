import { createClient } from '@/lib/supabase-server'
import { submitAttendance } from '@/app/actions/attendance'
import { Calendar, Save, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function AttendancePage(props: { searchParams: Promise<{ classId?: string, date?: string }> }) {
    const searchParams = await props.searchParams
    const supabase = await createClient()

    const today = new Date().toISOString().split('T')[0]
    const date = searchParams?.date || today
    const classId = searchParams?.classId

    // Fetch Classes
    const { data: classes } = await supabase.from('classes').select('id, name').order('name')

    // Default to first class if none selected
    if (!classId && classes && classes.length > 0) {
        // In a real app we might redirect, but here let's just use the first id if simpler, 
        // OR just show "Select a Class".
        // Let's safe redirect to clean URL
        redirect(`/dashboard/attendance?classId=${classes[0].id}&date=${date}`)
    }

    let students = []
    let existingRecords: Record<string, string> = {}

    if (classId) {
        // Fetch Students
        const { data: s } = await supabase
            .from('students')
            .select('*')
            .eq('class_id', classId)
            .order('name')
        students = s || []

        // Fetch Existing Attendance
        const { data: r } = await supabase
            .from('attendance_records')
            .select('student_id, status')
            .eq('class_id', classId)
            .eq('date', date)

        r?.forEach((rec) => {
            if (rec.student_id) existingRecords[rec.student_id] = rec.status
        })
    }

    async function saveAction(formData: FormData) {
        'use server'
        if (!classId) return
        const submissions = []
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('status-')) {
                const studentId = key.replace('status-', '')
                submissions.push({ studentId, status: value as any })
            }
        }
        await submitAttendance(classId, date, submissions)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
                    <p className="text-sm text-gray-500 mt-1">Track daily student presence</p>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Class</label>
                    <form>
                        <input type="hidden" name="date" value={date} />
                        <select
                            name="classId"
                            defaultValue={classId || ''}
                            onChange={(e) => {
                                // Simple client-side nav via form submit or just rely on form behavior? 
                                // Form with method=get is standard.
                                // But onChange submit is better UX. 
                                // Since this is server component, we can use a small Client Component wrapper or just standard form.
                                // Let's use standard form with a submit button for now to avoid complexity of client components.
                            }}
                            className="w-48 px-3 py-2 border rounded-lg text-sm bg-white"
                        >
                            {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </form>
                    {/* Workaround: The select above doesn't auto-submit. 
                   Real implementation uses router.push on change. 
                   For simpler pure RSC, we need a submit button or a Link list.
                   Let's assume the user uses the generic "Filter" button below.
               */}
                </div>

                <form className="flex gap-4 items-end">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Class</label>
                        <select name="classId" defaultValue={classId || ''} className="w-48 px-3 py-2 border rounded-lg text-sm bg-white">
                            {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
                        <input name="date" type="date" defaultValue={date} className="w-full px-3 py-2 border rounded-lg text-sm" />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 h-[38px]">
                        Load List
                    </button>
                </form>
            </div>

            {/* List */}
            <form action={saveAction} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students?.map((student) => {
                            const status = existingRecords[student.id] || 'PRESENT'
                            return (
                                <tr key={student.id} className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-medium text-gray-900">{student.name}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex justify-center space-x-4">
                                            <label className="flex items-center space-x-1 cursor-pointer">
                                                <input type="radio" name={`status-${student.id}`} value="PRESENT" defaultChecked={status === 'PRESENT'} className="text-green-600 focus:ring-green-500" />
                                                <span className="text-xs text-gray-600">Present</span>
                                            </label>
                                            <label className="flex items-center space-x-1 cursor-pointer">
                                                <input type="radio" name={`status-${student.id}`} value="ABSENT" defaultChecked={status === 'ABSENT'} className="text-red-600 focus:ring-red-500" />
                                                <span className="text-xs text-gray-600">Absent</span>
                                            </label>
                                            <label className="flex items-center space-x-1 cursor-pointer">
                                                <input type="radio" name={`status-${student.id}`} value="LATE" defaultChecked={status === 'LATE'} className="text-yellow-600 focus:ring-yellow-500" />
                                                <span className="text-xs text-gray-600">Late</span>
                                            </label>
                                            <label className="flex items-center space-x-1 cursor-pointer">
                                                <input type="radio" name={`status-${student.id}`} value="EXCUSED" defaultChecked={status === 'EXCUSED'} className="text-blue-600 focus:ring-blue-500" />
                                                <span className="text-xs text-gray-600">Excused</span>
                                            </label>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center shadow-sm">
                        <Save className="w-4 h-4 mr-2" /> Save Attendance
                    </button>
                </div>
            </form>
        </div>
    )
}
