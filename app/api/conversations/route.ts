import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { farmerId, listingId } = await request.json()

    // Get current user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Determine buyer_id and farmer_id based on user type
    const buyerId = profile.user_type === 'buyer' ? user.id : farmerId
    const actualFarmerId = profile.user_type === 'farmer' ? user.id : farmerId

    // Check if conversation already exists
    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .eq('farmer_id', actualFarmerId)
      .eq('buyer_id', buyerId)
      .eq('listing_id', listingId)
      .single()

    if (existingConversation) {
      return NextResponse.json({ conversationId: existingConversation.id })
    }

    // Create new conversation
    const { data: newConversation, error } = await supabase
      .from('conversations')
      .insert({
        farmer_id: actualFarmerId,
        buyer_id: buyerId,
        listing_id: listingId,
      })
      .select()
      .single()

    if (error) {
      console.error('Conversation creation error:', error)
      return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
    }

    return NextResponse.json({ conversationId: newConversation.id })
  } catch (error) {
    console.error('Conversation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
