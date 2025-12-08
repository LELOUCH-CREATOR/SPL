import { createClient } from '@/lib/supabase-server'
import { createStudent, deleteStudent } from '@/app/actions/students'
import { Plus, Search, Trash2, Filter, MoreHorizontal, GraduationCap } from 'lucide-react'
import Link from 'next/link'

export default async function StudentsPage(props: { searchParams: Promise<{ q?: string }> }) {
    const searchParams = await props.searchParams
    const supabase = await createClient()
    const query = searchParams?.q || ''

    // Fetch Students with Search
    let dbQuery = supabase
        .from('students')
        .select('*, class:classes(name)')
        .order('created_at', { ascending: false })

    if (query) {
        dbQuery = dbQuery.ilike('name', `%${query}%`)
    }

    const { data: students } = await dbQuery
    const { data: classes } = await supabase.from('classes').select('id, name')

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-heading">Students</h1>
                    <p className="text-slate-500 mt-1">Manage enrollments and profiles</p>
                </div>
                <div className="flex gap-2">
                    <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 flex items-center shadow-sm">
                        <Filter className="w-4 h-4 mr-2" /> Filter
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 flex items-center shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all">
                        <Plus className="w-4 h-4 mr-2" /> Export .CSV
                    </button>
                </div>
            </div>

            {/* Action Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                {/* Search */}
                <form className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        name="q"
                        defaultValue={query}
                        placeholder="Search by name..."
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 text-slate-900 placeholder:text-slate-400"
                    />
                </form>

                {/* Quick Enroll Form (Inline for MVP) */}
                <form action={createStudent} className="flex gap-2 w-full md:w-auto">
                    <select name="classId" className="px-3 py-2.5 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-100 w-40" required>
                        <option value="">Class...</option>
                        {classes?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <input name="name" placeholder="Name" className="px-3 py-2.5 bg-slate-50 rounded-xl text-sm border-none focus:ring-2 focus:ring-indigo-100 flex-1 md:w-48" required />
                    {/* ID hidden/auto or optional */}
                    <button type="submit" className="px-4 py-2 bg-slate-900 text-white rounded-xl font-medium text-sm hover:bg-slate-800">
                        <Plus className="w-4 h-4" />
                    </button>
                </form>
            </div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-100">
                    <thead className="bg-slate-50/80 backdrop-blur-sm">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student Profile</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Student ID</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Class</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                        {students?.map((student) => (
                            <tr key={student.id} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-4">
                                            {student.name?.[0]?.toUpperCase()}
                                        </div>
                                        <div>
                                            <Link href={`/dashboard/students/${student.id}`} className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                                                {student.name}
                                            </Link>
                                            <div className="text-xs text-slate-500">Enrolled {new Date(student.created_at || Date.now()).toLocaleDateString()}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">
                                    {student.student_code || '—'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                        {student.class?.name || 'Unassigned'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${student.enrollment_status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                                        }`}>
                                        {student.enrollment_status || 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                    <form action={deleteStudent.bind(null, student.id)} className="inline-block">
                                        <button className="text-slate-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        {(!students || students.length === 0) && (
                            <tr>
                                <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                                    <GraduationCap className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                                    No students found. Add one above.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
