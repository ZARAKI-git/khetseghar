'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const phone = formData.get('phone') as string
  const userType = formData.get('userType') as string

  // Use admin client to create user with auto-confirmed email
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  // Create user with admin API (auto-confirms email)
  const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      phone,
      user_type: userType,
    },
  })

  if (createError) {
    return { error: createError.message }
  }

  if (!userData.user) {
    return { error: 'Failed to create account' }
  }

  // Now sign in with the regular server client to establish session
  const supabase = await createServerClient()
  
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    return { error: signInError.message }
  }

  // Redirect based on user type
  if (userType === 'farmer') {
    redirect('/dashboard/farmer')
  } else {
    redirect('/browse')
  }
}
