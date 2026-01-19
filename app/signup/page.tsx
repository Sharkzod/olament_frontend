'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight, CheckCircle, X, AlertCircle } from 'lucide-react'
import apiClient from '../lib/api/apiClient'

// Toast Component
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error' | 'info'; onClose: () => void }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-400" />,
    error: <X className="h-5 w-5 text-red-400" />,
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
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

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
    role: 'customer', // Changed default to match backend
    agreeToTerms: false,
    agreeToMarketing: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  const router = useRouter()

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  // Fix: Make validation functions use correct syntax
  const isStep1Valid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    
    return formData.firstName.trim() && 
           formData.lastName.trim() && 
           formData.email.trim() && 
           emailRegex.test(formData.email) &&
           formData.phone.trim() &&
           phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''));
  }

  const isStep2Valid = () => {
    if (!formData.password || !formData.confirmPassword) return false;
    
    // Password validation rules
    const hasMinLength = formData.password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumber = /\d/.test(formData.password);
    
    return hasMinLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumber &&
           formData.password === formData.confirmPassword;
  }

  const isStep3Valid = formData.agreeToTerms;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (error) setError('')
  }

  // Fix: Separate phone handler to prevent validation issues
  const handlePhoneChange = (value: string) => {
    // Allow only numbers and + at the beginning
    const cleaned = value.replace(/[^\d\+]/g, '');
    // Ensure + is only at the beginning
    const finalValue = cleaned.startsWith('+') ? 
      '+' + cleaned.slice(1).replace(/[^\d]/g, '') : 
      cleaned.replace(/[^\d]/g, '');
    
    setFormData(prev => ({ ...prev, phone: finalValue }));
    
    // Clear phone-related errors when user types
    if (error.includes('phone') || error.includes('Phone')) {
      setError('');
    }
  }

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!isStep1Valid()) {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError('First name and last name are required');
        } else if (!formData.email.trim()) {
          setError('Email address is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          setError('Please enter a valid email address');
        } else if (!formData.phone.trim()) {
          setError('Phone number is required');
        } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
          setError('Please enter a valid phone number');
        }
        showToast('Please fill in all required fields correctly', 'error');
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!isStep2Valid()) {
        if (!formData.password) {
          setError('Password is required');
        } else if (formData.password.length < 8) {
          setError('Password must be at least 8 characters long');
        } else if (!/[A-Z]/.test(formData.password)) {
          setError('Password must contain at least one uppercase letter');
        } else if (!/[a-z]/.test(formData.password)) {
          setError('Password must contain at least one lowercase letter');
        } else if (!/\d/.test(formData.password)) {
          setError('Password must contain at least one number');
        } else if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
        }
        showToast('Please ensure your password meets all requirements', 'error');
        return;
      }
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      setError(''); // Clear errors when moving to next step
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError(''); // Clear errors when going back
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentStep !== 3) return

    setIsLoading(true)
    setError('')

    try {
      // Final validations
      if (!formData.agreeToTerms) {
        setError('You must agree to the terms and conditions')
        showToast('You must agree to the terms and conditions', 'error')
        setIsLoading(false)
        return
      }

      // Prepare data for backend - match backend expectations
      const signupData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`, // Combine for backend
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        role: formData.role,
        agreeToTerms: formData.agreeToTerms,
        agreeToMarketing: formData.agreeToMarketing
      }

      console.log('📝 Signup attempt with data:', { ...signupData, password: '***' })

      // Call the signup API
      const response = await apiClient.post('/auth/register', signupData)
      
      console.log('📝 Signup response:', response.data)
      
      if (response.data.success) {
        // Store token if provided
        if (response.data.token) {
          localStorage.setItem('authToken', response.data.token)
          localStorage.setItem('accessToken', response.data.token)
          console.log('✅ Token stored successfully')
        }
        
        // Store user data
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user))
          console.log('✅ User data stored')
        }
        
        showToast('Account created successfully!', 'success')
        console.log('🎉 Registration successful')
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      } else {
        // Handle server errors
        const errorMessage = response.data.message || 'Registration failed. Please try again.'
        setError(errorMessage)
        showToast(errorMessage, 'error')
        console.error('❌ Server error:', response.data)
      }
    } catch (error: any) {
      console.error('❌ Registration error:', error)
      
      // Handle specific error cases
      if (error.response) {
        const serverError = error.response.data
        console.error('❌ Server response:', serverError)
        
        if (error.response.status === 400) {
          // Validation errors
          if (serverError.errors && serverError.errors.length > 0) {
            const validationError = serverError.errors[0].msg
            setError(validationError)
            showToast(validationError, 'error')
          } else if (serverError.message && serverError.message.includes('already registered')) {
            setError('An account with this email already exists. Please try logging in.')
            showToast('Email already registered', 'error')
          } else {
            setError(serverError.message || 'Please check your information and try again.')
            showToast(serverError.message || 'Please check your information and try again.', 'error')
          }
        } else if (error.response.status === 409) {
          setError('An account with this email already exists. Please try logging in.')
          showToast('Email already registered', 'error')
        } else if (error.response.status === 500) {
          setError('Server error. Please try again later.')
          showToast('Server error. Please try again later.', 'error')
        } else {
          setError('Registration failed. Please try again.')
          showToast('Registration failed. Please try again.', 'error')
        }
      } else if (error.request) {
        console.error('❌ Network error:', error.request)
        setError('Unable to connect to server. Please check your internet connection.')
        showToast('Network error. Please check your connection.', 'error')
      } else {
        console.error('❌ Unknown error:', error.message)
        setError('An unexpected error occurred. Please try again.')
        showToast('An unexpected error occurred. Please try again.', 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Add password strength indicator
  const getPasswordStrength = () => {
    if (!formData.password) return 0;
    
    let strength = 0;
    if (formData.password.length >= 8) strength++;
    if (/[A-Z]/.test(formData.password)) strength++;
    if (/[a-z]/.test(formData.password)) strength++;
    if (/\d/.test(formData.password)) strength++;
    if (/[^A-Za-z0-9]/.test(formData.password)) strength++;
    
    return strength;
  }

  const passwordStrength = getPasswordStrength();
  const strengthColors = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-lime-400', 'text-green-400'];
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];

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
          <h2 className="text-2xl font-semibold text-white mb-2">Join Our Community</h2>
          <p className="text-gray-400">Start digitizing Africa&rsquo;s local markets</p>
        </div>

        {/* Progress Bar */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-gray-400'
              }`}>
                {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
              </div>
              {step < 3 && (
                <div className="w-8 h-0.5 bg-gray-700">
                  <div className={`h-full transition-all duration-300 ${
                    currentStep > step ? 'bg-yellow-400' : 'bg-gray-700'
                  }`} style={{ width: currentStep > step ? '100%' : '0%' }} />
                </div>
              )}
            </div>
          ))}
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
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                    First Name *
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
                    Last Name *
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
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm transition-colors"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number *
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
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 bg-gray-800 border border-gray-700 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm transition-colors"
                    placeholder="+2348123456789"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">Enter your phone number with country code</p>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                  Account Type *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="appearance-none relative block w-full px-3 py-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent sm:text-sm transition-colors"
                >
                  <option value="customer">Customer</option>
                  <option value="seller">Vendor</option>
                  <option value="rider">Rider</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Security */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Password strength:</span>
                      <span className={`text-xs font-medium ${strengthColors[passwordStrength - 1] || 'text-gray-400'}`}>
                        {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                      </span>
                    </div>
                    <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${strengthColors[passwordStrength - 1] || 'bg-red-400'}`}
                        style={{ width: `${(passwordStrength / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm Password *
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
                  <p className="mt-1 text-sm text-red-400 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Passwords don&rsquo;t match
                  </p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="mt-1 text-sm text-green-400 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Passwords match
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Password Requirements:</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li className={formData.password.length >= 8 ? 'text-green-400' : 'text-gray-400'}>
                    • At least 8 characters long
                  </li>
                  <li className={/[A-Z]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}>
                    • Contains at least one uppercase letter (A-Z)
                  </li>
                  <li className={/[a-z]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}>
                    • Contains at least one lowercase letter (a-z)
                  </li>
                  <li className={/\d/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}>
                    • Contains at least one number (0-9)
                  </li>
                  <li className={/[^A-Za-z0-9]/.test(formData.password) ? 'text-green-400' : 'text-gray-400'}>
                    • Contains at least one special character (!@#$%^&*)
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Terms and Conditions */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
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
                      </Link>{' '}
                      *
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
                  (currentStep === 1 && !isStep1Valid()) ||
                  (currentStep === 2 && !isStep2Valid())
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
          <div className="text-center pt-4">
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