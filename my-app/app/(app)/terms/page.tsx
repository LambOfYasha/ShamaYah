'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft, Scale, FileText, Shield, Users, AlertTriangle, Globe, Mail } from "lucide-react";
import Image from "next/image";

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="text-base sm:text-lg mt-2">
              The rules and guidelines for using our platform
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
                <Scale className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Welcome to Shama Yah
            </h2>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed">
              These Terms of Service govern your use of the Shama Yah platform and services. 
              By accessing or using our platform, you agree to be bound by these terms and conditions.
            </p>
            <p className="text-sm sm:text-base text-muted-foreground mt-4">
              Last updated: January 2025
            </p>
          </div>
        </div>
      </section>

      {/* Acceptance of Terms Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Acceptance of Terms
            </h2>
            <p className="text-base sm:text-lg md:text-xl">
              By using our platform, you acknowledge and agree to these terms
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Agreement to Terms</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li>• You must be at least 13 years old to use our platform</li>
                  <li>• You agree to comply with all applicable laws and regulations</li>
                  <li>• These terms apply to all users, including guests and registered members</li>
                  <li>• Continued use constitutes acceptance of any updates to these terms</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/20">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Account Responsibility</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li>• You are responsible for maintaining account security</li>
                  <li>• You must provide accurate and current information</li>
                  <li>• One account per person is allowed</li>
                  <li>• You are responsible for all activity under your account</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* User Conduct Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              User Conduct and Community Guidelines
            </h2>
            <p className="text-base sm:text-lg md:text-xl">
              Our platform is built on respect, kindness, and biblical principles
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Acceptable Use</h3>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2 mr-3 flex-shrink-0"></div>
                  <span>Engage in respectful biblical discussions and learning</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2 mr-3 flex-shrink-0"></div>
                  <span>Share knowledge and insights with the community</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2 mr-3 flex-shrink-0"></div>
                  <span>Ask thoughtful questions and provide helpful answers</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2 mr-3 flex-shrink-0"></div>
                  <span>Follow our community guidelines and moderation policies</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Prohibited Activities</h3>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-red-600 mt-2 mr-3 flex-shrink-0"></div>
                  <span>Harassment, bullying, or disrespectful behavior</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-red-600 mt-2 mr-3 flex-shrink-0"></div>
                  <span>Spam, advertising, or commercial promotion</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-red-600 mt-2 mr-3 flex-shrink-0"></div>
                  <span>Sharing inappropriate, offensive, or illegal content</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 rounded-full bg-red-600 mt-2 mr-3 flex-shrink-0"></div>
                  <span>Attempting to hack, disrupt, or compromise the platform</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Content and Intellectual Property Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/20">
                <FileText className="h-12 w-12 text-purple-600" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Content and Intellectual Property
            </h2>
            <p className="text-base sm:text-lg md:text-xl">
              Understanding ownership and rights regarding content on our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="hover:shadow-lg transition-shadow text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl">Your Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base">
                  You retain ownership of content you create, but grant us a license to use it on our platform.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
                    <Shield className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl">Platform Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base">
                  Our platform, design, and proprietary content are protected by intellectual property laws.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow text-center">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900/20">
                    <Globe className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <CardTitle className="text-lg sm:text-xl">Public Content</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm sm:text-base">
                  Content you make public may be visible to other users and search engines.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy and Data Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Privacy and Data Protection
            </h2>
            <p className="text-base sm:text-lg md:text-xl">
              How we handle your personal information and data
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Data Collection</h3>
                <p className="text-sm sm:text-base mb-4">
                  We collect information necessary to provide our services and improve your experience on our platform.
                </p>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li>• Account information and profile data</li>
                  <li>• Content you create and interactions you have</li>
                  <li>• Technical information for platform functionality</li>
                  <li>• Communication data for support and notifications</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Data Usage</h3>
                <p className="text-sm sm:text-base mb-4">
                  We use your information to provide, maintain, and improve our services while respecting your privacy.
                </p>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li>• Provide access to our platform and features</li>
                  <li>• Personalize your experience and content</li>
                  <li>• Ensure platform security and prevent abuse</li>
                  <li>• Communicate important updates and support</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Your Rights</h3>
                <p className="text-sm sm:text-base mb-4">
                  You have control over your personal information and can manage your privacy preferences.
                </p>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li>• Access and download your personal data</li>
                  <li>• Update or correct your information</li>
                  <li>• Delete your account and associated data</li>
                  <li>• Control privacy settings and communications</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Service Availability and Limitations Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Service Availability and Limitations
            </h2>
            <p className="text-base sm:text-lg md:text-xl">
              Understanding the scope and limitations of our services
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Service Availability</h3>
                <p className="text-sm sm:text-base mb-4">
                  We strive to maintain high availability but cannot guarantee uninterrupted service.
                </p>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li>• We may perform scheduled maintenance with advance notice</li>
                  <li>• Unplanned outages may occur due to technical issues</li>
                  <li>• We work to minimize downtime and restore service quickly</li>
                  <li>• Service availability may vary by geographic location</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Limitations of Liability</h3>
                <p className="text-sm sm:text-base mb-4">
                  Our services are provided "as is" and we disclaim certain warranties and liabilities.
                </p>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li>• We do not guarantee the accuracy of user-generated content</li>
                  <li>• We are not liable for damages arising from platform use</li>
                  <li>• Users are responsible for their own content and actions</li>
                  <li>• We reserve the right to modify or discontinue services</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Moderation and Enforcement</h3>
                <p className="text-sm sm:text-base mb-4">
                  We maintain community standards through moderation and enforcement actions.
                </p>
                <ul className="space-y-2 text-sm sm:text-base">
                  <li>• We may review, edit, or remove content that violates our terms</li>
                  <li>• Accounts may be suspended or terminated for violations</li>
                  <li>• Appeals process available for moderation decisions</li>
                  <li>• We reserve the right to refuse service to anyone</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Changes to Terms Section */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-full bg-orange-100 dark:bg-orange-900/20">
                <AlertTriangle className="h-12 w-12 text-orange-600" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Changes to Terms
            </h2>
            <p className="text-base sm:text-lg md:text-xl">
              We may update these terms from time to time
            </p>
          </div>

          <div className="space-y-6 sm:space-y-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Notification of Changes</h3>
                <p className="text-sm sm:text-base">
                  We will notify users of significant changes to these terms through our platform or email notifications. 
                  Continued use of our services after changes are posted constitutes acceptance of the updated terms.
                </p>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Effective Date</h3>
                <p className="text-sm sm:text-base">
                  Changes to these terms become effective immediately upon posting, unless otherwise specified. 
                  We recommend reviewing these terms periodically to stay informed of any updates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Information Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            Questions About These Terms?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8">
            If you have any questions about these Terms of Service or need clarification on any point, 
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
