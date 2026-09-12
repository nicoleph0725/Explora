import { useRef } from 'react'

// Helper to compute directional cursor based on handle position and current element rotation
function getRotatedCursor(handle, rotation = 0) {
  const baseAngles = {
    n: 0,
    ne: 45,
    e: 90,
    se: 135,
    s: 180,
    sw: 225,
    w: 270,
    nw: 315,
  }
  const base = baseAngles[handle] ?? 0
  const total = (((base + rotation) % 360) + 360) % 360
  if ((total >= 337.5 || total < 22.5) || (total >= 157.5 && total < 202.5)) {
    return 'ns-resize'
  }
  if ((total >= 22.5 && total < 67.5) || (total >= 202.5 && total < 247.5)) {
    return 'nesw-resize'
  }
  if ((total >= 67.5 && total < 112.5) || (total >= 247.5 && total < 292.5)) {
    return 'ew-resize'
  }
  return 'nwse-resize'
}

export default function CanvasElement({
  el,
  isSelected,
  isInteracting,
  interactionType,
  onMouseDown,
  onStartResize,
  onStartRotate,
  onUpdate,
  onDelete,
  onDuplicate,
}) {
  const elementRef = useRef(null)

  const rotation = el.rotation || 0
  const isMoving = isInteracting && interactionType === 'move'
  const isResizing = isInteracting && interactionType === 'resize'
  const isRotating = isInteracting && interactionType === 'rotate'

  const cornerHandles = [
    { id: 'nw', className: '-top-2 -left-2' },
    { id: 'ne', className: '-top-2 -right-2' },
    { id: 'se', className: '-bottom-2 -right-2' },
    { id: 'sw', className: '-bottom-2 -left-2' },
  ]

  const isTextElement = el.type === 'text'

  return (
    <div
      ref={elementRef}
      tabIndex={-1}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => {
        if (isTextElement) {
          onMouseDown && onMouseDown(e, el, elementRef, false)
        } else {
          onMouseDown && onMouseDown(e, el, elementRef, true)
        }
      }}
      style={{
        position: 'absolute',
        left: `${el.x}px`,
        top: `${el.y}px`,
        width: el.width ? `${el.width}px` : 'auto',
        height: el.height ? `${el.height}px` : 'auto',
        transform: `rotate(${rotation}deg)`,
        transformOrigin: 'center center',
        zIndex: el.zIndex || 1,
        cursor: isMoving ? 'grabbing' : isTextElement ? 'text' : 'grab',
      }}
      className={`group select-none ${
        isSelected ? 'z-40' : ''
      }`}
    >
      {/* Selection Bounding Box Outline (Draggable Border Handle) */}
      {isSelected && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation()
            onMouseDown && onMouseDown(e, el, elementRef, true)
          }}
          className="absolute -inset-1.5 border-2 border-maroon/90 rounded-sm z-30 ring-1 ring-gold/40 shadow-xs cursor-move hover:border-gold transition-colors"
          title="Drag outline to move"
        />
      )}

      {/* ================= ROTATION HANDLE (TOP STEM & KNOB) ================= */}
      {isSelected && (
        <>
          {/* Connector stem */}
          <div
            className="absolute left-1/2 -top-6 w-[2px] h-6 bg-maroon/90 -translate-x-1/2 pointer-events-none z-30"
          />

          {/* Rotation knob */}
          <div
            onMouseDown={(e) => {
              e.stopPropagation()
              onStartRotate && onStartRotate(e, el, elementRef)
            }}
            style={{ cursor: isRotating ? 'grabbing' : 'grab' }}
            className={`absolute left-1/2 -top-9 -translate-x-1/2 w-6 h-6 rounded-full bg-white border-2 border-maroon text-maroon shadow-md flex items-center justify-center hover:bg-maroon hover:text-gold hover:scale-115 transition-transform z-50 ${
              isRotating ? 'bg-maroon text-gold ring-2 ring-gold scale-115' : ''
            }`}
            title="Drag to rotate (Hold Shift to snap 15°)"
          >
            <svg
              className="w-3.5 h-3.5 fill-current pointer-events-none"
              viewBox="0 0 24 24"
            >
              <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0020 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 004 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
            </svg>
          </div>
        </>
      )}

      {/* ================= 4 CORNER RESIZE HANDLES (LOCKED RATIO) ================= */}
      {isSelected &&
        cornerHandles.map((h) => {
          const cursor = getRotatedCursor(h.id, rotation)
          return (
            <div
              key={h.id}
              onMouseDown={(e) => {
                e.stopPropagation()
                onStartResize && onStartResize(e, h.id, el, elementRef)
              }}
              style={{ cursor }}
              className={`absolute ${h.className} w-3.5 h-3.5 rounded-xs bg-white border-2 border-maroon shadow-xs hover:bg-gold hover:border-maroon-dark hover:scale-125 transition-transform z-40`}
              title="Drag corner to scale (keeps ratio)"
            />
          )
        })}

      {/* Quick Delete Button on Selected Element */}
      {isSelected && !isInteracting && (
        <button
          onMouseDown={(e) => {
            e.stopPropagation()
          }}
          onClick={(e) => {
            e.stopPropagation()
            onDelete && onDelete()
          }}
          className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-maroon text-white text-[10px] font-bold shadow-md hover:bg-red-600 hover:scale-110 transition-transform flex items-center justify-center cursor-pointer z-50 border border-white"
          title="Delete element"
        >
          ✕
        </button>
      )}

      {/* ================= 1. TEXT ELEMENT ================= */}
      {el.type === 'text' && (
        <div
          style={{
            fontFamily: el.fontFamily || 'Caveat',
            fontSize: `${el.fontSize || 22}px`,
            color: el.color || '#4A1B21',
            fontWeight: el.fontWeight || 'normal',
            fontStyle: el.fontStyle || 'normal',
            textAlign: el.textAlign || 'left',
          }}
          className="p-1 outline-none leading-snug break-words select-text w-full h-full"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdate({ text: e.currentTarget.textContent })}
        >
          {el.text}
        </div>
      )}

      {/* ================= 2. POLAROID ELEMENT ================= */}
      {el.type === 'polaroid' && (
        <div
          className="polaroid-card bg-white p-2.5 pb-4 shadow-xl border border-stone-200 w-full h-full flex flex-col justify-between"
        >
          {/* Mini decorative tape strip on top of polaroid */}
          <div className="w-16 h-4 washi-tape absolute -top-2 left-1/2 -translate-x-1/2 rotate-[-2deg] z-10 pointer-events-none"></div>

          <div className="relative aspect-4/3 rounded-xs overflow-hidden bg-stone-100 mb-2 pointer-events-none flex-1">
            <img
              src={el.imageUrl}
              alt={el.caption || 'Polaroid'}
              className="w-full h-full object-cover pointer-events-none select-none"
              draggable={false}
            />
          </div>

          <div
            style={{ fontFamily: el.fontFamily || 'Caveat' }}
            className="text-center text-stone-800 text-base font-semibold leading-tight px-1 outline-none select-text shrink-0"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdate({ caption: e.currentTarget.textContent })}
          >
            {el.caption}
          </div>
        </div>
      )}

      {/* ================= 3. STAMP ELEMENT ================= */}
      {el.type === 'stamp' && (
        <div
          style={{
            borderColor: el.color || '#587B66',
            color: el.color || '#587B66',
          }}
          className={`border-2 border-dashed font-mono uppercase select-none flex flex-col items-center justify-center p-2 text-center text-[10px] tracking-wider font-bold shadow-xs w-full h-full ${
            el.shape === 'circle'
              ? 'rounded-full'
              : el.shape === 'oval'
              ? 'rounded-3xl'
              : 'rounded-md'
          }`}
        >
          <span className="text-[12px] mb-0.5">★ ★ ★</span>
          <span className="whitespace-pre-line leading-tight">{el.text}</span>
        </div>
      )}

      {/* ================= 4. BADGE / DOODLE ELEMENT ================= */}
      {el.type === 'badge' && (
        <div
          style={{
            backgroundColor: el.bgColor || '#FAF6F0',
          }}
          className="px-3 py-1.5 rounded-full border border-beige-dark shadow-md flex items-center justify-center gap-2 select-none w-full h-full"
        >
          <span className="text-xl leading-none">{el.emoji}</span>
          <span
            style={{ color: el.color || '#722F37' }}
            className="font-mono text-xs font-bold tracking-tight truncate"
          >
            {el.label}
          </span>
        </div>
      )}

      {/* ================= 5. WASHI TAPE STRIP ELEMENT ================= */}
      {el.type === 'tape' && (
        <div
          style={{
            backgroundColor: el.color || 'rgba(217, 107, 67, 0.75)',
          }}
          className="washi-tape rounded-2xs shadow-sm w-full h-full"
        ></div>
      )}

      {/* ================= 6. STICKY NOTE ELEMENT ================= */}
      {el.type === 'sticky-note' && (
        <div
          style={{
            backgroundColor: el.bgColor || '#FFFBEB',
            color: el.color || '#78350F',
            fontFamily: el.fontFamily || 'Caveat',
          }}
          className="p-3 rounded-sm shadow-md border border-amber-200/60 leading-tight flex flex-col w-full h-full"
        >
          <div className="w-10 h-3 washi-tape absolute -top-1.5 left-1/2 -translate-x-1/2 pointer-events-none"></div>
          <div
            className="outline-none text-base font-semibold pt-1 flex-1 select-text"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdate({ text: e.currentTarget.textContent })}
          >
            {el.text}
          </div>
        </div>
      )}

      {/* ================= 7. TICKET STUB ELEMENT ================= */}
      {el.type === 'ticket' && (
        <div
          style={{
            backgroundColor: el.bgColor || '#FAF6F0',
            borderColor: el.borderColor || '#E6D8C9',
            color: el.textColor || '#4A1B21',
          }}
          className="p-3 rounded border-2 border-dashed shadow-md font-mono text-[11px] leading-tight w-full h-full"
        >
          <div
            className="outline-none font-bold select-text"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdate({ text: e.currentTarget.textContent })}
          >
            {el.text}
          </div>
        </div>
      )}

      {/* ================= 8. WAX SEAL ELEMENT ================= */}
      {el.type === 'wax-seal' && (
        <div
          style={{
            backgroundColor: el.bgColor || '#722F37',
            borderColor: el.borderColor || '#4A1B21',
            color: el.textColor || '#C5A880',
            fontSize: `${Math.max(10, Math.round((el.width || 48) * 0.28))}px`,
          }}
          className="rounded-full border-4 shadow-lg flex items-center justify-center font-serif font-bold select-none w-full h-full"
        >
          ✦ E ✦
        </div>
      )}
    </div>
  )
}
