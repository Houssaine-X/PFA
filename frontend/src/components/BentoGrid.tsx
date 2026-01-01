import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  size: 'large' | 'medium' | 'small';
  link: string;
}

const BentoGrid: React.FC = () => {
  const navigate = useNavigate();

  const getImageClass = (size: 'large' | 'medium' | 'small'): string => {
    switch (size) {
      case 'large': return 'md:col-span-2 md:row-span-2';
      case 'medium': return 'md:col-span-1 md:row-span-2';
      case 'small': return 'md:col-span-1 md:row-span-1';
      default: return 'md:col-span-1 md:row-span-1';
    }
  };

  const categories: Category[] = [
    {
      id: 1,
      title: 'Electronics',
      subtitle: 'Latest Gadgets',
      image: '/assets/electronics.png',
      size: 'large',
      link: '/products/electronics'
    },
    {
      id: 2,
      title: 'Clothing',
      subtitle: 'New Trends',
      image: '/assets/clothing.png',
      size: 'medium',
      link: '/products/clothing'
    },
    {
      id: 3,
      title: 'Home & Living',
      subtitle: 'Comfort & Style',
      image: '/assets/home-living.png',
      size: 'small',
      link: '/products/home'
    },
    {
      id: 4,
      title: 'Beauty',
      subtitle: 'Skincare & More',
      image: '/assets/beauty.png',
      size: 'small',
      link: '/products/beauty'
    },
    {
      id: 5,
      title: 'Sports',
      subtitle: 'Active Gear',
      image: '/assets/sports.png',
      size: 'medium',
      link: '/products/sports'
    }
  ];

  return (
    <section className="py-20 px-6 max-w-[1400px] mx-auto">
      <div className="mb-12 text-center">
        <h2 className="text-[2.5rem] mb-4 font-bold text-gray-900">Explore Collections</h2>
        <p className="text-[1.1rem] text-gray-500 max-w-xl mx-auto">Curated categories for every lifestyle. Find exactly what you're looking for.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[280px] gap-5">
        {categories.map((category) => (
          <div 
            key={category.id}
            className={`relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 ease-out shadow-md hover:shadow-xl hover:scale-[1.02] group ${getImageClass(category.size)}`}
            onClick={() => navigate(category.link)}
          >
            <img
              src={category.image}
              alt={category.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
              <span className="text-xs font-medium text-white/70 uppercase tracking-wider mb-1 block">{category.subtitle}</span>
              <h3 className="text-2xl font-bold text-white mb-3">{category.title}</h3>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full transition-all duration-200 group-hover:bg-white group-hover:text-gray-900">
                Shop Now
                <svg className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BentoGrid;
