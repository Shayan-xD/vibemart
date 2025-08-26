import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteSeller } from '../../features/sellerSlice';

// Custom Table Components
const Table = ({ children }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm text-left text-gray-700">{children}</table>
  </div>
);

const TableHead = ({ children }) => (
  <thead className="text-xs uppercase bg-gray-50 text-gray-700">{children}</thead>
);

const TableHeadCell = ({ children }) => (
  <th className="px-6 py-3">{children}</th>
);

const TableBody = ({ children }) => (
  <tbody>{children}</tbody>
);

const TableRow = ({ children }) => (
  <tr className="bg-white border-b hover:bg-gray-50">{children}</tr>
);

const TableCell = ({ children }) => (
  <td className="px-6 py-4">{children}</td>
);

const Button = ({ children, color, size, className, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
      color === 'blue'
        ? 'bg-blue-600 text-white hover:bg-blue-700'
        : color === 'red'
        ? 'bg-red-600 text-white hover:bg-red-700'
        : 'bg-gray-600 text-white hover:bg-gray-700'
    } ${size === 'xs' ? 'text-xs' : 'text-sm'} ${className}`}
  >
    {children}
  </button>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex justify-center mt-4">
    <button
      onClick={() => onPageChange(currentPage - 1)}
      disabled={currentPage === 1}
      className="px-3 py-1 mx-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
    >
      Previous
    </button>
    <span className="px-3 py-1 mx-1">{currentPage} / {totalPages}</span>
    <button
      onClick={() => onPageChange(currentPage + 1)}
      disabled={currentPage === totalPages}
      className="px-3 py-1 mx-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
    >
      Next
    </button>
  </div>
);

function ViewSellers({ onEdit }) {
  const dispatch = useDispatch();
  const sellers = useSelector((state) => state.sellerList?.sellerList || []);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(sellers.length / itemsPerPage);
  const paginatedSellers = sellers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDelete = (email, id)=>{
    const confirm = window.confirm(`Are you sure you want to delete the user : ${email}`);

    if(confirm){
      dispatch(deleteSeller(id))
      return;
    }
    return;
  }

  if (!sellers.length) {
    return <div className="text-gray-600">Loading sellers or no data available...</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">View Sellers</h2>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>ID</TableHeadCell>
            <TableHeadCell>Company</TableHeadCell>
            <TableHeadCell>Email</TableHeadCell>
            <TableHeadCell>Status</TableHeadCell>
            <TableHeadCell>Actions</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {paginatedSellers.map((seller) => (
            <TableRow key={seller.id}>
              <TableCell>{seller.id}</TableCell>
              <TableCell>{seller.company}</TableCell>
              <TableCell>{seller.email}</TableCell>
              <TableCell>{seller.status.charAt(0).toUpperCase() + seller.status.slice(1)}</TableCell>
              <TableCell>
                <Button color="blue" size="xs" className="mr-2" onClick={() => onEdit(seller)}>
                  Edit
                </Button>
                <Button color="red" size="xs" onClick={() => handleDelete(seller.email, seller.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}

export default ViewSellers;