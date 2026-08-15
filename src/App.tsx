import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, Link } from 'react-router-dom';
import { Sun, Moon, Sparkles, Search, X, Bookmark, Eye, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ARTICLES, type Article } from './data/articles';
import { useBookmarks } from './hooks/useBookmarks';
import { supabase } from './lib/supabase';

// --- VIEW COUNTER HELPERS ---
const getLocalViewCount = (articleId: string): number => {
  const savedViews = localStorage.getItem(`aetheria_views_${articleId}`);
  return savedViews ? parseInt(savedViews, 10) : 0;
};

const getViewCount = getLocalViewCount;

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

  // Fetch view counts from Supabase
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
        console.error('Error fetching view counts:', err);
      }
    }
    fetchAllViews();
  }, []);

  // Filter articles based on selected category pill + Search query
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

  const featuredArticles = filteredArticles.filter((a) => a.featured);
  const otherArticles = filteredArticles.filter((a) => !a.featured);

  // Auto-play interval for Carousel
  useEffect(() => {
    if (featuredArticles.length === 0) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredArticles.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + featuredArticles.length) % featuredArticles.length);

  return (
    <div className="min-h-screen px-4 md:px-12 py-6 max-w-7xl mx-auto">
      {/* --- MINIMALIST LEFT-ALIGNED HEADER --- */}
      <header className="border-b border-aetheria-blackberry/20 dark:border-aetheria-beige/20 pb-6 mb-10">
        <div className="flex justify-between items-start">
          <div className="flex flex-col text-left">
            <span className="text-[10px] md:text-xs uppercase tracking-widest text-aetheria-teal font-semibold mb-1">
              Independent Digital Journal • Vol. I
            </span>
            <Link to="/">
              <h1 className="font-serif text-3xl md:text-5xl font-bold tracking-tight text-aetheria-blackberry dark:text-aetheria-beige hover:opacity-90 transition-opacity">
                AETHERIA VERBA
              </h1>
            </Link>
            <p className="text-xs md:text-sm italic mt-1 text-aetheria-blackberry/70 dark:text-aetheria-beige/70">
              Here lies my yearning soul.
            </p>
          </div>

          {/* Right Actions: Search & Dark Mode */}
          <div className="flex items-center gap-2 pt-1">
            {isSearchOpen ? (
              <div className="flex items-center bg-white/20 dark:bg-aetheria-cardDark border border-aetheria-blackberry/20 dark:border-aetheria-beige/20 rounded-full px-3 py-1 transition-all">
                <Search size={14} className="text-aetheria-teal mr-2" />
                <input
                  type="text"
                  placeholder="Search stories..."
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
                <Search size={18} />
              </button>
            )}

            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full border border-aetheria-blackberry/20 dark:border-aetheria-beige/20 hover:bg-aetheria-grape hover:text-white transition-all"
              aria-label="Toggle Theme"
            >
              {darkMode ? (
                <Sun size={18} className="text-aetheria-beige" />
              ) : (
                <Moon size={18} className="text-aetheria-blackberry" />
              )}
            </button>
          </div>
        </div>

        {/* --- CATEGORIES & FILTERS NAVIGATION --- */}
        <div className="flex items-center justify-start gap-2 md:gap-3 pt-6 flex-wrap">
          {['All', 'Featured Stories', 'Other Stories', 'Saved'].map((filterName) => (
            <button
              key={filterName}
              onClick={() => setSelectedFilter(filterName)}
              className={`px-4 py-1.5 text-xs rounded-full transition-all flex items-center gap-1.5 ${
                selectedFilter === filterName
                  ? 'bg-aetheria-blackberry text-aetheria-beige dark:bg-aetheria-teal dark:text-aetheria-dark font-medium'
                  : 'hover:bg-aetheria-grape/20 text-aetheria-blackberry dark:text-aetheria-beige'
              }`}
            >
              {filterName === 'Saved' && (
                <Bookmark size={12} fill={selectedFilter === 'Saved' ? 'currentColor' : 'none'} />
              )}
              {filterName === 'Saved' ? `Saved (${bookmarkedIds.length})` : filterName}
            </button>
          ))}
        </div>
      </header>

      {/* --- TOP PRIORITY CAROUSEL (FEATURED HIGHLIGHTS) --- */}
      {featuredArticles.length > 0 && selectedFilter === 'All' && !searchQuery && (
        <section className="mb-14 relative group">
          <div className="overflow-hidden rounded-2xl border border-aetheria-blackberry/10 dark:border-aetheria-beige/10 bg-aetheria-grape/10 dark:bg-aetheria-cardDark relative">
            <div 
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {featuredArticles.map((slide) => (
                <div key={slide.id} className="min-w-full flex-shrink-0 p-6 md:p-8">
                  <Link to={`/article/${slide.id}`} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-7 flex flex-col justify-between h-full">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] md:text-xs font-bold uppercase tracking-wider text-aetheria-teal mb-3">
                          <Sparkles size={14} /> Highlight
                        </span>
                        <h2 className="font-serif text-2xl md:text-4xl font-bold mb-3 text-aetheria-blackberry dark:text-aetheria-beige hover:text-aetheria-teal transition-colors">
                          {slide.title}
                        </h2>
                        <p className="text-xs md:text-sm text-aetheria-blackberry/80 dark:text-aetheria-beige/80 line-clamp-3 mb-6">
                          {slide.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-aetheria-blackberry/60 dark:text-aetheria-beige/60">
                        <span>{slide.date} • {slide.readTime}</span>
                        <span className="px-2.5 py-0.5 rounded-full border border-aetheria-teal text-aetheria-teal text-[10px] font-semibold">
                          {slide.category}
                        </span>
                      </div>
                    </div>
                    <div className="md:col-span-5 h-56 md:h-64 overflow-hidden rounded-xl">
                      <img 
                        src={slide.imageUrl} 
                        alt={slide.title} 
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Slideshow Controls */}
            {featuredArticles.length > 1 && (
              <>
                <button 
                  onClick={prevSlide}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-aetheria-teal transition-all opacity-0 group-hover:opacity-100 z-10"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft size={18} />
                </button>
                <button 
                  onClick={nextSlide}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-aetheria-teal transition-all opacity-0 group-hover:opacity-100 z-10"
                  aria-label="Next Slide"
                >
                  <ChevronRight size={18} />
                </button>

                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {featuredArticles.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-1.5 rounded-full transition-all ${
                        currentSlide === idx ? 'w-6 bg-aetheria-teal' : 'w-1.5 bg-white/40'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      )}

      {/* --- TOP SECTION: FEATURED STORIES --- */}
      {(selectedFilter === 'All' || selectedFilter === 'Featured Stories') && !searchQuery && featuredArticles.length > 0 && (
        <section className="mb-14">
          <h3 className="font-serif text-2xl font-bold mb-6 border-b border-aetheria-blackberry/10 dark:border-aetheria-beige/10 pb-2">
            Featured Stories
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredArticles.map((article: Article) => {
              const saved = isBookmarked(article.id);
              const views = viewCounts[article.id] ?? getViewCount(article.id);

              return (
                <article 
                  key={article.id}
                  className="bg-white/40 dark:bg-aetheria-cardDark rounded-xl overflow-hidden border border-aetheria-blackberry/10 dark:border-aetheria-beige/10 flex flex-col justify-between hover:border-aetheria-teal transition-all group relative"
                >
                  <Link to={`/article/${article.id}`} className="block flex-1 flex flex-col justify-between">
                    <div className="h-52 overflow-hidden relative">
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
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-aetheria-teal transition-all z-10"
                      >
                        <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-semibold text-aetheria-teal uppercase tracking-wider">
                            {article.category}
                          </span>
                          <span className="text-xs text-aetheria-blackberry/60 dark:text-aetheria-beige/60">
                            {article.readTime}
                          </span>
                        </div>
                        <h4 className="font-serif text-xl font-bold mb-2 group-hover:text-aetheria-teal transition-colors">
                          {article.title}
                        </h4>
                        <p className="text-xs md:text-sm text-aetheria-blackberry/80 dark:text-aetheria-beige/80 line-clamp-2 mb-4">
                          {article.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-xs text-aetheria-blackberry/50 dark:text-aetheria-beige/50 pt-2 border-t border-aetheria-blackberry/5 dark:border-aetheria-beige/5">
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
        </section>
      )}

      {/* --- BOTTOM SECTION: OTHER STORIES / FILTERED GRID --- */}
      <main>
        {/* Render "Other Stories" section header if viewing All, Other Stories, or active searches/bookmarks */}
        {(selectedFilter !== 'Featured Stories' || searchQuery) && (
          <div className="flex justify-between items-center mb-6 border-b border-aetheria-blackberry/10 dark:border-aetheria-beige/10 pb-2">
            <h3 className="font-serif text-2xl font-bold">
              {searchQuery 
                ? `Search Results for "${searchQuery}"` 
                : selectedFilter === 'Saved'
                  ? 'Saved Stories'
                  : 'Other Stories'}
            </h3>
            <span className="text-xs text-aetheria-blackberry/60 dark:text-aetheria-beige/60">
              {(selectedFilter === 'All' && !searchQuery ? otherArticles : filteredArticles).length} { (selectedFilter === 'All' && !searchQuery ? otherArticles : filteredArticles).length === 1 ? 'story' : 'stories'}
            </span>
          </div>
        )}

        {filteredArticles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg font-serif italic text-aetheria-blackberry/70 dark:text-aetheria-beige/70">
              {selectedFilter === 'Saved' 
                ? 'You have not saved any stories yet.' 
                : 'No stories match your filter or search query.'}
            </p>
            <button 
              onClick={() => { setSearchQuery(''); setSelectedFilter('All'); }}
              className="mt-4 text-xs underline text-aetheria-teal hover:text-aetheria-grape"
            >
              Browse all stories
            </button>
          </div>
        ) : (
          (selectedFilter !== 'Featured Stories' || searchQuery) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(selectedFilter === 'All' && !searchQuery ? otherArticles : filteredArticles).map((article: Article) => {
                const saved = isBookmarked(article.id);
                const views = viewCounts[article.id] ?? getViewCount(article.id);

                return (
                  <article 
                    key={article.id}
                    className="bg-white/40 dark:bg-aetheria-cardDark rounded-xl overflow-hidden border border-aetheria-blackberry/10 dark:border-aetheria-beige/10 flex flex-col justify-between hover:border-aetheria-teal transition-all group relative"
                  >
                    <Link to={`/article/${article.id}`} className="block flex-1 flex flex-col justify-between">
                      <div className="h-48 overflow-hidden relative">
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
                          className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-aetheria-teal transition-all z-10"
                        >
                          <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
                        </button>
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-semibold text-aetheria-teal uppercase tracking-wider">
                              {article.category}
                            </span>
                            <span className="text-xs text-aetheria-blackberry/60 dark:text-aetheria-beige/60">
                              {article.readTime}
                            </span>
                          </div>
                          <h4 className="font-serif text-xl font-bold mb-2 group-hover:text-aetheria-teal transition-colors">
                            {article.title}
                          </h4>
                          <p className="text-xs md:text-sm text-aetheria-blackberry/80 dark:text-aetheria-beige/80 line-clamp-2 mb-4">
                            {article.excerpt}
                          </p>
                        </div>

                        <div className="flex items-center justify-between text-xs text-aetheria-blackberry/50 dark:text-aetheria-beige/50 pt-2 border-t border-aetheria-blackberry/5 dark:border-aetheria-beige/5">
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
          )
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
    if (!id) return;

    async function recordView() {
      try {
        const { data, error } = await supabase.rpc('increment_views', { article_id: id });
        if (!error && data !== null) {
          setViews(data);
          localStorage.setItem(`aetheria_views_${id}`, data.toString());
        } else {
          setViews(getLocalViewCount(id || '') + 1);
        }
      } catch (err) {
        console.error('Failed to increment view count:', err);
        setViews(getLocalViewCount(id || '') + 1);
      }
    }

    recordView();
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
              <Eye size={14} /> {views > 0 ? views.toLocaleString() : '...'} views
            </span>
          </div>

          <h1 className="font-serif text-4xl md:text-6xl font-bold leading-tight mb-4 text-aetheria-blackberry dark:text-aetheria-beige">
            {article.title}
          </h1>

          <p className="text-base md:text-lg text-aetheria-blackberry/80 dark:text-aetheria-beige/80 mb-4 font-serif italic">
            {article.excerpt}
          </p>

          <p className="text-sm text-aetheria-blackberry/70 dark:text-aetheria-beige/70">
            {article.date} • {article.readTime}
          </p>
        </header>

        <img
          src={article.imageUrl}
          alt={article.title}
          className="w-full h-80 md:h-[450px] object-cover rounded-2xl mb-8 shadow-lg border border-aetheria-blackberry/10 dark:border-aetheria-beige/10"
        />

        {article.subtitleQuote && (
          <div className="max-w-2xl mx-auto mb-8 pl-4 border-l-2 border-aetheria-blackberry/30 dark:border-aetheria-beige/30 italic text-stone-600 dark:text-stone-300 font-serif text-base md:text-lg">
            <ReactMarkdown>{article.subtitleQuote}</ReactMarkdown>
          </div>
        )}

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