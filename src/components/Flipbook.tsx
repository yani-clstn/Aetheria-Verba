import { useRef, useState, useEffect } from 'react';
import ReactPageFlip from 'react-pageflip';
import { ARTICLES, type Article } from '../data/articles';

const HTMLFlipBook = ReactPageFlip as any;

export function FlipbookJournal() {
  const flipBookRef = useRef<any>(null);
  const [dimensions, setDimensions] = useState({
    width: 380,
    height: 550,
  });

  // Dynamically calculate page dimensions on screen resize
  useEffect(() => {
    const updateDimensions = () => {
      const screenWidth = window.innerWidth;
      if (screenWidth < 640) {
        // Mobile dimensions
        setDimensions({
          width: Math.min(screenWidth - 48, 340),
          height: 480,
        });
      } else if (screenWidth < 1024) {
        // Tablet dimensions
        setDimensions({
          width: 320,
          height: 500,
        });
      } else {
        // Desktop dimensions
        setDimensions({
          width: 380,
          height: 550,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[500px] md:min-h-[600px] py-4 md:py-6 overflow-hidden">
      <div className="relative shadow-2xl rounded-lg max-w-full">
        <HTMLFlipBook
          width={dimensions.width}
          height={dimensions.height}
          minWidth={280}
          maxWidth={450}
          minHeight={400}
          maxHeight={650}
          size="fixed"
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          usePortrait={true} // Switches to single-page view on narrow screens
          className="rounded-lg overflow-hidden"
          ref={flipBookRef}
        >
          {/* Cover Page */}
          <div className="page bg-aetheria-blackberry border border-aetheria-teal/30 p-6 md:p-8 flex flex-col items-center justify-center text-center h-full">
            <span className="text-[10px] md:text-xs uppercase tracking-widest text-aetheria-teal font-semibold mb-2">
              Digital Journal
            </span>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-aetheria-beige mb-3 md:mb-4">
              AETHERIA VERBA
            </h1>
            <p className="italic text-[11px] md:text-xs text-aetheria-beige/60">
              Swipe or click corners to flip
            </p>
          </div>

          {/* Article Pages */}
          {ARTICLES.map((article: Article, index: number) => (
            <div
              key={article.id}
              className="page bg-aetheria-blackberry text-aetheria-beige p-5 md:p-6 border border-aetheria-beige/10 shadow-lg h-full flex flex-col justify-between select-none"
            >
              <div>
                <div className="flex justify-between items-center mb-2 md:mb-3">
                  <span className="text-[9px] md:text-[10px] uppercase font-semibold text-aetheria-teal tracking-wider">
                    {article.category}
                  </span>
                  <span className="text-[9px] md:text-[10px] text-aetheria-beige/50">
                    {article.readTime}
                  </span>
                </div>
                <h3 className="font-serif text-lg md:text-xl font-bold mb-2 md:mb-3 text-aetheria-beige">
                  {article.title}
                </h3>
                <p className="text-[11px] md:text-xs text-aetheria-beige/80 italic font-serif mb-3 md:mb-4">
                  {article.excerpt}
                </p>
                <div className="text-[11px] md:text-xs leading-relaxed text-aetheria-beige/70 line-clamp-[8] md:line-clamp-[10]">
                  {article.content}
                </div>
              </div>

              <div className="pt-3 md:pt-4 border-t border-aetheria-beige/10 flex justify-between items-center text-[9px] md:text-[10px] text-aetheria-beige/40">
                <span>Aetheria Verba</span>
                <span>Page {index + 1}</span>
              </div>
            </div>
          ))}

          {/* Back Cover */}
          <div className="page bg-aetheria-blackberry border border-aetheria-teal/30 p-6 md:p-8 flex flex-col items-center justify-center text-center h-full">
            <h2 className="font-serif text-xl md:text-2xl font-bold text-aetheria-beige mb-2">
              End of Volume I
            </h2>
            <p className="italic text-[11px] md:text-xs text-aetheria-beige/60">
              Thank you for reading.
            </p>
          </div>
        </HTMLFlipBook>
      </div>
    </div>
  );
}

export default FlipbookJournal;