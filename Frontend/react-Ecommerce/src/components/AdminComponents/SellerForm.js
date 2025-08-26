import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AddSeller, UpdateSeller } from '../../features/sellerSlice';
import Toast from '../../components/Toast';

// Custom Components
const Button = ({ children, className, type, onClick, disabled }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-6 py-3 rounded-xl font-semibold text-base transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
      disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-purple-600 text-white hover:bg-purple-800'
    } ${className}`}
  >
    {children}
  </button>
);

const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block mb-1.5 text-sm font-semibold text-gray-800">
    {children}
  </label>
);

const TextInput = ({ id, name, value, onChange, type = 'text', required, placeholder }) => (
  <input
    id={id}
    name={name}
    type={type}
    value={value}
    onChange={onChange}
    required={required}
    placeholder={placeholder}
    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-800 placeholder-gray-400"
  />
);

const initialFormState = {
  company: '',
  email: '',
  status: 'active',
};

function SellerForm({ sellerToEdit, onClose, onSectionChange }) {
  const dispatch = useDispatch();
  const sellers = useSelector((state) => state.sellerList?.sellerList || []);

  const [formData, setFormData] = useState(
    sellerToEdit
      ? { ...sellerToEdit }
      : { ...initialFormState }
  );
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false });

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const showToast = (message, type) => {
    setToast({ message, type, isVisible: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      showToast('Please enter a valid email address', 'error');
      setError('Invalid email address');
      return;
    }
    if (sellers.some((seller) => seller.email === formData.email && seller.id !== (sellerToEdit?.id || 0))) {
      showToast('Seller with this email already exists', 'error');
      setError('Email already exists');
      return;
    }
    const sellerData = {
      company: formData.company,
      email: formData.email,
      status: formData.status,
    };
    try {
      if (sellerToEdit) {
        const action = await dispatch(UpdateSeller({ id: sellerToEdit.id, sellerData }));
        if (UpdateSeller.fulfilled.match(action)) {
          showToast('Seller updated successfully', 'success');
        } else {
          throw new Error(action.payload || 'Failed to update seller');

        }
      } else {
        const action = await dispatch(AddSeller(sellerData));
        if (AddSeller.fulfilled.match(action)) {
          showToast('Seller added successfully', 'success');
        } else {
          throw new Error(action.payload || 'Failed to add seller');
        }
      }
      // Reset form fields
      setFormData({ ...initialFormState });
      setError('');
      // Navigate to View Sellers
      if (onSectionChange) {
        setTimeout(() => {
          onSectionChange('viewSellers');
        }, 1000); // Delay to allow toast to be visible
      }
      // Close modal if in edit mode
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 1000); // Delay to allow toast to be visible
      }
    } catch (err) {
      showToast(err.message, 'error');
      setError(err.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-gray-50 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800">{sellerToEdit ? 'Edit Seller' : 'Add Seller'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="company">Company Name</Label>
            <TextInput
              id="company"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              placeholder="Enter company name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <TextInput
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter email address"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-800"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
        <Button type="submit" className="w-full mt-6" disabled={!!error}>
          {sellerToEdit ? 'Update Seller' : 'Add Seller'}
        </Button>
      </form>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}

export default SellerForm;