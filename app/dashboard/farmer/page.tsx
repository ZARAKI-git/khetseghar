'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import type { Language, Profile, Listing, Order, Category } from '@/lib/types'
import { t } from '@/lib/translations'
import { 
  Plus, 
  Package, 
  ShoppingBag, 
  IndianRupee, 
  TrendingUp,
  Edit,
  Trash2,
  Eye,
  MessageCircle,
  Loader2,
  Leaf
} from 'lucide-react'

export default function FarmerDashboard() {
  const [lang, setLang] = useState<Language>('en')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [listings, setListings] = useState<(Listing & { category: Category })[]>([])
  const [orders, setOrders] = useState<(Order & { listing: Listing; buyer: Profile })[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalListings: 0,
    activeOrders: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
  })
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
      // Use getSession first - it's more reliable for checking auth state
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.user) {
        // Give a small delay and retry once - cookies might still be syncing
        await new Promise(resolve => setTimeout(resolve, 500))
        const { data: { session: retrySession } } = await supabase.auth.getSession()
        
        if (!retrySession?.user) {
          router.push('/auth/login')
          return
        }
      }

      const user = session?.user || (await supabase.auth.getSession()).data.session?.user
      
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

      // If no profile exists, create one
      if (!profileData) {
        const userType = user.user_metadata?.user_type || 'buyer'
        await supabase.from('profiles').upsert({
          id: user.id,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          user_type: userType,
          phone: user.user_metadata?.phone || null,
        })
        
        if (userType !== 'farmer') {
          router.push('/browse')
          return
        }
        
        setProfile({
          id: user.id,
          full_name: user.user_metadata?.full_name || '',
          user_type: userType,
          phone: user.user_metadata?.phone || null,
        } as Profile)
      } else if (profileData.user_type !== 'farmer') {
        router.push('/browse')
        return
      } else {
        setProfile(profileData)
      }

      // Fetch farmer's listings
      const { data: listingsData } = await supabase
        .from('listings')
        .select(`*, category:categories(*)`)
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false })
      
      if (listingsData) setListings(listingsData as (Listing & { category: Category })[])

      // Fetch orders for this farmer
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`*, listing:listings(*), buyer:profiles!buyer_id(*)`)
        .eq('farmer_id', user.id)
        .order('created_at', { ascending: false })
      
      if (ordersData) setOrders(ordersData as (Order & { listing: Listing; buyer: Profile })[])

      // Calculate stats
      const totalListings = listingsData?.length || 0
      const activeOrders = ordersData?.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)).length || 0
      const deliveredOrders = ordersData?.filter(o => o.status === 'delivered' && o.payment_status === 'paid') || []
      const totalEarnings = deliveredOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)
      
      // Monthly earnings (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const monthlyOrders = deliveredOrders.filter(o => new Date(o.created_at) > thirtyDaysAgo)
      const monthlyEarnings = monthlyOrders.reduce((sum, o) => sum + Number(o.total_amount), 0)

      setStats({ totalListings, activeOrders, totalEarnings, monthlyEarnings })
      setLoading(false)
    }

    fetchData()
  }, [supabase, router])

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem('khetseghar-lang', newLang)
  }

  const handleDeleteListing = async (listingId: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return

    await supabase.from('listings').delete().eq('id', listingId)
    setListings(listings.filter(l => l.id !== listingId))
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    await supabase
      .from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    setOrders(orders.map(o => 
      o.id === orderId ? { ...o, status: newStatus as Order['status'] } : o
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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

  return (
    <div className="min-h-screen bg-background">
      <Header lang={lang} onLanguageChange={handleLanguageChange} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {t('dashboard', lang)}
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {profile?.full_name}!
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/farmer/listing/new">
              <Plus className="h-4 w-4 mr-2" />
              {t('addListing', lang)}
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('myListings', lang)}</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalListings}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Orders</p>
                  <p className="text-2xl font-bold text-foreground">{stats.activeOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <IndianRupee className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('totalSales', lang)}</p>
                  <p className="text-2xl font-bold text-foreground">₹{stats.totalEarnings.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-accent/50 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">This Month</p>
                  <p className="text-2xl font-bold text-foreground">₹{stats.monthlyEarnings.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Listings and Orders */}
        <Tabs defaultValue="listings" className="space-y-6">
          <TabsList>
            <TabsTrigger value="listings">{t('myListings', lang)}</TabsTrigger>
            <TabsTrigger value="orders">{t('orders', lang)}</TabsTrigger>
          </TabsList>

          <TabsContent value="listings">
            {listings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">No listings yet</p>
                  <p className="text-muted-foreground mb-4">Start selling by adding your first listing</p>
                  <Button asChild>
                    <Link href="/dashboard/farmer/listing/new">
                      <Plus className="h-4 w-4 mr-2" />
                      {t('addListing', lang)}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {listings.map((listing) => (
                  <Card key={listing.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="w-full md:w-32 h-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">
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
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-semibold text-foreground">{listing.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {listing.category?.name_en} • {listing.quantity_available} {listing.unit} available
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={listing.is_active ? 'default' : 'secondary'}>
                                {listing.is_active ? 'Active' : 'Inactive'}
                              </Badge>
                              {listing.is_organic && (
                                <Badge variant="outline" className="text-primary border-primary">
                                  <Leaf className="h-3 w-3 mr-1" />
                                  Organic
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-lg font-bold text-primary mt-2">
                            ₹{listing.price_per_unit}/{listing.unit}
                          </p>
                        </div>
                        <div className="flex md:flex-col gap-2 flex-shrink-0">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/listing/${listing.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/dashboard/farmer/listing/${listing.id}/edit`}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => handleDeleteListing(listing.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="orders">
            {orders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-lg font-medium text-foreground mb-2">No orders yet</p>
                  <p className="text-muted-foreground">Orders from buyers will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {order.listing?.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                Order #{order.id.slice(0, 8)} • {order.quantity} {order.listing?.unit}
                              </p>
                            </div>
                            <Badge className={getStatusColor(order.status)}>
                              {t(order.status, lang)}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Buyer</p>
                              <p className="font-medium">{order.buyer?.full_name}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Amount</p>
                              <p className="font-bold text-primary">₹{order.total_amount}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Payment</p>
                              <p className={order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}>
                                {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Date</p>
                              <p>{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex md:flex-col gap-2 flex-shrink-0">
                          {order.status === 'pending' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateOrderStatus(order.id, 'confirmed')}
                            >
                              Confirm
                            </Button>
                          )}
                          {order.status === 'confirmed' && (
                            <Button 
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                            >
                              Mark Shipped
                            </Button>
                          )}
                          {order.status === 'shipped' && (
                            <Button 
                              size="sm"
                              onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                            >
                              Mark Delivered
                            </Button>
                          )}
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/messages?user=${order.buyer_id}`}>
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Chat
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
