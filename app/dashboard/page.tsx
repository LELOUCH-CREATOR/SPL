import { createClient } from '@/lib/supabase-server'
import { BookOpen, Users, Calendar, Trophy, GraduationCap, Clock, ArrowUpRight, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
    const supabase = await createClient()

    // Parallel Fetching for Widgets
    const [
        { count: studentsCount },
        { count: teachersCount },
        { count: classesCount },
        { count: examsCount }
    ] = await Promise.all([
        supabase.from('students').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'TEACHER'),
        supabase.from('classes').select('*', { count: 'exact', head: true }),
        supabase.from('exams').select('*', { count: 'exact', head: true })
    ])

    // Consolidate User Fetch
    const { data: { user } } = await supabase.auth.getUser()

    // Fetch Profile for Role Check
    const { data: profile } = await supabase.from('users').select('role').eq('id', user?.id).single()
    const isAdmin = profile?.role === 'SUPERADMIN' || profile?.role === 'PRINCIPAL'

    // Recent Activity Logic
    let recentActivity = []
    let activityTitle = 'Recent Registrations'

    if (isAdmin) {
        const { data: logs } = await supabase
            .from('audit_logs')
            .select('*, user:users(name, role)')
            .order('created_at', { ascending: false })
            .limit(5)
        recentActivity = logs || []
        activityTitle = 'System Audit Trail'
    } else {
        const { data: users } = await supabase
            .from('users')
            .select('id, name, role, created_at')
            .order('created_at', { ascending: false })
            .limit(5)
        recentActivity = users || []
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white shadow-xl shadow-indigo-200">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>

                <div className="relative z-10">
                    <h1 className="text-4xl font-bold font-heading mb-2">Welcome back, {user?.email?.split('@')[0] || 'User'}! 👋</h1>
                    <p className="opacity-90 max-w-xl text-lg mb-6">Here is an overview of your school's performance and upcoming activities.</p>

                    <div className="flex gap-4">
                        <Link href="/dashboard/students" className="px-5 py-2.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-xl font-medium hover:bg-white/30 transition-all flex items-center">
                            Manage Students <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                        <Link href="/dashboard/schedule" className="px-5 py-2.5 bg-white text-indigo-600 rounded-xl font-medium hover:bg-indigo-50 transition-all shadow-lg shadow-black/5 flex items-center">
                            View Schedule
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Students', value: studentsCount || 0, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Active Teachers', value: teachersCount || 0, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    { label: 'Classes', value: classesCount || 0, icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-50' },
                    { label: 'Exams Set', value: examsCount || 0, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
                ].map((stat, i) => (
                    <div key={i} className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                <ArrowUpRight className="w-3 h-3 mr-1" /> +2.5%
                            </span>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold text-slate-800 font-heading mb-1">{stat.value}</h3>
                            <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main List */}
                <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-slate-800 font-heading">{activityTitle}</h3>
                        <Link href="/dashboard/students" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View All</Link>
                    </div>
                    <div className="p-0">
                        <table className="min-w-full">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {recentActivity?.map((item: any) => (
                                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-200 mr-3">
                                                    {(item.user?.name?.[0] || item.name?.[0] || 'U')}
                                                </div>
                                                <div className="font-medium text-slate-900">{(item.user?.name || item.name || 'System')}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isAdmin ? (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium border ${item.action?.includes('DELETE') ? 'bg-red-50 text-red-700 border-red-100' :
                                                        item.action?.includes('UPDATE') ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                            'bg-blue-50 text-blue-700 border-blue-100'
                                                    }`}>
                                                    {item.action}
                                                </span>
                                            ) : (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.role === 'TEACHER' ? 'bg-indigo-100 text-indigo-800' :
                                                    item.role === 'STUDENT' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-slate-100 text-slate-800'
                                                    }`}>
                                                    {item.role}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm text-slate-500">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                                {recentActivity.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="text-center py-8 text-slate-400 text-sm">No recent activity found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Side Panel */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg text-center">
                        <h3 className="text-lg font-bold font-heading mb-4">Quick Setup</h3>
                        <p className="text-slate-300 text-sm mb-6">Complete your school profile to unlock all features.</p>
                        <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                            <div className="bg-indigo-500 h-2 rounded-full w-3/4 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
                        </div>
                        <span className="text-xs font-medium text-indigo-300">75% Complete</span>
                        <button className="w-full mt-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
                            Finish Setup
                        </button>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center">
                            <Clock className="w-4 h-4 mr-2" /> Pending Actions
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center p-3 rounded-xl bg-amber-50 border border-amber-100">
                                <div className="h-2 w-2 rounded-full bg-amber-500 mr-3"></div>
                                <span className="text-sm text-amber-900 font-medium">Verify 2 Teachers</span>
                            </div>
                            <div className="flex items-center p-3 rounded-xl bg-blue-50 border border-blue-100">
                                <div className="h-2 w-2 rounded-full bg-blue-500 mr-3"></div>
                                <span className="text-sm text-blue-900 font-medium">Approve Class Schedule</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
