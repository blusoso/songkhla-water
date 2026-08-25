export default function StatusPanel({ loading, errorMsg, onRetry }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#6C8480] text-center gap-3 border border-dashed border-[rgba(234,242,240,0.22)] rounded-[14px]">
        <div className="w-6 h-6 rounded-full border-2 border-[rgba(234,242,240,0.22)] border-t-[#6FA8A3] animate-spin" />
        <h3 className="text-base font-semibold text-[#EAF2F0]">กำลังดึงข้อมูลสถานีในจังหวัดสงขลา</h3>
        <p className="text-[13.5px] max-w-[440px] leading-relaxed">เชื่อมต่อไปยัง Thai Water API เพื่อดึงระดับน้ำล่าสุด…</p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#6C8480] text-center gap-3 border border-dashed border-[rgba(234,242,240,0.22)] rounded-[14px]">
        <div className="text-2xl">⚠️</div>
        <h3 className="text-base font-semibold text-[#EAF2F0]">ไม่สามารถโหลดข้อมูลสดได้</h3>
        <p className="text-[13.5px] max-w-[440px] leading-relaxed">{errorMsg}</p>
        <button onClick={onRetry} className="mt-2 bg-[rgba(229,83,61,0.17)] border border-[rgba(229,83,61,0.4)] text-[#FFD3CB] font-mono text-[12.5px] px-4 py-2 rounded-lg cursor-pointer hover:bg-[rgba(229,83,61,0.26)]">
          ลองใหม่อีกครั้ง
        </button>
      </div>
    );
  }

  return null;
}