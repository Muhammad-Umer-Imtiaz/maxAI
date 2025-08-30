import { Brain, Utensils, TrendingUp, Mic, Archive, History } from "lucide-react";
import { Card, CardContent } from "@/app/(frontend)/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: Brain,
      title: "AI Workout Generation",
      description: "Smart algorithms create personalized routines based on your goals, fitness level, and available equipment."
    },
    {
      icon: Utensils,
      title: "Meal Planning",
      description: "Nutritionally balanced meal suggestions tailored to your dietary preferences and fitness objectives."
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Advanced analytics and insights to monitor your transformation journey with detailed metrics."
    },
    {
      icon: Mic,
      title: "Voice Commands",
      description: "Hands-free workout guidance with voice-activated commands for seamless training sessions."
    },
    {
      icon: Archive,
      title: "Plan Archives",
      description: "Save and revisit your favorite routines with our comprehensive workout and meal plan library."
    },
    {
      icon: History,
      title: "Call History",
      description: "Track your AI interactions and progress with detailed logs of all your coaching sessions."
    }
  ];

  return (
    <section id="features" className="py-20 bg-maxfit-dark-grey">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Powered by <span className="text-maxfit-neon-green text-glow">AI Innovation</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Experience the future of fitness with cutting-edge AI technology that adapts to your unique needs and goals
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-card-gradient border-maxfit-neon-green/20 hover-lift group cursor-pointer"
            >
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="w-16 h-16 bg-maxfit-neon-green/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-maxfit-neon-green/20 transition-colors duration-300">
                    <feature.icon className="w-8 h-8 text-maxfit-neon-green" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-maxfit-neon-green transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="text-center">
            <h3 className="text-4xl font-bold text-maxfit-neon-green mb-2">10K+</h3>
            <p className="text-gray-300">Active Users</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-bold text-maxfit-neon-green mb-2">50K+</h3>
            <p className="text-gray-300">Workouts Generated</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-bold text-maxfit-neon-green mb-2">95%</h3>
            <p className="text-gray-300">User Satisfaction</p>
          </div>
          <div className="text-center">
            <h3 className="text-4xl font-bold text-maxfit-neon-green mb-2">24/7</h3>
            <p className="text-gray-300">AI Support</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;