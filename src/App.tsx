import { useState, useEffect } from 'react';
import { Sun, Moon, Sparkles, Search, X, Bookmark } from 'lucide-react';
import { ARTICLES, type Article } from './data/articles';
import ArticleModal from './components/ArticleModal';
import { useBookmarks } from './hooks/useBookmarks';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  const { bookmarkedIds, toggleBookmark, isBookmarked } = useBookmarks();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const categories = ['All', 'Saved', 'Tech', 'Mandarin', 'Pets', 'Love', 'Science', 'Travel', 'Career'];

  const filteredArticles = ARTICLES.filter((article: Article) => {
    // Category or Saved filter
    const matchesCategory = 
      selectedCategory === 'All' 
        ? true 
        : selectedCategory === 'Saved' 
          ? isBookmarked(article.id) 
          : article.category === selectedCategory;

    // Search filter
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const featuredArticle = ARTICLES.find((a) => a.featured) || ARTICLES[0];

  return (
    <div className="min-h-screen px-4 md:px-12 py-6 max-w-7xl mx-auto">
      {/* Modal Component */}
      <ArticleModal 
        article={activeArticle} 
        onClose={() => setActiveArticle(null)} 
        isBookmarked={activeArticle ? isBookmarked(activeArticle.id) : false}
        onToggleBookmark={toggleBookmark}
      />

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
          <h1 className="font-serif text-5xl md:text-7xl font-bold tracking-tight text-aetheria-blackberry dark:text-aetheria-beige">
            AETHERIA VERBA
          </h1>
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
      {selectedCategory === 'All' && !searchQuery && (
        <section className="mb-12 cursor-pointer relative" onClick={() => setActiveArticle(featuredArticle)}>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-aetheria-grape/10 dark:bg-aetheria-cardDark p-6 rounded-2xl border border-aetheria-blackberry/10 dark:border-aetheria-beige/10 hover:border-aetheria-teal transition-all group">
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
              return (
                <article 
                  key={article.id}
                  onClick={() => setActiveArticle(article)}
                  className="bg-white/40 dark:bg-aetheria-cardDark rounded-xl overflow-hidden border border-aetheria-blackberry/10 dark:border-aetheria-beige/10 flex flex-col justify-between hover:border-aetheria-teal transition-all group cursor-pointer relative"
                >
                  <div className="h-48 overflow-hidden relative">
                    <img 
                      src={article.imageUrl} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    {/* Quick Bookmark Toggle Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Don't open modal when bookmarking
                        toggleBookmark(article.id);
                      }}
                      className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-aetheria-teal transition-all"
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
                    <div className="text-xs text-aetheria-blackberry/50 dark:text-aetheria-beige/50 pt-2 border-t border-aetheria-blackberry/5 dark:border-aetheria-beige/5">
                      {article.date}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}