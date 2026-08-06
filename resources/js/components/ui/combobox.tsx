import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { useLaravelReactI18n } from "laravel-react-i18n"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface ComboboxProps {
  options: { label: string; value: string }[]
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  emptyText?: string
  className?: string
  disabled?: boolean
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  emptyText,
  className,
  disabled = false,
}: ComboboxProps) {
  const { t } = useLaravelReactI18n()
  const [open, setOpen] = React.useState(false)
  const resolvedPlaceholder = placeholder ?? t("Sélectionner...")
  const resolvedEmptyText = emptyText ?? t("Aucun résultat trouvé.")

  return (
    <Popover open={open} onOpenChange={setOpen} modal={true}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", className, !value && "text-muted-foreground")}
        >
          <span className="truncate">
          {value
            ? options.find((option) => option.value === value)?.label
            : resolvedPlaceholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-0"
        align="start"
      >
        <Command>
          <CommandInput placeholder={t("Rechercher...")} />
          {/* touch-action:pan-y enables two-finger trackpad scroll; overscroll-contain prevents page scroll bleed */}
          <CommandList style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}>
            <CommandEmpty>{resolvedEmptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label} // Cmdk searches using the value property (which gets rendered as lowercase text)
                  onSelect={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
