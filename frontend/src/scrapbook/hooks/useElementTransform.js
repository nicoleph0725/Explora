import { useState, useRef, useEffect, useCallback } from 'react'
import {
  calculateResizeInit,
  calculateResizeStep,
  calculateRotateStep,
  calculateMoveStep,
} from '../utils/canvasTransformMath'

/**
 * Coordinates mouse interaction for moving, rotating, and resizing canvas elements.
 */
export function useElementTransform({
  pagesRef,
  setPages,
  activePageIndex,
  setSelectedElementId,
  zoomLevel,
  pushHistory,
  pagesBeforeTransformRef,
  canvasRef,
}) {
  const [transformState, setTransformState] = useState(null)
  const animFrameRef = useRef(null)

  // Helper to bring clicked element to the top layer
  const bringElementToTop = useCallback(
    (elId) => {
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
            item.id === elId ? { ...item, zIndex: newZ } : item
          ),
        }
      })
      pagesRef.current = updated
      setPages(updated)
    },
    [activePageIndex, pagesRef, setPages]
  )

  // 1. Start Drag Move
  const handleStartMove = useCallback(
    (e, el, shouldDrag = true) => {
      if (el.type !== 'text' && document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur()
      }
      bringElementToTop(el.id)
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
    [bringElementToTop, pagesBeforeTransformRef, pagesRef, setSelectedElementId]
  )

  // 2. Start Rotate
  const handleStartRotate = useCallback(
    (e, el, targetEl) => {
      e.stopPropagation()
      const domEl = targetEl?.current || targetEl
      if (!domEl) return

      pagesBeforeTransformRef.current = JSON.parse(JSON.stringify(pagesRef.current))
      bringElementToTop(el.id)

      const rect = domEl.getBoundingClientRect()
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
    [bringElementToTop, pagesBeforeTransformRef, pagesRef, setSelectedElementId]
  )

  // 3. Start Resize
  const handleStartResize = useCallback(
    (e, handle, el, targetEl) => {
      e.stopPropagation()
      const domEl = targetEl?.current || targetEl
      if (!domEl) return

      pagesBeforeTransformRef.current = JSON.parse(JSON.stringify(pagesRef.current))
      bringElementToTop(el.id)

      const resizeData = calculateResizeInit({
        el,
        handle,
        domEl,
      })

      setSelectedElementId(el.id)
      setTransformState({
        type: 'resize',
        id: el.id,
        handle,
        ...resizeData,
      })
    },
    [bringElementToTop, pagesBeforeTransformRef, pagesRef, setSelectedElementId]
  )

  // Mouse Move & Up Listeners
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

        // 1. DRAG MOVE
        if (transformState.type === 'move') {
          const { newX, newY } = calculateMoveStep({ clientX, clientY, scale, transformState })

          const updated = pagesRef.current.map((pg, pIdx) => {
            if (pIdx !== activePageIndex) return pg
            return {
              ...pg,
              elements: pg.elements.map((el) => {
                if (el.id === transformState.id) {
                  return { ...el, x: newX, y: newY }
                }
                return el
              }),
            }
          })
          pagesRef.current = updated
          setPages(updated)
        }

        // 2. DRAG ROTATE
        else if (transformState.type === 'rotate') {
          const newRotation = calculateRotateStep({ clientX, clientY, shiftKey, transformState })

          const updated = pagesRef.current.map((pg, pIdx) => {
            if (pIdx !== activePageIndex) return pg
            return {
              ...pg,
              elements: pg.elements.map((el) => {
                if (el.id === transformState.id) {
                  return { ...el, rotation: newRotation }
                }
                return el
              }),
            }
          })
          pagesRef.current = updated
          setPages(updated)
        }

        // 3. DRAG CORNER RESIZE
        else if (transformState.type === 'resize') {
          if (!canvasRef.current) return
          const canvasRect = canvasRef.current.getBoundingClientRect()

          const { newX, newY, newW, newH } = calculateResizeStep({
            clientX,
            clientY,
            canvasRect,
            scale,
            transformState,
          })

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

      // Push final state to history if modified
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
  }, [
    transformState,
    activePageIndex,
    zoomLevel,
    canvasRef,
    pagesRef,
    setPages,
    pushHistory,
    pagesBeforeTransformRef,
  ])

  return {
    transformState,
    handleStartMove,
    handleStartRotate,
    handleStartResize,
  }
}
