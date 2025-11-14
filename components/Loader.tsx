
import React from 'react';

const Loader: React.FC = () => (
  <div className="relative flex h-10 w-10 items-center justify-center">
    <span className="absolute h-6 w-6 animate-spin rounded-full border-2 border-transparent border-t-[var(--accent)]" />
    <span className="absolute h-10 w-10 animate-ping rounded-full border border-[var(--accent-soft)]" />
    <span className="absolute h-3 w-3 rounded-full bg-gradient-to-r from-[#4f46e5] to-[#0ea5e9]" />
  </div>
);

export default Loader;
