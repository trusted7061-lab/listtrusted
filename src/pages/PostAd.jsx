import React, { useState } from 'react'

export default function PostAd() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [location, setLocation] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()

    const payload = {
      title,
      description,
      category: 'companion',
      timeSlot: 'night',
      location,
      city,
      contact: {
        phone,
        whatsapp,
        email
      }
    }

    try {
      const res = await fetch('/api/ads/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // Add Authorization header if your app uses auth tokens
        },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (res.ok) {
        setMessage({ type: 'success', text: data.message || 'Ad posted' })
      } else {
        setMessage({ type: 'error', text: data.message || (data.errors && data.errors.map(e=>e.msg).join(', ')) || 'Failed to post ad' })
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Post Ad</h1>
      {message && (
        <div className={message.type === 'success' ? 'text-green-600' : 'text-red-600'}>{message.text}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block">Title</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} className="w-full border p-2" required />
        </div>
        <div>
          <label className="block">Description</label>
          <textarea value={description} onChange={e=>setDescription(e.target.value)} className="w-full border p-2" rows={6} required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block">City</label>
            <input value={city} onChange={e=>setCity(e.target.value)} className="w-full border p-2" required />
          </div>
          <div>
            <label className="block">Location</label>
            <input value={location} onChange={e=>setLocation(e.target.value)} className="w-full border p-2" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block">Call number</label>
            <input value={phone} onChange={e=>setPhone(e.target.value)} className="w-full border p-2" placeholder="+911234567890" required />
          </div>
          <div>
            <label className="block">WhatsApp number (optional)</label>
            <input value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} className="w-full border p-2" placeholder="+911234567890" />
          </div>
        </div>

        <div>
          <label className="block">Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} className="w-full border p-2" type="email" required />
        </div>

        <div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Post Ad</button>
        </div>
      </form>
    </div>
  )
}
