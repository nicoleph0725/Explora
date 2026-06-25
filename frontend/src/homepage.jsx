import { useState } from 'react'
import Navbar from './navbar'

export default function Homepage() {
  return (
    <main>
        <Navbar />
        <section>
          <div className="mt-16 ml-4">
            <h1 className="text-3xl font-bold font-sans text-stone-900 mb-2">My Travels</h1>
            <p className="text-sm font-sans text-stone-500 italic">
              Documenting your journey, one place at a time
            </p>
          </div>
        </section>
    </main>
  )
}
  
