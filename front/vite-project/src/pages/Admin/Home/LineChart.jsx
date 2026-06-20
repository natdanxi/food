// กราฟยอดขาย
import React from 'react';

const LineChart = ({ data }) => {
  const rawMax = Math.max(...data.map(d => Math.max(d.walkin, d.online)), 100);
  const maxVal = Math.ceil(rawMax * 1.15); 
  
  const getPoints = (key) => data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((d[key] / maxVal) * 100);
      return `${x},${y}`;
  }).join(' ');

  const getAreaPoints = (key) => `0,100 ${getPoints(key)} 100,100`;
  const gridLines = [1, 0.75, 0.5, 0.25, 0];

  return (
      <div className="relative w-full h-[280px] mt-8 mb-6 font-sans">
          <svg className="w-0 h-0 absolute">
            <defs>
              <linearGradient id="gradientWalkin" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.35" /><stop offset="100%" stopColor="#a855f7" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="gradientOnline" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>

          <div className="absolute inset-0 flex flex-col justify-between text-[11px] text-gray-400 font-medium z-0">
              {gridLines.map((step, idx) => (
                  <div key={idx} className="flex items-center w-full gap-3 h-0">
                      <span className="w-10 text-right bg-white pr-2 z-10 leading-none">{(maxVal * step).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
                      <div className={`flex-1 border-b ${step === 0 ? 'border-gray-300' : 'border-gray-100 border-dashed'}`}></div>
                  </div>
              ))}
          </div>

          <div className="absolute inset-0 ml-[52px] z-10">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <polygon fill="url(#gradientWalkin)" points={getAreaPoints('walkin')} />
                  <polygon fill="url(#gradientOnline)" points={getAreaPoints('online')} />
                  <polyline fill="none" stroke="#a855f7" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" points={getPoints('walkin')} className="drop-shadow-sm"/>
                  <polyline fill="none" stroke="#3b82f6" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinejoin="round" strokeLinecap="round" points={getPoints('online')} className="drop-shadow-sm"/>
              </svg>

              {data.map((d, i) => {
                  const x = (i / (data.length - 1)) * 100;
                  const yWalkin = 100 - ((d.walkin / maxVal) * 100);
                  const yOnline = 100 - ((d.online / maxVal) * 100);

                  return (
                      <React.Fragment key={i}>
                          <div className="absolute w-3.5 h-3.5 bg-white border-[3px] border-purple-500 rounded-full shadow-sm hover:scale-150 transition-transform cursor-pointer group z-20" style={{ left: `calc(${x}% - 7px)`, top: `calc(${yWalkin}% - 7px)` }}>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity shadow-lg">หน้าร้าน: ฿{d.walkin.toLocaleString()}</div>
                          </div>
                          <div className="absolute w-3.5 h-3.5 bg-white border-[3px] border-blue-500 rounded-full shadow-sm hover:scale-150 transition-transform cursor-pointer group z-20" style={{ left: `calc(${x}% - 7px)`, top: `calc(${yOnline}% - 7px)` }}>
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-800 text-white text-[11px] font-bold px-2.5 py-1 rounded-md opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity shadow-lg z-30">ออนไลน์: ฿{d.online.toLocaleString()}</div>
                          </div>
                      </React.Fragment>
                  );
              })}
          </div>
          <div className="absolute -bottom-8 left-[52px] right-0 flex justify-between text-[11px] text-gray-500 font-bold">
              {data.map((d, i) => <span key={i} className="text-center w-16 -ml-8">{d.label}</span>)}
          </div>
      </div>
  );
};

export default LineChart;