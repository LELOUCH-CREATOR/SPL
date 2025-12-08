import { createClient } from '@/lib/supabase-server'
import { createClass, deleteClass, createSubject } from '@/app/actions/classes'
import { Plus, Trash2, BookOpen, Users } from 'lucide-react'

export default async function ClassesPage() {
    const supabase = await createClient()

    const { data: classes } = await supabase
        .from('classes')
        .select('*, grade:grades(name), homeroom_teacher:users!homeroom_teacher_id(name)')
        .order('name')

    const { data: grades } = await supabase.from('grades').select('*').order('name')
    const { data: teachers } = await supabase.from('users').select('*').eq('role', 'TEACHER')
    const { data: subjects } = await supabase.from('subjects').select('*').order('name')

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-heading">Classes & Subjects</h1>
                    <p className="text-slate-500 mt-1">Manage academic structures and curriculum</p>
                </div>
            </div>

            {/* Class Creation Form */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center relative z-10">
                    <span className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 text-sm font-bold">1</span>
                    Create New Class
                </h3>
                <form action={createClass} className="flex flex-col md:flex-row gap-5 items-end relative z-10">
                    <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Class Name</label>
                        <input name="name" type="text" placeholder="e.g. 10-A" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 transition-all font-medium" required />
                    </div>
                    <div className="w-full md:w-56">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Grade Level</label>
                        <select name="gradeId" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 transition-all">
                            <option value="">Select Grade</option>
                            {grades?.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-72">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Homeroom Teacher</label>
                        <select name="teacherId" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-200 transition-all">
                            <option value="">Select Teacher</option>
                            {teachers?.map(t => (
                                <option key={t.id} value={t.id}>{t.name || t.email}</option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="w-full md:w-auto px-6 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all flex items-center justify-center h-[46px]">
                        <Plus className="w-5 h-5 mr-2" /> CREATE
                    </button>
                </form>
            </div>

            {/* Classes List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classes?.map((c) => (
                    <div key={c.id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 p-6 hover:shadow-lg transition-all duration-300 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                        <div className="flex justify-between items-start">
                            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform shadow-inner">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            <form action={deleteClass.bind(null, c.id)}>
                                <button className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </form>
                        </div>

                        <h3 className="text-xl font-bold text-slate-900 mb-1">{c.name}</h3>
                        <p className="text-sm font-medium text-slate-500 mb-6 bg-slate-50 inline-block px-3 py-1 rounded-lg border border-slate-100">
                            {(c.grade as any)?.name ? `Grade: ${(c.grade as any).name}` : 'No Grade assigned'}
                        </p>

                        <div className="flex items-center pt-5 border-t border-slate-100">
                            <div className="flex items-center text-slate-600 text-sm">
                                <Users className="w-4 h-4 mr-2 text-slate-400" />
                                <span className="truncate max-w-[150px] font-medium">
                                    {(c.homeroom_teacher as any)?.name || 'No Teacher'}
                                </span>
                            </div>
                            <span className="ml-auto text-xs font-bold px-2 py-1 bg-white border border-slate-200 rounded-md text-slate-500 shadow-sm">
                                0 Students
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {(!classes || classes.length === 0) && (
                <div className="col-span-full text-center py-16 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                    <p className="font-medium">No classes found.</p>
                </div>
            )}


            <div className="border-t border-slate-100 my-10"></div>

            {/* Subjects Section */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-900 font-heading">Subjects Library</h2>
                    <span className="text-xs font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">{subjects?.length || 0} Total</span>
                </div>

                {/* Subject Creation */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <form action={createSubject} className="flex gap-4 items-end">
                        <div className="flex-1 max-w-md">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">New Subject Name</label>
                            <input name="name" type="text" placeholder="e.g. Mathematics, Science" className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-100 font-medium" required />
                        </div>
                        <button type="submit" className="px-6 py-3 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 h-[46px] flex items-center shadow-lg">
                            <Plus className="w-4 h-4 mr-2" /> Add Subject
                        </button>
                    </form>
                </div>

                {/* Subjects List */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {subjects?.map((s) => (
                        <div key={s.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-indigo-200 hover:shadow-md transition-all cursor-default">
                            <span className="font-bold text-slate-700 group-hover:text-indigo-700">{s.name}</span>
                            <div className="h-2 w-2 rounded-full bg-slate-200 group-hover:bg-indigo-400"></div>
                        </div>
                    ))}
                    {(!subjects || subjects.length === 0) && (
                        <p className="text-slate-400 text-sm col-span-full text-center py-8">No subjects defined yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}
