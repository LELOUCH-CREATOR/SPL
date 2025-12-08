import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'
import DashboardShell from './DashboardShell'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()

    // 🛡️ AUTH PROXY CHECK
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
        redirect('/login')
    }

    // 👤 FETCH USER PROFILE (Source of Truth for Role)
    const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

    // If no profile exists (legacy user?), default to metadata or create one?
    // For now, pass what we have.

    return (
        <DashboardShell user={user} profile={profile}>
            {children}
        </DashboardShell>
    )
}
