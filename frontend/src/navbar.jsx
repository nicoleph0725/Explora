import { useState } from 'react'

export default function Navbar() {
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
          <ul className="flex items-center gap-1">
            <li className="nav-item rounded-md hover:bg-beige-medium/50">About</li>
            <li className="nav-item rounded-md hover:bg-beige-medium/50">Profile</li>
          </ul>
        </div>
      </nav>
    </header>
  )
}