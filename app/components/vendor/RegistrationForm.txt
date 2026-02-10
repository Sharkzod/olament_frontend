'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, User, Phone, Mail, MapPin, 
  Shield, CreditCard, FileText, Globe, 
  Loader2, CheckCircle, AlertCircle,
  ArrowLeft, Store, Banknote, IdCard,
  Upload, X
} from 'lucide-react';
import { useVendorCheck } from '@/app/lib/hooks/useVendorCheck';
import { useAuth } from '@/app/lib/hooks/useAuthApi';
import './RegistrationForm.css';

interface Country {
  code: string;
  name: string;
  example: string;
}

interface FormData {
  // Personal Information
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  
  // Business Information
  businessName: string;
  businessType: 'individual' | 'company' | 'partnership';
  businessDescription: string;
  
  // Identity Verification
  identityNumber: string;
  identityCountry: string;
  identityType: 'national_id' | 'passport' | 'drivers_license' | 'tax_id' | 'other';
  
  // Address
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
  };
  
  // Bank Details
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  
  // Tax Information
  taxId: string;
  
  // Documents
  identityDocuments: {
    front: File | null;
    back: File | null;
  };
  
  // Terms
  agreeTerms: boolean;
  receiveMarketing: boolean;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  phone: '',
  businessName: '',
  businessType: 'individual',
  businessDescription: '',
  identityNumber: '',
  identityCountry: 'NG',
  identityType: 'national_id',
  address: {
    street: '',
    city: '',
    state: '',
    country: '',
    zipCode: ''
  },
  bankDetails: {
    accountName: '',
    accountNumber: '',
    bankName: '',
    ifscCode: ''
  },
  taxId: '',
  identityDocuments: {
    front: null,
    back: null
  },
  agreeTerms: false,
  receiveMarketing: true
};

export default function VendorRegistrationForm() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { isVendor, isApproved, isLoading: checkingStatus } = useVendorCheck();
  
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [countries, setCountries] = useState<Country[]>([]);
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  // Redirect if already a vendor
  useEffect(() => {
    if (!checkingStatus && isVendor && isApproved) {
      router.push('/vendor/dashboard');
    }
  }, [checkingStatus, isVendor, isApproved, router]);

  // Load supported countries
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch('/api/vendors/supported-countries');
        const data = await response.json();
        if (data.success) {
          setCountries(data.countries);
        }
      } catch (error) {
        console.error('Error loading countries:', error);
      }
    };
    
    loadCountries();
  }, []);

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const validateIdentity = async () => {
    if (!formData.identityNumber || !formData.identityCountry) {
      setErrors(prev => ({
        ...prev,
        identityNumber: 'Identity number and country are required'
      }));
      return;
    }

    setIsValidating(true);
    setServerError('');

    try {
      const response = await fetch('/api/vendors/validate-identity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identityNumber: formData.identityNumber,
          countryCode: formData.identityCountry
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setValidationResult(data);
        if (data.isRegistered) {
          setErrors(prev => ({
            ...prev,
            identityNumber: 'This identity number is already registered'
          }));
        }
      } else {
        setErrors(prev => ({
          ...prev,
          identityNumber: data.message || 'Invalid identity number'
        }));
        setValidationResult(null);
      }
    } catch (error) {
      setServerError('Failed to validate identity');
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof FormData] as any),
          [child]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      }));
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleFileChange = (field: 'front' | 'back', file: File | null) => {
    if (file && file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        [field]: 'File size must be less than 5MB'
      }));
      return;
    }

    if (file && !['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'].includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        [field]: 'Only JPEG, PNG, and PDF files are allowed'
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      identityDocuments: {
        ...prev.identityDocuments,
        [field]: file
      }
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.businessName.trim()) newErrors.businessName = 'Business name is required';
      if (!formData.businessType) newErrors.businessType = 'Business type is required';
      if (!formData.taxId.trim()) newErrors.taxId = 'Tax ID is required';
      if (!formData.identityNumber.trim()) newErrors.identityNumber = 'Identity number is required';
      if (!formData.identityCountry) newErrors.identityCountry = 'Country is required';
      
      // Only show validation error if validation was attempted and failed
      if (validationResult && !validationResult.isValid) {
        newErrors.identityNumber = validationResult.message;
      }
    }

    if (step === 2) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.address.street.trim()) newErrors['address.street'] = 'Street address is required';
      if (!formData.address.city.trim()) newErrors['address.city'] = 'City is required';
      if (!formData.address.country.trim()) newErrors['address.country'] = 'Country is required';
    }

    if (step === 3) {
      if (!formData.bankDetails.accountName.trim()) newErrors['bankDetails.accountName'] = 'Account name is required';
      if (!formData.bankDetails.accountNumber.trim()) newErrors['bankDetails.accountNumber'] = 'Account number is required';
      if (!formData.bankDetails.bankName.trim()) newErrors['bankDetails.bankName'] = 'Bank name is required';
      
      if (!formData.identityDocuments.front) newErrors.front = 'Front identity document is required';
      if (!formData.identityDocuments.back) newErrors.back = 'Back identity document is required';
      
      if (!formData.agreeTerms) newErrors.agreeTerms = 'You must agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(activeStep)) {
      return;
    }

    if (activeStep < 4) {
      setActiveStep(prev => prev + 1);
      return;
    }

    // Final validation
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      setActiveStep(1);
      return;
    }

    setIsSubmitting(true);
    setServerError('');

    try {
      // Prepare form data
      const formDataToSend = new FormData();
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (key === 'identityDocuments') return;
        if (key === 'address' || key === 'bankDetails') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, String(formData[key as keyof FormData]));
        }
      });

      // Add files
      if (formData.identityDocuments.front) {
        formDataToSend.append('front', formData.identityDocuments.front);
      }
      if (formData.identityDocuments.back) {
        formDataToSend.append('back', formData.identityDocuments.back);
      }

      const response = await fetch('/api/vendors/register', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Store token if provided
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        
        // Redirect after 3 seconds
        setTimeout(() => {
          router.push('/vendor/dashboard');
        }, 3000);
      } else {
        setServerError(data.message || 'Registration failed');
      }
    } catch (error) {
      setServerError('An error occurred during registration');
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
    } else {
      router.back();
    }
  };

  // Show loading while checking vendor status
  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          <p className="mt-3 text-gray-600">Checking vendor status...</p>
        </div>
      </div>
    );
  }

  // Show nothing if user is already a vendor (will redirect)
  if (isVendor && isApproved) {
    return null;
  }

  const renderStepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === activeStep 
                ? 'bg-gray-900 text-white' 
                : step < activeStep 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {step < activeStep ? <CheckCircle className="h-5 w-5" /> : step}
            </div>
            <div className="mt-2 text-xs font-medium">
              {step === 1 && 'Business'}
              {step === 2 && 'Personal'}
              {step === 3 && 'Documents'}
              {step === 4 && 'Review'}
            </div>
          </div>
        ))}
      </div>
      <div className="relative mt-2">
        <div className="absolute top-0 left-0 h-1 bg-gray-200 w-full"></div>
        <div 
          className="absolute top-0 left-0 h-1 bg-gray-900 transition-all duration-300"
          style={{ width: `${((activeStep - 1) / 3) * 100}%` }}
        ></div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Business Information
        </h3>
        <p className="text-gray-600 text-sm">Tell us about your business</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Name *
          </label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border ${errors.businessName ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400`}
            placeholder="Enter your business name"
          />
          {errors.businessName && <p className="mt-1 text-sm text-red-600">{errors.businessName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Type *
          </label>
          <select
            name="businessType"
            value={formData.businessType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
          >
            <option value="individual">Individual/Sole Proprietor</option>
            <option value="company">Company/Corporation</option>
            <option value="partnership">Partnership</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tax ID / Registration Number *
          </label>
          <input
            type="text"
            name="taxId"
            value={formData.taxId}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border ${errors.taxId ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400`}
            placeholder="e.g., TIN-1234567890"
          />
          {errors.taxId && <p className="mt-1 text-sm text-red-600">{errors.taxId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Business Description
          </label>
          <textarea
            name="businessDescription"
            value={formData.businessDescription}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
            placeholder="Describe your business, products, and services..."
          />
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Identity Verification
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <select
              name="identityCountry"
              value={formData.identityCountry}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="">Select Country</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
            {errors.identityCountry && <p className="mt-1 text-sm text-red-600">{errors.identityCountry}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Identity Type
            </label>
            <select
              name="identityType"
              value={formData.identityType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
            >
              <option value="national_id">National ID</option>
              <option value="passport">Passport</option>
              <option value="drivers_license">Driver's License</option>
              <option value="tax_id">Tax ID</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Identity Number *
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              name="identityNumber"
              value={formData.identityNumber}
              onChange={handleInputChange}
              onBlur={validateIdentity}
              className={`flex-1 px-4 py-3 border ${errors.identityNumber ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400`}
              placeholder={countries.find(c => c.code === formData.identityCountry)?.example || 'Enter identity number'}
            />
            <button
              type="button"
              onClick={validateIdentity}
              disabled={isValidating || !formData.identityNumber || !formData.identityCountry}
              className="px-4 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isValidating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Verify'}
            </button>
          </div>
          {errors.identityNumber && <p className="mt-1 text-sm text-red-600">{errors.identityNumber}</p>}
          
          {validationResult && (
            <div className={`mt-2 p-3 rounded-lg ${validationResult.isValid ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              <div className="flex items-center gap-2">
                {validationResult.isValid ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <span className="text-sm font-medium">{validationResult.message}</span>
              </div>
              {validationResult.isRegistered && (
                <p className="text-sm mt-1">
                  This identity is registered to: {validationResult.existingVendor?.name}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <User className="h-5 w-5" />
          Personal Information
        </h3>
        <p className="text-gray-600 text-sm">Tell us about yourself</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${errors.name ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400`}
              placeholder="John Doe"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400`}
              placeholder="john@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${errors.phone ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400`}
              placeholder="+234 801 234 5678"
            />
            {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400`}
              placeholder="••••••••"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password *
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Business Address
        </h4>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address *
            </label>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${errors['address.street'] ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400`}
              placeholder="123 Main Street"
            />
            {errors['address.street'] && <p className="mt-1 text-sm text-red-600">{errors['address.street']}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="address.city"
                value={formData.address.city}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border ${errors['address.city'] ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400`}
                placeholder="Lagos"
              />
              {errors['address.city'] && <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                name="address.state"
                value={formData.address.state}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Lagos State"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zip Code
              </label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="100001"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country *
            </label>
            <input
              type="text"
              name="address.country"
              value={formData.address.country}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${errors['address.country'] ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400`}
              placeholder="Nigeria"
            />
            {errors['address.country'] && <p className="mt-1 text-sm text-red-600">{errors['address.country']}</p>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Bank Details & Documents
        </h3>
        <p className="text-gray-600 text-sm">For payments and verification</p>
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-bold text-gray-900 mb-2">Bank Information</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name *
            </label>
            <input
              type="text"
              name="bankDetails.accountName"
              value={formData.bankDetails.accountName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${errors['bankDetails.accountName'] ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400`}
              placeholder="John Doe"
            />
            {errors['bankDetails.accountName'] && <p className="mt-1 text-sm text-red-600">{errors['bankDetails.accountName']}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number *
            </label>
            <input
              type="text"
              name="bankDetails.accountNumber"
              value={formData.bankDetails.accountNumber}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${errors['bankDetails.accountNumber'] ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400`}
              placeholder="0123456789"
            />
            {errors['bankDetails.accountNumber'] && <p className="mt-1 text-sm text-red-600">{errors['bankDetails.accountNumber']}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name *
            </label>
            <input
              type="text"
              name="bankDetails.bankName"
              value={formData.bankDetails.bankName}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border ${errors['bankDetails.bankName'] ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400`}
              placeholder="First Bank"
            />
            {errors['bankDetails.bankName'] && <p className="mt-1 text-sm text-red-600">{errors['bankDetails.bankName']}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IFSC/Sort Code
            </label>
            <input
              type="text"
              name="bankDetails.ifscCode"
              value={formData.bankDetails.ifscCode}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-400"
              placeholder="FIRSTNGLA"
            />
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <h4 className="text-md font-bold text-gray-900 mb-4 flex items-center gap-2">
          <IdCard className="h-5 w-5" />
          Identity Documents
        </h4>
        <p className="text-gray-600 text-sm mb-4">Upload clear images of your identity document</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Front of Document *
            </label>
            <FileUpload
              file={formData.identityDocuments.front}
              onFileChange={(file) => handleFileChange('front', file)}
              accept="image/*,.pdf"
              error={errors.front}
            />
            <p className="text-xs text-gray-500 mt-2">JPEG, PNG, PDF (Max 5MB)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Back of Document *
            </label>
            <FileUpload
              file={formData.identityDocuments.back}
              onFileChange={(file) => handleFileChange('back', file)}
              accept="image/*,.pdf"
              error={errors.back}
            />
            <p className="text-xs text-gray-500 mt-2">JPEG, PNG, PDF (Max 5MB)</p>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleInputChange}
            id="agreeTerms"
            className="mt-1"
          />
          <div>
            <label htmlFor="agreeTerms" className="text-sm font-medium text-gray-700">
              I agree to the Terms of Service and Privacy Policy *
            </label>
            {errors.agreeTerms && <p className="mt-1 text-sm text-red-600">{errors.agreeTerms}</p>}
            <p className="text-xs text-gray-500 mt-1">
              By checking this box, you confirm that all information provided is accurate and you agree to our terms.
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-start space-x-3">
          <input
            type="checkbox"
            name="receiveMarketing"
            checked={formData.receiveMarketing}
            onChange={handleInputChange}
            id="receiveMarketing"
            className="mt-1"
          />
          <label htmlFor="receiveMarketing" className="text-sm text-gray-700">
            Receive marketing emails and updates about new features
          </label>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Review & Submit</h3>
        <p className="text-gray-600 text-sm">Please review all information before submitting</p>
      </div>

      <div className="space-y-6">
        {/* Business Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Business Information
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Business Name</p>
              <p className="font-medium">{formData.businessName}</p>
            </div>
            <div>
              <p className="text-gray-600">Business Type</p>
              <p className="font-medium capitalize">{formData.businessType}</p>
            </div>
            <div>
              <p className="text-gray-600">Tax ID</p>
              <p className="font-medium">{formData.taxId}</p>
            </div>
            <div>
              <p className="text-gray-600">Identity Verified</p>
              <p className="font-medium">{validationResult?.isValid ? '✓ Valid' : 'Not verified'}</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Personal Information
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Full Name</p>
              <p className="font-medium">{formData.name}</p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">{formData.email}</p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-medium">{formData.phone}</p>
            </div>
            <div>
              <p className="text-gray-600">Address</p>
              <p className="font-medium">{formData.address.street}, {formData.address.city}</p>
            </div>
          </div>
        </div>

        {/* Bank & Documents */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Bank & Documents
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Bank Account</p>
              <p className="font-medium">{formData.bankDetails.accountName}</p>
              <p className="text-gray-500">{formData.bankDetails.bankName} - {formData.bankDetails.accountNumber}</p>
            </div>
            <div>
              <p className="text-gray-600">Documents Uploaded</p>
              <p className="font-medium">
                {formData.identityDocuments.front ? '✓ Front' : '✗ Front'}
                {' • '}
                {formData.identityDocuments.back ? '✓ Back' : '✗ Back'}
              </p>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Terms & Conditions
          </h4>
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                readOnly
                className="h-4 w-4"
              />
              <span>Agreed to Terms of Service and Privacy Policy</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.receiveMarketing}
                readOnly
                className="h-4 w-4"
              />
              <span>Marketing communications: {formData.receiveMarketing ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-blue-900 mb-1">Important Information</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Your application will be reviewed within 2-3 business days</li>
              <li>• You'll receive an email notification once approved</li>
              <li>• Ensure all information is accurate to avoid delays</li>
              <li>• You can track your application status in your dashboard</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-10 w-10 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-3">Application Submitted!</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Your vendor application has been submitted for review. 
        You'll receive an email notification once it's approved. 
        This usually takes 2-3 business days.
      </p>
      <div className="space-y-4 max-w-md mx-auto">
        <div className="bg-gray-50 rounded-lg p-4 text-left">
          <h4 className="font-bold text-gray-900 mb-2">Next Steps:</h4>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Check your email for confirmation</li>
            <li>Complete your business profile after approval</li>
            <li>Set up your first shop</li>
            <li>Start adding products to sell</li>
          </ol>
        </div>
        <p className="text-sm text-gray-500">
          Redirecting to dashboard in 3 seconds...
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-4 w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div>
              <div className="text-lg font-bold text-black">Become a Vendor</div>
              <div className="text-xs text-gray-600">Sell your products on our platform</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {!user ? (
              <button
                onClick={() => router.push('/login')}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Login
              </button>
            ) : (
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user.name}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        {success ? (
          renderSuccess()
        ) : (
          <>
            {renderStepIndicator()}
            
            {serverError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-red-700">{serverError}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {activeStep === 1 && renderStep1()}
              {activeStep === 2 && renderStep2()}
              {activeStep === 3 && renderStep3()}
              {activeStep === 4 && renderStep4()}

              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-6 py-3 border border-gray-300 text-sm font-semibold rounded-lg hover:bg-gray-50"
                  >
                    Back
                  </button>
                  
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {activeStep === 4 ? 'Submitting...' : 'Processing...'}
                      </>
                    ) : activeStep === 4 ? (
                      'Submit Application'
                    ) : (
                      'Continue'
                    )}
                  </button>
                </div>
              </div>
            </form>

            {activeStep === 4 && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  By submitting, you confirm that all information provided is accurate and complete.
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// File Upload Component
interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept: string;
  error?: string;
}

function FileUpload({ file, onFileChange, accept, error }: FileUploadProps) {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
  };

  const handleRemove = () => {
    onFileChange(null);
  };

  return (
    <div>
      <div className={`border-2 border-dashed ${error ? 'border-red-300' : 'border-gray-300'} rounded-lg p-6 text-center transition-colors hover:border-gray-400`}>
        <input
          type="file"
          onChange={handleFileSelect}
          accept={accept}
          className="hidden"
          id="file-upload"
        />
        
        {file ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-gray-400" />
                <div className="text-left">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        ) : (
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPEG, PNG, PDF up to 5MB
                </p>
              </div>
            </div>
          </label>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}