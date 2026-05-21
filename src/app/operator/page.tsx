import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { publishListing, declineListing, closeListing } from '@/actions/operator'
import type { Tables } from '@/lib/supabase/types'
type Listing = Tables<'listings'>

const statusConfig = {
  pending_review: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  live:           { label: 'Live',           color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  declined:       { label: 'Declined',       color: 'bg-red-100 text-red-700 border-red-200' },
  closed:         { label: 'Closed',         color: 'bg-stone-100 text-stone-500 border-stone-200' },
} as const

export default async function OperatorPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'operator') redirect('/')

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })

  const pending  = listings?.filter(l => l.status === 'pending_review') ?? []
  const live     = listings?.filter(l => l.status === 'live')           ?? []
  const declined = listings?.filter(l => l.status === 'declined')       ?? []
  const closed   = listings?.filter(l => l.status === 'closed')         ?? []

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Operator Dashboard</h1>
          <p className="mt-1 text-sm text-stone-500">
            Review and manage all listings. RLS grants you full read and update access.
          </p>
        </div>
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200">
          operator
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Pending review" value={pending.length}  color="text-amber-600" />
        <StatCard label="Live"           value={live.length}     color="text-emerald-600" />
        <StatCard label="Declined"       value={declined.length} color="text-red-500" />
        <StatCard label="Closed"         value={closed.length}   color="text-stone-400" />
      </div>

      {/* Pending — most important section */}
      <section>
        <SectionHeader
          title="Pending Review"
          count={pending.length}
          color="text-amber-600"
          description="These listings are waiting for your approval before going live."
        />
        {pending.length === 0 ? (
          <EmptyState message="No listings pending review." />
        ) : (
          <ul className="space-y-4">
            {pending.map(listing => (
              <ListingCard key={listing.id} listing={listing}>
                <div className="flex gap-2">
                  <ActionButton formAction={publishListing} id={listing.id} variant="publish">
                    Publish
                  </ActionButton>
                  <ActionButton formAction={declineListing} id={listing.id} variant="decline">
                    Decline
                  </ActionButton>
                </div>
              </ListingCard>
            ))}
          </ul>
        )}
      </section>

      {/* Live */}
      <section>
        <SectionHeader
          title="Live"
          count={live.length}
          color="text-emerald-600"
          description="Visible to all users including logged-out visitors."
        />
        {live.length === 0 ? (
          <EmptyState message="No live listings yet." />
        ) : (
          <ul className="space-y-4">
            {live.map(listing => (
              <ListingCard key={listing.id} listing={listing}>
                <ActionButton formAction={closeListing} id={listing.id} variant="close">
                  Close deal
                </ActionButton>
              </ListingCard>
            ))}
          </ul>
        )}
      </section>

      {/* Declined */}
      {declined.length > 0 && (
        <section>
          <SectionHeader title="Declined" count={declined.length} color="text-red-500" />
          <ul className="space-y-4">
            {declined.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </ul>
        </section>
      )}

      {/* Closed */}
      {closed.length > 0 && (
        <section>
          <SectionHeader title="Closed" count={closed.length} color="text-stone-400" />
          <ul className="space-y-4">
            {closed.map(listing => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-stone-500">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function SectionHeader({
  title, count, color, description,
}: {
  title: string; count: number; color: string; description?: string
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2">
        <h2 className={`text-lg font-semibold ${color}`}>{title}</h2>
        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-600">
          {count}
        </span>
      </div>
      {description && <p className="mt-0.5 text-sm text-stone-500">{description}</p>}
    </div>
  )
}

function ListingCard({ listing, children }: { listing: Listing; children?: React.ReactNode }) {
  const status = statusConfig[listing.status as keyof typeof statusConfig]

  return (
    <li className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${status.color}`}>
              {status.label}
            </span>
            <span className="text-xs text-stone-400">
              {new Date(listing.created_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </span>
          </div>
          <h3 className="mt-2 font-semibold text-stone-900">{listing.title}</h3>
          {listing.description && (
            <p className="mt-1 text-sm text-stone-500 line-clamp-2">{listing.description}</p>
          )}
          <p className="mt-2 text-xs text-stone-400">
            Seller ID: <code className="font-mono">{listing.seller_id}</code>
          </p>
        </div>
        {listing.price !== null && (
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-stone-900">{listing.price.toLocaleString()}</p>
            <p className="text-xs text-stone-400">{listing.currency}</p>
          </div>
        )}
      </div>
      {children && <div className="mt-4 border-t border-stone-100 pt-4">{children}</div>}
    </li>
  )
}

function ActionButton({
  formAction, id, variant, children,
}: {
  formAction: (formData: FormData) => Promise<void>
  id: string
  variant: 'publish' | 'decline' | 'close'
  children: React.ReactNode
}) {
  const styles = {
    publish: 'bg-emerald-600 text-white hover:bg-emerald-700',
    decline: 'border border-red-300 text-red-600 hover:bg-red-50',
    close:   'border border-stone-300 text-stone-600 hover:bg-stone-50',
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${styles[variant]}`}
      >
        {children}
      </button>
    </form>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-stone-300 bg-white p-8 text-center text-sm text-stone-400">
      {message}
    </div>
  )
}
