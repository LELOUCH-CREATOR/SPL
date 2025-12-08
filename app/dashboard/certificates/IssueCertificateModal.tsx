'use client'

import { useState } from 'react'
import { issueCertificate } from '@/app/actions/certificates'
import { Plus, X, Loader2, Award, Search } from 'lucide-react'
import Image from 'next/image'

// This would ideally search real students, for MVP we'll use a manual ID or simpler list if passed
export default function IssueCertificateModal({ students }: { students: any[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStudent, setSelectedStudent] = useState<any>(null)

    async function handleSubmit(formData: FormData) {
        if (!selectedStudent) return

        setLoading(true)
        try {
            // Append student ID manually since it's state-driven
            formData.append('studentId', selectedStudent.id)
            await issueCertificate(formData)
            setIsOpen(false)
            setSelectedStudent(null)
        } catch (e) {
            alert('Failed to issue certificate')
        } finally {
            setLoading(false)
        }
    }

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.student_code?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-colors shadow-lg shadow-amber-200 hover:shadow-xl"
            >
                <Plus className="w-5 h-5 mr-2" /> Issue Certificate
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-4 right-4 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="mb-6">
                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-4">
                                <Award className="w-6 h-6" />
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">Issue Certificate</h2>
                            <p className="text-sm text-slate-500">Award a digital certificate to a student.</p>
                        </div>

                        <div className="space-y-6">
                            {/* Student Search */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Select Student</label>
                                {!selectedStudent ? (
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search student name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                                        />
                                        {searchTerm && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 max-h-48 overflow-y-auto z-10">
                                                {filteredStudents.length > 0 ? filteredStudents.map(student => (
                                                    <button
                                                        key={student.id}
                                                        onClick={() => setSelectedStudent(student)}
                                                        className="w-full text-left px-4 py-3 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                                                    >
                                                        <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                            {student.name[0]}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-slate-900">{student.name}</div>
                                                            <div className="text-xs text-slate-500">{student.student_code || 'No ID'}</div>
                                                        </div>
                                                    </button>
                                                )) : (
                                                    <div className="p-4 text-center text-sm text-slate-500">No students found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between p-3 bg-amber-50 border border-amber-100 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-amber-600 font-bold shadow-sm">
                                                {selectedStudent.name[0]}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-900">{selectedStudent.name}</div>
                                                <div className="text-xs text-emerald-600 font-medium">Selected</div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedStudent(null)}
                                            className="text-xs font-medium text-slate-500 hover:text-slate-700 underline"
                                        >
                                            Change
                                        </button>
                                    </div>
                                )}
                            </div>

                            <form action={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Certificate Type</label>
                                    <select
                                        name="type"
                                        required
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none appearance-none"
                                    >
                                        <option value="Achievement">Achievement Award</option>
                                        <option value="Excellence">Certificate of Excellence</option>
                                        <option value="Participation">Participation Certificate</option>
                                        <option value="Completion">Course Completion</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !selectedStudent}
                                    className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Issue Certificate'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
