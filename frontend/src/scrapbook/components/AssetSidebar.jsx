import {
  SAMPLE_PHOTOS,
  STICKER_TEMPLATES,
  TAPE_TEMPLATES,
  EPHEMERA_TEMPLATES,
} from '../scrapbookData'

export default function AssetSidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  activeSidebarTab,
  setActiveSidebarTab,
  addElementToPage,
  fileInputRef,
  handlePhotoUpload,
}) {
  return (
    <aside
      className={`transition-all duration-300 ease-in-out bg-beige-light border-r border-beige-dark flex flex-col z-20 shrink-0 ${
        isSidebarOpen ? 'w-80' : 'w-12'
      }`}
    >
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Sidebar Toggle Header */}
      <div className="p-2 border-b border-beige-dark flex items-center justify-between bg-parchment">
        {isSidebarOpen && (
          <span className="font-serif font-bold text-xs uppercase tracking-wider text-maroon-dark pl-2">
            Scrapbook Elements
          </span>
        )}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="w-8 h-8 rounded-md bg-beige-medium hover:bg-beige-dark text-maroon font-bold flex items-center justify-center transition-colors cursor-pointer ml-auto"
          title={isSidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isSidebarOpen ? '◀' : '▶'}
        </button>
      </div>

      {isSidebarOpen ? (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Category Tabs */}
          <div className="grid grid-cols-4 p-2 gap-1 bg-beige-medium/50 border-b border-beige-dark text-center">
            {[
              { id: 'photos', label: 'Photos', icon: '📷' },
              { id: 'stickers', label: 'Stickers', icon: '✨' },
              { id: 'tapes', label: 'Tapes', icon: '🏷️' },
              { id: 'ephemera', label: 'Notes', icon: '📝' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSidebarTab(tab.id)}
                className={`py-1.5 px-1 rounded-md text-xs font-semibold flex flex-col items-center gap-0.5 transition-all cursor-pointer ${
                  activeSidebarTab === tab.id
                    ? 'bg-parchment text-maroon shadow-xs border border-beige-dark font-bold'
                    : 'text-stone-600 hover:text-maroon hover:bg-beige-light'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="text-[10px]">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Container */}
          <div className="flex-1 overflow-y-auto p-3 space-y-4">
            {/* TAB 1: PHOTOS & POLAROIDS */}
            {activeSidebarTab === 'photos' && (
              <div className="space-y-3">
                {/* Upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-3 rounded-lg border-2 border-dashed border-terracotta bg-terracotta/5 hover:bg-terracotta/10 text-terracotta font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="text-base">⬆</span>
                  <span>Upload Custom Photo</span>
                </button>

                <div className="text-[11px] font-mono text-stone-500 uppercase tracking-wider pt-1">
                  Travel Polaroid Presets
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {SAMPLE_PHOTOS.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() =>
                        addElementToPage({
                          type: 'polaroid',
                          imageUrl: photo.url,
                          caption: photo.caption,
                          width: 260,
                          fontFamily: 'Caveat',
                          rotation: Math.floor(Math.random() * 8) - 4,
                        })
                      }
                      className="bg-white p-2 rounded shadow-sm hover:shadow-md border border-beige-dark cursor-pointer transition-all hover:scale-103 group"
                    >
                      <div className="aspect-4/3 overflow-hidden rounded-xs bg-stone-100 mb-1.5">
                        <img
                          src={photo.url}
                          alt={photo.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <p className="text-[10px] font-handwriting text-stone-700 truncate text-center font-bold">
                        {photo.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: STICKERS & PASSPORT STAMPS */}
            {activeSidebarTab === 'stickers' && (
              <div className="space-y-4">
                <div className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                  Vintage Passport Stamps
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {STICKER_TEMPLATES.filter((s) => s.category === 'stamps').map((stamp) => (
                    <button
                      key={stamp.id}
                      onClick={() =>
                        addElementToPage({
                          type: 'stamp',
                          text: stamp.text,
                          color: stamp.color,
                          shape: stamp.shape,
                          rotation: stamp.rotation,
                          width: 140,
                          height: 140,
                        })
                      }
                      className="p-3 bg-parchment rounded-lg border border-dashed border-stone-400/60 hover:border-maroon transition-all flex items-center justify-center text-center cursor-pointer shadow-2xs hover:scale-105"
                    >
                      <div
                        style={{ borderColor: stamp.color, color: stamp.color }}
                        className={`border-2 border-dashed p-2 font-mono text-[9px] uppercase leading-tight ${
                          stamp.shape === 'circle' ? 'rounded-full w-20 h-20 flex flex-col justify-center' : 'rounded'
                        }`}
                      >
                        {stamp.text}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="text-[11px] font-mono text-stone-500 uppercase tracking-wider pt-2">
                  Travel Badges & Doodles
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {STICKER_TEMPLATES.filter((s) => s.category === 'badges').map((badge) => (
                    <button
                      key={badge.id}
                      onClick={() =>
                        addElementToPage({
                          type: 'badge',
                          emoji: badge.emoji,
                          label: badge.label,
                          color: badge.color,
                          bgColor: badge.bgColor,
                          rotation: Math.floor(Math.random() * 12) - 6,
                        })
                      }
                      className="p-2 bg-parchment rounded-lg border border-beige-dark hover:border-terracotta transition-all flex items-center gap-2 cursor-pointer shadow-2xs hover:scale-105"
                    >
                      <span className="text-xl">{badge.emoji}</span>
                      <span className="text-[10px] font-mono font-bold text-stone-700 truncate">{badge.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: WASHI TAPE & STRIPS */}
            {activeSidebarTab === 'tapes' && (
              <div className="space-y-3">
                <div className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                  Washi Tape Strips
                </div>
                <div className="space-y-2">
                  {TAPE_TEMPLATES.map((tape) => (
                    <div
                      key={tape.id}
                      onClick={() =>
                        addElementToPage({
                          type: 'tape',
                          tapeId: tape.id,
                          color: tape.color,
                          accent: tape.accent,
                          width: 140,
                          height: 26,
                          rotation: Math.floor(Math.random() * 6) - 3,
                        })
                      }
                      className="p-2.5 rounded-lg bg-parchment border border-beige-dark hover:border-gold cursor-pointer transition-all hover:scale-102 flex flex-col gap-1 shadow-2xs"
                    >
                      <div className="flex justify-between items-center text-[10px] font-sans font-medium text-stone-600">
                        <span>{tape.name}</span>
                        <span className="text-[9px] font-mono text-terracotta">Click to add</span>
                      </div>
                      <div
                        style={{ backgroundColor: tape.color }}
                        className="w-full h-5 rounded-xs washi-tape shadow-xs"
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: STICKY NOTES & EPHEMERA */}
            {activeSidebarTab === 'ephemera' && (
              <div className="space-y-3">
                <div className="text-[11px] font-mono text-stone-500 uppercase tracking-wider">
                  Sticky Memos & Tickets
                </div>
                <div className="space-y-2.5">
                  {EPHEMERA_TEMPLATES.map((eph) => (
                    <div
                      key={eph.id}
                      onClick={() =>
                        addElementToPage({
                          type: eph.type,
                          text: eph.text,
                          bgColor: eph.bgColor,
                          borderColor: eph.borderColor,
                          textColor: eph.textColor,
                          fontFamily: eph.fontFamily,
                          width: eph.type === 'wax-seal' ? 60 : 220,
                          rotation: Math.floor(Math.random() * 6) - 3,
                        })
                      }
                      style={{ backgroundColor: eph.bgColor, borderColor: eph.borderColor }}
                      className="p-3 rounded border shadow-xs cursor-pointer transition-all hover:scale-102 hover:shadow-md"
                    >
                      <div className="text-[10px] font-mono font-bold text-stone-500 uppercase mb-1">{eph.name}</div>
                      <p
                        style={{ color: eph.textColor, fontFamily: eph.fontFamily }}
                        className="text-xs whitespace-pre-line"
                      >
                        {eph.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Collapsed Icons Bar
        <div className="flex-1 flex flex-col items-center py-4 gap-4">
          {[
            { id: 'photos', icon: '📷' },
            { id: 'stickers', icon: '✨' },
            { id: 'tapes', icon: '🏷️' },
            { id: 'ephemera', icon: '📝' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setIsSidebarOpen(true)
                setActiveSidebarTab(tab.id)
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-base hover:bg-beige-medium transition-colors cursor-pointer"
              title={`Open ${tab.id}`}
            >
              {tab.icon}
            </button>
          ))}
        </div>
      )}
    </aside>
  )
}
