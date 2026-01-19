// app/login/page.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../lib/hooks/useAuthApi'
// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-400" />,
    error: <XCircle className="h-5 w-5 text-red-400" />,
    info: <AlertCircle className="h-5 w-5 text-blue-400" />
  }

  const bgColors = {
    success: 'bg-green-900 border-green-700',
    error: 'bg-red-900 border-red-700',
    info: 'bg-blue-900 border-blue-700'
  }

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 rounded-lg border ${bgColors[type]} text-white shadow-lg animate-in slide-in-from-top-2 duration-300`}>
      {icons[type]}
      <span className="ml-2 text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-4 text-gray-400 hover:text-white transition-colors"
      >
        <XCircle className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const router = useRouter()
  
  // Use the auth hook - ensure this path is correct
  const { login, isLoading: authLoading, isAuthenticated } = useAuth()

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ User already authenticated, redirecting to dashboard')
      router.push('/dashboard')
    }
  }, [isAuthenticated, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.email.trim() || !formData.password) {
      showToast('Please enter both email and password', 'error')
      return
    }

    console.log('📝 Login Page: Attempting login with:', formData.email)
    
    try {
      // Use the auth hook login function
      const result = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      })

      console.log('📝 Login Page: Login result:', result)

      if (result.success) {
        showToast('Login successful!', 'success')
        console.log('✅ Login Page: Redirecting to dashboard...')
        
        // Redirect to dashboard
        router.push('/dashboard')
      } else {
        // Handle different error types
        let errorMessage = result.error || 'Login failed. Please try again.'
        
        // Specific error messages for common cases
        if (errorMessage.includes('Invalid') || errorMessage.includes('invalid')) {
          errorMessage = 'Invalid email or password'
        } else if (errorMessage.includes('suspended') || errorMessage.includes('inactive')) {
          errorMessage = 'Account is suspended. Please contact support.'
        } else if (errorMessage.includes('verify')) {
          errorMessage = 'Please verify your email before logging in'
        }
        
        showToast(errorMessage, 'error')
        console.error('❌ Login Page: Login failed:', result.error)
      }

    } catch (error: any) {
      console.error('❌ Login Page: Unexpected error:', error)
      
      // Handle network errors
      if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
        showToast('Network error. Please check your internet connection.', 'error')
      } else {
        showToast('An unexpected error occurred. Please try again.', 'error')
      }
    }
  }

  const isLoading = authLoading

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">Olament</h1>
          <h2 className="text-2xl font-semibold text-white mb-2">Welcome Back</h2>
          <p className="text-gray-400">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent focus:z-10 sm:text-sm transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent focus:z-10 sm:text-sm transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-yellow-400 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-yellow-400 transition-colors" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 text-yellow-400 bg-gray-800 border-gray-600 rounded focus:ring-yellow-400 focus:ring-2"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-300">
                Remember me
              </label>
            </div>

            <div className="text-sm">
              <Link href="/forgot-password" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                Forgot password?
              </Link>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-gray-900 bg-yellow-400 hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center">
                  Sign in
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              )}
            </button>
          </div>

          {/* Sign up link */}
          <div className="text-center">
            <p className="text-gray-400">
              Don&rsquo;t have an account?{' '}
              <Link href="/signup" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-8">
          <p>&copy; 2024 Olament. Digitizing Africa&rsquo;s Local Markets.</p>
          <p className="mt-1">Prepared by Godsibest Company Ltd</p>
        </div>
      </div>
    </div>
  )
}