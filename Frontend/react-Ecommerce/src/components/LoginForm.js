import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, Checkbox, Label, TextInput } from 'flowbite-react';
import { login } from '../features/userSlice.js'
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchCartByUserEmail } from '../features/cartSlice.js';

function LoginForm(props) {

  const { setLoginPage, setIsLogin, showToast, setSignUpPage, setAdminLogin } = props;

  const navigate = useNavigate();

  const defaultVal = {
    email : '',
    password : ''
  }

  const [handle, setHandle] = useState(defaultVal);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHandle({...handle, [name]: value});
  }

  const dispatcher = useDispatch();
  const { isAuthenticated, logInEmail, error } = useSelector(store => store.users);

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  // ✅ Check for admin credentials
  if (handle.email === "admin@gmail.com" && handle.password === "admin") {
    setIsSubmitting(false);
    setLoginPage(false);
    setAdminLogin(true);
    showToast("Welcome Admin!", "success");
    navigate("/adminDashboard");
    return;
  }
  
  console.log('🚀 Login attempt with:', { email: handle.email, password: handle.password });
  
  try {
    const result = await dispatcher(login(handle));
    console.log('📡 Login result:', result);
    
    if (result.type === 'user/login/fulfilled') {
      console.log('✅ Login successful!');
    } else if (result.type === 'user/login/rejected') {
      console.log('❌ Login failed:', result.payload);
      showToast(result.payload || 'Login failed', 'error');
    }
  } catch (error) {
    console.error('🔥 Login error:', error);
    showToast('An unexpected error occurred.', 'error');
  } finally {
    setIsSubmitting(false);
  }
}

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated && logInEmail) {
      setIsLogin(true);
      setLoginPage(false);
      showToast(`Welcome back, ${logInEmail}!`, 'success');
      dispatcher(fetchCartByUserEmail(logInEmail));
    }
  }, [isAuthenticated, logInEmail, setIsLogin, setLoginPage, showToast, dispatcher]);

  // Handle login errors
  useEffect(() => {
    if (error) {
      showToast('Invalid Email or Password', 'error');
    }
  }, [error, isSubmitting, showToast]);

  useEffect(() => {
    document.title = "VibeMart-Login Form";
  }, [])

  return (
    // Remove the redundant styling and let the parent handle positioning
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-lg relative">
      
      {/* Close button */}
      <button 
        onClick={() => setLoginPage(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
      >
        ×
      </button>

      {/* Brand Logo */}
      <div className="flex justify-center mb-4">
        <img
          src="VibeMart1.png"
          alt="VibeMart Logo"
          className="w-20 h-20 object-contain"
        />
      </div>

      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Login Form
      </h2>

      <form className="space-y-6" onSubmit={(e)=>{handleSubmit(e)}}>
        <div>
          <Label htmlFor="email" value="Your email" className="mb-2 block" />
          <TextInput
            id="email"
            type="email"
            placeholder="buyer@gmail.com"
            required
            className="w-full"
            name='email'
            value={handle.email}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>
        <div>
          <Label htmlFor="password" value="Your password" className="mb-2 block" />
          <TextInput
            id="password"
            type="password"
            placeholder="••••••••"
            required
            className="w-full"
            name='password'
            value={handle.password}
            onChange={handleChange}
            disabled={isSubmitting}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox id="remember" />
            <Label htmlFor="remember">Remember me</Label>
          </div>
          <Link
            to="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Enhanced Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-indigo-700 via-indigo-800 to-indigo-900 text-white 
            hover:from-indigo-800 hover:via-indigo-900 hover:to-black 
            transition-all duration-300 ease-in-out shadow-lg text-lg font-semibold py-2 rounded-lg
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Logging In...' : 'Log In'}
        </Button>

        <div className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <button 
            onClick={() => {
              setLoginPage(false);
              setSignUpPage(true);
            }}
            className="text-blue-600 hover:underline focus:outline-none"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;