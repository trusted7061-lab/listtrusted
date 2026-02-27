import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion, AnimatePresence } from 'framer-motion'
import { getAllProfiles } from '../services/profileService'
import { defaultEscorts } from '../services/escortData'
import { getCityInfo, getAllCities, getAreasForCity, getSubLocationsForCity, majorCities } from '../services/locationsData'

// Generate dynamic city data for any location
const generateCityData = (cityName) => {
  const cityInfo = getCityInfo(cityName)
  const name = cityInfo?.name || cityName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  const state = cityInfo?.state || 'India'
  
  // Random image selection for non-major cities
  const defaultImages = [
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1584487702749-29a3e768a21a?w=1200&h=600&fit=crop'
  ]
  const imageIndex = name.length % defaultImages.length
  
  return {
    name,
    title: `Premium Escorts in ${name}`,
    description: `${name}'s trusted escort service offering sophisticated companionship for business and personal occasions in ${state}. Our elite escorts provide discreet, professional services.`,
    image: defaultImages[imageIndex],
    highlights: ['Hotel Services', 'Business Meetings', 'Private Events', 'Dinner Escorts'],
    state,
    isArea: cityInfo?.isArea || false,
    parentCity: cityInfo?.city || null
  }
}

function Location() {
  const { city } = useParams()
  const [openFAQ, setOpenFAQ] = useState(null)
  const [featuredEscorts, setFeaturedEscorts] = useState([])

  // City data with descriptions and images
  const cityData = {
    mumbai: {
      name: 'Mumbai',
      title: 'Premium Escorts in Mumbai',
      description: 'Experience the finest escortship services in Mumbai, India\'s financial capital. Our elite escorts offer sophisticated company for business events, social gatherings, or private occasions.',
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&h=600&fit=crop',
      highlights: ['Financial District Escorts', 'Bollywood Events', 'Five-Star Hotel Services', 'Airport Pickups'],
    },
    delhi: {
      name: 'Delhi',
      title: 'Elite Escorts in Delhi',
      description: 'Delhi\'s most exclusive escort service featuring sophisticated escorts for the distinguished clientele. Perfect for diplomatic events, corporate functions, and private engagements.',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&h=600&fit=crop',
      highlights: ['Diplomatic Events', 'Corporate Functions', 'Cultural Events', 'VIP Services'],
    },
    bangalore: {
      name: 'Bangalore',
      title: 'Premium Escorts in Bangalore',
      description: 'Bangalore\'s leading escort service with elegant escorts who understand the IT capital\'s sophisticated lifestyle. Ideal for tech events, conferences, and private meetings.',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=600&fit=crop',
      highlights: ['Tech Conference Escorts', 'Startup Events', 'International Clients', 'Luxury Hotels'],
    },
    hyderabad: {
      name: 'Hyderabad',
      title: 'Luxury Escorts in Hyderabad',
      description: 'Hyderabad\'s premier escort agency offering refined escortship for the city\'s elite. Our escorts are perfect for business dinners, social events, and cultural occasions.',
      image: 'https://images.unsplash.com/photo-1584487702749-29a3e768a21a?w=1200&h=600&fit=crop',
      highlights: ['Business Dinners', 'Cultural Events', 'Hi-Tech City Services', 'Hotel Meetups'],
    },
    pune: {
      name: 'Pune',
      title: 'Exclusive Escorts in Pune',
      description: 'Pune\'s most trusted escort service featuring educated and elegant escorts. Perfect for corporate professionals seeking sophisticated company.',
      image: 'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=1200&h=600&fit=crop',
      highlights: ['Corporate Events', 'Educational Escorts', 'Weekend Getaways', 'Private Meetings'],
    },
    goa: {
      name: 'Goa',
      title: 'Beach Escorts in Goa',
      description: 'Goa\'s finest escort service offering beach escorts and party escorts. Perfect for vacation escortship, beach resorts, and nightlife experiences.',
      image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&h=600&fit=crop',
      highlights: ['Beach Escorts', 'Party Escorts', 'Resort Services', 'Yacht Parties'],
    },
    chennai: {
      name: 'Chennai',
      title: 'Premium Escorts in Chennai',
      description: 'Chennai\'s most prestigious escort agency with cultured escorts who appreciate the city\'s rich heritage and modern lifestyle.',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop',
      highlights: ['Cultural Events', 'Business Meetings', 'Beach Resorts', 'Traditional Functions'],
    },
    kolkata: {
      name: 'Kolkata',
      title: 'Elite Escorts in Kolkata',
      description: 'Kolkata\'s leading escort service featuring sophisticated Bengali beauties and international escorts for the city\'s discerning elite.',
      image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&h=600&fit=crop',
      highlights: ['Cultural Programs', 'Business Events', 'Art Gallery Escorts', 'Fine Dining'],
    },
    chandigarh: {
      name: 'Chandigarh',
      title: 'Luxury Escorts in Chandigarh',
      description: 'Chandigarh\'s premium escort service with elegant escorts perfect for the planned city\'s sophisticated lifestyle.',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Party Escorts', 'Corporate Events', 'Private Meetings'],
    },
    jaipur: {
      name: 'Jaipur',
      title: 'Royal Escorts in Jaipur',
      description: 'Jaipur\'s exclusive escort service featuring royal escorts who embody the Pink City\'s regal charm and elegance.',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=600&fit=crop',
      highlights: ['Heritage Hotels', 'Royal Events', 'Tourism Escorts', 'Palace Visits'],
    },
    indore: {
      name: 'Indore',
      title: 'Premium Escorts in Indore',
      description: 'Indore\'s trusted escort service with sophisticated escorts for business and leisure engagements.',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop',
      highlights: ['Business Meetings', 'Hotel Services', 'Dinner Escorts', 'Private Events'],
    },
    ahmedabad: {
      name: 'Ahmedabad',
      title: 'Elite Escorts in Ahmedabad',
      description: 'Ahmedabad\'s finest escort agency featuring educated and elegant Gujarati escorts for the city\'s business community.',
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&h=600&fit=crop',
      highlights: ['Business Dinners', 'Cultural Events', 'Hotel Meetups', 'Corporate Functions'],
    },
    surat: {
      name: 'Surat',
      title: 'Premium Escorts in Surat',
      description: 'Surat\'s leading escort service with sophisticated escorts for the diamond city\'s affluent clientele.',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&h=600&fit=crop',
      highlights: ['Business Events', 'Hotel Services', 'Diamond Merchant Escorts', 'Private Meetings'],
    },
    lucknow: {
      name: 'Lucknow',
      title: 'Nawabi Escorts in Lucknow',
      description: 'Lucknow\'s premier escort service featuring elegant escorts who embody the city\'s nawabi culture and sophistication.',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=600&fit=crop',
      highlights: ['Cultural Events', 'Heritage Tours', 'Fine Dining', 'Business Meetings'],
    },
    nagpur: {
      name: 'Nagpur',
      title: 'Exclusive Escorts in Nagpur',
      description: 'Nagpur\'s trusted escort service offering sophisticated escortship for business and personal occasions.',
      image: 'https://images.unsplash.com/photo-1584487702749-29a3e768a21a?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Business Dinners', 'Private Events', 'Travel Escorts'],
    },
    visakhapatnam: {
      name: 'Visakhapatnam',
      title: 'Beach Escorts in Visakhapatnam',
      description: 'Visakhapatnam\'s finest escort service with beach escorts perfect for the port city\'s coastal lifestyle.',
      image: 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=1200&h=600&fit=crop',
      highlights: ['Beach Escorts', 'Hotel Services', 'Port City Events', 'Cruise Escorts'],
    },
    bhopal: {
      name: 'Bhopal',
      title: 'Premium Escorts in Bhopal',
      description: 'Bhopal\'s leading escort agency featuring sophisticated escorts for the city of lakes.',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop',
      highlights: ['Lake View Meetings', 'Hotel Services', 'Business Events', 'Cultural Functions'],
    },
    patna: {
      name: 'Patna',
      title: 'Elite Escorts in Patna',
      description: 'Patna\'s trusted escort service offering refined escortship for business and social occasions.',
      image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&h=600&fit=crop',
      highlights: ['Business Meetings', 'Hotel Services', 'Private Events', 'Dinner Escorts'],
    },
    vadodara: {
      name: 'Vadodara',
      title: 'Luxury Escorts in Vadodara',
      description: 'Vadodara\'s premier escort service with elegant escorts for the cultural capital of Gujarat.',
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&h=600&fit=crop',
      highlights: ['Cultural Events', 'Business Dinners', 'Hotel Meetups', 'Heritage Tours'],
    },
    agra: {
      name: 'Agra',
      title: 'Royal Escorts in Agra',
      description: 'Agra\'s exclusive escort service featuring escorts perfect for tourism and business in the city of Taj Mahal.',
      image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1200&h=600&fit=crop',
      highlights: ['Taj Mahal Tours', 'Heritage Hotels', 'Tourism Escorts', 'Business Meetings'],
    },
    nashik: {
      name: 'Nashik',
      title: 'Premium Escorts in Nashik',
      description: 'Nashik\'s trusted escort service with sophisticated escorts for India\'s wine capital.',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=600&fit=crop',
      highlights: ['Wine Tours', 'Hotel Services', 'Business Events', 'Weekend Getaways'],
    },
    kochi: {
      name: 'Kochi',
      title: 'Elite Escorts in Kochi',
      description: 'Kochi\'s finest escort agency featuring elegant escorts for Kerala\'s commercial capital and port city.',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&h=600&fit=crop',
      highlights: ['Port City Services', 'Backwater Tours', 'Business Meetings', 'Hotel Escorts'],
    },
    coimbatore: {
      name: 'Coimbatore',
      title: 'Premium Escorts in Coimbatore',
      description: 'Coimbatore\'s leading escort service offering refined escortship for Tamil Nadu\'s Manchester.',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop',
      highlights: ['Business Events', 'Hotel Services', 'Industrial Meetings', 'Hill Station Tours'],
    },
    thane: {
      name: 'Thane',
      title: 'Premium Escorts in Thane',
      description: 'Thane\'s finest escort service with sophisticated escorts for Mumbai\'s sister city.',
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Business Meetings', 'Private Events', 'Shopping Escorts'],
    },
    ghaziabad: {
      name: 'Ghaziabad',
      title: 'Elite Escorts in Ghaziabad',
      description: 'Ghaziabad\'s exclusive escort service featuring elegant escorts for NCR\'s business hub.',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&h=600&fit=crop',
      highlights: ['Business Events', 'Hotel Meetups', 'Corporate Functions', 'Dinner Escorts'],
    },
    ludhiana: {
      name: 'Ludhiana',
      title: 'Premium Escorts in Ludhiana',
      description: 'Ludhiana\'s leading escort agency with sophisticated Punjabi escorts for the industrial city.',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=600&fit=crop',
      highlights: ['Business Dinners', 'Hotel Services', 'Wedding Events', 'Party Escorts'],
    },
    faridabad: {
      name: 'Faridabad',
      title: 'Luxury Escorts in Faridabad',
      description: 'Faridabad\'s premium escort service offering refined escortship for NCR professionals.',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&h=600&fit=crop',
      highlights: ['Corporate Events', 'Hotel Services', 'Business Meetings', 'Private Functions'],
    },
    meerut: {
      name: 'Meerut',
      title: 'Elite Escorts in Meerut',
      description: 'Meerut\'s trusted escort service with elegant escorts for business and leisure.',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=600&fit=crop',
      highlights: ['Hotel Meetups', 'Business Dinners', 'Private Events', 'Travel Escorts'],
    },
    rajkot: {
      name: 'Rajkot',
      title: 'Premium Escorts in Rajkot',
      description: 'Rajkot\'s finest escort agency featuring sophisticated Gujarati escorts.',
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&h=600&fit=crop',
      highlights: ['Business Events', 'Hotel Services', 'Cultural Functions', 'Dinner Escorts'],
    },
    'kalyan-dombivli': {
      name: 'Kalyan-Dombivli',
      title: 'Exclusive Escorts in Kalyan-Dombivli',
      description: 'Kalyan-Dombivli\'s leading escort service with elegant escorts for the twin city.',
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Private Meetings', 'Business Events', 'Travel Escorts'],
    },
    varanasi: {
      name: 'Varanasi',
      title: 'Premium Escorts in Varanasi',
      description: 'Varanasi\'s exclusive escort service offering sophisticated escortship in the spiritual city.',
      image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Tourism Escorts', 'Business Meetings', 'Cultural Events'],
    },
    srinagar: {
      name: 'Srinagar',
      title: 'Luxury Escorts in Srinagar',
      description: 'Srinagar\'s premier escort service with elegant escorts for Kashmir\'s paradise.',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=600&fit=crop',
      highlights: ['Houseboat Services', 'Shikara Escorts', 'Hotel Meetups', 'Tourism Escorts'],
    },
    aurangabad: {
      name: 'Aurangabad',
      title: 'Elite Escorts in Aurangabad',
      description: 'Aurangabad\'s finest escort agency featuring escorts perfect for the city of heritage.',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop',
      highlights: ['Heritage Tours', 'Hotel Services', 'Business Events', 'Ajanta Ellora Tours'],
    },
    dhanbad: {
      name: 'Dhanbad',
      title: 'Premium Escorts in Dhanbad',
      description: 'Dhanbad\'s trusted escort service with sophisticated escorts for the coal capital.',
      image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Business Meetings', 'Private Events', 'Dinner Escorts'],
    },
    amritsar: {
      name: 'Amritsar',
      title: 'Royal Escorts in Amritsar',
      description: 'Amritsar\'s exclusive escort service featuring elegant Punjabi escorts.',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=600&fit=crop',
      highlights: ['Golden Temple Tours', 'Hotel Services', 'Business Events', 'Cultural Functions'],
    },
    'navi-mumbai': {
      name: 'Navi Mumbai',
      title: 'Premium Escorts in Navi Mumbai',
      description: 'Navi Mumbai\'s leading escort service with sophisticated escorts for the planned city.',
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&h=600&fit=crop',
      highlights: ['Corporate Hub', 'Hotel Services', 'Business Meetings', 'Private Events'],
    },
    'allahabad-prayagraj': {
      name: 'Allahabad (Prayagraj)',
      title: 'Elite Escorts in Allahabad (Prayagraj)',
      description: 'Prayagraj\'s finest escort agency offering refined escortship in the city of rivers.',
      image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Tourism Escorts', 'Business Meetings', 'Cultural Events'],
    },
    howrah: {
      name: 'Howrah',
      title: 'Premium Escorts in Howrah',
      description: 'Howrah\'s trusted escort service with elegant escorts for Kolkata\'s sister city.',
      image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&h=600&fit=crop',
      highlights: ['Hotel Meetups', 'Business Events', 'Private Meetings', 'Station Escorts'],
    },
    ranchi: {
      name: 'Ranchi',
      title: 'Luxury Escorts in Ranchi',
      description: 'Ranchi\'s premier escort service featuring sophisticated escorts for Jharkhand\'s capital.',
      image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Business Dinners', 'Hill Station Tours', 'Private Events'],
    },
    jabalpur: {
      name: 'Jabalpur',
      title: 'Elite Escorts in Jabalpur',
      description: 'Jabalpur\'s exclusive escort service with elegant escorts for the marble city.',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Tourism Escorts', 'Business Meetings', 'Marble Rocks Tours'],
    },
    gwalior: {
      name: 'Gwalior',
      title: 'Royal Escorts in Gwalior',
      description: 'Gwalior\'s premium escort agency featuring regal escorts for the royal city.',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop',
      highlights: ['Heritage Hotels', 'Fort Tours', 'Business Events', 'Cultural Functions'],
    },
    vijayawada: {
      name: 'Vijayawada',
      title: 'Premium Escorts in Vijayawada',
      description: 'Vijayawada\'s leading escort service with sophisticated escorts for Andhra Pradesh.',
      image: 'https://images.unsplash.com/photo-1584487702749-29a3e768a21a?w=1200&h=600&fit=crop',
      highlights: ['Business Hub', 'Hotel Services', 'River View Escorts', 'Corporate Events'],
    },
    jodhpur: {
      name: 'Jodhpur',
      title: 'Royal Escorts in Jodhpur',
      description: 'Jodhpur\'s exclusive escort service featuring royal Rajasthani escorts in the Blue City.',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=600&fit=crop',
      highlights: ['Palace Hotels', 'Heritage Tours', 'Desert Safaris', 'Royal Events'],
    },
    madurai: {
      name: 'Madurai',
      title: 'Premium Escorts in Madurai',
      description: 'Madurai\'s finest escort agency with cultured Tamil escorts for the temple city.',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop',
      highlights: ['Temple Tours', 'Hotel Services', 'Business Meetings', 'Cultural Events'],
    },
    raipur: {
      name: 'Raipur',
      title: 'Elite Escorts in Raipur',
      description: 'Raipur\'s trusted escort service offering refined escortship in Chhattisgarh\'s capital.',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Business Events', 'Private Meetings', 'Corporate Functions'],
    },
    kota: {
      name: 'Kota',
      title: 'Premium Escorts in Kota',
      description: 'Kota\'s leading escort service with sophisticated escorts for the education city.',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=600&fit=crop',
      highlights: ['Hotel Meetups', 'Business Dinners', 'Private Events', 'Tourism Escorts'],
    },
    guwahati: {
      name: 'Guwahati',
      title: 'Luxury Escorts in Guwahati',
      description: 'Guwahati\'s premier escort agency featuring elegant escorts for Northeast\'s gateway.',
      image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&h=600&fit=crop',
      highlights: ['River Cruise Escorts', 'Hotel Services', 'Business Events', 'Tourism Escorts'],
    },
    solapur: {
      name: 'Solapur',
      title: 'Elite Escorts in Solapur',
      description: 'Solapur\'s exclusive escort service with elegant escorts for business and leisure.',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Business Meetings', 'Private Events', 'Textile Hub Escorts'],
    },
    'hubli-dharwad': {
      name: 'Hubli-Dharwad',
      title: 'Premium Escorts in Hubli-Dharwad',
      description: 'Hubli-Dharwad\'s trusted escort service offering sophisticated escortship in the twin cities.',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Business Events', 'Educational Hub', 'Private Meetings'],
    },
    bareilly: {
      name: 'Bareilly',
      title: 'Elite Escorts in Bareilly',
      description: 'Bareilly\'s leading escort agency with refined escorts for North Indian hospitality.',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=600&fit=crop',
      highlights: ['Hotel Meetups', 'Business Dinners', 'Private Events', 'Shopping Escorts'],
    },
    moradabad: {
      name: 'Moradabad',
      title: 'Premium Escorts in Moradabad',
      description: 'Moradabad\'s finest escort service with sophisticated escorts for the brass city.',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Business Events', 'Industrial Meetings', 'Private Functions'],
    },
    'mysuru-mysore': {
      name: 'Mysuru (Mysore)',
      title: 'Royal Escorts in Mysuru (Mysore)',
      description: 'Mysuru\'s exclusive escort service featuring royal escorts in the palace city.',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=600&fit=crop',
      highlights: ['Palace Tours', 'Heritage Hotels', 'Yoga Retreats', 'Cultural Events'],
    },
    tiruchirappalli: {
      name: 'Tiruchirappalli',
      title: 'Premium Escorts in Tiruchirappalli',
      description: 'Tiruchirappalli\'s leading escort service with elegant Tamil escorts for the temple city.',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop',
      highlights: ['Temple Tours', 'Hotel Services', 'Business Meetings', 'Rock Fort Tours'],
    },
    salem: {
      name: 'Salem',
      title: 'Elite Escorts in Salem',
      description: 'Salem\'s trusted escort service offering refined escortship in Tamil Nadu\'s steel city.',
      image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Business Events', 'Hill Station Tours', 'Industrial Meetings'],
    },
    aligarh: {
      name: 'Aligarh',
      title: 'Premium Escorts in Aligarh',
      description: 'Aligarh\'s exclusive escort agency with sophisticated escorts for the lock city.',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=600&fit=crop',
      highlights: ['Hotel Meetups', 'Business Dinners', 'University Events', 'Private Meetings'],
    },
    bhubaneswar: {
      name: 'Bhubaneswar',
      title: 'Luxury Escorts in Bhubaneswar',
      description: 'Bhubaneswar\'s premier escort service featuring elegant escorts for Odisha\'s capital.',
      image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&h=600&fit=crop',
      highlights: ['Temple City Tours', 'Hotel Services', 'Business Events', 'Cultural Functions'],
    },
    jalandhar: {
      name: 'Jalandhar',
      title: 'Elite Escorts in Jalandhar',
      description: 'Jalandhar\'s finest escort service with sophisticated Punjabi escorts.',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Business Events', 'Sports City Escorts', 'Party Functions'],
    },
    gorakhpur: {
      name: 'Gorakhpur',
      title: 'Premium Escorts in Gorakhpur',
      description: 'Gorakhpur\'s leading escort agency offering refined escortship in Eastern UP.',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=600&fit=crop',
      highlights: ['Hotel Meetups', 'Business Dinners', 'Temple Tours', 'Private Events'],
    },
    guntur: {
      name: 'Guntur',
      title: 'Elite Escorts in Guntur',
      description: 'Guntur\'s exclusive escort service with elegant escorts for Andhra Pradesh.',
      image: 'https://images.unsplash.com/photo-1584487702749-29a3e768a21a?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Business Events', 'Spice City Escorts', 'Private Meetings'],
    },
    bikaner: {
      name: 'Bikaner',
      title: 'Royal Escorts in Bikaner',
      description: 'Bikaner\'s premium escort service featuring royal Rajasthani escorts in the desert city.',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=600&fit=crop',
      highlights: ['Desert Safaris', 'Heritage Hotels', 'Camel Festival Escorts', 'Palace Tours'],
    },
    noida: {
      name: 'Noida',
      title: 'Luxury Escorts in Noida',
      description: 'Noida\'s finest escort agency with sophisticated escorts for NCR\'s IT hub.',
      image: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&h=600&fit=crop',
      highlights: ['Corporate Events', 'Hotel Services', 'Business Meetings', 'Mall Escorts'],
    },
    firozabad: {
      name: 'Firozabad',
      title: 'Premium Escorts in Firozabad',
      description: 'Firozabad\'s trusted escort service with elegant escorts for the glass city.',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Business Events', 'Industrial Meetings', 'Private Functions'],
    },
    jamshedpur: {
      name: 'Jamshedpur',
      title: 'Elite Escorts in Jamshedpur',
      description: 'Jamshedpur\'s leading escort service offering refined escortship in the steel city.',
      image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&h=600&fit=crop',
      highlights: ['Hotel Meetups', 'Corporate Events', 'Business Dinners', 'Industrial Hub'],
    },
    bhavnagar: {
      name: 'Bhavnagar',
      title: 'Premium Escorts in Bhavnagar',
      description: 'Bhavnagar\'s exclusive escort agency with sophisticated Gujarati escorts.',
      image: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1200&h=600&fit=crop',
      highlights: ['Port City Services', 'Hotel Meetups', 'Business Events', 'Beach Escorts'],
    },
    cuttack: {
      name: 'Cuttack',
      title: 'Elite Escorts in Cuttack',
      description: 'Cuttack\'s finest escort service with elegant escorts for Odisha\'s silver city.',
      image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Business Meetings', 'Festival Escorts', 'Cultural Events'],
    },
    dehradun: {
      name: 'Dehradun',
      title: 'Luxury Escorts in Dehradun',
      description: 'Dehradun\'s premier escort service featuring elegant escorts in Uttarakhand\'s capital.',
      image: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&h=600&fit=crop',
      highlights: ['Hill Station Romance', 'Hotel Services', 'Tourist Escorts', 'Weekend Getaways'],
    },
    asansol: {
      name: 'Asansol',
      title: 'Premium Escorts in Asansol',
      description: 'Asansol\'s trusted escort service with sophisticated escorts for West Bengal.',
      image: 'https://images.unsplash.com/photo-1558431382-27e303142255?w=1200&h=600&fit=crop',
      highlights: ['Hotel Services', 'Industrial Hub', 'Business Meetings', 'Private Events'],
    },
    nellore: {
      name: 'Nellore',
      title: 'Elite Escorts in Nellore',
      description: 'Nellore\'s exclusive escort service offering refined escortship in Andhra Pradesh.',
      image: 'https://images.unsplash.com/photo-1584487702749-29a3e768a21a?w=1200&h=600&fit=crop',
      highlights: ['Beach Escorts', 'Hotel Services', 'Business Events', 'Temple Tours'],
    },
    ajmer: {
      name: 'Ajmer',
      title: 'Royal Escorts in Ajmer',
      description: 'Ajmer\'s premium escort agency featuring elegant Rajasthani escorts in the pilgrimage city.',
      image: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&h=600&fit=crop',
      highlights: ['Heritage Hotels', 'Religious Tourism', 'Hotel Services', 'Cultural Events'],
    },
    kollam: {
      name: 'Kollam',
      title: 'Premium Escorts in Kollam',
      description: 'Kollam\'s leading escort service with elegant Kerala escorts for the cashew city.',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&h=600&fit=crop',
      highlights: ['Backwater Tours', 'Beach Escorts', 'Hotel Services', 'Houseboat Romance'],
    },
    mangalore: {
      name: 'Mangalore',
      title: 'Elite Escorts in Mangalore',
      description: 'Mangalore\'s finest escort service featuring sophisticated coastal escorts.',
      image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&h=600&fit=crop',
      highlights: ['Beach Escorts', 'Port City Services', 'Hotel Meetups', 'Business Events'],
    },
  }

  const normalizedCity = city?.toLowerCase()
  // Use predefined city data if available, otherwise generate dynamically
  const currentCity = cityData[normalizedCity] || (city ? generateCityData(city) : cityData.mumbai)

  // Load featured escorts for this city
  useEffect(() => {
    const loadFeaturedEscorts = () => {
      // Get all profiles including advertiser profiles
      const advertiserProfiles = getAllProfiles()

      // Combine default escorts with advertiser profiles
      const combinedEscorts = [...defaultEscorts, ...advertiserProfiles]
      
      // Filter escorts by current city
      const cityEscorts = combinedEscorts.filter(
        escort => escort.location.toLowerCase() === currentCity.name.toLowerCase()
      )
      
      // Get up to 6 featured escorts
      setFeaturedEscorts(cityEscorts.slice(0, 6))
    }

    loadFeaturedEscorts()
    
    // Listen for profile updates
    const handleProfileUpdate = () => {
      console.log('Profiles updated, reloading location escorts')
      loadFeaturedEscorts()
    }
    
    window.addEventListener('profilesUpdated', handleProfileUpdate)
    
    return () => {
      window.removeEventListener('profilesUpdated', handleProfileUpdate)
    }
  }, [currentCity.name])

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  // City-specific FAQs
  const cityFAQs = [
    {
      question: `How do I book an escort in ${currentCity.name}?`,
      answer: `Booking an escort in ${currentCity.name} is simple and discreet. Contact us via WhatsApp or our contact form with your preferred date, time, and any special requests. Our team will match you with available escorts in ${currentCity.name} and handle all arrangements professionally.`
    },
    {
      question: `What areas of ${currentCity.name} do you cover?`,
      answer: `We provide comprehensive escort services across all major areas of ${currentCity.name}, including premium hotels, business districts, residential areas, and airports. Our escorts can travel to your preferred location within ${currentCity.name} and surrounding areas.`
    },
    {
      question: `Are your ${currentCity.name} escorts available 24/7?`,
      answer: `Yes, our elite escort services in ${currentCity.name} are available 24 hours a day, 7 days a week. Whether you need daytime companionship, evening escorts, or overnight bookings, we can accommodate your schedule in ${currentCity.name}.`
    },
    {
      question: `What makes your ${currentCity.name} escort service premium?`,
      answer: `Our ${currentCity.name} escorts are carefully selected for their sophistication, elegance, and professionalism. They understand the unique lifestyle and expectations of ${currentCity.name}'s elite clientele and provide exceptional companionship for business events, social gatherings, and private occasions.`
    },
    {
      question: `How is discretion maintained in ${currentCity.name}?`,
      answer: `We maintain the highest standards of privacy and confidentiality in ${currentCity.name}. All bookings are handled discreetly, we never share client information, and our escorts are trained professionals who understand the importance of discretion in ${currentCity.name}'s business and social circles.`
    },
    {
      question: `Can I request a specific escort from your ${currentCity.name} gallery?`,
      answer: `Absolutely! Browse our ${currentCity.name} escort gallery and request your preferred companion. We'll confirm their availability for your desired date and time in ${currentCity.name} and arrange all the details for your meeting.`
    },
    {
      question: `What services are included with ${currentCity.name} escorts?`,
      answer: `Our ${currentCity.name} escorts provide sophisticated companionship for various occasions including business dinners, corporate events, social gatherings, travel companionship, and private meetings. Services are customized based on your specific requirements in ${currentCity.name}.`
    },
    {
      question: `How far in advance should I book in ${currentCity.name}?`,
      answer: `For best availability in ${currentCity.name}, we recommend booking at least 24-48 hours in advance. However, we also accommodate last-minute bookings based on escort availability in ${currentCity.name}. Contact us to check immediate availability.`
    },
    {
      question: `What payment methods do you accept in ${currentCity.name}?`,
      answer: `We accept multiple secure payment methods in ${currentCity.name} including cash, bank transfers, and digital payments. Complete payment details and terms will be provided during your booking confirmation for ${currentCity.name} services.`
    },
    {
      question: `Do you offer both outcall and incall services in ${currentCity.name}?`,
      answer: `Yes, we provide both outcall services (escort visits your location) and incall services (you visit a designated location) in ${currentCity.name}. Most clients in ${currentCity.name} prefer outcall services to their hotel or private residence.`
    },
    {
      question: `Can ${currentCity.name} escorts accompany me for travel or events?`,
      answer: `Certainly! Our ${currentCity.name} escorts are available for travel companionship within the city and beyond, including domestic and international trips. They can also accompany you to social events, corporate functions, and special occasions in ${currentCity.name}.`
    },
    {
      question: `What is your cancellation policy in ${currentCity.name}?`,
      answer: `We understand that plans can change. Please contact us at least 4 hours before your scheduled appointment in ${currentCity.name} to cancel or reschedule. Our complete cancellation policy will be explained during your booking confirmation.`
    },
    {
      question: `Are photos on ${currentCity.name} escort profiles real and recent?`,
      answer: `Yes, we guarantee that all photos are authentic and recently taken. Our verification process ensures that every ${currentCity.name} escort's profile photos are genuine and match their actual appearance. We maintain strict standards for profile authenticity and verification.`
    },
    {
      question: `What safety precautions are taken during bookings in ${currentCity.name}?`,
      answer: `Your safety is crucial. All our ${currentCity.name} escorts undergo thorough background verification and health screenings. We maintain confidential booking records, provide secure payment methods, and have emergency support available 24/7 for all bookings in ${currentCity.name}.`
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
    <>
      <Helmet>
        {/* Primary Meta Tags - Enhanced for Voice Search & Long-tail Keywords */}
        <title>Premium Escorts in {currentCity.name} | Luxury Companion Services | Trusted Escort</title>
        <meta name="title" content={`Premium Escorts in ${currentCity.name} | Luxury Companion Services | Trusted Escort`} />
        <meta name="description" content={`Hire premium escorts in ${currentCity.name}. Professional, discreet, and verified companions for business meetings, events, and private occasions. Book elite escorts online at Trusted Escort.`} />
        <meta name="keywords" content={`${currentCity.name} escorts, ${currentCity.name} escort service, premium escorts ${currentCity.name}, elite escorts ${currentCity.name}, luxury companionship ${currentCity.name}, ${currentCity.name} companion services, hire escorts ${currentCity.name}, independent escorts ${currentCity.name}, professional escorts ${currentCity.name}, verified escorts ${currentCity.name}, high class escorts ${currentCity.name}, call girls ${currentCity.name}, best escorts in ${currentCity.name}, trusted escorts`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
        <link rel="canonical" href={`https://trustedescort.in/escorts/in/${normalizedCity}`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`https://trustedescort.in/escorts/in/${normalizedCity}`} />
        <meta property="og:title" content={`Premium Escorts in ${currentCity.name} | Trusted Escort`} />
        <meta property="og:description" content={`Discover elite and verified escorts in ${currentCity.name}. Premium companion services for business, events, and private occasions. Book today at Trusted Escort.`} />
        <meta property="og:image" content={currentCity.image} />
        <meta property="og:image:alt" content={`Professional escorts in ${currentCity.name}`} />
        <meta property="og:locale" content="en_IN" />
        <meta property="og:site_name" content="Trusted Escort" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content={`https://trustedescort.in/escorts/in/${normalizedCity}`} />
        <meta name="twitter:title" content={`Premium Escorts in ${currentCity.name}`} />
        <meta name="twitter:description" content={`Elite escorts in ${currentCity.name}. Verified, professional companions for all occasions. Book premium services at Trusted Escort.`} />
        <meta name="twitter:image" content={currentCity.image} />
        <meta name="twitter:creator" content="@TrustedEscort" />
        
        {/* Additional SEO - Local Business Focus */}
        <meta name="language" content="English" />
        <meta name="target" content="all" />
        <meta name="revisit-after" content="7 days" />
        <meta name="author" content="Trusted Escort" />
        <meta name="subject" content={`Escort Services in ${currentCity.name}`} />
        <meta name="rating" content="safe for kids" />
        <meta name="distribution" content="Global" />
        
        {/* Geo-targeting & Local SEO */}
        <meta name="geo.region" content={`IN-${currentCity.state?.substring(0, 2).toUpperCase() || 'IN'}`} />
        <meta name="geo.placename" content={currentCity.name} />
        <meta name="ICBM" content="19.0760,72.8777" />
        
        {/* Structured Data - LocalBusiness Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "@id": `https://trustedescort.in/escorts/in/${normalizedCity}`,
            "name": `Trusted Escort - ${currentCity.name}`,
            "description": currentCity.description,
            "url": `https://trustedescort.in/escorts/in/${normalizedCity}`,
            "image": currentCity.image,
            "telephone": "+91-XXXXXXXXXX",
            "email": "contact@trustedescort.in",
            "areaServed": {
              "@type": "City",
              "name": currentCity.name,
              "addressCountry": "IN",
              "addressRegion": currentCity.state || "India"
            },
            "address": {
              "@type": "PostalAddress",
              "addressLocality": currentCity.name,
              "addressCountry": "IN",
              "addressRegion": currentCity.state || "India"
            },
            "priceRange": "₹₹₹",
            "sameAs": [
              "https://www.instagram.com/trustedescort",
              "https://www.facebook.com/trustedescort"
            ]
          })}
        </script>

        {/* Aggregate Offer Schema - Service Pricing */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AggregateOffer",
            "name": `Escort Services in ${currentCity.name}`,
            "description": `Premium escort services available in ${currentCity.name}. Professional, verified, and discreet companions.`,
            "offers": [
              {
                "@type": "Offer",
                "name": "Premium Escort Service",
                "description": `Professional escort companion service in ${currentCity.name}`,
                "url": `https://trustedescort.in/escorts/in/${normalizedCity}`,
                "price": "5000",
                "priceCurrency": "INR",
                "availability": "https://schema.org/InStock",
                "validFrom": new Date().toISOString().split('T')[0]
              },
              {
                "@type": "Offer",
                "name": "Luxury Escort Service",
                "description": `Elite luxury escort service for special occasions in ${currentCity.name}`,
                "url": `https://trustedescort.in/escorts/in/${normalizedCity}`,
                "price": "10000",
                "priceCurrency": "INR",
                "availability": "https://schema.org/InStock",
                "validFrom": new Date().toISOString().split('T')[0]
              }
            ],
            "priceCurrency": "INR",
            "lowPrice": "5000",
            "highPrice": "50000",
            "offerCount": "50+"
          })}
        </script>

        {/* Service Schema - Enhanced */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": `Premium Escorts in ${currentCity.name}`,
            "description": `Professional escort and companion services in ${currentCity.name}. Verified, discreet, and elite escorts available for business meetings, events, and private occasions.`,
            "provider": {
              "@type": "LocalBusiness",
              "name": "Trusted Escort",
              "url": "https://trustedescort.in",
              "sameAs": [
                "https://www.instagram.com/trustedescort",
                "https://www.facebook.com/trustedescort"
              ]
            },
            "serviceType": "Companion Services",
            "areaServed": {
              "@type": "City",
              "name": currentCity.name,
              "addressCountry": "IN"
            },
            "availableChannel": {
              "@type": "ServiceChannel",
              "serviceUrl": `https://trustedescort.in/escorts/in/${normalizedCity}`
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": `Escort Services in ${currentCity.name}`,
              "itemListElement": [
                {
                  "@type": "Offer",
                  "name": "Premium Companions",
                  "description": "Elite escort services for all occasions"
                },
                {
                  "@type": "Offer",
                  "name": "Verified Profiles",
                  "description": "Background verified professional escorts"
                },
                {
                  "@type": "Offer",
                  "name": "Discreet Services",
                  "description": "100% confidential and private services"
                }
              ]
            }
          })}
        </script>

        {/* FAQ Schema - Enhanced */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": cityFAQs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          })}
        </script>

        {/* Breadcrumb Schema - Enhanced */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://trustedescort.in"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Browse Escorts",
                "item": "https://trustedescort.in/escorts"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Locations",
                "item": "https://trustedescort.in/escorts"
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": currentCity.name,
                "item": `https://trustedescort.in/escorts/in/${normalizedCity}`
              }
            ]
          })}
        </script>

        {/* Contact Point Schema */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPoint",
            "telephone": "+91-XXXXXXXXXX",
            "contactType": "Customer Service",
            "email": "contact@trustedescort.in",
            "areaServed": "IN",
            "availableLanguage": ["en", "hi"]
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 bg-dark-bg overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/hero-section-2.png"
            alt={`${currentCity.title} - Premium escort services in ${currentCity.name}, India`}
            className="w-full h-full object-cover"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-bg/80 via-dark-bg/70 to-dark-bg" />
        </div>

        {/* Content */}
        <div className="relative max-w-6xl mx-auto px-4 md:px-6">
          <Link to="/" className="text-gold hover:text-gold/80 text-sm mb-6 inline-flex items-center gap-2" aria-label="Go back to home page">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-gold mb-6">
              {currentCity.title}
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {currentCity.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Internal Linking: Sublocations & Metro Locations */}
      <section className="py-12 bg-dark-card border-t border-gold/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-serif font-bold text-gold mb-4">Explore areas in {currentCity.name}</h3>
              <p className="text-gray-400 mb-4">Find escorts by locality and nearby cities within {currentCity.name}.</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {(() => {
                  const cityForAreas = currentCity.isArea ? (currentCity.city || currentCity.parentCity || currentCity.name) : currentCity.name
                  const areas = getAreasForCity(cityForAreas) || []
                  if (areas.length === 0) return <p className="text-gray-500">No sublocations available.</p>
                  return areas.slice(0, 20).map((area) => {
                    const slug = area.toLowerCase().replace(/\s+/g, '-').replace(/,/g, '')
                    return (
                      <Link key={area} to={`/escorts/in/${slug}`} className="text-gray-300 hover:text-gold text-sm">{area}</Link>
                    )
                  })
                })()}
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-serif font-bold text-gold mb-4">Metro locations</h3>
              <p className="text-gray-400 mb-4">Popular metro cities you can browse instantly.</p>
              <div className="flex flex-wrap gap-2">
                {majorCities && majorCities.map((m) => {
                  const slug = m.toLowerCase().replace(/\s+/g, '-')
                  return (
                    <Link key={m} to={`/escorts/in/${slug}`} className="px-3 py-1 bg-dark-bg/60 text-gray-300 rounded-md text-sm hover:bg-gold/10">{m}</Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Escorts / Location Ads Section */}
      <section className="py-20 bg-dark-card border-t border-gold/10">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-serif font-bold text-gold mb-4">
              Featured {currentCity.name} Escorts
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Meet our elite companions available in {currentCity.name}
            </p>
          </motion.div>

          {featuredEscorts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
            >
              {featuredEscorts.map((escort, index) => (
                <motion.div
                  key={escort.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="card-glass overflow-hidden group"
                >
                  <Link to={`/escorts/${escort.name.toLowerCase().replace(/\s+/g, '-')}-${escort.id}`} aria-label={`View profile of ${escort.name}, ${escort.age} year old escort in ${escort.location}`}>
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <img
                        src={escort.image}
                        alt={`${escort.name}, ${escort.age} - ${escort.description} - Elite escort in ${escort.location}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/50 to-transparent opacity-80" />
                      
                      {/* Verified Badge */}
                      {escort.verified && (
                        <div className="absolute top-4 right-4 bg-gold/90 backdrop-blur-sm text-dark-bg px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </div>
                      )}
                      
                      {/* Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <h3 className="text-2xl font-serif font-bold text-white mb-1">
                          {escort.name}, {escort.age}
                        </h3>
                        <div className="flex items-center gap-2 text-gold mb-2">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm">{escort.location}</span>
                        </div>
                        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
                          {escort.description}
                        </p>
                        
                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-4 h-4 ${i < Math.floor(escort.rating) ? 'text-gold' : 'text-gray-600'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-gold font-semibold text-sm">{escort.rating}</span>
                        </div>

                        {/* Services */}
                        <div className="flex flex-wrap gap-2">
                          {escort.services.slice(0, 3).map((service, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-dark-bg/80 backdrop-blur-sm text-gray-300 rounded-full"
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-center py-12"
            >
              <p className="text-gray-400 text-lg mb-6">
                New escorts are joining soon in {currentCity.name}. Check back later!
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <Link to={`/escorts/in/${currentCity.name.toLowerCase().replace(/\s+/g, '-')}`} aria-label={`View complete gallery of all escorts available in ${currentCity.name}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-gold text-lg px-8 py-4"
                type="button"
              >
                View All {currentCity.name} Escorts
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 bg-dark-card border-t border-gold/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-serif font-bold text-gold mb-4">
              Services in {currentCity.name}
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Discover our premium escort services tailored for {currentCity.name}'s elite clientele
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {currentCity.highlights.map((highlight, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="card-glass p-6 text-center"
              >
                <div className="text-3xl mb-3">✨</div>
                <h3 className="text-lg font-semibold text-white">{highlight}</h3>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* SEO Content Section - Location-Specific Information */}
      <section className="py-20 bg-dark-bg border-t border-gold/10">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <h2 className="text-3xl font-serif font-bold text-gold mb-6">
                Premium Escort Services in {currentCity.name}
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-4">
                Trusted Escort is {currentCity.name}'s most trusted and verified escort service platform, connecting discerning clients with sophisticated, professional companions. Our carefully selected escorts in {currentCity.name} are known for their elegance, discretion, and ability to provide exceptional companionship for any occasion.
              </p>
              <p className="text-lg text-gray-300 leading-relaxed">
                Whether you're seeking a companion for business meetings, corporate events, social gatherings, or private occasions, our elite escort service in {currentCity.name} guarantees professional, confidential, and unforgettable experiences.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-serif font-bold text-gold mb-4">
                Why Choose Our {currentCity.name} Escorts?
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-gold font-bold">✓</span>
                  <span className="text-gray-300"><strong>Verified & Authentic Profiles:</strong> All our escorts in {currentCity.name} are thoroughly screened and verified for your safety and satisfaction.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold font-bold">✓</span>
                  <span className="text-gray-300"><strong>Complete Discretion & Privacy:</strong> Your confidentiality is our top priority. 100% private and secure bookings with non-disclosure guarantees.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold font-bold">✓</span>
                  <span className="text-gray-300"><strong>Professional & Educated Companions:</strong> Our {currentCity.name} escorts are cultured, educated, and well-versed in etiquette, making them perfect for any social situation.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold font-bold">✓</span>
                  <span className="text-gray-300"><strong>24/7 Booking & Support:</strong> Easy online booking platform with round-the-clock customer support for a hassle-free experience.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-gold font-bold">✓</span>
                  <span className="text-gray-300"><strong>Flexible & Affordable Rates:</strong> Competitive pricing packages suitable for all occasions and budgets in {currentCity.name}.</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-serif font-bold text-gold mb-4">
                Types of Escort Services Available in {currentCity.name}
              </h3>
              <p className="text-gray-300 mb-4">
                Our comprehensive escort services in {currentCity.name} cater to diverse needs:
              </p>
              <ul className="space-y-2 text-gray-300">
                <li>• <strong>Business Meeting Companions:</strong> Professional escorts for corporate events, conferences, and client entertainment</li>
                <li>• <strong>Social Event Escorts:</strong> Refined companions perfect for parties, weddings, and social gatherings</li>
                <li>• <strong>Dinner Date Escorts:</strong> Charming and cultured companions for fine dining and restaurant experiences</li>
                <li>• <strong>Hotel Escorts:</strong> Private companionship services available at luxury hotels in {currentCity.name}</li>
                <li>• <strong>Travel Companions:</strong> Engaging escorts for trips and vacation experiences</li>
                <li>• <strong>Personal Assistant Escorts:</strong> Discreet companions available for personal engagements</li>
              </ul>
            </div>

            <div>
              <h3 className="text-2xl font-serif font-bold text-gold mb-4">
                How to Book an Escort in {currentCity.name}
              </h3>
              <ol className="space-y-3 text-gray-300">
                <li className="flex gap-3">
                  <span className="text-gold font-bold">1.</span>
                  <span>Browse our gallery of verified {currentCity.name} escorts with detailed profiles and photos</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gold font-bold">2.</span>
                  <span>Select your preferred companion based on your requirements and preferences</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gold font-bold">3.</span>
                  <span>Make a secure online booking with our simple and encrypted payment process</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-gold font-bold">4.</span>
                  <span>Receive confirmation details and enjoy your experience with professional discretion</span>
                </li>
              </ol>
            </div>

            <div className="bg-dark-card/50 border border-gold/20 rounded-lg p-6">
              <h3 className="text-xl font-serif font-bold text-gold mb-3">
                Safe & Secure Escorts in {currentCity.name}
              </h3>
              <p className="text-gray-300">
                Your safety and security are paramount. Trusted Escort implements strict safety protocols, ensures STI-free status verification, maintains confidentiality agreements, and provides secure payment systems for all bookings in {currentCity.name}. All escorts are trained in professional conduct and client care.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* View Escorts CTA */}
      <section className="py-20 bg-dark-bg border-t border-gold/10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-4xl font-serif font-bold text-gold">
              View Our {currentCity.name} Escorts
            </h2>
            <p className="text-xl text-gray-300">
              Browse our exclusive selection of elite escorts available in {currentCity.name}.
            </p>
            <Link to={`/escorts/in/${currentCity.name.toLowerCase().replace(/\s+/g, '-')}`} aria-label={`Browse all available escorts in ${currentCity.name}`}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-gold"
                type="button"
              >
                Browse {currentCity.name} Escorts
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Frequently Asked Questions Section - 6 Left, 6 Right */}
      <section className="py-20 bg-dark-bg border-t border-gold/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-serif font-bold text-gold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-300">
              Common questions about our escort services in {currentCity.name}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {/* Left Column - First 6 FAQs */}
            <div className="space-y-3">
              {cityFAQs.slice(0, 6).map((faq, index) => (
                <motion.div
                  key={`left-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="border border-gold/20 rounded-lg overflow-hidden bg-dark-card/50 backdrop-blur-sm"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gold/5 transition-colors"
                    aria-expanded={openFAQ === index}
                    aria-controls={`faq-answer-${index}`}
                    type="button"
                  >
                    <span className="text-white font-semibold text-lg pr-4">{faq.question}</span>
                    <motion.svg
                      animate={{ rotate: openFAQ === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-6 h-6 text-gold flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {openFAQ === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div id={`faq-answer-${index}`} className="px-6 pb-5 pt-2 text-gray-300 leading-relaxed border-t border-gold/10">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Right Column - Last 6 FAQs */}
            <div className="space-y-3">
              {cityFAQs.slice(6, 12).map((faq, index) => (
                <motion.div
                  key={`right-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (index + 6) * 0.05 }}
                  className="border border-gold/20 rounded-lg overflow-hidden bg-dark-card/50 backdrop-blur-sm"
                >
                  <button
                    onClick={() => toggleFAQ(index + 6)}
                    className="w-full px-6 py-5 flex justify-between items-center text-left hover:bg-gold/5 transition-colors"
                    aria-expanded={openFAQ === (index + 6)}
                    aria-controls={`faq-answer-${index + 6}`}
                    type="button"
                  >
                    <span className="text-white font-semibold text-lg pr-4">{faq.question}</span>
                    <motion.svg
                      animate={{ rotate: openFAQ === (index + 6) ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-6 h-6 text-gold flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <AnimatePresence>
                    {openFAQ === (index + 6) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div id={`faq-answer-${index + 6}`} className="px-6 pb-5 pt-2 text-gray-300 leading-relaxed border-t border-gold/10">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-10"
          >
            <p className="text-gray-400 mb-4">Have more questions?</p>
            <Link to="/faq" aria-label="View all frequently asked questions about our escort services">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-gold"
                type="button"
              >
                View All FAQs
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-dark-bg border-t border-gold/10">
        <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-serif font-bold text-white">Book Your {currentCity.name} Escort Today</h2>
            <p className="text-gray-400 text-lg">
              Contact us via WhatsApp for instant bookings and special requests in {currentCity.name}. Available 24/7.
            </p>
            <motion.a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noopener noreferrer nofollow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg font-semibold transition-colors"
              aria-label={`Contact us on WhatsApp to book escorts in ${currentCity.name}`}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.947 1.347l-.355.199-3.682.993 1.012-3.678-.235-.374A9.86 9.86 0 015.031 3.284c5.432 0 9.873 4.441 9.873 9.873 0 2.65-.997 5.151-2.813 7.06l-.262.214-3.822-1.02.667 2.989.261-.042a9.908 9.908 0 004.761-1.486l.327-.206 3.957 1.06-1.274-4.648.23-.365a9.884 9.884 0 001.395-5.159c0-5.432-4.441-9.873-9.873-9.873" />
              </svg>
              Message on WhatsApp
            </motion.a>
          </motion.div>
        </div>
      </section>
    </>
  )
}

export default Location
