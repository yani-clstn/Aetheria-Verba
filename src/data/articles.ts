import fm from 'front-matter';

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Plain Markdown string
  category: string;
  date: string;
  readTime: string;
  imageUrl: string;
  featured?: boolean;
}

// Define interface for frontmatter attributes
interface ArticleAttributes {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  imageUrl: string;
  featured?: boolean;
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
    title: data.title,
    excerpt: data.excerpt,
    category: data.category,
    date: data.date,
    readTime: data.readTime,
    imageUrl: data.imageUrl,
    featured: Boolean(data.featured),
    content: parsed.body, // The remaining markdown text
  };
});