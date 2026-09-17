import CanvasElement from './CanvasElement'
import AddPageButton from './AddPageButton'

export default function ScrapbookCanvas({
  zoomLevel,
  activePage,
  pages,
  selectedElementId,
  setSelectedElementId,
  transformState,
  onStartMove,
  onStartResize,
  onStartRotate,
  canvasRef,
  updateSelectedElement,
  deleteSelectedElement,
  onAddNewPage,
  getPatternBg,
}) {
  return (
    <main
      className="flex-1 flex items-center justify-center p-6 overflow-auto relative cursor-default"
      onClick={() => setSelectedElementId(null)}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          setSelectedElementId(null)
        }
      }}
    >
      {/* Subtle workbench texture background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#C5A880 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      ></div>

      {/* Canvas Wrapper Container with Scaling */}
      <div
        style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
        className="transition-transform duration-150 relative flex items-center justify-center"
      >
        {/* Scrapbook Album Cover Backing & Binder Spine */}
        <div
          onClick={() => setSelectedElementId(null)}
          className="relative p-6 rounded-2xl bg-[#4A1B21] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] border-4 border-[#331116] flex items-stretch cursor-default"
        >
          {/* Binder Spiral Coils / Ring Mechanism on Left */}
          <div className="w-8 mr-2 flex flex-col justify-around py-4 z-20 select-none pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center">
                <div className="w-8 h-3.5 rounded-full bg-gradient-to-r from-stone-400 via-stone-200 to-stone-600 shadow-md -mr-4 z-30 border border-stone-500/60"></div>
                <div className="w-3 h-3 rounded-full bg-black/40 -ml-1"></div>
              </div>
            ))}
          </div>

          {/* The Actual Scrapbook Page Canvas */}
          <div
            ref={canvasRef}
            style={{
              ...getPatternBg(activePage?.bgPattern, activePage?.bgColor || '#FAF6F0'),
              width: '760px',
              height: '520px',
            }}
            onClick={(e) => {
              if (e.target === canvasRef.current || e.target.classList.contains('canvas-bg-target')) {
                setSelectedElementId(null)
              }
            }}
            onMouseDown={(e) => {
              if (e.target === canvasRef.current) {
                setSelectedElementId(null)
              }
            }}
            className="canvas-bg-target relative rounded-lg shadow-inner overflow-hidden border border-stone-300/80 cursor-default select-none"
          >
            {/* Page Number Stamp in Corner */}
            <div className="absolute bottom-3 right-4 font-mono text-[11px] text-stone-400/80 tracking-widest pointer-events-none select-none">
              PAGE {activePage?.pageNumber} OF {pages.length}
            </div>

            {/* Page Elements */}
            {activePage?.elements.map((el) => {
              const isSelected = el.id === selectedElementId
              const isInteracting = transformState?.id === el.id
              const interactionType = isInteracting ? transformState.type : null

              return (
                <CanvasElement
                  key={el.id}
                  el={el}
                  isSelected={isSelected}
                  isInteracting={isInteracting}
                  interactionType={interactionType}
                  onMouseDown={(e, targetEl, elRef, shouldDrag) => {
                    e.stopPropagation()
                    onStartMove && onStartMove(e, targetEl, shouldDrag)
                  }}
                  onStartResize={onStartResize}
                  onStartRotate={onStartRotate}
                  onUpdate={(updates) => updateSelectedElement(updates, el.id)}
                  onDelete={() => deleteSelectedElement(el.id)}
                />
              )
            })}
          </div>
        </div>

        {/* Small Plus Button Beside Main Editing Canvas */}
        <AddPageButton onClick={onAddNewPage} />
      </div>
    </main>
  )
}
