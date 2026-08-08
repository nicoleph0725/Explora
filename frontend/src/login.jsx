import { useState } from 'react'

export default function LoginPage({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // For now, directly log in
    onLogin()
  }

  return (
    <div className="min-h-screen bg-beige-light flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Decorative Accents */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gold/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-maroon/5 blur-3xl pointer-events-none"></div>

      {/* Top Header / Brand Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="font-serif text-3xl font-bold tracking-tight text-maroon">Explora</span>
          <span className="w-2.5 h-2.5 rounded-full bg-gold animate-pulse"></span>
        </div>
        <button
          onClick={onLogin}
          className="text-xs sm:text-sm font-semibold text-maroon hover:text-maroon-dark bg-beige-medium/60 hover:bg-beige-medium px-4 py-2 rounded-full border border-beige-dark/50 transition-all duration-200"
        >
          Explore Demo →
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 flex flex-col lg:flex-row items-center justify-between gap-12 z-10 w-full">
        
        {/* Left Side: Brand Story & Feature Preview */}
        <div className="lg:w-1/2 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/15 border border-gold/30 text-maroon-dark text-xs font-semibold mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-maroon"></span>
            Digital Travel Journal & Memory Canvas
          </div>
          
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-maroon-dark tracking-tight leading-tight mb-6">
            Document your journey, <br className="hidden sm:inline" />
            <span className="italic text-gold-dark font-normal">one story at a time.</span>
          </h1>
          
          <p className="text-stone-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8">
            Create interactive journals with custom canvas layouts, polaroid photo arrangements, video clips, and handwritten notes. Seamlessly switch between flexible editing and full-screen slideshow presentation views.
          </p>

          {/* Feature Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
            <div className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-beige-dark/50 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-beige-medium flex items-center justify-center text-maroon mb-2">
                🎨
              </div>
              <h3 className="font-serif font-bold text-maroon-dark text-sm mb-1">Freeform Canvas</h3>
              <p className="text-xs text-stone-500">Place photos, videos, & doodles anywhere.</p>
            </div>

            <div className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-beige-dark/50 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-beige-medium flex items-center justify-center text-maroon mb-2">
                🎞️
              </div>
              <h3 className="font-serif font-bold text-maroon-dark text-sm mb-1">Slideshow View</h3>
              <p className="text-xs text-stone-500">Replay your expeditions like a cinematic film.</p>
            </div>

            <div className="p-4 rounded-xl bg-white/70 backdrop-blur-sm border border-beige-dark/50 shadow-sm">
              <div className="w-8 h-8 rounded-lg bg-beige-medium flex items-center justify-center text-maroon mb-2">
                📐
              </div>
              <h3 className="font-serif font-bold text-maroon-dark text-sm mb-1">Curated Templates</h3>
              <p className="text-xs text-stone-500">Instant layout presets for quick journaling.</p>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Form Card */}
        <div className="w-full lg:w-[420px]">
          <div className="bg-white rounded-3xl shadow-xl shadow-maroon/5 border border-beige-dark/70 p-8 relative">
            
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="font-serif text-2xl font-bold text-maroon-dark">
                {isSignUp ? 'Create your Journal' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-stone-500 mt-1">
                {isSignUp 
                  ? 'Start cataloging your travels across the globe' 
                  : 'Enter your credentials to access your expedition logs'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Amelia Earhart"
                    className="w-full px-4 py-3 rounded-xl border border-beige-dark bg-beige-light/30 focus:bg-white focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none transition-all duration-200 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="explorer@explora.com"
                  className="w-full px-4 py-3 rounded-xl border border-beige-dark bg-beige-light/30 focus:bg-white focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none transition-all duration-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-beige-dark bg-beige-light/30 focus:bg-white focus:border-maroon focus:ring-2 focus:ring-maroon/20 outline-none transition-all duration-200 text-sm"
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-maroon hover:bg-maroon-dark text-white font-bold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </form>

            {/* Quick Demo Bypass */}
            <div className="mt-6 pt-6 border-t border-beige-dark/50 text-center">
              <p className="text-xs text-stone-500 mb-3">Want to check it out right away?</p>
              <button
                onClick={onLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-beige-medium/80 hover:bg-beige-medium text-maroon-dark font-semibold text-xs border border-beige-dark transition-all duration-200 cursor-pointer"
              >
                ⚡ Instant Guest Preview
              </button>
            </div>

            {/* Toggle Sign Up / Sign In */}
            <div className="mt-6 text-center">
              <p className="text-xs text-stone-500">
                {isSignUp ? 'Already have an account?' : "Don't have a journal yet?"}{' '}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="font-bold text-maroon hover:text-maroon-dark underline cursor-pointer ml-1"
                >
                  {isSignUp ? 'Sign In' : 'Create Account'}
                </button>
              </p>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-beige-dark/40 text-center text-xs text-stone-400 z-10 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>© {new Date().getFullYear()} Explora Journal Inc. All rights reserved.</p>
        <p className="italic font-serif">Made for travelers & storytellers</p>
      </footer>
    </div>
  )
}
