import { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
}

interface ZeiaSelectProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  icon?: LucideIcon
  className?: string
}

export function ZeiaSelect({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  icon: Icon,
  className,
}: ZeiaSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedIndex = options.findIndex((o) => o.value === value)
  const [highlightedIndex, setHighlightedIndex] = useState(selectedIndex !== -1 ? selectedIndex : 0)
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedLabel = options.find((o) => o.value === value)?.label

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

  // Reset highlighted index when options change or dropdown opens
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(selectedIndex !== -1 ? selectedIndex : 0)
    }
  }, [isOpen, selectedIndex])

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue)
      setIsOpen(false)
    },
    [onChange]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setIsOpen(true)
        }
        return
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setHighlightedIndex((prev) => (prev + 1) % options.length)
          break
        case 'ArrowUp':
          e.preventDefault()
          setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length)
          break
        case 'Enter':
          e.preventDefault()
          if (highlightedIndex >= 0) {
            handleSelect(options[highlightedIndex].value)
          }
          break
        case 'Escape':
          e.preventDefault()
          setIsOpen(false)
          break
      }
    },
    [isOpen, highlightedIndex, options, handleSelect]
  )

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {/* Trigger */}
      <button
        type="button"
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        className={cn(
          'w-full flex items-center gap-3 pr-12 pl-5 py-3 rounded-lg border transition-all duration-200 text-sm outline-none',
          'bg-card border-border hover:border-primary/30 hover:shadow-soft',
          'focus:ring-2 focus:ring-primary/10 focus:border-primary',
          isOpen && 'border-primary ring-2 ring-primary/10 shadow-soft'
        )}
      >
        {Icon && <Icon className="w-5 h-5 shrink-0" style={{ color: '#88939b' }} />}
        <span className={cn('flex-1 text-left truncate font-medium', !value && 'text-text-muted')} style={value ? { color: '#88939b' } : undefined}>
          {selectedLabel || placeholder}
        </span>
      </button>

      {/* Chevron — absolute so it never pushes text */}
      <div
        className={cn(
          'absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-200',
          isOpen && 'rotate-180'
        )}
      >
        <ChevronDown className="w-4 h-4 text-text-muted" />
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          role="listbox"
          className={cn(
            'absolute z-50 mt-2 w-full bg-card border border-border rounded-xl shadow-medium',
            'max-h-[240px] overflow-y-auto py-1 scrollbar-thin',
            'animate-fade-in animate-zoom-in-95'
          )}
        >
          {options.map((option, index) => {
            const isSelected = option.value === value
            const isHighlighted = index === highlightedIndex

            return (
              <div
                key={option.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(option.value)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={cn(
                  'flex items-center gap-3 px-5 py-3 text-sm cursor-pointer transition-colors duration-150',
                  isSelected && 'bg-primary text-white font-semibold',
                  !isSelected && isHighlighted && 'bg-primary/10 text-text-primary',
                  !isSelected && !isHighlighted && 'text-text-primary hover:bg-primary/10',
                  index !== options.length - 1 && 'border-b border-border/50'
                )}
              >
                <span className="flex-1 truncate">{option.label}</span>
                {isSelected && (
                  <Check className="w-4 h-4 shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
