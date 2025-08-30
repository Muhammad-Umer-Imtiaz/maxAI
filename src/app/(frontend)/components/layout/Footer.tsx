import { Facebook, Twitter, Instagram, Youtube, Mail } from "lucide-react";
import { Button } from "@/app/(frontend)/components/ui/button";
import { Input } from "@/app/(frontend)/components/ui/input";

const Footer = () => {
  return (
    <footer className="bg-maxfit-darker-grey border-t border-maxfit-neon-green/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-6">
              <div className="text-2xl font-bold">
                <span className="text-white">MAX</span>
                <span className="text-maxfit-neon-green">FIT</span>
                <span className="text-white">AI</span>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Transform your fitness journey with AI-powered precision. Join thousands of users achieving their goals with personalized workout and nutrition plans.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-maxfit-neon-green/10 rounded-full flex items-center justify-center hover:bg-maxfit-neon-green/20 transition-colors">
                <Facebook className="w-5 h-5 text-maxfit-neon-green" />
              </a>
              <a href="#" className="w-10 h-10 bg-maxfit-neon-green/10 rounded-full flex items-center justify-center hover:bg-maxfit-neon-green/20 transition-colors">
                <Twitter className="w-5 h-5 text-maxfit-neon-green" />
              </a>
              <a href="#" className="w-10 h-10 bg-maxfit-neon-green/10 rounded-full flex items-center justify-center hover:bg-maxfit-neon-green/20 transition-colors">
                <Instagram className="w-5 h-5 text-maxfit-neon-green" />
              </a>
              <a href="#" className="w-10 h-10 bg-maxfit-neon-green/10 rounded-full flex items-center justify-center hover:bg-maxfit-neon-green/20 transition-colors">
                <Youtube className="w-5 h-5 text-maxfit-neon-green" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Product</h3>
            <ul className="space-y-3">
              <li><a href="#features" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">API Documentation</a></li>
              <li><a href="#" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">Integration</a></li>
              <li><a href="#" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">Updates</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Company</h3>
            <ul className="space-y-3">
              <li><a href="#" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">Press Kit</a></li>
              <li><a href="#" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">Contact</a></li>
              <li><a href="#" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">Partners</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6">Stay Updated</h3>
            <p className="text-gray-300 mb-4">
              Get the latest AI fitness tips and updates delivered to your inbox.
            </p>
            <div className="space-y-3">
              <Input 
                placeholder="Enter your email" 
                className="bg-maxfit-dark-grey border-maxfit-neon-green/20 text-white placeholder:text-gray-400 focus:border-maxfit-neon-green"
              />
              <Button className="w-full btn-neon">
                <Mail className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-maxfit-neon-green/20 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
            <div className="text-gray-300 text-sm">
              © 2024 MAXFITAI. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-300 hover:text-maxfit-neon-green transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;