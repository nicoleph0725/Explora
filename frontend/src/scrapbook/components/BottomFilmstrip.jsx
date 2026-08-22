export default function BottomFilmstrip({
  pages,
  activePageIndex,
  setActivePageIndex,
  setSelectedElementId,
  bottomScrollRef,
  handleDuplicatePage,
  handleDeletePage,
  handleAddNewPage,
}) {
  return (
    <footer className="bg-beige-medium border-t-2 border-beige-dark px-6 py-3 shrink-0 flex items-center justify-between gap-4 z-30 shadow-lg">
      {/* Left: Page Counter Info */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col">
          <span className="font-serif font-bold text-sm text-maroon-dark">
            Page {activePageIndex + 1} of {pages.length}
          </span>
          <span className="font-mono text-[10px] text-stone-500">
            {pages.length} {pages.length === 1 ? 'Page' : 'Pages'} Created
          </span>
        </div>

        <div className="h-8 w-px bg-beige-dark hidden sm:block"></div>

        {/* Quick Prev / Next Buttons */}
        <div className="hidden sm:flex items-center gap-1">
          <button
            onClick={() => setActivePageIndex(Math.max(0, activePageIndex - 1))}
            disabled={activePageIndex === 0}
            className={`p-1.5 rounded bg-parchment border border-beige-dark text-xs font-bold ${
              activePageIndex === 0
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-beige-light text-maroon cursor-pointer'
            }`}
            title="Previous Page"
          >
            ◀
          </button>
          <button
            onClick={() => setActivePageIndex(Math.min(pages.length - 1, activePageIndex + 1))}
            disabled={activePageIndex === pages.length - 1}
            className={`p-1.5 rounded bg-parchment border border-beige-dark text-xs font-bold ${
              activePageIndex === pages.length - 1
                ? 'opacity-40 cursor-not-allowed'
                : 'hover:bg-beige-light text-maroon cursor-pointer'
            }`}
            title="Next Page"
          >
            ▶
          </button>
        </div>
      </div>

      {/* Center: Scrollable Horizontal Page Thumbnails */}
      <div
        ref={bottomScrollRef}
        className="flex-1 flex items-center gap-3 overflow-x-auto py-1 px-2 scrollbar-thin scrollbar-thumb-beige-deep"
      >
        {pages.map((pg, idx) => {
          const isActive = idx === activePageIndex
          return (
            <div
              key={pg.id}
              onClick={() => {
                setActivePageIndex(idx)
                setSelectedElementId(null)
              }}
              className={`relative shrink-0 w-24 h-16 rounded-md p-1.5 cursor-pointer transition-all duration-200 flex flex-col justify-between group shadow-sm ${
                isActive
                  ? 'ring-2 ring-maroon ring-offset-2 bg-parchment scale-105 shadow-md border border-gold'
                  : 'bg-beige-light border border-beige-dark hover:bg-parchment hover:border-terracotta'
              }`}
              style={{ backgroundColor: pg.bgColor || '#FAF6F0' }}
            >
              {/* Page Number Label */}
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-[9px] font-bold px-1.5 py-0.2 rounded ${
                    isActive ? 'bg-maroon text-white' : 'bg-beige-deep text-stone-700'
                  }`}
                >
                  Pg {pg.pageNumber}
                </span>

                {/* Thumbnail Action Menu (Duplicate / Delete) */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button
                    onClick={(e) => handleDuplicatePage(idx, e)}
                    className="text-[9px] text-stone-500 hover:text-maroon cursor-pointer"
                    title="Duplicate page"
                  >
                    📋
                  </button>
                  {pages.length > 1 && (
                    <button
                      onClick={(e) => handleDeletePage(idx, e)}
                      className="text-[9px] text-stone-500 hover:text-red-600 cursor-pointer font-bold"
                      title="Delete page"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Mini Elements Count / Preview Indicator */}
              <div className="text-[9px] font-handwriting text-stone-600 truncate font-semibold">
                {pg.elements.length} {pg.elements.length === 1 ? 'item' : 'items'}
              </div>

              {/* Active Indicator Bar */}
              {isActive && <div className="w-full h-1 rounded-full bg-maroon"></div>}
            </div>
          )
        })}

        {/* Quick Add Page Card at end of filmstrip */}
        <button
          onClick={handleAddNewPage}
          className="shrink-0 w-20 h-16 rounded-md border-2 border-dashed border-terracotta/60 hover:border-terracotta bg-parchment/60 hover:bg-parchment flex flex-col items-center justify-center text-terracotta transition-all cursor-pointer shadow-2xs group"
          title="Add New Page"
        >
          <span className="text-xl font-bold font-mono leading-none group-hover:scale-125 transition-transform">
            +
          </span>
          <span className="text-[9px] font-mono font-bold mt-1">New Page</span>
        </button>
      </div>

      {/* Right: Add New Page Button */}
      <div className="shrink-0">
        <button
          onClick={handleAddNewPage}
          className="px-4 py-2 rounded-full bg-maroon hover:bg-maroon-dark text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer border border-maroon-dark"
        >
          <span className="text-gold font-mono text-sm">+</span>
          <span className="hidden sm:inline">Add Page</span>
        </button>
      </div>
    </footer>
  )
}
