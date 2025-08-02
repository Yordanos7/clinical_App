import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-blue-50 py-12 border-t border-blue-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <h5 className="text-xl font-semibold text-blue-800">About Us</h5>
            <p className="text-blue-600 text-sm leading-relaxed">
              Modern Healthcare Management for Ethiopian Hospitals
            </p>
            <p className="text-blue-600 text-sm leading-relaxed">
              Our digital platform streamlines patient care by replacing
              physical patient cards with secure QR codes and empowering doctors
              with efficient appointment and medical record management.
            </p>
          </div>
          <div className="space-y-4">
            <h5 className="text-xl font-semibold text-blue-800">Quick Links</h5>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-blue-600 hover:text-blue-900 text-sm transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-blue-600 hover:text-blue-900 text-sm transition-colors duration-200"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-blue-600 hover:text-blue-900 text-sm transition-colors duration-200"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-900 text-sm transition-colors duration-200"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-900 text-sm transition-colors duration-200"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h5 className="text-xl font-semibold text-blue-800">Contact Us</h5>
            <p className="text-blue-600 text-sm">
              123 Main St, Addis Ababa, Ethiopia
            </p>
            <p className="text-blue-600 text-sm">Phone: +251 911 111 111</p>
            <p className="text-blue-600 text-sm">
              Email:{" "}
              <a
                href="mailto:info@example.com"
                className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
              >
                info@example.com
              </a>
            </p>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-blue-100">
          <p className="text-blue-600 text-sm">
            © 2025 Modern Healthcare Management. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
