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
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#111827',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px 20px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
          },
          iconTheme: {
            primary: '#22c55e',
            secondary: '#fff',
          },
        }}
      />
    </AuthProvider>
  )
}