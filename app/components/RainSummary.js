export default function RainSummary({ rainStations }) {
  if (!rainStations || rainStations.length === 0) return null;

  const total = rainStations.length;
  const heavy = rainStations.filter(s => s._status.key === 'heavy').length;
  const moderate = rainStations.filter(s => s._status.key === 'moderate').length;
  const light = rainStations.filter(s => s._status.key === 'light').length;

  return (
    <div className="bg-[#1C2C35] rounded-[14px] p-4 mb-7 border border-[rgba(234,242,240,0.12)]">
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-[11.5px] tracking-[0.14em] text-[#6C8480] uppercase">
          ☔ ปริมาณฝน 24 ชม. · {total} สถานี
        </div>
        <div className="flex gap-3 text-[10px] text-[#9FB4B0]">
          {heavy > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E5533D]" /> หนัก {heavy}</span>}
          {moderate > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#E8A33D]" /> ปานกลาง {moderate}</span>}
          {light > 0 && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#4CAF6D]" /> เล็กน้อย {light}</span>}
        </div>
      </div>
      
      {/* ✅ แสดงทุกสถานี แทนที่จะ slice แค่ 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {rainStations.map((item, idx) => (
          <div key={idx} className="bg-[#16232B] p-2 rounded-lg flex justify-between items-center">
            <span className="text-xs text-[#9FB4B0] truncate">
              {item.station?.tele_station_name?.th || item.station_name?.th || 'สถานี'}
            </span>
            <span className="font-mono text-sm font-semibold" style={{ color: item._status.color }}>
              {item._rainAmount.toFixed(1)} มม.
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}