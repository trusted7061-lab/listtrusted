import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import blogPosts from '../services/blogData'

export default function Blog() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
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
        <title>Blog - Trusted Escort | Latest Articles & Guides</title>
        <meta name="description" content="Read our blog for latest articles, guides, and information about escort services, dating safety, and city guides." />
        <meta property="og:title" content="Blog - Trusted Escort" />
        <meta property="og:description" content="Latest articles and guides about escort services" />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="https://trustedescort.in/blog" />
      </Helmet>

      <div className="min-h-screen bg-dark-bg pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4 text-white">
              Our <span className="text-gold">Blog</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Explore insightful articles, guides, and information about escort services, city guides, and safety tips.
            </p>
          </motion.div>

          {/* Blog Posts Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {blogPosts.map((post) => (
              <motion.div
                key={post.slug}
                variants={itemVariants}
                whileHover={{ translateY: -8 }}
                className="group"
              >
                <Link to={`/blog/${post.slug}`}>
                  <div className="bg-dark-card border border-gold/20 rounded-xl overflow-hidden hover:border-gold transition h-full flex flex-col">
                    {/* Image */}
                    <div className="relative h-48 overflow-hidden bg-dark-hover">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      />
                      <div className="absolute top-4 right-4 bg-gold text-black px-3 py-1 rounded-full text-xs font-semibold">
                        {post.category}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-xl font-bold text-white group-hover:text-gold transition mb-2">
                        {post.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-4 flex-grow">
                        {post.excerpt}
                      </p>

                      {/* Meta */}
                      <div className="flex items-center justify-between pt-4 border-t border-gold/10">
                        <span className="text-gold text-sm font-semibold">{post.author}</span>
                        <span className="text-gray-500 text-xs">{post.date}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Coming Soon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="bg-dark-card border border-gold/20 rounded-xl p-8">
              <p className="text-gray-400 mb-2">More insightful articles coming soon...</p>
              <p className="text-gold font-semibold">Stay tuned for more city guides and tips!</p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}
