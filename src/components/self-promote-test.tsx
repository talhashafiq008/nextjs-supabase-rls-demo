'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function SelfPromoteTest({ userId }: { userId: string }) {
  const [result, setResult] = useState<{ blocked: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function tryPromote() {
    setLoading(true)
    setResult(null)
    const supabase = createClient()

    const { error } = await supabase
      .from('profiles')
      .update({ role: 'operator' })
      .eq('id', userId)

    if (error) {
      setResult({ blocked: true, message: error.message })
    } else {
      setResult({ blocked: false, message: 'Update succeeded — RLS did not block this.' })
    }
    setLoading(false)
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-lg">🔒</span>
        <h2 className="font-semibold text-stone-900">RLS Self-Promotion Test</h2>
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
          Demo only
        </span>
      </div>
      <p className="mb-4 text-sm text-stone-600">
        This button attempts to update your own <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">role</code> to{' '}
        <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">operator</code> using the anon key — exactly
        what a malicious user would try. The RLS <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">WITH CHECK</code>{' '}
        policy should block it.
      </p>

      <button
        onClick={tryPromote}
        disabled={loading}
        className="rounded-lg border border-amber-400 bg-white px-4 py-2 text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Attempting...' : 'Try to promote yourself to Operator'}
      </button>

      {result && (
        <div
          className={`mt-4 rounded-lg border p-4 text-sm ${
            result.blocked
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-red-200 bg-red-50 text-red-800'
          }`}
        >
          <div className="mb-1 font-semibold">
            {result.blocked ? '✓ Blocked by RLS' : '✗ Not blocked — policy missing'}
          </div>
          <code className="text-xs">{result.message}</code>
        </div>
      )}
    </div>
  )
}
