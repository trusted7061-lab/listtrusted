import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { locationsData, getAreasForCity } from '../services/locationsData'

const API_BASE = import.meta.env.DEV ? '/api' : (import.meta.env.VITE_API_URL || 'https://trustedescort-backend.onrender.com/api')

const SERVICES = [
  'Anal Sex', 'French kiss', 'Girlfriend Experience (GFE)', 'Handjob',
  'Oral Sex', 'BDSM', 'CIM', 'Deep Throat', 'Duo', 'Erotic massage',
  'Fetish', 'Modelling', 'Oral without Protection', 'Porn Star Experience (PSE)',
  'Quickie', 'Rimming', 'Role Play', 'Squirting', 'Striptease', 'Tantric Massage',
  'Threesome', 'Video Call'
]

const OPTIONAL_INFO = [
  'Housewife', 'Independent', 'Student', 'Big Ass', 'Luxury', 'Mature',
  'Teen', 'With Tattoo'
]

const BODY_TYPES = ['Slim', 'Athletic', 'Average', 'Curvy', 'Busty', 'Slim & Toned']
const HAIR_COLORS = ['Black', 'Brown', 'Blonde', 'Red', 'Dyed']
const BREAST_SIZES = ['Small (A)', 'Small-Medium (B)', 'Medium (C)', 'Large (D)', 'Very Large (D+)']
const BREAST_TYPES = ['Natural', 'Silicone', 'Mixed']

export default function PostAd() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState('')
  const [images, setImages] = useState([])
  const [imagePreview, setImagePreview] = useState([])

  const [formData, setFormData] = useState({
    state: '',
    city: '',
    area: '',
    title: '',
    description: '',
    name: '',
    gender: 'Female',
    nationality: '',
    ethnicity: '',
    age: '',
    phone: '',
    whatsapp: false,
    bodyType: '',
    hairColor: '',
    breastSize: '',
    breastType: '',
    services: [],
    optionalInfo: []
  })

  // Get states from locationsData
  const states = Object.entries(locationsData)
    .map(([slug, state]) => ({
      slug,
      name: state.name
    }))
    .sort((a, b) => a.name.localeCompare(b.name))

  // Get cities for selected state
  const cities = formData.state
    ? Object.entries(locationsData[formData.state].districts)
        .flatMap(([districtSlug, district]) =>
          district.cities.map(city => ({
            name: city,
            district: district.name
          }))
        )
        .sort((a, b) => a.name.localeCompare(b.name))
    : []

  // Get areas/sublocations for selected city
  const areas = formData.city ? getAreasForCity(formData.city) : []

  const handleInputChange = (e) => {
    const { name, value } = e.target
    if (name === 'state') {
      // Reset city and area when state changes
      setFormData(prev => ({ ...prev, [name]: value, city: '', area: '' }))
    } else if (name === 'city') {
      // Reset area when city changes
      setFormData(prev => ({ ...prev, [name]: value, area: '' }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleCheckbox = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }))
  }

  const handleImageInput = (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > 15) {
      showToast('Maximum 15 images allowed')
      return
    }
    
    setImages(prev => [...prev, ...files])
    
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(prev => [...prev, { file, preview: event.target.result }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreview(prev => prev.filter((_, i) => i !== index))
  }

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.state || !formData.city) {
      showToast('Please select state and city')
      return
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      showToast('Please fill in title and description')
      return
    }

    if (imagePreview.length < 2) {
      showToast('Upload at least 2 images')
      return
    }

    if (!formData.name || !formData.age) {
      showToast('Please fill in mandatory info')
      return
    }

    if (!formData.phone || !formData.bodyType) {
      showToast('Please fill in all required fields')
      return
    }

    // All validations passed, navigate to promote page with form data
    navigate('/promote-ad', {
      state: {
        adData: {
          ...formData,
          images: imagePreview
        }
      }
    })
  }

  return (
    <>
      <Helmet>
        <title>Post Ad – TrustedEsco</title>
      </Helmet>

      <div className="min-h-screen bg-dark-bg">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="font-serif text-4xl font-bold text-white mb-2">Post Your Ad</h1>
            <p className="text-gray-400">Create your profile and reach clients across India</p>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Section */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="card-glass rounded-xl p-6"
            >
              <h2 className="font-serif text-xl font-semibold text-gold mb-4">Choose your Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">State</label>
                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none transition-colors"
                  >
                    <option value="">Select State</option>
                    {states.map(state => (
                      <option key={state.slug} value={state.slug}>{state.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">City</label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    disabled={!formData.state}
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select City</option>
                    {cities.map(city => (
                      <option key={city.name} value={city.name}>{city.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Area / Sub-location</label>
                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleInputChange}
                    disabled={!formData.city}
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">Select Area (optional)</option>
                    {areas.map(area => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Ad Text Section */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="card-glass rounded-xl p-6"
            >
              <h2 className="font-serif text-xl font-semibold text-gold mb-4">Ad Text</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Ad Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., Beautiful Companion in Mumbai"
                    required
                    maxLength="100"
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe yourself, your body, your skills, what you like..."
                    required
                    rows={6}
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-gold/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </motion.div>

            {/* Images Section */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="card-glass rounded-xl p-6"
            >
              <h2 className="font-serif text-xl font-semibold text-gold mb-4">
                Upload Pictures (Minimum 2, Maximum 15)
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {imagePreview.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Preview ${idx}`}
                      className="w-full h-40 object-cover rounded-lg border border-gold/20"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-2 right-2 bg-red-500/80 backdrop-blur-sm hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <label className="block border-2 border-dashed border-gold/30 rounded-lg p-8 text-center cursor-pointer hover:border-gold/50 hover:bg-gold/5 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageInput}
                  disabled={imagePreview.length >= 15}
                  className="hidden"
                />
                <div className="text-4xl mb-2">📸</div>
                <p className="text-white font-medium">Click to upload or drag images here</p>
                <p className="text-gray-400 text-sm">({imagePreview.length}/15 uploaded)</p>
              </label>
            </motion.div>

            {/* Mandatory Info Section */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="card-glass rounded-xl p-6"
            >
              <h2 className="font-serif text-xl font-semibold text-gold mb-4">Mandatory Info</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white focus:border-gold/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="18"
                    max="80"
                    required
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white focus:border-gold/50 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white focus:border-gold/50 focus:outline-none transition-colors"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Transgender">Transgender</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Nationality</label>
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    placeholder="e.g., Indian"
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white focus:border-gold/50 focus:outline-none transition-colors"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-white mb-2">Ethnicity</label>
                  <input
                    type="text"
                    name="ethnicity"
                    value={formData.ethnicity}
                    onChange={handleInputChange}
                    placeholder="e.g., Indian, Russian, African"
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white focus:border-gold/50 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="card-glass rounded-xl p-6"
            >
              <h2 className="font-serif text-xl font-semibold text-gold mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Phone Number</label>
                  <div className="flex gap-2">
                    <span className="bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-gray-400">+91</span>
                    <input
                      type="tel"
                      placeholder="your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      pattern="[0-9]{10}"
                      required
                      className="flex-1 bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white focus:border-gold/50 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-white font-medium">WhatsApp</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.whatsapp}
                      onChange={(e) => setFormData(prev => ({ ...prev, whatsapp: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Physical Attributes */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="card-glass rounded-xl p-6"
            >
              <h2 className="font-serif text-xl font-semibold text-gold mb-4">Physical Attributes</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Body Type</label>
                  <select
                    name="bodyType"
                    value={formData.bodyType}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white focus:border-gold/50 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    {BODY_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Hair Color</label>
                  <select
                    name="hairColor"
                    value={formData.hairColor}
                    onChange={handleInputChange}
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white focus:border-gold/50 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    {HAIR_COLORS.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Breast Size</label>
                  <select
                    name="breastSize"
                    value={formData.breastSize}
                    onChange={handleInputChange}
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white focus:border-gold/50 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    {BREAST_SIZES.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Breast Type</label>
                  <select
                    name="breastType"
                    value={formData.breastType}
                    onChange={handleInputChange}
                    className="w-full bg-dark-card border border-gold/20 rounded-lg px-4 py-2.5 text-white focus:border-gold/50 focus:outline-none transition-colors"
                  >
                    <option value="">Select</option>
                    {BREAST_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Services */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="card-glass rounded-xl p-6"
            >
              <h2 className="font-serif text-xl font-semibold text-gold mb-4">Services</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {SERVICES.map(service => (
                  <label key={service} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service)}
                      onChange={() => handleCheckbox('services', service)}
                      className="w-4 h-4 rounded border-gold/20 bg-dark-card accent-gold cursor-pointer"
                    />
                    <span className="text-gray-300 group-hover:text-white transition-colors text-sm">{service}</span>
                  </label>
                ))}
              </div>
            </motion.div>

            {/* Optional Information */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="card-glass rounded-xl p-6"
            >
              <h2 className="font-serif text-xl font-semibold text-gold mb-4">Optional Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {OPTIONAL_INFO.map(info => (
                  <label key={info} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.optionalInfo.includes(info)}
                      onChange={() => handleCheckbox('optionalInfo', info)}
                      className="w-4 h-4 rounded border-gold/20 bg-dark-card accent-gold cursor-pointer"
                    />
                    <span className="text-gray-300 group-hover:text-white transition-colors text-sm">{info}</span>
                  </label>
                ))}
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className="flex gap-4"
            >
              <button
                type="submit"
                className="flex-1 btn-gold px-8 py-3.5 rounded-lg font-semibold transition-all hover:shadow-lg"
              >
                Next
              </button>
            </motion.div>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-dark-card border border-gold/30 text-white text-sm px-6 py-3 rounded-xl shadow-xl z-50"
        >
          {toast}
        </motion.div>
      )}
    </>
  )
}
