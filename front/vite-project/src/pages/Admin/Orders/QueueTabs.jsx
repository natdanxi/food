import React from 'react';

const QueueTabs = ({ activeTab, setActiveTab, pendingCount, cookingCount, completedCount, cancelledCount }) => {
  const tabs = [
    { id: 'pending', label: 'รอรับออเดอร์', color: 'orange', count: pendingCount },
    { id: 'cooking', label: 'กำลังเตรียม', color: 'blue', count: cookingCount },
    { id: 'completed', label: 'เสร็จสิ้น', color: 'green', count: completedCount },
    { id: 'cancelled', label: 'ยกเลิกแล้ว', color: 'red', count: cancelledCount }
  ];

  return (
    <div className="bg-white border-b border-gray-200 px-8 pt-5 flex gap-8 shrink-0 shadow-sm z-10 overflow-x-auto">
      {tabs.map(tab => {
        const isSelected = activeTab === tab.id;
        let colorClasses = '';
        let badgeClasses = '';
        
        if (isSelected) {
            if(tab.color === 'orange') { colorClasses = 'border-orange-500 text-orange-600'; badgeClasses = 'bg-orange-100 text-orange-600'; }
            else if(tab.color === 'blue') { colorClasses = 'border-blue-500 text-blue-600'; badgeClasses = 'bg-blue-100 text-blue-600'; }
            else if(tab.color === 'green') { colorClasses = 'border-green-500 text-green-600'; badgeClasses = 'bg-green-100 text-green-600'; }
            else if(tab.color === 'red') { colorClasses = 'border-red-500 text-red-600'; badgeClasses = 'bg-red-100 text-red-600'; }
        } else {
            colorClasses = 'border-transparent text-gray-400 hover:text-gray-700';
            badgeClasses = 'bg-gray-100 text-gray-500';
        }

        return (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-4 px-2 text-[15px] font-black border-b-[3px] transition-colors flex items-center gap-2 ${colorClasses}`}>
            {tab.label}
            <span className={`px-2.5 py-0.5 rounded-lg text-xs ${badgeClasses}`}>{tab.count}</span>
          </button>
        );
      })}
    </div>
  );
};

export default QueueTabs;