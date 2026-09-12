import { useState, useRef, useCallback } from 'react'

/**
 * Manages synchronous 50-step undo/redo history for scrapbook pages.
 */
export function useScrapbookHistory({ initialPages, pagesRef, setPages, setSelectedElementId }) {
  const historyRef = useRef([JSON.parse(JSON.stringify(initialPages))])
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
  }, [pagesRef, setPages, setSelectedElementId, updateUndoRedoState])

  const handleRedo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current += 1
    const targetState = JSON.parse(JSON.stringify(historyRef.current[historyIndexRef.current]))
    pagesRef.current = targetState
    setPages(targetState)
    setSelectedElementId(null)
    updateUndoRedoState()
  }, [pagesRef, setPages, setSelectedElementId, updateUndoRedoState])

  return {
    canUndo,
    canRedo,
    pushHistory,
    handleUndo,
    handleRedo,
    pagesBeforeTransformRef,
  }
}
