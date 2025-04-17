import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Mountain,
  Compass,
  Tent,
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-slate-800 via-slate-900 to-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          className="absolute bottom-0"
        >
          <path
            fill="#6366f1"
            fillOpacity="1"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,224C672,245,768,267,864,261.3C960,256,1056,224,1152,197.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-[#6366f1] flex items-center">
              <Mountain className="mr-2" />
              Trek Sathi
            </h3>
            <p className="text-sm text-gray-300">
              Explore the world, one peak at a time. Join us for unforgettable
              mountain trekking experiences.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4 flex items-center">
              <Compass className="mr-2 text-[#6366f1]" />
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm hover:text-[#6366f1] transition-colors"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/treks"
                  className="text-sm hover:text-[#6366f1] transition-colors"
                >
                  Our Treks
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm hover:text-[#6366f1] transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm hover:text-[#6366f1] transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4 flex items-center">
              <Tent className="mr-2 text-[#6366f1]" />
              Follow Our Journey
            </h4>
            <div className="flex space-x-4">
              <Link to="#" className="hover:text-[#6366f1] transition-colors">
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link to="#" className="hover:text-[#6366f1] transition-colors">
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link to="#" className="hover:text-[#6366f1] transition-colors">
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link to="#" className="hover:text-[#6366f1] transition-colors">
                <Youtube size={20} />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-medium mb-4">Summit Updates</h4>
            <p className="text-sm text-gray-300 mb-2">
              Stay updated with our latest treks and mountain adventures.
            </p>
            <form className="flex flex-col space-y-2">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
              />
              <Button className="bg-[#6366f1] hover:bg-[#6366f1]/90 text-white">
                Subscribe
                <Mail className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-700 text-center text-sm text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} TrekSathi. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
