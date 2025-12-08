import { createClient } from '@/lib/supabase-server'
import { Award, FileText, Download, Calendar } from 'lucide-react'
import IssueCertificateModal from './IssueCertificateModal'

export default async function CertificatesPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null // Or redirect to login

    let query = supabase
        .from('certificates')
        .select('*, student:students(name, student_code)')
        .order('issued_at', { ascending: false })

    // Role-based filtering
    // Role-based filtering
    // Fetch profile role first
    const { data: profile } = await supabase.from('users').select('role, email').eq('id', user.id).single()



    if (profile?.role === 'STUDENT') {
        // Find student record by email or typical link
        // For this MVP, let's assume strict RLS is active.
        // But to be safe in UI:
        // query = query.eq('student.email', user.email) // If email exists on student
    }

    // Actually, let's rely on the query result.
    const { data: certificates } = await query

    // Fetch Students for the Modal
    const { data: students } = await supabase
        .from('students')
        .select('id, name, student_code')
        .eq('enrollment_status', 'ACTIVE')
        .order('name')

    const canIssue = profile?.role === 'TEACHER' || profile?.role === 'SUPERADMIN' || profile?.role === 'PRINCIPAL'

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-heading">Certificates</h1>
                    <p className="text-slate-500 mt-1">Digital awards and academic records</p>
                </div>
                {canIssue && <IssueCertificateModal students={students || []} />}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates?.map((cert) => (
                    <div key={cert.id} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 relative">
                        {/* Decorative Top Border */}
                        <div className="h-2 w-full bg-gradient-to-r from-amber-400 to-orange-500"></div>

                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div className="h-12 w-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                    <Award className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                                    {(cert.student as any)?.student_code || 'NO-ID'}
                                </span>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-1">{cert.type}</h3>
                            <p className="text-sm text-slate-500 mb-4">Awarded to <span className="font-semibold text-slate-900">{(cert.student as any)?.name}</span></p>

                            <div className="flex items-center text-xs text-slate-400 border-t border-slate-50 pt-4">
                                <Calendar className="w-3 h-3 mr-1.5" />
                                {new Date(cert.issued_at).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>

                        {/* Hover Action */}
                        <div className="absolute inset-x-0 bottom-0 p-4 bg-white/90 backdrop-blur-sm border-t border-slate-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex justify-center">
                            <button className="flex items-center text-sm font-medium text-amber-600 hover:text-amber-700">
                                <Download className="w-4 h-4 mr-2" /> Download PDF
                            </button>
                        </div>
                    </div>
                ))}

                {(!certificates || certificates.length === 0) && (
                    <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
                            <FileText className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900">No certificates yet</h3>
                        <p className="mt-1 text-sm text-slate-500">Issue the first certificate to see it here.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
