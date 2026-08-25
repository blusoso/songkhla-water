export default function SummaryCards({ summary }) {
  const items = [
    { 
      key: 'total', 
      label: 'สถานีทั้งหมด', 
      color: '#6FA8A3',
      desc: null,
    },
    { 
      key: 'safe', 
      label: 'ปลอดภัย', 
      color: '#4CAF6D',
      desc: 'ระดับน้ำ < 70% ของตลิ่ง',
    },
    { 
      key: 'watch', 
      label: 'เฝ้าระวัง', 
      color: '#E8A33D',
      desc: 'ระดับน้ำ 70–99% ของตลิ่ง',
    },
    { 
      key: 'critical', 
      label: 'วิกฤต', 
      color: '#E5533D',
      desc: 'ระดับน้ำ ≥ 100% ของตลิ่ง (ล้นตลิ่ง)',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-7">
      {items.map((item) => (
        <div 
          key={item.key} 
          className="bg-[#223540] border border-[rgba(234,242,240,0.12)] rounded-[14px] p-4 relative overflow-hidden"
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-1" 
            style={{ background: item.color }} 
          />
          <div className="font-mono text-[30px] font-semibold leading-none">
            {item.key === 'total' 
              ? summary.total 
              : item.key === 'safe' 
              ? summary.safe 
              : item.key === 'watch' 
              ? summary.watch 
              : summary.critical}
          </div>
          <div className="text-[12.5px] text-[#9FB4B0] mt-2 flex items-center gap-1.5">
            <span 
              className="w-2 h-2 rounded-[2px] inline-block" 
              style={{ background: item.color }} 
            />
            {item.label}
          </div>
          {/* 👇 เพิ่มคำอธิบายเกณฑ์ */}
          {item.desc && (
            <div className="text-[10px] text-[#6C8480] mt-1 leading-relaxed">
              {item.desc}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}