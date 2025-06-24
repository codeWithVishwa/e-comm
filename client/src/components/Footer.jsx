import React from "react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-transparent text-gray-400 text-sm py-6 mt-5 rounded-lg px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-center sm:text-left">
          © {new Date().getFullYear()} CrackIt. All rights reserved.
        </p>
        <div className="flex flex-wrap gap-4 justify-center sm:justify-end">
          <Link to="/privacypolicy" className="hover:text-white transition-colors duration-200">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-white transition-colors duration-200">
            Terms & Conditions
          </Link>
          <Link to="/refundpolicy" className="hover:text-white transition-colors duration-200">
            Refund Policy
          </Link>
        </div>
      </div>
    </footer>
  );
};

