'use client'

import { useState, useEffect, useRef, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/client'
import type { Language, Conversation, Profile, Listing, Message } from '@/lib/types'
import { t } from '@/lib/translations'
import { ArrowLeft, Send, Loader2, User, Leaf } from 'lucide-react'

interface ChatPageProps {
  params: Promise<{ id: string }>
}

type MessageWithSender = Message & { sender: Profile }

export default function ChatPage({ params }: ChatPageProps) {
  const { id } = use(params)
  const [lang, setLang] = useState<Language>('en')
  const [conversation, setConversation] = useState<Conversation & { farmer: Profile; buyer: Profile; listing: Listing | null } | null>(null)
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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

      // Fetch conversation
      const { data: convData } = await supabase
        .from('conversations')
        .select(`
          *,
          farmer:profiles!farmer_id(*),
          buyer:profiles!buyer_id(*),
          listing:listings(*)
        `)
        .eq('id', id)
        .single()

      if (convData) {
        setConversation(convData as Conversation & { farmer: Profile; buyer: Profile; listing: Listing | null })
      }

      // Fetch messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select(`*, sender:profiles!sender_id(*)`)
        .eq('conversation_id', id)
        .order('created_at', { ascending: true })

      if (messagesData) {
        setMessages(messagesData as MessageWithSender[])
        
        // Mark unread messages as read
        const unreadIds = messagesData
          .filter(m => !m.is_read && m.sender_id !== user.id)
          .map(m => m.id)
        
        if (unreadIds.length > 0) {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadIds)
        }
      }

      setLoading(false)
    }

    fetchData()

    // Subscribe to new messages in this conversation
    const channel = supabase
      .channel(`chat_${id}`)
      .on(
        'postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'messages',
          filter: `conversation_id=eq.${id}`
        },
        async (payload) => {
          // Fetch the new message with sender info
          const { data: newMsg } = await supabase
            .from('messages')
            .select(`*, sender:profiles!sender_id(*)`)
            .eq('id', payload.new.id)
            .single()
          
          if (newMsg) {
            setMessages(prev => [...prev, newMsg as MessageWithSender])
            
            // Mark as read if not from current user
            if (newMsg.sender_id !== currentUserId) {
              await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', newMsg.id)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, router, id, currentUserId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem('khetseghar-lang', newLang)
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentUserId || sending) return

    setSending(true)
    const messageContent = newMessage.trim()
    setNewMessage('')

    // Insert message
    const { error } = await supabase.from('messages').insert({
      conversation_id: id,
      sender_id: currentUserId,
      content: messageContent,
    })

    if (!error) {
      // Update conversation last_message_at
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', id)
    }

    setSending(false)
  }

  const getOtherUser = () => {
    if (!conversation) return null
    return conversation.farmer_id === currentUserId ? conversation.buyer : conversation.farmer
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

  if (!conversation) {
    return (
      <div className="min-h-screen bg-background">
        <Header lang={lang} onLanguageChange={handleLanguageChange} />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-lg text-muted-foreground">Conversation not found</p>
          <Button asChild className="mt-4">
            <Link href="/messages">Back to Messages</Link>
          </Button>
        </div>
      </div>
    )
  }

  const otherUser = getOtherUser()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header lang={lang} onLanguageChange={handleLanguageChange} />
      
      {/* Chat Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-3 max-w-2xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/messages">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Avatar>
              <AvatarImage src={otherUser?.avatar_url || ''} />
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-foreground">{otherUser?.full_name}</p>
              {conversation.listing && (
                <Link 
                  href={`/listing/${conversation.listing.id}`}
                  className="text-xs text-primary hover:underline"
                >
                  Re: {conversation.listing.title}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Listing Preview */}
      {conversation.listing && (
        <div className="border-b border-border bg-muted/50">
          <div className="container mx-auto px-4 py-2 max-w-2xl">
            <Link href={`/listing/${conversation.listing.id}`} className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                {conversation.listing.images && conversation.listing.images.length > 0 ? (
                  <img
                    src={conversation.listing.images[0]}
                    alt={conversation.listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {conversation.listing.title}
                </p>
                <p className="text-sm text-primary">
                  ₹{conversation.listing.price_per_unit}/{conversation.listing.unit}
                </p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwn = message.sender_id === currentUserId
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-end gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                      {!isOwn && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.sender?.avatar_url || ''} />
                          <AvatarFallback>
                            <User className="h-3 w-3" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isOwn
                            ? 'bg-primary text-primary-foreground rounded-br-md'
                            : 'bg-muted text-foreground rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        <p className={`text-xs mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Message Input */}
      <div className="border-t border-border bg-card">
        <div className="container mx-auto px-4 py-3 max-w-2xl">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('typeMessage', lang)}
              className="flex-1"
              disabled={sending}
            />
            <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
