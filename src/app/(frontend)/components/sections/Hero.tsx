import { Button } from '@/app/(frontend)/components/ui/button'
import { Play } from 'lucide-react'
import heroImage from '@/app/(frontend)/assets/hero-fitness-ai.jpg'
import Image from 'next/image'
import Link from 'next/link'

const Hero = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={heroImage}
          alt="AI-Powered Fitness"
          fill
          className="object-cover opacity-30"
          priority
          quality={90}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-maxfit-black via-maxfit-black/80 to-transparent"></div>
      </div>

      {/* Decorative Floating Elements */}
      <div className="absolute top-20 right-20 w-20 h-20 bg-maxfit-neon-green/20 rounded-full blur-xl hero-float"></div>
      <div
        className="absolute bottom-40 left-10 w-16 h-16 bg-maxfit-neon-green/30 rounded-full blur-lg hero-float"
        style={{ animationDelay: '2s' }}
      ></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Transform Your</span>
              <br />
              <span className="text-maxfit-neon-green text-glow">Fitness</span>
              <br />
              <span className="text-white">with</span>
              <span className="text-maxfit-neon-green text-glow"> AI-Powered</span>
              <br />
              <span className="text-white">Precision</span>
            </h1>

            <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-2xl">
              Get personalized workout plans, meal recommendations, and real-time coaching powered
              by advanced AI technology
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link href="/signup">
                <Button size="lg" className="btn-neon text-lg px-8 py-4">
                  Start Your Fitness Journey
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="btn-outline-neon text-lg px-8 py-4">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center justify-center lg:justify-start space-x-4 text-gray-400">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 bg-maxfit-neon-green rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-blue-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-purple-500 rounded-full border-2 border-white"></div>
                <div className="w-8 h-8 bg-red-500 rounded-full border-2 border-white"></div>
              </div>
              <span className="text-white font-medium">Join 10,000+ fitness enthusiasts</span>
            </div>
          </div>

          {/* Fixed Card Grid Layout */}
          <div className="hidden lg:block w-full max-w-lg mx-auto">
            <div className="grid grid-cols-3 grid-rows-3 gap-4 h-80">
              {/* Large Workout Card - Top Left (2x2) */}
              <div className="glass-card px-2  py-2 rounded-2xl col-span-2 row-span-1 hover-lift">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-maxfit-neon-green rounded-full flex items-center justify-center">
                    <span className="text-maxfit-black font-bold">AI</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Workout Generated</h3>
                    <p className="text-gray-400 text-sm">Personalized for you</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="h-2 bg-maxfit-neon-green/30 rounded-full overflow-hidden">
                    <div className="h-full bg-maxfit-neon-green w-3/4 rounded-full"></div>
                  </div>
                  <p className="text-gray-400 text-sm mx-4">75% Complete</p>
                </div>
              </div>

              {/* Calories Card - Top Right (1x1) */}
              <div className="glass-card p-6 rounded-xl hover-lift">
                <div className="text-center">
                  <h3 className="text-maxfit-neon-green text-lg font-bold">342</h3>
                  <p className="text-white text-xs">Calories Burned</p>
                </div>
              </div>

              {/* Nutrition Card - Bottom (3x1) */}
              <div className="glass-card p-2 rounded-2xl col-span-3 hover-lift">
                <h3 className="text-white font-semibold mb-3 mx text-center">Todays Nutrition</h3>
                <div className="grid grid-cols-3  gap-4 text-sm">
                  <div className="text-center">
                    <span className="text-gray-400 block">Calories</span>
                    <span className="text-maxfit-neon-green font-medium">1,850 / 2,200</span>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-400 block">Protein</span>
                    <span className="text-maxfit-neon-green font-medium">120g / 150g</span>
                  </div>
                  <div className="text-center">
                    <span className="text-gray-400 block">Carbs</span>
                    <span className="text-maxfit-neon-green font-medium">180g / 220g</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-maxfit-black to-transparent z-5"></div>
    </section>
  )
}

export default Hero
