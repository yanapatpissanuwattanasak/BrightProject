import type { InputHTMLAttributes, TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface FieldProps {
  label: string
  error?: string
  required?: boolean
}

interface InputFieldProps extends FieldProps, InputHTMLAttributes<HTMLInputElement> {
  as?: 'input'
}

interface TextareaFieldProps extends FieldProps, TextareaHTMLAttributes<HTMLTextAreaElement> {
  as: 'textarea'
}

type ContactFormFieldProps = InputFieldProps | TextareaFieldProps

const baseInput = 'w-full rounded-xl border border-surface-border bg-surface-raised px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline focus:outline-2 focus:outline-primary transition-colors text-sm'

export function ContactFormField(props: ContactFormFieldProps) {
  const { label, error, required, as, ...rest } = props
  const id = rest.id ?? rest.name

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-text-secondary mb-1.5">
        {label}
        {required && <span className="text-error ml-1" aria-hidden="true">*</span>}
      </label>
      {as === 'textarea' ? (
        <textarea
          id={id}
          aria-required={required}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(baseInput, 'resize-none min-h-[120px]', error && 'border-error')}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          id={id}
          aria-required={required}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(baseInput, error && 'border-error')}
          {...(rest as InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-error">
          {error}
        </p>
      )}
    </div>
  )
}
