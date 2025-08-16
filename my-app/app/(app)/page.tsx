'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { 
  Search,
  ArrowRight,
  LayoutDashboard,
  HelpCircle,
  BookOpen,
  Users,
  MessageSquare,
  Youtube,
  MessageCircle
} from "lucide-react";
import Image from "next/image";
import GuestCreateCommunityButton from "@/components/community/GuestCreateCommunityButton";

interface VerseOfTheDay {
  verse: string;
  reference: string;
  text: string;
}

interface SiteStats {
  totalQuestions: number;
  totalTeachers: number;
  totalBlogs: number;
  totalMembers: number;
}

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [verseOfTheDay, setVerseOfTheDay] = useState<VerseOfTheDay | null>(null);
  const [siteStats, setSiteStats] = useState<SiteStats>({
    totalQuestions: 0,
    totalTeachers: 0,
    totalBlogs: 0,
    totalMembers: 0
  });

  // Fetch verse of the day
  useEffect(() => {
    const fetchVerseOfTheDay = async () => {
      try {
        const response = await fetch('/api/verse-of-the-day');
        if (response.ok) {
          const verse = await response.json();
          setVerseOfTheDay(verse);
        }
      } catch (error) {
        console.error('Error fetching verse of the day:', error);
        // Fallback verse
        setVerseOfTheDay({
          verse: "John 3:16",
          reference: "John 3:16",
          text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life."
        });
      }
    };

    fetchVerseOfTheDay();
  }, []);

  // Fetch site statistics
  useEffect(() => {
    const fetchSiteStats = async () => {
      try {
        const response = await fetch('/api/site-stats');
        if (response.ok) {
          const stats = await response.json();
          setSiteStats(stats);
        }
      } catch (error) {
        console.error('Error fetching site stats:', error);
      }
    };

    fetchSiteStats();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center justify-center">
        {/* Background Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/assets/logo_light.png"
            alt="Shama Yah Logo Background"
            fill
            className="object-contain"
            priority
          />
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
          </div>
        </div>
      </section>

      {/*Welcome Section*/}
      <section className="py-20 bg-white">  
             {/* Content Below Logo */}
             <div className="space-y-8">
              <h1 className="text-center text-4xl md:text-6xl font-bold text-gray-900">
                Welcome to
                <span className="text-blue-600 block">Shama Yah</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                A community for biblical discussion, theological exploration, and spiritual growth.
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input
                      type="text"
                      placeholder="Search questions, topics, or communities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12 text-lg"
                    />
                  </div>
                  <Button type="submit" size="lg" className="h-12 px-6">
                    Search
                  </Button>
                </div>
              </form>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {isLoaded && (
                  <>
                    {isSignedIn ? (
                      <Button asChild size="lg" className="text-lg px-8 py-3">
                        <Link href="/dashboard">
                          <LayoutDashboard className="mr-2 h-5 w-5" />
                          Go to Dashboard
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="lg" className="text-lg px-8 py-3">
                        <Link href="/sign-in">
                          Get Started
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                      </Button>
                    )}
                  </>
                )}
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
                  <Link href="/about">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
      </section>

      {/* Ask a Question as Guest Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Have a Question?
            </h2>
            <p className="text-xl text-gray-600">
              Ask your biblical or theological question as a guest. Our community will help you find answers.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <GuestCreateCommunityButton />
          </div>
        </div>
      </section>

      {/* Verse of the Day Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Verse of the Day
            </h2>
          </div>
          
          {verseOfTheDay && (
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className="text-center text-blue-600">
                  {verseOfTheDay.reference}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <blockquote className="text-xl text-gray-700 text-center italic leading-relaxed">
                  "{verseOfTheDay.text}"
                </blockquote>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Growing Community
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of believers who are already part of our community
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {siteStats.totalQuestions.toLocaleString()}+
                </div>
                <div className="text-gray-600">Biblical Questions</div>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {siteStats.totalTeachers}+
                </div>
                <div className="text-gray-600">Teachers</div>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {siteStats.totalBlogs}+
                </div>
                <div className="text-gray-600">Blogs</div>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-orange-600 mb-2">
                  {siteStats.totalMembers.toLocaleString()}+
                </div>
                <div className="text-gray-600">Members</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/guidelines" className="hover:text-white">Community Guidelines</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/feedback" className="hover:text-white">Feedback</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/sign-in" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/sign-up" className="hover:text-white">Sign Up</Link></li>
                <li><Link href="/communities" className="hover:text-white">Browse Communities</Link></li>
                <li><Link href="/questions" className="hover:text-white">Ask Questions</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400">
            <p>&copy; 2025 Shama Yah. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Link href="https://discord.gg/shamayah" className="hover:text-white transition-colors">
                <MessageCircle className="h-6 w-6" />
              </Link>
              <Link href="https://youtube.com/@shamayah" className="hover:text-white transition-colors">
                <Youtube className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
