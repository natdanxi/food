import React from 'react';
import { Search, Utensils } from 'lucide-react';
import { API_URL } from '../../../api';

const POSProductGrid = ({ products, categories, activeCategory, setActiveCategory, searchTerm, setSearchTerm, openProductModal }) => (
  <div className="flex-1 flex flex-col bg-[#F4F6F8]">
    <div className="px-6 py-4 bg-white/50 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-10 flex justify-between items-center">
        <h2 className="text-lg font-black text-gray-800">เลือกเมนูอาหาร</h2>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="ค้นหาเมนู..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-gray-200 rounded-full pl-10 pr-4 py-2 text-sm font-medium focus:outline-none focus:border-orange-500 shadow-sm" />
        </div>
    </div>
    <div className="flex gap-2 px-6 py-3 bg-white border-b border-gray-200/60 overflow-x-auto scrollbar-hide shrink-0">
        <button onClick={() => setActiveCategory('all')} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${activeCategory === 'all' ? 'bg-orange-500 text-white border-orange-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
            ทั้งหมด
        </button>
        {categories.map(cat => (
            <button key={cat.categoryId} onClick={() => setActiveCategory(cat.categoryId)} className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${activeCategory === cat.categoryId ? 'bg-orange-500 text-white border-orange-600' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'}`}>
                {cat.categoryName}
            </button>
        ))}
    </div>
    <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-start pb-24">
      {products.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) && p.isAvailable && (activeCategory === 'all' || p.categoryId === activeCategory)).map(item => (
        <button key={item.productId || item.id} onClick={() => openProductModal(item)} className="bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:border-orange-300 transition-all group flex flex-col overflow-hidden text-left h-[220px]">
          <div className="w-full h-[130px] bg-gray-100 overflow-hidden relative shrink-0">
            {item.image ? <img src={`${API_URL}/uploads/${item.image}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/> : <div className="w-full h-full flex items-center justify-center"><Utensils size={32} className="text-gray-300"/></div>}
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg"><span className="text-sm font-black text-orange-600">฿{item.price}</span></div>
          </div>
          <div className="p-3 flex-1 flex flex-col justify-center"><p className="text-sm font-bold text-gray-800 line-clamp-2">{item.title}</p></div>
        </button>
      ))}
    </div>
  </div>
);

export default POSProductGrid;