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

  // Unified transform state: 'move' | 'resize' | 'rotate'
  const canvasRef = useRef(null)
  const [transformState, setTransformState] = useState(null)
  const bottomScrollRef = useRef(null)
  const fileInputRef = useRef(null)
  const isInitialMount = useRef(true)

  // Keep fresh reference of pages synchronized on every render
  const pagesRef = useRef(pages)
  pagesRef.current = pages

  const activePage = pages[activePageIndex] || pages[0]
  const selectedElement = activePage?.elements.find((el) => el.id === selectedElementId)

  // ================= REAL DEBOUNCED DATABASE & LOCALSTORAGE AUTOSAVE =================
  useEffect(() => {
    // Skip autosaving on initial render load
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    setSaveStatus('saving')

    // Debounce both localStorage backup and backend DB sync by 700ms
    const debounceTimer = setTimeout(async () => {
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

      const token = localStorage.getItem('token')
      if (!token) {
        setSaveStatus('saved')
        return
      }

      try {
        const isUUID =
          journalId &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            journalId
          )

        if (isUUID) {
          await saveJournalPages(journalId, {
            title: scrapbookTitle,
            pages,
          })
          setSaveStatus('saved')
        } else {
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
        if (err.response?.status === 401) {
          localStorage.removeItem('token')
          setSaveStatus('saved')
        } else {
          console.warn('Backend sync note (operating in local cache):', err?.message || err)
          setSaveStatus('error')
        }
      }
    }, 700)

    return () => clearTimeout(debounceTimer)
  }, [pages, scrapbookTitle, journalId, scrapbook])

  // ================= SYNCHRONOUS REF-BASED UNDO / REDO HISTORY SYSTEM =================
  const historyRef = useRef([JSON.parse(JSON.stringify(pages))])
  const historyIndexRef = useRef(0)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const pagesBeforeTransformRef = useRef(null)

  const updateUndoRedoState = useCallback(() => {
    setCanUndo(historyIndexRef.current > 0)
    setCanRedo(historyIndexRef.current < historyRef.current.length - 1)
  }, [])

  const pushHistory = useCallback(
    (newPages) => {
      const currentHistory = historyRef.current
      const currentIndex = historyIndexRef.current
      const serializedNew = JSON.stringify(newPages)
      const serializedCur = JSON.stringify(currentHistory[currentIndex])

      // If identical, don't record duplicate step
      if (serializedNew === serializedCur) return

      // Truncate any redo steps ahead
      const trimmed = currentHistory.slice(0, currentIndex + 1)
      trimmed.push(JSON.parse(serializedNew))

      // Keep at most 50 steps
      if (trimmed.length > 50) {
        trimmed.shift()
      }

      historyRef.current = trimmed
      historyIndexRef.current = trimmed.length - 1
      updateUndoRedoState()
    },
    [updateUndoRedoState]
  )

  const handleUndo = useCallback(() => {
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current -= 1
    const targetState = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]))
    pagesRef.current = targetState
    setPages(targetState)
    setSelectedElementId(null)
    updateUndoRedoState()
  }, [updateUndoRedoState])

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current += 1
    const targetState = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]))
    pagesRef.current = targetState
    setPages(targetState)
    setSelectedElementId(null)
    updateUndoRedoState()
  }, [updateUndoRedoState])

  // ================= TRANSFORM START HANDLERS =================
  const handleStartMove = useCallback(
    (e, el, shouldDrag = true) => {
      // Automatically bring clicked element to the top layer
      const curPages = pagesRef.current
      const curActivePage = curPages[activePageIndex] || curPages[0]
      const maxZ = (curActivePage?.elements || []).reduce(
        (acc, item) => Math.max(acc, item.zIndex || 1),
        1
      )
      const newZ = maxZ + 1

      const updated = curPages.map((pg, pIdx) => {
        if (pIdx !== activePageIndex) return pg
        return {
          ...pg,
          elements: pg.elements.map((item) =>
            item.id === el.id ? { ...item, zIndex: newZ } : item
          ),
        }
      })
      pagesRef.current = updated
      setPages(updated)

      setSelectedElementId(el.id)

      if (shouldDrag) {
        pagesBeforeTransformRef.current = JSON.parse(JSON.stringify(pagesRef.current))
        setTransformState({
          type: 'move',
          id: el.id,
          startX: e.clientX,
          startY: e.clientY,
          origX: el.x || 0,
          origY: el.y || 0,
        })
      }
    },
    [activePageIndex]
  )

  const handleStartRotate = useCallback(
    (e, el, elementRef) => {
      e.stopPropagation()
      if (!elementRef?.current) return

      pagesBeforeTransformRef.current = JSON.parse(JSON.stringify(pagesRef.current))

      // Bring to top layer
      const curPages = pagesRef.current
      const curActivePage = curPages[activePageIndex] || curPages[0]
      const maxZ = (curActivePage?.elements || []).reduce(
        (acc, item) => Math.max(acc, item.zIndex || 1),
        1
      )
      const newZ = maxZ + 1

      const updated = curPages.map((pg, pIdx) => {
        if (pIdx !== activePageIndex) return pg
        return {
          ...pg,
          elements: pg.elements.map((item) =>
            item.id === el.id ? { ...item, zIndex: newZ } : item
          ),
        }
      })
      pagesRef.current = updated
      setPages(updated)

      const rect = elementRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)

      setSelectedElementId(el.id)
      setTransformState({
        type: 'rotate',
        id: el.id,
        centerX,
        centerY,
        startAngle,
        origRotation: el.rotation || 0,
      })
    },
    [activePageIndex]
  )

  const handleStartResize = useCallback(
    (e, handle, el, elementRef) => {
      e.stopPropagation()
      if (!elementRef?.current) return

      pagesBeforeTransformRef.current = JSON.parse(JSON.stringify(pagesRef.current))

      // Bring to top layer
      const curPages = pagesRef.current
      const curActivePage = curPages[activePageIndex] || curPages[0]
      const maxZ = (curActivePage?.elements || []).reduce(
        (acc, item) => Math.max(acc, item.zIndex || 1),
        1
      )
      const newZ = maxZ + 1

      const updated = curPages.map((pg, pIdx) => {
        if (pIdx !== activePageIndex) return pg
        return {
          ...pg,
          elements: pg.elements.map((item) =>
            item.id === el.id ? { ...item, zIndex: newZ } : item
          ),
        }
      })
      pagesRef.current = updated
      setPages(updated)

      const domEl = elementRef.current
    const origW = el.width || domEl.offsetWidth || 100
    const origH = el.height || domEl.offsetHeight || 100
    const origRot = el.rotation || 0
    const rad = (origRot * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)

    const origCx = (el.x || 0) + origW / 2
    const origCy = (el.y || 0) + origH / 2

    const hw = origW / 2
    const hh = origH / 2

    let anchorLx = 0
    let anchorLy = 0
    let handleLx = 0
    let handleLy = 0

    if (handle === 'se') {
      anchorLx = -hw; anchorLy = -hh // Fixed Anchor: Top-Left
      handleLx = hw;  handleLy = hh  // Drag Handle: Bottom-Right
    } else if (handle === 'sw') {
      anchorLx = hw;  anchorLy = -hh // Fixed Anchor: Top-Right
      handleLx = -hw; handleLy = hh  // Drag Handle: Bottom-Left
    } else if (handle === 'ne') {
      anchorLx = -hw; anchorLy = hh  // Fixed Anchor: Bottom-Left
      handleLx = hw;  handleLy = -hh // Drag Handle: Top-Right
    } else if (handle === 'nw') {
      anchorLx = hw;  anchorLy = hh  // Fixed Anchor: Bottom-Right
      handleLx = -hw; handleLy = -hh // Drag Handle: Top-Left
    }

    // Exact canvas coordinate of the opposite anchor corner
    const anchorAx = origCx + (anchorLx * cos - anchorLy * sin)
    const anchorAy = origCy + (anchorLx * sin + anchorLy * cos)

    // Diagonal direction vector v0 from Anchor to Handle in canvas space
    const handlePosCanvasX = origCx + (handleLx * cos - handleLy * sin)
    const handlePosCanvasY = origCy + (handleLx * sin + handleLy * cos)
    const v0x = handlePosCanvasX - anchorAx
    const v0y = handlePosCanvasY - anchorAy
    const L0sq = Math.max(1, v0x * v0x + v0y * v0y)

    setSelectedElementId(el.id)
    setTransformState({
      type: 'resize',
      id: el.id,
      handle,
      origW,
      origH,
      cos,
      sin,
      anchorAx,
      anchorAy,
      v0x,
      v0y,
      L0sq,
      anchorLx,
      anchorLy,
    })
  }, [])

  // ================= MOUSE MOVE & UP TRANSFORM HANDLERS =================
  const animFrameRef = useRef(null)

  useEffect(() => {
    if (!transformState) return

    const handleMouseMove = (e) => {
      if (!transformState || !canvasRef.current) return

      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }

      const clientX = e.clientX
      const clientY = e.clientY
      const shiftKey = e.shiftKey

      animFrameRef.current = requestAnimationFrame(() => {
        const scale = zoomLevel / 100

        // 1. DRAG MOVE ELEMENT
        if (transformState.type === 'move') {
          const deltaX = (clientX - transformState.startX) / scale
          const deltaY = (clientY - transformState.startY) / scale

          const updated = pagesRef.current.map((pg, pIdx) => {
            if (pIdx !== activePageIndex) return pg
            return {
              ...pg,
              elements: pg.elements.map((el) => {
                if (el.id === transformState.id) {
                  return {
                    ...el,
                    x: Math.round(transformState.origX + deltaX),
                    y: Math.round(transformState.origY + deltaY),
                  }
                }
                return el
              }),
            }
          })
          pagesRef.current = updated
          setPages(updated)
        }

        // 2. DRAG ROTATE ELEMENT
        else if (transformState.type === 'rotate') {
          const currentAngle =
            Math.atan2(
              clientY - transformState.centerY,
              clientX - transformState.centerX
            ) * (180 / Math.PI)

          const angleDelta = currentAngle - transformState.startAngle
          let newRotation = transformState.origRotation + angleDelta

          if (shiftKey) {
            newRotation = Math.round(newRotation / 15) * 15
          } else {
            newRotation = Math.round(newRotation)
          }

          // Normalize to [-180, 180]
          newRotation = ((((newRotation + 180) % 360) + 360) % 360) - 180

          const updated = pagesRef.current.map((pg, pIdx) => {
            if (pIdx !== activePageIndex) return pg
            return {
              ...pg,
              elements: pg.elements.map((el) => {
                if (el.id === transformState.id) {
                  return {
                    ...el,
                    rotation: newRotation,
                  }
                }
                return el
              }),
            }
          })
          pagesRef.current = updated
          setPages(updated)
        }

        // 3. DRAG CORNER RESIZE (ANCHOR-PINNED DIAGONAL PROJECTION)
        else if (transformState.type === 'resize') {
          if (!canvasRef.current) return
          const canvasRect = canvasRef.current.getBoundingClientRect()
          const mouseCanvasX = (clientX - canvasRect.left) / scale
          const mouseCanvasY = (clientY - canvasRect.top) / scale

          const {
            origW,
            origH,
            cos,
            sin,
            anchorAx,
            anchorAy,
            v0x,
            v0y,
            L0sq,
            anchorLx,
            anchorLy,
          } = transformState

          // Vector from Anchor A to mouse
          const dx = mouseCanvasX - anchorAx
          const dy = mouseCanvasY - anchorAy

          // Project (dx, dy) onto diagonal vector v0
          const proj = (dx * v0x + dy * v0y) / L0sq
          const scaleFactor = Math.max(0.2, proj)

          const newW = Math.max(30, Math.round(origW * scaleFactor))
          const newH = Math.max(20, Math.round(origH * scaleFactor))

          // In the new state, anchor A is at offset (anchorLx * scaleFactor, anchorLy * scaleFactor) from new center C'
          const curAnchorLx = anchorLx * scaleFactor
          const curAnchorLy = anchorLy * scaleFactor

          const newCx = anchorAx - (curAnchorLx * cos - curAnchorLy * sin)
          const newCy = anchorAy - (curAnchorLx * sin + curAnchorLy * cos)

          const newX = Math.round(newCx - newW / 2)
          const newY = Math.round(newCy - newH / 2)

          const updated = pagesRef.current.map((pg, pIdx) => {
            if (pIdx !== activePageIndex) return pg
            return {
              ...pg,
              elements: pg.elements.map((el) => {
                if (el.id === transformState.id) {
                  return {
                    ...el,
                    x: newX,
                    y: newY,
                    width: newW,
                    height: newH,
                  }
                }
                return el
              }),
            }
          })
          pagesRef.current = updated
          setPages(updated)
        }
      })
    }

    const handleMouseUp = () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
      setTransformState(null)

      // Reliably push final state to history if changed
      if (pagesBeforeTransformRef.current) {
        const before = JSON.stringify(pagesBeforeTransformRef.current)
        const current = JSON.stringify(pagesRef.current)
        if (before !== current) {
          pushHistory(pagesRef.current)
        }
        pagesBeforeTransformRef.current = null
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [transformState, activePageIndex, zoomLevel, pushHistory])

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

  // Keyboard Shortcuts (Ctrl+Z Undo, Ctrl+Y / Ctrl+Shift+Z Redo, Delete/Backspace, Arrows to nudge, Ctrl/Cmd+D to duplicate, Escape)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept native text field editing shortcuts
      const isInput =
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.isContentEditable

      if (isInput) return

      // Global Undo / Redo Shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) {
          handleRedo()
        } else {
          handleUndo()
        }
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        handleRedo()
        return
      }

      if (!selectedElementId) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteSelectedElement(selectedElementId)
      } else if (e.key === 'Escape') {
        setSelectedElementId(null)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        updateSelectedElement({ x: (selectedElement?.x || 0) - step })
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        updateSelectedElement({ x: (selectedElement?.x || 0) + step })
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        updateSelectedElement({ y: (selectedElement?.y || 0) - step })
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        updateSelectedElement({ y: (selectedElement?.y || 0) + step })
      } else if (e.key === 'd' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault()
        handleDuplicateElement(selectedElementId)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    selectedElementId,
    selectedElement,
    deleteSelectedElement,
    updateSelectedElement,
    handleDuplicateElement,
    handleUndo,
    handleRedo,
  ])

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

        {/* 3. MIDDLE CANVAS & SMALL PLUS BUTTON */}
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
