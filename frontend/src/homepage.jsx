import Navbar from './navbar'

export default function Homepage() {
  return (
    <div className="min-h-screen bg-beige-light pb-20">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-12">
        {/* Hero Section */}
        <div className="mb-10 text-center md:text-left">
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-maroon-dark tracking-tight mb-3">
            My Travels
          </h1>
          <p className="text-stone-500 text-sm italic">
            Documenting your journey, one unforgettable place at a time
          </p>
        </div>

        {/* Main Card Container */}
        <div className="bg-white rounded-2xl shadow-xl shadow-maroon/5 border border-beige-dark/60 p-6 sm:p-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-beige-dark/40">
            <div>
              <h2 className="font-serif text-2xl font-bold text-maroon-dark">Travel Journal</h2>
              <p className="text-xs text-stone-400 mt-1">Catalog discoveries during the expedition</p>
            </div>
          </div>

          <div>
            <div className="text-center py-12 border border-dashed border-beige-dark/60 rounded-xl bg-beige-light/10">
              <svg className="w-12 h-12 text-beige-deep mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-sm text-stone-400 italic">No travel entries recorded yet. Click "+ New Entry" to begin your story.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

