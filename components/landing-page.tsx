'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Language, Category } from '@/lib/types'
import { t, getCategoryName } from '@/lib/translations'
import { 
  Leaf, 
  Users, 
  MessageCircle, 
  Shield,
  Wheat,
  Carrot,
  Apple,
  Bean,
  Milk,
  Droplet,
  ArrowRight,
  Star,
  CheckCircle2
} from 'lucide-react'

interface LandingPageProps {
  lang: Language
  categories: Category[]
}

const categoryIcons: Record<string, React.ReactNode> = {
  wheat: <Wheat className="h-8 w-8" />,
  carrot: <Carrot className="h-8 w-8" />,
  apple: <Apple className="h-8 w-8" />,
  bean: <Bean className="h-8 w-8" />,
  pepper: <Leaf className="h-8 w-8" />,
  milk: <Milk className="h-8 w-8" />,
  droplet: <Droplet className="h-8 w-8" />,
  nut: <Leaf className="h-8 w-8" />,
}

export function LandingPage({ lang, categories }: LandingPageProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Leaf className="h-4 w-4" />
              <span>Farm to Table, Direct</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance leading-tight">
              {t('heroTitle', lang)}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 text-pretty max-w-2xl mx-auto">
              {t('heroSubtitle', lang)}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-base px-8">
                <Link href="/browse">
                  {t('startShopping', lang)}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8">
                <Link href="/auth/sign-up?type=farmer">
                  {t('startSelling', lang)}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '10,000+', label: 'Farmers' },
              { value: '50,000+', label: 'Buyers' },
              { value: '100+', label: 'Cities' },
              { value: '4.8', label: 'Rating', icon: <Star className="h-4 w-4 fill-accent text-accent" /> },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-3xl md:text-4xl font-bold text-foreground">{stat.value}</span>
                  {stat.icon}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose KhetSeGhar?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We connect farmers directly with consumers, eliminating middlemen and ensuring fair prices for everyone.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Users className="h-6 w-6" />,
                title: t('directFromFarm', lang),
                desc: t('directFromFarmDesc', lang),
              },
              {
                icon: <Leaf className="h-6 w-6" />,
                title: t('fairPricing', lang),
                desc: t('fairPricingDesc', lang),
              },
              {
                icon: <MessageCircle className="h-6 w-6" />,
                title: t('easyChat', lang),
                desc: t('easyChatDesc', lang),
              },
              {
                icon: <Shield className="h-6 w-6" />,
                title: t('securePayments', lang),
                desc: t('securePaymentsDesc', lang),
              },
            ].map((feature, i) => (
              <Card key={i} className="border-border bg-card hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">{t('categories', lang)}</h2>
              <p className="text-muted-foreground">Browse fresh produce by category</p>
            </div>
            <Button variant="outline" asChild className="hidden sm:flex">
              <Link href="/browse">
                {t('allCategories', lang)}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link key={category.id} href={`/browse?category=${category.id}`}>
                <Card className="border-border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {categoryIcons[category.icon || 'leaf'] || <Leaf className="h-8 w-8" />}
                    </div>
                    <h3 className="font-medium text-foreground">{getCategoryName(category, lang)}</h3>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-6 text-center sm:hidden">
            <Button variant="outline" asChild>
              <Link href="/browse">
                {t('allCategories', lang)}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple steps to get fresh produce from farms to your doorstep
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: '1',
                title: 'Browse & Select',
                desc: 'Explore fresh produce from verified farmers near you',
              },
              {
                step: '2',
                title: 'Chat & Order',
                desc: 'Connect with farmers, discuss details, and place your order',
              },
              {
                step: '3',
                title: 'Pay & Receive',
                desc: 'Pay securely via UPI and get fresh produce delivered',
              },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="h-16 w-16 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4">
                  {item.step}
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-border" />
                )}
                <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start?
          </h2>
          <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
            Join thousands of farmers and buyers already using KhetSeGhar
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-base">
              <Link href="/auth/sign-up">
                Create Free Account
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link href="/browse">
                Browse Products
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-card border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="col-span-2 md:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <Leaf className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold text-foreground">KhetSeGhar</span>
              </Link>
              <p className="text-sm text-muted-foreground">
                Connecting farmers directly with consumers across India.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">For Buyers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/browse" className="hover:text-foreground">Browse Products</Link></li>
                <li><Link href="/auth/sign-up" className="hover:text-foreground">Create Account</Link></li>
                <li><Link href="/orders" className="hover:text-foreground">My Orders</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">For Farmers</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/auth/sign-up?type=farmer" className="hover:text-foreground">Start Selling</Link></li>
                <li><Link href="/dashboard/farmer" className="hover:text-foreground">Dashboard</Link></li>
                <li><Link href="/help/farmers" className="hover:text-foreground">Seller Guide</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-foreground">Contact Us</Link></li>
                <li><Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} KhetSeGhar. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
