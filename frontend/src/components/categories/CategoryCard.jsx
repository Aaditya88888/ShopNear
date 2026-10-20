import React from 'react';
import {
  Smartphone,
  Printer,
  Utensils,
  Cake,
  BookOpen,
  Wrench,
} from 'lucide-react';

const iconMap = {
  Smartphone: Smartphone,
  Printer: Printer,
  UtensilsCrossed: Utensils,
  Cake: Cake,
  BookOpen: BookOpen,
  Wrench: Wrench,
};

export default function CategoryCard({ category, isSelected, onClick }) {
  const IconComponent = iconMap[category.icon] || Smartphone;

  return (
    <button
      type="button"
      onClick={() => onClick(category)}
      className={`group w-full min-w-0 flex flex-col items-center justify-center p-3.5 sm:p-5 rounded-2xl text-center transition-all duration-200 cursor-pointer overflow-hidden ${
        isSelected
          ? 'bg-[#DCFCE7] border-2 border-[#16A34A] shadow-sm -translate-y-1'
          : 'bg-[#E9FAF2] hover:bg-[#DCFCE7]/70 border border-[#DCFCE7] hover:border-[#86EFAC] hover:-translate-y-1 hover:shadow-sm'
      }`}
    >
      {/* Centered Line Icon */}
      <div className="w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl mb-2 sm:mb-3 text-[#16A34A] group-hover:scale-110 transition-transform duration-200 shrink-0">
        <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" strokeWidth={1.8} />
      </div>

      {/* Category Name */}
      <h3 className="w-full text-xs sm:text-sm font-semibold text-[#0F172A] group-hover:text-[#16A34A] transition-colors leading-snug truncate">
        {category.name}
      </h3>

      {/* Subtitle / Details */}
      <p className="w-full text-[10px] sm:text-xs text-[#64748B] mt-0.5 sm:mt-1 truncate">
        {category.subtitle}
      </p>
    </button>
  );
}
