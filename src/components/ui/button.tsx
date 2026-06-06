import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import type { VariantProps } from 'class-variance-authority'
import { cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost:
          'hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50',
        link: 'text-primary underline-offset-4 hover:underline',
        commerce:
          'bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:-translate-y-0.5 transition-all',
        cta:
          'bg-[#70C942] hover:bg-[#5BB535] text-white font-bold transition-all',
        'outline-white':
          'border border-white/40 text-white bg-transparent hover:bg-white/10 hover:text-white font-bold transition-all',
        'enroll-free':
          'border border-primary/30 text-primary bg-transparent hover:bg-primary hover:text-white font-bold transition-all',
        'card-enroll':
          'bg-primary text-white font-bold hover:bg-primary/90 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md hover:shadow-primary/20',
      },
      size: {
        default: 'h-9 px-4 py-2 has-[>svg]:px-3',
        sm: 'h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5',
        lg: 'h-10 rounded-md px-6 has-[>svg]:px-4',
        xl: 'h-14 rounded-xl px-8 text-lg has-[>svg]:px-6',
        icon: 'size-9',
        'icon-sm': 'size-8',
        'icon-lg': 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

/**
 * Button Component — Commerce Hierarchy
 *
 * @variant cta          - Lime Green #70C942. FINAL conversion actions only:
 *                         Hero "Start Now", Checkout page, CTA banner.
 *                         Overused = loses impact. Use sparingly.
 *
 * @variant card-enroll  - Ocean Blue filled. Mid-funnel card CTAs:
 *                         "Enroll Now" on course cards (paid courses).
 *                         Subtle lift on hover for discoverability.
 *
 * @variant enroll-free  - Ocean Blue outline → fills on hover. Free course CTA.
 *                         Low-friction, approachable. Border signals "no payment".
 *
 * @variant commerce     - Ocean Blue + strong shadow lift. "Add to Cart", "Buy Now".
 *                         Use when payment intent is confirmed.
 *
 * @variant outline-white - Glass outline. ONLY on gradient backgrounds (navbar, hero).
 *
 * @variant default      - Ocean Blue flat. Standard interactive actions (forms, modals).
 * @variant outline      - Only on white/ice-blue backgrounds, not on gradients.
 */
function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      data-size={size}
      data-slot="button"
      data-variant={variant}
      {...props}
    />
  )
}

export { Button, buttonVariants }
