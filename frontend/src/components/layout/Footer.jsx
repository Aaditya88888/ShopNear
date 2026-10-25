import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#F8FAFC] border-t border-[#E2E8F0] pt-4 pb-20 lg:py-4 text-center select-none">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-xs text-[#64748B]">
          &copy; {new Date().getFullYear()} ShopNear &bull; All rights reserved
        </p>
      </div>
    </footer>
  );
}
