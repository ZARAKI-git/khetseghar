'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { createClient } from '@/lib/supabase/client'
import type { Language, Order, Listing, Profile } from '@/lib/types'
import { t } from '@/lib/translations'
import { 
  ShoppingBag, 
  MessageCircle, 
  Eye,
  Loader2,
  Leaf,
  Star
} from 'lucide-react'

type OrderWithRelations = Order & { listing: Listing; farmer: Profile; buyer: Profile }

export default function OrdersPage() {
  const [lang, setLang] = useState<Language>('en')
  const [orders, setOrders] = useState<OrderWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [userType, setUserType] = useState<'farmer' | 'buyer'>('buyer')
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

      // Get user type
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user.id)
        .single()
      
      if (profile) setUserType(profile.user_type as 'farmer' | 'buyer')

      // Fetch orders based on user type
      const column = profile?.user_type === 'farmer' ? 'farmer_id' : 'buyer_id'
      const { data: ordersData } = await supabase
        .from('orders')
        .select(`
          *,
          listing:listings(*),
          farmer:profiles!farmer_id(*),
          buyer:profiles!buyer_id(*)
        `)
        .eq(column, user.id)
        .order('created_at', { ascending: false })

      if (ordersData) setOrders(ordersData as OrderWithRelations[])
      setLoading(false)
    }

    fetchData()
  }, [supabase, router])

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem('khetseghar-lang', newLang)
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

  const activeOrders = orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status))
  const completedOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status))

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

  const OrderCard = ({ order }: { order: OrderWithRelations }) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Product Image */}
          <div className="w-full md:w-24 h-24 rounded-lg bg-muted overflow-hidden flex-shrink-0">
            {order.listing?.images && order.listing.images.length > 0 ? (
              <img
                src={order.listing.images[0]}
                alt={order.listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Leaf className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          
          {/* Order Details */}
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
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
              <div>
                <p className="text-muted-foreground">
                  {userType === 'farmer' ? 'Buyer' : 'Seller'}
                </p>
                <p className="font-medium">
                  {userType === 'farmer' ? order.buyer?.full_name : order.farmer?.full_name}
                </p>
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

            {/* Delivery Address */}
            {order.delivery_address && (
              <div className="mt-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Delivery: </span>
                {order.delivery_address}, {order.delivery_city}, {order.delivery_state} - {order.delivery_pincode}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex md:flex-col gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/listing/${order.listing_id}`}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/messages?user=${userType === 'farmer' ? order.buyer_id : order.farmer_id}`}>
                <MessageCircle className="h-4 w-4 mr-1" />
                Chat
              </Link>
            </Button>
            {order.status === 'delivered' && order.payment_status === 'paid' && userType === 'buyer' && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/review/${order.id}`}>
                  <Star className="h-4 w-4 mr-1" />
                  Review
                </Link>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-background">
      <Header lang={lang} onLanguageChange={handleLanguageChange} />
      
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t('myOrders', lang)}</h1>

        {orders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No orders yet</p>
              <p className="text-muted-foreground mb-4">
                {userType === 'buyer' 
                  ? 'Start shopping to see your orders here'
                  : 'Orders from buyers will appear here'
                }
              </p>
              {userType === 'buyer' && (
                <Button asChild>
                  <Link href="/browse">Browse Products</Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <Tabs defaultValue="active" className="space-y-6">
            <TabsList>
              <TabsTrigger value="active">
                Active ({activeOrders.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedOrders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeOrders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No active orders</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {activeOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedOrders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No completed orders</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {completedOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  )
}
