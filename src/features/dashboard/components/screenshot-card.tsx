import { useRef, useState, useCallback, useEffect } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { toPng } from 'html-to-image'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDateReadable } from '@/lib/date-utils'
import { ScreenshotPreviewModal } from './screenshot-preview-modal'

interface ScreenshotCardProps {
  title: string
  filename: string
  children: React.ReactNode
  className?: string
  filters?: React.ReactNode
}

function getCaptureDate(): string {
  return formatDateReadable(new Date().toISOString())
}

async function loadLogoDataUrl(): Promise<string> {
  try {
    const response = await fetch('/images/zeia-logo-first.png')
    if (!response.ok) return '/images/zeia-logo-first.png'
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return '/images/zeia-logo-first.png'
  }
}

export function ScreenshotCard({
  title,
  filename,
  children,
  className,
  filters,
}: ScreenshotCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const filtersRef = useRef<HTMLDivElement>(null)
  const captureContainerRef = useRef<HTMLDivElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string>('/images/zeia-logo-first.png')

  useEffect(() => {
    let cancelled = false
    loadLogoDataUrl().then((url) => {
      if (!cancelled) setLogoUrl(url)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const handleCapture = useCallback(async () => {
    if (!cardRef.current || !captureContainerRef.current) return

    setIsGenerating(true)
    const captureContainer = captureContainerRef.current
    let clone: HTMLElement | null = null

    try {
      const originalCard = cardRef.current
      clone = originalCard.cloneNode(true) as HTMLElement

      const innerCapture = captureContainer.querySelector('[data-screenshot-inner]') as HTMLElement | null
      const contentWrapper = captureContainer.querySelector('[data-screenshot-content]')
      if (!innerCapture || !contentWrapper) return

      // Match the original card width
      innerCapture.style.width = `${originalCard.offsetWidth}px`

      // Clear previous captures
      contentWrapper.innerHTML = ''

      const reportCard = document.createElement('div')
      reportCard.className =
        'bg-white rounded-2xl shadow-xl border border-[#E8E8E3] overflow-hidden'
      reportCard.style.width = '100%'

      const header = document.createElement('div')
      header.className =
        'px-6 py-4 border-b border-[#E8E8E3] bg-[#FAFAF5] flex items-center justify-between'
      header.innerHTML = `
        <img
          src="${logoUrl}"
          alt="ZEIA"
          class="h-8 w-auto object-contain"
        />
        <div class="text-right">
          <p class="text-base font-semibold text-text-primary">${title}</p>
          <p class="text-xs text-text-secondary">${getCaptureDate()} · app.zeia.pe</p>
        </div>
      `

      const filtersClone = filtersRef.current
        ? (filtersRef.current.cloneNode(true) as HTMLElement)
        : null
      if (filtersClone) {
        filtersClone.classList.remove('hidden')
        filtersClone.classList.add(
          'px-6',
          'py-4',
          'border-b',
          'border-[#E8E8E3]',
          'bg-white'
        )
      }

      const body = document.createElement('div')
      body.className = 'p-6'
      body.appendChild(clone)

      const footer = document.createElement('div')
      footer.className =
        'px-6 py-3 bg-[#FAFAF5] border-t border-[#E8E8E3] text-center'
      footer.innerHTML = `
        <p class="text-xs text-text-muted">Generado desde Zeia Energy Dashboard</p>
      `

      reportCard.appendChild(header)
      if (filtersClone) {
        reportCard.appendChild(filtersClone)
      }
      reportCard.appendChild(body)
      reportCard.appendChild(footer)

      contentWrapper.appendChild(reportCard)

      // Make container visible for capture
      captureContainer.classList.remove('opacity-0')
      captureContainer.classList.add('opacity-100')

      const dataUrl = await toPng(captureContainer, {
        cacheBust: true,
        pixelRatio: 2,
      })

      setPreviewUrl(dataUrl)
    } catch (error) {
      console.error('Error capturing screenshot:', error)
    } finally {
      // Hide container again
      captureContainer.classList.remove('opacity-100')
      captureContainer.classList.add('opacity-0')
      if (clone) {
        clone.remove()
      }
      setIsGenerating(false)
    }
  }, [title, logoUrl])

  return (
    <>
      <div className={cn('relative', className)}>
        <div ref={cardRef}>{children}</div>
        {filters && (
          <div ref={filtersRef} className="hidden">
            {filters}
          </div>
        )}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 z-10 h-9 w-9 rounded-lg bg-card/80 backdrop-blur-sm border border-border hover:bg-secondary"
          onClick={handleCapture}
          disabled={isGenerating}
          title="Capturar pantalla"
        >
          {isGenerating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Camera className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Hidden capture container — kept in DOM for accurate rendering */}
      <div
        ref={captureContainerRef}
        className="fixed top-0 left-0 opacity-0 pointer-events-none -z-50 p-6"
        aria-hidden="true"
      >
        <div
          data-screenshot-inner
          className="p-6 bg-white rounded-2xl shadow-medium border border-[#E8E8E3]"
        >
          <div data-screenshot-content />
        </div>
      </div>

      {previewUrl && (
        <ScreenshotPreviewModal
          imageUrl={previewUrl}
          filename={filename}
          isOpen={!!previewUrl}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </>
  )
}
