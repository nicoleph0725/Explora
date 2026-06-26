import { useState, useEffect } from 'react'
import Navbar from './navbar'
import api from './api'

export default function Homepage() {
  const [fruits, setFruits] = useState([])
  const [newFruit, setNewFruit] = useState('')
  const [error, setError] = useState(null)
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    api.get('/fruits')
      .then(res => {
        setFruits(res.data.fruits || [])
        setError(null)
        setIsOffline(false)
      })
      .catch(err => {
        console.error('Could not connect to backend:', err)
        setIsOffline(true)
        setError('Backend is offline. Running in Local Mode (changes will not save).')
      })
  }, [])

  const addFruit = (e) => {
    e.preventDefault()
    if (!newFruit.trim()) return

    const newFruitItem = { name: newFruit.trim() }

    api.post('/fruits', newFruitItem)
      .then(res => {
        setFruits([...fruits, res.data])
        setNewFruit('')
        setError(null)
        setIsOffline(false)
      })
      .catch(err => {
        console.error('Failed to post to backend:', err)
        // Fallback: Add locally so the UI still works
        setFruits([...fruits, newFruitItem])
        setNewFruit('')
        setIsOffline(true)
        setError('Backend is offline. Fruit added locally only.')
      })
  }

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

        <section className="mt-12 ml-4 max-w-md">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-xl font-bold font-sans text-stone-955">Fruit List</h2>
            {isOffline && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-200">
                Local Mode
              </span>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded text-xs">
              {error}
            </div>
          )}
          
          <form onSubmit={addFruit} className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Enter fruit name"
              value={newFruit}
              onChange={e => setNewFruit(e.target.value)}
              className="flex-1 px-3 py-2 border rounded text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-indigo text-white text-sm font-bold rounded cursor-pointer hover:opacity-90"
            >
              Add Fruit
            </button>
          </form>

          {fruits.length === 0 ? (
            <p className="text-sm text-stone-400 italic">No fruits added yet.</p>
          ) : (
            <ul className="space-y-2">
              {fruits.map((fruit, index) => (
                <li key={index} className="p-3 bg-stone-50 border rounded text-sm text-stone-800 flex justify-between items-center">
                  <span>{fruit.name}</span>
                  {isOffline && <span className="text-[10px] text-stone-400 italic">temporary</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
    </main>
  )
}
