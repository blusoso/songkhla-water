import { classify } from '@/lib/api';

export default function StationMap({ stations }) {
  if (!stations || !Array.isArray(stations) || stations.length === 0) {
    return null;
  }

  // 🎯 กำหนดรายชื่อสถานีที่ต้องการให้แสดง
  const ALLOWED_STATIONS = ['บ้านม่วงก็อง', 'บ้านหาดใหญ่ใน', 'บ้านบางศาลา'];

  // กรองเฉพาะสถานีที่มีพิกัดถูกต้อง และตรงกับรายชื่อเป้าหมาย
  const stationsWithCoords = stations.filter(item => {
    const name = item.station?.tele_station_name?.th || '';
    const lat = parseFloat(item.station?.tele_station_lat);
    const lng = parseFloat(item.station?.tele_station_long);

    // เช็คว่าชื่อสถานีตรงกับ 1 ในรายชื่อเป้าหมายหรือไม่
    const isAllowed = ALLOWED_STATIONS.some(target => name.includes(target));

    return isAllowed && !isNaN(lat) && !isNaN(lng);
  });

  if (stationsWithCoords.length === 0) {
    console.log('⚠️ ไม่พบสถานีเป้าหมายที่มีพิกัด');
    return null;
  }

  // คำนวณ min/max พิกัดเฉพาะ 3 สถานีนี้ เพื่อปรับระยะจุดให้เหมาะสมเต็มกรอบ
  const lats = stationsWithCoords.map(s => parseFloat(s.station.tele_station_lat));
  const lngs = stationsWithCoords.map(s => parseFloat(s.station.tele_station_long));

  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latRange = maxLat - minLat || 0.1;
  const lngRange = maxLng - minLng || 0.1;

  // เพิ่ม Padding 15% เพื่อไม่ให้จุดอยู่ชิดขอบกรอบจนเกินไป
  const padding = 0.15;
  const padLat = latRange * padding;
  const padLng = lngRange * padding;

  const getX = (lng) => ((lng - (minLng - padLng)) / (lngRange + padLng * 2)) * 100;
  const getY = (lat) => ((maxLat + padLat - lat) / (latRange + padLat * 2)) * 100;

  const getColor = (item) => {
    const status = classify(item);
    return status.key === 'critical' ? '#E5533D' 
      : status.key === 'watch' ? '#E8A33D' 
      : status.key === 'safe' ? '#4CAF6D' 
      : '#7C8B94';
  };

  const counts = { safe: 0, watch: 0, critical: 0 };
  stationsWithCoords.forEach(item => {
    const status = classify(item);
    if (status.key === 'safe') counts.safe++;
    else if (status.key === 'watch') counts.watch++;
    else if (status.key === 'critical') counts.critical++;
  });

  return (
    <div className="bg-[#1C2C35] rounded-[14px] p-4 mb-7 border border-[rgba(234,242,240,0.12)]">
      <div className="flex items-center justify-between mb-3">
        <div className="font-mono text-[11.5px] tracking-[0.14em] text-[#6C8480] uppercase">
          📍 ตำแหน่งสถานี · {stationsWithCoords.length} แห่ง
        </div>
        <div className="flex gap-3 text-[10px] text-[#9FB4B0]">
          {counts.critical > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#E5533D]" />
              วิกฤต {counts.critical}
            </span>
          )}
          {counts.watch > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#E8A33D]" />
              เฝ้าระวัง {counts.watch}
            </span>
          )}
          {counts.safe > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#4CAF6D]" />
              ปลอดภัย {counts.safe}
            </span>
          )}
        </div>
      </div>

      <div className="relative w-full h-[300px] md:h-[400px] bg-[#16232B] rounded-lg overflow-hidden">
        {/* เส้นตาราง background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-0 right-0 h-px bg-[#6C8480]" />
          <div className="absolute top-2/4 left-0 right-0 h-px bg-[#6C8480]" />
          <div className="absolute top-3/4 left-0 right-0 h-px bg-[#6C8480]" />
          <div className="absolute left-1/4 top-0 bottom-0 w-px bg-[#6C8480]" />
          <div className="absolute left-2/4 top-0 bottom-0 w-px bg-[#6C8480]" />
          <div className="absolute left-3/4 top-0 bottom-0 w-px bg-[#6C8480]" />
        </div>

        {/* 🔥 Render เฉพาะ Dots 3 สถานีเป้าหมาย */}
        {stationsWithCoords.map((item, idx) => {
          const lat = parseFloat(item.station?.tele_station_lat);
          const lng = parseFloat(item.station?.tele_station_long);
          
          if (isNaN(lat) || isNaN(lng)) return null;
          
          const x = getX(lng);
          const y = getY(lat);
          const color = getColor(item);
          const status = classify(item);

          const st = item.station || {};
          const geo = item.geocode || {};
          const nameTh = st.tele_station_name?.th || "(ไม่ระบุชื่อ)";
          const amphoe = geo.amphoe_name?.th || "";
          const tumbon = geo.tumbon_name?.th || "";

          // ตรวจสอบตำแหน่งสำหรับพลิก Tooltip หลบขอบบน
          const isNearTop = y < 15;
          const tooltipPositionClass = isNearTop ? "top-full mt-2" : "bottom-full mb-2";

          return (
            <div
              key={idx}
              className="group"
              style={{
                position: 'absolute',
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                zIndex: 10,
              }}
            >
              {/* จุด Dot */}
              <div
                className="w-4 h-4 rounded-full border-2 border-[#16232B] shadow-lg"
                style={{
                  background: color,
                  transition: 'transform 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              />
              
              {/* Tooltip */}
              <div className={`absolute ${tooltipPositionClass} left-1/2 -translate-x-1/2 px-2 py-1.5 bg-[#223540] border border-[rgba(234,242,240,0.12)] rounded text-[10px] text-[#EAF2F0] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex flex-col items-center shadow-xl`}>
                <div className="flex items-center gap-1">
                  <span className="font-medium">{nameTh}</span>
                  <span className={`px-1 rounded text-[9px] ${
                    status.key === 'critical' ? 'bg-[#E5533D]' :
                    status.key === 'watch' ? 'bg-[#E8A33D]' :
                    'bg-[#4CAF6D]'
                  }`}>
                    {status.label}
                  </span>
                </div>
                
                {(tumbon || amphoe) && (
                  <div className="text-[9px] text-[#9FB4B0] mt-0.5">
                    {tumbon && `ต.${tumbon} `}
                    {amphoe && `อ.${amphoe}`}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}