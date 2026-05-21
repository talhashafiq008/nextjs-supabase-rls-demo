import { fetchLiveListings } from '@/actions/listings'
import type { Tables } from '@/lib/supabase/types'
type Listing = Tables<'listings'>

export const revalidate = 60

export default async function ListingsPage() {
  const listings = await fetchLiveListings()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Live Listings</h1>
          <p className="mt-1 text-sm text-stone-500">
            {listings.length} asset{listings.length !== 1 ? 's' : ''} available.
            RLS ensures only <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">status = &apos;live&apos;</code> rows are returned — even for anonymous users.
          </p>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-stone-300 bg-white p-12 text-center">
          <p className="text-2xl">⬡</p>
          <p className="mt-2 font-medium text-stone-700">No live listings yet</p>
          <p className="mt-1 text-sm text-stone-500">
            Pending listings are hidden from this view by RLS.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </ul>
      )}
    </div>
  )
}

function ListingCard({
  listing,
}: {
  listing: Pick<Listing, 'id' | 'title' | 'description' | 'price' | 'currency' | 'created_at'>
}) {
  return (
    <li className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Live
            </span>
          </div>
          <h2 className="mt-2 font-semibold text-stone-900">{listing.title}</h2>
          {listing.description && (
            <p className="mt-1 text-sm text-stone-500 line-clamp-2">{listing.description}</p>
          )}
        </div>
        {listing.price !== null && (
          <div className="shrink-0 text-right">
            <p className="text-lg font-bold text-stone-900">
              {listing.price.toLocaleString()}
            </p>
            <p className="text-xs text-stone-400">{listing.currency}</p>
          </div>
        )}
      </div>
      <p className="mt-4 text-xs text-stone-400">
        Listed {new Date(listing.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      </p>
    </li>
  )
}
