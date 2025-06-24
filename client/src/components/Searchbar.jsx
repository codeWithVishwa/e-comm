import React, { useRef, useState } from "react";
import { Search } from "lucide-react";

export const Searchbar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const inputRef = useRef(null);

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
    // Add logic to route/filter here
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center relative"
    >
      {/* Desktop full input OR expanded mobile */}
      <input
        ref={inputRef}
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search"
        className={`transition-all duration-300 ease-in-out border rounded-md px-2 py-1 outline-none 
        ${isExpanded ? "w-40 sm:w-48" : "w-0 sm:w-48"} 
        ${isExpanded ? "opacity-100" : "opacity-0 sm:opacity-100"} 
        sm:mr-2 overflow-hidden`}
        style={{ visibility: isExpanded || window.innerWidth >= 640 ? "visible" : "hidden" }}
      />

      {/* Icon button */}
      <button
        type={isExpanded ? "submit" : "button"}
        className="text-gray-500 ml-2 sm:ml-0"
        onClick={!isExpanded ? handleExpand : undefined}
      >
        <Search className="w-5 h-5" />
      </button>
    </form>
  );
};
