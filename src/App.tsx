import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useParams, Link } from 'react-router-dom';
import { Sun, Moon, Sparkles, Search, X, Bookmark, Eye, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ARTICLES, type Article } from './data/articles';
import { useBookmarks } from './hooks/useBookmarks';
import { supabase } from './lib/supabase';

// --- VIEW COUNTER HELPERS (Supabase RPC with LocalStorage Fallback) ---
const getLocalViewCount = (articleId: string): number => {
  const savedViews = localStorage.getItem(`aetheria_views_${articleId}`);
  return savedViews ? parseInt(savedViews, 10) : 0;
};

// Alias to fix TS2304: Cannot find name 'getViewCount'
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
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  const { bookmarkedIds, toggleBookmark, isBookmarked } = useBookmarks();

  const categories = ['All', 'Saved', 'Tech', 'Mandarin', 'Pets', 'Love', 'Science', 'Travel', 'Career'];

  // Fetch all article view counts from Supabase on mount
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

  const filteredArticles = ARTICLES.filter((article: Article) => {
    const matchesCategory = 
      selectedCategory === 'All' 
        ? true 
        : selectedCategory === 'Saved' 
          ? isBookmarked(article.id) 
          : article.category === selectedCategory;

    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const featuredArticle = ARTICLES.find((a) => a.featured) || ARTICLES[0];

  return (
    <div className="min-h-screen px-4 md:px-12 py-6 max-w-7xl mx-auto">
      {/* --- HEADER & MASTHEAD --- */}
      <header className="border-b border-aetheria-blackberry/20 dark:border-aetheria-beige/20 pb-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs uppercase tracking-widest text-aetheria-teal font-semibold">
            Independent Digital Journal • Vol. I
          </span>
          
          <div className="flex items-center gap-2">
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

        <div className="text-center my-6">
          <Link to="/">
            <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-aetheria-blackberry dark:text-aetheria-beige hover:opacity-90 transition-opacity">
              AETHERIA VERBA
            </h1>
          </Link>
          <p className="text-sm italic mt-2 text-aetheria-blackberry/80 dark:text-aetheria-beige/80">
            Here lies my yearning soul.
          </p>
        </div>

        {/* --- CATEGORY NAV --- */}
        <nav className="flex items-center justify-center gap-2 md:gap-4 overflow-x-auto pt-4 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 text-xs md:text-sm rounded-full transition-all whitespace-nowrap flex items-center gap-1 ${
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

      {/* --- FEATURED HERO ARTICLE --- */}
      {selectedCategory === 'All' && !searchQuery && featuredArticle && (
        <section className="mb-12 relative">
          <Link to={`/article/${featuredArticle.id}`}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-aetheria-grape/10 dark:bg-aetheria-cardDark p-6 rounded-2xl border border-aetheria-blackberry/10 dark:border-aetheria-beige/10 hover:border-aetheria-teal transition-all group cursor-pointer">
              <div className="md:col-span-7 flex flex-col justify-between">
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
              <div className="md:col-span-5 h-64 md:h-72 overflow-hidden rounded-xl">
                <img 
                  src={featuredArticle.imageUrl} 
                  alt={featuredArticle.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* --- ARTICLE GRID --- */}
      <main>
        <div className="flex justify-between items-center mb-6 border-b border-aetheria-blackberry/10 dark:border-aetheria-beige/10 pb-2">
          <h3 className="font-serif text-2xl font-bold">
            {searchQuery 
              ? `Search Results for "${searchQuery}"` 
              : selectedCategory === 'Saved'
                ? 'Your Bookmarked Articles'
                : selectedCategory === 'All' 
                  ? 'Latest Entries' 
                  : `${selectedCategory} Articles`}
          </h3>
          <span className="text-xs text-aetheria-blackberry/60 dark:text-aetheria-beige/60">
            {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'} found
          </span>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article) => {
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
                      {/* Bookmark Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleBookmark(article.id);
                        }}
                        className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-aetheria-teal transition-all z-10"
                        aria-label="Bookmark article"
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
                        <h4 className="font-serif text-xl font-bold mb-2 group-hover:text-aetheria-grape dark:group-hover:text-aetheria-teal transition-colors">
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
        )}
      </main>
    </div>
  );
}

// ==========================================
// 2. DEDICATED ARTICLE PAGE COMPONENT (SEO & SUPABASE VIEWS)
// ==========================================
function ArticleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const article = ARTICLES.find((a) => a.id === id);
  const [views, setViews] = useState<number>(0);
  const { isBookmarked, toggleBookmark } = useBookmarks();

  useEffect(() => {
    if (!id) return;

    // Atomically increment view count in Supabase
    async function recordView() {
      try {
        const { data, error } = await supabase.rpc('increment_views', { article_id: id });
        if (!error && data !== null) {
          setViews(data);
          localStorage.setItem(`aetheria_views_${id}`, data.toString());
        } else {
          // Fallback to local count if Supabase RPC returns error or null
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
    // Dynamically update head title for search engines
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
      {/* Back button and actions */}
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

        {/* --- AUTOMATIC EPIGRAPH / CALLOUT BANNER --- */}
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