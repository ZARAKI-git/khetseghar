'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Header } from '@/components/header'
import type { Language, Profile } from '@/lib/types'
import {
  Plus,
  Package,
  ShoppingBag,
  MessageCircle,
  TrendingUp,
  ArrowRight,
  Leaf,
  BookOpen,
  IndianRupee,
  Sprout,
  Sun,
  BarChart3,
  Sparkles,
} from 'lucide-react'

interface FarmerHomeProps {
  profile: Profile
}

const quickActions = [
  {
    icon: <Plus className="h-6 w-6" />,
    label: 'Add New Listing',
    desc: 'List your produce and start receiving orders',
    href: '/dashboard/farmer/listing/new',
    color: 'bg-primary text-primary-foreground',
    cardClass: 'border-primary/30 bg-primary/5 hover:bg-primary/10',
    linkColor: 'text-primary',
  },
  {
    icon: <Package className="h-6 w-6" />,
    label: 'My Listings',
    desc: 'View and manage all your active produce listings',
    href: '/dashboard/farmer',
    color: 'bg-green-600 text-white',
    cardClass: 'hover:bg-muted/40',
    linkColor: 'text-green-600',
  },
  {
    icon: <ShoppingBag className="h-6 w-6" />,
    label: 'Incoming Orders',
    desc: 'Track, confirm, and ship buyer orders',
    href: '/dashboard/farmer?tab=orders',
    color: 'bg-blue-600 text-white',
    cardClass: 'hover:bg-muted/40',
    linkColor: 'text-blue-600',
  },
  {
    icon: <MessageCircle className="h-6 w-6" />,
    label: 'Messages',
    desc: 'Chat with buyers interested in your produce',
    href: '/messages',
    color: 'bg-violet-600 text-white',
    cardClass: 'hover:bg-muted/40',
    linkColor: 'text-violet-600',
  },
]

const tips = [
  {
    icon: <Sun className="h-4 w-4 text-amber-500" />,
    title: 'Add harvest dates',
    body: 'Listings with harvest dates get 40% more buyer interest.',
  },
  {
    icon: <Sprout className="h-4 w-4 text-green-500" />,
    title: 'Mark organic produce',
    body: 'Organic-tagged listings command premium prices from buyers.',
  },
  {
    icon: <BarChart3 className="h-4 w-4 text-blue-500" />,
    title: 'Keep quantity updated',
    body: 'Accurate stock builds buyer trust and reduces cancellations.',
  },
]

export function FarmerHome({ profile }: FarmerHomeProps) {
  const firstName = profile.full_name?.split(' ')[0] || 'Farmer'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      {/* Hero — earthy, farmer-centric */}
      <section className="relative overflow-hidden py-14 lg:py-20">
        {/* Gradient with a warm earthy tone to differentiate from buyer's cooler palette */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 via-background to-primary/8" />
        <div className="pointer-events-none absolute -top-20 right-0 h-80 w-80 rounded-full bg-amber-100/60 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 rounded-full bg-primary/10 blur-2xl" />

        <div className="container mx-auto px-4 relative">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 border border-amber-200 px-4 py-1.5 text-sm font-medium text-amber-700 mb-5">
              <Sparkles className="h-3.5 w-3.5" />
              {greeting}, {firstName}!
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              Your farm, your{' '}
              <span className="text-primary">marketplace.</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl">
              Manage your listings, track orders, and connect directly with buyers — all in one place.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="text-base px-8 shadow-sm">
                <Link href="/dashboard/farmer/listing/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add a Listing
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base">
                <Link href="/dashboard/farmer">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  View Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="py-10 container mx-auto px-4">
        <h2 className="text-xl font-bold text-foreground mb-6">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Card key={action.label} className={`transition-all hover:shadow-md ${action.cardClass}`}>
              <CardContent className="p-5 flex flex-col gap-3">
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${action.color}`}>
                  {action.icon}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                </div>
                <Link
                  href={action.href}
                  className={`text-xs font-medium inline-flex items-center gap-1 mt-auto ${action.linkColor}`}
                >
                  Go <ArrowRight className="h-3 w-3" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Full Dashboard Banner */}
      <section className="py-4 container mx-auto px-4">
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-accent/15 border border-primary/20 p-6 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <IndianRupee className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Your Earnings Dashboard</h3>
              <p className="text-sm text-muted-foreground">
                Track total sales, monthly earnings, and order analytics.
              </p>
            </div>
          </div>
          <Button asChild size="lg" className="flex-shrink-0">
            <Link href="/dashboard/farmer">
              Open Full Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Seller Tips */}
      <section className="py-12 mt-4 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Tips to Sell More</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {tips.map((tip, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                  {tip.icon}
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{tip.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{tip.body}</p>
                </div>
              </div>
            ))}
          </div>
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
            &copy; {new Date().getFullYear()} KhetSeGhar. Empowering farmers across India.
          </p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link href="/help/farmers" className="hover:text-foreground">Seller Guide</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
