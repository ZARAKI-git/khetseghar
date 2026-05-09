'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import type { Language, Category, Listing, Profile } from '@/lib/types'
import { t, getCategoryName } from '@/lib/translations'
import { Search, Filter, MapPin, Leaf, Star, Loader2 } from 'lucide-react'

function BrowseContent() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get('category')
  const farmerParam = searchParams.get('farmer')
  
  const [lang, setLang] = useState<Language>('en')
  const [categories, setCategories] = useState<Category[]>([])
  const [listings, setListings] = useState<(Listing & { farmer: Profile })[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || 'all')
  const [selectedFarmer, setSelectedFarmer] = useState<string | null>(farmerParam)
  const [sortBy, setSortBy] = useState<string>('newest')
  const supabase = createClient()

  useEffect(() => {
    const savedLang = localStorage.getItem('khetseghar-lang') as Language
    if (savedLang && ['en', 'hi', 'pa'].includes(savedLang)) {
      setLang(savedLang)
    }
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name_en')
      if (categoriesData) setCategories(categoriesData)

      // Fetch listings with farmer info
      let query = supabase
        .from('listings')
        .select(`
          *,
          farmer:profiles!farmer_id(*),
          category:categories(*)
        `)
        .eq('is_active', true)
        .gt('quantity_available', 0)

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory)
      }

      if (searchQuery) {
        query = query.ilike('title', `%${searchQuery}%`)
      }
      
      if (selectedFarmer) {
        query = query.eq('farmer_id', selectedFarmer)
      }

      // Sort
      switch (sortBy) {
        case 'price-low':
          query = query.order('price_per_unit', { ascending: true })
          break
        case 'price-high':
          query = query.order('price_per_unit', { ascending: false })
          break
        case 'newest':
        default:
          query = query.order('created_at', { ascending: false })
      }

      const { data: listingsData } = await query
      if (listingsData) setListings(listingsData as (Listing & { farmer: Profile })[])
      
      setLoading(false)
    }

    fetchData()
  }, [supabase, selectedCategory, searchQuery, sortBy, selectedFarmer])

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem('khetseghar-lang', newLang)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header lang={lang} onLanguageChange={handleLanguageChange} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-6">{t('browse', lang)}</h1>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('search', lang) + '...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder={t('categories', lang)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allCategories', lang)}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {getCategoryName(cat, lang)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder={t('sort', lang)} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="whitespace-nowrap"
            >
              {getCategoryName(cat, lang)}
            </Button>
          ))}
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">{t('noResults', lang)}</p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setSearchQuery('')
              setSelectedCategory('all')
              setSelectedFarmer(null)
            }}>
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <Link key={listing.id} href={`/listing/${listing.id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer h-full">
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Leaf className="h-12 w-12 text-primary/40" />
                      </div>
                    )}
                    {listing.is_organic && (
                      <Badge className="absolute top-2 left-2 bg-primary">
                        <Leaf className="h-3 w-3 mr-1" />
                        Organic
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                      {listing.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {listing.location || listing.farmer?.city || 'India'}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-primary">
                          ₹{listing.price_per_unit}
                          <span className="text-sm font-normal text-muted-foreground">/{listing.unit}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {listing.quantity_available} {listing.unit} available
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-4 w-4 fill-accent text-accent" />
                        4.5
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <BrowseContent />
    </Suspense>
  )
}
