'use client'

import { ReactNode } from 'react'

type Action = (formData: FormData) => void

export function ConfirmActionForm({
  action,
  message,
  className,
  children
}: {
  action: Action
  message: string
  className?: string
  children: ReactNode
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={(event) => {
        if (!confirm(message)) {
          event.preventDefault()
        }
      }}
    >
      {children}
    </form>
  )
}
