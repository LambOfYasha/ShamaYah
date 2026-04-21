'use client';

import ManagedPageContent from "@/components/pages/managed-page-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useManagedPage } from "@/hooks/use-managed-page";
import Link from "next/link";
import { ArrowLeft, Users, BookOpen, Shield, Heart, Globe, Target, Award } from "lucide-react";
import Image from "next/image";


export default function AboutPage() {
  const { page: managedPage } = useManagedPage('about');

  if (managedPage) {
    return <ManagedPageContent page={managedPage} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-background shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <Button asChild variant="ghost" className="mb-3 sm:mb-4 text-sm sm:text-base">
            <Link href="/">
              <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Back to Home</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </Button>
          <div className="text-center">
            {/* Light theme logo */}
            <Image
              src="/assets/logo_light.png"
              alt="Light Is For Everyone Logo"
              width={150}
              height={60}
              className="h-12 w-auto sm:h-16 mx-auto mb-3 sm:mb-4 dark:hidden"
            />
            {/* Dark theme logo */}
            <Image
              src="/assets/logo_dark.png"
              alt="Light Is For Everyone Logo Dark"
              width={150}
              height={60}
              className="hidden dark:inline-block h-12 w-auto sm:h-16 mx-auto mb-3 sm:mb-4"
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              About Light Is For Everyone
            </h1>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Our Mission
            </h2>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed">
              Light Is For Everyone is dedicated to fostering a vibrant community where believers can engage in meaningful 
              biblical discussions, explore theological concepts, and grow together in their faith journey. 
              We believe in the power of collective wisdom and the importance of respectful dialogue in 
              understanding God's Word.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Our Core Values
            </h2>
            <p className="text-base sm:text-lg md:text-xl ">
              The principles that guide our community and shape our interactions
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 " />
                  <CardTitle className="text-base sm:text-lg">Biblical Foundation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base ">
                  All discussions and teachings are grounded in Scripture, ensuring that our community 
                  remains faithful to God's Word while exploring its depth and meaning.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 " />
                  <CardTitle className="text-base sm:text-lg">Inclusive Community</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base ">
                  We welcome believers from all backgrounds, denominations, and levels of theological 
                  understanding, creating a diverse and enriching learning environment.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8 " />
                  <CardTitle className="text-base sm:text-lg">Respectful Dialogue</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base">
                  We foster an environment of mutual respect where differing viewpoints can be 
                  discussed with grace, humility, and a commitment to understanding.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                  <CardTitle className="text-base sm:text-lg">Spiritual Growth</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base ">
                  Our primary goal is to support each member's spiritual journey, encouraging 
                  deeper understanding and stronger relationships with God and fellow believers.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center space-x-2">
                  <Globe className="h-6 w-6 sm:h-8 sm:w-8 " />
                  <CardTitle className="text-base sm:text-lg">Global Perspective</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base ">
                  We embrace the global nature of the Church, learning from diverse cultural 
                  perspectives and theological traditions from around the world.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 " />
                  <CardTitle className="text-base sm:text-lg">Purposeful Learning</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base ">
                  Every discussion, question, and resource is designed to deepen understanding 
                  and equip believers for effective ministry and witness in their daily lives.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What We Offer Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold  mb-3 sm:mb-4">
              What We Offer
            </h2>
            <p className="text-base sm:text-lg md:text-xl ">
              Discover the tools and resources available to support your spiritual journey
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold  mb-4 sm:mb-6">Community Features</h3>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base ">
                <li className="flex items-start">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5  mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Biblical Q&A forums for theological discussions</span>
                </li>
                <li className="flex items-start">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Expert-led discussions and teaching sessions</span>
                </li>
                <li className="flex items-start">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Prayer request sharing and support</span>
                </li>
                <li className="flex items-start">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Study groups and Bible study resources</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Learning Resources</h3>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                <li className="flex items-start">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Comprehensive theological blog articles</span>
                </li>
                <li className="flex items-start">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Daily verse of the day with commentary</span>
                </li>
                <li className="flex items-start">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Biblical study guides and reference materials</span>
                </li>
                <li className="flex items-start">
                  <Award className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Historical and cultural context resources</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us Section */}
      <section className="py-12 sm:py-16 md:py-20 ">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold  mb-4 sm:mb-6">
            Join Our Community
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8">
            Become part of a growing community of believers committed to understanding and 
            sharing God's Word with wisdom and grace.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto">
              <Link href="/sign-in">
                Get Started Today
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3  w-full sm:w-auto">
              <Link href="/questions">
                Browse Questions
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
