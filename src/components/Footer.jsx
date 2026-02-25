import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

function Footer() {
  const emailLink = 'mailto:info@trustedescort.in'
  const whatsappLink = 'https://wa.me/1234567890'
  const location = useLocation()
  const isLocationPage = location.pathname.startsWith('/escorts/in/')

  const currentYear = new Date().getFullYear()

  // State for FAQ accordion
  const [openFAQ, setOpenFAQ] = useState(null)

  const locationFAQs = [
    {
      question: "How do I book an escort in my city?",
      answer: "Booking is simple and discreet. Contact us via WhatsApp or our contact form with your preferred date, time, and any special requests. Our team will assist you with available escorts in your location."
    },
    {
      question: "Are your escort services available 24/7?",
      answer: "Yes, we offer 24/7 availability in major cities. Our escorts are available for both daytime and evening engagements, including overnight bookings and travel companionship."
    },
    {
      question: "What areas do you serve in this city?",
      answer: "We provide services across all major areas of the city, including premium hotels, business districts, airports, and residential areas. Our escorts can travel to your preferred location."
    },
    {
      question: "How is privacy and discretion ensured?",
      answer: "We maintain the highest standards of privacy and confidentiality. All bookings are handled discreetly, and we never share client information. Our escorts are professionals who understand the importance of discretion."
    },
    {
      question: "What is included in the escort service?",
      answer: "Our escorts provide sophisticated companionship for various occasions including business dinners, social events, travel, and private meetings. Services are customized based on your specific requirements."
    },
    {
      question: "How far in advance should I book?",
      answer: "For best availability, we recommend booking at least 24-48 hours in advance. However, we also accommodate last-minute bookings based on escort availability in your area."
    },
    {
      question: "What are your payment methods?",
      answer: "We accept multiple payment methods including cash, bank transfers, and digital payments. Full payment details and terms will be provided during the booking confirmation process."
    },
    {
      question: "Can I request a specific escort from your gallery?",
      answer: "Absolutely! You can browse our escort gallery and request a specific companion. We'll confirm their availability for your preferred date and time."
    },
    {
      question: "Do you offer outcall and incall services?",
      answer: "Yes, we provide both outcall services (escort visits your location) and incall services (you visit a designated location). Most clients prefer outcall services to their hotel or residence."
    },
    {
      question: "What if I need to cancel or reschedule?",
      answer: "We understand plans change. Please contact us at least 4 hours before your appointment to cancel or reschedule. Our cancellation policy will be explained during booking confirmation."
    },
    {
      question: "Are your escorts professionally verified?",
      answer: "Yes, all our escorts undergo thorough verification and background checks. We ensure they are professional, reliable, and maintain the high standards expected by our clientele."
    },
    {
      question: "Can escorts accompany me for travel or events?",
      answer: "Certainly! Our escorts are available for travel companionship, including domestic and international trips, as well as social events, corporate functions, and special occasions."
    }
  ]

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const footerLinks = [
    { title: 'Quick Links', items: [
      { name: 'Home', path: '/' },
      { name: 'Escorts', path: '/escorts' },
      { name: 'About', path: '/about' },
      { name: 'Contact', path: '/contact' },
    ]},
    { title: 'Services', items: [
      { name: 'Booking', path: '/booking' },
      { name: 'FAQ', path: '/faq' },
      { name: 'Privacy Policy', path: '/privacy-policy' },
      { name: 'Terms', path: '/terms' },
    ]},
    { title: 'Top Locations', items: [
      { name: 'Mumbai', path: '/escorts/in/mumbai' },
      { name: 'Delhi', path: '/escorts/in/delhi' },
      { name: 'Bangalore', path: '/escorts/in/bangalore' },
      { name: 'Hyderabad', path: '/escorts/in/hyderabad' },
    ]},
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
      transition: { duration: 0.3 },
    },
  }

  return (
    <footer className="bg-dark-card border-t border-gold/20">
      {/* FAQs Section - Only on Location Pages */}
      {isLocationPage && (
        <div className="border-b border-gold/10 bg-dark-bg">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gold text-center mb-8">
                Frequently Asked Questions
              </h2>
              <p className="text-gray-400 text-center mb-10 max-w-3xl mx-auto">
                Get answers to common questions about our escort services in your city
              </p>

              <div className="max-w-4xl mx-auto space-y-3">
                {locationFAQs.map((faq, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="border border-gold/20 rounded-lg overflow-hidden bg-dark-card/50"
                  >
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gold/5 transition-colors"
                    >
                      <span className="text-white font-semibold pr-4">{faq.question}</span>
                      <motion.svg
                        animate={{ rotate: openFAQ === index ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-5 h-5 text-gold flex-shrink-0"
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
                          <div className="px-6 pb-4 pt-2 text-gray-400 leading-relaxed border-t border-gold/10">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="text-center mt-10"
              >
                <Link to="/faq">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-gold"
                  >
                    View All FAQs
                  </motion.button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8"
        >
          {/* Brand */}
          <motion.div variants={itemVariants}>
            <div className="mb-4">
              <div className="text-2xl font-serif font-bold text-gold mb-2">Trusted Escort</div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Exclusive, discreet, and sophisticated escortship services for the distinguished individual.
              </p>
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerLinks.map((column) => (
            <motion.div key={column.title} variants={itemVariants}>
              <h4 className="font-serif text-sm font-bold text-gold mb-4">{column.title}</h4>
              <ul className="space-y-2">
                {column.items.map((item) => (
                  <li key={item.name}>
                    <Link to={item.path}>
                      <motion.span
                        whileHover={{ x: 5, color: '#D4AF37' }}
                        className="text-sm text-gray-400 transition-colors hover:text-gold"
                      >
                        {item.name}
                      </motion.span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Contact Info */}
          <motion.div variants={itemVariants}>
            <h4 className="font-serif text-sm font-bold text-gold mb-4">Contact</h4>
            <div className="space-y-3">
              <a href={emailLink} className="text-sm text-gray-400 hover:text-gold transition-colors">
                info@trustedescort.in
              </a>
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gold transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.947 1.347l-.355.199-3.682.993 1.012-3.678-.235-.374A9.86 9.86 0 015.031 3.284c5.432 0 9.873 4.441 9.873 9.873 0 2.65-.997 5.151-2.813 7.06l-.262.214-3.822-1.02.667 2.989.261-.042a9.908 9.908 0 004.761-1.486l.327-.206 3.957 1.06-1.274-4.648.23-.365a9.884 9.884 0 001.395-5.159c0-5.432-4.441-9.873-9.873-9.873" />
                </svg>
                WhatsApp
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="border-t border-gold/20 pt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left"
        >
          <p className="text-xs text-gray-500">
            © {currentYear} Trusted Escort. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-4 md:mt-0">
            Must be 18+ to use this service. By accessing, you confirm you are of legal age.
          </p>
        </motion.div>
      </div>
    </footer>
  )
}

export default Footer
