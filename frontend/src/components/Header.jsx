import React from "react";

const Header = () => {
  return (
    <header className="w-full bg-gradient-to-b from-primary/10 to-transparent text-center py-10 px-4">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3">
        📚 PDF Archive
      </h1>
      <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
        Browse and download study materials with ease
      </p>
    </header>
  );
};

export default Header;
