import Navbar from './navbar'
import shanghaiCover from './assets/shanghai_cover.jpeg'
import TokyoCover from './assets/tokyo_cover.jpeg'

export default function Homepage({ onLogout }) {
  return (
    <div className="min-h-screen bg-beige-light pb-20 font-sans relative overflow-hidden">
      
      {/* Background Decorative Accents */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-terracotta/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-sage/10 blur-3xl pointer-events-none"></div>

      <Navbar onLogout={onLogout} />
      
      <main className="max-w-5xl mx-auto px-6 pt-10">
        
        {/* Header Banner */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-dashed border-beige-dark">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-parchment border border-beige-dark text-xs font-mono text-terracotta mb-3 shadow-2xs">
              <span>📍 Explorer Dashboard</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-maroon-dark tracking-tight">
              My Travel Scrapbooks
            </h1>
            <p className="font-handwriting text-xl text-stone-600 mt-1">
              Documenting your journey across the globe, one memory at a time.
            </p>
          </div>

          <button className="self-start md:self-auto h-11 px-6 rounded-full bg-maroon hover:bg-maroon-dark text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center gap-2 border border-maroon-dark">
            <span className="text-gold font-mono text-base">+</span>
            <span>New Scrapbook</span>
          </button>
        </div>

        {/* Main Journals Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Sample Scrapbook Card 1 (Demo Content) */}
          <div className="polaroid-card bg-parchment rounded-xl shadow-md hover:shadow-xl border border-beige-dark p-4 relative group cursor-pointer transform hover:-translate-y-1 transition-all duration-300">
            <div className="w-20 h-5 washi-tape absolute -top-2.5 left-1/2 -translate-x-1/2 rotate-[-2deg] z-10"></div>
            
            <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-stone-200 mb-3">
              <img 
                src={shanghaiCover}
                alt="Shanghai China" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                style={{ objectPosition: 'center 30%' }}
              />
              <span className="absolute top-2 right-2 bg-maroon/90 text-white font-mono text-[10px] px-2 py-0.5 rounded shadow-xs">
                12 PAGES
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-serif font-bold text-lg text-maroon-dark group-hover:text-terracotta transition-colors">
                  Shanghai
                </h3>
                <p className="text-xs text-stone-500 font-sans">China • Jul 2026</p>
              </div>
              <div className="passport-stamp text-[8px] w-10 h-10 p-0 leading-none shrink-0 border-sage text-sage rotate-[-6deg]">
                <span>CHINA</span>
              </div>
            </div>

            <p className="font-handwriting text-base text-stone-600 mt-2 line-clamp-2">
              "Bamboo groves, red torii gates, and matcha tea ceremonies..."
            </p>
          </div>

          {/* Sample Scrapbook Card 2 (Demo Content) */}
          <div className="polaroid-card bg-parchment rounded-xl shadow-md hover:shadow-xl border border-beige-dark p-4 relative group cursor-pointer transform hover:-translate-y-1 transition-all duration-300 rotate-[1deg]">
            <div className="w-20 h-5 washi-tape absolute -top-2.5 left-1/2 -translate-x-1/2 rotate-[3deg] z-10"></div>
            
            <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-stone-200 mb-3">
              <img 
                src={TokyoCover}
                alt="Rome Italy" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-2 right-2 bg-stamp-blue/90 text-white font-mono text-[10px] px-2 py-0.5 rounded shadow-xs">
                8 PAGES
              </span>
            </div>

            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-serif font-bold text-lg text-maroon-dark group-hover:text-terracotta transition-colors">
                  Tokyo
                </h3>
                <p className="text-xs text-stone-500 font-sans">Tokyo • Jul 2026</p>
              </div>
              <div className="passport-stamp text-[8px] w-10 h-10 p-0 leading-none shrink-0 border-terracotta text-terracotta rotate-[8deg]">
                <span>JAPAN</span>
              </div>
            </div>

            <p className="font-handwriting text-base text-stone-600 mt-2 line-clamp-2">
              "Gelato at sunset, exploring ancient ruins and hidden cobblestone alleys."
            </p>
          </div>

          {/* Empty Add Scrapbook Card */}
          <div className="border-2 border-dashed border-beige-dark rounded-xl p-8 flex flex-col items-center justify-center text-center bg-parchment/50 hover:bg-parchment hover:border-terracotta transition-all duration-200 cursor-pointer min-h-[280px]">
            <div className="w-12 h-12 rounded-full bg-beige-medium flex items-center justify-center text-terracotta text-xl mb-3 shadow-xs font-bold">
              +
            </div>
            <h4 className="font-serif font-bold text-maroon-dark text-base">Create New Journal</h4>
            <p className="font-handwriting text-base text-stone-500 mt-1 max-w-[200px]">
              Start a new freeform canvas with polaroids & videos.
            </p>
          </div>

        </div>
      </main>

    </div>
  )
}
