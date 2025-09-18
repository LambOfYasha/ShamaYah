'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Shield, Eye, Lock, Database, Users, Globe, Mail } from "lucide-react";
import Image from "next/image";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="shadow-sm">
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
              Privacy Policy
            </h1>
            <p className="text-base sm:text-lg mt-2">
              How we protect and handle your personal information
            </p>
          </div>
        </div>
      </div>

      {/* Introduction Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-primary/10">
                <Shield className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Your Privacy Matters
            </h2>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed">
              At Shama Yah, we are committed to protecting your privacy and ensuring the security of your personal information. 
              This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground mt-4">
              Last updated: January 2025
            </p>
          </div>
        </div>
      </section>

      {/* Information We Collect Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Information We Collect
            </h2>
            <p className="text-base sm:text-lg md:text-xl">
              We collect information to provide better services to our community members
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Account Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li>• Name and email address (when you create an account)</li>
                  <li>• Profile information you choose to share</li>
                  <li>• Authentication data through Clerk</li>
                  <li>• User preferences and settings</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <Eye className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Usage Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li>• Questions, comments, and posts you create</li>
                  <li>• Community interactions and discussions</li>
                  <li>• Blog posts and content you publish</li>
                  <li>• Search queries and browsing activity</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                    <Globe className="h-6 w-6 text-purple-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Technical Information</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li>• IP address and device information</li>
                  <li>• Browser type and version</li>
                  <li>• Operating system details</li>
                  <li>• Usage analytics and performance data</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/20">
                    <Mail className="h-6 w-6 text-orange-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Communication Data</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li>• Messages sent through our platform</li>
                  <li>• Support requests and feedback</li>
                  <li>• Newsletter subscriptions (if opted in)</li>
                  <li>• Notification preferences</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How We Use Information Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              How We Use Your Information
            </h2>
            <p className="text-base sm:text-lg md:text-xl">
              We use your information to provide and improve our services
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Service Provision</h3>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                  <span>Provide access to our biblical discussion platform</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                  <span>Enable community interactions and discussions</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                  <span>Personalize your experience and content</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0"></div>
                  <span>Send important notifications and updates</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Platform Improvement</h3>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2 mr-3 flex-shrink-0"></div>
                  <span>Analyze usage patterns to improve our platform</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2 mr-3 flex-shrink-0"></div>
                  <span>Develop new features and functionality</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2 mr-3 flex-shrink-0"></div>
                  <span>Ensure platform security and prevent abuse</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2 mr-3 flex-shrink-0"></div>
                  <span>Provide customer support and assistance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Data Protection Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/20">
                <Lock className="h-12 w-12 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              How We Protect Your Data
            </h2>
            <p className="text-base sm:text-lg md:text-xl">
              We implement industry-standard security measures to protect your information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="hover:shadow-lg transition-shadow text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <Lock className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl">Encryption</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base">
                  All data is encrypted in transit and at rest using industry-standard encryption protocols.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                    <Database className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl">Secure Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base">
                  Your data is stored in secure, monitored databases with regular backups and access controls.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                    <Shield className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl">Access Controls</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base">
                  Strict access controls ensure only authorized personnel can access your personal information.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Your Rights Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Your Rights and Choices
            </h2>
            <p className="text-base sm:text-lg md:text-xl">
              You have control over your personal information
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Access and Portability</h3>
                <p className="text-sm sm:text-base mb-4">
                  You can request access to your personal data and receive a copy of your information in a portable format.
                </p>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li>• View all personal information we have about you</li>
                  <li>• Download your data in a machine-readable format</li>
                  <li>• Request information about how we process your data</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Correction and Updates</h3>
                <p className="text-sm sm:text-base mb-4">
                  You can update or correct your personal information at any time through your account settings.
                </p>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li>• Edit your profile information</li>
                  <li>• Update your contact preferences</li>
                  <li>• Modify your privacy settings</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Deletion and Opt-out</h3>
                <p className="text-sm sm:text-base mb-4">
                  You can request deletion of your account and data, or opt out of certain communications.
                </p>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li>• Delete your account and associated data</li>
                  <li>• Opt out of marketing communications</li>
                  <li>• Remove specific posts or comments</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Data Sharing Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Information Sharing
            </h2>
            <p className="text-base sm:text-lg md:text-xl">
              We do not sell your personal information to third parties
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Public Content</h3>
                <p className="text-sm sm:text-base">
                  Content you choose to make public (such as questions, comments, and blog posts) will be visible to other community members and may be indexed by search engines.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Service Providers</h3>
                <p className="text-sm sm:text-base">
                  We may share information with trusted service providers who help us operate our platform, such as hosting providers, analytics services, and authentication services like Clerk.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Legal Requirements</h3>
                <p className="text-sm sm:text-base">
                  We may disclose information if required by law, to protect our rights, or to ensure the safety of our users and the community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Questions About Privacy?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8">
            If you have any questions about this Privacy Policy or how we handle your information, 
            please don't hesitate to contact us.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto">
              <Link href="/contact">
                Contact Us
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


