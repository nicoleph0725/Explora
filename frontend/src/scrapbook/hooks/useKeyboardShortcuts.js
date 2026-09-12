import { useEffect } from 'react'

/**
 * Registers global keyboard shortcuts for the scrapbook editor:
 * - Ctrl+Z: Undo
 * - Ctrl+Y or Ctrl+Shift+Z: Redo
 * - Delete / Backspace: Delete selected element
 * - Escape: Deselect current element
 * - Arrow keys: Nudge selected element (Shift = 10px, Normal = 1px)
 * - Ctrl+D / Cmd+D: Duplicate selected element
 */
export function useKeyboardShortcuts({
  selectedElementId,
  selectedElement,
  deleteSelectedElement,
  updateSelectedElement,
  handleDuplicateElement,
  handleUndo,
  handleRedo,
  setSelectedElementId,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept native text inputs
      const activeEl = document.activeElement
      const isNativeField = activeEl?.tagName === 'INPUT' || activeEl?.tagName === 'TEXTAREA'
      if (isNativeField) return

      // If the user is actively typing inside a contentEditable text element, let backspace/delete edit characters
      const isEditingContent = activeEl?.isContentEditable && selectedElement?.type === 'text'
      if (isEditingContent && (e.key === 'Delete' || e.key === 'Backspace')) {
        return
      }

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
    setSelectedElementId,
  ])
}
