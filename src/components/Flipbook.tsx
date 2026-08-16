import React, { useRef } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { ARTICLES, type Article } from '../data/articles';

// Page component wrapper required by react-pageflip
const Page = React.forwardRef<HTMLDivElement, { article: Article; number: number }>(
  ({ article, number }, ref) => {
    return (
      <div 
        ref={ref} 
        className="bg-aetheria-cardDark border border-aetheria-beige/10 p-8 shadow-2xl flex flex-col justify-between h-full text-aetheria-beige select-none"
      >
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-aetheria-teal">
            {article.category}
          </span>
          <h2 className="font-serif text-2xl font-bold mt-2 mb-4 text-aetheria-beige">
            {article.title}
          </h2>
          {article.imageUrl && (
            <img 
              src={article.imageUrl} 
              alt={article.title} 
              className="w-full h-44 object-cover rounded-lg mb-4"
            />
          )}
          <p className="font-serif text-sm opacity-80 leading-relaxed italic">
            {article.excerpt}
          </p>
        </div>

        <div className="flex justify-between items-center text-xs text-aetheria-beige/40 pt-4 border-t border-aetheria-beige/10">
          <span>{article.date}</span>
          <span>Page {number}</span>
        </div>
      </div>
    );
  }
);

export function FlipbookJournal() {
  const flipBookRef = useRef<any>(null);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-aetheria-dark py-10">
      <h1 className="font-serif text-2xl font-bold text-aetheria-beige mb-6">
        AETHERIA VERBA • Interactive Journal
      </h1>

      {/* @ts-ignore */}
      <HTMLFlipBook 
        width={380} 
        height={550} 
        size="fixed"
        minWidth={300}
        maxWidth={500}
        minHeight={400}
        maxHeight={700}
        maxShadowOpacity={0.5}
        showCover={true}
        mobileScrollSupport={true}
        ref={flipBookRef}
        className="shadow-2xl rounded-lg"
      >
        {/* Cover Page */}
        <div className="bg-aetheria-blackberry border border-aetheria-teal/30 p-8 flex flex-col items-center justify-center text-center h-full rounded-l-lg">
          <span className="text-xs uppercase tracking-widest text-aetheria-teal mb-2">Volume I</span>
          <h1 className="font-serif text-4xl font-bold text-aetheria-beige mb-4">Aetheria Verba</h1>
          <p className="italic text-xs text-aetheria-beige/60">Click or drag pages to flip</p>
        </div>

        {/* Article Pages */}
        {ARTICLES.map((article: Article, index: number) => (
          <Page key={article.id} article={article} number={index + 1} />
        ))}
      </HTMLFlipBook>
    </div>
  );
}