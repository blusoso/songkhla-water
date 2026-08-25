'use client';

import { useRef } from 'react';
import { useWaterData } from '@/hooks/useWaterData';
import StationCard from './components/StationCard';
import SummaryCards from './components/SummaryCards';
import StatusPanel from './components/StatusPanel';

export default function HomePage() {
  const {
    stations,
    liveMode,
    updatedText,
    loading,
    errorMsg,
    summary,
    attemptLiveFetch,
    manualImport,
  } = useWaterData();

  const manualTextareaRef = useRef(null);
  const manualStatusRef = useRef(null);

  const handleManualImport = () => {
    const raw = manualTextareaRef.current?.value?.trim() || '';
    if (!raw) {
      if (manualStatusRef.current) {
        manualStatusRef.current.textContent = 'กรุณาวางข้อมูล JSON ก่อน';
        manualStatusRef.current.className = 'manual-status err';
      }
      return;
    }
    const result = manualImport(raw);
    if (manualStatusRef.current) {
      manualStatusRef.current.textContent = result.message;
      manualStatusRef.current.className = result.success ? 'manual-status ok' : 'manual-status err';
    }
  };

  return (
    <div className="min-h-screen bg-[#16232B] text-[#EAF2F0] font-sans antialiased p-6 md:p-8">
      <div className="max-w-[1180px] mx-auto">
        {/* Header */}
        <header className="flex flex-wrap gap-5 justify-between items-end pb-5 mb-5 border-b border-[rgba(234,242,240,0.12)]">
          <div>
            <div className="font-mono text-[11.5px] tracking-[0.16em] text-[#6FA8A3] uppercase flex items-center gap-2 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6FA8A3] inline-block" />
              THAIWATER TELEMETRY · LIVE
            </div>
            <h1 className="text-[clamp(26px,4vw,38px)] font-bold leading-[1.15] tracking-[-0.01em]">
              เฝ้าระวังระดับน้ำ <span className="text-[#6FA8A3]">จังหวัดสงขลา</span>
            </h1>
            <div className="text-[14.5px] text-[#6C8480] mt-2 max-w-[520px] leading-relaxed">
              สถานะระดับน้ำแบบสัญญาณไฟจราจรจากสถานีโทรมาตรในจังหวัดสงขลา ดึงข้อมูลสดจากสถาบันสารสนเทศทรัพยากรน้ำ (สสน.)
            </div>
          </div>
          <div className="text-right font-mono text-xs text-[#6C8480]">
            <div className={`inline-flex items-center gap-1.5 font-mono text-[10.5px] px-2.5 py-1 rounded-full mb-2 ${
              liveMode ? 'bg-[rgba(76,175,109,0.15)] text-[#4CAF6D]' : 'bg-[rgba(124,139,148,0.15)] text-[#7C8B94]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${liveMode ? 'bg-[#4CAF6D] animate-pulse' : 'bg-[#7C8B94]'}`} />
              {liveMode ? 'ข้อมูลสด · LIVE' : 'ข้อมูลตัวอย่าง'}
            </div>
            <div className="text-[#9FB4B0] mb-1.5">{updatedText}</div>
            <button onClick={attemptLiveFetch} className="mt-2 bg-[#223540] border border-[rgba(234,242,240,0.22)] text-[#EAF2F0] font-mono text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-colors hover:bg-[#28404C] hover:border-[#6FA8A3] inline-flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="w-3.5 h-3.5">
                <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                <path d="M21 4v6h-6" />
              </svg>
              รีเฟรชข้อมูลสด
            </button>
          </div>
        </header>

        {/* แสดงเฉพาะ StatusPanel (Loading) หรือข้อมูลจริง */}
        {loading ? (
          <StatusPanel loading={true} errorMsg={null} onRetry={attemptLiveFetch} />
        ) : errorMsg ? (
          <StatusPanel loading={false} errorMsg={errorMsg} onRetry={attemptLiveFetch} />
        ) : stations.length > 0 ? (
          <>
            <SummaryCards summary={summary} />
            <div className="font-mono text-[11.5px] tracking-[0.14em] text-[#6C8480] uppercase mb-3.5">
              สถานีวัดระดับน้ำ · เรียงตามความเสี่ยง
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {stations.map((item, idx) => (
                <StationCard key={idx} item={item} />
              ))}
            </div>
          </>
        ) : null}

        {/* Manual Import */}
        <details className="mt-7 border border-[rgba(234,242,240,0.12)] rounded-[14px] bg-[#223540] px-4 py-2">
          <summary className="cursor-pointer py-3 text-sm text-[#6FA8A3] font-semibold list-none flex items-center gap-2">
            <span className="transition-transform duration-150">▸</span>
            เชื่อมต่อ API ไม่ได้เลย? นำเข้าข้อมูลด้วยตนเอง
          </summary>
          <div className="pb-4">
            <p className="text-[12.5px] text-[#9FB4B0] leading-relaxed mb-2.5">
              คัดลอกข้อมูล JSON จาก{' '}
              <code className="bg-[#1C2C35] px-1.5 py-0.5 rounded text-[11.5px]">
                api-v3.thaiwater.net/api/v1/thaiwater30/public/waterlevel_load
              </code>{' '}
              (เช่น เปิดลิงก์นี้ในแท็บใหม่แล้วคัดลอกทั้งหมด) แล้ววางที่นี่ เพื่ออัปเดตแดชบอร์ดโดยไม่ต้องพึ่งการเชื่อมต่อของเบราว์เซอร์
            </p>
            <textarea
              ref={manualTextareaRef}
              className="w-full min-h-[110px] bg-[#1C2C35] border border-[rgba(234,242,240,0.22)] rounded-lg text-[#EAF2F0] font-mono text-[11.5px] p-2.5 resize-y focus:outline-none focus:ring-2 focus:ring-[#6FA8A3]"
              placeholder='วางเนื้อหา JSON ที่นี่ เช่น {"waterlevel_data":{"result":"OK","data":[...]}}'
            />
            <div className="flex items-center gap-3 mt-2.5">
              <button onClick={handleManualImport} className="bg-[#223540] border border-[rgba(234,242,240,0.22)] text-[#EAF2F0] font-mono text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-colors hover:bg-[#28404C] hover:border-[#6FA8A3] inline-flex items-center gap-1.5">
                ใช้ข้อมูลนี้
              </button>
              <span ref={manualStatusRef} className="text-xs text-[#9FB4B0]"></span>
            </div>
          </div>
        </details>

        {/* Footer */}
        <footer className="mt-10 pt-5 border-t border-[rgba(234,242,240,0.12)] text-xs text-[#6C8480] flex flex-wrap justify-between gap-2">
          <span>
            แหล่งข้อมูล:{' '}
            <a href="https://www.thaiwater.net" target="_blank" rel="noopener" className="text-[#6FA8A3] hover:underline">
              Thai Water (สสน.)
            </a>{' '}
            · api-v3.thaiwater.net/api/v1/thaiwater30/public/waterlevel_load
          </span>
          <span>
            เกณฑ์: 🔴 ล้นตลิ่ง · 🟡 ต่ำกว่าตลิ่งไม่ถึง 0.5 ม. · 🟢 ต่ำกว่าตลิ่ง 0.5 ม. ขึ้นไป
          </span>
        </footer>
      </div>
    </div>
  );
}