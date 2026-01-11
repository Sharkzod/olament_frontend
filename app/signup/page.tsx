'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { backendUrl } from '../constant'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, CheckCircle, X, AlertCircle } from 'lucide-react'

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
    agreeToTerms: false,
    agreeToMarketing: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  
  // Use the auth context
  const { signup: authSignup } = useAuth() // Rename to avoid conflict

  // ✅ Toast state
  const [toast, setToast] = useState<{
    show: boolean
    type: 'success' | 'error' | 'info'
    message: string
  }>({ show: false, type: 'info', message: '' })

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ show: true, type, message })
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }))
    }, 3000)
  }

  const hideToast = () => setToast(prev => ({ ...prev, show: false }))

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (error) setError('')
  }

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentStep !== 3) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${backendUrl}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          agreeToTerms: formData.agreeToTerms,
          agreeToMarketing: formData.agreeToMarketing
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Use the auth context to store session
        if (authSignup && typeof authSignup === 'function') {
          await authSignup(data.user, {
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            expiresIn: data.expiresIn
          });
        } else {
          // Fallback: Store directly in localStorage if auth context is not available
          const expiryTime = new Date().getTime() + (data.expiresIn || 15 * 60 * 1000);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('accessToken', data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
          }
          localStorage.setItem('tokenExpiry', expiryTime.toString());
        }
        
        showToast('success', 'Account created successfully!')
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        // Handle user already exists error specifically
        if (data.error === 'DuplicateEmailError' || data.message?.includes('already exists')) {
          setError('An account with this email already exists. Please try logging in.')
          showToast('error', 'An account with this email already exists.')
        } else {
          const errorMessage = data.message || 'Signup failed. Please try again.'
          setError(errorMessage)
          showToast('error', errorMessage)
        }
      }
    } catch (error) {
      console.log('Network error:', error)
      setError('Network error. Please try again.')
      showToast('error', 'Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const isStep1Valid = formData.firstName && formData.lastName && formData.email && formData.phone
  const isStep2Valid = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword
  const isStep3Valid = formData.agreeToTerms

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* ✅ Toast Notification */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50 max-w-md w-full">
          <div
            className={`flex items-center p-4 rounded-lg shadow-lg transition-all duration-300 ${
              toast.type === 'success'
                ? 'bg-green-900/90 border border-green-500 text-green-200'
                : toast.type === 'error'
                ? 'bg-red-900/90 border border-red-500 text-red-200'
                : 'bg-blue-900/90 border border-blue-500 text-blue-200'
            }`}
          >
            <div className="flex-shrink-0">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={hideToast}
              className="ml-4 flex-shrink-0 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">Olament</h1>
          <h2 className="text-2xl font-semibold text-white mb-2">Join Our Community</h2>
          <p className="text-gray-400">Start digitizing Africa&rsquo;s local markets</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 1 ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-400'
            }`}>
              {currentStep > 1 ? <CheckCircle className="w-5 h-5" /> : '1'}
            </div>
            <span className="ml-2 text-sm text-gray-300 hidden sm:inline">Personal Info</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-700">
            <div className={`h-full transition-all duration-300 ${
              currentStep >= 2 ? 'bg-yellow-400' : 'bg-gray-700'
            }`} style={{ width: currentStep >= 2 ? '100%' : '0%' }} />
          </div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 2 ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-400'
            }`}>
              {currentStep > 2 ? <CheckCircle className="w-5 h-5" /> : '2'}
            </div>
            <span className="ml-2 text-sm text-gray-300 hidden sm:inline">Security</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-700">
            <div className={`h-full transition-all duration-300 ${
              currentStep >= 3 ? 'bg-yellow-400' : 'bg-gray-700'
            }`} style={{ width: currentStep >= 3 ? '100%' : '0%' }} />
          </div>
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              currentStep >= 3 ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-400'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm text-gray-300 hidden sm:inline">Finish</span>
          </div>
        </div>

        {/* Signup Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="appearance-none relative block w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm transition-colors"
                      placeholder="First name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full px-3 py-3 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm transition-colors"
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm transition-colors"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm transition-colors"
                    placeholder="+234 XXX XXX XXXX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                  Account Type
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm transition-colors"
                >
                  <option value="buyer">Vendor</option>
                  <option value="seller">Customer</option>
                  <option value="rider">Rider</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Security */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm transition-colors"
                    placeholder="Create a strong password"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-10 py-3 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm transition-colors"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-yellow-400 transition-colors" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-yellow-400 transition-colors" />
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400">Passwords don&rsquo;t match</p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Password Requirements:</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li className={formData.password.length >= 8 ? 'text-green-400' : ''}>
                    • At least 8 characters long
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'text-green-400' : ''}>
                    • Contains uppercase letter
                  </li>
                  <li className={/[a-z]/.test(formData.password) ? 'text-green-400' : ''}>
                    • Contains lowercase letter
                  </li>
                  <li className={/\d/.test(formData.password) ? 'text-green-400' : ''}>
                    • Contains a number
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Terms and Conditions */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Almost Done!</h3>
                <p className="text-gray-300 text-sm mb-4">
                  You&rsquo;re about to join Olament and start digitizing Africa&rsquo;s local markets. 
                  Please review and accept our terms to complete your registration.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-start">
                    <input
                      id="agreeToTerms"
                      name="agreeToTerms"
                      type="checkbox"
                      required
                      checked={formData.agreeToTerms}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-yellow-400 bg-gray-800 border-gray-600 rounded focus:ring-yellow-400 focus:ring-2 mt-0.5"
                    />
                    <label htmlFor="agreeToTerms" className="ml-3 text-sm text-gray-300">
                      I agree to the{' '}
                      <Link href="/terms" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-yellow-400 hover:text-yellow-300 transition-colors">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <div className="flex items-start">
                    <input
                      id="agreeToMarketing"
                      name="agreeToMarketing"
                      type="checkbox"
                      checked={formData.agreeToMarketing}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-yellow-400 bg-gray-800 border-gray-600 rounded focus:ring-yellow-400 focus:ring-2 mt-0.5"
                    />
                    <label htmlFor="agreeToMarketing" className="ml-3 text-sm text-gray-300">
                      I&rsquo;d like to receive updates about new features and market opportunities (optional)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between space-x-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex-1 py-3 px-4 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors"
              >
                Previous
              </button>
            )}

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={
                  (currentStep === 1 && !isStep1Valid) ||
                  (currentStep === 2 && !isStep2Valid)
                }
                className="flex-1 py-3 px-4 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <div className="flex items-center justify-center">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </button>
            ) : (
              <button
                type="submit"
                disabled={!isStep3Valid || isLoading}
                className="flex-1 py-3 px-4 bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    Create Account
                    <CheckCircle className="ml-2 h-4 w-4" />
                  </div>
                )}
              </button>
            )}
          </div>

          {/* Sign in link */}
          <div className="text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors">
                Sign in here
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