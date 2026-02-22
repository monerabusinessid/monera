'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Footer } from '@/components/footer'

export default function BlogDetailPage() {
  const params = useParams()
  
  const blogPosts: Record<string, any> = {
    '1': {
      title: 'How to Hire Remote Developers in 2024',
      category: 'Hiring',
      date: 'Jan 15, 2024',
      readTime: '5 min read',
      image: '💻',
      author: 'Sarah Johnson',
      content: `
        <h2>The Rise of Remote Development</h2>
        <p>Remote work has transformed the tech industry. Companies now have access to a global talent pool, and developers can work from anywhere. But hiring remote developers requires a different approach than traditional hiring.</p>
        
        <h2>Key Steps to Hire Remote Developers</h2>
        <h3>1. Define Your Requirements Clearly</h3>
        <p>Before you start searching, be crystal clear about what you need. List the technical skills, experience level, and soft skills required for the role.</p>
        
        <h3>2. Use Quality-First Platforms</h3>
        <p>Not all hiring platforms are created equal. Choose platforms that pre-vet candidates to save time and ensure quality.</p>
        
        <h3>3. Test Technical Skills</h3>
        <p>Always include a technical assessment. This could be a coding challenge, portfolio review, or live coding session.</p>
        
        <h3>4. Evaluate Communication Skills</h3>
        <p>Remote work requires excellent communication. Test how candidates communicate during the interview process.</p>
        
        <h2>Common Mistakes to Avoid</h2>
        <ul>
          <li>Rushing the hiring process</li>
          <li>Ignoring time zone differences</li>
          <li>Not setting clear expectations</li>
          <li>Skipping reference checks</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>Hiring remote developers can be highly rewarding when done right. Focus on quality, clear communication, and proper vetting to build a strong remote team.</p>
      `,
    },
    '2': {
      title: 'Top 10 Skills Every Developer Should Have',
      category: 'Career',
      date: 'Jan 12, 2024',
      readTime: '7 min read',
      image: '🚀',
      author: 'Michael Chen',
      content: `
        <h2>Essential Skills for Modern Developers</h2>
        <p>The tech industry evolves rapidly. Here are the skills that will keep you competitive in 2024 and beyond.</p>
        
        <h2>Technical Skills</h2>
        <h3>1. Version Control (Git)</h3>
        <p>Every developer must know Git. It's the industry standard for code collaboration and version management.</p>
        
        <h3>2. Cloud Computing</h3>
        <p>Understanding AWS, Azure, or Google Cloud is essential. Most applications now run in the cloud.</p>
        
        <h3>3. API Development</h3>
        <p>Know how to build and consume RESTful APIs. Microservices architecture is everywhere.</p>
        
        <h3>4. Database Management</h3>
        <p>Master both SQL and NoSQL databases. Understand when to use each.</p>
        
        <h3>5. Testing & Debugging</h3>
        <p>Write unit tests, integration tests, and know how to debug efficiently.</p>
        
        <h2>Soft Skills</h2>
        <h3>6. Communication</h3>
        <p>Explain technical concepts clearly to non-technical stakeholders.</p>
        
        <h3>7. Problem Solving</h3>
        <p>Break down complex problems into manageable pieces.</p>
        
        <h3>8. Time Management</h3>
        <p>Deliver projects on time while maintaining code quality.</p>
        
        <h3>9. Continuous Learning</h3>
        <p>Stay updated with new technologies and best practices.</p>
        
        <h3>10. Collaboration</h3>
        <p>Work effectively in teams, both remote and in-person.</p>
      `,
    },
    '3': {
      title: 'Remote Work Best Practices for Teams',
      category: 'Remote Work',
      date: 'Jan 10, 2024',
      readTime: '6 min read',
      image: '🌍',
      author: 'Emily Rodriguez',
      content: `
        <h2>Making Remote Work Work</h2>
        <p>Remote work offers flexibility and access to global talent, but it requires intentional practices to succeed.</p>
        
        <h2>Communication Best Practices</h2>
        <h3>Over-communicate</h3>
        <p>In remote settings, it's better to over-communicate than under-communicate. Share updates regularly.</p>
        
        <h3>Use the Right Tools</h3>
        <p>Invest in quality communication tools: Slack for chat, Zoom for meetings, and project management software.</p>
        
        <h2>Productivity Tips</h2>
        <h3>Set Clear Expectations</h3>
        <p>Define working hours, response times, and deliverables clearly.</p>
        
        <h3>Create Routines</h3>
        <p>Establish daily standup meetings and regular check-ins.</p>
        
        <h3>Respect Time Zones</h3>
        <p>Schedule meetings at times that work for everyone. Use async communication when possible.</p>
        
        <h2>Building Team Culture</h2>
        <p>Remote teams need intentional culture building. Host virtual team events, celebrate wins, and create spaces for casual conversation.</p>
      `,
    },
    '4': {
      title: 'Building a Strong Developer Portfolio',
      category: 'Career',
      date: 'Jan 8, 2024',
      readTime: '8 min read',
      image: '📁',
      author: 'David Kim',
      content: `
        <h2>Why Your Portfolio Matters</h2>
        <p>Your portfolio is your professional showcase. It's often the first thing recruiters and potential clients see, so make it count.</p>
        
        <h2>Essential Portfolio Elements</h2>
        <h3>1. Clear Introduction</h3>
        <p>Start with a brief bio that explains who you are, what you do, and what makes you unique. Keep it concise and engaging.</p>
        
        <h3>2. Best Projects</h3>
        <p>Showcase 3-5 of your best projects. Quality over quantity. For each project include:</p>
        <ul>
          <li>Project description and goals</li>
          <li>Technologies used</li>
          <li>Your specific role and contributions</li>
          <li>Live demo link and GitHub repository</li>
          <li>Screenshots or video walkthrough</li>
        </ul>
        
        <h3>3. Technical Skills</h3>
        <p>List your technical skills organized by category: languages, frameworks, tools, databases, etc.</p>
        
        <h3>4. Contact Information</h3>
        <p>Make it easy for people to reach you. Include email, LinkedIn, GitHub, and any other relevant links.</p>
        
        <h2>Portfolio Design Tips</h2>
        <h3>Keep It Simple</h3>
        <p>A clean, professional design is better than a flashy one. Focus on readability and user experience.</p>
        
        <h3>Make It Responsive</h3>
        <p>Your portfolio must look great on all devices. Test it on mobile, tablet, and desktop.</p>
        
        <h3>Fast Loading</h3>
        <p>Optimize images and code. A slow portfolio reflects poorly on your technical skills.</p>
        
        <h2>Common Mistakes to Avoid</h2>
        <ul>
          <li>Including too many projects (focus on quality)</li>
          <li>Not updating regularly</li>
          <li>Broken links or demos</li>
          <li>Poor mobile experience</li>
          <li>No clear call-to-action</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>Your portfolio is a living document. Update it regularly with new projects and skills. Make it easy to navigate and showcase your best work.</p>
      `,
    },
    '5': {
      title: 'The Future of Freelancing in Tech',
      category: 'Industry',
      date: 'Jan 5, 2024',
      readTime: '10 min read',
      image: '🔮',
      author: 'Alex Thompson',
      content: `
        <h2>The Freelance Revolution</h2>
        <p>The tech industry is experiencing a massive shift toward freelance and contract work. By 2024, over 50% of developers have done freelance work at some point in their career.</p>
        
        <h2>Key Trends Shaping Freelancing</h2>
        <h3>1. Remote-First Companies</h3>
        <p>More companies are embracing remote work, opening opportunities for freelancers worldwide. Geographic barriers are disappearing.</p>
        
        <h3>2. Specialized Skills in Demand</h3>
        <p>Companies increasingly hire specialists for specific projects rather than generalists. Deep expertise in AI, blockchain, or cloud architecture commands premium rates.</p>
        
        <h3>3. Platform Evolution</h3>
        <p>Freelance platforms are becoming more sophisticated, offering better matching, payment protection, and career development tools.</p>
        
        <h3>4. Hybrid Work Models</h3>
        <p>Many professionals are combining full-time employment with freelance projects, creating diverse income streams.</p>
        
        <h2>Opportunities Ahead</h2>
        <h3>AI and Automation</h3>
        <p>While AI automates some tasks, it creates new opportunities for developers who can work with AI tools and build AI-powered solutions.</p>
        
        <h3>Web3 and Blockchain</h3>
        <p>Decentralized technologies are creating new freelance opportunities in smart contract development, DeFi, and NFT platforms.</p>
        
        <h3>Sustainability Tech</h3>
        <p>Green tech and climate solutions are growing rapidly, with increasing demand for developers in this space.</p>
        
        <h2>Challenges to Navigate</h2>
        <ul>
          <li>Increased competition from global talent</li>
          <li>Need for continuous skill updates</li>
          <li>Managing irregular income</li>
          <li>Building long-term client relationships</li>
          <li>Handling taxes and benefits independently</li>
        </ul>
        
        <h2>Preparing for the Future</h2>
        <h3>Build Your Brand</h3>
        <p>Establish yourself as an expert in your niche. Share knowledge through blogs, videos, or open-source contributions.</p>
        
        <h3>Network Actively</h3>
        <p>Join communities, attend virtual events, and build relationships. Most freelance opportunities come through referrals.</p>
        
        <h3>Diversify Income</h3>
        <p>Don't rely on a single client or platform. Build multiple income streams through different clients, products, or passive income.</p>
        
        <h2>Conclusion</h2>
        <p>The future of freelancing in tech is bright but competitive. Success requires continuous learning, strong personal branding, and adaptability to market changes.</p>
      `,
    },
    '6': {
      title: 'How to Price Your Freelance Services',
      category: 'Business',
      date: 'Jan 3, 2024',
      readTime: '6 min read',
      image: '💰',
      author: 'Jessica Martinez',
      content: `
        <h2>The Pricing Challenge</h2>
        <p>Pricing is one of the biggest challenges for freelancers. Price too low and you undervalue yourself. Price too high and you might lose clients. Finding the sweet spot is crucial.</p>
        
        <h2>Pricing Models</h2>
        <h3>Hourly Rate</h3>
        <p>Charge by the hour. Good for ongoing work or when scope is unclear. Typical rates for developers: $50-$200/hour depending on experience and specialization.</p>
        
        <h3>Project-Based</h3>
        <p>Fixed price for the entire project. Better for well-defined projects. Allows you to profit from efficiency.</p>
        
        <h3>Retainer</h3>
        <p>Monthly fee for ongoing availability. Provides stable income and builds long-term relationships.</p>
        
        <h3>Value-Based</h3>
        <p>Price based on the value you deliver, not time spent. Best for experienced freelancers with proven track records.</p>
        
        <h2>Calculating Your Rate</h2>
        <h3>Know Your Costs</h3>
        <p>Calculate your monthly expenses: rent, food, insurance, software, taxes, etc. Add 20-30% buffer for savings and emergencies.</p>
        
        <h3>Determine Billable Hours</h3>
        <p>Realistically, you'll bill 20-25 hours per week (not 40). Account for admin work, marketing, and downtime.</p>
        
        <h3>Research Market Rates</h3>
        <p>Check what others with similar skills charge. Look at job boards, freelance platforms, and industry surveys.</p>
        
        <h3>Factor in Experience</h3>
        <p>Junior developers: $30-$60/hour. Mid-level: $60-$100/hour. Senior: $100-$200+/hour.</p>
        
        <h2>Negotiation Tips</h2>
        <h3>Start Higher</h3>
        <p>Always start with a rate higher than your minimum. Clients often negotiate down.</p>
        
        <h3>Explain Your Value</h3>
        <p>Don't just state your rate. Explain what clients get: expertise, reliability, quality, fast turnaround.</p>
        
        <h3>Be Confident</h3>
        <p>If you're not confident in your pricing, clients won't be either. Know your worth.</p>
        
        <h3>Know When to Walk Away</h3>
        <p>Some clients aren't worth it. If they can't meet your minimum rate, politely decline.</p>
        
        <h2>Raising Your Rates</h2>
        <p>Review and increase your rates annually. Notify existing clients 30-60 days in advance. New skills and experience justify higher rates.</p>
        
        <h2>Conclusion</h2>
        <p>Pricing is both art and science. Start with research, test different approaches, and adjust based on results. Remember: you can always raise rates, but lowering them sends the wrong message.</p>
      `,
    },
  }

  const post = blogPosts[params.id as string]
  
  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <Link href="/blog">
            <Button>Back to Blog</Button>
          </Link>
        </div>
      </div>
    )
  }
  const relatedPosts = Object.entries(blogPosts)
    .filter(([id]) => id !== params.id)
    .slice(0, 3)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-purple via-purple-600 to-purple-700 text-white pt-28 md:pt-36 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0wIDMwdi0yaC0ydjJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <Link href="/blog" className="text-purple-100 hover:text-white mb-4 inline-block font-semibold">
              ← Back to Blog
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-sm font-bold text-brand-yellow bg-white/10 px-3 py-1 rounded-full">
                {post.category}
              </span>
              <span className="text-sm text-purple-100">{post.date}</span>
              <span className="text-sm text-purple-100">•</span>
              <span className="text-sm text-purple-100">{post.readTime}</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">{post.image}</span>
              </div>
              <div>
                <p className="font-bold">By {post.author}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Article Content */}
          <article 
            className="prose prose-lg max-w-none mb-16 blog-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          <style jsx global>{`
            .blog-content h2 {
              font-size: 1.875rem;
              font-weight: 700;
              margin-top: 2.5rem;
              margin-bottom: 1.25rem;
              color: #1f2937;
            }
            .blog-content h3 {
              font-size: 1.5rem;
              font-weight: 600;
              margin-top: 2rem;
              margin-bottom: 1rem;
              color: #374151;
            }
            .blog-content p {
              margin-bottom: 1.25rem;
              line-height: 1.8;
              color: #4b5563;
            }
            .blog-content ul {
              margin: 1.5rem 0;
              padding-left: 1.5rem;
              list-style-type: disc;
            }
            .blog-content li {
              margin-bottom: 0.75rem;
              line-height: 1.7;
              color: #4b5563;
            }
          `}</style>

          {/* Share Section */}
          <div className="border-t border-b border-gray-200 py-6 mb-12">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <p className="font-semibold text-gray-900">Share this article</p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                >
                  Twitter
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                >
                  LinkedIn
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                >
                  Facebook
                </Button>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          <div>
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map(([id, relatedPost]) => (
                <Link key={id} href={`/blog/${id}`}>
                  <Card className="border-4 border-brand-purple/30 hover:border-brand-purple transition-all duration-300 hover:shadow-2xl cursor-pointer h-full rounded-2xl">
                    <CardContent className="p-6">
                      <div className="text-4xl mb-3">{relatedPost.image}</div>
                      <span className="text-xs font-bold text-brand-purple bg-purple-50 px-3 py-1 rounded-full">
                        {relatedPost.category}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900 mt-3 mb-2 hover:text-brand-purple transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-500">{relatedPost.readTime}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}
