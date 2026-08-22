export default function AddPageButton({ onClick }) {
  return (
    <div className="ml-5 flex flex-col items-center justify-center group z-30">
      <button
        onClick={onClick}
        className="w-13 h-13 rounded-full bg-gradient-to-tr from-maroon to-maroon-light hover:from-maroon-dark hover:to-maroon text-gold font-mono text-3xl font-bold shadow-2xl hover:shadow-maroon/50 border-2 border-gold flex items-center justify-center transform hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
        title="Add New Page to Scrapbook"
      >
        +
      </button>
      <span className="text-[10px] font-mono text-beige-light font-bold mt-2 bg-stone-900/80 px-2 py-0.5 rounded shadow opacity-90 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        + Add Page
      </span>
    </div>
  )
}
