'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const listingSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  price: z.coerce.number().positive('Price must be a positive number'),
  currency: z.enum(['USD', 'EUR', 'GBP', 'ZAR']),
})

export type ListingFormState = {
  errors?: Partial<Record<keyof z.infer<typeof listingSchema>, string[]>>
  message?: string
}

export async function submitListing(
  _prevState: ListingFormState,
  formData: FormData
): Promise<ListingFormState> {
  const supabase = await createClient()

  // Require authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { message: 'You must be signed in to submit a listing.' }
  }

  // Require verified seller role — RLS enforces this at DB level too,
  // but checking here gives a better error message than a Postgres violation
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, verified')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'seller' || !profile.verified) {
    return { message: 'Only verified sellers can submit listings.' }
  }

  // Validate form data
  const parsed = listingSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    price: formData.get('price'),
    currency: formData.get('currency'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  // Insert — RLS "listings: verified seller insert" policy is the second gate
  const { error } = await supabase
    .from('listings')
    .insert({
      seller_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      currency: parsed.data.currency,
      status: 'pending_review',
    })

  if (error) {
    return { message: `Failed to submit listing: ${error.message}` }
  }

  revalidatePath('/sell')
  redirect('/sell/submitted')
}

export async function fetchLiveListings() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('listings')
    .select('id, title, description, price, currency, created_at')
    .eq('status', 'live')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}
