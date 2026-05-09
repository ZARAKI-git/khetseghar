export type UserType = 'farmer' | 'buyer'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  user_type: UserType
  avatar_url: string | null
  address: string | null
  city: string | null
  state: string | null
  pincode: string | null
  language_preference: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name_en: string
  name_hi: string
  name_pa: string
  icon: string | null
  created_at: string
}

export interface Listing {
  id: string
  farmer_id: string
  category_id: string
  title: string
  description: string | null
  price_per_unit: number
  unit: string
  quantity_available: number
  min_order_quantity: number
  images: string[]
  is_organic: boolean
  harvest_date: string | null
  location: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // Joined fields
  farmer?: Profile
  category?: Category
}

export interface Order {
  id: string
  listing_id: string
  buyer_id: string
  farmer_id: string
  quantity: number
  unit_price: number
  total_amount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  razorpay_order_id: string | null
  razorpay_payment_id: string | null
  delivery_address: string | null
  delivery_city: string | null
  delivery_state: string | null
  delivery_pincode: string | null
  delivery_phone: string | null
  notes: string | null
  created_at: string
  updated_at: string
  // Joined fields
  listing?: Listing
  buyer?: Profile
  farmer?: Profile
}

export interface Conversation {
  id: string
  farmer_id: string
  buyer_id: string
  listing_id: string | null
  last_message_at: string
  created_at: string
  // Joined fields
  farmer?: Profile
  buyer?: Profile
  listing?: Listing
  messages?: Message[]
}

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
  // Joined fields
  sender?: Profile
}

export interface Review {
  id: string
  listing_id: string
  order_id: string
  reviewer_id: string
  farmer_id: string
  rating: number
  comment: string | null
  created_at: string
  // Joined fields
  reviewer?: Profile
  listing?: Listing
}

// Translation keys
export type Language = 'en' | 'hi' | 'pa'

export interface Translations {
  [key: string]: {
    en: string
    hi: string
    pa: string
  }
}
