import React from "react";
import { TypeAnimation } from "react-type-animation";
import { FaPhoneAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { ToastContainer } from "react-toastify";
export const Home = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state?.user);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <ToastContainer theme="dark"/>
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0 brightness-90"
      >
        <source src="/fireworks.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80 z-10"></div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center w-full max-w-4xl space-y-6">
          <TypeAnimation
            sequence={[
              'We produce crackers for Diwali',
              1000,
              'We produce crackers for Weddings',
              1000,
              'We produce crackers for Festivals',
              1000,
              'We produce crackers for Celebrations',
              1000,
            ]}
            speed={20}
            repeat={Infinity}
            wrapper="span"
            className="text-white font-bold text-4xl sm:text-5xl md:text-6xl lg:text-5xl leading-wide tracking-wide"
            style={{ 
              display: 'inline-block',
              textShadow: '0 4px 12px rgba(0,0,0,0.8)',
              lineHeight: '1.2'
            }}
          />
          
          {/* Subtitle */}
          <p className="text-slate-400 text-base sm:text-xl font-medium opacity-90 mt-6 mb-8">
            Premium quality fireworks for all occasions
          </p>

          {/* Buttons Container */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 mt-10">
            <button
              onClick={() => navigate('/products')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-full text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-indigo-500/30 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2"
            >
              Our Products
            </button>

            {user?._id ? (
              <button
                onClick={() => navigate('/contact')}
                className="flex items-center justify-center gap-2 bg-transparent border-2 border-white hover:bg-white/10 text-white font-bold py-4 px-10 rounded-full text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
              >
                <FaPhoneAlt className="text-xl animate-[ringing_0.8s_infinite] duration-300" />
                Contact
              </button>
            ) : (
              <button
                onClick={() => navigate('/login')}
                className="bg-transparent border-2 border-white hover:bg-white/10 text-white font-bold py-4 px-10 rounded-full text-lg sm:text-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};