import { Redis } from '@upstash/redis';
import { getArticleById } from '@/lib/articles';
import { Metadata } from 'next';

const redis = Redis.fromEnv();

// Generates dynamic SEO metadata for Google search results!
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await getArticleById(params.id);
  return {
    title: `${article.title} | Aetheria Verba`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      images: [article.imageUrl],
    },
  };
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticleById(params.id);

  // Increment and fetch view count atomically
  const views = await redis.incr(`pageviews:article:${params.id}`);

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <header className="mb-8">
        <div className="flex justify-between items-center text-xs text-aetheria-teal mb-2">
          <span>{article.category}</span>
          <span>{views.toLocaleString()} views</span>
        </div>
        <h1 className="font-serif text-4xl font-bold">{article.title}</h1>
        <p className="text-sm italic mt-2 opacity-80">{article.date} • {article.readTime}</p>
      </header>

      <img 
        src={article.imageUrl} 
        alt={article.title} 
        className="w-full h-80 object-cover rounded-xl mb-8" 
      />

      <article className="prose dark:prose-invert max-w-none font-serif">
        {article.content}
      </article>
    </main>
  );
}