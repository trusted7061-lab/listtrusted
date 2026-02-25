import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

function Footer() {
  const emailLink = 'mailto:info@trustedescort.in'
  const whatsappLink = 'https://wa.me/1234567890'

  const currentYear = new Date().getFullYear()



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
