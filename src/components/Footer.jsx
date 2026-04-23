import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-grid">

                    {/* Brand Info */}
                    <div className="footer-brand">
                        <Link to="/" className="footer-logo">
                            <img src="/logo.png" alt="Roshan Enterprises" className="logo-img" />
                            <span className="logo-text">Roshan Enterprises</span>
                        </Link>
                        <p className="footer-desc">
                            Your one-stop destination for premium products. Experience quality, elegance, and fast delivery all in one place.
                        </p>
                        <div className="social-links">
                            <a href="#" className="social-icon" aria-label="Facebook"><Facebook size={20} /></a>
                            <a href="#" className="social-icon" aria-label="Twitter"><Twitter size={20} /></a>
                            <a href="#" className="social-icon" aria-label="Instagram"><Instagram size={20} /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-links-col">
                        <h4 className="footer-heading">Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/categories">Categories</Link></li>
                            <li><Link to="/orders">Track Order</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="footer-links-col">
                        <h4 className="footer-heading">Support</h4>
                        <ul className="footer-links">
                            <li><Link to="/orders">Order History</Link></li>
                            <li><Link to="/shipping-policy">Shipping Policy</Link></li>
                            <li><Link to="/return-policy">Return Policy</Link></li>
                            <li><Link to="/faq">FAQ</Link></li>
                            <li><Link to="/account">My Account</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="footer-links-col">
                        <h4 className="footer-heading">Contact Us</h4>
                        <ul className="footer-contact">
                            <li>
                                <MapPin size={18} className="contact-icon" />
                                <span><a href="https://maps.app.goo.gl/EgYHSHAsKaKmMsxT8" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>Roshan Enterprises</a></span>
                            </li>
                            <li>
                                <Phone size={18} className="contact-icon" />
                                <span>9835139865</span>
                            </li>
                            <li>
                                <Mail size={18} className="contact-icon" />
                                <span>surendrakumardhn@gmail.com</span>
                            </li>
                            <li>
                                <Link to="/privacy">Privacy Policy</Link> <span>|</span> <Link to="/terms">Terms</Link>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} Roshan Enterprises. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
