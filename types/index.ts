export type BusinessTier = 1 | 2 | 3

export interface Business {
  id: string
  slug: string
  name: string
  description: string | null
  meta_description: string | null
  category: string
  category_slug: string
  suburb: string
  address: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  website: string | null
  logo_url: string | null
  cover_url: string | null
  emoji: string | null
  tags: string[]
  rating_avg: number
  rating_count: number
  is_verified: boolean
  is_claimed: boolean
  tier: BusinessTier
  response_time_mins: number | null
  open_now: boolean | null
  hours: BusinessHours | null
  lat: number | null
  lng: number | null
  created_at: string
  updated_at: string
}

export interface BusinessHours {
  monday:    DayHours | null
  tuesday:   DayHours | null
  wednesday: DayHours | null
  thursday:  DayHours | null
  friday:    DayHours | null
  saturday:  DayHours | null
  sunday:    DayHours | null
}

export interface DayHours {
  open:  string  // "08:00"
  close: string  // "17:00"
  closed: boolean
}

export interface Category {
  id: string
  slug: string
  name: string
  icon: string
  count: number
  subcategories: Subcategory[]
  is_special?: boolean
  badge?: string
}

export interface Subcategory {
  name: string
  slug: string
}

export interface Review {
  id: string
  business_id: string
  user_id: string
  rating: number
  body: string | null
  author_name: string
  author_avatar: string | null
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: 'consumer' | 'business_owner' | 'admin'
  business_id: string | null
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  hero_image: string | null
  author: string
  category: string
  tags: string[]
  related_category_slug: string | null
  related_suburb: string | null
  is_published: boolean
  published_at: string | null
  read_time_mins: number
  views: number
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  business_id: string
  plan: 'free' | 'starter' | 'growth' | 'pro'
  status: 'active' | 'cancelled' | 'past_due'
  current_period_end: string | null
}

export interface ClaimRequest {
  id: string
  business_id: string
  user_id: string
  contact_name: string
  contact_email: string
  contact_phone: string
  role_at_business: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface AnalyticsEvent {
  event_type: string
  event_data: Record<string, unknown>
  business_id?: string
  session_id: string
  device_type: string
  page: string
  component?: string
}

export interface SearchFilters {
  suburb?: string
  min_rating?: number
  open_now?: boolean
  is_247?: boolean
  weekend_available?: boolean
  verified_only?: boolean
  trusted_guy?: boolean
  licensed?: boolean
  sort?: 'best_match' | 'highest_rated' | 'most_reviews' | 'nearest'
}
