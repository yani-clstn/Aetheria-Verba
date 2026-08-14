import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, Link } from 'react-router-dom';
import { 
  Sun, Moon, Sparkles, Search, X, Bookmark, Eye, ArrowLeft, 
  ChevronLeft, ChevronRight 
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { ARTICLES, type Article } from './data/articles';
import { useBookmarks } from './hooks/useBookmarks';

// --- VIEW COUNTER HELPER (Uses LocalStorage) ---
const getViewCount = (articleId: string): number => {
  const savedViews = localStorage.getItem(`aetheria_views_${articleId}`);
  return savedViews ? parseInt(savedViews, 10) : 12;
};

const incrementViewCount = (articleId: string): number => {
  const currentViews = getViewCount(articleId);
  const newViews = currentViews + 1;
  localStorage.setItem(`aetheria_views_${articleId}`, newViews.toString());
  return newViews;
};

// ==========================================
// FEATURED CARD COMPONENT (With Spotlight Effect)
// ==========================================
function FeaturedCard({ featuredArticle }: { featuredArticle: Article }) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.section 
      className="mb-12 relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link to={`/article/${featuredArticle.id}`}>
        <div 
          onMouseMove={handleMouseMove}
          className="relative grid grid-cols-1 md:grid-cols-12 gap-6 bg-aetheria-grape/10 dark:bg-aetheria-cardDark p-6 rounded-2xl border border-aetheria-blackberry/10 dark:border-aetheria-beige/10 hover:border-aetheria-teal transition-all group cursor-pointer overflow-hidden"
        >
          {/* Radial Spotlight Reveal Layer */}
          <div 
            className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
            style={{
              background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(45, 212, 191, 0.12), transparent 40%)`,
            }}
          />

          <div className="md:col-span-7 flex flex-col justify-between z-10">
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-aetheria-teal mb-2">
                <Sparkles size={14} /> Featured Story
              </span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4 text-aetheria-blackberry dark:text-aetheria-beige group-hover:text-aetheria-grape dark:group-hover:text-aetheria-teal transition-colors">
                {featuredArticle.title}
              </h2>
              <p className="text-sm md:text-base mb-6 text-aetheria-blackberry/80 dark:text-aetheria-beige/80 line-clamp-3">
                {featuredArticle.excerpt}
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-aetheria-blackberry/60 dark:text-aetheria-beige/60">
              <span>{featuredArticle.date} • {featuredArticle.readTime}</span>
              <span className="px-2 py-0.5 rounded border border-aetheria-teal text-aetheria-teal">
                {featuredArticle.category}
              </span>
            </div>
          </div>

          <div className="md:col-span-5 h-64 md:h-72 overflow-hidden rounded-xl z-10">
            <img 
              src={featuredArticle.imageUrl} 
              alt={featuredArticle.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </Link>
    </motion.section>
  );
}

// ==========================================
// 1. HOME JOURNAL PAGE COMPONENT
// ==========================================
function JournalHome({ 
  darkMode, 
  setDarkMode 
}: { 
  darkMode: boolean; 
  setDarkMode: (val: boolean) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [direction, setDirection] = useState<number>(1);
  
  // Track hover state so user can pause auto-play while reading
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const { bookmarkedIds, toggleBookmark, isBookmarked } = useBookmarks();

  const categories = ['All', 'Saved', 'Featured Stories', 'Other Stories'];

  const filteredArticles = ARTICLES.filter((article: Article) => {
    let matchesCategory = true;

    if (selectedCategory === 'Saved') {
      matchesCategory = isBookmarked(article.id);
    } else if (selectedCategory === 'Featured Stories') {
      matchesCategory = Boolean(article.featured);
    } else if (selectedCategory === 'Other Stories') {
      matchesCategory = !article.featured;
    }

    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory, searchQuery]);

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev === 0 ? filteredArticles.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev === filteredArticles.length - 1 ? 0 : prev + 1));
  };

  // --- AUTO-SLIDESHOW LOOP ENGINE ---
  useEffect(() => {
    if (filteredArticles.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      handleNext();
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex, filteredArticles.length, isHovered]);

  const featuredArticle = ARTICLES.find((a) => a.featured) || ARTICLES[0];
  const activeArticle = filteredArticles[currentIndex];

  // Slide Animation Variants
  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen px-4 md:px-12 py-6 max-w-7xl mx-auto">
      {/* --- HEADER & MASTHEAD --- */}
      <header className="border-b border-aetheria-blackberry/20 dark:border-aetheria-beige/20 pb-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-[0.2em] text-aetheria-teal font-semibold block mb-1">
              Independent Digital Journal • Vol. I
            </span>
            <Link to="/" className="inline-block">
              <h1 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-aetheria-blackberry dark:text-aetheria-beige hover:opacity-80 transition-opacity">
                AETHERIA VERBA
              </h1>
            </Link>
            <p className="text-xs italic text-aetheria-blackberry/70 dark:text-aetheria-beige/70 mt-0.5">
              Here lies my yearning soul.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-end">
            {isSearchOpen ? (
              <div className="flex items-center bg-white/20 dark:bg-aetheria-cardDark border border-aetheria-blackberry/20 dark:border-aetheria-beige/20 rounded-full px-3 py-1 transition-all">
                <Search size={14} className="text-aetheria-teal mr-2" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-aetheria-blackberry dark:text-aetheria-beige outline-none w-32 md:w-48 placeholder:text-aetheria-blackberry/50 dark:placeholder:text-aetheria-beige/50"
                  autoFocus
                />
                <button 
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                  }}
                  className="text-aetheria-blackberry/60 dark:text-aetheria-beige/60 hover:text-aetheria-teal"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-full border border-aetheria-blackberry/20 dark:border-aetheria-beige/20 hover:bg-aetheria-grape hover:text-white transition-all text-aetheria-blackberry dark:text-aetheria-beige"
                aria-label="Open Search"
              >
                <Search size={16} />
              </button>
            )}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full border border-aetheria-blackberry/20 dark:border-aetheria-beige/20 hover:bg-aetheria-grape hover:text-white transition-all"
              aria-label="Toggle Theme"
            >
              {darkMode ? (
                <Sun size={16} className="text-aetheria-beige" />
              ) : (
                <Moon size={16} className="text-aetheria-blackberry" />
              )}
            </button>
          </div>
        </div>

        <nav className="flex items-center justify-start gap-2 md:gap-3 overflow-x-auto pt-2 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedCategory === cat
                  ? 'bg-aetheria-blackberry text-aetheria-beige dark:bg-aetheria-teal dark:text-aetheria-dark font-medium'
                  : 'hover:bg-aetheria-grape/20 text-aetheria-blackberry dark:text-aetheria-beige'
              }`}
            >
              {cat === 'Saved' && <Bookmark size={12} fill={selectedCategory === 'Saved' ? 'currentColor' : 'none'} />}
              {cat} {cat === 'Saved' && `(${bookmarkedIds.length})`}
            </button>
          ))}
        </nav>
      </header>

      {/* --- FEATURED HERO ARTICLE WITH SPOTLIGHT REVEAL --- */}
      {selectedCategory === 'All' && !searchQuery && featuredArticle && (
        <FeaturedCard featuredArticle={featuredArticle} />
      )}

      {/* --- AUTOMATIC SLIDESHOW CAROUSEL --- */}
      <main className="mt-8">
        <div className="flex justify-between items-center mb-6 border-b border-aetheria-blackberry/10 dark:border-aetheria-beige/10 pb-2">
          <h3 className="font-serif text-2xl font-bold">
            {searchQuery 
              ? `Search Results for "${searchQuery}"` 
              : selectedCategory === 'Saved'
                ? 'Your Bookmarked Articles'
                : selectedCategory === 'All' 
                  ? 'Latest Entries' 
                  : `${selectedCategory}`}
          </h3>

          {filteredArticles.length > 0 && (
            <span className="text-xs text-aetheria-blackberry/60 dark:text-aetheria-beige/60 font-mono">
              {currentIndex + 1} / {filteredArticles.length}
            </span>
          )}
        </div>

        {filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-serif italic text-aetheria-blackberry/70 dark:text-aetheria-beige/70">
              {selectedCategory === 'Saved' 
                ? 'You have not saved any articles yet.' 
                : 'No articles match your query.'}
            </p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
              className="mt-4 text-xs underline text-aetheria-teal hover:text-aetheria-grape"
            >
              Browse all articles
            </button>
          </div>
        ) : (
          <div 
            className="relative max-w-2xl mx-auto overflow-hidden px-1 py-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Side Navigation Arrows */}
            <button
              onClick={handlePrev}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-aetheria-teal hover:text-aetheria-dark transition-all text-white z-20 shadow-lg backdrop-blur-sm"
              aria-label="Previous story"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={handleNext}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-aetheria-teal hover:text-aetheria-dark transition-all text-white z-20 shadow-lg backdrop-blur-sm"
              aria-label="Next story"
            >
              <ChevronRight size={20} />
            </button>

            {/* Animated Container */}
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.article
                key={activeArticle.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="bg-white/40 dark:bg-aetheria-cardDark rounded-xl overflow-hidden border border-aetheria-blackberry/10 dark:border-aetheria-beige/10 flex flex-col justify-between hover:border-aetheria-teal transition-colors group relative"
              >
                <Link to={`/article/${activeArticle.id}`} className="block">
                  <div className="h-64 md:h-80 overflow-hidden relative">
                    <img 
                      src={activeArticle.imageUrl} 
                      alt={activeArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleBookmark(activeArticle.id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-aetheria-teal transition-all z-10"
                      aria-label="Bookmark article"
                    >
                      <Bookmark size={14} fill={isBookmarked(activeArticle.id) ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-aetheria-teal uppercase tracking-wider">
                        {activeArticle.category}
                      </span>
                      <span className="text-xs text-aetheria-blackberry/60 dark:text-aetheria-beige/60">
                        {activeArticle.readTime}
                      </span>
                    </div>
                    <h4 className="font-serif text-2xl font-bold mb-3 group-hover:text-aetheria-grape dark:group-hover:text-aetheria-teal transition-colors">
                      {activeArticle.title}
                    </h4>
                    <p className="text-sm text-aetheria-blackberry/80 dark:text-aetheria-beige/80 line-clamp-3 mb-6">
                      {activeArticle.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-aetheria-blackberry/50 dark:text-aetheria-beige/50 pt-3 border-t border-aetheria-blackberry/5 dark:border-aetheria-beige/5">
                      <span>{activeArticle.date}</span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {getViewCount(activeArticle.id)} views
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.article>
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

// ==========================================
// 2. DEDICATED ARTICLE PAGE COMPONENT
// ==========================================
function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const article = ARTICLES.find((a) => a.id === id);
  const [views, setViews] = useState<number>(0);
  const { isBookmarked, toggleBookmark } = useBookmarks();

  useEffect(() => {
    if (id) {
      const updatedViews = incrementViewCount(id);
      setViews(updatedViews);
    }
  }, [id]);

  useEffect(() => {
    if (article) {
      document.title = `${article.title} — Aetheria Verba`;
    }
    return () => {
      document.title = 'AETHERIA VERBA';
    };
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen max-w-3xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-serif font-bold mb-4">Story Not Found</h2>
        <Link to="/" className="text-aetheria-teal hover:underline inline-flex items-center gap-1">
          <ArrowLeft size={16} /> Return to Journal
        </Link>
      </div>
    );
  }

  const saved = isBookmarked(article.id);

  return (
    <div className="min-h-screen px-4 md:px-12 py-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link 
          to="/" 
          className="text-xs uppercase tracking-widest text-aetheria-teal hover:underline inline-flex items-center gap-1 font-semibold"
        >
          <ArrowLeft size={14} /> Back to all stories
        </Link>

        <button
          onClick={() => toggleBookmark(article.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-aetheria-blackberry/20 dark:border-aetheria-beige/20 text-xs hover:border-aetheria-teal transition-all"
        >
          <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
          {saved ? 'Saved' : 'Save Story'}
        </button>
      </div>

      <article>
        <header className="mb-8">
          <div className="flex justify-between items-center text-xs text-aetheria-blackberry/60 dark:text-aetheria-beige/60 uppercase tracking-wider mb-3">
            <span className="font-semibold text-aetheria-teal">{article.category}</span>
            <span className="flex items-center gap-1">
              <Eye size={14} /> {views.toLocaleString()} views
            </span>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-4 text-aetheria-blackberry dark:text-aetheria-beige">
            {article.title}
          </h1>

          <p className="text-sm text-aetheria-blackberry/70 dark:text-aetheria-beige/70">
            {article.date} • {article.readTime}
          </p>
        </header>

        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-80 md:h-[450px] object-cover rounded-2xl mb-10 shadow-lg border border-aetheria-blackberry/10 dark:border-aetheria-beige/10"
        />

        <div className="prose dark:prose-invert max-w-2xl mx-auto font-serif text-lg md:text-xl leading-relaxed text-stone-800 dark:text-stone-100 dark:prose-p:text-stone-100 space-y-6">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}

// ==========================================
// 3. MAIN APP ROUTER WRAPPER
// ==========================================
export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<JournalHome darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/article/:id" element={<ArticleDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}