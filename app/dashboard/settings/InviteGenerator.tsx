'use client'

import { useState } from 'react'
import { createInvitation } from '@/app/actions/invitations'
import { Copy, Check, Loader2, Plus } from 'lucide-react'

export default function InviteGenerator() {
    const [loading, setLoading] = useState(false)
    const [code, setCode] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    async function handleGenerate(role: string) {
        setLoading(true)
        try {
            const res = await createInvitation(role)
            if (res.success) setCode(res.code)
        } catch (e) {
            alert('Failed to generate invite')
        } finally {
            setLoading(false)
        }
    }

    function copyToClipboard() {
        if (!code) return
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="space-y-4">
            {!code ? (
                <div className="flex gap-4">
                    <button
                        onClick={() => handleGenerate('TEACHER')}
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center border border-indigo-100"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        Invite Teacher
                    </button>
                    <button
                        onClick={() => handleGenerate('PARENT')}
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-purple-50 text-purple-700 font-bold rounded-xl hover:bg-purple-100 transition-colors flex items-center justify-center border border-purple-100"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        Invite Parent
                    </button>
                    <button
                        onClick={() => handleGenerate('STUDENT')}
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors flex items-center justify-center border border-blue-100"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                        Invite Student
                    </button>
                </div>
            ) : (
                <div className="bg-emerald-50 rounded-xl p-6 border border-emerald-100 text-center animate-in fade-in zoom-in duration-300">
                    <p className="text-emerald-800 font-medium mb-2">Invitation Code Generated!</p>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <code className="text-2xl font-mono font-bold text-emerald-700 bg-white px-4 py-2 rounded-lg border border-emerald-100 shadow-sm">
                            {code}
                        </code>
                        <button
                            onClick={copyToClipboard}
                            className="p-2.5 bg-white text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100 shadow-sm"
                        >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                    <button
                        onClick={() => setCode(null)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline"
                    >
                        Generate Another
                    </button>
                </div>
            )}
            <p className="text-xs text-slate-400 text-center">
                Codes expire in 7 days. Share this code with the user to register.
            </p>
        </div>
    )
}
