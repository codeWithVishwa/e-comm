import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useSelector } from "react-redux";
import { FaRegCircleUser } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";


const navItems = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "Contact", path: "/contact" },
  { name: "SafetyTips", path: "/safetytips" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const user = useSelector((state) => state?.user);
  const navigate = useNavigate();

  // Close mobile menu when clicking outside or scrolling
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".mobile-menu-container")) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isOpen]);

  // Scroll hide effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  // Disable body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleAccountClick = () => {
    navigate("/account");
    setIsOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed w-full bg-white/10 shadow-md z-50 backdrop-blur-lg transition-transform duration-300 ${
          visible ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link
              to="/"
              className="text-3xl font-extrabold tracking-wider text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              CRACK<span className="text-white">IT</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-1">
              <div className="flex space-x-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-md text-base font-display transition-colors ${
                        isActive
                          ? "text-indigo-600 font-semibold"
                          : "text-white hover:text-indigo-400"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>

              {/* Desktop Account/Login */}
              <div className="ml-4 flex items-center space-x-4">
                {user?._id ? (
                  <>
                    <NavLink
                      to="/myorder"
                      className={({ isActive }) =>
                        `px-3 py-2 rounded-md text-base font-display transition-colors ${
                          isActive
                            ? "text-indigo-600 font-semibold"
                            : "text-white hover:text-indigo-400"
                        }`
                      }
                    >
                      My Orders
                    </NavLink>
                    <button
                      onClick={handleAccountClick}
                      className="text-white hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                    >
                      <FaRegCircleUser size={23} />
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="ml-4 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-indigo-400 hover:bg-white/10 focus:outline-none transition-colors"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu with Blurred Background */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Blurred Background Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Mobile Menu Content */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="mobile-menu-container fixed top-16 right-0 bottom-0 w-4/5 max-w-sm bg-gray-900/95 backdrop-blur-lg z-50 shadow-2xl"
            >
              <div className="h-full flex flex-col px-5 py-6 overflow-y-auto">
                <div className="space-y-6">
                  {navItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      <NavLink
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `block px-4 py-3 rounded-lg text-lg font-medium transition-colors ${
                            isActive
                              ? "bg-indigo-600/30 text-indigo-400"
                              : "text-white hover:bg-white/10 hover:text-indigo-400"
                          }`
                        }
                      >
                        {item.name}
                      </NavLink>
                    </motion.div>
                  ))}
                </div>

                {/* Account Section on Mobile */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: navItems.length * 0.05 + 0.2 }}
                  className="mt-auto pt-6 space-y-4 border-t border-white/10"
                >
                  {user?._id && (
                    <>
                      <NavLink
                        to="/myorder"
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) =>
                          `block px-4 py-3 rounded-lg text-lg font-medium transition-colors ${
                            isActive
                              ? "bg-indigo-600/30 text-indigo-400"
                              : "text-white hover:bg-white/10 hover:text-indigo-400"
                          }`
                        }
                      >
                        My Orders
                      </NavLink>
                      <button
                        onClick={handleAccountClick}
                        className="flex items-center justify-center w-full px-4 py-3 rounded-lg text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                      >
                        <FaRegCircleUser className="mr-3" size={20} />
                        My Account
                      </button>
                    </>
                  )}
                  {!user?._id && (
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block w-full px-4 py-3 rounded-lg text-lg font-medium text-center text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                      Login
                    </Link>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
