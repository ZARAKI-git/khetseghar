import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Razorpay from 'razorpay'

export async function POST(request: NextRequest) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })
    const supabase = await createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { listingId, quantity, deliveryAddress, deliveryCity, deliveryState, deliveryPincode, deliveryPhone } = await request.json()

    // Get listing details
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('*, farmer:profiles!farmer_id(*)')
      .eq('id', listingId)
      .single()

    if (listingError || !listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Check quantity availability
    if (quantity > listing.quantity_available) {
      return NextResponse.json({ error: 'Insufficient quantity available' }, { status: 400 })
    }

    if (quantity < listing.min_order_quantity) {
      return NextResponse.json({ error: `Minimum order quantity is ${listing.min_order_quantity} ${listing.unit}` }, { status: 400 })
    }

    const totalAmount = Number(listing.price_per_unit) * quantity
    const amountInPaise = Math.round(totalAmount * 100)

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        listingId,
        buyerId: user.id,
        farmerId: listing.farmer_id,
      },
    })

    // Create order in database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        farmer_id: listing.farmer_id,
        quantity,
        unit_price: listing.price_per_unit,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending',
        razorpay_order_id: razorpayOrder.id,
        delivery_address: deliveryAddress,
        delivery_city: deliveryCity,
        delivery_state: deliveryState,
        delivery_pincode: deliveryPincode,
        delivery_phone: deliveryPhone,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    return NextResponse.json({
      orderId: order.id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (error) {
    console.error('Razorpay order creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
