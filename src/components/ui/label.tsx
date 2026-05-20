import * as React from 'react'
import { cn } from '@/lib/utils'

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'font-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted',
        className
      )}
      {...props}
    />
  )
)
Label.displayName = 'Label'

export { Label }
