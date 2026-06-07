import React from 'react';  

export default function StatusBadge({ status }) {
  const styles = {
    completed: "bg-green-50 text-green-600",
    cooking: "bg-blue-50 text-blue-600",
    pending: "bg-orange-50 text-orange-600",
    cancelled: "bg-red-50 text-red-600"
  };
  const currentStyle = styles[status] || "bg-gray-50 text-gray-600";

  return (
    <span className={`px-3 py-1 font-black text-[11px] rounded-full tracking-wider uppercase ${currentStyle}`}>
      {status}
    </span>
  );
}