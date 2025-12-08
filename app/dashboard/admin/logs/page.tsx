import { createClient } from '@/lib/supabase-server'
import { getAuditLogs } from '@/app/actions/audit'
import { Shield, Clock, Search, Activity, User } from 'lucide-react'
import { redirect } from 'next/navigation'

export default async function AuditLogsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Role Guard
    const { data: profile } = await supabase.from('users').select('role').eq('id', user?.id).single()
    if (profile?.role !== 'SUPERADMIN' && profile?.role !== 'PRINCIPAL') {
        redirect('/dashboard') // Or 404
    }

    const { logs, count } = await getAuditLogs(1, 100)

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 font-heading">System Audit Logs</h1>
                    <p className="text-slate-500 mt-1">Monitor system activity and security events</p>
                </div>
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-mono font-medium flex items-center">
                        <Activity className="w-3 h-3 mr-1.5" /> Live Monitoring
                    </span>
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-4 border-b border-slate-50 flex gap-4 items-center bg-slate-50/50">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input className="bg-transparent border-none text-sm w-full outline-none text-slate-600 placeholder:text-slate-400" placeholder="Filter logs by user, action or resource..." />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 font-semibold">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Resource</th>
                                <th className="px-6 py-4 text-right">IP Address</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {logs?.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-xs">
                                        <div className="flex items-center">
                                            <Clock className="w-3 h-3 mr-2 opacity-50" />
                                            {new Date(log.created_at).toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-6 w-6 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 mr-2">
                                                {(log.user as any)?.name?.[0] || 'U'}
                                            </div>
                                            <span className="font-medium text-slate-900">{(log.user as any)?.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${log.action?.includes('DELETE') ? 'bg-red-50 text-red-700 border-red-100' :
                                                log.action?.includes('UPDATE') ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                    'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                                        {log.resource_type}::{log.resource_id?.slice(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-400 font-mono text-xs">
                                        {log.ip}
                                    </td>
                                </tr>
                            ))}
                            {(!logs || logs.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        <Shield className="w-12 h-12 mx-auto mb-4 text-slate-200" />
                                        No logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
