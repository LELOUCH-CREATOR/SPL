import { createClient } from '@/lib/supabase-server'
import { linkChild } from '@/app/actions/parent'
import { Plus, User, BookOpen, Clock, AlertCircle } from 'lucide-react'

export default async function FamilyPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch Linked Students
    const { data: links } = await supabase
        .from('parent_student_links')
        .select('student:students(*, class:classes(name))')
        .eq('parent_id', user?.id)

    const children = links?.map(l => l.student) || []

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-heading">My Family</h1>
                    <p className="text-slate-500 mt-1">Monitor your children's progress</p>
                </div>
            </div>

            {/* Children List or Empty State */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {children.map((child: any) => (
                    <div key={child.id} className="group bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:shadow-indigo-100 transition-all duration-300">
                        <div className="h-28 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
                            {/* Decorative Circles */}
                            <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md rounded-full p-2">
                                <AlertCircle className="w-5 h-5 text-white/80" />
                            </div>

                            <div className="absolute -bottom-10 left-8">
                                <div className="h-20 w-20 rounded-2xl bg-white p-1.5 shadow-lg transform group-hover:scale-105 transition-transform">
                                    <div className="h-full w-full rounded-xl bg-slate-50 flex items-center justify-center text-3xl shadow-inner font-bold text-indigo-500">
                                        {child.name[0]}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="pt-12 px-8 pb-8">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{child.name}</h3>
                                    <p className="text-sm font-medium text-slate-500 flex items-center mt-1">
                                        <BookOpen className="w-4 h-4 mr-1.5 text-indigo-400" />
                                        {child.class?.name || 'No Class Assigned'}
                                    </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${true ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500'}`}>
                                    Active
                                </span>
                            </div>

                            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                                <div className="text-center p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                    <span className="block text-2xl font-black text-slate-900">95%</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance</span>
                                </div>
                                <div className="text-center p-3 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                    <span className="block text-2xl font-black text-slate-900">A-</span>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Grade</span>
                                </div>
                            </div>

                            <button className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 transition-all flex items-center justify-center group-hover:translate-y-[-2px]">
                                View Full Report <User className="w-4 h-4 ml-2 opacity-80" />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Add Child Card */}
                <div className="bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 p-8 flex flex-col justify-center items-center text-center hover:bg-slate-50 hover:border-indigo-200 transition-colors group">
                    <div className="h-16 w-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="w-8 h-8 text-indigo-500" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Link Another Child</h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-xs mx-auto">Enter the unique student code provided by your school administrator.</p>

                    <form action={linkChild} className="flex gap-2 w-full max-w-sm relative">
                        <div className="relative flex-1">
                            <Clock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                                name="studentCode"
                                type="text"
                                placeholder="Code (e.g. STU-123)"
                                className="w-full pl-9 pr-4 py-3 bg-white border-none rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-indigo-500/20"
                                required
                            />
                        </div>
                        <button type="submit" className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg">
                            Link
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
