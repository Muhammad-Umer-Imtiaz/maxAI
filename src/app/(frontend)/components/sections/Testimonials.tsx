'use client'

import { useState, useEffect } from 'react'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/app/(frontend)/components/ui/card'
import { Button } from '@/app/(frontend)/components/ui/button'
import Image from 'next/image'

// Import images properly
import pfp1 from '@/app/(frontend)/assets/pfps/pfp1.jpeg'
import pfp2 from '@/app/(frontend)/assets/pfps/pfp2.jpeg'
import pfp3 from '@/app/(frontend)/assets/pfps/pfp3.jpeg'
import pfp4 from '@/app/(frontend)/assets/pfps/pfp4.jpg'

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Weight Loss Journey',
      image: pfp1,
      content:
        "MAXFITAI completely transformed my approach to fitness. The AI-generated workouts are perfectly tailored to my schedule and fitness level. I've lost 25 pounds in 3 months!",
      rating: 5,
    },
    {
      name: 'Mike Rodriguez',
      role: 'Muscle Building',
      image: pfp3,
      content:
        'The meal planning feature is incredible. As someone who struggled with nutrition, having AI create balanced meal plans that actually taste good has been a game-changer.',
      rating: 5,
    },
    {
      name: 'Emily Chen',
      role: 'Busy Professional',
      image: pfp2,
      content:
        "With my hectic schedule, I thought staying fit was impossible. MAXFITAI's voice commands let me work out hands-free, and the progress tracking keeps me motivated.",
      rating: 5,
    },
    {
      name: 'David Thompson',
      role: 'Marathon Training',
      image: pfp4,
      content:
        'Training for my first marathon seemed overwhelming until I found MAXFITAI. The personalized training plans and analytics helped me achieve my goal faster than expected.',
      rating: 5,
    },
  ]

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 5000) // Change every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying, testimonials.length])

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  return (
    <section id="testimonials" className="py-20 bg-maxfit-darker-grey">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            What Our <span className="text-maxfit-neon-green text-glow">Users Say</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Real stories from real people who transformed their fitness journey with MAXFITAI
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative mb-12"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          {/* Main Carousel */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testimonials.map((testimonial, index) => (
                <div key={index} className="w-full flex-shrink-0 px-4">
                  <Card className="bg-card-gradient border-maxfit-neon-green/20 hover-lift group max-w-4xl mx-auto">
                    <CardContent className="p-8 md:p-12">
                      <div className="text-center">
                        <Quote className="w-12 h-12 text-maxfit-neon-green/60 mb-6 mx-auto" />

                        <p className="text-gray-300 text-xl leading-relaxed mb-8 max-w-3xl mx-auto">
                          &quot;{testimonial.content}&quot;
                        </p>

                        {/* Rating Stars */}
                        <div className="flex justify-center space-x-1 mb-8">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-6 h-6 text-maxfit-neon-green fill-current" />
                          ))}
                        </div>

                        {/* User Info */}
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-maxfit-neon-green/30">
                            <Image
                              src={testimonial.image}
                              alt={testimonial.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <h4 className="text-white font-semibold text-xl">{testimonial.name}</h4>
                            <p className="text-maxfit-neon-green text-sm">{testimonial.role}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border border-maxfit-neon-green/30 rounded-full w-12 h-12 p-0"
            onClick={goToPrev}
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border border-maxfit-neon-green/30 rounded-full w-12 h-12 p-0"
            onClick={goToNext}
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          {/* Dots Indicator */}
          <div className="flex justify-center space-x-3 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentIndex === index
                    ? 'bg-maxfit-neon-green scale-125'
                    : 'bg-gray-600 hover:bg-gray-400'
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 bg-maxfit-neon-green/10 px-6 py-3 rounded-full border border-maxfit-neon-green/20">
            <div className="flex space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-maxfit-neon-green fill-current" />
              ))}
            </div>
            <span className="text-white font-semibold">4.9/5 Average Rating</span>
            <span className="text-gray-300">• 2,500+ Reviews</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Testimonials
