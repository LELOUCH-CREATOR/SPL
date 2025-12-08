import { createClient } from '@/lib/supabase-server'
import { verifyUser, deleteUser } from '@/app/actions/users'
import { Check, X, Shield, MoreVertical } from 'lucide-react'

export default async function TeachersPage() {
    const supabase = await createClient()

    // Fetch all users with role TEACHER
    const { data: teachers, error } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'TEACHER')
        .order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage teaching staff access and assignments</p>
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Invite Teacher
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Teacher
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Joined
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {teachers?.map((teacher) => (
                            <tr key={teacher.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                                {teacher.name?.[0]?.toUpperCase() || teacher.email?.[0]?.toUpperCase()}
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{teacher.name || 'No Name'}</div>
                                            <div className="text-sm text-gray-500">{teacher.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {teacher.verified ? (
                                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                            Verified
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                            Pending
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {new Date(teacher.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {!teacher.verified && (
                                        <form action={verifyUser.bind(null, teacher.id)} className="inline-block">
                                            <button type="submit" className="text-blue-600 hover:text-blue-900 mr-4 font-medium">
                                                Verify
                                            </button>
                                        </form>
                                    )}
                                    {teacher.verified && (
                                        <form action={deleteUser.bind(null, teacher.id)} className="inline-block">
                                            <button type="submit" className="text-red-600 hover:text-red-900 font-medium">
                                                Suspend
                                            </button>
                                        </form>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {(!teachers || teachers.length === 0) && (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    No teachers found. Invite them to get started.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
