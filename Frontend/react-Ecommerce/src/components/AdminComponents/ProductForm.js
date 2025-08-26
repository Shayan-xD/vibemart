import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AddProduct, UpdateProduct, resetProductStatus } from '../../features/productSlice';
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

const Textarea = ({ id, name, value, onChange, required, placeholder }) => (
  <textarea
    id={id}
    name={name}
    value={value}
    onChange={onChange}
    required={required}
    placeholder={placeholder}
    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-800 placeholder-gray-400"
  />
);

const Select = ({ id, name, value, onChange, children, disabled, required }) => (
  <select
    id={id}
    name={name}
    value={value}
    onChange={onChange}
    disabled={disabled}
    required={required}
    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-800"
  >
    {children}
  </select>
);

const categories = [
  { name: 'Clothing', subcategories: ['Men', 'Women', 'Kids', 'Shoes', 'Accessories'] },
  { name: 'Gaming', subcategories: ['Consoles', 'Games', 'Accessories', 'Controllers', 'Headsets'] },
  { name: 'Home', subcategories: ['Furniture', 'Kitchen', 'Decor', 'Bedding', 'Appliances'] },
  { name: 'Electronics', subcategories: ['Mobiles', 'Laptops', 'Cameras', 'Tablets', 'Wearables'] },
  { name: 'Sports', subcategories: ['Wearables', 'Equipment', 'Outdoor', 'Footwear', 'Accessories'] },
];

const initialFormState = {
  name: '',
  category: '',
  subCategory: '',
  price: '',
  image: '',
  lifestyleImages: [],
  feature: '',
  description: '',
  stockQuantity: '',
  sellerEmail: '',
};

function ProductForm({ productToEdit, onClose, onSectionChange }) {
  const dispatch = useDispatch();
  const status = useSelector(state => state.products.status);
  const error = useSelector(state => state.products.error);
  const sellers = useSelector(state => state.sellerList?.sellerList || []);

  const [formData, setFormData] = useState(() => {
    if (productToEdit) {
      console.log('ProductForm: Editing product', productToEdit);
      return {
        name: productToEdit.name || '',
        category: productToEdit.category || '',
        subCategory: productToEdit.subCategory || '',
        price: productToEdit.price ? productToEdit.price.toString().replace('$', '') : '',
        image: productToEdit.image || '',
        lifestyleImages: Array.isArray(productToEdit.lifestyleImages) 
          ? productToEdit.lifestyleImages 
          : productToEdit.lifestyleImages?.split(',').map(img => img.trim()) || [],
        feature: Array.isArray(productToEdit.feature) 
          ? productToEdit.feature.join(', ') 
          : productToEdit.feature || '',
        description: productToEdit.description || '',
        stockQuantity: productToEdit.stockQuantity?.toString() || '',
        sellerEmail: productToEdit.sellerEmail || ''
      };
    } else {
      console.log('ProductForm: Adding new product');
      return { ...initialFormState };
    }
  });

  const [imageError, setImageError] = useState('');
  const [mainImageLoading, setMainImageLoading] = useState(false);
  const [lifestyleImageLoading, setLifestyleImageLoading] = useState(false);
  const [toast, setToast] = useState({ 
    message: '', 
    type: 'success', 
    isVisible: false 
  });
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Reset Redux status when the form mounts for editing to avoid stale state
  useEffect(() => {
    if (productToEdit) {
      dispatch(resetProductStatus());
    }
  }, [productToEdit, dispatch]);

  useEffect(() => {
    if (status === 'succeeded' && hasSubmitted) {
      setToast({
        message: productToEdit ? 'Product updated successfully!' : 'Product added successfully!',
        type: 'success',
        isVisible: true
      });

      const timer = setTimeout(() => {
        dispatch(resetProductStatus());
        setHasSubmitted(false);
        if (onSectionChange) onSectionChange('viewProducts');
        if (onClose) onClose();
      }, 1500);

      return () => clearTimeout(timer);
    } else if (status === 'failed' && error && hasSubmitted) {
      setToast({
        message: error,
        type: 'error',
        isVisible: true
      });
      console.error('ProductForm: Redux error', error);
      setHasSubmitted(false);
    }
  }, [status, error, dispatch, productToEdit, onClose, onSectionChange, hasSubmitted]);

  const validateImageFile = (file) => {
    if (!file) {
      console.log('ProductForm: No file selected for upload');
      return false;
    }
    const isValid = file.type.match(/image\/(jpeg|jpg|png|gif)/i) !== null;
    console.log('ProductForm: Image validation', { file: file.name, isValid });
    return isValid;
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (!validateImageFile(file)) {
      setImageError('Please select a valid image file (jpg, png, gif)');
      console.error('ProductForm: Invalid main image file', file?.name);
      return;
    }
    setMainImageLoading(true);
    setImageError('');
    const reader = new FileReader();
    reader.onload = () => {
      console.log('ProductForm: Main image converted to base64');
      setFormData(prev => ({ ...prev, image: reader.result }));
      setMainImageLoading(false);
    };
    reader.onerror = () => {
      setImageError('Failed to read main image');
      console.error('ProductForm: Error reading main image file', file?.name);
      setMainImageLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleLifestyleImageChange = (e) => {
    const file = e.target.files[0];
    if (!validateImageFile(file)) {
      setImageError('Please select a valid image file (jpg, png, gif)');
      console.error('ProductForm: Invalid lifestyle image file', file?.name);
      return;
    }
    setLifestyleImageLoading(true);
    setImageError('');
    const reader = new FileReader();
    reader.onload = () => {
      console.log('ProductForm: Lifestyle image converted to base64');
      setFormData(prev => ({
        ...prev,
        lifestyleImages: [...prev.lifestyleImages, reader.result]
      }));
      setLifestyleImageLoading(false);
    };
    reader.onerror = () => {
      setImageError('Failed to read lifestyle image');
      console.error('ProductForm: Error reading lifestyle image file', file?.name);
      setLifestyleImageLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const clearMainImage = () => {
    setFormData(prev => ({ ...prev, image: '' }));
    setImageError('');
  };

  const removeLifestyleImage = (index) => {
    setFormData(prev => ({
      ...prev,
      lifestyleImages: prev.lifestyleImages.filter((_, i) => i !== index)
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('ProductForm: Input change', { name, value });
    if (name === 'category') {
      setFormData(prev => ({ ...prev, category: value, subCategory: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setHasSubmitted(true);
    setToast({ message: '', type: 'success', isVisible: false });

    if (imageError) {
      setToast({
        message: 'Please fix image errors before submitting',
        type: 'error',
        isVisible: true
      });
      console.error('ProductForm: Submission blocked due to image error', imageError);
      setHasSubmitted(false);
      return;
    }

    const requiredFields = ['name', 'category', 'subCategory', 'price', 'stockQuantity', 'sellerEmail'];
    const missingFields = requiredFields.filter(field => !formData[field]);
    
    if (missingFields.length > 0) {
      setToast({
        message: `Please fill all required fields: ${missingFields.join(', ')}`,
        type: 'error',
        isVisible: true
      });
      console.error('ProductForm: Missing required fields', missingFields);
      setHasSubmitted(false);
      return;
    }

    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      setToast({
        message: 'Please enter a valid price',
        type: 'error',
        isVisible: true
      });
      console.error('ProductForm: Invalid price', formData.price);
      setHasSubmitted(false);
      return;
    }

    if (isNaN(parseInt(formData.stockQuantity)) || parseInt(formData.stockQuantity) < 0) {
      setToast({
        message: 'Please enter a valid stock quantity',
        type: 'error',
        isVisible: true
      });
      console.error('ProductForm: Invalid stock quantity', formData.stockQuantity);
      setHasSubmitted(false);
      return;
    }

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      subCategory: formData.subCategory,
      price: parseFloat(formData.price).toFixed(2),
      image: formData.image,
      lifestyleImages: formData.lifestyleImages,
      stockQuantity: parseInt(formData.stockQuantity, 10),
      feature: formData.feature.trim(),
      description: formData.description.trim(),
      sellerEmail: formData.sellerEmail
    };

    console.log('ProductForm: Submitting payload', {
      isEdit: !!productToEdit,
      productId: productToEdit?._id,
      payload
    });

    if (productToEdit && productToEdit._id) {
      dispatch(UpdateProduct({ id: productToEdit._id, product: payload }));
    } else {
      dispatch(AddProduct(payload));
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          {productToEdit ? 'Edit Product' : 'Add New Product'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <TextInput
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter product name"
            />
          </div>
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="subCategory">Sub Category *</Label>
            <Select
              id="subCategory"
              name="subCategory"
              value={formData.subCategory}
              onChange={handleChange}
              required
              disabled={!formData.category}
            >
              <option value="">Select Sub Category</option>
              {formData.category && categories.find((cat) => cat.name === formData.category)?.subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="price">Price ($) *</Label>
            <TextInput
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="Enter price (e.g., 29.99)"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="mainImage">Main Image *</Label>
          <div className="flex space-x-3 items-center">
            <Button type="button" onClick={() => document.getElementById('mainImageInput').click()}>
              {mainImageLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                'Select Main Image'
              )}
            </Button>
            <input
              id="mainImageInput"
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleMainImageChange}
              className="hidden"
            />
            {formData.image && (
              <Button type="button" onClick={clearMainImage} className="bg-gray-500 hover:bg-gray-600">
                Clear
              </Button>
            )}
          </div>
          {formData.image && !imageError && (
            <div className="mt-3">
              <img
                src={formData.image}
                alt="Main Preview"
                className="w-40 h-40 object-cover rounded-lg border border-gray-200 shadow-sm"
                onError={() => setImageError('Failed to load main image')}
              />
            </div>
          )}
          {imageError && <p className="text-red-500 text-sm mt-2">{imageError}</p>}
        </div>

        <div>
          <Label htmlFor="lifestyleImage">Lifestyle Images</Label>
          <div className="flex space-x-3 items-center">
            <Button type="button" onClick={() => document.getElementById('lifestyleImageInput').click()}>
              {lifestyleImageLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Loading...
                </span>
              ) : (
                'Add Lifestyle Image'
              )}
            </Button>
            <input
              id="lifestyleImageInput"
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handleLifestyleImageChange}
              className="hidden"
            />
          </div>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {formData.lifestyleImages.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={`Lifestyle ${index + 1}`}
                  className="w-28 h-28 object-cover rounded-lg border border-gray-200 shadow-sm"
                  onError={() => setImageError(`Failed to load lifestyle image ${index + 1}`)}
                />
                <button
                  type="button"
                  onClick={() => removeLifestyleImage(index)}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transform hover:scale-110 transition-all shadow-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor="feature">Features (comma-separated)</Label>
          <Textarea
            id="feature"
            name="feature"
            value={formData.feature}
            onChange={handleChange}
            placeholder="Enter features, e.g., Lightweight, Durable, Waterproof"
            className="h-24"
          />
        </div>

        <div>
          <Label htmlFor="description">Description *</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            placeholder="Enter detailed product description"
            className="h-32"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="stockQuantity">Stock Quantity *</Label>
            <TextInput
              id="stockQuantity"
              name="stockQuantity"
              type="number"
              min="0"
              value={formData.stockQuantity}
              onChange={handleChange}
              required
              placeholder="Enter stock quantity"
            />
          </div>
          <div>
            <Label htmlFor="sellerEmail">Seller Email *</Label>
            <Select
              id="sellerEmail"
              name="sellerEmail"
              value={formData.sellerEmail}
              onChange={handleChange}
              required
            >
              <option value="">Select Seller</option>
              {sellers.map((seller) => (
                <option key={seller.id || seller._id} value={seller.email}>
                  {seller.company} ({seller.email})
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <Button 
            type="submit" 
            className="flex-1" 
            disabled={status === 'loading' || !!imageError || mainImageLoading || lifestyleImageLoading}
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {productToEdit ? 'Updating...' : 'Adding...'}
              </span>
            ) : (
              productToEdit ? 'Update Product' : 'Add Product'
            )}
          </Button>
          
          {onClose && (
            <Button 
              type="button" 
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}

export default ProductForm;