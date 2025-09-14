'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Phone, MessageCircle, Youtube, ExternalLink } from "lucide-react";
import Image from "next/image";

export default function ContactPage() {
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
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
              Contact Us
            </h1>
            <p className="text-base sm:text-lg text-gray-600 mt-2">
              Get in touch with our community and ministry leaders
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Get In Touch
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
              We'd love to hear from you! Whether you have questions, need support, or want to connect with our community, 
              we're here to help. Reach out to us through any of the channels below.
            </p>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-12">
            {/* Phone/Text Contact */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Phone & Text</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Call or text us for immediate assistance and support.
                </p>
                <div className="space-y-2">
                  <a 
                    href="tel:617-465-2880" 
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    617-465-2880
                  </a>
                  <a 
                    href="sms:617-465-2880" 
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Text Message
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Discord Contact */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Discord Community</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Join our Discord server for real-time community discussions and support.
                </p>
                <a 
                  href="https://discord.gg/tqErypWMEG" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Join Discord Server
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </CardContent>
            </Card>
          </div>

          {/* YouTube Channels Section */}
          <div className="mb-12">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Our Ministry Channels
              </h3>
              <p className="text-base sm:text-lg text-gray-600">
                Follow our teachers and ministry leaders on YouTube for biblical teachings and spiritual guidance.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Brother Owen */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Youtube className="h-5 w-5 text-red-600" />
                    </div>
                    <CardTitle className="text-base sm:text-lg">Brother Owen</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Toothful Ministry
                  </p>
                  <a 
                    href="https://youtube.com/@Toothful-Ministry" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-colors text-sm"
                  >
                    Visit Channel
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </CardContent>
              </Card>

              {/* Brother Pat */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Youtube className="h-5 w-5 text-red-600" />
                    </div>
                    <CardTitle className="text-base sm:text-lg">Brother Pat</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Let's Learn The Word
                  </p>
                  <a 
                    href="https://youtube.com/@letslearntheword" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-colors text-sm"
                  >
                    Visit Channel
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </CardContent>
              </Card>

              {/* Brother Raul */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Youtube className="h-5 w-5 text-red-600" />
                    </div>
                    <CardTitle className="text-base sm:text-lg">Brother Raul</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Raul in the Mountain
                  </p>
                  <a 
                    href="https://youtube.com/@raulinthemountain" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-colors text-sm"
                  >
                    Visit Channel
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </CardContent>
              </Card>

              {/* Brother John */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Youtube className="h-5 w-5 text-red-600" />
                    </div>
                    <CardTitle className="text-base sm:text-lg">Brother John</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    SIH Ministry
                  </p>
                  <a 
                    href="https://youtube.com/@sih-fw8yn" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-colors text-sm"
                  >
                    Visit Channel
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </CardContent>
              </Card>

              {/* Brother Yakov */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Youtube className="h-5 w-5 text-red-600" />
                    </div>
                    <CardTitle className="text-base sm:text-lg">Brother Yakov</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Cross and Mantle
                  </p>
                  <a 
                    href="https://www.youtube.com/@crossandmantle" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-colors text-sm"
                  >
                    Visit Channel
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </CardContent>
              </Card>

              {/* Brother Yonathan */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Youtube className="h-5 w-5 text-red-600" />
                    </div>
                    <CardTitle className="text-base sm:text-lg">Brother Yonathan</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    United Conclusion Ministries
                  </p>
                  <a 
                    href="https://www.youtube.com/@UnitedConclusionMinistries" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-colors text-sm"
                  >
                    Visit Channel
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </CardContent>
              </Card>

              {/* Brother Brian */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <Youtube className="h-5 w-5 text-red-600" />
                    </div>
                    <CardTitle className="text-base sm:text-lg">Brother Brian</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Brian Anthony Clayton
                  </p>
                  <a 
                    href="https://www.youtube.com/@briananthonyclayton" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-red-600 hover:text-red-800 font-medium transition-colors text-sm"
                  >
                    Visit Channel
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Additional Support Section */}
          <div className="bg-blue-600 rounded-lg p-6 sm:p-8 text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
              Need Additional Support?
            </h3>
            <p className="text-blue-100 mb-6 sm:mb-8">
              If you can't find what you're looking for or need immediate assistance, 
              don't hesitate to reach out to us directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto">
                <Link href="/help">
                  Visit Help Center
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 border-white text-white hover:bg-background hover:text-blue-600 w-full sm:w-auto">
                <Link href="/questions">
                  Ask a Question
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Community</h4>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/guidelines" className="hover:text-white">Community Guidelines</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Resources</h4>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/feedback" className="hover:text-white">Feedback</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Connect</h4>
              <ul className="space-y-2 text-sm sm:text-base text-gray-400">
                <li><Link href="/sign-in" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/sign-up" className="hover:text-white">Sign Up</Link></li>
                <li><Link href="/communities" className="hover:text-white">Browse Communities</Link></li>
                <li><Link href="/questions" className="hover:text-white">Ask Questions</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-6 sm:mt-8 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center text-sm sm:text-base text-gray-400">
            <p>&copy; 2025 Shama Yah. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-4 sm:mt-0">
              <Link href="https://discord.gg/tqErypWMEG" className="hover:text-white transition-colors">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
              <Link href="https://youtube.com/@Toothful-Ministry" className="hover:text-white transition-colors">
                <Youtube className="h-5 w-5 sm:h-6 sm:w-6" />
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
