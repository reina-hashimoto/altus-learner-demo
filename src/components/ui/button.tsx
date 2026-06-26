import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from './utils'

/**
 * Udemy DS Button (stand-in for @udemy-v2/react-core-components `Button`).
 * Spec verified against Figma tokens: radius border-radius-md (8px),
 * secondary = 1px purple (#6d28d2) border + purple text, label 14px / weight 700,
 * line-height 1.2. NOT a pill. Swap for the real package once the registry token
 * is refreshed.
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-xs whitespace-nowrap rounded-md font-bold leading-[1.2] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--border-color-focus)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      udStyle: {
        primary: 'bg-brand text-on-brand hover:bg-brand-strong active:bg-brand-strong',
        secondary:
          'border border-brand bg-surface text-brand hover:bg-surface-accent active:bg-surface-accent',
        ghost: 'bg-transparent text-brand hover:bg-surface-accent active:bg-surface-accent',
        link: 'bg-transparent text-link underline-offset-2 hover:underline',
        destructive:
          'bg-[var(--color-red-400)] text-on-brand hover:opacity-90 active:opacity-90',
      },
      size: {
        xsmall: 'h-7 px-sm text-sm',
        small: 'h-8 px-sm text-sm',
        medium: 'h-10 px-md text-sm',
        large: 'h-12 px-md text-md',
      },
    },
    defaultVariants: {
      udStyle: 'primary',
      size: 'medium',
    },
  },
)

function Button({
  className,
  udStyle,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ udStyle, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
