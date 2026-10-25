import React from 'react';
import CategoryCard from './CategoryCard';
import { CATEGORIES } from '../../data/mockData';
import { ArrowRight } from 'lucide-react';

export default function CategorySection({ selectedCategory, onSelectCategory, onResetFilter }) {
  return (
    <section id="categories" className="py-8 sm:py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] tracking-tight">
            Explore Categories
          </h2>

          <button
            type="button"
            onClick={onResetFilter}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#16A34A] hover:text-[#0F7A44] transition-colors cursor-pointer group"
          >
            <span>View all</span>
            <span className="hidden sm:inline">categories</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Separated Category Cards Grid (2 cols mobile, 3 cols tablet, 5 cols desktop) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              isSelected={selectedCategory === cat.query}
              onClick={(c) => onSelectCategory(c.query)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
