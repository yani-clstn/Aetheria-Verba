import fm from 'front-matter';

export interface Article {
  id: string;
  slug: string; // Dynamic URL-friendly identifier
  title: string;
  excerpt: string;
  content: string; // Plain Markdown string
  category: string;
  date: string;
  readTime: string;
  imageUrl: string;
  featured?: boolean;
  subtitleQuote?: string;
}

// Define interface for frontmatter attributes
interface ArticleAttributes {
  id: string;
  slug?: string; // Optional override in markdown frontmatter
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  imageUrl: string;
  featured?: boolean;
  subtitleQuote?: string;
}

// Fixed list of Category Tabs
export const CATEGORIES = [
  'All',
  'Saved',
  'Featured Stories',
  'Other Stories',
] as const;

export type Category = (typeof CATEGORIES)[number];

// Utility to generate a URL-friendly slug from title
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}

// Vite glob import for raw markdown files
const markdownFiles = import.meta.glob('../content/articles/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

export const ARTICLES: Article[] = Object.values(markdownFiles).map((rawContent) => {
  const parsed = fm<ArticleAttributes>(rawContent as string);
  const data = parsed.attributes;

  return {
    id: data.id,
    slug: data.slug || slugify(data.title), // Uses explicit slug if provided, else auto-generates from title
    title: data.title,
    excerpt: data.excerpt,
    category: data.category,
    date: data.date,
    readTime: data.readTime,
    imageUrl: data.imageUrl,
    featured: Boolean(data.featured),
    content: parsed.body,
    subtitleQuote: data.subtitleQuote,
  };
});

// Helper function to fetch an article by its unique ID
export function getArticleById(id: string): Article | undefined {
  return ARTICLES.find((article) => article.id === id);
}

// Helper function to fetch an article by its slug
export function getArticleBySlug(slug: string): Article | undefined {
  const decodedSlug = decodeURIComponent(slug).toLowerCase();
  return ARTICLES.find((article) => article.slug.toLowerCase() === decodedSlug);
}