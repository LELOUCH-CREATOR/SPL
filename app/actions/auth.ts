'use server'

import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { validateInvitation, consumeInvitation } from '@/app/actions/invitations'

export async function register(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const inviteCode = formData.get('inviteCode') as string

    // 0. Validate Invite Logic
    let role = 'STUDENT'
    let schoolId = null
    let autoVerify = false

    if (inviteCode) {
        // Validation check
        const { valid, data: invite, expired } = await validateInvitation(inviteCode)
        if (expired) return { error: 'Invitation code has expired.' }
        if (!valid || !invite) return { error: 'Invalid invitation code.' }

        // Use Invite Data
        role = invite.role
        schoolId = invite.school_id
        autoVerify = true
    } else {
        // Fallback or Public Registration (Demo)
        if (inviteCode?.toUpperCase().startsWith('TEACHER')) {
            role = 'TEACHER'
        } else if (inviteCode?.toUpperCase().startsWith('ADMIN')) {
            role = 'SUPERADMIN'
        } else if (inviteCode?.toUpperCase().startsWith('PARENT')) {
            role = 'PARENT'
        }
    }

    // 1. Sign Up
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
                role
            }
        }
    })

    if (authError) {
        return { error: authError.message }
    }

    if (!authData.user) {
        return { error: 'Registration failed to create user.' }
    }

    // 1.5 School Assignment
    if (!schoolId) {
        // Demo Logic for Public Reg
        let { data: school } = await supabase.from('schools').select('id').limit(1).single()
        if (!school) {
            const { data: newSchool } = await supabase.from('schools').insert({
                name: 'Demo System School',
                school_code: 'DEMO-001',
                status: 'ACTIVE'
            }).select().single()
            school = newSchool
        }
        schoolId = school?.id
    }

    // 2. Create Public User Record
    const { error: dbError } = await supabase
        .from('users')
        .insert({
            id: authData.user.id,
            email,
            name,
            role,
            school_id: schoolId,
            verified: autoVerify
        })

    if (dbError) {
        console.error('DB Insert Error:', dbError)
        return { error: 'Failed to create user profile. ' + dbError.message }
    }

    // 3. Consume Invite if Used
    if (inviteCode && autoVerify) {
        try {
            await consumeInvitation(inviteCode, authData.user.id)
        } catch (e) {
            console.error('Failed to consume invite:', e)
            // Non-critical? User is created but code technically still "pending" if this fails.
            // In strict systems transaction would be better.
        }
    }

    // Success
    redirect('/login?registered=true')
}
