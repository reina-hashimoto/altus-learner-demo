import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from './utils'

/**
 * Udemy DS Button (stand-in for @udemy-v2/react-core-components `Button`).
 * Mirrors the real `udStyle` + `size` API and visual treatment, built on DS
 * tokens. Swap for the real package once the Artifactory token is refreshed.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-xs whitespace-nowrap rounded-round font-bold leading-none transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--border-color-focus)] disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      udStyle: {
        primary: 'bg-brand text-on-brand hover:bg-brand-strong active:bg-brand-strong',
        secondary:
          'border border-[var(--border-color-button)] bg-surface text-brand hover:bg-brand-pale active:bg-brand-pale',
        ghost: 'bg-transparent text-brand hover:bg-brand-pale active:bg-brand-pale',
        link: 'bg-transparent text-link underline-offset-2 hover:underline',
        destructive:
          'bg-[var(--color-red-400)] text-on-brand hover:opacity-90 active:opacity-90',
      },
      size: {
        small: 'h-8 px-sm text-xs',
        medium: 'h-10 px-md text-sm',
        large: 'h-12 px-lg text-md',
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
