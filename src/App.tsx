import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, Link } from 'react-router-dom';
import { Sun, Moon, Sparkles, Search, X, Bookmark, Eye, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ARTICLES, getArticleBySlug, type Article } from './data/articles';
import { useBookmarks } from './hooks/useBookmarks';
import { supabase } from './lib/supabase';
import FlipbookJournal from './components/Flipbook';

const getLocalViewCount = (articleId: string): number => {
  const savedViews = localStorage.getItem(`aetheria_views_${articleId}`);
  return savedViews ? parseInt(savedViews, 10) : 0;
};

// ==========================================
// CURSOR GLOW TRAILER COMPONENT
// ==========================================
function CursorGlow() {
  const [position, setPosition] = useState({ x: -200, y: -200 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300 hidden md:block"
      style={{
        background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(45, 212, 191, 0.08), transparent 80%)`,
      }}
    />
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
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const { bookmarkedIds, toggleBookmark, isBookmarked } = useBookmarks();

  useEffect(() => {
    async function fetchAllViews() {
      try {
        const { data, error } = await supabase.from('article_views').select('id, views');
        if (!error && data) {
          const viewsMap: Record<string, number> = {};
          data.forEach((item: { id: string; views: number }) => {
            viewsMap[item.id] = item.views;
          });
          setViewCounts(viewsMap);
        }
      } catch (err) {
        console.error('Error fetching views:', err);
      }
    }
    fetchAllViews();
  }, []);

  const filteredArticles = ARTICLES.filter((article: Article) => {
    let matchesFilter = true;
    if (selectedFilter === 'Saved') {
      matchesFilter = isBookmarked(article.id);
    } else if (selectedFilter === 'Featured Stories') {
      matchesFilter = !!article.featured;
    } else if (selectedFilter === 'Other Stories') {
      matchesFilter = !article.featured;
    }

    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const featuredArticles = ARTICLES.filter((a) => a.featured).length > 0
    ? ARTICLES.filter((a) => a.featured)
    : ARTICLES.slice(0, 3);

  const otherArticles = filteredArticles.filter((a) => !a.featured);

  // Slideshow Auto-Play (5 Seconds)
  useEffect(() => {
    if (featuredArticles.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredArticles.length]);

  return (
    <div className="min-h-screen px-3 sm:px-6 md:px-12 py-4 md:py-6 max-w-7xl mx-auto relative overflow-x-hidden">
      {/* HEADER */}
      <header className="border-b border-aetheria-blackberry/20 dark:border-aetheria-beige/20 pb-4 md:pb-6 mb-6 md:mb-10">
        <div className="flex flex-row justify-between items-start gap-3">
          <div className="flex flex-col text-left">
            <span className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-widest text-aetheria-teal font-semibold mb-1">
              Independent Digital Journal • Vol. I
            </span>
            <Link to="/">
              <h1 className="font-serif text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-aetheria-blackberry dark:text-aetheria-beige hover:text-aetheria-teal transition-colors">
                AETHERIA VERBA
              </h1>
            </Link>
            <p className="text-[11px] sm:text-xs md:text-sm italic mt-1 text-aetheria-blackberry/70 dark:text-aetheria-beige/70">
              Here lies my yearning soul.
            </p>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 pt-1 flex-shrink-0">
            {isSearchOpen ? (
              <div className="flex items-center bg-white/20 dark:bg-aetheria-cardDark border border-aetheria-teal/50 rounded-full px-2.5 sm:px-3 py-1 shadow-[0_0_12px_rgba(45,212,191,0.2)]">
                <Search size={14} className="text-aetheria-teal mr-1.5 sm:mr-2 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-xs text-aetheria-blackberry dark:text-aetheria-beige outline-none w-24 sm:w-36 md:w-48 placeholder:text-aetheria-blackberry/50 dark:placeholder:text-aetheria-beige/50"
                  autoFocus
                />
                <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}>
                  <X size={14} className="flex-shrink-0" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-1.5 sm:p-2 rounded-full border border-aetheria-blackberry/20 dark:border-aetheria-beige/20 hover:border-aetheria-teal hover:shadow-[0_0_15px_rgba(45,212,191,0.3)] hover:text-aetheria-teal transition-all text-aetheria-blackberry dark:text-aetheria-beige"
              >
                <Search size={16} className="sm:w-[18px] sm:h-[18px]" />
              </button>
            )}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 sm:p-2 rounded-full border border-aetheria-blackberry/20 dark:border-aetheria-beige/20 hover:border-aetheria-teal hover:shadow-[0_0_15px_rgba(45,212,191,0.3)] hover:text-aetheria-teal transition-all"
            >
              {darkMode ? (
                <Sun size={16} className="text-aetheria-beige hover:text-aetheria-teal transition-colors sm:w-[18px] sm:h-[18px]" />
              ) : (
                <Moon size={16} className="text-aetheria-blackberry hover:text-aetheria-teal transition-colors sm:w-[18px] sm:h-[18px]" />
              )}
            </button>
          </div>
        </div>

        {/* CATEGORY PILLS */}
        <div className="flex items-center justify-start gap-2 md:gap-3 pt-4 sm:pt-6 overflow-x-auto pb-1 no-scrollbar">
          {['All', 'Featured Stories', 'Other Stories', 'Saved'].map((filterName) => (
            <button
              key={filterName}
              onClick={() => setSelectedFilter(filterName)}
              className={`px-3 sm:px-4 py-1 sm:py-1.5 text-[11px] sm:text-xs rounded-full transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
                selectedFilter === filterName
                  ? 'bg-aetheria-blackberry text-aetheria-beige dark:bg-aetheria-teal dark:text-aetheria-dark font-medium shadow-[0_0_15px_rgba(45,212,191,0.4)]'
                  : 'hover:bg-aetheria-grape/20 text-aetheria-blackberry dark:text-aetheria-beige hover:border-aetheria-teal/50 hover:shadow-[0_0_10px_rgba(45,212,191,0.15)] border border-transparent'
              }`}
            >
              {filterName === 'Saved' && <Bookmark size={12} fill={selectedFilter === 'Saved' ? 'currentColor' : 'none'} />}
              {filterName === 'Saved' ? `Saved (${bookmarkedIds.length})` : filterName}
            </button>
          ))}
        </div>
      </header>

      {/* SLIDESHOW CAROUSEL WITH GLOW */}
      {selectedFilter === 'All' && !searchQuery && featuredArticles.length > 0 && (
        <section className="mb-8 md:mb-14 relative group">
          <div className="overflow-hidden rounded-2xl border border-aetheria-blackberry/10 dark:border-aetheria-beige/10 bg-aetheria-grape/10 dark:bg-aetheria-cardDark relative hover:border-aetheria-teal/50 hover:shadow-[0_0_25px_rgba(45,212,191,0.25)] transition-all duration-500">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {featuredArticles.map((slide) => (
                <div key={slide.id} className="min-w-full flex-shrink-0 p-4 sm:p-6 md:p-8">
                  <Link to={`/article/${slide.slug}`} className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center">
                    <div className="md:col-span-7 flex flex-col justify-between h-full order-2 md:order-1">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold uppercase tracking-wider text-aetheria-teal mb-2 md:mb-3">
                          <Sparkles size={14} className="animate-pulse" /> Highlight
                        </span>
                        <h2 className="font-serif text-xl sm:text-2xl md:text-4xl font-bold mb-2 md:mb-3 text-aetheria-blackberry dark:text-aetheria-beige hover:text-aetheria-teal transition-colors">
                          {slide.title}
                        </h2>
                        <p className="text-xs md:text-sm text-aetheria-blackberry/80 dark:text-aetheria-beige/80 line-clamp-2 sm:line-clamp-3 mb-4 md:mb-6">
                          {slide.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-[11px] sm:text-xs text-aetheria-blackberry/60 dark:text-aetheria-beige/60">
                        <span>{slide.date} • {slide.readTime}</span>
                        <span className="px-2 sm:px-2.5 py-0.5 rounded-full border border-aetheria-teal text-aetheria-teal text-[9px] sm:text-[10px] font-semibold shadow-[0_0_8px_rgba(45,212,191,0.2)]">
                          {slide.category}
                        </span>
                      </div>
                    </div>
                    <div className="md:col-span-5 h-40 sm:h-52 md:h-64 overflow-hidden rounded-xl group/img relative order-1 md:order-2">
                      <img 
                        src={slide.imageUrl} 
                        alt={slide.title} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-105"
                      />
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Slide Navigation Controls */}
            {featuredArticles.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length)}
                  className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/50 text-white hover:bg-aetheria-teal hover:text-aetheria-dark transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10 hover:shadow-[0_0_15px_rgba(45,212,191,0.5)]"
                >
                  <ChevronLeft size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>
                <button 
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % featuredArticles.length)}
                  className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-full bg-black/50 text-white hover:bg-aetheria-teal hover:text-aetheria-dark transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10 hover:shadow-[0_0_15px_rgba(45,212,191,0.5)]"
                >
                  <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                </button>

                {/* Indicators */}
                <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5 z-10">
                  {featuredArticles.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                        currentSlide === idx 
                          ? 'w-4 sm:w-6 bg-aetheria-teal shadow-[0_0_10px_rgba(45,212,191,0.8)]' 
                          : 'w-1 sm:w-1.5 bg-white/40 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* FLIPBOOK SECTION */}
      {selectedFilter === 'All' && !searchQuery && (
        <section className="mb-8 md:mb-12">
          <FlipbookJournal />
        </section>
      )}

      {/* ARTICLES GRID WITH HOVER GLOW */}
      <main>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {(selectedFilter === 'All' && !searchQuery ? otherArticles : filteredArticles).map((article: Article) => {
            const saved = isBookmarked(article.id);
            const views = viewCounts[article.id] ?? getLocalViewCount(article.id);

            return (
              <article 
                key={article.id}
                className="bg-white/40 dark:bg-aetheria-cardDark rounded-xl overflow-hidden border border-aetheria-blackberry/10 dark:border-aetheria-beige/10 flex flex-col justify-between hover:border-aetheria-teal/60 hover:shadow-[0_0_20px_rgba(45,212,191,0.2)] transition-all duration-300 group relative"
              >
                <Link to={`/article/${article.slug}`} className="block flex-1 flex flex-col justify-between">
                  <div className="h-40 sm:h-48 overflow-hidden relative">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleBookmark(article.id);
                      }}
                      className="absolute top-2.5 right-2.5 p-1.5 sm:p-2 rounded-full bg-black/50 backdrop-blur-md text-white hover:bg-aetheria-teal hover:text-aetheria-dark transition-all z-10 hover:shadow-[0_0_12px_rgba(45,212,191,0.5)]"
                    >
                      <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] sm:text-xs font-semibold text-aetheria-teal uppercase tracking-wider">
                          {article.category}
                        </span>
                        <span className="text-[10px] sm:text-xs text-aetheria-blackberry/60 dark:text-aetheria-beige/60">
                          {article.readTime}
                        </span>
                      </div>
                      <h4 className="font-serif text-lg sm:text-xl font-bold mb-2 text-aetheria-blackberry dark:text-aetheria-beige group-hover:text-aetheria-teal transition-colors">
                        {article.title}
                      </h4>
                      <p className="text-xs md:text-sm text-aetheria-blackberry/80 dark:text-aetheria-beige/80 line-clamp-2 mb-4">
                        {article.excerpt}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] sm:text-xs text-aetheria-blackberry/50 dark:text-aetheria-beige/50 pt-2 border-t border-aetheria-blackberry/5 dark:border-aetheria-beige/5">
                      <span>{article.date}</span>
                      <span className="flex items-center gap-1">
                        <Eye size={12} /> {views.toLocaleString()} views
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
}

// ==========================================
// 2. ARTICLE DETAIL PAGE COMPONENT
// ==========================================
function ArticleDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? (getArticleBySlug(slug) || ARTICLES.find((a) => a.id === slug)) : undefined;
  const [views, setViews] = useState<number>(0);
  const { isBookmarked, toggleBookmark } = useBookmarks();

  useEffect(() => {
    if (!article) return;

    const currentArticle = article;

    async function recordView() {
      try {
        const { data, error } = await supabase.rpc('increment_views', { 
          article_id: currentArticle.id 
        });
        if (!error && data !== null) {
          setViews(data);
          localStorage.setItem(`aetheria_views_${currentArticle.id}`, data.toString());
        } else {
          setViews(getLocalViewCount(currentArticle.id) + 1);
        }
      } catch (err) {
        setViews(getLocalViewCount(currentArticle.id) + 1);
      }
    }
    recordView();
  }, [article]);

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 text-aetheria-blackberry dark:text-aetheria-beige">
        <p className="text-lg font-serif mb-4">Story not found.</p>
        <Link to="/" className="text-xs uppercase tracking-widest text-aetheria-teal hover:underline inline-flex items-center gap-1 font-semibold">
          <ArrowLeft size={14} /> Back to home
        </Link>
      </div>
    );
  }

  const saved = isBookmarked(article.id);

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-12 py-6 sm:py-8 max-w-4xl mx-auto text-aetheria-blackberry dark:text-aetheria-beige">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <Link to="/" className="text-[11px] sm:text-xs uppercase tracking-widest text-aetheria-teal hover:underline inline-flex items-center gap-1 font-semibold">
          <ArrowLeft size={14} /> Back to all stories
        </Link>

        <button
          onClick={() => toggleBookmark(article.id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-aetheria-blackberry/20 dark:border-aetheria-beige/20 text-xs hover:border-aetheria-teal hover:shadow-[0_0_12px_rgba(45,212,191,0.3)] transition-all"
        >
          <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
          {saved ? 'Saved' : 'Save Story'}
        </button>
      </div>

      <article>
        <div className="flex justify-between items-center text-xs text-aetheria-teal uppercase tracking-wider mb-3">
          <span className="font-semibold">{article.category}</span>
          <span className="flex items-center gap-1 opacity-70">
            <Eye size={14} /> {views > 0 ? views.toLocaleString() : '...'} views
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl font-bold leading-tight mb-3 sm:mb-4">{article.title}</h1>
        <p className="text-sm sm:text-base md:text-lg opacity-80 mb-5 sm:mb-6 italic font-serif">{article.excerpt}</p>
        <img src={article.imageUrl} alt={article.title} className="w-full h-56 sm:h-80 md:h-[450px] object-cover rounded-xl sm:rounded-2xl mb-6 sm:mb-8" />
        <div className="prose dark:prose-invert max-w-2xl mx-auto font-serif text-base sm:text-lg leading-relaxed space-y-4 sm:space-y-6">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </div>
      </article>
    </div>
  );
}

// ==========================================
// 3. MAIN APP WRAPPER
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
      <CursorGlow />
      <Routes>
        <Route path="/" element={<JournalHome darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/article/:slug" element={<ArticleDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}