import React from "react";
import { Link } from "react-router-dom";

export const Button = () => {
  return (
    <Link
      to="/"
      className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
    >
      Go to Home
    </Link>
  );
};
