"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Select Root Component
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void
  value?: string
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onValueChange, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (onValueChange) {
        onValueChange(e.target.value)
      }
      if (props.onChange) {
        props.onChange(e)
      }
    }

    return (
      <div className="relative w-full">
        <select
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            "[&::-ms-expand]:hidden",
            className
          )}
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'none',
            appearance: 'none',
          }}
          ref={ref}
          value={value}
          onChange={handleChange}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none flex items-center">
          <svg
            className="h-4 w-4 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
    )
  }
)
Select.displayName = "Select"

// SelectTrigger - wrapper untuk styling
export interface SelectTriggerProps extends React.HTMLAttributes<HTMLDivElement> {}

const SelectTrigger = React.forwardRef<HTMLDivElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("", className)} {...props}>
        {children}
      </div>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

// SelectValue - untuk menampilkan value yang dipilih (dalam konteks select biasa, ini tidak diperlukan tapi untuk kompatibilitas)
export interface SelectValueProps {
  placeholder?: string
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
  return null // SelectValue tidak diperlukan untuk HTML select, tapi kita export untuk kompatibilitas
}
SelectValue.displayName = "SelectValue"

// SelectContent - wrapper untuk option items
export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("", className)} {...props}>
        {children}
      </div>
    )
  }
)
SelectContent.displayName = "SelectContent"

// SelectItem - wrapper untuk option
export interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  value: string
}

const SelectItem = React.forwardRef<HTMLOptionElement, SelectItemProps>(
  ({ className, children, value, ...props }, ref) => {
    return (
      <option
        ref={ref}
        value={value}
        className={cn("", className)}
        {...props}
      >
        {children}
      </option>
    )
  }
)
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
