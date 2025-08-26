import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, TextInput, FileInput } from 'flowbite-react';
import { RegisterUser, login } from '../features/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import { createSelector } from '@reduxjs/toolkit';

// Memoized selector for user state
const selectUserState = state => state.users; // Fixed from state.users
const selectUserData = createSelector(
  [selectUserState],
  userState => ({
    error: userState.error,
    isAuthenticated: userState.isAuthenticated,
    users: userState.users,
    logInEmail: userState.logInEmail,
    logInName: userState.logInName,
  })
);

function SignUpForm({ setSignUpPage, showToast, setLoginPage, setIsLogin }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    image: '',
    shippingAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: ''
    }
  });
  const [previewImage, setPreviewImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { error, isAuthenticated, users, logInEmail, logInName } = useSelector(selectUserData);

  // Animation setup
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Clean up image preview to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  // Handle authentication state
  useEffect(() => {
    if (isAuthenticated && logInEmail && logInName) {
      setIsLogin(true);
      showToast('Welcome back!', 'success');
      navigate('/');
      setSignUpPage(false);
    }
  }, [isAuthenticated, logInEmail, logInName, navigate, setSignUpPage, showToast, setIsLogin]);

  // Handle errors from Redux
  useEffect(() => {
    if (error) showToast(error, 'error');
  }, [error, showToast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('shippingAddress.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        shippingAddress: {
          ...formData.shippingAddress,
          [addressField]: value
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const moveToLogin = () => {
    setSignUpPage(false);
    setLoginPage(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match('image.*')) {
      setErrors({ ...errors, image: 'Please select an image file' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors({ ...errors, image: 'Image must be <2MB' });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setFormData({ ...formData, image: imageUrl });
    setPreviewImage(imageUrl);
    if (errors.image) setErrors({ ...errors, image: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Required';
    if (!formData.email.trim()) newErrors.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email';
    else if (users.some(u => u.email === formData.email)) newErrors.email = 'Email exists';
    if (!formData.password) newErrors.password = 'Required';
    else if (formData.password.length < 6) newErrors.password = 'Min 6 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords mismatch';
    if (!formData.shippingAddress.addressLine1.trim()) newErrors['shippingAddress.addressLine1'] = 'Required';
    if (!formData.shippingAddress.city.trim()) newErrors['shippingAddress.city'] = 'Required'; // Fixed from portfolio()
    if (!formData.shippingAddress.state.trim()) newErrors['shippingAddress.state'] = 'Required';
    if (!formData.shippingAddress.postalCode.trim()) newErrors['shippingAddress.postalCode'] = 'Required';
    if (!formData.shippingAddress.country.trim()) newErrors['shippingAddress.country'] = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsSubmitting(true);
  try {
    const userData = {
      // Remove the manual ID generation - backend will auto-generate
      name: formData.name,
      email: formData.email,
      password: formData.password,
      image: formData.image,
      shippingAddress: formData.shippingAddress
    };

    // Register the user first
    const registerResult = await dispatch(RegisterUser(userData));
    
    if (RegisterUser.fulfilled.match(registerResult)) {
      // Registration successful, now attempt login
      const loginResult = await dispatch(login({
        email: formData.email,
        password: formData.password,
      }));
      
      if (login.fulfilled.match(loginResult)) {
        // Login successful
        setIsLogin(true);
        showToast('Registration and login successful! Welcome!', 'success');
        navigate('/');
        setSignUpPage(false);
      } else {
        // Login failed, but registration was successful
        showToast('Registration successful! Please log in manually.', 'success');
        moveToLogin();
      }
    } else {
      // Registration failed
      const errorMessage = registerResult.payload || 'Registration failed';
      showToast(errorMessage, 'error');
    }
  } catch (err) {
    console.error('Registration error:', err);
    showToast('An unexpected error occurred during registration.', 'error');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className={`
      w-full max-w-lg p-4 bg-white rounded-lg shadow-xl mx-auto
      transition-all duration-300 ease-out
      ${isMounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
    `}>
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center space-x-2">
          <img 
            src="VibeMart1.png"
            alt="VibeMart Logo" 
            className="h-8 w-auto object-contain" 
          />
          <h2 className="text-xl font-bold text-gray-800">Sign Up</h2>
        </div>
        <button 
          onClick={() => setSignUpPage(false)}
          className="text-gray-500 hover:text-gray-700 text-lg transition-colors"
          aria-label="Close sign up form"
        >
          &times;
        </button>
      </div>

      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="flex justify-center">
          <div className="flex flex-col items-center">
            <label 
              htmlFor="avatar-upload" 
              className="cursor-pointer group relative flex flex-col items-center"
              title="Upload profile picture"
            >
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 mb-1 transition-all duration-200 group-hover:border-indigo-400">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <svg 
                      className="w-6 h-6 text-gray-400 group-hover:text-indigo-500 transition-colors" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                )}
              </div>
              <span className="text-xs text-blue-600 hover:text-blue-800 transition-colors">
                {previewImage ? 'Change image' : 'Add profile image'}
              </span>
              <FileInput
                id="avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={isSubmitting}
              />
            </label>
            {errors.image && (
              <span className="text-xs text-red-500 mt-1 text-center">{errors.image}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <TextInput
              id="name"
              type="text"
              placeholder="Full Name"
              required
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              color={errors.name ? "failure" : ""}
              className="w-full"
            />
            {errors.name && (
              <span className="text-xs text-red-500 mt-1">{errors.name}</span>
            )}
          </div>

          <div>
            <TextInput
              id="email"
              type="email"
              placeholder="Email Address"
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
              color={errors.email ? "failure" : ""}
              className="w-full"
            />
            {errors.email && (
              <span className="text-xs text-red-500 mt-1">{errors.email}</span>
            )}
          </div>

          <div>
            <TextInput
              id="password"
              type="password"
              placeholder="Password (min 6 characters)"
              required
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
              color={errors.password ? "failure" : ""}
              className="w-full"
            />
            {errors.password && (
              <span className="text-xs text-red-500 mt-1">{errors.password}</span>
            )}
          </div>

          <div>
            <TextInput
              id="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              required
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={isSubmitting}
              color={errors.confirmPassword ? "failure" : ""}
              className="w-full"
            />
            {errors.confirmPassword && (
              <span className="text-xs text-red-500 mt-1">{errors.confirmPassword}</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-800">Shipping Address</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <TextInput
                id="addressLine1"
                type="text"
                placeholder="Address Line 1"
                required
                name="shippingAddress.addressLine1"
                value={formData.shippingAddress.addressLine1}
                onChange={handleChange}
                disabled={isSubmitting}
                color={errors['shippingAddress.addressLine1'] ? "failure" : ""}
                className="w-full"
              />
              {errors['shippingAddress.addressLine1'] && (
                <span className="text-xs text-red-500 mt-1">{errors['shippingAddress.addressLine1']}</span>
              )}
            </div>
            <div>
              <TextInput
                id="addressLine2"
                type="text"
                placeholder="Address Line 2 (optional)"
                name="shippingAddress.addressLine2"
                value={formData.shippingAddress.addressLine2}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full"
              />
            </div>
            <div>
              <TextInput
                id="city"
                type="text"
                placeholder="City"
                required
                name="shippingAddress.city"
                value={formData.shippingAddress.city}
                onChange={handleChange}
                disabled={isSubmitting}
                color={errors['shippingAddress.city'] ? "failure" : ""}
                className="w-full"
              />
              {errors['shippingAddress.city'] && (
                <span className="text-xs text-red-500 mt-1">{errors['shippingAddress.city']}</span>
              )}
            </div>
            <div>
              <TextInput
                id="state"
                type="text"
                placeholder="State"
                required
                name="shippingAddress.state"
                value={formData.shippingAddress.state}
                onChange={handleChange}
                disabled={isSubmitting}
                color={errors['shippingAddress.state'] ? "failure" : ""}
                className="w-full"
              />
              {errors['shippingAddress.state'] && (
                <span className="text-xs text-red-500 mt-1">{errors['shippingAddress.state']}</span>
              )}
            </div>
            <div>
              <TextInput
                id="postalCode"
                type="text"
                placeholder="Postal Code"
                required
                name="shippingAddress.postalCode"
                value={formData.shippingAddress.postalCode}
                onChange={handleChange}
                disabled={isSubmitting}
                color={errors['shippingAddress.postalCode'] ? "failure" : ""}
                className="w-full"
              />
              {errors['shippingAddress.postalCode'] && (
                <span className="text-xs text-red-500 mt-1">{errors['shippingAddress.postalCode']}</span>
              )}
            </div>
            <div>
              <TextInput
                id="country"
                type="text"
                placeholder="Country"
                required
                name="shippingAddress.country" // Fixed from tranquila
                value={formData.shippingAddress.country}
                onChange={handleChange}
                disabled={isSubmitting}
                color={errors['shippingAddress.country'] ? "failure" : ""}
                className="w-full"
              />
              {errors['shippingAddress.country'] && (
                <span className="text-xs text-red-500 mt-1">{errors['shippingAddress.country']}</span>
              )}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800
            text-white py-1.5 rounded-lg transition-all duration-300
            ${isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:shadow-md'}`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </span>
          ) : (
            'Create Account'
          )}
        </Button>

        <div className="text-sm text-center text-gray-600 pt-1">
          Already have an account?{' '}
          <button 
            type="button"
            onClick={moveToLogin}
            className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline focus:outline-none transition-colors"
          >
            Log In
          </button>
        </div>
      </form>
    </div>
  );
}

export default SignUpForm;