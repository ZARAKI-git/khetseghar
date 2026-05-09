'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, Language } from '@/lib/types'
import { t } from '@/lib/translations'
import { Menu, X, User as UserIcon, MessageCircle, ShoppingBag, LogOut, Leaf, Globe } from 'lucide-react'

interface HeaderProps {
  lang?: any
  onLanguageChange?: any
}

export function Header({ lang, onLanguageChange }: HeaderProps = {}) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session?.user) setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }



  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Leaf className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">KhetSeGhar</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/browse" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            {t('browse', 'en')}
          </Link>
          {user && profile?.user_type === 'farmer' && (
            <Link href="/dashboard/farmer" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {t('dashboard', 'en')}
            </Link>
          )}
          {user && (
            <>
              <Link href="/messages" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t('messages', 'en')}
              </Link>
              <Link href="/orders" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t('orders', 'en')}
              </Link>
            </>
          )}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center gap-3">


          {/* Auth buttons / User menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <UserIcon className="h-4 w-4" />
                  <span className="hidden sm:inline max-w-24 truncate">{profile?.full_name || 'User'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    {t('profile', 'en')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/messages" className="flex items-center gap-2">
                    <MessageCircle className="h-4 w-4" />
                    {t('messages', 'en')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders" className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    {t('orders', 'en')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  {t('logout', 'en')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">{t('login', 'en')}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/sign-up">{t('signup', 'en')}</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-3">
            <Link 
              href="/browse" 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t('browse', 'en')}
            </Link>
            {user && profile?.user_type === 'farmer' && (
              <Link 
                href="/dashboard/farmer" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('dashboard', 'en')}
              </Link>
            )}
            {user ? (
              <>
                <Link 
                  href="/messages" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('messages', 'en')}
                </Link>
                <Link 
                  href="/orders" 
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('orders', 'en')}
                </Link>
                <Button variant="outline" onClick={handleLogout} className="w-full mt-2">
                  {t('logout', 'en')}
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-2 mt-2">
                <Button variant="outline" asChild className="w-full">
                  <Link href="/auth/login">{t('login', 'en')}</Link>
                </Button>
                <Button asChild className="w-full">
                  <Link href="/auth/sign-up">{t('signup', 'en')}</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
