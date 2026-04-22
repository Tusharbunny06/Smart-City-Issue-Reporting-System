import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 shadow-md text-white">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2 text-xl font-bold">
          <ShieldCheck size={28} />
          <span>SmartCity Fix</span>
        </Link>
        <div className="flex space-x-4 items-center">
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-blue-200 font-medium">Dashboard</Link>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md font-medium transition-colors"
              >
                Logout ({user.name})
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-md font-medium transition-colors">Citizen / Worker Portal</Link>
              <Link to="/admin" className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-md font-medium transition-colors shadow-md">Admin Portal</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
