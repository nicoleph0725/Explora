export default function Navbar(props) {
  const nameToDisplay = props.user?.full_name || localStorage.getItem('user_full_name')

  return (
    <header className="sticky top-0 z-50 w-full bg-beige-light/80 backdrop-blur-md border-b border-beige-dark/50 shadow-sm">
      <nav className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-2 cursor-pointer group">
          <span className="font-serif text-2xl font-bold tracking-tight text-maroon group-hover:text-maroon-dark transition-colors duration-205">Explora</span>
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
        </div>
        <div className="flex items-center gap-4">
          <button id="new-entry-btn" className="hidden sm:inline-flex items-center justify-center">
            + New Entry
          </button>
          <ul className="flex items-center gap-2">
            <li className="nav-item rounded-md hover:bg-beige-medium/50">About</li>
            <li className="nav-item rounded-md hover:bg-beige-medium/50">Profile</li>
            {nameToDisplay && (
              <li className="hidden sm:inline-flex items-center px-3 py-1 rounded-full bg-parchment border border-beige-dark text-xs font-mono text-maroon-dark font-semibold shadow-2xs">
                👤 {nameToDisplay}
              </li>
            )}
            {props.onLogout && (
              <li>
                <button
                  onClick={props.onLogout}
                  className="text-xs font-semibold text-stone-500 hover:text-maroon px-3 py-1.5 rounded-lg border border-beige-dark/60 hover:bg-beige-medium/60 transition-all cursor-pointer"
                >
                  Sign Out
                </button>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </header>
  )
}