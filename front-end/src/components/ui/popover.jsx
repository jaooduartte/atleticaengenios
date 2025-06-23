import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"
import PropTypes from "prop-types"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef(
  ({ className, align = "center", sideOffset = 4, ...props }, ref) => (
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-auto overflow-hidden p-0 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0e1117] text-popover-foreground shadow-xl outline-none data-[state=open]:animate-in data-[state=closed]:animate-out",
        className
      )}
      {...props}
    />
  )
)
PopoverContent.displayName = PopoverPrimitive.Content.displayName

PopoverContent.propTypes = {
  className: PropTypes.string,
  align: PropTypes.string,
  sideOffset: PropTypes.number,
}

export { Popover, PopoverTrigger, PopoverContent }
