import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../api';
import { Users, Trash2, Search, User, Calendar, ShieldCheck, Mail, Phone, Edit, Save } from 'lucide-react';
import Swal from 'sweetalert2';

// ✅ Component Imports
import Modal from '../../components/ui/Modal';
import { useFetchData } from '../../hooks/useFetchData';

// ==========================================
// 🎨 SUB-COMPONENTS
// ==========================================

/**
 * 📌 CustomerHeader - ส่วนหัวของหน้า
 * @param {number} userCount - จำนวนผู้ใช้ทั้งหมด
 * @param {string} searchTerm - คำค้นหา
 * @param {function} setSearchTerm - ตั้งค่าคำค้นหา
 */
const CustomerHeader = ({ userCount, searchTerm, setSearchTerm }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
    {/* ✅ Header Title */}
    <div className="flex items-center gap-3">
      <div className="p-3 bg-purple-500 rounded-xl text-white shadow-lg shadow-purple-200">
        <Users size={24} />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-800">ข้อมูลลูกค้า</h1>
        <p className="text-xs text-gray-500">สมาชิกทั้งหมด {userCount} คน</p>
      </div>
    </div>

    {/* ✅ Search Input */}
    <div className="relative w-full md:w-80">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
      <input
        type="text"
        placeholder="ค้นหาชื่อ หรือ อีเมล..."
        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all text-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  </div>
);

/**
 * 📌 CustomerTable - ตารางแสดงข้อมูลลูกค้า
 * @param {array} users - รายการผู้ใช้
 * @param {function} onEdit - เรียกเมื่อกดแก้ไข
 * @param {function} onRemove - เรียกเมื่อกดลบ
 */
const CustomerTable = ({ users, onEdit, onRemove }) => {
  // ✅ ฟังก์ชันจัดรูปแบบวันที่เป็นภาษาไทย
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          {/* ✅ Table Header */}
          <thead>
            <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
              <th className="px-6 py-4 font-semibold">ชื่อ-นามสกุล</th>
              <th className="px-6 py-4 font-semibold">ข้อมูลติดต่อ</th>
              <th className="px-6 py-4 font-semibold">สถานะ</th>
              <th className="px-6 py-4 font-semibold text-center">วันที่สมัคร</th>
              <th className="px-6 py-4 font-semibold text-right">จัดการ</th>
            </tr>
          </thead>

          {/* ✅ Table Body */}
          <tbody className="divide-y divide-gray-50">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                {/* ✅ Name Column */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm ${
                        user.role === 'admin' ? 'bg-orange-500' : 'bg-blue-500'
                      }`}
                    >
                      {user.firstname ? user.firstname.charAt(0).toUpperCase() : '?'}
                    </div>
                    {/* User Info */}
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        {user.firstname} {user.lastname}
                      </p>
                      <p className="text-[10px] text-gray-400">ID: {user.id}</p>
                    </div>
                  </div>
                </td>

                {/* ✅ Contact Column */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {/* Email */}
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Mail size={12} className="text-gray-400" /> {user.email || "-"}
                    </div>
                    {/* Phone */}
                    <div className="flex items-center gap-1 text-xs text-gray-600">
                      <Phone size={12} className="text-gray-400" /> {user.tel || "-"}
                    </div>
                  </div>
                </td>

                {/* ✅ Role/Status Column */}
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                      user.role === 'admin'
                        ? 'bg-orange-50 text-orange-600 border-orange-100'
                        : 'bg-green-50 text-green-600 border-green-100'
                    }`}
                  >
                    {user.role === 'admin' ? (
                      <ShieldCheck size={12} />
                    ) : (
                      <User size={12} />
                    )}
                    {user.role === 'admin' ? 'Admin' : 'User'}
                  </span>
                </td>

                {/* ✅ Created Date Column */}
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-500 text-xs">
                    <Calendar size={14} className="text-gray-400" /> {formatDate(user.created_at)}
                  </div>
                </td>

                {/* ✅ Action Column */}
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => onEdit(user)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      title="แก้ไขข้อมูล"
                    >
                      <Edit size={18} />
                    </button>
                    {/* Delete Button (disabled for admin users) */}
                    <button
                      onClick={() => onRemove(user.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="ลบผู้ใช้"
                      disabled={user.role === 'admin'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/**
 * 📌 EditCustomerForm - ฟอร์มแก้ไขข้อมูลลูกค้า
 * @param {object} formData - ข้อมูลฟอร์ม
 * @param {function} handleChange - ฟังก์ชันเปลี่ยนค่า
 * @param {function} handleUpdate - ฟังก์ชันอัพเดต
 */
const EditCustomerForm = ({ formData, handleChange, handleUpdate }) => (
  <form onSubmit={handleUpdate} className="space-y-4">
    {/* ✅ Name Fields */}
    <div className="grid grid-cols-2 gap-4">
      {/* First Name */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 ml-1">ชื่อ</label>
        <input
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
        />
      </div>

      {/* Last Name */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-500 ml-1">นามสกุล</label>
        <input
          name="lastname"
          value={formData.lastname}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
        />
      </div>
    </div>

    {/* ✅ Phone Field */}
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 ml-1">เบอร์โทรศัพท์</label>
      <input
        name="tel"
        value={formData.tel}
        onChange={handleChange}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
      />
    </div>

    {/* ✅ Role/Status Field */}
    <div className="space-y-1">
      <label className="text-xs font-bold text-gray-500 ml-1">สถานะ</label>
      <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-100 transition"
      >
        <option value="user">User (ลูกค้าทั่วไป)</option>
        <option value="admin">Admin (ผู้ดูแลระบบ)</option>
      </select>
    </div>

    {/* ✅ Submit Button */}
    <button
      type="submit"
      className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition active:scale-95 flex justify-center items-center gap-2 mt-2"
    >
      <Save size={18} /> บันทึกการแก้ไข
    </button>
  </form>
);

// ==========================================
// 🚀 MAIN COMPONENT: Customers Management
// ==========================================
/**
 * 📌 Customers - หน้าจัดการข้อมูลลูกค้า
 * - ดึงข้อมูลลูกค้าทั้งหมด
 * - ค้นหา / ผลักแล้ว / ลบลูกค้า
 */
export default function Customers() {
  // ✅ Fetch Users Data
  const { data: users, refetch } = useFetchData('/api/users');

  // ✅ State Management
  const [searchTerm, setSearchTerm] = useState(""); // คำค้นหา
  const [isModalOpen, setIsModalOpen] = useState(false); // สถานะ Modal
  const [editId, setEditId] = useState(null); // ID ของผู้ใช้ที่กำลังแก้ไข
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    tel: '',
    role: 'user'
  }); // ข้อมูลฟอร์ม

  // ✅ Handle Edit Button Click
  const handleEditClick = (user) => {
    setEditId(user.id);
    setFormData({
      firstname: user.firstname || '',
      lastname: user.lastname || '',
      tel: user.tel || '',
      role: user.role || 'user'
    });
    setIsModalOpen(true);
  };

  // ✅ Handle Update (PUT Request)
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API_URL}/api/users/${editId}`, formData);
      
      // ✅ Show Success Message
      Swal.fire({
        title: 'สำเร็จ!',
        text: 'แก้ไขข้อมูลเรียบร้อยแล้ว',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      
      // ✅ Close Modal & Refresh Data
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      Swal.fire(
        'ผิดพลาด',
        'เกิดข้อผิดพลาด: ' + err.message,
        'error'
      );
    }
  };

  // ✅ Handle Delete (DELETE Request)
  const handleRemove = async (id) => {
    // ✅ Confirmation Dialog
    const result = await Swal.fire({
      title: 'ยืนยันการลบ?',
      text: "คุณจะไม่สามารถกู้คืนข้อมูลผู้ใช้นี้ได้!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก'
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/api/users/${id}`);
        
        // ✅ Show Success Message
        Swal.fire(
          'ลบสำเร็จ!',
          'ผู้ใช้งานถูกลบออกจากระบบแล้ว',
          'success'
        );
        
        // ✅ Refresh Data
        refetch();
      } catch (err) {
        Swal.fire(
          'ผิดพลาด',
          'ลบไม่สำเร็จ หรือผู้ใช้นี้มีออเดอร์ค้างอยู่',
          'error'
        );
      }
    }
  };

  // ✅ Handle Form Input Change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ✅ Filter Users Based on Search Term
  const filteredUsers = Array.isArray(users)
    ? users.filter((user) => {
        const term = searchTerm.toLowerCase();
        return (
          (user.firstname || "").toLowerCase().includes(term) ||
          (user.email || "").toLowerCase().includes(term)
        );
      })
    : [];

  return (
    <div className="w-full min-h-screen bg-stone-50/50 p-6 font-sans">
      {/* ✅ Page Header */}
      <CustomerHeader
        userCount={users.length || 0}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      {/* ✅ Data Table */}
      <CustomerTable
        users={filteredUsers}
        onEdit={handleEditClick}
        onRemove={handleRemove}
      />

      {/* ✅ Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="แก้ไขข้อมูลสมาชิก"
        icon={Edit}
      >
        <EditCustomerForm
          formData={formData}
          handleChange={handleChange}
          handleUpdate={handleUpdate}
        />
      </Modal>
    </div>
  );
}