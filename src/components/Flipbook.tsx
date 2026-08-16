import { useRef, useState, useEffect } from 'react';
import ReactPageFlip from 'react-pageflip';
import { ARTICLES, type Article } from '../data/articles';

const HTMLFlipBook = ReactPageFlip as any;

export function FlipbookJournal() {
  const flipBookRef = useRef<any>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [dimensions, setDimensions] = useState({
    width: 450,
    height: 580,
  });

  useEffect(() => {
    const updateDimensions = () => {
      const screenWidth = window.innerWidth;
      
      if (screenWidth < 768) {
        // Mobile layout: Single page
        setIsMobile(true);
        setDimensions({
          width: Math.min(screenWidth - 48, 360),
          height: 520,
        });
      } else {
        // Tablet / Desktop layout: Two-page spread
        setIsMobile(false);
        setDimensions({
          width: Math.min((screenWidth - 120) / 2, 460),
          height: 600,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full py-4 md:py-8 overflow-hidden">
      <div className="relative shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-lg max-w-full">
        <HTMLFlipBook
          key={isMobile ? 'mobile-flipbook' : 'desktop-flipbook'} // Forces re-mount when switching modes
          width={dimensions.width}
          height={dimensions.height}
          minWidth={280}
          maxWidth={500}
          minHeight={450}
          maxHeight={650}
          size="fixed"
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          usePortrait={isMobile} // Single page on mobile, double page on desktop
          className="rounded-lg overflow-hidden"
          ref={flipBookRef}
        >
          {/* Cover Page */}
          <div className="page bg-aetheria-blackberry border border-aetheria-teal/30 p-6 md:p-10 flex flex-col items-center justify-center text-center h-full">
            <span className="text-[10px] md:text-xs uppercase tracking-widest text-aetheria-teal font-semibold mb-2">
              Digital Journal
            </span>
            <h1 className="font-serif text-2xl md:text-4xl font-bold text-aetheria-beige mb-3 md:mb-4">
              AETHERIA VERBA
            </h1>
            <p className="italic text-[11px] md:text-xs text-aetheria-beige/60">
              Click corners or drag to flip
            </p>
          </div>

          {/* Article Pages */}
          {ARTICLES.map((article: Article, index: number) => (
            <div
              key={article.id}
              className="page bg-aetheria-blackberry text-aetheria-beige p-6 md:p-8 border border-aetheria-beige/10 shadow-lg h-full flex flex-col justify-between select-none"
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] md:text-xs uppercase font-semibold text-aetheria-teal tracking-wider">
                    {article.category}
                  </span>
                  <span className="text-[10px] md:text-xs text-aetheria-beige/50">
                    {article.readTime}
                  </span>
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-bold mb-2 md:mb-3 text-aetheria-beige">
                  {article.title}
                </h3>
                <p className="text-xs md:text-sm text-aetheria-beige/80 italic font-serif mb-4">
                  {article.excerpt}
                </p>
                <div className="text-xs md:text-sm leading-relaxed text-aetheria-beige/70 line-clamp-[10] md:line-clamp-[12]">
                  {article.content}
                </div>
              </div>

              <div className="pt-4 border-t border-aetheria-beige/10 flex justify-between items-center text-[10px] md:text-xs text-aetheria-beige/40">
                <span>Aetheria Verba</span>
                <span>Page {index + 1}</span>
              </div>
            </div>
          ))}

          {/* Back Cover */}
          <div className="page bg-aetheria-blackberry border border-aetheria-teal/30 p-6 md:p-10 flex flex-col items-center justify-center text-center h-full">
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-aetheria-beige mb-2">
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