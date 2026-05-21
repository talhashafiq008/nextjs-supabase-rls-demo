export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'buyer' | 'seller' | 'operator'
          verified: boolean
          created_at: string
        }
        Insert: {
          id: string
          role?: 'buyer' | 'seller' | 'operator'
          verified?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'buyer' | 'seller' | 'operator'
          verified?: boolean
          created_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          seller_id: string
          title: string
          description: string | null
          price: number | null
          currency: string
          status: 'pending_review' | 'live' | 'declined' | 'closed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          title: string
          description?: string | null
          price?: number | null
          currency?: string
          status?: 'pending_review' | 'live' | 'declined' | 'closed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          title?: string
          description?: string | null
          price?: number | null
          currency?: string
          status?: 'pending_review' | 'live' | 'declined' | 'closed'
          created_at?: string
          updated_at?: string
        }
      }
      interests: {
        Row: {
          id: string
          listing_id: string
          buyer_id: string | null
          email: string
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          buyer_id?: string | null
          email: string
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          buyer_id?: string | null
          email?: string
          message?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Listing = Database['public']['Tables']['listings']['Row']
export type Interest = Database['public']['Tables']['interests']['Row']
