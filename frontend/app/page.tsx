'use client'

import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadarChart,
  PolarGrid, PolarAngleAxis, Radar
} from 'recharts'

// ─── TYPES ───
interface PredictionResult {
  predicted_price: number
  formatted:       string
  city:            string
  size:            number
  bedrooms:        number
  floor:           number
  metro_km:        number
}

interface FormState {
  size:     number
  bedrooms: number
  floor:    number
  metro_km: number
  city:     string
}

// ─── INPUT COMPONENT ───
function InputField({
  label, name, value, onChange, min, max, step, type = 'number'
}: {
  label: string, name: string, value: number,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  min?: number, max?: number, step?: number, type?: string
}) {
  return (
    <div>
      <label className="text-sm text-gray-400 mb-2 block">{label}</label>
      <input
        type={type} name={name} value={value}
        onChange={onChange} min={min} max={max} step={step}
        className="w-full bg-gray-800 border border-gray-700
                   rounded-xl px-4 py-3 text-white
                   focus:outline-none focus:border-blue-500
                   transition-colors"
      />
    </div>
  )
}

// ─── FORM CARD ───
function PropertyForm({
  title, form, onChange, onPredict, loading, color
}: {
  title:     string
  form:      FormState
  onChange:  (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onPredict: () => void
  loading:   boolean
  color:     string
}) {
  return (
    <div className={`bg-gray-900 rounded-2xl p-6 border ${color}`}>
      <h2 className="text-lg font-semibold mb-5 text-gray-200">{title}</h2>

      <div className="space-y-4">
        {/* City */}
        <div>
          <label className="text-sm text-gray-400 mb-2 block">City</label>
          <select
            name="city" value={form.city} onChange={onChange}
            className="w-full bg-gray-800 border border-gray-700
                       rounded-xl px-4 py-3 text-white
                       focus:outline-none focus:border-blue-500"
          >
            <option value="Dubai">Dubai</option>
            <option value="Abu Dhabi">Abu Dhabi</option>
            <option value="Sharjah">Sharjah</option>
          </select>
        </div>

        <InputField label="Size (sqft)"         name="size"     value={form.size}     onChange={onChange} min={200}  max={10000} />
        <InputField label="Bedrooms"            name="bedrooms" value={form.bedrooms} onChange={onChange} min={1}    max={10}    />
        <InputField label="Floor Number"        name="floor"    value={form.floor}    onChange={onChange} min={1}    max={100}   />
        <InputField label="Metro Distance (km)" name="metro_km" value={form.metro_km} onChange={onChange} min={0.1}  max={10}    step={0.1} />
      </div>

      <button
        onClick={onPredict} disabled={loading}
        className="w-full mt-6 bg-blue-600 hover:bg-blue-500
                   disabled:bg-gray-700 disabled:cursor-not-allowed
                   rounded-xl py-3 font-semibold
                   transition-all duration-200"
      >
        {loading ? '🔄 Calculating...' : '🔮 Predict Price'}
      </button>
    </div>
  )
}

// ─── MAIN ───
export default function Home() {

  const defaultForm: FormState = {
    size: 1200, bedrooms: 2, floor: 10, metro_km: 0.5, city: 'Dubai'
  }

  const [form1,    setForm1]    = useState<FormState>({ ...defaultForm })
  const [form2,    setForm2]    = useState<FormState>({ size: 1800, bedrooms: 3, floor: 15, metro_km: 1.0, city: 'Abu Dhabi' })
  const [result1,  setResult1]  = useState<PredictionResult | null>(null)
  const [result2,  setResult2]  = useState<PredictionResult | null>(null)
  const [loading1, setLoading1] = useState(false)
  const [loading2, setLoading2] = useState(false)
  const [error,    setError]    = useState('')
  const [tab,      setTab]      = useState<'single' | 'compare'>('single')

  // ─── HANDLE CHANGE ───
  function makeHandler(setter: React.Dispatch<React.SetStateAction<FormState>>) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setter(prev => ({
        ...prev,
        [name]: name === 'city' ? value : Number(value)
      }))
    }
  }

  // ─── PREDICT ───
  async function predict(
    form:      FormState,
    setResult: React.Dispatch<React.SetStateAction<PredictionResult | null>>,
    setLoad:   React.Dispatch<React.SetStateAction<boolean>>
  ) {
    setLoad(true)
    setError('')
    try {
      const res = await fetch('http://localhost:8000/predict', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form)
      })
      if (!res.ok) throw new Error('API Error')
      setResult(await res.json())
    } catch {
      setError('Backend connect nahi ho paya! Server check karo.')
    } finally {
      setLoad(false)
    }
  }

  // ─── CHART DATA ───
  const barData = result1 && result2
    ? [
        { name: 'Property 1', price: result1.predicted_price / 1000000, city: result1.city },
        { name: 'Property 2', price: result2.predicted_price / 1000000, city: result2.city },
      ]
    : result1
    ? [{ name: 'Property',   price: result1.predicted_price / 1000000, city: result1.city }]
    : []

  const radarData = result1 ? [
    { feature: 'Size',     value: Math.min((result1.size / 3000) * 100, 100) },
    { feature: 'Floor',    value: Math.min((result1.floor / 30) * 100, 100)  },
    { feature: 'Bedrooms', value: Math.min((result1.bedrooms / 5) * 100, 100)},
    { feature: 'Metro',    value: Math.max(100 - (result1.metro_km * 20), 10)},
  ] : []

  // ─── UI ───
  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-400 mb-2">
            🏙️ Gulf Property AI
          </h1>
          <p className="text-gray-400">
            Dubai · Abu Dhabi · Sharjah — AI Price Predictor
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-gray-900 p-1 rounded-xl w-fit mx-auto">
          {(['single', 'compare'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-lg font-medium transition-all
                ${tab === t
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'}`}
            >
              {t === 'single' ? '🏠 Single' : '⚖️ Compare'}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-center mb-4">❌ {error}</p>
        )}

        {/* ── SINGLE MODE ── */}
        {tab === 'single' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Form */}
            <PropertyForm
              title="Property Details"
              form={form1}
              onChange={makeHandler(setForm1)}
              onPredict={() => predict(form1, setResult1, setLoading1)}
              loading={loading1}
              color="border-blue-800"
            />

            {/* Results */}
            <div className="space-y-4">

              {/* Price Card */}
              {result1 && (
                <div className="bg-gradient-to-br from-blue-900 to-blue-950
                                rounded-2xl p-6 border border-blue-800 text-center">
                  <p className="text-blue-300 text-sm mb-1">Estimated Price</p>
                  <h2 className="text-4xl font-bold mb-4">{result1.formatted}</h2>

                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'City',  value: result1.city },
                      { label: 'Size',  value: `${result1.size} sqft` },
                      { label: 'Floor', value: `${result1.floor}th` },
                      { label: 'Metro', value: `${result1.metro_km} km` },
                    ].map(i => (
                      <div key={i.label} className="bg-blue-800/40 rounded-xl p-3">
                        <p className="text-blue-300 text-xs">{i.label}</p>
                        <p className="font-semibold">{i.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Radar Chart */}
              {result1 && radarData.length > 0 && (
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                  <h3 className="text-sm text-gray-400 mb-4">Property Score</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="feature" tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                      <Radar dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── COMPARE MODE ── */}
        {tab === 'compare' && (
          <div className="space-y-6">

            {/* 2 Forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PropertyForm
                title="🏠 Property 1"
                form={form1}
                onChange={makeHandler(setForm1)}
                onPredict={() => predict(form1, setResult1, setLoading1)}
                loading={loading1}
                color="border-blue-800"
              />
              <PropertyForm
                title="🏢 Property 2"
                form={form2}
                onChange={makeHandler(setForm2)}
                onPredict={() => predict(form2, setResult2, setLoading2)}
                loading={loading2}
                color="border-purple-800"
              />
            </div>

            {/* Compare Results */}
            {result1 && result2 && (
              <div className="space-y-4">

                {/* Price Comparison */}
                <div className="grid grid-cols-2 gap-4">
                  {[result1, result2].map((r, i) => (
                    <div key={i}
                         className={`rounded-2xl p-6 text-center border
                           ${i === 0
                             ? 'bg-blue-900/40 border-blue-800'
                             : 'bg-purple-900/40 border-purple-800'}`}>
                      <p className="text-sm text-gray-400 mb-1">
                        Property {i + 1} — {r.city}
                      </p>
                      <h3 className="text-3xl font-bold">{r.formatted}</h3>

                      {/* Winner Badge */}
                      {i === (result1.predicted_price < result2.predicted_price ? 0 : 1) && (
                        <span className="mt-2 inline-block bg-green-600
                                         text-xs px-3 py-1 rounded-full">
                          💰 Better Value
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Bar Chart */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
                  <h3 className="text-sm text-gray-400 mb-4">Price Comparison (Million AED)</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                      <YAxis tick={{ fill: '#9CA3AF' }}
                             tickFormatter={v => `${v}M`} />
                      <Tooltip
                        formatter={(v: number) => [`AED ${v.toFixed(2)}M`, 'Price']}
                        contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '12px' }}
                      />
                      <Bar dataKey="price" fill="#3B82F6" radius={[8,8,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Diff */}
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 text-center">
                  <p className="text-gray-400 text-sm mb-1">Price Difference</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    AED {Math.abs(result1.predicted_price - result2.predicted_price).toLocaleString()}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    {result1.predicted_price < result2.predicted_price
                      ? 'Property 1 sasti hai!'
                      : 'Property 2 sasti hai!'}
                  </p>
                </div>

              </div>
            )}
          </div>
        )}

      </div>
    </main>
  )
}