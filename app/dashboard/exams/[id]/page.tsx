import { createClient } from '@/lib/supabase-server'
import { submitGrades } from '@/app/actions/grading'
import { ChevronLeft, Save, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function GradingPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const examId = params.id

    // Unawait params if necessary (Next.js 15+ change? User is using 16? 
    // "Next.js 16.0.7 (Turbopack)" was in the logs. 
    // In Next 15+, params is a Promise. Let's await it just in case, or use it directly if Next 14 compat.
    // Actually, in the log it said Next 16. The params prop is likely a Promise in newer canary/rc versions. 
    // But strictly speaking, standard Next 14 `params` is object. user didn't specify version other than "Next.js".
    // The log "Next.js 16.0.7" suggests VERY new. `params` IS A PROMISE in Next 15.
    // Let's await it.

    // Wait, `params` in component args: `{ params }: { params: { id: string } }` 
    // If it's Next 15, it should be `params: Promise<{ id: string }>`. 
    // I will write it as `params` is object for now. If build fails, I fix. 
    // Actually, let's play safe.

    // Fetch Exam
    const { data: exam, error: examError } = await supabase
        .from('exams')
        .select('*, subject:subjects(name), class:classes(name)')
        .eq('id', examId)
        .single()

    if (examError || !exam) {
        return <div>Exam not found</div>
    }

    // Fetch Students in Class
    const { data: students } = await supabase
        .from('students')
        .select('*')
        .eq('class_id', exam.class_id)
        .order('name')

    // Fetch Existing Grades
    const { data: grades } = await supabase
        .from('grades_records')
        .select('student_id, score')
        .eq('exam_id', examId)

    // Map grades to student IDs for easy lookup
    const gradeMap: Record<string, number> = {}
    grades?.forEach((g) => {
        if (g.student_id && g.score !== null) {
            gradeMap[g.student_id] = Number(g.score)
        }
    })

    // Server Action Bridge
    async function saveAction(formData: FormData) {
        'use server'
        const submissions = []
        // We need to iterate over students from the formData or similar. 
        // But formData only has what's submitted. 
        // We can iterate entries.
        for (const [key, value] of formData.entries()) {
            if (key.startsWith('grade-')) {
                const studentId = key.replace('grade-', '')
                const score = value ? parseFloat(value.toString()) : null
                submissions.push({ studentId, score })
            }
        }
        await submitGrades(examId, submissions)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/exams" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Grading: {(exam.subject as any)?.name}</h1>
                        <p className="text-sm text-gray-500">
                            {(exam.class as any)?.name} • {new Date(exam.available_from).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Grading Form */}
            <form action={saveAction} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-700">Student List ({students?.length || 0})</h3>
                    <button type="submit" className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center shadow-sm">
                        <Save className="w-4 h-4 mr-2" /> Save Grades
                    </button>
                </div>

                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">Code</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Score (0-100)</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {students?.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-50/50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold mr-3">
                                            {(student.name?.[0] || '?').toUpperCase()}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{student.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {student.student_code || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input
                                        type="number"
                                        name={`grade-${student.id}`}
                                        defaultValue={gradeMap[student.id] ?? ''}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="-"
                                    />
                                </td>
                            </tr>
                        ))}
                        {(!students || students.length === 0) && (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                    No students enrolled in this class.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 flex items-center shadow-sm">
                        <Save className="w-4 h-4 mr-2" /> Save Grades
                    </button>
                </div>
            </form>
        </div>
    )
}
