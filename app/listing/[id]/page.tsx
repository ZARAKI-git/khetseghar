'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import type { Language, Listing, Profile, Category, Review } from '@/lib/types'
import { t } from '@/lib/translations'
import { 
  ArrowLeft, 
  MapPin, 
  Leaf, 
  Star, 
  MessageCircle,
  ShoppingCart,
  Minus,
  Plus,
  Calendar,
  Loader2,
  User
} from 'lucide-react'

interface ListingDetailPageProps {
  params: Promise<{ id: string }>
}

export default function ListingDetailPage({ params }: ListingDetailPageProps) {
  const { id } = use(params)
  const [lang, setLang] = useState<Language>('en')
  const [listing, setListing] = useState<Listing & { farmer: Profile; category: Category } | null>(null)
  const [reviews, setReviews] = useState<(Review & { reviewer: Profile })[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [currentUser, setCurrentUser] = useState<{ id: string; user_type: string } | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
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
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, user_type')
          .eq('id', user.id)
          .single()
        if (profile) setCurrentUser(profile)
      }

      // Fetch listing
      const { data: listingData } = await supabase
        .from('listings')
        .select(`
          *,
          farmer:profiles!farmer_id(*),
          category:categories(*)
        `)
        .eq('id', id)
        .single()

      if (listingData) {
        setListing(listingData as Listing & { farmer: Profile; category: Category })
        setQuantity(Math.max(1, listingData.min_order_quantity || 1))
      }

      // Fetch reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select(`*, reviewer:profiles!reviewer_id(*)`)
        .eq('listing_id', id)
        .order('created_at', { ascending: false })

      if (reviewsData) setReviews(reviewsData as (Review & { reviewer: Profile })[])

      setLoading(false)
    }

    fetchData()
  }, [supabase, id])

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem('khetseghar-lang', newLang)
  }

  const handleStartChat = async () => {
    if (!currentUser || !listing) {
      router.push('/auth/login')
      return
    }

    // Create or get conversation
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .eq('farmer_id', listing.farmer_id)
      .eq('buyer_id', currentUser.id)
      .eq('listing_id', listing.id)
      .single()

    if (existingConv) {
      router.push(`/messages/${existingConv.id}`)
    } else {
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
          farmer_id: listing.farmer_id,
          buyer_id: currentUser.id,
          listing_id: listing.id,
        })
        .select('id')
        .single()

      if (newConv) {
        router.push(`/messages/${newConv.id}`)
      }
    }
  }

  const handleBuyNow = () => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    router.push(`/checkout?listing=${listing?.id}&quantity=${quantity}`)
  }

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

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
          <p className="text-lg text-muted-foreground">Listing not found</p>
          <Button asChild className="mt-4">
            <Link href="/browse">Browse Products</Link>
          </Button>
        </div>
      </div>
    )
  }

  const totalPrice = listing.price_per_unit * quantity

  return (
    <div className="min-h-screen bg-background">
      <Header lang={lang} onLanguageChange={handleLanguageChange} />
      
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/browse">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Browse
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden bg-muted">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={listing.images[selectedImage]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Leaf className="h-20 w-20 text-muted-foreground" />
                </div>
              )}
            </div>
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {listing.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === i ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`${listing.title} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">{listing.category?.name_en}</Badge>
                {listing.is_organic && (
                  <Badge className="bg-primary">
                    <Leaf className="h-3 w-3 mr-1" />
                    Organic
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{listing.title}</h1>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {listing.location || listing.farmer?.city || 'India'}
                </span>
                {reviews.length > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    {averageRating.toFixed(1)} ({reviews.length} reviews)
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="p-6 rounded-xl bg-card border border-border">
              <p className="text-4xl font-bold text-primary mb-1">
                ₹{listing.price_per_unit}
                <span className="text-lg font-normal text-muted-foreground">/{listing.unit}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                {listing.quantity_available} {listing.unit} available
                {listing.min_order_quantity > 1 && ` • Min. order: ${listing.min_order_quantity} ${listing.unit}`}
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(listing.min_order_quantity || 1, quantity - 1))}
                  disabled={quantity <= (listing.min_order_quantity || 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(listing.min_order_quantity || 1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.min(listing.quantity_available, quantity + 1))}
                  disabled={quantity >= listing.quantity_available}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">{listing.unit}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <span className="font-medium">Total:</span>
              <span className="text-2xl font-bold text-primary">₹{totalPrice.toLocaleString()}</span>
            </div>

            {/* Actions */}
            {currentUser?.id !== listing.farmer_id && (
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={handleStartChat}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t('chatWithFarmer', lang)}
                </Button>
                <Button className="flex-1" onClick={handleBuyNow}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {t('orderNow', lang)}
                </Button>
              </div>
            )}

            {/* Description */}
            {listing.description && (
              <div>
                <h3 className="font-semibold text-foreground mb-2">{t('description', lang)}</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}

            {/* Harvest Date */}
            {listing.harvest_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Harvested: {new Date(listing.harvest_date).toLocaleDateString()}
              </div>
            )}

            {/* Farmer Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Sold by</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={listing.farmer?.avatar_url || ''} />
                    <AvatarFallback>
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{listing.farmer?.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {listing.farmer?.city}, {listing.farmer?.state}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleStartChat}>
                    Contact
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reviews Section */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Reviews ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No reviews yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reviews.map((review) => (
                <Card key={review.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <Avatar>
                        <AvatarImage src={review.reviewer?.avatar_url || ''} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-foreground">{review.reviewer?.full_name}</p>
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating
                                  ? 'fill-accent text-accent'
                                  : 'text-muted-foreground'
                              }`}
                            />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-muted-foreground">{review.comment}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
