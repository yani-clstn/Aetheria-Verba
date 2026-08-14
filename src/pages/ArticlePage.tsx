import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { ARTICLES } from '../data/articles';
import { supabase } from '../lib/supabase';

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const article = ARTICLES.find((a) => a.id === id);
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;

    // Increment and fetch real-time view count
    async function recordView() {
      const { data, error } = await supabase.rpc('increment_views', { article_id: id });
      if (!error && data !== null) {
        setViews(data);
      }
    }

    recordView();
  }, [id]);

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-serif font-bold mb-4">Story Not Found</h1>
        <Link to="/" className="text-teal-600 dark:text-teal-400 hover:underline">
          ← Return to Journal
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      {/* Dynamic SEO Meta Title tag for browsers and crawlers */}
      <title>{`${article.title} — Aetheria Verba`}</title>
      <meta name="description" content={article.excerpt} />

      <Link to="/" className="text-xs uppercase tracking-widest text-teal-600 dark:text-teal-400 hover:underline mb-6 inline-block">
        ← Back to all stories
      </Link>

      <header className="mb-8">
        <div className="flex justify-between items-center text-xs text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">
          <span>{article.category}</span>
          <span>{views !== null ? `${views.toLocaleString()} views` : 'Loading views...'}</span>
        </div>

        <h1 className="font-serif text-3xl md:text-5xl font-bold leading-tight mb-4">
          {article.title}
        </h1>

        <p className="text-sm text-stone-500 dark:text-stone-400">
          {article.date} • {article.readTime}
        </p>
      </header>

      <img
        src={article.imageUrl}
        alt={article.title}
        className="w-full h-80 md:h-96 object-cover rounded-xl mb-10 shadow-md"
      />

      <div className="prose dark:prose-invert max-w-none font-serif leading-relaxed text-lg">
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </div>
    </article>
  );
}