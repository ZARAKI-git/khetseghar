'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { BuyerHome } from '../components/buyer-home'
import { FarmerHome } from '../components/farmer-home'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const supabase = createClient()


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Check profile table for user type
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()
          
          if (profile) {
            setProfile(profile as Profile)
          }
        }
      } catch (err) {
        console.error('Failed to fetch user:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [supabase])


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (profile?.user_type === 'farmer') {
    return <FarmerHome profile={profile} />
  }

  if (profile?.user_type === 'buyer') {
    return <BuyerHome profile={profile} />
  }

  // Not logged in — show the existing static landing page
  return (
    <iframe
      src={`/landing.html?url=${process.env.NEXT_PUBLIC_SUPABASE_URL}&key=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}&v=${Date.now()}`}
      style={{ width: '100%', height: '100vh', border: 'none' }}
      title="KhetSeGhar"
    />
  )
}
