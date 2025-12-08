'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    Calendar,
    MessageSquare,
    Settings,
    Bell,
    Search,
    School,
    LogOut,
    ChevronDown,
    Menu,
    X,
    FileText,
    Award,
    Shield
} from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import clsx from 'clsx'

export default function DashboardShell({
    children,
    user,
    profile
}: {
    children: React.ReactNode,
    user: any,
    profile?: any
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()

    // Priority: Profile (DB) > Metadata (Auth) > Default
    const role = profile?.role || user?.user_metadata?.role || 'STUDENT'

    const allNavigation = [
        { name: 'Overview', href: '/dashboard', icon: LayoutDashboard, roles: ['SUPERADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'] },
        { name: 'Students', href: '/dashboard/students', icon: GraduationCap, roles: ['SUPERADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Family', href: '/dashboard/family', icon: Users, roles: ['PARENT'] },
        { name: 'Teachers', href: '/dashboard/teachers', icon: Users, roles: ['SUPERADMIN', 'PRINCIPAL'] },
        { name: 'Classes', href: '/dashboard/classes', icon: School, roles: ['SUPERADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Attendance', href: '/dashboard/attendance', icon: Calendar, roles: ['SUPERADMIN', 'PRINCIPAL', 'TEACHER'] },
        { name: 'Exams', href: '/dashboard/exams', icon: FileText, roles: ['SUPERADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT'] },
        { name: 'Certificates', href: '/dashboard/certificates', icon: Award, roles: ['SUPERADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT'] },
        // Student sees partial view? Or separate page? For now let's allow access and handle inside page.
        { name: 'Schedule', href: '/dashboard/schedule', icon: Calendar, roles: ['SUPERADMIN', 'PRINCIPAL', 'TEACHER', 'STUDENT', 'PARENT'] },
        { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare, roles: ['SUPERADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'] },
        { name: 'Settings', href: '/dashboard/settings', icon: Settings, roles: ['SUPERADMIN', 'PRINCIPAL', 'TEACHER', 'PARENT', 'STUDENT'] },
        { name: 'System Logs', href: '/dashboard/admin/logs', icon: Shield, roles: ['SUPERADMIN'] },
    ]

    const navigation = allNavigation.filter(item => item.roles.includes(role))

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.replace('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={clsx(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:block",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-gray-100">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30">
                            <School className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            Nexus<span className="text-blue-600">Edu</span>
                        </span>
                        <button
                            className="ml-auto lg:hidden"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">
                            Main Menu
                        </div>
                        {navigation.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={clsx(
                                        "flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-blue-50 text-blue-600 shadow-sm"
                                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <item.icon className={clsx("w-5 h-5 mr-3", isActive ? "text-blue-600" : "text-gray-400")} />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    {/* User Profile Footer */}
                    <div className="p-4 border-t border-gray-100">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 lg:px-8 z-10 sticky top-0">
                    <button
                        className="mr-4 lg:hidden p-2 text-gray-500 rounded-lg hover:bg-gray-100"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    <div className="flex items-center flex-1 max-w-xl">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search anything..."
                                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 border-transparent rounded-lg focus:bg-white focus:border-blue-500 focus:ring-0 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>

                        <div className="flex items-center pl-4 border-l border-gray-200">
                            <div className="flex flex-col items-end mr-3 hidden sm:flex">
                                <span className="text-sm font-medium text-gray-900">{user?.email?.split('@')[0] || 'User'}</span>
                                <span className="text-xs text-gray-500">{user?.user_metadata?.role || 'Staff'}</span>
                            </div>
                            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium shadow-md">
                                {user?.email?.[0]?.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
