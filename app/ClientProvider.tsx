// app/ClientProvider.tsx
'use client'

import { AuthProvider } from './context/AuthContext'
import { Toaster } from 'react-hot-toast'

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {children}
      <Toaster position="top-center" />
    </AuthProvider>
  )
}