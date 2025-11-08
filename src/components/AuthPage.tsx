import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Wallet,
  Shield,
  Zap,
  Globe,
  Building,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';

interface AuthPageProps {
  onAuth: (companyName: string) => void;
  onBack: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuth, onBack }) => {
  const { signUp, signIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (isSignUp) {
      if (!formData.companyName.trim()) {
        setError('Company name is required');
        return false;
      }
      if (!formData.name.trim()) {
        setError('Full name is required');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }
    
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    if (!formData.password.trim()) {
      setError('Password is required');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      if (isSignUp) {
        await signUp(formData.email, formData.password, formData.companyName);
        // For demo purposes, proceed immediately. In production, you'd wait for email confirmation
        onAuth(formData.companyName);
      } else {
        await signIn(formData.email, formData.password);
        // Get company name from user profile and proceed
        onAuth('My Company'); // This will be updated when we fetch the actual user profile
      }
    } catch (err) {
      console.error('Auth error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <button
              onClick={onBack}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>Back to Home</span>
            </button>
            
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gemtra
                </h1>
                
              </div>
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
          </div>

          {/* Auth Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-8">
            <button
              onClick={() => {
                setIsSignUp(true);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                isSignUp
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => {
                setIsSignUp(false);
                setError('');
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                !isSignUp
                  ? 'bg-gray-900 text-white shadow-lg'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                
                <span className="text-red-800 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Enter your company name"
                      className="input-field w-full focus:outline-none"
                      required={isSignUp}
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="input-field w-full focus:outline-none"
                      required={isSignUp}
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
              
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="input-field w-full focus:outline-none"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
              
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="input-field w-full  pr-10 focus:outline-none"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-900"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                 
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your password"
                    className="input-field w-full focus:outline-none"
                    required={isSignUp}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {!isSignUp && (
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-600 text-gray-900 focus:ring-gray-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <button type="button" className="text-sm text-gray-700 hover:text-gray-900 ">
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full btn-primary text-lg py-3 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                </div>
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-5 h-5 inline ml-2" />
                </>
              )}
            </button>
          </form>

          {/* Terms */}
          {isSignUp && (
            <p className="mt-6 text-xs text-gray-500 text-center">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-gray-700 hover:text-gray-900">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-gray-700 hover:text-gray-900">Privacy Policy</a>
            </p>
          )}
        </motion.div>
      </div>

      {/* Right Side - Benefits */}
    
    </div>
  );
};