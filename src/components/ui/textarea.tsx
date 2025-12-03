import { ComponentProps } from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "placeholder:text-muted-foreground focus-visible:border-white/40 focus-visible:bg-white/15 focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex field-sizing-content min-h-16 w-full rounded-xl border px-3 py-2 text-base shadow-md transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm bg-white/10 border-white/20 backdrop-blur-md text-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
