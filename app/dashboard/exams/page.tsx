import { createClient } from '@/lib/supabase-server'
import { createExam, deleteExam } from '@/app/actions/exams'
import { Plus, Calendar, Clock, BookOpen, Trash2, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function ExamsPage() {
    const supabase = await createClient()

    // Fetch options for the form
    const { data: classes } = await supabase.from('classes').select('*').order('name')
    const { data: subjects } = await supabase.from('subjects').select('*').order('name')

    // Fetch Exams
    const { data: exams } = await supabase
        .from('exams')
        .select('*, subject:subjects(name), class:classes(name), creator:users!created_by(name)')
        .order('available_from', { ascending: true })

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-heading">Exams</h1>
                    <p className="text-slate-500 mt-1">Schedule and manage assessments</p>
                </div>
            </div>

            {/* Create Exam Form */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-sm font-bold">1</span>
                    Schedule New Exam
                </h3>
                <form action={createExam} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</label>
                        <select name="subjectId" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 transition-shadow" required>
                            <option value="">Select Subject</option>
                            {subjects?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</label>
                        <select name="classId" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 transition-shadow" required>
                            <option value="">Select Class</option>
                            {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</label>
                        <input name="date" type="datetime-local" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 transition-shadow" required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration (min)</label>
                        <input name="duration" type="number" defaultValue={60} className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 transition-shadow" />
                    </div>
                    <button type="submit" className="w-full px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all flex items-center justify-center h-[46px]">
                        <Plus className="w-5 h-5 mr-2" /> Schedule
                    </button>
                </form>
            </div>

            {/* Exams Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {exams?.map((exam) => (
                    <div key={exam.id} className="group bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all duration-300 flex gap-6">
                        {/* Date Box */}
                        <div className="flex-shrink-0 w-20 bg-indigo-50/50 rounded-2xl flex flex-col items-center justify-center p-4 text-indigo-600 border border-indigo-50">
                            <span className="text-xs font-bold uppercase tracking-wider">{new Date(exam.available_from).toLocaleString('default', { month: 'short' })}</span>
                            <span className="text-3xl font-black font-heading leading-none my-1">{new Date(exam.available_from).getDate()}</span>
                            <span className="text-xs opacity-60 font-medium">{new Date(exam.available_from).getFullYear()}</span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="text-lg font-bold text-slate-900 truncate pr-4">
                                    {(exam.subject as any)?.name || 'Unknown Subject'}
                                </h3>
                                <form action={deleteExam.bind(null, exam.id)}>
                                    <button className="text-slate-300 hover:text-red-500 transition-colors p-1">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </form>
                            </div>

                            <div className="flex flex-wrap gap-3 text-sm text-slate-500 mb-4">
                                <span className="flex items-center bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                    <BookOpen className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                    {(exam.class as any)?.name}
                                </span>
                                <span className="flex items-center bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                                    <Clock className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                                    {new Date(exam.available_from).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {exam.duration}m
                                </span>
                            </div>

                            <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
                                <span className="text-xs font-medium text-slate-400">By {(exam.creator as any)?.name || 'Admin'}</span>
                                <Link href={`/dashboard/exams/${exam.id}`} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center group-hover:translate-x-1 transition-transform">
                                    Enter Grades <ArrowRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
