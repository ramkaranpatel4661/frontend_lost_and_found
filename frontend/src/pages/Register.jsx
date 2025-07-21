import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Eye, EyeOff, Search, Mail, Lock, User, Phone, MapPin, Shield } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Register = () => {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showOTPVerification, setShowOTPVerification] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [verifyingOTP, setVerifyingOTP] = useState(false)
  const [resendingOTP, setResendingOTP] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    try {
      setIsLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (response.ok) {
        if (result.requiresVerification) {
          setUserEmail(data.email)
          setShowOTPVerification(true)
          toast.success('Registration successful! Please check your email for verification code.')
        } else {
          await registerUser(data)
          navigate('/')
        }
      } else {
        toast.error(result.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPVerification = async () => {
    if (!otp.trim()) {
      toast.error('Please enter the OTP')
      return
    }

    try {
      setVerifyingOTP(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          otp: otp.trim()
        }),
      })

      const result = await response.json()

      if (response.ok) {
        localStorage.setItem('token', result.token)
        toast.success('Email verified successfully!')
        navigate('/')
      } else {
        toast.error(result.message || 'OTP verification failed')
      }
    } catch (error) {
      console.error('OTP verification error:', error)
      toast.error('OTP verification failed')
    } finally {
      setVerifyingOTP(false)
    }
  }

  const handleResendOTP = async () => {
    try {
      setResendingOTP(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success('OTP sent successfully!')
      } else {
        toast.error(result.message || 'Failed to resend OTP')
      }
    } catch (error) {
      console.error('Resend OTP error:', error)
      toast.error('Failed to resend OTP')
    } finally {
      setResendingOTP(false)
    }
  }

  if (showOTPVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Link to="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                <Search className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Lost & Found</span>
            </Link>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600">
              We've sent a 6-digit code to <strong>{userEmail}</strong>
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="space-y-6">
              <div>
                <label className="form-label">Enter Verification Code</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="form-input text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>

              <button
                onClick={handleOTPVerification}
                disabled={verifyingOTP || !otp.trim()}
                className="btn-primary w-full"
              >
                {verifyingOTP ? 'Verifying...' : 'Verify Email'}
              </button>

              <div className="text-center">
                <p className="text-gray-600 mb-2">Didn't receive the code?</p>
                <button
                  onClick={handleResendOTP}
                  disabled={resendingOTP}
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  {resendingOTP ? 'Sending...' : 'Resend Code'}
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => setShowOTPVerification(false)}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Registration
            </button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
              <Search className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Lost & Found</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Create your account
          </h2>
          <p className="text-gray-600">
            Join our community and help reunite lost items
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="form-label">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                {...register('name', {
                  required: 'Name is required',
                  minLength: { value: 2, message: 'Name must be at least 2 characters' },
                  maxLength: { value: 50, message: 'Name cannot exceed 50 characters' }
                })}
                className="form-input"
                placeholder="Enter your full name"
                autoComplete="name"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="form-label">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                    message: 'Please enter a valid email address'
                  }
                })}
                className="form-input"
                placeholder="Enter your email"
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="form-label">
                <Lock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  className="form-input pr-10"
                  placeholder="Create a password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label className="form-label">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                {...register('phone', {
                  pattern: {
                    value: /^\+?[\d\s-()]+$/,
                    message: 'Please enter a valid phone number'
                  }
                })}
                className="form-input"
                placeholder="Enter your phone number"
                autoComplete="tel"
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="form-label">
                <MapPin className="w-4 h-4 inline mr-2" />
                Location (Optional)
              </label>
              <input
                type="text"
                {...register('location')}
                className="form-input"
                placeholder="City, State"
                autoComplete="address-level2"
              />
            </div>

            <div className="flex items-start">
              <input
                type="checkbox"
                required
                className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">Terms of Service</a>{' '}
                and{' '}
                <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">Privacy Policy</a>
              </label>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-500 mb-4">Join thousands of users helping reunite lost items</p>
          <div className="flex justify-center space-x-6 text-xs text-gray-400">
            <span>✓ Free to join</span>
            <span>✓ Secure platform</span>
            <span>✓ Community support</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
