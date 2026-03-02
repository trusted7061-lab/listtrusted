import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import blogPosts from '../services/blogData'

export default function BlogPost() {
  const { slug } = useParams()
  const navigate = useNavigate()
  
  const post = blogPosts.find((p) => p.slug === slug)

  if (!post) {
    return (
      <div className="min-h-screen bg-dark-bg pt-24 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
          <p className="text-gray-400 mb-8">The blog post you're looking for doesn't exist.</p>
          <Link to="/blog">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-gold"
            >
              Back to Blog
            </motion.button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>{post.title} - Trusted Escort Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:image" content={post.image} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://trustedescort.in/blog/${post.slug}`} />
      </Helmet>

      <div className="min-h-screen bg-dark-bg pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          {/* Back Button */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            <Link to="/blog">
              <button className="flex items-center gap-2 text-gold hover:text-gold/80 transition font-semibold">
                ← Back to Blog
              </button>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-gold text-black px-4 py-1 rounded-full text-sm font-semibold">
                {post.category}
              </span>
              <span className="text-gray-500">{post.date}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-white mb-4">
              {post.title}
            </h1>
            <p className="text-xl text-gray-400">By {post.author}</p>
          </motion.div>

          {/* Featured Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-12 rounded-xl overflow-hidden border border-gold/20"
          >
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-auto object-cover"
            />
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="prose prose-invert max-w-none"
          >
            <div
              className="text-gray-300 leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{
                __html: post.content
                  .split('\n')
                  .map((line) => {
                    // Headers
                    if (line.startsWith('## ')) {
                      return `<h2 class="text-3xl font-bold text-white mt-8 mb-4">${line.replace('## ', '')}</h2>`
                    }
                    if (line.startsWith('### ')) {
                      return `<h3 class="text-2xl font-bold text-gold mt-6 mb-3">${line.replace('### ', '')}</h3>`
                    }
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return `<p class="text-lg font-semibold text-white mb-3">${line.replace(/\*\*/g, '')}</p>`
                    }
                    if (line.startsWith('- ')) {
                      return `<li class="ml-6">${line.replace('- ', '')}</li>`
                    }
                    if (line.trim() === '') {
                      return '<div class="h-2"></div>'
                    }
                    return `<p>${line}</p>`
                  })
                  .join('')
                  .replace(
                    /(<li class="ml-6">.*?<\/li>)(\n<li|$)/g,
                    '<ul class="list-disc space-y-2 mb-4">$1</ul>'
                  ),
              }}
            />
          </motion.div>

          {/* Share Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-12 pt-8 border-t border-gold/20"
          >
            <h3 className="text-xl font-bold text-white mb-4">Share This Post</h3>
            <div className="flex gap-4">
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=https://trustedescort.in/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-dark-card border border-gold/20 text-gold rounded-lg hover:border-gold transition"
              >
                Share on Twitter
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=https://trustedescort.in/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 bg-dark-card border border-gold/20 text-gold rounded-lg hover:border-gold transition"
              >
                Share on Facebook
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://trustedescort.in/blog/${post.slug}`)
                  alert('Link copied to clipboard!')
                }}
                className="px-6 py-2 bg-dark-card border border-gold/20 text-gold rounded-lg hover:border-gold transition"
              >
                Copy Link
              </button>
            </div>
          </motion.div>

          {/* Related Posts Placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-12 pt-8 border-t border-gold/20"
          >
            <h3 className="text-2xl font-bold text-white mb-6">More Articles Coming Soon</h3>
            <p className="text-gray-400">Stay tuned for more insightful articles and city guides!</p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="mt-12 bg-dark-card border border-gold/30 rounded-xl p-8 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-3">Looking for Companions?</h3>
            <p className="text-gray-400 mb-6">
              Browse our database of verified and featured escorts in your city.
            </p>
            <Link to="/escorts">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn-gold"
              >
                Browse Escorts
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </div>
    </>
  )
}
