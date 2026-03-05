import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, User, Moon, Sun, Menu, ShoppingBag, LogOut } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme }) => {
    const { getCartCount } = useCart();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogoClick = (e) => {
        if (location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/');
        }
    };

    const handleHomeClick = (e) => {
        if (location.pathname === '/') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            navigate('/');
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };
    return (
        <nav className="navbar">
            <div className="container navbar-container">

                {/* Logo */}
                <Link to="/" onClick={handleLogoClick} className="navbar-logo">
                    <ShoppingBag className="logo-icon" />
                    <span className="logo-text">Roshan Enterprises</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="navbar-links">
                    <Link to="/" onClick={handleHomeClick} className="nav-link">Home</Link>
                    <Link to="/categories" className="nav-link">Categories</Link>
                </div>

                {/* Actions */}
                <div className="navbar-actions">
                    <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle theme">
                        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>

                    <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart">
                        <ShoppingCart size={20} />
                        {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
                    </Link>

                    {user ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Link to="/account" className="icon-btn" aria-label="Account" title="My Account">
                                <User size={20} />
                            </Link>
                            <button className="icon-btn" onClick={handleLogout} aria-label="Logout" title="Logout">
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="icon-btn" aria-label="Login" title="Login">
                            <User size={20} />
                        </Link>
                    )}

                    <button className="icon-btn mobile-menu-btn" aria-label="Menu">
                        <Menu size={24} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
