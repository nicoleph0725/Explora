import { useState, useEffect, useRef } from 'react'
import { saveJournalPages, createJournal, isUUID } from '../../api'

/**
 * Manages debounced (700ms) synchronization of scrapbook pages and title
 * to both browser localStorage and the backend database.
 */
export function useScrapbookAutosave({
  pages,
  scrapbookTitle,
  journalId,
  setJournalId,
  scrapbook,
}) {
  const [saveStatus, setSaveStatus] = useState('saved') // 'saved' | 'saving' | 'error'
  const isInitialMount = useRef(true)

  useEffect(() => {
    // Skip autosaving on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    setSaveStatus('saving')

    const debounceTimer = setTimeout(async () => {
      // 1. Save to LocalStorage Backup for current scrapbook editor
      try {
        localStorage.setItem(
          `explora_scrapbook_${journalId || 'temp'}`,
          JSON.stringify({ title: scrapbookTitle, pages })
        )
      } catch (err) {
        console.warn('LocalStorage backup error:', err)
      }

      // 2. Check token for backend sync
      const token = localStorage.getItem('token')
      if (!token) {
        setSaveStatus('saved')
        return
      }

      // 3. Persist to Backend Database
      try {
        if (isUUID(journalId)) {
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
            setJournalId(created.id)
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
  }, [pages, scrapbookTitle, journalId, scrapbook, setJournalId])

  return { saveStatus, setSaveStatus }
}
