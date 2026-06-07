import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Edit2, Trash2, Loader2, 
  UtensilsCrossed, LayoutGrid, Image as ImageIcon,
  Upload, Save, FolderPlus, Settings2, Star, Flame
} from 'lucide-react';
import Swal from 'sweetalert2';
import { API_URL } from '../../api';
import Modal from '../../components/ui/Modal';

export default function MenuManagement() {
  const [products, setProducts] = useState([]); 
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [activeCategory, setActiveCategory] = useState('all'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const token = localStorage.getItem('token'); 
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };
  
  // 🟢 เพิ่ม state สวิตช์ตั้งค่า
  const initialFormState = { title: '', description: '', price: '', categoryId: '', image: null, previewImage: null, isRecommended: false, isAvailable: true };
  const [forms, setForms] = useState([{ ...initialFormState, id: Date.now() }]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        axios.get(`${API_URL}/api/product`),
        axios.get(`${API_URL}/api/category`)
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
    } catch (err) { 
      console.error("Fetch Data Error:", err); 
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Category Handlers ---
  const handleAddCategory = async () => {
    const { value: categoryName } = await Swal.fire({ title: 'เพิ่มหมวดหมู่', input: 'text', showCancelButton: true });
    if (categoryName) {
      try { await axios.post(`${API_URL}/api/category`, { categoryName }, authConfig); fetchData(); } 
      catch (err) { Swal.fire('ผิดพลาด', 'เพิ่มไม่ได้', 'error'); }
    }
  };

  const handleEditCategory = async (categoryId, currentName) => {
    const { value: categoryName } = await Swal.fire({ title: 'แก้ไขหมวดหมู่', input: 'text', inputValue: currentName, showCancelButton: true });
    if (categoryName) {
      try { await axios.put(`${API_URL}/api/category/${categoryId}`, { categoryName }, authConfig); fetchData(); } 
      catch (err) { Swal.fire('ผิดพลาด', 'แก้ไขไม่ได้', 'error'); }
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try { await axios.delete(`${API_URL}/api/category/${categoryId}`, authConfig); fetchData(); } 
    catch (err) { Swal.fire('ผิดพลาด', 'ลบไม่ได้ (อาจมีเมนูค้างอยู่)', 'error'); }
  };

  // --- Product Handlers ---
  const handleDeleteProduct = async (productId, title) => {
    const result = await Swal.fire({ title: 'ยืนยันลบ', text: `ลบเมนู "${title}"?`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444' });
    if (result.isConfirmed) {
      try { await axios.delete(`${API_URL}/api/product/${productId}`, authConfig); fetchData(); } 
      catch (err) { Swal.fire('ผิดพลาด', 'ลบไม่ได้', 'error'); }
    }
  };

  const openAddModal = () => { setModalMode('add'); setEditingId(null); setForms([{ ...initialFormState, id: Date.now() }]); setIsModalOpen(true); };
  
  const openEditModal = (item) => {
    setModalMode('edit'); setEditingId(item.productId);
    setForms([{ 
      id: item.productId, 
      title: item.title || '', 
      description: item.description || '', 
      price: item.price || '', 
      categoryId: item.categoryId || '', 
      isRecommended: item.isRecommended || false, // 🟢 ดึงค่าเดิม
      isAvailable: item.isAvailable ?? true,      // 🟢 ดึงค่าเดิม
      image: null, 
      previewImage: getSafeImageUrl(item.image) 
    }]);
    setIsModalOpen(true);
  };

  const handleFormChange = (index, field, value) => { const newForms = [...forms]; newForms[index][field] = value; setForms(newForms); };
  const handleImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const newForms = [...forms]; newForms[index].image = file; newForms[index].previewImage = URL.createObjectURL(file); setForms(newForms); e.target.value = ''; 
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const config = { headers: { ...authConfig.headers, 'Content-Type': 'multipart/form-data' } };
    
    try {
      for (const form of forms) {
        if (!form.categoryId) throw new Error("กรุณาเลือกหมวดหมู่");
        const payload = new FormData();
        payload.append('title', form.title);
        payload.append('description', form.description || '');
        payload.append('price', Number(form.price));
        payload.append('categoryId', Number(form.categoryId));
        // 🟢 แนบค่าสถานะไปให้ Backend
        payload.append('isRecommended', form.isRecommended);
        payload.append('isAvailable', form.isAvailable);
        if (form.image) payload.append('image', form.image);

        if (modalMode === 'add') await axios.post(`${API_URL}/api/product`, payload, config);
        else await axios.put(`${API_URL}/api/product/${editingId}`, payload, config);
      }
      fetchData(); setIsModalOpen(false);
      Swal.fire('สำเร็จ', 'บันทึกเรียบร้อย', 'success');
    } catch (err) {
      Swal.fire('ผิดพลาด', err.response?.data?.message || err.message, 'error');
    } finally { setIsSubmitting(false); }
  };

  const getSafeImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return imagePath.startsWith('http') ? imagePath : `${API_URL}/uploads/${imagePath.split('/').pop()}`;
  };

  const filteredProducts = products.filter(item => {
    const matchCategory = activeCategory === 'all' || item.categoryId === activeCategory;
    const matchSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-orange-500" size={32} /></div>;

  return (
    <div className="p-6 space-y-6 pb-10">
      {/* Header & Filter */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border">
        <h2 className="font-bold text-xl flex items-center gap-2"><LayoutGrid className="text-orange-500"/> จัดการเมนู</h2>
        <div className="flex gap-2">
            <input type="text" placeholder="ค้นหาเมนู..." className="px-4 py-2 border rounded-xl outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            <button onClick={openAddModal} className="bg-orange-500 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-1"><Plus size={18}/> เพิ่มเมนู</button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto">
        <button onClick={() => setActiveCategory('all')} className={`px-4 py-2 rounded-full font-bold text-sm border ${activeCategory === 'all' ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}>ทั้งหมด</button>
        {categories.map(cat => (
           <button key={cat.categoryId} onClick={() => setActiveCategory(cat.categoryId)} className={`px-4 py-2 rounded-full font-bold text-sm border ${activeCategory === cat.categoryId ? 'bg-orange-500 text-white' : 'bg-white text-gray-600'}`}>{cat.categoryName}</button>
        ))}
        <button onClick={() => setIsCategoryModalOpen(true)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-bold text-sm border ml-2 flex items-center gap-1"><Settings2 size={16}/> จัดการหมวดหมู่</button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredProducts.map(item => (
          <div key={item.productId} className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col relative group transition-all ${!item.isAvailable ? 'opacity-60 grayscale-[50%]' : ''}`}>
             <div className="relative h-40 bg-gray-100 shrink-0">
               <img src={getSafeImageUrl(item.image)} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
               
               {/* 🟢 Badge แสดงสถานะต่างๆ บนนูป */}
               <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                  {item.isRecommended && <span className="bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded shadow flex items-center gap-1"><Star size={10} fill="currentColor"/> แนะนำ</span>}
                  {item.soldCount >= 10 && <span className="bg-pink-500 text-white text-[10px] font-black px-2 py-1 rounded shadow flex items-center gap-1"><Flame size={10} fill="currentColor"/> ขายดี</span>}
               </div>

               {/* ป้ายปิดการขาย */}
               {!item.isAvailable && (
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                   <span className="bg-red-500 text-white px-3 py-1.5 rounded-lg font-black text-sm border-2 border-red-400">ปิดรับออเดอร์</span>
                 </div>
               )}

               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 z-20 transition-opacity">
                  <button onClick={() => openEditModal(item)} className="bg-white p-2 rounded-full text-gray-700 hover:text-white hover:bg-orange-500"><Edit2 size={16} /></button>
                  <button onClick={() => handleDeleteProduct(item.productId, item.title)} className="bg-white p-2 rounded-full text-red-500 hover:text-white hover:bg-red-600"><Trash2 size={16} /></button>
               </div>
             </div>
             <div className="p-3 flex flex-col flex-1">
               <h3 className="font-bold text-sm line-clamp-1">{item.title}</h3>
               <div className="mt-auto pt-2 flex justify-between items-center">
                  <span className="font-black text-orange-600">฿{item.price}</span>
                  <span className="text-[10px] text-gray-400 font-bold">ขายแล้ว {item.soldCount}</span>
               </div>
             </div>
          </div>
        ))}
      </div>

      {/* Category Modal (เหมือนเดิม) */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title="จัดการหมวดหมู่">
        <button onClick={handleAddCategory} className="w-full py-3 mb-4 border-2 border-dashed border-orange-400 text-orange-500 font-bold rounded-xl flex justify-center gap-2"><Plus size={18}/> เพิ่มหมวดหมู่</button>
        {categories.map(cat => (
          <div key={cat.categoryId} className="flex justify-between p-3 border-b items-center">
            <span className="font-bold text-gray-700">{cat.categoryName}</span>
            <div className="flex gap-2">
              <button onClick={() => handleEditCategory(cat.categoryId, cat.categoryName)} className="text-blue-500"><Edit2 size={16}/></button>
              <button onClick={() => handleDeleteCategory(cat.categoryId, cat.categoryName)} className="text-red-500"><Trash2 size={16}/></button>
            </div>
          </div>
        ))}
      </Modal>

      {/* Product Form Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? 'เพิ่มเมนู' : 'แก้ไขเมนู'}>
        <form onSubmit={handleSave} className="space-y-4">
          {forms.map((form, index) => (
            <div key={form.id} className="bg-gray-50 p-4 rounded-xl border relative mb-4">
              <div className="flex justify-center mb-4">
                <label className="w-32 h-32 border-2 border-dashed border-orange-400 rounded-xl flex items-center justify-center cursor-pointer bg-white relative overflow-hidden">
                  {form.previewImage ? <img src={form.previewImage} className="w-full h-full object-cover"/> : <div className="text-gray-400 flex flex-col items-center"><Upload size={20}/><span className="text-[10px] mt-1">อัปโหลดรูป</span></div>}
                  <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(index, e)} />
                </label>
              </div>

              {/* 🟢 ส่วนตั้งค่าสวิตช์ แนะนำ/เปิดขาย */}
              <div className="flex gap-4 p-3 mb-4 bg-white border rounded-lg">
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isAvailable} onChange={e => handleFormChange(index, 'isAvailable', e.target.checked)} className="w-4 h-4 accent-orange-500 cursor-pointer" />
                    <span className={`text-sm font-bold ${form.isAvailable ? 'text-green-600' : 'text-gray-400'}`}>เปิดรับออเดอร์</span>
                 </label>
                 <div className="w-px bg-gray-200"></div>
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isRecommended} onChange={e => handleFormChange(index, 'isRecommended', e.target.checked)} className="w-4 h-4 accent-orange-500 cursor-pointer" />
                    <span className={`text-sm font-bold ${form.isRecommended ? 'text-orange-500' : 'text-gray-400'}`}>ติดดาว (แนะนำ)</span>
                 </label>
              </div>

              <div className="space-y-3">
                <input type="text" placeholder="ชื่อเมนู" required value={form.title} onChange={e => handleFormChange(index, 'title', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:border-orange-500" />
                <div className="flex gap-3">
                  <input type="number" placeholder="ราคา" required value={form.price} onChange={e => handleFormChange(index, 'price', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:border-orange-500" min="0" />
                  <select required value={form.categoryId} onChange={e => handleFormChange(index, 'categoryId', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:border-orange-500 bg-white">
                    <option value="" disabled>-- เลือกหมวดหมู่ --</option>
                    {categories.map(c => <option key={c.categoryId} value={c.categoryId}>{c.categoryName}</option>)}
                  </select>
                </div>
                <textarea placeholder="รายละเอียดเมนู..." value={form.description} onChange={e => handleFormChange(index, 'description', e.target.value)} className="w-full p-2 border rounded-lg outline-none focus:border-orange-500 h-20 resize-none"></textarea>
              </div>
            </div>
          ))}
          <button type="submit" disabled={isSubmitting} className="w-full bg-orange-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-orange-600">
             {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} บันทึกข้อมูล
          </button>
        </form>
      </Modal>
    </div>
  );
}