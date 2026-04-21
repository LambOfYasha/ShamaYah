'use client';

import ManagedPageContent from "@/components/pages/managed-page-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useManagedPage } from "@/hooks/use-managed-page";
import Link from "next/link";
import { ArrowLeft, Shield, Heart, Users, BookOpen, AlertTriangle, CheckCircle, XCircle, MessageSquare, Eye, Flag } from "lucide-react";
import Image from "next/image";

export default function GuidelinesPage() {
  const { page: managedPage } = useManagedPage('guidelines');

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
              alt="Shama Yah Logo"
              width={150}
              height={60}
              className="h-12 w-auto sm:h-16 mx-auto mb-3 sm:mb-4 dark:hidden"
            />
            {/* Dark theme logo */}
            <Image
              src="/assets/logo_dark.png"
              alt="Shama Yah Logo Dark"
              width={150}
              height={60}
              className="hidden dark:inline-block h-12 w-auto sm:h-16 mx-auto mb-3 sm:mb-4"
            />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Community Guidelines
            </h1>
            <p className="text-base sm:text-lg mt-2 sm:mt-3 text-muted-foreground">
              Building a respectful and Christ-centered community together
            </p>
          </div>
        </div>
      </div>

      {/* Introduction Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Welcome to Our Community
            </h2>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed">
              At Shama Yah, we are committed to creating a safe, respectful, and spiritually enriching 
              environment where believers can grow in their faith together. These guidelines help ensure 
              that our community remains a place of learning, encouragement, and biblical fellowship.
            </p>
          </div>
        </div>
      </section>

      {/* Core Principles Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Our Core Principles
            </h2>
            <p className="text-base sm:text-lg md:text-xl">
              The foundational values that guide all interactions in our community
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                  <CardTitle className="text-base sm:text-lg">Love & Respect</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base">
                  Treat every member with the love and respect that Christ showed us. 
                  Remember that behind every username is a beloved child of God.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-6 w-6 sm:h-8 sm:w-8" />
                  <CardTitle className="text-base sm:text-lg">Biblical Foundation</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base">
                  Ground all discussions in Scripture. When sharing opinions, 
                  support them with biblical references and sound theological reasoning.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                  <CardTitle className="text-base sm:text-lg">Inclusive Fellowship</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base">
                  Welcome believers from all backgrounds, denominations, and levels 
                  of theological understanding. Unity in Christ transcends our differences.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-6 w-6 sm:h-8 sm:w-8" />
                  <CardTitle className="text-base sm:text-lg">Safe Environment</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base">
                  Maintain a harassment-free environment where everyone feels safe 
                  to share their thoughts, questions, and spiritual journey.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8" />
                  <CardTitle className="text-base sm:text-lg">Constructive Dialogue</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base">
                  Engage in meaningful conversations that build up rather than tear down. 
                  Disagree with ideas, not with people.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-6 w-6 sm:h-8 sm:w-8" />
                  <CardTitle className="text-base sm:text-lg">Transparency</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base">
                  Be honest about your sources, acknowledge when you're uncertain, 
                  and be open to learning from others' perspectives.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Do's and Don'ts Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Community Standards
            </h2>
            <p className="text-base sm:text-lg md:text-xl">
              Clear expectations for positive community participation
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            {/* Do's */}
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 mr-3" />
                What We Encourage
              </h3>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Share personal testimonies and spiritual experiences</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Ask thoughtful questions about faith and theology</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Provide biblical references to support your points</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Pray for and encourage fellow community members</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Share helpful resources and study materials</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Use respectful language even when disagreeing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Report inappropriate content to moderators</span>
                </li>
              </ul>
            </div>

            {/* Don'ts */}
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center">
                <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600 mr-3" />
                What We Prohibit
              </h3>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                <li className="flex items-start">
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Harassment, bullying, or personal attacks</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Spreading false doctrine or heresy</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Inappropriate, offensive, or vulgar language</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Spam, self-promotion, or commercial content</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Sharing private information without consent</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Discrimination based on race, gender, or background</span>
                </li>
                <li className="flex items-start">
                  <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                  <span>Creating multiple accounts to circumvent moderation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Moderation Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Community Moderation
            </h2>
            <p className="text-base sm:text-lg md:text-xl">
              How we maintain a healthy and respectful community environment
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Flag className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                  Reporting Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base mb-4">
                  If you encounter content that violates our guidelines, please report it using the 
                  report button or contact our moderation team. We take all reports seriously and 
                  investigate them promptly.
                </p>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li>• Use the report feature on posts, comments, or user profiles</li>
                  <li>• Contact moderators directly for urgent concerns</li>
                  <li>• Provide context when reporting to help with investigation</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                  Enforcement Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base mb-4">
                  Our moderation team may take various actions to maintain community standards:
                </p>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li>• <strong>Warning:</strong> First-time minor violations receive a private warning</li>
                  <li>• <strong>Content Removal:</strong> Inappropriate posts or comments are removed</li>
                  <li>• <strong>Temporary Suspension:</strong> Repeated violations may result in temporary restrictions</li>
                  <li>• <strong>Permanent Ban:</strong> Severe or repeated violations may lead to permanent removal</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                  Appeals Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base">
                  If you believe a moderation action was taken in error, you can appeal the decision. 
                  Contact our moderation team with your case details, and we will review the situation 
                  fairly and transparently.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Questions About Guidelines?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8">
            If you have questions about these guidelines or need clarification on any community standards, 
            we're here to help. Our moderation team is committed to supporting our community members.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto">
              <Link href="/contact">
                Contact Moderation Team
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto">
              <Link href="/help">
                Help Center
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}




