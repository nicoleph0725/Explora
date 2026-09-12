import { useState, useRef } from 'react'
import TopEditingToolbar from './components/TopEditingToolbar'
import AssetSidebar from './components/AssetSidebar'
import ScrapbookCanvas from './components/ScrapbookCanvas'
import BottomFilmstrip from './components/BottomFilmstrip'

// Custom Hooks & Utilities
import { useScrapbookHistory } from './hooks/useScrapbookHistory'
import { useScrapbookAutosave } from './hooks/useScrapbookAutosave'
import { useElementTransform } from './hooks/useElementTransform'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { getPatternBg } from './utils/canvasPatterns'

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
  const [scrapbookTitle, setScrapbookTitle] = useState(scrapbook?.title || 'My Scrapbook')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(100)

  const canvasRef = useRef(null)
  const bottomScrollRef = useRef(null)
  const fileInputRef = useRef(null)

  // Keep fresh reference of pages synchronized on every render
  const pagesRef = useRef(pages)
  pagesRef.current = pages

  const activePage = pages[activePageIndex] || pages[0]
  const selectedElement = activePage?.elements.find((el) => el.id === selectedElementId)

  // 1. History & Undo/Redo Hook
  const {
    canUndo,
    canRedo,
    pushHistory,
    handleUndo,
    handleRedo,
    pagesBeforeTransformRef,
  } = useScrapbookHistory({
    initialPages: pages,
    pagesRef,
    setPages,
    setSelectedElementId,
  })

  // 2. Debounced Autosave Hook (LocalStorage + Backend DB)
  const { saveStatus } = useScrapbookAutosave({
    pages,
    scrapbookTitle,
    journalId,
    setJournalId,
    scrapbook,
  })

  // 3. Canvas Element Transform Hook (Drag, Rotate, Corner Resize)
  const {
    transformState,
    handleStartMove,
    handleStartRotate,
    handleStartResize,
  } = useElementTransform({
    pagesRef,
    setPages,
    activePageIndex,
    setSelectedElementId,
    zoomLevel,
    pushHistory,
    pagesBeforeTransformRef,
    canvasRef,
  })

  // ================= PAGE ACTIONS =================
  const handleAddNewPage = () => {
    const curPages = pagesRef.current
    const newPageNum = curPages.length + 1
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

    const updatedPages = [...curPages, newPage]
    pagesRef.current = updatedPages
    setPages(updatedPages)
    pushHistory(updatedPages)
    setActivePageIndex(updatedPages.length - 1)
    setSelectedElementId(null)

    setTimeout(() => {
      if (bottomScrollRef.current) {
        bottomScrollRef.current.scrollLeft = bottomScrollRef.current.scrollWidth
      }
    }, 100)
  }

  const handleDeletePage = (pageIdx, e) => {
    e?.stopPropagation()
    const curPages = pagesRef.current
    if (curPages.length <= 1) {
      alert('Your scrapbook must have at least one page!')
      return
    }

    const updated = curPages
      .filter((_, idx) => idx !== pageIdx)
      .map((p, idx) => ({ ...p, pageNumber: idx + 1 }))

    pagesRef.current = updated
    setPages(updated)
    pushHistory(updated)
    if (activePageIndex >= updated.length) {
      setActivePageIndex(updated.length - 1)
    } else if (activePageIndex === pageIdx) {
      setActivePageIndex(Math.max(0, pageIdx - 1))
    }
    setSelectedElementId(null)
  }

  const handleDuplicatePage = (pageIdx, e) => {
    e?.stopPropagation()
    const curPages = pagesRef.current
    const targetPage = curPages[pageIdx]
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
      ...curPages.slice(0, pageIdx + 1),
      duplicatedPage,
      ...curPages.slice(pageIdx + 1),
    ].map((p, idx) => ({ ...p, pageNumber: idx + 1 }))

    pagesRef.current = updated
    setPages(updated)
    pushHistory(updated)
    setActivePageIndex(pageIdx + 1)
    setSelectedElementId(null)
  }

  // ================= ELEMENT ACTIONS =================
  const addElementToPage = (newElData) => {
    const curPages = pagesRef.current
    const curActivePage = curPages[activePageIndex] || curPages[0]
    const maxZ = (curActivePage?.elements || []).reduce((acc, el) => Math.max(acc, el.zIndex || 1), 1)
    const newEl = {
      id: 'el-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      x: 180 + Math.floor(Math.random() * 80),
      y: 100 + Math.floor(Math.random() * 80),
      zIndex: maxZ + 1,
      rotation: 0,
      ...newElData,
    }

    const updated = curPages.map((pg, idx) => {
      if (idx !== activePageIndex) return pg
      return {
        ...pg,
        elements: [...pg.elements, newEl],
      }
    })
    pagesRef.current = updated
    setPages(updated)
    pushHistory(updated)
    setSelectedElementId(newEl.id)
  }

  const updateSelectedElement = (updates, targetId = selectedElementId) => {
    if (!targetId) return
    const curPages = pagesRef.current
    const updated = curPages.map((pg, idx) => {
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
    pagesRef.current = updated
    setPages(updated)
    pushHistory(updated)
  }

  const deleteSelectedElement = (targetId = selectedElementId) => {
    if (!targetId) return
    const curPages = pagesRef.current
    const updated = curPages.map((pg, idx) => {
      if (idx !== activePageIndex) return pg
      return {
        ...pg,
        elements: pg.elements.filter((el) => el.id !== targetId),
      }
    })
    pagesRef.current = updated
    setPages(updated)
    pushHistory(updated)
    if (selectedElementId === targetId) {
      setSelectedElementId(null)
    }
  }

  const changeLayer = (direction) => {
    if (!selectedElementId) return
    const curPages = pagesRef.current
    const updated = curPages.map((pg, idx) => {
      if (idx !== activePageIndex) return pg
      const currentEl = pg.elements.find((e) => e.id === selectedElementId)
      if (!currentEl) return pg

      const newZ = direction === 'up' ? (currentEl.zIndex || 1) + 2 : Math.max(1, (currentEl.zIndex || 1) - 2)
      return {
        ...pg,
        elements: pg.elements.map((el) => (el.id === selectedElementId ? { ...el, zIndex: newZ } : el)),
      }
    })
    pagesRef.current = updated
    setPages(updated)
    pushHistory(updated)
  }

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

  const handleDuplicateElement = (targetId = selectedElementId) => {
    if (!targetId) return
    const curPages = pagesRef.current
    const curActivePage = curPages[activePageIndex] || curPages[0]
    const currentEl = curActivePage?.elements.find((el) => el.id === targetId)
    if (!currentEl) return

    const maxZ = (curActivePage?.elements || []).reduce((acc, el) => Math.max(acc, el.zIndex || 1), 1)
    const newEl = {
      ...currentEl,
      id: 'el-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      x: (currentEl.x || 0) + 20,
      y: (currentEl.y || 0) + 20,
      zIndex: maxZ + 1,
    }

    const updated = curPages.map((pg, idx) => {
      if (idx !== activePageIndex) return pg
      return {
        ...pg,
        elements: [...pg.elements, newEl],
      }
    })
    pagesRef.current = updated
    setPages(updated)
    pushHistory(updated)
    setSelectedElementId(newEl.id)
  }

  // 4. Global Keyboard Shortcuts Hook
  useKeyboardShortcuts({
    selectedElementId,
    selectedElement,
    deleteSelectedElement,
    updateSelectedElement,
    handleDuplicateElement,
    handleUndo,
    handleRedo,
    setSelectedElementId,
  })

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
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={canUndo}
        canRedo={canRedo}
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

        {/* 3. MIDDLE CANVAS */}
        <ScrapbookCanvas
          zoomLevel={zoomLevel}
          activePage={activePage}
          pages={pages}
          selectedElementId={selectedElementId}
          setSelectedElementId={setSelectedElementId}
          transformState={transformState}
          onStartMove={handleStartMove}
          onStartResize={handleStartResize}
          onStartRotate={handleStartRotate}
          onDuplicateElement={handleDuplicateElement}
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
