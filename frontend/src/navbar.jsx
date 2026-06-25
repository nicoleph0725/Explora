import { useState } from 'react'

export default function Navbar() {
  return (
    <header>
            <nav className="flex bg-white items-center justify-end h-15 drop-shadow-sm">
              <div>
                  <button id="new-entry-btn">+ New Entry</button>
              </div>
                <ul className="flex mr-2">
                    <li className="nav-item">About</li>
                    <li className="nav-item">Profile</li>
                </ul>
            </nav>
        </header>
  )
}