import React from "react";
import { useNavigate } from "react-router-dom";



export const Unknown = () => {
  const navigate=useNavigate()
    

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
        <p className="mt-4">The page you're looking for doesn't exist.</p>
        <button className="text-blue-600 cursor-pointer" onClick={()=>{
          navigate("/")}}>Go Back</button>
      </div>
    </div>
  );
};
