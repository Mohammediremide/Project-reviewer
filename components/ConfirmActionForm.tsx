'use client'

import { ReactElement, ReactNode, cloneElement, isValidElement, useRef, useState } from 'react'

type Action = (formData: FormData) => void

export function ConfirmActionForm({
  action,
  message,
  className,
  confirmLabel = 'Yes',
  cancelLabel = 'No',
  children
}: {
  action: Action
  message: string
  className?: string
  confirmLabel?: string
  cancelLabel?: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const trigger = isValidElement(children)
    ? cloneElement(children as ReactElement<any>, {
        type: 'button',
        onClick: (event: React.MouseEvent) => {
          children.props?.onClick?.(event)
          event.preventDefault()
          setOpen(true)
        }
      })
    : children

  return (
    <form ref={formRef} action={action} className={className}>
      {trigger}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-3xl border border-slate-800/70 bg-slate-900/90 p-8 shadow-2xl">
            <div className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 mb-4">
              Confirm Action
            </div>
            <p className="text-lg text-slate-200 font-semibold leading-relaxed">
              {message}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                className="btn-secondary w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em]"
                onClick={() => setOpen(false)}
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                className="btn-primary w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em]"
                onClick={() => {
                  setOpen(false)
                  formRef.current?.requestSubmit()
                }}
              >
                {confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  )
}
