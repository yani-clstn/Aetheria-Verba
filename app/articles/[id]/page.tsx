import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Redis } from '@upstash/redis';
import { Eye, Bookmark, Clock3, CalendarDays, ArrowLeft } from 'lucide-react';
import { getArticleById } from '../../../src/data/articles';

const redis = Redis.fromEnv();

// Helper to safely increment views without crashing if Redis is unavailable
async function getAndIncrementViews(articleId: string): Promise<number> {
  try {
    const views = await redis.incr(`pageviews:article:${articleId}`);
    return views;
  } catch (error) {
    console.error(`Error interacting with Redis for article ${articleId}:`, error);
    return 0;
  }
}

// Generates dynamic SEO metadata for Google search results
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await getArticleById(params.id);

  if (!article) {
    return {
      title: 'Story Not Found | Aetheria Verba',
      robots: { index: false, follow: true },
    };
  }

  const canonicalUrl = `https://aetheria-verba.vercel.app/article/${article.id}`;

  return {
    title: `${article.title} | Aetheria Verba`,
    description: article.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: canonicalUrl,
      siteName: 'Aetheria Verba',
      locale: 'en_PH',
      type: 'article',
      images: [
        {
          url: article.imageUrl,
          width: 1200,
          height: 630,
          alt: `${article.title} featured image`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: [article.imageUrl],
    },
  };
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticleById(params.id);

  // Trigger Next.js 404 page if the article ID is not found
  if (!article) {
    notFound();
  }

  // Increment and fetch view count atomically
  const views = await getAndIncrementViews(article.id);

  return (
    <article className="min-h-screen px-4 md:px-12 py-8 max-w-4xl mx-auto text-stone-900 dark:text-stone-100 transition-colors duration-300">
      {/* Header Navigation */}
      <div className="flex items-center justify-between mb-10 border-b border-stone-200 dark:border-stone-800 pb-5">
        <Link 
          href="/" 
          className="text-xs uppercase tracking-widest text-teal-700 dark:text-teal-400 hover:underline inline-flex items-center gap-1 font-semibold"
        >
          <ArrowLeft size={14} /> Back to all stories
        </Link>

        <button
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-stone-200 dark:border-stone-800 text-xs hover:border-teal-600 dark:hover:border-teal-400 transition-all text-stone-700 dark:text-stone-300"
        >
          <Bookmark size={14} />
          Save Story
        </button>
      </div>

      <header className="mb-10">
        <div className="flex justify-between items-center text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-4">
          <span className="font-semibold text-teal-700 dark:text-teal-400">{article.category}</span>
          <span className="flex items-center gap-1">
            <Eye size={14} /> {views.toLocaleString()} views
          </span>
        </div>

        <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-5 text-stone-950 dark:text-stone-50">
          {article.title}
        </h1>

        <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-sm text-stone-600 dark:text-stone-400 border-t border-b border-stone-200 dark:border-stone-800 py-3">
          <span className="flex items-center gap-1.5"><CalendarDays size={16} /> {article.date}</span>
          <span className="flex items-center gap-1.5"><Clock3 size={16} /> {article.readTime}</span>
        </div>
      </header>

      {/* Featured Image */}
      <img 
        src={article.imageUrl} 
        alt={article.title} 
        className="w-full h-80 md:h-[480px] object-cover rounded-2xl mb-12 shadow-lg border border-stone-100 dark:border-stone-900" 
      />

      {/* Epigraph / Callout Banner */}
      {article.subtitleQuote && (
        <div className="prose-base leading-relaxed">
          <ReactMarkdown>
            {article.subtitleQuote}
          </ReactMarkdown>
        </div>
      )}

      {/* Main Body Content rendered via ReactMarkdown */}
      <div className="prose dark:prose-invert max-w-2xl mx-auto font-serif text-lg md:text-xl leading-loose text-stone-800 dark:text-stone-100 space-y-6 antialiased">
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </div>

      <footer className="mt-16 pt-10 border-t border-stone-200 dark:border-stone-800 text-center">
        <Link href="/" className="text-teal-700 dark:text-teal-400 hover:underline">
          Discover more entries on AETHERIA VERBA →
        </Link>
      </footer>
    </article>
  );
}