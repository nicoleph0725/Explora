import { useState, useEffect, useCallback } from 'react'
import Navbar from './navbar'
import shanghaiCover from './assets/shanghai_cover.jpeg'
import TokyoCover from './assets/tokyo_cover.jpeg'
import scrapbookCover from './assets/scrapbook_cover.jpg'
import { getCurrentUser, getJournals, deleteJournal as apiDeleteJournal, createJournal } from './api'
import { DEFAULT_SCRAPBOOKS } from './scrapbook/scrapbookData'

export default function Homepage(props) {
  const [user, setUser] = useState(null)
  const [journals, setJournals] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Load all journals for the logged-in user (from Backend Database + User-Scoped Cache)
  const loadAllJournals = useCallback(async () => {
    setIsLoading(true)

    const token = localStorage.getItem('token')
    if (!token) {
      setJournals([])
      setIsLoading(false)
      return
    }

    let dbJournals = []
    try {
      const remoteData = await getJournals()
      if (Array.isArray(remoteData)) {
        dbJournals = remoteData
      }
    } catch (err) {
      console.warn('Could not fetch database journals:', err)
    }

    // Read user-scoped local fallback if offline
    let localJournals = []
    try {
      const savedLocal = localStorage.getItem('explora_user_journals')
      if (savedLocal) {
        localJournals = JSON.parse(savedLocal)
      }
    } catch (e) {
      console.warn('Failed to parse local journals:', e)
    }

    // Merge: DB journals take priority, overlaying any unique local drafts
    const mergedMap = new Map()

    localJournals.forEach((item) => {
      if (item && item.id) {
        mergedMap.set(item.id, { ...item, isCustom: true })
      }
    })

    dbJournals.forEach((item) => {
      if (item && item.id) {
        mergedMap.set(item.id, { ...item, isDatabase: true })
      }
    })

    const allList = Array.from(mergedMap.values()).sort((a, b) => {
      const dateA = new Date(a.updated_at || a.created_at || 0)
      const dateB = new Date(b.updated_at || b.created_at || 0)
      return dateB - dateA
    })

    setJournals(allList)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    // Fetch profile
    const fetchProfile = async () => {
      const token = localStorage.getItem('token')
      if (!token) return
      try {
        const userData = await getCurrentUser()
        setUser(userData)
        if (userData?.full_name) {
          localStorage.setItem('user_full_name', userData.full_name)
        }
      } catch (err) {
        console.error('Failed to fetch user profile:', err)
      }
    }

    fetchProfile()
    loadAllJournals()
  }, [loadAllJournals])

  const storedName = localStorage.getItem('user_full_name')
  const fullName = user?.full_name || storedName || (user?.email ? user.email : null)

  const handleOpenExisting = (scrapbook) => {
    if (props.onOpenScrapbook) {
      props.onOpenScrapbook(scrapbook)
    }
  }

  const handleCreateNew = async () => {
    const newId = 'journal-' + Date.now()
    const newJournal = {
      id: newId,
      title: 'New Travel Journal',
      destination: 'My Destination',
      country: 'My Destination',
      date: 'Aug 2026',
      coverImage: scrapbookCover,
      cover_image_url: scrapbookCover,
      description: 'Start documenting your new adventures, photos, and polaroids.',
      pages: [
        {
          id: 'p1-' + Date.now(),
          pageNumber: 1,
          title: 'First Memory',
          bgColor: '#FAF6F0',
          bgPattern: 'dots',
          elements: [
            {
              id: 'el-welcome-title',
              type: 'text',
              x: 200,
              y: 80,
              width: 360,
              text: 'New Travel Journal',
              fontFamily: 'Playfair Display',
              fontSize: 32,
              fontWeight: 'bold',
              color: '#722F37',
              textAlign: 'center',
              rotation: 0,
              zIndex: 1,
            },
            {
              id: 'el-welcome-note',
              type: 'text',
              x: 180,
              y: 160,
              width: 400,
              text: 'Click items from the left sidebar to add photos, stickers, and notes! Drag them anywhere on the page.',
              fontFamily: 'Caveat',
              fontSize: 22,
              color: '#555',
              textAlign: 'center',
              rotation: 0,
              zIndex: 2,
            },
          ],
        },
      ],
    }

    // Save to local storage right away so it immediately appears
    try {
      const existingLocal = JSON.parse(localStorage.getItem('explora_user_journals') || '[]')
      const updatedLocal = [newJournal, ...existingLocal.filter((j) => j.id !== newId)]
      localStorage.setItem('explora_user_journals', JSON.stringify(updatedLocal))
    } catch (e) {
      console.warn('Failed to cache new journal:', e)
    }

    // Attempt to create in Database if online & logged in
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const created = await createJournal({
          title: newJournal.title,
          destination: newJournal.destination,
          description: newJournal.description,
          cover_image_url: null,
          pages: newJournal.pages,
        })
        if (created && created.id) {
          newJournal.id = created.id
        }
      } catch (err) {
        console.warn('Could not immediately create DB journal, will sync on edit:', err)
      }
    }

    // Open editor
    if (props.onOpenScrapbook) {
      props.onOpenScrapbook(newJournal)
    }
  }

  const handleDeleteJournal = async (journalId, e) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this scrapbook journal?')) {
      return
    }

    // 1. Remove from local storage
    try {
      const existingLocal = JSON.parse(localStorage.getItem('explora_user_journals') || '[]')
      const updatedLocal = existingLocal.filter((j) => j.id !== journalId)
      localStorage.setItem('explora_user_journals', JSON.stringify(updatedLocal))
    } catch (err) {
      console.warn('Failed to update local storage on delete:', err)
    }

    // 2. Remove from Database if UUID
    const isUUID =
      journalId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        journalId
      )

    if (isUUID) {
      try {
        await apiDeleteJournal(journalId)
      } catch (err) {
        console.warn('Failed to delete journal from database:', err)
      }
    }

    // 3. Update state
    setJournals((prev) => prev.filter((j) => j.id !== journalId))
  }

  return (
    <div className="min-h-screen bg-beige-light pb-20 font-sans relative overflow-hidden">
      {/* Background Decorative Accents */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-terracotta/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 left-10 w-80 h-80 rounded-full bg-sage/10 blur-3xl pointer-events-none"></div>

      <Navbar onLogout={props.onLogout} onNewEntry={handleCreateNew} user={user} />

      <main className="max-w-5xl mx-auto px-6 pt-10">
        {/* Header Banner */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-dashed border-beige-dark">
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-parchment border border-beige-dark text-xs font-mono text-terracotta shadow-2xs">
                <span>📍 Explorer Dashboard</span>
              </div>

              {fullName && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-light border border-sage/40 text-xs font-mono text-sage-dark shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-sage animate-pulse"></span>
                  <span>
                    Logged in as: <strong className="font-sans font-bold text-maroon-dark">{fullName}</strong>
                  </span>
                </div>
              )}
            </div>

            {fullName && (
              <p className="font-handwriting text-2xl sm:text-3xl text-terracotta font-bold mb-1">
                Welcome back, {fullName}! 👋
              </p>
            )}

            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-maroon-dark tracking-tight">
              My Travel Scrapbooks
            </h1>
            <p className="font-handwriting text-xl text-stone-600 mt-1">
              Documenting your journey across the globe, one memory at a time.
            </p>
          </div>

          <button
            onClick={handleCreateNew}
            className="self-start md:self-auto h-11 px-6 rounded-full bg-maroon hover:bg-maroon-dark text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer flex items-center gap-2 border border-maroon-dark transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="text-gold font-mono text-base">+</span>
            <span>New Scrapbook</span>
          </button>
        </div>

        {/* Main Journals Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journals.map((scrapbook, idx) => {
            const isCustom = scrapbook.isCustom || scrapbook.isDatabase
            const coverImg =
              scrapbook.cover_image_url ||
              scrapbook.coverImage ||
              (scrapbook.id === 'shanghai'
                ? shanghaiCover
                : scrapbook.id === 'tokyo'
                ? TokyoCover
                : scrapbookCover)

            const pageCount =
              scrapbook.page_count ||
              (scrapbook.pages ? scrapbook.pages.length : 1)

            return (
              <div
                key={scrapbook.id || idx}
                onClick={() => handleOpenExisting(scrapbook)}
                className={`polaroid-card bg-parchment rounded-xl shadow-md hover:shadow-xl border border-beige-dark p-4 relative group cursor-pointer transform hover:-translate-y-1 transition-all duration-300 ${
                  idx % 2 === 1 ? 'rotate-[1deg]' : 'rotate-[-1deg]'
                }`}
              >
                <div
                  className={`w-20 h-5 washi-tape absolute -top-2.5 left-1/2 -translate-x-1/2 z-10 ${
                    idx % 2 === 1 ? 'rotate-[3deg]' : 'rotate-[-2deg]'
                  }`}
                ></div>

                {/* Delete Button for custom journals */}
                {isCustom && (
                  <button
                    onClick={(e) => handleDeleteJournal(scrapbook.id, e)}
                    className="absolute top-3 right-3 z-20 w-7 h-7 rounded-full bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer"
                    title="Delete Journal"
                  >
                    🗑️
                  </button>
                )}

                <div className="relative aspect-4/3 rounded-lg overflow-hidden bg-stone-200 mb-3">
                  <img
                    src={coverImg}
                    alt={scrapbook.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    style={{ objectPosition: 'center 30%' }}
                  />
                  <span className="absolute top-2 left-2 bg-maroon/90 text-white font-mono text-[10px] px-2 py-0.5 rounded shadow-xs">
                    {pageCount} {pageCount === 1 ? 'PAGE' : 'PAGES'}
                  </span>

                  {isCustom && (
                    <span className="absolute bottom-2 left-2 bg-sage/90 text-white font-mono text-[9px] px-2 py-0.5 rounded shadow-xs">
                      ★ MY SCRAPBOOK
                    </span>
                  )}
                </div>

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-serif font-bold text-lg text-maroon-dark group-hover:text-terracotta transition-colors">
                      {scrapbook.title}
                    </h3>
                    <p className="text-xs text-stone-500 font-sans">
                      {scrapbook.destination || scrapbook.country || 'Travel Journal'} •{' '}
                      {scrapbook.date || '2026'}
                    </p>
                  </div>
                  <div className="passport-stamp text-[8px] w-10 h-10 p-0 leading-none shrink-0 border-sage text-sage rotate-[-6deg]">
                    <span>EXPLORA</span>
                  </div>
                </div>

                <p className="font-handwriting text-base text-stone-600 mt-2 line-clamp-2">
                  "{scrapbook.description || 'Memories, photos and adventures captured across the world.'}"
                </p>

                <div className="mt-3 pt-3 border-t border-dashed border-beige-dark flex items-center justify-between text-xs font-mono text-terracotta group-hover:text-maroon font-semibold">
                  <span>Open Scrapbook</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            )
          })}

          {/* Empty Add Scrapbook Card */}
          <div
            onClick={handleCreateNew}
            className="border-2 border-dashed border-beige-dark rounded-xl p-8 flex flex-col items-center justify-center text-center bg-parchment/50 hover:bg-parchment hover:border-terracotta transition-all duration-200 cursor-pointer min-h-[280px] group"
          >
            <div className="w-12 h-12 rounded-full bg-beige-medium group-hover:bg-terracotta/10 flex items-center justify-center text-terracotta text-xl mb-3 shadow-xs font-bold transition-transform group-hover:scale-110">
              +
            </div>
            <h4 className="font-serif font-bold text-maroon-dark text-base group-hover:text-terracotta transition-colors">
              Create New Journal
            </h4>
            <p className="font-handwriting text-base text-stone-500 mt-1 max-w-[200px]">
              Start a new freeform canvas with polaroids, washi tape & stickers.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
