'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import type { Language, Conversation, Profile, Listing, Message } from '@/lib/types'
import { t } from '@/lib/translations'
import { MessageCircle, Loader2, User } from 'lucide-react'

type ConversationWithRelations = Conversation & { 
  farmer: Profile
  buyer: Profile
  listing: Listing | null
  messages: Message[]
}

export default function MessagesPage() {
  const [lang, setLang] = useState<Language>('en')
  const [conversations, setConversations] = useState<ConversationWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
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

      setCurrentUserId(user.id)

      // Fetch conversations where user is either farmer or buyer
      const { data: convData } = await supabase
        .from('conversations')
        .select(`
          *,
          farmer:profiles!farmer_id(*),
          buyer:profiles!buyer_id(*),
          listing:listings(*),
          messages(*)
        `)
        .or(`farmer_id.eq.${user.id},buyer_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false })

      if (convData) {
        setConversations(convData as ConversationWithRelations[])
      }

      setLoading(false)
    }

    fetchData()

    // Subscribe to new messages
    const channel = supabase
      .channel('messages_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          fetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router])

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem('khetseghar-lang', newLang)
  }

  const getOtherUser = (conv: ConversationWithRelations) => {
    return conv.farmer_id === currentUserId ? conv.buyer : conv.farmer
  }

  const getLastMessage = (conv: ConversationWithRelations) => {
    if (!conv.messages || conv.messages.length === 0) return null
    return conv.messages.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0]
  }

  const getUnreadCount = (conv: ConversationWithRelations) => {
    if (!conv.messages) return 0
    return conv.messages.filter(m => !m.is_read && m.sender_id !== currentUserId).length
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
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">{t('messages', lang)}</h1>

        {conversations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">No messages yet</p>
              <p className="text-muted-foreground">
                Start a conversation by contacting a farmer from their product listing
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => {
              const otherUser = getOtherUser(conv)
              const lastMessage = getLastMessage(conv)
              const unreadCount = getUnreadCount(conv)

              return (
                <Link key={conv.id} href={`/messages/${conv.id}`}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={otherUser?.avatar_url || ''} />
                            <AvatarFallback>
                              <User className="h-6 w-6" />
                            </AvatarFallback>
                          </Avatar>
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-foreground truncate">
                              {otherUser?.full_name}
                            </p>
                            {lastMessage && (
                              <span className="text-xs text-muted-foreground flex-shrink-0">
                                {new Date(lastMessage.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {conv.listing && (
                            <p className="text-xs text-primary truncate mb-1">
                              Re: {conv.listing.title}
                            </p>
                          )}
                          {lastMessage && (
                            <p className={`text-sm truncate ${unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>
                              {lastMessage.sender_id === currentUserId ? 'You: ' : ''}
                              {lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
