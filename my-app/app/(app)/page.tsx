'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { 
  Users, 
  MessageSquare, 
  BookOpen, 
  Shield, 
  ArrowRight,
  Heart,
  Search,
  Globe,
  LayoutDashboard
} from "lucide-react";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useUser();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Welcome to the
              <span className="text-blue-600 block">Christian Community</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with fellow believers, explore theological discussions, and grow in your faith through meaningful conversations and shared experiences.
            </p>
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
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Join Our Community?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover the unique features that make our platform the perfect place for Christian fellowship and growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-8 w-8 text-blue-600" />
                  <CardTitle>Community Discussions</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Join vibrant discussions on biblical topics, theology, and spiritual growth with fellow believers from around the world.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-8 w-8 text-green-600" />
                  <CardTitle>Biblical Resources</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access a wealth of biblical resources, study materials, and theological insights shared by our community members.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Heart className="h-8 w-8 text-red-600" />
                  <CardTitle>Prayer Support</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Share prayer requests and receive support from a caring community of believers who will lift you up in prayer.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-8 w-8 text-purple-600" />
                  <CardTitle>Safe Environment</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Enjoy a moderated, respectful environment where meaningful conversations can flourish without fear of judgment.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Search className="h-8 w-8 text-orange-600" />
                  <CardTitle>Find Answers</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Ask questions about faith, theology, or Christian living and receive thoughtful responses from experienced believers.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Globe className="h-8 w-8 text-indigo-600" />
                  <CardTitle>Global Fellowship</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Connect with Christians from diverse backgrounds and cultures, enriching your understanding of the global church.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
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
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">2,500+</div>
              <div className="text-gray-600">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">150+</div>
              <div className="text-gray-600">Communities</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">10,000+</div>
              <div className="text-gray-600">Discussions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">50+</div>
              <div className="text-gray-600">Countries</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your journey of faith and fellowship today. Connect with believers, ask questions, and grow in your relationship with Christ.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isLoaded && (
              <>
                {isSignedIn ? (
                  <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
                    <Link href="/dashboard">
                      <LayoutDashboard className="mr-2 h-5 w-5" />
                      Go to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
                    <Link href="/sign-in">
                      Sign Up Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                )}
              </>
            )}
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-blue-600">
              <Link href="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Christian Community</h3>
              <p className="text-gray-400">
                A place for believers to connect, learn, and grow together in faith.
              </p>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/guidelines" className="hover:text-white">Community Guidelines</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/feedback" className="hover:text-white">Feedback</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/sign-in" className="hover:text-white">Sign In</Link></li>
                <li><Link href="/sign-up" className="hover:text-white">Sign Up</Link></li>
                <li><Link href="/communities" className="hover:text-white">Browse Communities</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Christian Community. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
