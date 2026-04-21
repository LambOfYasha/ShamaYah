'use client';

import ManagedPageContent from "@/components/pages/managed-page-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useManagedPage } from "@/hooks/use-managed-page";
import Link from "next/link";
import { ArrowLeft, ChevronDown, HelpCircle, Users, BookOpen, Shield, MessageSquare, Settings, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export default function FAQPage() {
  const { page: managedPage } = useManagedPage('faq');
  const [openItems, setOpenItems] = useState<string[]>([]);

  if (managedPage) {
    return <ManagedPageContent page={managedPage} />;
  }

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const faqSections = [
    {
      id: 'general',
      title: 'General Questions',
      icon: HelpCircle,
      questions: [
        {
          id: 'what-is-shama-yah',
          question: 'What is Light Is For Everyone?',
          answer: 'Light Is For Everyone is a Christian community platform dedicated to fostering meaningful biblical discussions, theological exploration, and spiritual growth. We provide a space where believers can ask questions, share insights, and learn together in a respectful, Scripture-grounded environment.'
        },
        {
          id: 'how-to-join',
          question: 'How do I join the community?',
          answer: 'You can join our community by creating an account through our sign-up page. Simply click "Sign Up" in the navigation menu, fill out the registration form, and you\'ll be able to participate in discussions, ask questions, and access our resources.'
        },
        {
          id: 'is-it-free',
          question: 'Is Light Is For Everyone free to use?',
          answer: 'Yes, Light Is For Everyone is completely free to use. We believe that access to biblical learning and community should be available to everyone, regardless of financial circumstances.'
        },
        {
          id: 'who-can-join',
          question: 'Who can join Light Is For Everyone?',
          answer: 'Light Is For Everyone is open to all believers who are interested in biblical study and theological discussion. We welcome people from all denominations and backgrounds who share our commitment to respectful dialogue and Scripture-based learning.'
        }
      ]
    },
    {
      id: 'account',
      title: 'Account & Profile',
      icon: User,
      questions: [
        {
          id: 'create-account',
          question: 'How do I create an account?',
          answer: 'To create an account, click the "Sign Up" button in the top navigation or footer. You\'ll need to provide a valid email address, choose a username, and create a password. After registration, you may need to verify your email address.'
        },
        {
          id: 'forgot-password',
          question: 'I forgot my password. How do I reset it?',
          answer: 'On the sign-in page, click "Forgot Password" and enter your email address. We\'ll send you a link to reset your password. Make sure to check your spam folder if you don\'t receive the email within a few minutes.'
        },
        {
          id: 'update-profile',
          question: 'How do I update my profile information?',
          answer: 'You can update your profile by going to your profile page and clicking the "Edit Profile" button. From there, you can update your display name, bio, and other personal information.'
        },
        {
          id: 'delete-account',
          question: 'How do I delete my account?',
          answer: 'To delete your account, please contact our support team through the contact page or help center. We\'ll guide you through the process and ensure all your data is properly removed from our systems.'
        }
      ]
    },
    {
      id: 'community',
      title: 'Community & Guidelines',
      icon: Users,
      questions: [
        {
          id: 'community-guidelines',
          question: 'What are the community guidelines?',
          answer: 'Our community guidelines emphasize respectful dialogue, Scripture-based discussions, and mutual respect. We encourage thoughtful questions, biblical references, and constructive feedback while maintaining a Christ-centered approach to all interactions.'
        },
        {
          id: 'report-content',
          question: 'How do I report inappropriate content?',
          answer: 'If you encounter content that violates our community guidelines, you can report it by clicking the report button on the specific post or comment. Our moderation team will review the report and take appropriate action.'
        },
        {
          id: 'moderation',
          question: 'How is content moderated?',
          answer: 'Our content is moderated by a team of experienced community members and staff who review reported content and ensure adherence to our guidelines. We use both human moderation and AI assistance to maintain a healthy community environment.'
        },
        {
          id: 'guest-posting',
          question: 'Can guests post without an account?',
          answer: 'Yes, guests can post comments and questions without creating an account. However, creating an account provides additional features like profile customization, notification preferences, and the ability to edit your posts.'
        }
      ]
    },
    {
      id: 'features',
      title: 'Features & Functionality',
      icon: BookOpen,
      questions: [
        {
          id: 'ask-questions',
          question: 'How do I ask a question?',
          answer: 'To ask a question, navigate to the "Ask Questions" section or click the "Ask a Question" button. Write your question clearly, add relevant tags, and provide any necessary context. Our community members and teachers will respond with biblical insights and guidance.'
        },
        {
          id: 'browse-blogs',
          question: 'How do I browse and read blog posts?',
          answer: 'You can browse blog posts by going to the "Blogs" section. Use the search and filter options to find topics that interest you. Blog posts are written by our community teachers and cover various theological topics.'
        },
        {
          id: 'search-content',
          question: 'How do I search for specific content?',
          answer: 'Use the search bar in the top navigation to search for questions, blog posts, or discussions. You can search by keywords, tags, or specific topics. The search results will show relevant content from across the platform.'
        },
        {
          id: 'notifications',
          question: 'How do I manage my notifications?',
          answer: 'You can manage your notification preferences in your account settings. Choose which types of notifications you want to receive, such as responses to your questions, new blog posts, or community updates.'
        }
      ]
    },
    {
      id: 'technical',
      title: 'Technical Support',
      icon: Settings,
      questions: [
        {
          id: 'browser-compatibility',
          question: 'Which browsers are supported?',
          answer: 'Light Is For Everyone works best with modern browsers including Chrome, Firefox, Safari, and Edge. We recommend keeping your browser updated to the latest version for the best experience.'
        },
        {
          id: 'mobile-app',
          question: 'Is there a mobile app?',
          answer: 'Currently, Light Is For Everyone is a web-based platform that works well on mobile devices through your browser. We\'re considering developing a dedicated mobile app in the future based on community feedback.'
        },
        {
          id: 'loading-issues',
          question: 'The site is loading slowly. What should I do?',
          answer: 'If you\'re experiencing slow loading times, try refreshing the page, clearing your browser cache, or checking your internet connection. If the problem persists, please contact our support team.'
        },
        {
          id: 'data-privacy',
          question: 'How is my data protected?',
          answer: 'We take data privacy seriously and implement industry-standard security measures to protect your information. We only collect necessary data and never share your personal information with third parties without your consent.'
        }
      ]
    },
    {
      id: 'ministry',
      title: 'Ministry & Teaching',
      icon: MessageSquare,
      questions: [
        {
          id: 'who-are-teachers',
          question: 'Who are the teachers on the platform?',
          answer: 'Our teachers are experienced biblical scholars, pastors, and ministry leaders who are committed to sound doctrine and practical application of Scripture. You can learn more about them on our about page and through their YouTube channels.'
        },
        {
          id: 'become-teacher',
          question: 'How can I become a teacher or contributor?',
          answer: 'If you\'re interested in contributing as a teacher or content creator, please contact us through our contact page. We review applications based on theological knowledge, teaching experience, and alignment with our community values.'
        },
        {
          id: 'youtube-channels',
          question: 'Where can I find the teachers\' YouTube channels?',
          answer: 'You can find links to all our teachers\' YouTube channels on our contact page. These channels provide additional biblical teachings, sermons, and ministry content to supplement your learning on our platform.'
        },
        {
          id: 'discord-community',
          question: 'Is there a Discord community?',
          answer: 'Yes! We have an active Discord community where members can engage in real-time discussions, receive immediate support, and participate in live teaching sessions. You can find the Discord link on our contact page.'
        }
      ]
    }
  ];

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
              Frequently Asked Questions
            </h1>
            <p className="text-base sm:text-lg mt-2">
              Find answers to common questions about Light Is For Everyone
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Get Your Questions Answered
            </h2>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed">
              Browse through our frequently asked questions to find quick answers to common inquiries. 
              If you can't find what you're looking for, feel free to contact us directly.
            </p>
          </div>

          {/* FAQ Sections */}
          <div className="space-y-6 sm:space-y-8">
            {faqSections.map((section) => {
              const IconComponent = section.icon;
              return (
                <Card key={section.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <CardTitle className="flex items-center space-x-3 text-lg sm:text-xl">
                      <IconComponent className="h-5 w-5 sm:h-6 sm:w-6" />
                      <span>{section.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {section.questions.map((faq, index) => (
                        <Collapsible
                          key={faq.id}
                          open={openItems.includes(faq.id)}
                          onOpenChange={() => toggleItem(faq.id)}
                        >
                          <CollapsibleTrigger className="w-full px-4 sm:px-6 py-4 sm:py-5 text-left hover:bg-muted/30 transition-colors">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-sm sm:text-base pr-4">
                                {faq.question}
                              </h3>
                              <ChevronDown 
                                className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform flex-shrink-0 ${
                                  openItems.includes(faq.id) ? 'rotate-180' : ''
                                }`}
                              />
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="px-4 sm:px-6 pb-4 sm:pb-5">
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Contact Support Section */}
          <div className="mt-12 sm:mt-16 text-center">
            <Card className="p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
                Still Have Questions?
              </h3>
              <p className="text-base sm:text-lg mb-6 sm:mb-8 text-muted-foreground">
                Can't find the answer you're looking for? Our support team is here to help.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button asChild size="lg" variant="secondary" className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto">
                  <Link href="/contact">
                    Contact Support
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-base sm:text-lg px-6 sm:px-8 py-2 sm:py-3 w-full sm:w-auto">
                  <Link href="/help">
                    Help Center
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}




