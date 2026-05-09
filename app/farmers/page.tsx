'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import {
  Search,
  MapPin,
  Leaf,
  Loader2,
  User,
  Phone,
  MessageCircle,
  ArrowRight,
  X,
  SlidersHorizontal,
} from 'lucide-react'

// ──────────────────────────────────────────────
// Indian States list
// ──────────────────────────────────────────────
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu & Kashmir', 'Ladakh', 'Chandigarh', 'Puducherry',
]

interface FarmerWithListingCount extends Profile {
  listing_count?: number
}

export default function FarmerSearchPage() {
  const supabase = createClient()

  // ── search fields ──
  const [state, setState] = useState('')
  const [city, setCity] = useState('')
  const [pincode, setPincode] = useState('')
  const [nameQuery, setNameQuery] = useState('')

  // ── results ──
  const [farmers, setFarmers] = useState<FarmerWithListingCount[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  // ── state suggestions ──
  const [showStateSuggestions, setShowStateSuggestions] = useState(false)
  const filteredStates = INDIAN_STATES.filter((s) =>
    s.toLowerCase().includes(state.toLowerCase())
  )

  // ──────────────────────────────────────────────
  // Core search function
  // ──────────────────────────────────────────────
  const handleSearch = useCallback(async () => {
    setLoading(true)
    setSearched(true)

    let query = supabase
      .from('profiles')
      .select('*')
      .eq('user_type', 'farmer')

    if (state.trim()) {
      query = query.ilike('state', `%${state.trim()}%`)
    }
    if (city.trim()) {
      query = query.ilike('city', `%${city.trim()}%`)
    }
    if (pincode.trim()) {
      query = query.ilike('pincode', `%${pincode.trim()}%`)
    }
    if (nameQuery.trim()) {
      query = query.ilike('full_name', `%${nameQuery.trim()}%`)
    }

    const { data, error } = await query.order('full_name')

    if (error) {
      console.error('Farmer search error:', error)
      setFarmers([])
      setLoading(false)
      return
    }

    // Enrich with active listing counts
    const enriched: FarmerWithListingCount[] = await Promise.all(
      (data || []).map(async (farmer) => {
        const { count } = await supabase
          .from('listings')
          .select('*', { count: 'exact', head: true })
          .eq('farmer_id', farmer.id)
          .eq('is_active', true)
          .gt('quantity_available', 0)
        return { ...farmer, listing_count: count ?? 0 }
      })
    )

    setFarmers(enriched)
    setLoading(false)
  }, [supabase, state, city, pincode, nameQuery])

  // ──────────────────────────────────────────────
  // Clear all filters
  // ──────────────────────────────────────────────
  const handleClear = () => {
    setState('')
    setCity('')
    setPincode('')
    setNameQuery('')
    setFarmers([])
    setSearched(false)
  }

  const hasFilters = state || city || pincode || nameQuery

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-10 max-w-5xl">

        {/* ── Page Heading ── */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-primary text-sm font-medium mb-2">
            <MapPin className="h-4 w-4" />
            Find Farmers by Location
          </div>
          <h1 className="text-3xl font-bold text-foreground">Search Farmers Near You</h1>
          <p className="text-muted-foreground mt-1">
            Filter by state, city/district, or PIN code to find farmers in your area.
          </p>
        </div>

        {/* ── Search Card ── */}
        <Card className="mb-8 border-primary/20 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-foreground">
              <SlidersHorizontal className="h-4 w-4 text-primary" />
              Filter Farmers
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">

              {/* Farmer Name */}
              <div className="relative">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  Farmer Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g. Gurpreet Singh"
                    value={nameQuery}
                    onChange={(e) => setNameQuery(e.target.value)}
                    className="pl-9"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              {/* State */}
              <div className="relative">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  State
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g. Punjab"
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value)
                      setShowStateSuggestions(true)
                    }}
                    onFocus={() => setShowStateSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowStateSuggestions(false), 150)}
                    className="pl-9"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  {/* State autocomplete dropdown */}
                  {showStateSuggestions && state && filteredStates.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {filteredStates.slice(0, 8).map((s) => (
                        <button
                          key={s}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                          onMouseDown={() => {
                            setState(s)
                            setShowStateSuggestions(false)
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* City / District */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  City / District
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g. Ludhiana"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="pl-9"
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>

              {/* PIN Code */}
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">
                  PIN Code
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="e.g. 141001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="pl-9"
                    maxLength={6}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={handleSearch} disabled={loading} className="px-8">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {loading ? 'Searching...' : 'Search Farmers'}
              </Button>
              {hasFilters && (
                <Button variant="outline" onClick={handleClear}>
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Results ── */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {!loading && searched && farmers.length === 0 && (
          <div className="text-center py-20">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-semibold text-foreground">No farmers found</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Try a different state, city, or PIN code.
            </p>
            <Button variant="outline" className="mt-5" onClick={handleClear}>
              Reset Search
            </Button>
          </div>
        )}

        {!loading && farmers.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Found <span className="font-semibold text-foreground">{farmers.length}</span> farmer{farmers.length !== 1 ? 's' : ''} in your search area
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {farmers.map((farmer) => (
                <FarmerCard key={farmer.id} farmer={farmer} />
              ))}
            </div>
          </>
        )}

        {/* ── Empty (not yet searched) ── */}
        {!loading && !searched && (
          <div className="text-center py-20 text-muted-foreground">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-primary/50" />
            </div>
            <p className="font-medium">Enter a location above to find farmers</p>
            <p className="text-sm mt-1">You can search by state, city, PIN code, or farmer name.</p>
          </div>
        )}
      </main>
    </div>
  )
}

// ──────────────────────────────────────────────
// Farmer Card Component
// ──────────────────────────────────────────────
function FarmerCard({ farmer }: { farmer: FarmerWithListingCount }) {
  const initials = farmer.full_name
    ? farmer.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const locationParts = [farmer.city, farmer.state].filter(Boolean)

  return (
    <Card className="hover:shadow-md transition-shadow border-border overflow-hidden">
      <CardContent className="p-5">
        {/* Avatar + Name */}
        <div className="flex items-center gap-3 mb-4">
          {farmer.avatar_url ? (
            <img
              src={farmer.avatar_url}
              alt={farmer.full_name}
              className="h-12 w-12 rounded-full object-cover border border-border"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
              {initials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground truncate">{farmer.full_name}</p>
            {locationParts.length > 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{locationParts.join(', ')}</span>
              </p>
            )}
          </div>
        </div>

        {/* Location Details */}
        <div className="space-y-1.5 mb-4">
          {farmer.pincode && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/70">PIN:</span>
              <Badge variant="secondary" className="text-xs font-mono px-2 py-0">
                {farmer.pincode}
              </Badge>
            </div>
          )}
          {farmer.address && (
            <p className="text-xs text-muted-foreground line-clamp-2 flex items-start gap-1">
              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0" />
              {farmer.address}
            </p>
          )}
        </div>

        {/* Active Listings Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{farmer.listing_count}</span> active listing{farmer.listing_count !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button asChild size="sm" className="flex-1 text-xs">
            <Link href={`/browse?farmer=${farmer.id}`}>
              View Products
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="text-xs px-3">
            <Link href={`/messages?farmer=${farmer.id}`}>
              <MessageCircle className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
