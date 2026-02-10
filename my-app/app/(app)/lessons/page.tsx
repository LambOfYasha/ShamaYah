'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCompactMode } from '@/hooks/use-compact-mode';
import { PlayCircle, BookOpen, Video, Loader2, ExternalLink, Tag } from 'lucide-react';
import { getActiveLessonCategories, getPublishedLessons } from '@/action/lessonActions';

interface SanityLesson {
  _id: string;
  title: string;
  videoId: string;
  description?: string;
  category: { _id: string; title: string } | null;
  tags?: { _id: string; name: string }[];
  content?: string;
  sortOrder: number;
}

interface CategoryWithLessons {
  _id: string;
  title: string;
  description?: string;
  lessons: SanityLesson[];
}

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  teacherUsername?: string;
}

// Fallback hardcoded data used when Sanity has no content yet
const FALLBACK_CATEGORIES: CategoryWithLessons[] = [
  {
    _id: 'fallback-fundamentals',
    title: 'Fundamentals',
    lessons: [
      { _id: 'f1', title: 'The Bible Saves Us', videoId: '2EpSJExshAw', description: 'Understanding how the Bible serves as our guide to salvation', category: null, sortOrder: 0 },
      { _id: 'f2', title: 'Belief, Grace, Justification, Sanctification and Salvation', videoId: 'oCG6kb1wUoQ', description: 'Exploring the core doctrines of Christian faith and salvation', category: null, sortOrder: 1 },
      { _id: 'f3', title: 'The Trinity is not a true doctrine', videoId: 'UfJ0DPcYGgc', description: 'Examining the biblical perspective on the Trinity doctrine', category: null, sortOrder: 2 },
      { _id: 'f4', title: 'State of the dead', videoId: 'vtCVosyhmtc', description: 'Understanding what the Bible teaches about death and the afterlife', category: null, sortOrder: 3 },
      { _id: 'f5', title: 'Hebrew Study', videoId: '1S6X6YoW0jE', description: 'Learning Hebrew to better understand biblical texts', category: null, sortOrder: 4 },
      { _id: 'f6', title: 'The Name Study', videoId: 'XhRqU9ubme4', description: 'Exploring the significance of divine names in scripture', category: null, sortOrder: 5 },
    ],
  },
  {
    _id: 'fallback-law',
    title: 'Law',
    lessons: [
      { _id: 'l1', title: 'You need the law to be saved', videoId: 'bcFr6K4v4Aw', description: "Understanding the role of God's law in salvation", category: null, sortOrder: 0 },
      { _id: 'l2', title: 'The unforgiveable sin', videoId: 'E8Uc3400yJ4', description: 'Examining what the Bible says about the unpardonable sin', category: null, sortOrder: 1 },
      { _id: 'l3', title: 'Shabbat', videoId: 'cAlZ8xCtYX4', description: 'The biblical significance and observance of the Sabbath', category: null, sortOrder: 2 },
    ],
  },
  {
    _id: 'fallback-righteous',
    title: 'Righteous Living',
    lessons: [
      { _id: 'r1', title: 'How to stop sinning', videoId: 'yREFz0wN1jw', description: 'Practical guidance for overcoming sin in daily life', category: null, sortOrder: 0 },
      { _id: 'r2', title: 'The Sanctuary', videoId: '-UlkpOfBs4k', description: 'Understanding the sanctuary service and its meaning', category: null, sortOrder: 1 },
      { _id: 'r3', title: 'Obedience', videoId: 'KL2Hg8pX3h8', description: "The importance of obedience to God's will", category: null, sortOrder: 2 },
    ],
  },
  {
    _id: 'fallback-prophecy',
    title: 'Prophecy',
    lessons: [
      { _id: 'p1', title: 'Do you need prophecy to be saved?', videoId: 'KthU3KGiFMU', description: 'The role of prophecy in Christian faith and salvation', category: null, sortOrder: 0 },
      { _id: 'p2', title: '144,000', videoId: 'bwy6SnPyMZk', description: 'Understanding the biblical reference to the 144,000', category: null, sortOrder: 1 },
      { _id: 'p3', title: 'Mark of the Beast', videoId: 'hk4LCnqFvCQ', description: 'Exploring the biblical prophecy about the mark of the beast', category: null, sortOrder: 2 },
    ],
  },
];

const TAB_NEW_VIDEOS = 0;

export default function LessonsPage() {
  const { isCompactMode } = useCompactMode();
  const [activeTab, setActiveTab] = useState(TAB_NEW_VIDEOS);
  const [newVideos, setNewVideos] = useState<YouTubeVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videosError, setVideosError] = useState<string | null>(null);

  // Sanity-driven categories + lessons
  const [lessonCategories, setLessonCategories] = useState<CategoryWithLessons[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Fetch categories and lessons from Sanity on mount
  useEffect(() => {
    async function fetchLessonsData() {
      setCategoriesLoading(true);
      try {
        const [catResult, lessonResult] = await Promise.all([
          getActiveLessonCategories(),
          getPublishedLessons(),
        ]);

        if (catResult.success && catResult.categories && catResult.categories.length > 0 && lessonResult.success && lessonResult.lessons) {
          // Group lessons by category
          const grouped: CategoryWithLessons[] = catResult.categories.map(cat => ({
            _id: cat._id,
            title: cat.title,
            description: cat.description,
            lessons: lessonResult.lessons
              .filter((l: SanityLesson) => l.category?._id === cat._id)
              .sort((a: SanityLesson, b: SanityLesson) => (a.sortOrder || 0) - (b.sortOrder || 0)),
          }));
          setLessonCategories(grouped);
        } else {
          // Fallback to hardcoded data
          setLessonCategories(FALLBACK_CATEGORIES);
        }
      } catch (error) {
        console.error('Error fetching lesson data:', error);
        setLessonCategories(FALLBACK_CATEGORIES);
      } finally {
        setCategoriesLoading(false);
      }
    }

    fetchLessonsData();
  }, []);

  // Fetch new videos when the New Videos tab is active
  useEffect(() => {
    if (activeTab !== TAB_NEW_VIDEOS) return;
    if (newVideos.length > 0) return; // Already fetched

    const fetchNewVideos = async () => {
      setVideosLoading(true);
      setVideosError(null);
      try {
        const res = await fetch('/api/youtube-feed?limit=12');
        if (!res.ok) throw new Error('Failed to fetch videos');
        const data = await res.json();
        setNewVideos(data.videos || []);
      } catch (err) {
        console.error('Error fetching new videos:', err);
        setVideosError('Unable to load new videos at this time.');
      } finally {
        setVideosLoading(false);
      }
    };

    fetchNewVideos();
  }, [activeTab, newVideos.length]);

  const isNewVideosTab = activeTab === TAB_NEW_VIDEOS;
  const currentCategory = !isNewVideosTab ? lessonCategories[activeTab - 1] : null;

  const allTabs = ['New Videos', ...lessonCategories.map(c => c.title)];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className={`${isCompactMode ? 'py-8 sm:py-12' : 'py-12 sm:py-16'} bg-background`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center ${isCompactMode ? 'mb-6 sm:mb-8' : 'mb-8 sm:mb-12'}`}>
            <div className="flex items-center justify-center gap-3 mb-4">
              <BookOpen className={`${isCompactMode ? 'h-6 w-6 sm:h-8 sm:w-8' : 'h-8 w-8 sm:h-10 sm:w-10'} text-blue-600`} />
              <h1 className={`${isCompactMode ? 'text-2xl sm:text-3xl md:text-4xl' : 'text-3xl sm:text-4xl md:text-5xl'} font-bold`}>
                Video Lessons
              </h1>
            </div>
            <p className={`${isCompactMode ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} text-muted-foreground max-w-3xl mx-auto`}>
              Explore our comprehensive collection of biblical teachings organized by category. 
              Deepen your understanding of scripture through these video lessons.
            </p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categoriesLoading ? (
            <div className="flex items-center justify-center py-4 gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Loading categories...</span>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-2 sm:gap-4 py-4">
              {allTabs.map((tabTitle, index) => (
                <Button
                  key={index}
                  variant={activeTab === index ? 'default' : 'outline'}
                  onClick={() => setActiveTab(index)}
                  className={`${isCompactMode ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} px-4 sm:px-6 py-2 sm:py-3 transition-all duration-200 ${
                    activeTab === index 
                      ? index === TAB_NEW_VIDEOS
                        ? 'bg-red-600 text-white shadow-lg'
                        : 'bg-blue-600 text-white shadow-lg'
                      : 'bg-background hover:bg-blue-50 dark:hover:bg-blue-950'
                  }`}
                >
                  {index === TAB_NEW_VIDEOS && <Video className="mr-2 h-4 w-4" />}
                  {tabTitle}
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lesson Content */}
      <section className={`${isCompactMode ? 'py-8 sm:py-12' : 'py-12 sm:py-16'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* New Videos Tab Content */}
          {isNewVideosTab && (
            <>
              <div className={`text-center ${isCompactMode ? 'mb-8 sm:mb-10' : 'mb-10 sm:mb-12'}`}>
                <h2 className={`${isCompactMode ? 'text-xl sm:text-2xl md:text-3xl' : 'text-2xl sm:text-3xl md:text-4xl'} font-bold ${isCompactMode ? 'mb-2 sm:mb-3' : 'mb-3 sm:mb-4'}`}>
                  New Videos
                </h2>
                <p className={`${isCompactMode ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} text-muted-foreground`}>
                  Latest uploads from our teachers&apos; ministry channels
                </p>
              </div>

              {videosLoading && (
                <div className="flex flex-col items-center justify-center py-16">
                  <Loader2 className="h-10 w-10 text-red-600 animate-spin mb-4" />
                  <p className="text-muted-foreground">Loading new videos...</p>
                </div>
              )}

              {videosError && !videosLoading && (
                <div className="text-center py-12">
                  <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className={`${isCompactMode ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-semibold mb-2`}>
                    {videosError}
                  </h3>
                  <p className="text-muted-foreground">
                    Please try again later.
                  </p>
                </div>
              )}

              {!videosLoading && !videosError && newVideos.length === 0 && (
                <div className="text-center py-12">
                  <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className={`${isCompactMode ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-semibold mb-2`}>
                    No new videos available
                  </h3>
                  <p className="text-muted-foreground">
                    New videos from our teachers will appear here once their YouTube channels are configured.
                  </p>
                </div>
              )}

              {!videosLoading && !videosError && newVideos.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {newVideos.map((video) => (
                    <Card key={video.videoId} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <PlayCircle className={`${isCompactMode ? 'h-5 w-5' : 'h-6 w-6'} text-red-600 mt-1 flex-shrink-0`} />
                          <div className="min-w-0">
                            <CardTitle className={`${isCompactMode ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} line-clamp-2 group-hover:text-red-600 transition-colors`}>
                              {video.title}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`${isCompactMode ? 'text-xs' : 'text-xs sm:text-sm'} text-muted-foreground`}>
                                {video.channelTitle}
                                {video.teacherUsername && ` • ${video.teacherUsername}`}
                              </span>
                            </div>
                            <span className={`${isCompactMode ? 'text-xs' : 'text-xs sm:text-sm'} text-muted-foreground`}>
                              {new Date(video.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {video.description && (
                          <p className={`${isCompactMode ? 'text-sm' : 'text-sm sm:text-base'} text-muted-foreground mb-4 line-clamp-2`}>
                            {video.description}
                          </p>
                        )}

                        {/* Video Embed */}
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          <iframe
                            src={`https://www.youtube.com/embed/${video.videoId}`}
                            title={video.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                          />
                        </div>

                        <a
                          href={`https://www.youtube.com/channel/${video.channelId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`inline-flex items-center gap-1 mt-3 ${isCompactMode ? 'text-xs' : 'text-xs sm:text-sm'} text-red-600 hover:text-red-700 transition-colors`}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Visit Channel
                        </a>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Category Tab Content */}
          {!isNewVideosTab && currentCategory && (
            <>
              {/* Category Header */}
              <div className={`text-center ${isCompactMode ? 'mb-8 sm:mb-10' : 'mb-10 sm:mb-12'}`}>
                <h2 className={`${isCompactMode ? 'text-xl sm:text-2xl md:text-3xl' : 'text-2xl sm:text-3xl md:text-4xl'} font-bold ${isCompactMode ? 'mb-2 sm:mb-3' : 'mb-3 sm:mb-4'}`}>
                  {currentCategory.title}
                </h2>
                {currentCategory.description && (
                  <p className={`${isCompactMode ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} text-muted-foreground mb-2`}>
                    {currentCategory.description}
                  </p>
                )}
                <p className={`${isCompactMode ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} text-muted-foreground`}>
                  {currentCategory.lessons.length} lesson{currentCategory.lessons.length !== 1 ? 's' : ''} in this category
                </p>
              </div>

              {/* Lessons Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {currentCategory.lessons.map((lesson) => (
                  <Card key={lesson._id} className="group hover:shadow-lg transition-all duration-300 border-0 bg-card">
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <PlayCircle className={`${isCompactMode ? 'h-5 w-5' : 'h-6 w-6'} text-blue-600 mt-1 flex-shrink-0`} />
                        <div>
                          <CardTitle className={`${isCompactMode ? 'text-base sm:text-lg' : 'text-lg sm:text-xl'} line-clamp-2 group-hover:text-blue-600 transition-colors`}>
                            {lesson.title}
                          </CardTitle>
                          {lesson.tags && lesson.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {lesson.tags.map(tag => (
                                <span key={tag._id} className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                  <Tag className="h-2.5 w-2.5" />
                                  {tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {lesson.description && (
                        <p className={`${isCompactMode ? 'text-sm' : 'text-sm sm:text-base'} text-muted-foreground mb-4 line-clamp-3`}>
                          {lesson.description}
                        </p>
                      )}

                      {/* Video Embed */}
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                        <iframe
                          src={`https://www.youtube.com/embed/${lesson.videoId}`}
                          title={lesson.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="absolute inset-0 w-full h-full"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Empty State */}
              {currentCategory.lessons.length === 0 && (
                <div className="text-center py-12">
                  <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className={`${isCompactMode ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'} font-semibold mb-2`}>
                    No lessons available
                  </h3>
                  <p className="text-muted-foreground">
                    Lessons for this category are coming soon.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
