/**
 * Multi-select filter chip + dropdown (checkbox list with All / Clear filter /
 * Done). Selections apply live; Done just closes. Mirrors the Figma FilterChip +
 * FilterDropdown.
 */
import { ChevronDown, Check, X } from 'lucide-react'
import { cn } from '@/components/ui/utils'
import { Button } from '@/components/ui/button'

export function FilterDropdown({
  label,
  options,
  selected,
  onToggleOption,
  onSelectAll,
  onClear,
  open,
  onOpenChange,
}: {
  label: string
  options: string[]
  selected: Set<string>
  onToggleOption: (option: string) => void
  onSelectAll: () => void
  onClear: () => void
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const count = selected.size
  const allSelected = count === options.length && count > 0

  return (
    <div className="relative">
      <button
        onClick={() => onOpenChange(!open)}
        className={cn(
          'flex items-center gap-xs rounded-round border px-sm py-1.5 text-xs font-bold transition-colors',
          count > 0 ? 'border-brand bg-brand-pale text-brand' : 'border-line bg-surface text-ink hover:bg-surface-pale',
        )}
      >
        {label}
        {count > 0 && (
          <span className="flex size-4 items-center justify-center rounded-round bg-brand text-[10px] text-on-brand tabular-nums">
            {count}
          </span>
        )}
        <ChevronDown className={cn('size-3.5 transition-transform', open ? 'rotate-180' : '')} strokeWidth={2.25} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => onOpenChange(false)} />
          <div className="absolute left-0 top-full z-50 mt-xs w-[280px] overflow-hidden rounded-lg border border-line-subdued bg-surface shadow-[0_4px_16px_rgba(140,134,147,0.2)]">
            <div className="max-h-[320px] overflow-y-auto p-sm">
              {options.map((opt) => {
                const checked = selected.has(opt)
                return (
                  <button
                    key={opt}
                    onClick={() => onToggleOption(opt)}
                    className="flex w-full items-center gap-sm rounded-md px-sm py-xs text-left text-sm text-ink transition-colors hover:bg-surface-pale"
                  >
                    <span
                      className={cn(
                        'flex size-5 shrink-0 items-center justify-center rounded-sm border',
                        checked ? 'border-brand bg-brand text-on-brand' : 'border-line-strong',
                      )}
                    >
                      {checked && <Check className="size-3.5" strokeWidth={3} />}
                    </span>
                    {opt}
                  </button>
                )
              })}
            </div>
            <div className="flex items-center justify-between gap-sm border-t border-line-subdued px-sm py-sm">
              <button onClick={onSelectAll} className="flex items-center gap-xs text-sm text-ink">
                <span
                  className={cn(
                    'flex size-5 shrink-0 items-center justify-center rounded-sm border',
                    allSelected ? 'border-brand bg-brand text-on-brand' : 'border-line-strong',
                  )}
                >
                  {allSelected && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                All
              </button>
              <div className="flex items-center gap-sm">
                <button onClick={onClear} className="flex items-center gap-xxs text-sm font-bold text-brand hover:underline">
                  <X className="size-3.5" strokeWidth={2.5} />
                  Clear filter
                </button>
                <Button udStyle="primary" size="small" onClick={() => onOpenChange(false)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
