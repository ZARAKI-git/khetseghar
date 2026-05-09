'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/header'
import type { Profile } from '@/lib/types'
import {
  ShoppingBag,
  MessageCircle,
  Search,
  Leaf,
  ArrowRight,
  MapPin,
  Clock,
  Star,
  Wheat,
  Carrot,
  Apple,
  Bean,
  Milk,
  Droplet,
  Truck,
  BadgeCheck,
  Sparkles,
  Users,
} from 'lucide-react'

interface BuyerHomeProps {
  profile: Profile
}

const quickCategories = [
  { label: 'Vegetables', icon: <Carrot className="h-6 w-6" />, color: 'bg-orange-50 text-orange-600 border-orange-100', href: '/browse?category=vegetables' },
  { label: 'Grains', icon: <Wheat className="h-6 w-6" />, color: 'bg-yellow-50 text-yellow-600 border-yellow-100', href: '/browse?category=grains' },
  { label: 'Fruits', icon: <Apple className="h-6 w-6" />, color: 'bg-red-50 text-red-600 border-red-100', href: '/browse?category=fruits' },
  { label: 'Pulses', icon: <Bean className="h-6 w-6" />, color: 'bg-green-50 text-green-600 border-green-100', href: '/browse?category=pulses' },
  { label: 'Dairy', icon: <Milk className="h-6 w-6" />, color: 'bg-blue-50 text-blue-600 border-blue-100', href: '/browse?category=dairy' },
  { label: 'Oils', icon: <Droplet className="h-6 w-6" />, color: 'bg-amber-50 text-amber-600 border-amber-100', href: '/browse?category=oils' },
]

const whyBuy = [
  {
    icon: <Leaf className="h-5 w-5 text-primary" />,
    title: 'Farm-Fresh Quality',
    desc: 'Direct from the field — no cold storage, no middlemen, no compromises.',
  },
  {
    icon: <BadgeCheck className="h-5 w-5 text-primary" />,
    title: 'Verified Farmers',
    desc: 'Every seller on KhetSeGhar is verified so you know exactly who grew your food.',
  },
  {
    icon: <Truck className="h-5 w-5 text-primary" />,
    title: 'Doorstep Delivery',
    desc: 'Fresh produce delivered to your door. Track your order in real time.',
  },
  {
    icon: <Star className="h-5 w-5 text-primary" />,
    title: 'Fair Prices',
    desc: 'Cutting out the middlemen means better prices for you and better income for farmers.',
  },
]

export function BuyerHome({ profile }: BuyerHomeProps) {
  const firstName = profile.full_name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      {/* Hero / Welcome Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/8 via-background to-accent/15 py-14 lg:py-20">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 -left-16 h-56 w-56 rounded-full bg-accent/20 blur-2xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl">
            {/* Greeting pill */}
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              {greeting}, {firstName}!
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              What fresh produce are you{' '}
              <span className="text-primary">looking for today?</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl">
              Browse thousands of listings from verified farmers near you. Fresh, affordable, and straight from the source.
            </p>

            {/* Search CTA */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="text-base px-8 shadow-sm">
                <Link href="/browse">
                  <Search className="mr-2 h-4 w-4" />
                  Browse All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base">
                <Link href="/orders">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  My Orders
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Category Access */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-foreground">Shop by Category</h2>
          <Link href="/browse" className="text-sm text-primary hover:underline flex items-center gap-1">
            All categories <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {quickCategories.map((cat) => (
            <Link
              key={cat.label}
              href={cat.href}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-4 transition-all hover:scale-105 hover:shadow-md ${cat.color}`}
            >
              {cat.icon}
              <span className="text-xs font-semibold text-center leading-tight">{cat.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="py-4 container mx-auto px-4">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Discover Produce</p>
                <p className="text-xs text-muted-foreground mt-0.5">Fresh listings added daily</p>
                <Link href="/browse" className="text-xs text-primary font-medium mt-1 inline-flex items-center gap-1">
                  Browse now <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* ── NEW: Find Farmers Card ── */}
          <Card className="border-green-200 bg-green-50/60 hover:bg-green-50 transition-colors">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Find Farmers</p>
                <p className="text-xs text-muted-foreground mt-0.5">Search by state, city or PIN</p>
                <Link href="/farmers" className="text-xs text-green-600 font-medium mt-1 inline-flex items-center gap-1">
                  Search now <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:bg-muted/40 transition-colors">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">My Messages</p>
                <p className="text-xs text-muted-foreground mt-0.5">Chat with farmers directly</p>
                <Link href="/messages" className="text-xs text-blue-600 font-medium mt-1 inline-flex items-center gap-1">
                  Open inbox <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:bg-muted/40 transition-colors">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Order History</p>
                <p className="text-xs text-muted-foreground mt-0.5">Track & manage your orders</p>
                <Link href="/orders" className="text-xs text-amber-600 font-medium mt-1 inline-flex items-center gap-1">
                  View orders <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Why Buy Section */}
      <section className="py-14 mt-4 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <h2 className="text-xl font-bold text-foreground mb-8 text-center">Why buy on KhetSeGhar?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whyBuy.map((item, i) => (
              <div key={i} className="flex flex-col items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Local produce nudge */}
      <section className="py-12 container mx-auto px-4">
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-accent/20 p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <MapPin className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Find Farmers Near You</h3>
              <p className="text-sm text-muted-foreground">Support local agriculture and get the freshest produce.</p>
            </div>
          </div>
          <Button asChild size="lg" className="flex-shrink-0">
            <Link href="/farmers">
              Search Local Farmers
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-card border-t border-border">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <Leaf className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground">KhetSeGhar</span>
          </Link>
          <p className="text-xs text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} KhetSeGhar. Connecting farmers &amp; buyers across India.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/help" className="hover:text-foreground">Help</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
