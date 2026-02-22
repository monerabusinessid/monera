'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'

export default function BlogPage() {
  const blogPosts = [
    {
      id: '1',
      title: 'How to Hire Remote Developers in 2024',
      excerpt: 'A comprehensive guide to finding and hiring top remote developers for your startup or business.',
      category: 'Hiring',
      date: 'Jan 15, 2024',
      readTime: '5 min read',
      image: '💻',
    },
    {
      id: '2',
      title: 'Top 10 Skills Every Developer Should Have',
      excerpt: 'Essential technical and soft skills that make developers stand out in the competitive job market.',
      category: 'Career',
      date: 'Jan 12, 2024',
      readTime: '7 min read',
      image: '🚀',
    },
    {
      id: '3',
      title: 'Remote Work Best Practices for Teams',
      excerpt: 'Tips and strategies for managing remote teams effectively and maintaining productivity.',
      category: 'Remote Work',
      date: 'Jan 10, 2024',
      readTime: '6 min read',
      image: '🌍',
    },
    {
      id: '4',
      title: 'Building a Strong Developer Portfolio',
      excerpt: 'Learn how to create a portfolio that showcases your skills and attracts potential employers.',
      category: 'Career',
      date: 'Jan 8, 2024',
      readTime: '8 min read',
      image: '📁',
    },
    {
      id: '5',
      title: 'The Future of Freelancing in Tech',
      excerpt: 'Exploring trends and predictions for the freelance tech industry in the coming years.',
      category: 'Industry',
      date: 'Jan 5, 2024',
      readTime: '10 min read',
      image: '🔮',
    },
    {
      id: '6',
      title: 'How to Price Your Freelance Services',
      excerpt: 'A practical guide to setting competitive rates and negotiating with clients.',
      category: 'Business',
      date: 'Jan 3, 2024',
      readTime: '6 min read',
      image: '💰',
    },
  ]

  const categories = ['All', 'Hiring', 'Career', 'Remote Work', 'Industry', 'Business']
  const [activeCategory, setActiveCategory] = useState('All')

  const filteredPosts = activeCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-purple via-purple-600 to-purple-700 text-white pt-56 md:pt-44 pb-40 -mt-20 md:-mt-24 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0wIDMwdi0yaC0ydjJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-lg">Monera Blog</h1>
            <p className="text-xl md:text-2xl text-white/90 font-medium leading-relaxed max-w-2xl mx-auto">
              Insights, tips, and stories about <span className="text-brand-yellow font-semibold">remote work</span>
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <div className="container mx-auto px-4 -mt-20 relative z-20 pb-20">
        <div className="max-w-6xl mx-auto space-y-12">
        {/* Categories Filter */}
        <div className="flex flex-wrap gap-3 justify-center bg-white rounded-3xl p-6 shadow-2xl border-4 border-brand-purple/30">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === activeCategory ? 'default' : 'outline'}
              className={category === activeCategory ? 'bg-brand-purple hover:bg-purple-700 font-bold' : 'font-semibold'}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <Card className="border-4 border-brand-purple/30 hover:border-brand-purple transition-all duration-300 hover:shadow-2xl cursor-pointer h-full rounded-2xl">
                <CardHeader>
                  <div className="text-6xl mb-4">{post.image}</div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-brand-purple bg-purple-50 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                    <span className="text-xs text-gray-500">{post.date}</span>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-900 hover:text-brand-purple transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{post.readTime}</span>
                    <span className="text-brand-purple font-bold text-sm">Read more →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="bg-gradient-to-br from-brand-purple to-purple-600 rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-purple-100 mb-6 text-lg">Get the latest insights delivered to your inbox</p>
          <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 border-2 border-transparent focus:border-brand-yellow"
            />
            <Button className="bg-brand-yellow text-gray-900 hover:bg-yellow-400 font-bold">
              Subscribe
            </Button>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
