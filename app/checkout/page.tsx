'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field'
import { createClient } from '@/lib/supabase/client'
import type { Language, Listing, Profile } from '@/lib/types'
import { t } from '@/lib/translations'
import { ArrowLeft, Loader2, CreditCard, Leaf } from 'lucide-react'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const listingId = searchParams.get('listing')
  const quantityParam = searchParams.get('quantity')

  const [lang, setLang] = useState<Language>('en')
  const [listing, setListing] = useState<Listing & { farmer: Profile } | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [quantity, setQuantity] = useState(parseInt(quantityParam || '1'))
  
  // Delivery info
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryCity, setDeliveryCity] = useState('')
  const [deliveryState, setDeliveryState] = useState('')
  const [deliveryPincode, setDeliveryPincode] = useState('')
  const [deliveryPhone, setDeliveryPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const savedLang = localStorage.getItem('khetseghar-lang') as Language
    if (savedLang && ['en', 'hi', 'pa'].includes(savedLang)) {
      setLang(savedLang)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profileData) {
        setProfile(profileData)
        setDeliveryAddress(profileData.address || '')
        setDeliveryCity(profileData.city || '')
        setDeliveryState(profileData.state || '')
        setDeliveryPincode(profileData.pincode || '')
        setDeliveryPhone(profileData.phone || '')
      }

      // Fetch listing
      if (listingId) {
        const { data: listingData } = await supabase
          .from('listings')
          .select(`*, farmer:profiles!farmer_id(*)`)
          .eq('id', listingId)
          .single()
        
        if (listingData) setListing(listingData as Listing & { farmer: Profile })
      }

      setLoading(false)
    }

    fetchData()
  }, [supabase, router, listingId])

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem('khetseghar-lang', newLang)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (!listing || !profile) {
      setError('Missing required data')
      setSubmitting(false)
      return
    }

    const totalAmount = listing.price_per_unit * quantity

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        listing_id: listing.id,
        buyer_id: profile.id,
        farmer_id: listing.farmer_id,
        quantity,
        unit_price: listing.price_per_unit,
        total_amount: totalAmount,
        delivery_address: deliveryAddress,
        delivery_city: deliveryCity,
        delivery_state: deliveryState,
        delivery_pincode: deliveryPincode,
        delivery_phone: deliveryPhone,
        notes,
        status: 'pending',
        payment_status: 'pending',
      })
      .select('id')
      .single()

    if (orderError) {
      setError(orderError.message)
      setSubmitting(false)
      return
    }

    // Redirect to payment page
    router.push(`/payment/${order.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header lang={lang} onLanguageChange={handleLanguageChange} />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-background">
        <Header lang={lang} onLanguageChange={handleLanguageChange} />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-lg text-muted-foreground">Product not found</p>
          <Button asChild className="mt-4">
            <Link href="/browse">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  const totalAmount = listing.price_per_unit * quantity

  return (
    <div className="min-h-screen bg-background">
      <Header lang={lang} onLanguageChange={handleLanguageChange} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/listing/${listing.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Product
          </Link>
        </Button>

        <h1 className="text-3xl font-bold text-foreground mb-8">{t('checkout', lang)}</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Delivery Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} id="checkout-form">
                  <FieldGroup>
                    <Field>
                      <FieldLabel htmlFor="address">Delivery Address *</FieldLabel>
                      <Textarea
                        id="address"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Full address"
                        required
                        rows={3}
                      />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="city">City *</FieldLabel>
                        <Input
                          id="city"
                          value={deliveryCity}
                          onChange={(e) => setDeliveryCity(e.target.value)}
                          placeholder="City"
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="state">State *</FieldLabel>
                        <Input
                          id="state"
                          value={deliveryState}
                          onChange={(e) => setDeliveryState(e.target.value)}
                          placeholder="State"
                          required
                        />
                      </Field>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <FieldLabel htmlFor="pincode">Pincode *</FieldLabel>
                        <Input
                          id="pincode"
                          value={deliveryPincode}
                          onChange={(e) => setDeliveryPincode(e.target.value)}
                          placeholder="110001"
                          required
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="phone">Phone Number *</FieldLabel>
                        <Input
                          id="phone"
                          type="tel"
                          value={deliveryPhone}
                          onChange={(e) => setDeliveryPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          required
                        />
                      </Field>
                    </div>
                    <Field>
                      <FieldLabel htmlFor="notes">Order Notes (Optional)</FieldLabel>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Any special instructions for delivery..."
                        rows={2}
                      />
                    </Field>
                  </FieldGroup>

                  {error && (
                    <div className="mt-4 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                      {error}
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Product */}
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Leaf className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground line-clamp-2">{listing.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {quantity} {listing.unit} x ₹{listing.price_per_unit}
                    </p>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-primary">To be calculated</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  form="checkout-form" 
                  className="w-full" 
                  size="lg"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Payment
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By placing this order, you agree to our terms and conditions
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}
