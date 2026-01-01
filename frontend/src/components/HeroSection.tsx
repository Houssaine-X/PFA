import React from 'react';
import { useNavigate } from 'react-router-dom';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative h-[85vh] min-h-[700px] max-h-[1000px] w-full flex items-center overflow-hidden mb-20 group">
      <div className="absolute top-0 left-0 w-full h-full z-0">
        <img 
          src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=2400&q=80" 
          alt="Premium Lifestyle" 
          className="w-full h-full object-cover object-center transition-transform duration-[10000ms] ease-linear group-hover:scale-105"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#f8fafc]/95 via-[#f8fafc]/70 to-transparent"></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-10 w-full max-w-[1600px]">
        <h1 className="text-[clamp(3rem,6vw,5.5rem)] leading-[1.05] font-bold text-gray-900 mb-6 tracking-tighter opacity-0 animate-[fadeUp_0.8s_ease-out_0.4s_forwards]">
          <span className="block text-sm font-semibold tracking-widest uppercase text-blue-600 mb-6 opacity-0 animate-[fadeUp_0.8s_ease-out_0.2s_forwards]">New Collection</span>
          Refined <br />
          <span className="relative inline-block text-gray-900 after:content-[''] after:absolute after:bottom-2 after:left-0 after:w-full after:h-3 after:bg-blue-600/15 after:-z-10 after:rounded">Simplicity</span>
        </h1>
        <p className="text-[clamp(1.1rem,2vw,1.4rem)] text-gray-600 max-w-[500px] mb-10 leading-relaxed opacity-0 animate-[fadeUp_0.8s_ease-out_0.6s_forwards]">
          Elevate your everyday with our curated selection of premium essentials. 
          Designed for those who appreciate the finer details.
        </p>
        <div className="flex gap-4 opacity-0 animate-[fadeUp_0.8s_ease-out_0.8s_forwards]">
          <button 
            className="bg-gray-900 text-white px-8 py-4 rounded-full font-medium text-base transition-all duration-300 hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg active:scale-95" 
            onClick={() => navigate('/products')}
          >
            Explore Collection
          </button>
          <button 
            className="bg-white/80 backdrop-blur-sm text-gray-900 px-8 py-4 rounded-full font-medium text-base border border-white/20 transition-all duration-300 hover:bg-white hover:-translate-y-0.5 hover:shadow-lg active:scale-95" 
            onClick={() => navigate('/products?category=new')}
          >
            View Lookbook
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
