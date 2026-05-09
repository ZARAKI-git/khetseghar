'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: 'Login failed. Please try again.' }
  }

  if (!data.session) {
    return { error: 'Please confirm your email address before logging in.' }
  }

  // Get user type from profile or metadata
  const { data: profile } = await supabase
    .from('profiles')
    .select('user_type')
    .eq('id', data.user.id)
    .single()

  const userType = profile?.user_type || data.user.user_metadata?.user_type || 'buyer'

  // Create profile if it doesn't exist
  if (!profile) {
    await supabase.from('profiles').upsert({
      id: data.user.id,
      full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || '',
      user_type: userType,
      phone: data.user.user_metadata?.phone || null,
    })
  }

  // Redirect based on user type
  if (userType === 'farmer') {
    redirect('/dashboard/farmer')
  } else {
    redirect('/browse')
  }
}
