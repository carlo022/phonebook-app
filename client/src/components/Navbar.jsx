import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  // If there is no logged-in user, don't render the navbar
  if (!user) return null;

  return (
    <nav className="bg-blue-600 p-4 shadow-md">
      <div className="container mx-auto flex items-center justify-between">
        
        {/* Dynamically displays the logged-in user's first name */}
        <Link to="/" className="text-xl font-bold text-white tracking-wide">
          {user.firstName}'s Phonebook
        </Link>
        
        <div className="flex items-center gap-4 sm:gap-6 text-white">
          {/* Hidden on very small screens to save space for the dynamic title */}
          <span className="hidden sm:inline-block text-sm italic opacity-90">
            Welcome, {user.firstName}
          </span>
          
          <Link to="/" className="hidden sm:inline-block font-medium hover:text-blue-200 transition">
            Dashboard
          </Link>
          
          {/* Conditionally render the Admin Panel link based on role */}
          {(user.role === 'admin' || user.role === 'super-admin') && (
            <Link to="/admin" className="font-medium hover:text-blue-200 transition">
              Admin Panel
            </Link>
          )}
          
          <button 
            onClick={logout} 
            className="rounded-md bg-red-500 px-4 py-1.5 text-sm font-semibold hover:bg-red-600 transition shadow"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}