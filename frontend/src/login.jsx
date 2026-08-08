import { useState } from 'react'
import scrapbookCover from './assets/scrapbook_cover.jpg'

export default function LoginPage({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onLogin()
  }

  return (
    <div className="min-h-screen bg-beige-light flex flex-col justify-between relative overflow-hidden font-sans select-none">
      
      {/* Scrapbook Background Elements (Tape, Stamps, Paper Textures) */}
      <div className="absolute top-10 -left-20 w-80 h-80 rounded-full bg-terracotta/10 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 -right-20 w-96 h-96 rounded-full bg-sage/15 blur-3xl pointer-events-none"></div>
      
      {/* Top Header / Brand Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-maroon">Explora</span>
            {/* Hand-drawn style underline accent */}
            <svg className="absolute -bottom-2 left-0 w-full h-2 text-terracotta" viewBox="0 0 100 10" preserveAspectRatio="none">
              <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-mono text-[10px] tracking-widest text-stamp-blue border border-stamp-blue/40 px-2 py-0.5 rounded rotate-[-4deg] bg-parchment shadow-xs">
            JOURNAL NO. 01
          </span>
        </div>

        <button
          onClick={onLogin}
          className="text-xs sm:text-sm font-bold text-maroon hover:text-maroon-dark bg-parchment hover:bg-beige-medium px-4 py-2 rounded-full border border-beige-dark/80 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex items-center gap-1.5"
        >
          <span>Explore Demo</span>
          <span className="font-mono text-terracotta">→</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-4 flex flex-col lg:flex-row items-center justify-between gap-12 z-10 w-full">
        
        {/* Left Side: Scrapbook Collage & Brand Story */}
        <div className="lg:w-1/2 text-center lg:text-left relative">
          
          {/* Passport Stamp Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sage-light border border-sage/40 text-sage-dark text-xs font-semibold mb-6 shadow-xs rotate-[-1deg]">
            <span className="w-2 h-2 rounded-full bg-sage animate-ping"></span>
            <span className="font-mono text-[11px] tracking-wider text-sage font-bold uppercase">Expedition Logbook</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-maroon-dark tracking-tight leading-tight mb-4">
            Document your travels in your own <br className="hidden sm:inline" />
            <span className="font-handwriting text-5xl sm:text-6xl lg:text-7xl text-terracotta font-normal tracking-wide block sm:inline mt-1">
              digital diary.
            </span>
          </h1>

          <p className="text-stone-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8 font-sans">
            Pin polaroids, embed video memories, doodle handwritten notes, and toggle effortlessly between freeform layout editing and movie-like slideshow presentations.
          </p>

          {/* Scrapbook Visual Feature Card (Hero Collage Preview) */}
          <div className="relative max-w-md mx-auto lg:mx-0 mt-4">
            
            {/* Washi Tape Top Left */}
            <div className="absolute -top-3 left-6 w-24 h-6 washi-tape z-20 rotate-[-5deg]"></div>
            {/* Washi Tape Top Right */}
            <div className="absolute -top-3 right-6 w-24 h-6 washi-tape z-20 rotate-[4deg]"></div>

            {/* Scrapbook Image Card */}
            <div className="polaroid-card bg-parchment p-3 rounded-md shadow-xl border border-beige-dark transform rotate-[-1.5deg] hover:rotate-0 transition-transform duration-300">
              <div className="relative rounded overflow-hidden aspect-4/3 bg-stone-100">
                <img 
                  src={scrapbookCover} 
                  alt="Scrapbook Journal Flatlay" 
                  className="w-full h-full object-cover"
                />
                
                {/* Floating Polaroid Pin Badge */}
                <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded border border-stone-200 shadow-md rotate-[3deg]">
                  <p className="font-handwriting text-base font-bold text-maroon leading-none">Beijing '26</p>
                </div>
              </div>

              {/* Handwritten Scrapbook Note Caption */}
              <div className="pt-3 px-2 flex justify-between items-center">
                <p className="font-handwriting text-lg text-stone-700 font-semibold">
                  "Every destination has a story waiting to be told..."
                </p>
                <div className="passport-stamp text-[9px] w-12 h-12 p-0 leading-none shrink-0 ml-2">
                  <span>TOKYO</span>
                  <span className="font-sans text-[7px]">PASSED</span>
                </div>
              </div>
            </div>

            {/* Sticky Note Accent behind */}
            <div className="absolute -bottom-5 -right-4 bg-amber-100/90 text-stone-800 p-3 rounded shadow-md border border-amber-200/80 rotate-[6deg] max-w-[170px] hidden sm:block">
              <div className="w-8 h-3 washi-tape absolute -top-1.5 left-1/2 -translate-x-1/2 rotate-[-2deg]"></div>
              <p className="font-handwriting text-sm text-stone-700 leading-tight">
                ✏️ Add photos, pen drawings & videos anywhere!
              </p>
            </div>
          </div>

        </div>

        {/* Right Side: Auth Scrapbook Envelope Card */}
        <div className="w-full lg:w-[420px] relative">
          
          {/* Top Stamp Decorative Stamp */}
          <div className="absolute -top-6 -right-3 z-30 passport-stamp w-16 h-16 bg-parchment border-terracotta text-terracotta rotate-[12deg] shadow-xs">
            <span className="text-[9px] font-bold">ENTRY</span>
            <span className="text-[7px]">PERMIT</span>
          </div>

          {/* Washi Tape holding the login card */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 washi-tape z-30 rotate-[-1deg]"></div>

          <div className="bg-parchment rounded-2xl shadow-2xl shadow-maroon/10 border-2 border-beige-dark/90 p-8 relative">
            
            {/* Header */}
            <div className="text-center mb-6">
              <span className="font-mono text-[10px] tracking-widest uppercase text-terracotta font-bold">
                {isSignUp ? 'New Expedition Member' : 'Expedition Access'}
              </span>
              <h2 className="font-serif text-3xl font-bold text-maroon-dark mt-1">
                {isSignUp ? 'Open Your Journal' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-stone-500 font-sans mt-1">
                {isSignUp 
                  ? 'Start crafting your personal travel scrapbook' 
                  : 'Enter your details to view your saved memories'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1 font-mono">
                    Explorer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Amelia Earhart"
                    className="w-full px-4 py-3 rounded-xl border border-beige-dark bg-white focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none transition-all duration-200 text-sm"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1 font-mono">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="explorer@explora.com"
                  className="w-full px-4 py-3 rounded-xl border border-beige-dark bg-white focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none transition-all duration-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1 font-mono">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-beige-dark bg-white focus:border-terracotta focus:ring-2 focus:ring-terracotta/20 outline-none transition-all duration-200 text-sm"
                />
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full mt-2 py-3.5 px-6 rounded-xl bg-maroon hover:bg-maroon-dark text-white font-bold text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer border border-maroon-dark"
              >
                <span className="font-serif tracking-wide">{isSignUp ? 'Begin Journey' : 'Open Logbook'}</span>
                <span className="font-mono text-gold font-bold">→</span>
              </button>
            </form>

            {/* Quick Demo Bypass */}
            <div className="mt-6 pt-5 border-t border-dashed border-beige-dark text-center">
              <p className="text-xs text-stone-500 mb-2 font-handwriting text-base">Want to peek inside right now?</p>
              <button
                onClick={onLogin}
                className="w-full py-2.5 px-4 rounded-xl bg-sage-light hover:bg-sage/20 text-sage-dark font-mono text-xs font-bold border border-sage/40 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <span>🌿 Quick Guest Preview</span>
              </button>
            </div>

            {/* Toggle Sign Up / Sign In */}
            <div className="mt-5 text-center">
              <p className="text-xs text-stone-500">
                {isSignUp ? 'Already registered?' : 'First time journaling?'}{' '}
                <button
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="font-bold text-terracotta hover:text-terracotta-dark underline cursor-pointer ml-1"
                >
                  {isSignUp ? 'Sign In Here' : 'Create Journal Account'}
                </button>
              </p>
            </div>

          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 border-t border-beige-dark/50 text-center text-xs text-stone-500 z-10 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p>© {new Date().getFullYear()} Explora • Digital Travel Scrapbooks</p>
        <p className="font-handwriting text-lg text-maroon">Made with ♡ for curious wanderers</p>
      </footer>

    </div>
  )
}
