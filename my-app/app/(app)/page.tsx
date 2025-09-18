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
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import GuestCreateCommunityButton from "@/components/community/GuestCreateCommunityButton";
import { useCompactMode } from "@/hooks/use-compact-mode";

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
  const { isCompactMode } = useCompactMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [verseOfTheDay, setVerseOfTheDay] = useState<VerseOfTheDay | null>(null);
  const [siteStats, setSiteStats] = useState<SiteStats>({
    totalQuestions: 0,
    totalTeachers: 0,
    totalBlogs: 0,
    totalMembers: 0
  });
  const [currentSlide, setCurrentSlide] = useState(0);

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

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 4);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 4) % 4);
  };

  const statsData = [
    {
      value: siteStats.totalQuestions.toLocaleString(),
      label: "Biblical Questions",
      color: "text-blue-600"
    },
    {
      value: siteStats.totalTeachers,
      label: "Teachers",
      color: "text-green-600"
    },
    {
      value: siteStats.totalBlogs,
      label: "Blogs",
      color: "text-purple-600"
    },
    {
      value: siteStats.totalMembers.toLocaleString(),
      label: "Members",
      color: "text-orange-600"
    }
  ];


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className={`relative overflow-hidden ${isCompactMode ? 'min-h-[15vh]' : 'min-h-[20vh]'} sm:min-h-screen flex items-center justify-center`}>
        {/* Background Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Light theme banner */}
          <Image
            src="/assets/logo_light.png"
            alt="Shama Yah Logo Background"
            fill
            className={`object-contain max-w-full ${isCompactMode ? 'max-h-[15vh]' : 'max-h-[20vh]'} sm:max-h-[70vh] md:max-h-[80vh] dark:hidden`}
            priority
          />
          {/* Dark theme banner */}
          <Image
            src="/assets/logo_dark.png"
            alt="Shama Yah Logo Background Dark"
            fill
            className={`hidden dark:block object-contain max-w-full ${isCompactMode ? 'max-h-[15vh]' : 'max-h-[20vh]'} sm:max-h-[70vh] md:max-h-[80vh]`}
            priority
          />
        </div>
    
      </section>

      {/*Welcome Section*/}
      <section className="bg-background">  
             {/* Content Below Logo */}
             <div className={`${isCompactMode ? 'space-y-4' : 'space-y-6'} sm:space-y-8`}>
              <h1 className={`text-center ${isCompactMode ? 'text-2xl sm:text-3xl md:text-5xl' : 'text-3xl sm:text-4xl md:text-6xl'} font-bold`}>
                Welcome to
                <span className="block">Shama Yah</span>
              </h1>
              <p className={`${isCompactMode ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} text-muted-foreground max-w-3xl mx-auto px-4`}>
                A community for biblical discussion, theological exploration, and spiritual growth.
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 sm:h-5 sm:w-5" />
                    <Input
                      type="text"
                      placeholder="Search questions, topics, or communities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`pl-10 ${isCompactMode ? 'h-9 sm:h-10' : 'h-10 sm:h-12'} ${isCompactMode ? 'text-sm sm:text-base' : 'text-base sm:text-lg'}`}
                    />
                  </div>
                  <Button type="submit" size="lg" className={`${isCompactMode ? 'h-9 sm:h-10' : 'h-10 sm:h-12'} px-4 sm:px-6 ${isCompactMode ? 'text-sm sm:text-base' : 'text-sm sm:text-base'}`}>
                    Search
                  </Button>
                </div>
              </form>

              <div className={`flex flex-col sm:flex-row ${isCompactMode ? 'gap-2 sm:gap-3' : 'gap-3 sm:gap-4'} justify-center px-4`}>
                {isLoaded && (
                  <>
                    {isSignedIn ? (
                      <Button asChild size="lg" className={`${isCompactMode ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} px-6 sm:px-8 ${isCompactMode ? 'py-2' : 'py-2 sm:py-3'} w-full sm:w-auto`}>
                        <Link href="/dashboard">
                          <LayoutDashboard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="hidden sm:inline">Go to Dashboard</span>
                          <span className="sm:hidden">Dashboard</span>
                          <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="lg" className={`${isCompactMode ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} px-6 sm:px-8 ${isCompactMode ? 'py-2' : 'py-2 sm:py-3'} w-full sm:w-auto`}>
                        <Link href="/sign-in">
                          Get Started
                          <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                        </Link>
                      </Button>
                    )}
                  </>
                )}
                <Button asChild variant="outline" size="lg" className={`${isCompactMode ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} px-6 sm:px-8 ${isCompactMode ? 'py-2' : 'py-2 sm:py-3'} w-full sm:w-auto`}>
                  <Link href="/about">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
      </section>

      {/* Introduction Video Section */}
      <section className={`${isCompactMode ? 'py-8 sm:py-16' : 'py-12 sm:py-20'} bg-muted`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center ${isCompactMode ? 'mb-6 sm:mb-10' : 'mb-8 sm:mb-12'}`}>
            <h2 className={`${isCompactMode ? 'text-xl sm:text-2xl md:text-3xl' : 'text-2xl sm:text-3xl md:text-4xl'} font-bold ${isCompactMode ? 'mb-2 sm:mb-3' : 'mb-3 sm:mb-4'}`}>
              Intro Lesson
            </h2>
            <p className={`${isCompactMode ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} text-muted-foreground`}>
              Watch this introduction to learn more about Shama Yah and how we can help you grow in your faith.
            </p>
          </div>
          
          <div className="relative w-full max-w-4xl mx-auto">
            <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://www.youtube.com/embed/vV_uDd8yNpk"
                title="Shama Yah Introduction Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Ask a Question as Guest Section */}
      <section className={`${isCompactMode ? 'py-8 sm:py-16' : 'py-12 sm:py-20'} bg-background`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center ${isCompactMode ? 'mb-6 sm:mb-10' : 'mb-8 sm:mb-12'}`}>
            <h2 className={`${isCompactMode ? 'text-xl sm:text-2xl md:text-3xl' : 'text-2xl sm:text-3xl md:text-4xl'} font-bold ${isCompactMode ? 'mb-2 sm:mb-3' : 'mb-3 sm:mb-4'}`}>
              Have a Question?
            </h2>
            <p className={`${isCompactMode ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} text-muted-foreground`}>
              Ask your biblical or theological question as a guest. Our community will help you find answers.
            </p>
          </div>
          
          <div className="max-w-2xl mx-auto">
            <GuestCreateCommunityButton />
          </div>
        </div>
      </section>

      {/* Verse of the Day Section */}
      <section className={`${isCompactMode ? 'py-8 sm:py-16' : 'py-12 sm:py-20'} bg-muted`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center ${isCompactMode ? 'mb-6 sm:mb-10' : 'mb-8 sm:mb-12'}`}>
            <h2 className={`${isCompactMode ? 'text-xl sm:text-2xl md:text-3xl' : 'text-2xl sm:text-3xl md:text-4xl'} font-bold ${isCompactMode ? 'mb-2 sm:mb-3' : 'mb-3 sm:mb-4'}`}>
              Verse of the Moment
            </h2>
          </div>
          
          {verseOfTheDay && (
            <Card className="max-w-3xl mx-auto">
              <CardHeader>
                <CardTitle className={`text-center ${isCompactMode ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'}`}>
                  {verseOfTheDay.reference}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <blockquote className={`${isCompactMode ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} text-foreground text-center italic leading-relaxed`}>
                  "{verseOfTheDay.text}"
                </blockquote>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className={`${isCompactMode ? 'py-8 sm:py-16' : 'py-12 sm:py-20'} bg-background`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center ${isCompactMode ? 'mb-8 sm:mb-12' : 'mb-12 sm:mb-16'}`}>
            <h2 className={`${isCompactMode ? 'text-xl sm:text-2xl md:text-3xl' : 'text-2xl sm:text-3xl md:text-4xl'} font-bold ${isCompactMode ? 'mb-2 sm:mb-3' : 'mb-3 sm:mb-4'}`}>
              Our Growing Community
            </h2>
            <p className={`${isCompactMode ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} text-muted-foreground`}>
              Join thousands of believers who are already part of our community
            </p>
          </div>

          {/* Mobile Slideshow */}
          <div className="block sm:hidden">
            <div className="relative">
              <div className="overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {statsData.map((stat, index) => (
                    <div key={index} className="w-full flex-shrink-0 px-2">
                      <Card className="text-center hover:shadow-lg transition-shadow">
                        <CardContent className={`${isCompactMode ? 'pt-4' : 'pt-6'}`}>
                          <div className={`${isCompactMode ? 'text-3xl' : 'text-4xl'} font-bold ${stat.color} ${isCompactMode ? 'mb-1' : 'mb-2'}`}>
                            {stat.value}+
                          </div>
                          <div className={`${isCompactMode ? 'text-sm' : 'text-base'} text-muted-foreground`}>{stat.label}</div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Navigation Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 shadow-lg border"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-background/80 hover:bg-background rounded-full p-2 shadow-lg border"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
              
              {/* Dots Indicator */}
              <div className="flex justify-center mt-4 space-x-2">
                {statsData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Grid */}
          <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className={`${isCompactMode ? 'pt-3 sm:pt-4' : 'pt-4 sm:pt-6'}`}>
                <div className={`${isCompactMode ? 'text-xl sm:text-3xl' : 'text-2xl sm:text-4xl'} font-bold text-blue-600 ${isCompactMode ? 'mb-1' : 'mb-1 sm:mb-2'}`}>
                  {siteStats.totalQuestions.toLocaleString()}+
                </div>
                <div className={`${isCompactMode ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} text-muted-foreground`}>Biblical Questions</div>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className={`${isCompactMode ? 'pt-3 sm:pt-4' : 'pt-4 sm:pt-6'}`}>
                <div className={`${isCompactMode ? 'text-xl sm:text-3xl' : 'text-2xl sm:text-4xl'} font-bold text-green-600 ${isCompactMode ? 'mb-1' : 'mb-1 sm:mb-2'}`}>
                  {siteStats.totalTeachers}+
                </div>
                <div className={`${isCompactMode ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} text-muted-foreground`}>Teachers</div>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className={`${isCompactMode ? 'pt-3 sm:pt-4' : 'pt-4 sm:pt-6'}`}>
                <div className={`${isCompactMode ? 'text-xl sm:text-3xl' : 'text-2xl sm:text-4xl'} font-bold text-purple-600 ${isCompactMode ? 'mb-1' : 'mb-1 sm:mb-2'}`}>
                  {siteStats.totalBlogs}+
                </div>
                <div className={`${isCompactMode ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} text-muted-foreground`}>Blogs</div>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className={`${isCompactMode ? 'pt-3 sm:pt-4' : 'pt-4 sm:pt-6'}`}>
                <div className={`${isCompactMode ? 'text-xl sm:text-3xl' : 'text-2xl sm:text-4xl'} font-bold text-orange-600 ${isCompactMode ? 'mb-1' : 'mb-1 sm:mb-2'}`}>
                  {siteStats.totalMembers.toLocaleString()}+
                </div>
                <div className={`${isCompactMode ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} text-muted-foreground`}>Members</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      
    </div>
  );
}
