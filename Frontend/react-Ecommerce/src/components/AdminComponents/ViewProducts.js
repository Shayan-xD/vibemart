import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DeleteProduct, fetchProducts } from '../../features/productSlice';
import Toast from '../../components/Toast';

// Custom Table Components
const Table = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left text-gray-700">{children}</table>
  </div>
);
const TableHead = ({ children }) => <thead className="text-xs uppercase bg-gray-50 text-gray-700">{children}</thead>;
const TableHeadCell = ({ children }) => <th className="px-6 py-3">{children}</th>;
const TableBody = ({ children }) => <tbody>{children}</tbody>;
const TableRow = ({ children }) => <tr className="bg-white border-b hover:bg-gray-50">{children}</tr>;
const TableCell = ({ children }) => <td className="px-6 py-4">{children}</td>;

const Button = ({ children, className, onClick, variant = 'default', disabled }) => {
  const baseStyles = 'px-6 py-3 rounded-xl font-semibold text-base text-white transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md';
  const variantStyles = {
    default: 'bg-purple-600 hover:bg-purple-800',
    edit: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    delete: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
  };
  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Select = ({ id, value, onChange, children }) => (
  <select
    id={id}
    value={value}
    onChange={onChange}
    className="block w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-gray-50 text-gray-800"
  >
    {children}
  </select>
);

const Label = ({ htmlFor, children }) => (
  <label htmlFor={htmlFor} className="block mb-1.5 text-sm font-semibold text-gray-800">
    {children}
  </label>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex justify-center mt-4">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="px-4 py-2 mx-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
    >
      Previous
    </button>
    <span className="px-4 py-2 mx-1">{currentPage} / {totalPages}</span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="px-4 py-2 mx-1 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50"
    >
      Next
    </button>
  </div>
);

function ViewProducts({ onEdit }) {
  const dispatch = useDispatch();
  const products = useSelector(state => state.products.productList);
  const sellers = useSelector(state => state.sellerList?.sellerList || []);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterSeller, setFilterSeller] = useState('');
  const [hasFetched, setHasFetched] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success', isVisible: false });
  const itemsPerPage = 5;

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!hasFetched) {
        try {
          await dispatch(fetchProducts()).unwrap();
          if (isMounted) setHasFetched(true);
        } catch {
          if (isMounted) setHasFetched(false);
        }
      }
    };
    fetchData();
    return () => { isMounted = false; };
  }, [dispatch, hasFetched]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterSeller]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      dispatch(DeleteProduct(id))
        .unwrap()
        .then(() => setToast({ message: 'Product deleted successfully', type: 'success', isVisible: true }))
        .catch((error) => setToast({ message: 'Failed to delete product: ' + error, type: 'error', isVisible: true }));
    }
  };

  const filteredProducts = products.filter(p => !filterSeller || p.sellerEmail === filterSeller);
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  if (products.length === 0 && hasFetched) {
    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">View Products</h2>
        <div className="text-gray-600 p-4 bg-gray-50 rounded-lg">
          No products available. Please add some products.
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">View Products</h2>
      <div className="mb-4">
        <Label htmlFor="filterSeller">Filter by Seller</Label>
        <Select id="filterSeller" value={filterSeller} onChange={(e) => setFilterSeller(e.target.value)}>
          <option value="">All Sellers</option>
          {sellers.map(seller => (
            <option key={seller.id} value={seller.email}>{seller.company} ({seller.email})</option>
          ))}
        </Select>
      </div>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>ID</TableHeadCell>
            <TableHeadCell>Name</TableHeadCell>
            <TableHeadCell>Category</TableHeadCell>
            <TableHeadCell>Price</TableHeadCell>
            <TableHeadCell>Seller</TableHeadCell>
            <TableHeadCell>Stock</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedProducts.map(product => (
            <TableRow key={product._id || product.id}>
              <TableCell>{product._id || product.id}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell>{product.category}/{product.subCategory}</TableCell>
              <TableCell>${product.price}</TableCell>
              <TableCell>{product.sellerEmail}</TableCell>
              <TableCell>{product.stockQuantity}</TableCell>
              <TableCell>
                <Button variant="edit" className="mr-2" onClick={() => onEdit(product)} disabled={false}>
                  Edit
                </Button>
                <Button variant="delete" onClick={() => handleDelete(product._id || product.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4">
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
      <Toast message={toast.message} type={toast.type} isVisible={toast.isVisible} onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} />
    </div>
  );
}

export default ViewProducts;