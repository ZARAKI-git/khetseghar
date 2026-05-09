import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/'
  const error_description = searchParams.get('error_description')

  // Handle error from Supabase
  if (error_description) {
    console.log('[v0] Auth callback error:', error_description)
    return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error_description)}`)
  }

  const supabase = await createClient()

  // Handle email confirmation with token_hash (email link flow)
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'recovery' | 'invite' | 'email',
    })
    
    if (!error) {
      // Get user profile to determine redirect
      const { data: { user } } = await supabase.auth.getUser()
      const userType = user?.user_metadata?.user_type
      
      if (userType === 'farmer') {
        return NextResponse.redirect(`${origin}/dashboard/farmer`)
      }
      return NextResponse.redirect(`${origin}/browse`)
    }
    
    console.log('[v0] Token verification error:', error.message)
    return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error.message)}`)
  }

  // Handle OAuth/magic link with code (PKCE flow)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Get user profile to determine redirect
      const { data: { user } } = await supabase.auth.getUser()
      const userType = user?.user_metadata?.user_type
      
      if (userType === 'farmer') {
        return NextResponse.redirect(`${origin}/dashboard/farmer`)
      }
      return NextResponse.redirect(`${origin}/browse`)
    }
    
    console.log('[v0] Code exchange error:', error.message)
    return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent(error.message)}`)
  }

  // No code or token_hash provided
  return NextResponse.redirect(`${origin}/auth/error?message=${encodeURIComponent('Missing authentication parameters')}`)
}
