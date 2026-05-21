import Link from 'next/link'

export default function SubmittedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="max-w-md text-center">
        <div className="mb-4 text-5xl">✓</div>
        <h1 className="text-2xl font-bold text-stone-900">Listing submitted</h1>
        <p className="mt-2 text-stone-500">
          Your listing is now in review. An operator will publish or decline it shortly.
          You will be notified by email either way.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/listings"
            className="rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
          >
            Browse listings
          </Link>
          <Link
            href="/sell"
            className="rounded-lg border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-50 transition-colors"
          >
            Submit another
          </Link>
        </div>
      </div>
    </div>
  )
}
