import { useState, useRef, useEffect, useCallback } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DateRange {
  startDate: Date | null
  endDate: Date | null
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  placeholder?: string
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const WEEK_DAYS = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do']

function formatDate(date: Date | null): string {
  if (!date) return ''
  const d = date.getDate().toString().padStart(2, '0')
  const m = (date.getMonth() + 1).toString().padStart(2, '0')
  const y = date.getFullYear()
  return `${d}/${m}/${y}`
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isBetween(target: Date, start: Date, end: Date): boolean {
  const t = target.getTime()
  const s = start.getTime()
  const e = end.getTime()
  return t > Math.min(s, e) && t < Math.max(s, e)
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  const day = new Date(year, month, 1).getDay()
  // Convert to Monday-first: 0=Sun->6, 1=Mon->0, 2=Tue->1, ...
  return day === 0 ? 6 : day - 1
}

export function DateRangePicker({ value, onChange, placeholder = 'Seleccionar fechas' }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    // Start view at the month of startDate or today
    return value.startDate ? new Date(value.startDate) : new Date()
  })
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [selecting, setSelecting] = useState<'start' | 'end' | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // viewDate is initialized from value.startDate; we don't need an effect
  // because the parent controls the value and re-renders with new props

  const handleDayClick = useCallback(
    (day: number) => {
      const clickedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)

      if (!value.startDate || (value.startDate && value.endDate)) {
        // Start new selection
        onChange({ startDate: clickedDate, endDate: null })
        setSelecting('end')
      } else if (selecting === 'end' || !value.endDate) {
        // Complete selection
        let start = value.startDate
        let end = clickedDate
        if (clickedDate < start) {
          [start, end] = [end, start]
        }
        onChange({ startDate: start, endDate: end })
        setSelecting(null)
        setHoverDate(null)
        setIsOpen(false)
      }
    },
    [viewDate, value, selecting, onChange]
  )

  const handleDayHover = useCallback(
    (day: number) => {
      if (selecting === 'end' && value.startDate && !value.endDate) {
        setHoverDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))
      }
    },
    [selecting, value.startDate, value.endDate, viewDate]
  )

  const navigateMonth = (delta: number) => {
    setViewDate((prev) => {
      const next = new Date(prev)
      next.setMonth(next.getMonth() + delta)
      return next
    })
  }

  const clearSelection = () => {
    onChange({ startDate: null, endDate: null })
    setHoverDate(null)
    setSelecting(null)
  }

  // Generate calendar grid
  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const daysInPrevMonth = getDaysInMonth(year, month - 1)

  const prevMonthDays = Array.from({ length: firstDay }, (_, i) => ({
    day: daysInPrevMonth - firstDay + i + 1,
    current: false,
    prev: true,
  }))

  const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    current: true,
    prev: false,
  }))

  const totalSlots = prevMonthDays.length + currentMonthDays.length
  const remainingSlots = 42 - totalSlots // 6 rows x 7 cols
  const nextMonthDays = Array.from({ length: remainingSlots }, (_, i) => ({
    day: i + 1,
    current: false,
    prev: false,
  }))

  const allDays = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays]

  const displayText = value.startDate
    ? `${formatDate(value.startDate)} — ${formatDate(value.endDate)}`
    : placeholder

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-200 text-sm',
          'bg-card border-border hover:border-primary/30 hover:shadow-soft',
          isOpen && 'border-primary ring-2 ring-primary/10 shadow-soft',
          !value.startDate && 'text-text-muted'
        )}
      >
        <CalendarIcon className="w-4 h-4 shrink-0" style={{ color: '#88939b' }} />
        <span className={cn('font-medium', !value.startDate && 'text-text-muted')} style={value.startDate ? { color: '#88939b' } : undefined}>
          {displayText}
        </span>
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 bg-card border border-border rounded-xl shadow-medium p-4 w-[320px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-text-secondary" />
            </button>
            <span className="font-semibold text-text-primary text-sm">
              {MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-text-secondary" />
            </button>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-0 mb-2">
            {WEEK_DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] font-semibold uppercase tracking-wider text-text-muted py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-0">
            {allDays.map((item, idx) => {
              const dateObj = new Date(
                item.prev ? year : item.current ? year : year,
                item.prev ? month - 1 : item.current ? month : month + 1,
                item.day
              )

              const isCurrentMonth = item.current
              const isToday = isSameDay(dateObj, new Date())
              const isStart = value.startDate && isSameDay(dateObj, value.startDate)
              const isEnd = value.endDate && isSameDay(dateObj, value.endDate)
              const inRange =
                value.startDate && value.endDate && isBetween(dateObj, value.startDate, value.endDate)
              const inHoverRange =
                value.startDate && hoverDate && !value.endDate && isBetween(dateObj, value.startDate, hoverDate)

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => item.current && handleDayClick(item.day)}
                  onMouseEnter={() => item.current && handleDayHover(item.day)}
                  disabled={!item.current}
                  className={cn(
                    'h-9 w-full flex items-center justify-center text-xs rounded-lg transition-all duration-150 relative',
                    !isCurrentMonth && 'text-text-muted/30 pointer-events-none',
                    isCurrentMonth && !isStart && !isEnd && 'text-text-primary hover:bg-secondary',
                    isToday && !isStart && !isEnd && 'border border-primary/40',
                    (isStart || isEnd) && 'bg-primary text-white font-semibold shadow-glow',
                    (inRange || inHoverRange) && !isStart && !isEnd && 'bg-primary/10 text-primary',
                    isStart && value.endDate && 'rounded-r-none',
                    isEnd && value.startDate && 'rounded-l-none',
                    inRange && !isStart && !isEnd && 'rounded-none',
                    inHoverRange && !isStart && !isEnd && 'rounded-none'
                  )}
                >
                  {item.day}
                </button>
              )
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <button
              type="button"
              onClick={clearSelection}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-danger transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => {
                setViewDate(new Date())
                setHoverDate(null)
              }}
              className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Hoy
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
