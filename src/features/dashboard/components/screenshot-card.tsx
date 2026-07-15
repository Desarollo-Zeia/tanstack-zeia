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
  variant?: 'default' | 'report' | 'browser'
  subtitle?: string
  rightTitle?: string
  rightSubtitle?: string
  url?: string
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
  variant = 'default',
  subtitle,
  rightTitle,
  rightSubtitle,
  url = 'app.zeia.pe',
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

      // Place logo in the top-right corner of the card, aligned with the title
      if (variant === 'browser') {
        clone.style.position = 'relative'
        const logoWatermark = document.createElement('div')
        logoWatermark.className = 'absolute top-6 right-6 z-10'
        logoWatermark.innerHTML = `
          <img
            src="${logoUrl}"
            alt="ZEIA"
            class="h-6 w-auto object-contain opacity-70"
          />
        `
        clone.appendChild(logoWatermark)
      }

      // Replace <canvas> elements with rendered images so they survive cloning
      const originalCanvases = Array.from(originalCard.querySelectorAll('canvas'))
      const clonedCanvases = Array.from(clone.querySelectorAll('canvas'))
      originalCanvases.forEach((canvas, index) => {
        const clonedCanvas = clonedCanvases[index]
        if (!clonedCanvas) return
        try {
          const img = document.createElement('img')
          img.src = canvas.toDataURL('image/png')
          img.style.cssText = canvas.style.cssText
          clonedCanvas.parentNode?.replaceChild(img, clonedCanvas)
        } catch {
          // Keep the cloned canvas if conversion fails
        }
      })

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

      const filtersClone = filtersRef.current
        ? (filtersRef.current.cloneNode(true) as HTMLElement)
        : null
      if (filtersClone) {
        filtersClone.classList.remove('hidden')
        filtersClone.classList.add('flex', 'flex-wrap', 'items-end', 'gap-3')
      }

      const header = document.createElement('div')

      if (variant === 'browser') {
        header.className = 'bg-[#F5F5F0] border-b border-[#E8E8E3] px-4 py-3'
        header.innerHTML = `
          <div class="flex items-center gap-2 mb-2">
            <div class="w-3 h-3 rounded-full bg-[#FF5F57]"></div>
            <div class="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
            <div class="w-3 h-3 rounded-full bg-[#28C840]"></div>
          </div>
          <div class="bg-white border border-[#E8E8E3] rounded-lg px-4 py-2 text-sm text-text-secondary text-center truncate">
            ${url}
          </div>
        `
      } else if (variant === 'report') {
        header.className = 'px-6 py-4 border-b border-[#E8E8E3] bg-[#FAFAF5]'
        header.innerHTML = `
          <div class="grid grid-cols-[100px_1fr_160px] gap-4 items-start">
            <div class="flex items-start">
              <img
                src="${logoUrl}"
                alt="ZEIA"
                class="h-8 w-auto object-contain"
              />
            </div>
            <div class="text-center">
              <p class="text-base font-semibold text-text-primary">${title}</p>
              ${subtitle ? `<p class="text-xs text-text-secondary mt-0.5">${subtitle}</p>` : ''}
              ${filtersClone ? '<div class="mt-2 flex justify-center" data-report-filters></div>' : ''}
            </div>
            <div class="text-right">
              <p class="text-base font-semibold text-text-primary">${rightTitle ?? ''}</p>
              ${rightSubtitle ? `<p class="text-xs text-text-secondary mt-0.5">${rightSubtitle}</p>` : ''}
            </div>
          </div>
        `
      } else {
        header.className = 'px-6 py-4 border-b border-[#E8E8E3] bg-[#FAFAF5] flex items-center justify-between'
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
      }

      // Insert filters clone into the report header for the report variant
      if (variant === 'report' && filtersClone) {
        const filtersSlot = header.querySelector('[data-report-filters]')
        if (filtersSlot) {
          filtersSlot.appendChild(filtersClone)
        }
      }

      const filtersSection = document.createElement('div')
      if ((variant === 'default' || variant === 'browser') && filtersClone) {
        filtersSection.className = 'px-6 py-4 border-b border-[#E8E8E3] bg-white'
        filtersSection.appendChild(filtersClone)
      }

      const body = document.createElement('div')
      body.className = variant === 'browser' ? 'p-6 bg-[#FAFAF5]' : 'p-6'
      body.appendChild(clone)

      const footer = document.createElement('div')
      footer.className =
        'px-6 py-3 bg-[#FAFAF5] border-t border-[#E8E8E3] text-center'
      footer.innerHTML = `
        <p class="text-xs text-text-muted">Generado desde Zeia Energy Dashboard</p>
      `

      reportCard.appendChild(header)
      if ((variant === 'default' || variant === 'browser') && filtersClone) {
        reportCard.appendChild(filtersSection)
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
  }, [title, logoUrl, url, variant, subtitle, rightTitle, rightSubtitle])

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
