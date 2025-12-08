import { createClient } from '@/lib/supabase-server'
import { GraduationCap, Timer, Award, TrendingUp, Calendar, MapPin, Mail, Phone, ArrowLeft, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function StudentProfilePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params
    const supabase = await createClient()

    // 1. Fetch Student Details
    const { data: student, error } = await supabase
        .from('students')
        .select('*, class:classes(name), school:schools(name)')
        .eq('id', params.id)
        .single()

    if (error || !student) {
        return notFound()
    }

    // 2. Fetch Stats Parallel
    const [
        { data: attendance },
        { data: grades },
        { data: certificates },
        { count: examCount }
    ] = await Promise.all([
        supabase.from('attendance_records').select('status').eq('student_id', student.id),
        supabase.from('grades_records').select('*, subject:subjects(name), exam:exams(available_from)').order('created_at', { ascending: false }).limit(5),
        supabase.from('certificates').select('*').eq('student_id', student.id).order('issued_at', { ascending: false }),
        supabase.from('exam_attempts').select('*', { count: 'exact', head: true }).eq('student_id', student.id)
    ])

    // Calc Attendance
    const totalDays = attendance?.length || 0
    const presentDays = attendance?.filter(r => r.status === 'PRESENT').length || 0
    const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100

    // Calc Average Grade (Mock logic as scores are Decimal)
    const avgScore = grades && grades.length > 0
        ? Math.round(grades.reduce((acc, curr) => acc + (Number(curr.score) || 0), 0) / grades.length)
        : 0

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Nav */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard/students" className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-heading">Student Profile</h1>
                    <p className="text-slate-500 text-sm">Detailed academic and behavioral overview</p>
                </div>
            </div>

            {/* Profile Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
                <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex justify-between items-end -mt-12 mb-6">
                        <div className="fex items-end">
                            <div className="h-24 w-24 rounded-2xl bg-white p-1 shadow-xl">
                                <div className="h-full w-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold text-3xl">
                                    {student.name[0]}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 pb-2">
                            <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors">
                                Message Parent
                            </button>
                            <button className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-1">{student.name}</h2>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                            <span className="flex items-center"><GraduationCap className="w-4 h-4 mr-1.5" /> {(student.class as any)?.name || 'Unassigned'}</span>
                            <span className="flex items-center"><MapPin className="w-4 h-4 mr-1.5" /> {(student.school as any)?.name || 'Main Campus'}</span>
                            <span className="flex items-center font-mono bg-slate-50 px-2 rounded-md border border-slate-100">ID: {student.student_code || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Attendance</div>
                    <div className="flex items-end gap-2">
                        <span className={`text-3xl font-black ${attendanceRate > 90 ? 'text-emerald-500' : 'text-amber-500'}`}>{attendanceRate}%</span>
                        <span className="text-xs text-slate-400 mb-1.5 font-medium">overall</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Avg Grade</div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-indigo-500">{avgScore}%</span>
                        <span className="text-xs text-slate-400 mb-1.5 font-medium">last 5 exams</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Awards</div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-amber-500">{certificates?.length || 0}</span>
                        <span className="text-xs text-slate-400 mb-1.5 font-medium">certificates</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Late Days</div>
                    <div className="flex items-end gap-2">
                        <span className="text-3xl font-black text-rose-500">{attendance?.filter(r => r.status === 'LATE').length || 0}</span>
                        <span className="text-xs text-slate-400 mb-1.5 font-medium">this term</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Grades */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="font-bold text-slate-800">Recent Performance</h3>
                        <Link href={`/dashboard/grades?studentId=${student.id}`} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View All</Link>
                    </div>
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50/50 text-slate-500 font-semibold">
                            <tr>
                                <th className="px-6 py-3">Subject</th>
                                <th className="px-6 py-3">Exam Date</th>
                                <th className="px-6 py-3 text-right">Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {grades?.map((record) => (
                                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">{(record.subject as any)?.name}</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {(record.exam as any)?.available_from ? new Date((record.exam as any).available_from).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className={`px-2 py-1 rounded-md font-bold ${Number(record.score) >= 80 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                                            {Number(record.score)}%
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {(!grades || grades.length === 0) && (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">No grade records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Certificates List */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden h-fit">
                    <div className="p-6 border-b border-slate-50">
                        <h3 className="font-bold text-slate-800">Certificates & Awards</h3>
                    </div>
                    <div className="p-6 space-y-4">
                        {certificates?.map((cert) => (
                            <div key={cert.id} className="flex items-center gap-4 group">
                                <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                                    <Award className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900 text-sm">{cert.type}</div>
                                    <div className="text-xs text-slate-500">{new Date(cert.issued_at).toLocaleDateString()}</div>
                                </div>
                            </div>
                        ))}
                        {(!certificates || certificates.length === 0) && (
                            <div className="text-center py-6 text-slate-400 text-sm">
                                No certificates yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
