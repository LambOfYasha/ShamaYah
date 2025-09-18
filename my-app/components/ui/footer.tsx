'use client';

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { MessageSquare, Youtube } from "lucide-react";
import { useCompactMode } from "@/hooks/use-compact-mode";

interface FooterLink {
  href: string;
  text: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  className?: string;
}

const footerData: Record<string, FooterSection> = {
  community: {
    title: "Community",
    links: [
      { href: "/about", text: "About Us" },
      { href: "/guidelines", text: "Community Guidelines" },
      { href: "/privacy", text: "Privacy Policy" },
      { href: "/terms", text: "Terms of Service" }
    ]
  },
  resources: {
    title: "Resources",
    links: [
      { href: "/help", text: "Help Center" },
      { href: "/contact", text: "Contact Us" },
      { href: "/feedback", text: "Feedback" },
      { href: "/faq", text: "FAQ" }
    ]
  },
  connect: {
    title: "Connect",
    links: [
      { href: "/sign-in", text: "Sign In" },
      { href: "/sign-up", text: "Sign Up" },
      { href: "/blogs", text: "Browse Blogs" },
      { href: "/community-questions", text: "Ask Questions" }
    ]
  }
};

export default function Footer({ className = "" }: FooterProps) {
  const { isCompactMode } = useCompactMode();
  const [activeFooterTab, setActiveFooterTab] = useState('community');

  return (
    <footer className={`bg-background text-foreground ${isCompactMode ? 'py-6 sm:py-10' : 'py-8 sm:py-12'} ${className}`}>
      <Card className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile Tabbed Footer */}
        <div className="block sm:hidden">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-800 mb-6">
            {Object.entries(footerData).map(([key, section]) => (
              <button
                key={key}
                onClick={() => setActiveFooterTab(key)}
                className={`flex-1 py-3 text-sm font-medium transition-colors ${
                  activeFooterTab === key
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {section.title}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="mb-6">
            {Object.entries(footerData).map(([key, section]) => (
              <div
                key={key}
                className={`space-y-3 ${activeFooterTab === key ? 'block' : 'hidden'}`}
              >
                <h4 className={`${isCompactMode ? 'text-base' : 'text-lg'} font-semibold mb-4`}>{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.href} 
                        className="text-muted-foreground hover:text-foreground transition-colors block py-1"
                      >
                        {link.text}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Social Links and Copyright */}
          <div className="border-t border-gray-800 pt-6">
            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                &copy; 2025 Shama Yah. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link href="https://discord.gg/shamayah" className="hover:text-white transition-colors">
                  <MessageSquare className="h-6 w-6" />
                </Link>
                <Link href="https://youtube.com/@shamayah" className="hover:text-white transition-colors">
                  <Youtube className="h-6 w-6" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Footer */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <h4 className={`${isCompactMode ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} font-semibold ${isCompactMode ? 'mb-2 sm:mb-3' : 'mb-3 sm:mb-4'}`}>Community</h4>
            <ul className={`space-y-2 ${isCompactMode ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} text-muted-foreground`}>
              <li><Link href="/about" className="hover:text-white">About Us</Link></li>
              <li><Link href="/guidelines" className="hover:text-white">Community Guidelines</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
            <h4 className={`${isCompactMode ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} font-semibold ${isCompactMode ? 'mb-2 sm:mb-3' : 'mb-3 sm:mb-4'}`}>Resources</h4>
            <ul className={`space-y-2 ${isCompactMode ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} text-muted-foreground`}>
              <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/feedback" className="hover:text-white">Feedback</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            </ul>
          </div>
          <div className="sm:col-span-2 md:col-span-1">
            <h4 className={`${isCompactMode ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} font-semibold ${isCompactMode ? 'mb-2 sm:mb-3' : 'mb-3 sm:mb-4'}`}>Connect</h4>
            <ul className={`space-y-2 ${isCompactMode ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} text-muted-foreground`}>
              <li><Link href="/sign-in" className="hover:text-white">Sign In</Link></li>
              <li><Link href="/sign-up" className="hover:text-white">Sign Up</Link></li>
              <li><Link href="/blogs" className="hover:text-white">Browse Blogs</Link></li>
              <li><Link href="/community-questions" className="hover:text-white">Ask Questions</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Desktop Copyright and Social */}
        <div className="hidden sm:block border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center text-sm sm:text-base text-muted-foreground">
          <p>&copy; 2025 Shama Yah. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <Link href="https://discord.gg/tqErypWMEG" className="hover:text-white transition-colors">
              <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
            </Link>
            <Link href="https://youtube.com/@Toothful-Ministry" className="hover:text-white transition-colors">
              <Youtube className="h-5 w-5 sm:h-6 sm:w-6" />
            </Link>
          </div>
        </div>
      </Card>
    </footer>
  );
}
