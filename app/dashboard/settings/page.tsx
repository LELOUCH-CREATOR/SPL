import { createClient } from '@/lib/supabase-server'
import { User, Lock, Bell } from 'lucide-react'

import { updateSchool } from '@/app/actions/school'
import { School, Save } from 'lucide-react'
import InviteGenerator from './InviteGenerator'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    // Fetch Profile & School
    const { data: profile } = await supabase
        .from('users')
        .select('*, school:schools(*)')
        .eq('id', user.id)
        .single()

    const school = profile?.school

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 font-heading">Settings</h1>
                <p className="text-slate-500 mt-1">Manage your account and school preferences</p>
            </div>

            {/* Account Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100/50 bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center">
                        <User className="w-5 h-5 mr-3 text-indigo-600" /> Account Profile
                    </h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Address</label>
                            <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-mono text-sm">
                                {user.email}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Role</label>
                            <div className="px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 font-bold inline-block text-sm">
                                {profile?.role || 'User'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* School Settings (Visible if Authorised) */}
            {school && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100/50 bg-slate-50/50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center">
                            <School className="w-5 h-5 mr-3 text-emerald-600" /> School Information
                        </h2>
                        <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md font-medium">Active</span>
                    </div>
                    <form action={updateSchool} className="p-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">School Name</label>
                                <input
                                    name="name"
                                    defaultValue={school.name}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">School Code</label>
                                <input
                                    name="schoolCode"
                                    defaultValue={school.school_code}
                                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none font-mono"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200 hover:shadow-xl flex items-center">
                                <Save className="w-4 h-4 mr-2" /> Save Changes
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Invitations Management */}
            {school && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100/50 bg-slate-50/50 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center">
                            <User className="w-5 h-5 mr-3 text-purple-600" /> Staff Invitations
                        </h2>
                    </div>
                    <div className="p-6">
                        <InviteGenerator />
                    </div>
                </div>
            )}

            {/* Security Section (Placeholder) */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                <div className="p-6 border-b border-slate-100/50 bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-900 flex items-center">
                        <Lock className="w-5 h-5 mr-3 text-slate-400" /> Security
                    </h2>
                </div>
                <div className="p-6">
                    <p className="text-slate-500 text-sm mb-4">Password reset and 2FA settings are managed centrally.</p>
                </div>
            </div>
        </div>
    )
}
