'use client'

import { useActionState } from 'react'
import { submitListing, type ListingFormState } from '@/actions/listings'

const initialState: ListingFormState = {}

export function SellForm() {
  const [state, formAction, pending] = useActionState(submitListing, initialState)

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      {state.message && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {state.message}
        </div>
      )}

      <form action={formAction} className="space-y-5">
        <Field
          label="Listing title"
          name="title"
          placeholder="e.g. Gold mine — 50 ha, valid mineral licence, NW Ghana"
          errors={state.errors?.title}
        />

        <div>
          <label className="block text-sm font-medium text-stone-700">Description</label>
          <textarea
            name="description"
            rows={4}
            placeholder="Describe the asset: mineral type, location, road access, licence status, infrastructure..."
            className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          {state.errors?.description && (
            <p className="mt-1 text-xs text-red-600">{state.errors.description[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Asking price"
            name="price"
            type="number"
            placeholder="2500000"
            errors={state.errors?.price}
          />
          <div>
            <label className="block text-sm font-medium text-stone-700">Currency</label>
            <select
              name="currency"
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="ZAR">ZAR</option>
            </select>
          </div>
        </div>

        <div className="border-t border-stone-100 pt-4">
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-amber-600 py-3 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50 transition-colors"
          >
            {pending ? 'Submitting...' : 'Submit for review'}
          </button>
          <p className="mt-2 text-center text-xs text-stone-400">
            Submissions go to <code className="text-stone-500">status = &apos;pending_review&apos;</code> and are not public until an operator publishes them.
          </p>
        </div>
      </form>
    </div>
  )
}

function Field({
  label, name, type = 'text', placeholder, errors,
}: {
  label: string; name: string; type?: string; placeholder?: string; errors?: string[]
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-stone-700">{label}</label>
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      />
      {errors && <p className="mt-1 text-xs text-red-600">{errors[0]}</p>}
    </div>
  )
}
