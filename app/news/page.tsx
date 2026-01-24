import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Footer } from '@/components/footer'

export default function NewsPage() {
  const news = [
    {
      title: 'New Feature: Advanced Search Filters',
      date: 'March 15, 2024',
      description: 'We\'ve added powerful new search filters to help you find exactly what you\'re looking for.',
    },
    {
      title: 'Platform Update: Improved Messaging System',
      date: 'March 10, 2024',
      description: 'Our new messaging system makes communication between clients and freelancers smoother than ever.',
    },
    {
      title: 'Welcome 10,000th Freelancer!',
      date: 'March 5, 2024',
      description: 'We\'re excited to announce that Monera now has over 10,000 active freelancers on the platform.',
    },
    {
      title: 'New Payment Options Available',
      date: 'February 28, 2024',
      description: 'We\'ve added more payment methods including cryptocurrency and international bank transfers.',
    },
  ]

  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-brand-purple to-purple-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">What's New</h1>
          <p className="text-xl text-purple-100">
            Stay updated with the latest news and updates from Monera
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-6">
          {news.map((item, idx) => (
            <Card key={idx}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription className="mt-2">{item.date}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}
