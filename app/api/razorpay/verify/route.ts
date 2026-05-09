import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      orderId 
    } = await request.json()

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      // Update order as failed
      await supabase
        .from('orders')
        .update({ payment_status: 'failed' })
        .eq('id', orderId)

      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Update order as paid
    const { data: order, error: updateError } = await supabase
      .from('orders')
      .update({ 
        payment_status: 'paid',
        status: 'confirmed',
        razorpay_payment_id,
      })
      .eq('id', orderId)
      .select('*, listing:listings(*)')
      .single()

    if (updateError) {
      console.error('Order update error:', updateError)
      return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
    }

    // Update listing quantity
    if (order?.listing) {
      const newQuantity = Number(order.listing.quantity_available) - Number(order.quantity)
      await supabase
        .from('listings')
        .update({ 
          quantity_available: newQuantity,
          is_active: newQuantity > 0,
        })
        .eq('id', order.listing_id)
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order?.id,
      message: 'Payment verified successfully' 
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
