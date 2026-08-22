export default function TopEditingToolbar({
  scrapbookTitle,
  setScrapbookTitle,
  isEditingTitle,
  setIsEditingTitle,
  onBack,
  saveStatus,
  selectedElement,
  updateSelectedElement,
  deleteSelectedElement,
  changeLayer,
  activePage,
  setPages,
  activePageIndex,
  addElementToPage,
  zoomLevel,
  setZoomLevel,
}) {
  return (
    <header className="bg-beige-light border-b border-beige-dark shadow-xs z-30 shrink-0">
      {/* Top Mini Navigation Bar */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-beige-dark/60 bg-parchment">
        {/* Left: Back to Home & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="px-3 py-1.5 rounded-lg bg-beige-medium hover:bg-beige-dark text-maroon-dark font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>←</span>
            <span>Back to Journals</span>
          </button>

          <div className="h-4 w-px bg-beige-dark"></div>

          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-maroon-dark text-base tracking-tight">Explora Scrapbook</span>
            <span className="text-stone-400">/</span>
            {isEditingTitle ? (
              <input
                type="text"
                value={scrapbookTitle}
                onChange={(e) => setScrapbookTitle(e.target.value)}
                onBlur={() => setIsEditingTitle(false)}
                onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                autoFocus
                className="font-serif font-bold text-sm text-maroon bg-white border border-gold px-2 py-0.5 rounded outline-none"
              />
            ) : (
              <button
                onClick={() => setIsEditingTitle(true)}
                className="group flex items-center gap-1.5 font-serif font-bold text-sm text-maroon hover:text-maroon-dark cursor-pointer px-1 py-0.5 rounded hover:bg-beige-medium/60"
                title="Click to rename"
              >
                <span>{scrapbookTitle}</span>
                <span className="text-[10px] text-stone-400 group-hover:text-stone-700">✎</span>
              </button>
            )}
          </div>
        </div>

        {/* Right: Save Status & Actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-beige-medium text-[11px] font-mono text-stone-600">
            <span
              className={`w-2 h-2 rounded-full ${
                saveStatus === 'saving' ? 'bg-amber-500 animate-ping' : 'bg-emerald-600'
              }`}
            ></span>
            <span>{saveStatus === 'saving' ? 'Saving...' : 'Auto-Saved'}</span>
          </div>

          <button
            onClick={() => alert('Exporting your travel scrapbook to high-res album PDF!')}
            className="px-3 py-1.5 rounded-md bg-maroon hover:bg-maroon-dark text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <span>📥</span>
            <span className="hidden sm:inline">Export Album</span>
          </button>
        </div>
      </div>

      {/* Full-Length Editing Controls Toolbar */}
      <div className="px-4 py-2 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none bg-beige-light">
        {/* Group 1: Typography Controls */}
        <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-beige-dark">
          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider hidden md:inline">Font</span>

          {/* Font Family Dropdown */}
          <select
            value={selectedElement?.fontFamily || 'Playfair Display'}
            onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
            className="h-8 px-2 rounded-md bg-parchment border border-beige-dark text-xs font-medium text-stone-800 focus:outline-none focus:border-maroon cursor-pointer shadow-2xs"
          >
            <option value="Playfair Display">Playfair Display (Serif)</option>
            <option value="Caveat">Caveat (Handwriting)</option>
            <option value="Courier Prime">Courier Prime (Typewriter)</option>
            <option value="Inter">Inter (Sans Clean)</option>
          </select>

          {/* Font Size Buttons */}
          <div className="flex items-center bg-parchment rounded-md border border-beige-dark shadow-2xs h-8 px-1">
            <button
              onClick={() =>
                updateSelectedElement({
                  fontSize: Math.max(12, (selectedElement?.fontSize || 22) - 2),
                })
              }
              className="w-6 h-6 flex items-center justify-center text-xs font-bold text-stone-600 hover:text-maroon hover:bg-beige-medium rounded cursor-pointer"
              title="Decrease font size"
            >
              -
            </button>
            <span className="text-xs font-mono px-1.5 text-stone-700 min-w-[28px] text-center">
              {selectedElement?.fontSize || 22}px
            </span>
            <button
              onClick={() =>
                updateSelectedElement({
                  fontSize: Math.min(72, (selectedElement?.fontSize || 22) + 2),
                })
              }
              className="w-6 h-6 flex items-center justify-center text-xs font-bold text-stone-600 hover:text-maroon hover:bg-beige-medium rounded cursor-pointer"
              title="Increase font size"
            >
              +
            </button>
          </div>

          {/* Bold / Italic */}
          <button
            onClick={() =>
              updateSelectedElement({
                fontWeight: selectedElement?.fontWeight === 'bold' ? 'normal' : 'bold',
              })
            }
            className={`w-8 h-8 rounded-md flex items-center justify-center font-serif font-bold text-xs border transition-all cursor-pointer ${
              selectedElement?.fontWeight === 'bold'
                ? 'bg-maroon text-white border-maroon-dark'
                : 'bg-parchment text-stone-700 border-beige-dark hover:bg-beige-medium'
            }`}
            title="Bold"
          >
            B
          </button>
          <button
            onClick={() =>
              updateSelectedElement({
                fontStyle: selectedElement?.fontStyle === 'italic' ? 'normal' : 'italic',
              })
            }
            className={`w-8 h-8 rounded-md flex items-center justify-center font-serif italic text-xs border transition-all cursor-pointer ${
              selectedElement?.fontStyle === 'italic'
                ? 'bg-maroon text-white border-maroon-dark'
                : 'bg-parchment text-stone-700 border-beige-dark hover:bg-beige-medium'
            }`}
            title="Italic"
          >
            I
          </button>

          {/* Alignments */}
          <div className="flex items-center bg-parchment rounded-md border border-beige-dark shadow-2xs h-8 p-0.5">
            {['left', 'center', 'right'].map((align) => (
              <button
                key={align}
                onClick={() => updateSelectedElement({ textAlign: align })}
                className={`px-2 h-full rounded text-[11px] font-mono cursor-pointer uppercase ${
                  (selectedElement?.textAlign || 'left') === align
                    ? 'bg-maroon text-white font-bold'
                    : 'text-stone-600 hover:bg-beige-medium'
                }`}
                title={`Align ${align}`}
              >
                {align === 'left' ? '⫷' : align === 'center' ? '≡' : '⫸'}
              </button>
            ))}
          </div>
        </div>

        {/* Group 2: Text Color Palette */}
        <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-beige-dark">
          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider hidden lg:inline">Color</span>
          <div className="flex items-center gap-1">
            {[
              { name: 'Maroon', val: '#722F37' },
              { name: 'Terracotta', val: '#D96B43' },
              { name: 'Sage', val: '#587B66' },
              { name: 'Stamp Blue', val: '#2C4A5E' },
              { name: 'Gold', val: '#A68B63' },
              { name: 'Charcoal', val: '#292524' },
            ].map((c) => (
              <button
                key={c.val}
                onClick={() => updateSelectedElement({ color: c.val })}
                style={{ backgroundColor: c.val }}
                className={`w-6 h-6 rounded-full border cursor-pointer transition-transform hover:scale-110 shadow-2xs ${
                  selectedElement?.color === c.val
                    ? 'ring-2 ring-maroon ring-offset-1 scale-110'
                    : 'border-stone-400/40'
                }`}
                title={c.name}
              />
            ))}

            {/* Custom Color Input */}
            <label
              className="w-6 h-6 rounded-full border border-dashed border-stone-400 flex items-center justify-center cursor-pointer bg-white text-[9px] hover:border-maroon"
              title="Custom Color Picker"
            >
              🎨
              <input
                type="color"
                value={selectedElement?.color || '#722F37'}
                onChange={(e) => updateSelectedElement({ color: e.target.value })}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        {/* Group 3: Page Background Color & Pattern */}
        <div className="flex items-center gap-1.5 shrink-0 pr-3 border-r border-beige-dark">
          <span className="text-[10px] font-mono text-stone-500 uppercase tracking-wider hidden lg:inline">Paper</span>

          {/* Background Color swatches for the current page */}
          <div className="flex items-center gap-1">
            {[
              { name: 'Warm Cream', val: '#FAF6F0' },
              { name: 'Parchment', val: '#FDFBF7' },
              { name: 'Sage Tint', val: '#E8EFEA' },
              { name: 'Kraft Vintage', val: '#F2EAE1' },
              { name: 'Rose Tint', val: '#F9ECEB' },
            ].map((bg) => (
              <button
                key={bg.val}
                onClick={() =>
                  setPages((prev) =>
                    prev.map((pg, idx) => (idx === activePageIndex ? { ...pg, bgColor: bg.val } : pg))
                  )
                }
                style={{ backgroundColor: bg.val }}
                className={`w-6 h-6 rounded-md border cursor-pointer transition-transform hover:scale-110 shadow-2xs ${
                  activePage?.bgColor === bg.val
                    ? 'ring-2 ring-maroon ring-offset-1 scale-105 border-maroon'
                    : 'border-stone-300'
                }`}
                title={`Background: ${bg.name}`}
              />
            ))}
          </div>

          {/* Pattern Selector */}
          <select
            value={activePage?.bgPattern || 'plain'}
            onChange={(e) =>
              setPages((prev) =>
                prev.map((pg, idx) => (idx === activePageIndex ? { ...pg, bgPattern: e.target.value } : pg))
              )
            }
            className="h-8 px-2 rounded-md bg-parchment border border-beige-dark text-xs font-mono text-stone-700 cursor-pointer shadow-2xs"
          >
            <option value="plain">Texture: Plain</option>
            <option value="dots">Texture: Dot Grid</option>
            <option value="lines">Texture: Lined Paper</option>
            <option value="grid">Texture: Vintage Grid</option>
          </select>
        </div>

        {/* Group 4: Quick Insert & Layer Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() =>
              addElementToPage({
                type: 'text',
                text: 'Write your memory here...',
                fontFamily: 'Caveat',
                fontSize: 24,
                color: '#4A1B21',
                textAlign: 'left',
                width: 280,
              })
            }
            className="h-8 px-3 rounded-md bg-parchment hover:bg-beige-medium border border-beige-dark text-xs font-semibold text-maroon flex items-center gap-1 cursor-pointer shadow-2xs"
            title="Add text box"
          >
            <span>+ Text</span>
          </button>

          {selectedElement && (
            <>
              <button
                onClick={() => changeLayer('up')}
                className="h-8 w-8 rounded-md bg-parchment hover:bg-beige-medium border border-beige-dark text-xs font-mono text-stone-700 flex items-center justify-center cursor-pointer shadow-2xs"
                title="Bring Forward"
              >
                ▲
              </button>
              <button
                onClick={() => changeLayer('down')}
                className="h-8 w-8 rounded-md bg-parchment hover:bg-beige-medium border border-beige-dark text-xs font-mono text-stone-700 flex items-center justify-center cursor-pointer shadow-2xs"
                title="Send Backward"
              >
                ▼
              </button>
              <button
                onClick={deleteSelectedElement}
                className="h-8 px-2.5 rounded-md bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-1 cursor-pointer shadow-2xs"
                title="Delete element"
              >
                <span>🗑️</span>
                <span className="hidden sm:inline">Delete</span>
              </button>
            </>
          )}

          {/* Zoom dropdown */}
          <div className="flex items-center bg-parchment rounded-md border border-beige-dark px-2 h-8 shadow-2xs">
            <span className="text-[11px] font-mono text-stone-600 mr-1">🔍</span>
            <select
              value={zoomLevel}
              onChange={(e) => setZoomLevel(Number(e.target.value))}
              className="text-xs font-mono bg-transparent text-stone-700 outline-none cursor-pointer"
            >
              <option value="75">75%</option>
              <option value="90">90%</option>
              <option value="100">100%</option>
              <option value="115">115%</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  )
}
