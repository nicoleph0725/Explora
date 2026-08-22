export default function CanvasElement({
  el,
  isSelected,
  isDragging,
  onMouseDown,
  onUpdate,
  onDelete,
}) {
  return (
    <div
      onMouseDown={onMouseDown}
      style={{
        position: 'absolute',
        left: `${el.x}px`,
        top: `${el.y}px`,
        transform: `rotate(${el.rotation || 0}deg)`,
        zIndex: el.zIndex || 1,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      className={`group transition-shadow duration-100 ${
        isSelected ? 'ring-2 ring-maroon ring-offset-2 rounded' : ''
      }`}
    >
      {/* Control handles when selected */}
      {isSelected && (
        <div className="absolute -top-7 right-0 flex items-center gap-1 bg-maroon text-white text-[10px] px-1.5 py-0.5 rounded shadow z-50">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onUpdate({
                rotation: (el.rotation || 0) + 15,
              })
            }}
            className="hover:text-gold cursor-pointer px-1"
            title="Rotate"
          >
            ↻
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="hover:text-red-300 cursor-pointer px-1 font-bold"
            title="Delete"
          >
            ✕
          </button>
        </div>
      )}

      {/* 1. TEXT ELEMENT */}
      {el.type === 'text' && (
        <div
          style={{
            width: el.width ? `${el.width}px` : 'auto',
            fontFamily: el.fontFamily || 'Caveat',
            fontSize: `${el.fontSize || 22}px`,
            color: el.color || '#4A1B21',
            fontWeight: el.fontWeight || 'normal',
            fontStyle: el.fontStyle || 'normal',
            textAlign: el.textAlign || 'left',
          }}
          className="p-1 outline-none leading-snug break-words"
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdate({ text: e.currentTarget.textContent })}
        >
          {el.text}
        </div>
      )}

      {/* 2. POLAROID ELEMENT */}
      {el.type === 'polaroid' && (
        <div
          style={{ width: `${el.width || 260}px` }}
          className="polaroid-card bg-white p-2.5 pb-4 shadow-xl border border-stone-200"
        >
          {/* Mini decorative tape strip on top of polaroid */}
          <div className="w-16 h-4 washi-tape absolute -top-2 left-1/2 -translate-x-1/2 rotate-[-2deg] z-10"></div>

          <div className="relative aspect-4/3 rounded-xs overflow-hidden bg-stone-100 mb-2">
            <img
              src={el.imageUrl}
              alt={el.caption || 'Polaroid'}
              className="w-full h-full object-cover pointer-events-none"
            />
          </div>

          <div
            style={{ fontFamily: el.fontFamily || 'Caveat' }}
            className="text-center text-stone-800 text-base font-semibold leading-tight px-1 outline-none"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdate({ caption: e.currentTarget.textContent })}
          >
            {el.caption}
          </div>
        </div>
      )}

      {/* 3. STAMP ELEMENT */}
      {el.type === 'stamp' && (
        <div
          style={{
            borderColor: el.color || '#587B66',
            color: el.color || '#587B66',
            width: el.width ? `${el.width}px` : '130px',
            height: el.height ? `${el.height}px` : '130px',
          }}
          className={`border-2 border-dashed font-mono uppercase select-none flex flex-col items-center justify-center p-2 text-center text-[10px] tracking-wider font-bold shadow-xs ${
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

      {/* 4. BADGE / DOODLE ELEMENT */}
      {el.type === 'badge' && (
        <div
          style={{ backgroundColor: el.bgColor || '#FAF6F0' }}
          className="px-3 py-1.5 rounded-full border border-beige-dark shadow-md flex items-center gap-2"
        >
          <span className="text-xl leading-none">{el.emoji}</span>
          <span
            style={{ color: el.color || '#722F37' }}
            className="font-mono text-xs font-bold tracking-tight"
          >
            {el.label}
          </span>
        </div>
      )}

      {/* 5. WASHI TAPE STRIP ELEMENT */}
      {el.type === 'tape' && (
        <div
          style={{
            backgroundColor: el.color || 'rgba(217, 107, 67, 0.75)',
            width: `${el.width || 140}px`,
            height: `${el.height || 26}px`,
          }}
          className="washi-tape rounded-2xs shadow-sm"
        ></div>
      )}

      {/* 6. STICKY NOTE ELEMENT */}
      {el.type === 'sticky-note' && (
        <div
          style={{
            backgroundColor: el.bgColor || '#FFFBEB',
            color: el.color || '#78350F',
            width: `${el.width || 220}px`,
            fontFamily: el.fontFamily || 'Caveat',
          }}
          className="p-3 rounded-sm shadow-md border border-amber-200/60 leading-tight"
        >
          <div className="w-10 h-3 washi-tape absolute -top-1.5 left-1/2 -translate-x-1/2"></div>
          <div
            className="outline-none text-base font-semibold pt-1"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdate({ text: e.currentTarget.textContent })}
          >
            {el.text}
          </div>
        </div>
      )}

      {/* 7. TICKET STUB ELEMENT */}
      {el.type === 'ticket' && (
        <div
          style={{
            backgroundColor: el.bgColor || '#FAF6F0',
            borderColor: el.borderColor || '#E6D8C9',
            color: el.textColor || '#4A1B21',
            width: `${el.width || 220}px`,
          }}
          className="p-3 rounded border-2 border-dashed shadow-md font-mono text-[11px] leading-tight"
        >
          <div
            className="outline-none font-bold"
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => onUpdate({ text: e.currentTarget.textContent })}
          >
            {el.text}
          </div>
        </div>
      )}

      {/* 8. WAX SEAL ELEMENT */}
      {el.type === 'wax-seal' && (
        <div
          style={{
            backgroundColor: el.bgColor || '#722F37',
            borderColor: el.borderColor || '#4A1B21',
            color: el.textColor || '#C5A880',
          }}
          className="w-12 h-12 rounded-full border-4 shadow-lg flex items-center justify-center font-serif font-bold text-sm"
        >
          ✦ E ✦
        </div>
      )}
    </div>
  )
}
