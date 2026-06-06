'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/utils'

function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  step = 1,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const [_value, setValue] = React.useState(value || defaultValue || [min])

  React.useEffect(() => {
    if (value) setValue(value)
  }, [value])

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={_value}
      min={min}
      max={max}
      step={step}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className,
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="bg-slate-100 relative h-3 w-full grow overflow-hidden rounded-full"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="bg-primary absolute h-full"
        />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb
        data-slot="slider-thumb"
        className="border-primary bg-white ring-primary/20 flex items-center justify-center size-9 rounded-full border-[3px] transition-all hover:scale-110 focus-visible:ring-4 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 shadow-xl shadow-primary/10 cursor-grab active:cursor-grabbing"
      >
        {props.children}
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  )
}

export { Slider }
