import { useEffect } from 'react';
import { X, Clock, Calendar, Tag, Bookmark } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { type Article } from '../data/articles';

interface ArticleModalProps {
  article: Article | null;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (id: string) => void;
}

export default function ArticleModal({ 
  article, 
  onClose, 
  isBookmarked, 
  onToggleBookmark 
}: ArticleModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (article) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [article]);

  if (!article) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-aetheria-beige dark:bg-aetheria-cardDark text-aetheria-dark dark:text-aetheria-beige rounded-2xl shadow-2xl border border-aetheria-blackberry/20 dark:border-aetheria-beige/20 p-6 md:p-10 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Action Controls */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {/* Bookmark Button */}
          <button
            onClick={() => onToggleBookmark(article.id)}
            className={`p-2 rounded-full border transition-all ${
              isBookmarked
                ? 'bg-aetheria-teal text-white border-aetheria-teal'
                : 'border-aetheria-blackberry/20 dark:border-aetheria-beige/20 hover:bg-aetheria-grape hover:text-white text-aetheria-blackberry dark:text-aetheria-beige'
            }`}
            aria-label="Save Article"
          >
            <Bookmark size={18} fill={isBookmarked ? 'currentColor' : 'none'} />
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 rounded-full border border-aetheria-blackberry/20 dark:border-aetheria-beige/20 hover:bg-aetheria-grape hover:text-white transition-all text-aetheria-blackberry dark:text-aetheria-beige"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category & Meta */}
        <div className="flex items-center gap-3 text-xs font-semibold text-aetheria-teal uppercase tracking-wider mb-3 pr-20">
          <span className="flex items-center gap-1">
            <Tag size={12} /> {article.category}
          </span>
          <span className="text-aetheria-blackberry/40 dark:text-aetheria-beige/40">•</span>
          <span className="flex items-center gap-1 text-aetheria-blackberry/70 dark:text-aetheria-beige/70 normal-case font-normal">
            <Calendar size={12} /> {article.date}
          </span>
          <span className="text-aetheria-blackberry/40 dark:text-aetheria-beige/40">•</span>
          <span className="flex items-center gap-1 text-aetheria-blackberry/70 dark:text-aetheria-beige/70 normal-case font-normal">
            <Clock size={12} /> {article.readTime}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-serif text-3xl md:text-5xl font-bold mb-6 text-aetheria-blackberry dark:text-aetheria-beige leading-tight">
          {article.title}
        </h2>

        {/* Image */}
        <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden mb-8">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Markdown Content */}
        <div className="prose dark:prose-invert max-w-none space-y-4 text-base md:text-lg leading-relaxed text-aetheria-blackberry/90 dark:text-aetheria-beige/90 font-sans">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-aetheria-blackberry/10 dark:border-aetheria-beige/10 flex justify-between items-center text-xs text-aetheria-blackberry/60 dark:text-aetheria-beige/60">
          <span>Aetheria Verba Journal</span>
          <button 
            onClick={onClose}
            className="text-aetheria-teal hover:underline font-semibold"
          >
            Back to Articles
          </button>
        </div>
      </div>
    </div>
  );
}