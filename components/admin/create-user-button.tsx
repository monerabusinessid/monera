'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { UserModal } from './user-modal'

interface CreateUserButtonProps {
  defaultRole?: 'TALENT' | 'CLIENT' | 'SUPER_ADMIN' | 'QUALITY_ADMIN' | 'SUPPORT_ADMIN' | 'ANALYST'
  className?: string
  label?: string
}

export function CreateUserButton({ defaultRole, className, label = 'Add User' }: CreateUserButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className={className}>
        + {label}
      </Button>
      <UserModal
        user={null}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        mode="create"
        defaultRole={defaultRole}
      />
    </>
  )
}
