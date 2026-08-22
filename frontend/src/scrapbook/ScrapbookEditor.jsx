import { useState, useRef, useEffect, useCallback } from 'react'
import TopEditingToolbar from './components/TopEditingToolbar'
import AssetSidebar from './components/AssetSidebar'
import ScrapbookCanvas from './components/ScrapbookCanvas'
import BottomFilmstrip from './components/BottomFilmstrip'
import { saveJournalPages, createJournal } from '../api'

export default function ScrapbookEditor({ scrapbook, onBack, user, onLogout }) {
  // Current Journal ID in database (or temporary ID)
  const [journalId, setJournalId] = useState(scrapbook?.id || null)

  // Scrapbook pages state
  const [pages, setPages] = useState(() => {
    if (scrapbook?.pages && scrapbook.pages.length > 0) {
      return JSON.parse(JSON.stringify(scrapbook.pages))
    }
    // Check localStorage cache first
    const cached = localStorage.getItem(`explora_scrapbook_${scrapbook?.id}`)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (parsed.pages && parsed.pages.length > 0) {
          return parsed.pages
        }
      } catch (e) {
        console.warn('Failed to parse cached journal:', e)
      }
    }
    // Default fallback single page
    return [
      {
        id: 'page-' + Date.now(),
        pageNumber: 1,
        title: 'My First Page',
        bgColor: '#FAF6F0',
        bgPattern: 'dots',
        elements: [
          {
            id: 'el-welcome-title',
            type: 'text',
            x: 200,
            y: 80,
            width: 360,
            text: scrapbook?.title || 'My Travel Journal',
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
    ]
  })

  const [activePageIndex, setActivePageIndex] = useState(0)
  const [selectedElementId, setSelectedElementId] = useState(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [activeSidebarTab, setActiveSidebarTab] = useState('photos') // 'photos' | 'stickers' | 'tapes' | 'ephemera'
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved' | 'saving' | 'error'
  const [scrapbookTitle, setScrapbookTitle] = useState(scrapbook?.title || 'My Scrapbook')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)

  // Dragging state
  const canvasRef = useRef(null)
  const [dragging, setDragging] = useState(null) // { id, startX, startY, origX, origY }
  const bottomScrollRef = useRef(null)
  const fileInputRef = useRef(null)
  const isInitialMount = useRef(true)

  const activePage = pages[activePageIndex] || pages[0]
  const selectedElement = activePage?.elements.find((el) => el.id === selectedElementId)

  // ================= REAL DEBOUNCED DATABASE AUTOSAVE =================
  useEffect(() => {
    // Skip autosaving on initial render load
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    setSaveStatus('saving')

    // Always backup to localStorage immediately (both single cache and user journals list)
    try {
      localStorage.setItem(
        `explora_scrapbook_${journalId || 'temp'}`,
        JSON.stringify({ title: scrapbookTitle, pages })
      )

      const existingJournals = JSON.parse(localStorage.getItem('explora_user_journals') || '[]')
      const targetId = journalId || scrapbook?.id || 'temp'
      const updatedJournalEntry = {
        id: targetId,
        title: scrapbookTitle,
        destination: scrapbook?.destination || scrapbook?.country || 'My Destination',
        country: scrapbook?.country || 'My Destination',
        date: scrapbook?.date || 'Aug 2026',
        coverImage: scrapbook?.coverImage || scrapbook?.cover_image_url || null,
        description: scrapbook?.description || 'Travel scrapbook memories',
        page_count: pages.length,
        pages,
        isCustom: true,
        updated_at: new Date().toISOString(),
      }
      const newJournalsList = [
        updatedJournalEntry,
        ...existingJournals.filter((j) => j.id !== targetId && j.id !== scrapbook?.id),
      ]
      localStorage.setItem('explora_user_journals', JSON.stringify(newJournalsList))
    } catch (err) {
      console.warn('LocalStorage backup error:', err)
    }

    // Debounce backend DB sync by 700ms
    const debounceTimer = setTimeout(async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        // Not logged in or offline: stored locally
        setSaveStatus('saved')
        return
      }

      try {
        // Validate if journalId is a valid UUID
        const isUUID =
          journalId &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            journalId
          )

        if (isUUID) {
          // Update existing journal in database
          await saveJournalPages(journalId, {
            title: scrapbookTitle,
            pages,
          })
          setSaveStatus('saved')
        } else {
          // Create new journal in database and receive new UUID
          const created = await createJournal({
            title: scrapbookTitle,
            destination: scrapbook?.destination || scrapbook?.country || 'My Destination',
            description: scrapbook?.description || 'Travel scrapbook journal',
            cover_image_url: scrapbook?.coverImage || scrapbook?.cover_image_url || null,
            pages,
          })
          if (created?.id) {
            const oldId = journalId || scrapbook?.id
            setJournalId(created.id)

            // Update ID in local storage list
            try {
              const localList = JSON.parse(localStorage.getItem('explora_user_journals') || '[]')
              const updatedList = localList.map((j) =>
                j.id === oldId ? { ...j, id: created.id, isDatabase: true } : j
              )
              localStorage.setItem('explora_user_journals', JSON.stringify(updatedList))
            } catch (e) {
              console.warn(e)
            }
          }
          setSaveStatus('saved')
        }
      } catch (err) {
        console.error('Database autosave error:', err)
        // If DB fails (e.g. backend offline), data is safely in localStorage
        setSaveStatus('error')
      }
    }, 700)

    return () => clearTimeout(debounceTimer)
  }, [pages, scrapbookTitle, journalId, scrapbook])

  // Mouse Move & Up handlers for dragging canvas elements
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!dragging || !canvasRef.current) return

      const deltaX = (e.clientX - dragging.startX) / (zoomLevel / 100)
      const deltaY = (e.clientY - dragging.startY) / (zoomLevel / 100)

      setPages((prevPages) =>
        prevPages.map((pg, pIdx) => {
          if (pIdx !== activePageIndex) return pg
          return {
            ...pg,
            elements: pg.elements.map((el) => {
              if (el.id === dragging.id) {
                return {
                  ...el,
                  x: Math.round(dragging.origX + deltaX),
                  y: Math.round(dragging.origY + deltaY),
                }
              }
              return el
            }),
          }
        })
      )
    }

    const handleMouseUp = () => {
      if (dragging) {
        setDragging(null)
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, activePageIndex, zoomLevel])

  // ================= PAGE ACTIONS =================
  const handleAddNewPage = () => {
    const newPageNum = pages.length + 1
    const newPage = {
      id: 'page-' + Date.now(),
      pageNumber: newPageNum,
      title: `Page ${newPageNum}`,
      bgColor: '#FAF6F0',
      bgPattern: 'plain',
      elements: [
        {
          id: `el-title-${Date.now()}`,
          type: 'text',
          x: 200,
          y: 40,
          width: 360,
          text: `Page ${newPageNum}: New Chapter`,
          fontFamily: 'Playfair Display',
          fontSize: 26,
          fontWeight: 'bold',
          color: '#722F37',
          textAlign: 'center',
          rotation: 0,
          zIndex: 1,
        },
      ],
    }

    const updatedPages = [...pages, newPage]
    setPages(updatedPages)
    setActivePageIndex(updatedPages.length - 1)
    setSelectedElementId(null)

    // Scroll bottom bar to new page
    setTimeout(() => {
      if (bottomScrollRef.current) {
        bottomScrollRef.current.scrollLeft = bottomScrollRef.current.scrollWidth
      }
    }, 100)
  }

  const handleDeletePage = (pageIdx, e) => {
    e?.stopPropagation()
    if (pages.length <= 1) {
      alert('Your scrapbook must have at least one page!')
      return
    }

    const updated = pages
      .filter((_, idx) => idx !== pageIdx)
      .map((p, idx) => ({ ...p, pageNumber: idx + 1 }))

    setPages(updated)
    if (activePageIndex >= updated.length) {
      setActivePageIndex(updated.length - 1)
    } else if (activePageIndex === pageIdx) {
      setActivePageIndex(Math.max(0, pageIdx - 1))
    }
    setSelectedElementId(null)
  }

  const handleDuplicatePage = (pageIdx, e) => {
    e?.stopPropagation()
    const targetPage = pages[pageIdx]
    const duplicatedElements = targetPage.elements.map((el) => ({
      ...el,
      id: 'el-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
    }))

    const duplicatedPage = {
      ...targetPage,
      id: 'page-' + Date.now(),
      pageNumber: pageIdx + 2,
      title: `${targetPage.title} (Copy)`,
      elements: duplicatedElements,
    }

    const updated = [
      ...pages.slice(0, pageIdx + 1),
      duplicatedPage,
      ...pages.slice(pageIdx + 1),
    ].map((p, idx) => ({ ...p, pageNumber: idx + 1 }))

    setPages(updated)
    setActivePageIndex(pageIdx + 1)
    setSelectedElementId(null)
  }

  // ================= ELEMENT ACTIONS =================
  const addElementToPage = (newElData) => {
    const maxZ = activePage.elements.reduce((acc, el) => Math.max(acc, el.zIndex || 1), 1)
    const newEl = {
      id: 'el-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      x: 180 + Math.floor(Math.random() * 80),
      y: 100 + Math.floor(Math.random() * 80),
      zIndex: maxZ + 1,
      rotation: 0,
      ...newElData,
    }

    setPages((prev) =>
      prev.map((pg, idx) => {
        if (idx !== activePageIndex) return pg
        return {
          ...pg,
          elements: [...pg.elements, newEl],
        }
      })
    )
    setSelectedElementId(newEl.id)
  }

  const updateSelectedElement = (updates, targetId = selectedElementId) => {
    if (!targetId) return
    setPages((prev) =>
      prev.map((pg, idx) => {
        if (idx !== activePageIndex) return pg
        return {
          ...pg,
          elements: pg.elements.map((el) => {
            if (el.id === targetId) {
              return { ...el, ...updates }
            }
            return el
          }),
        }
      })
    )
  }

  const deleteSelectedElement = (targetId = selectedElementId) => {
    if (!targetId) return
    setPages((prev) =>
      prev.map((pg, idx) => {
        if (idx !== activePageIndex) return pg
        return {
          ...pg,
          elements: pg.elements.filter((el) => el.id !== targetId),
        }
      })
    )
    if (selectedElementId === targetId) {
      setSelectedElementId(null)
    }
  }

  const changeLayer = (direction) => {
    if (!selectedElementId) return
    setPages((prev) =>
      prev.map((pg, idx) => {
        if (idx !== activePageIndex) return pg
        const currentEl = pg.elements.find((e) => e.id === selectedElementId)
        if (!currentEl) return pg

        const newZ = direction === 'up' ? (currentEl.zIndex || 1) + 2 : Math.max(1, (currentEl.zIndex || 1) - 2)
        return {
          ...pg,
          elements: pg.elements.map((el) => (el.id === selectedElementId ? { ...el, zIndex: newZ } : el)),
        }
      })
    )
  }

  // Handle Photo Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const imgUrl = event.target.result
      addElementToPage({
        type: 'polaroid',
        imageUrl: imgUrl,
        caption: file.name.replace(/\.[^/.]+$/, ''),
        width: 260,
        fontFamily: 'Caveat',
        rotation: Math.floor(Math.random() * 8) - 4,
      })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  // Background pattern CSS styles
  const getPatternBg = (pattern, color) => {
    switch (pattern) {
      case 'dots':
        return {
          backgroundColor: color,
          backgroundImage: 'radial-gradient(rgba(114, 47, 55, 0.12) 1.5px, transparent 1.5px)',
          backgroundSize: '20px 20px',
        }
      case 'lines':
        return {
          backgroundColor: color,
          backgroundImage: 'linear-gradient(rgba(114, 47, 55, 0.1) 1px, transparent 1px)',
          backgroundSize: '100% 24px',
        }
      case 'grid':
        return {
          backgroundColor: color,
          backgroundImage:
            'linear-gradient(rgba(88, 123, 102, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(88, 123, 102, 0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }
      case 'plain':
      default:
        return { backgroundColor: color }
    }
  }

  return (
    <div className="min-h-screen bg-stone-900 text-stone-800 flex flex-col font-sans select-none overflow-hidden h-screen">
      {/* 1. TOP EDITING TOOLBAR */}
      <TopEditingToolbar
        scrapbookTitle={scrapbookTitle}
        setScrapbookTitle={setScrapbookTitle}
        isEditingTitle={isEditingTitle}
        setIsEditingTitle={setIsEditingTitle}
        onBack={onBack}
        saveStatus={saveStatus}
        selectedElement={selectedElement}
        updateSelectedElement={updateSelectedElement}
        deleteSelectedElement={() => deleteSelectedElement(selectedElementId)}
        changeLayer={changeLayer}
        activePage={activePage}
        setPages={setPages}
        activePageIndex={activePageIndex}
        addElementToPage={addElementToPage}
        zoomLevel={zoomLevel}
        setZoomLevel={setZoomLevel}
      />

      {/* MAIN WORKSPACE AREA */}
      <div className="flex-1 flex overflow-hidden relative bg-[#23201d]">
        {/* 2. LEFT ASSET SIDEBAR */}
        <AssetSidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          activeSidebarTab={activeSidebarTab}
          setActiveSidebarTab={setActiveSidebarTab}
          addElementToPage={addElementToPage}
          fileInputRef={fileInputRef}
          handlePhotoUpload={handlePhotoUpload}
        />

        {/* 3. MIDDLE CANVAS & SMALL PLUS BUTTON */}
        <ScrapbookCanvas
          zoomLevel={zoomLevel}
          activePage={activePage}
          pages={pages}
          selectedElementId={selectedElementId}
          setSelectedElementId={setSelectedElementId}
          dragging={dragging}
          setDragging={setDragging}
          canvasRef={canvasRef}
          updateSelectedElement={updateSelectedElement}
          deleteSelectedElement={deleteSelectedElement}
          onAddNewPage={handleAddNewPage}
          getPatternBg={getPatternBg}
        />
      </div>

      {/* 4. BOTTOM PAGE FILMSTRIP */}
      <BottomFilmstrip
        pages={pages}
        activePageIndex={activePageIndex}
        setActivePageIndex={setActivePageIndex}
        setSelectedElementId={setSelectedElementId}
        bottomScrollRef={bottomScrollRef}
        handleDuplicatePage={handleDuplicatePage}
        handleDeletePage={handleDeletePage}
        handleAddNewPage={handleAddNewPage}
      />
    </div>
  )
}
