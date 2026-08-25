import { classify, fmt, buildGaugePct } from "@/lib/api";

export default function StationCard({ item }) {
  const status = classify(item);
  const st = item.station || {};
  const geo = item.geocode || {};
  const nameTh = st.tele_station_name?.th || "(ไม่ระบุชื่อ)";
  const nameEn = st.tele_station_name?.en || "";
  const amphoe = geo.amphoe_name?.th || "";
  const tumbon = geo.tumbon_name?.th || "";
  const river = item.river_name || "—";
  const updateTime = item.waterlevel_datetime || item.update_datetime || "";

  const colorVar =
    status.key === "critical"
      ? "#E5533D"
      : status.key === "watch"
        ? "#E8A33D"
        : status.key === "safe"
          ? "#4CAF6D"
          : "#7C8B94";

  let pct = 40;
  let overflow = false;
  const pctCalc = buildGaugePct(item);
  if (pctCalc !== null) {
    pct = pctCalc;
    if (
      pctCalc === 100 &&
      parseFloat(item.waterlevel_msl) > parseFloat(st.min_bank)
    )
      overflow = true;
  }

  const diffVal = item.diff_wl_bank;
  const diffLabel = item.diff_wl_bank_text || "";

  return (
    <div
      className={`bg-[#223540] border border-[rgba(234,242,240,0.12)] rounded-[14px] p-4 flex gap-4 transition-all hover:border-[rgba(234,242,240,0.22)] hover:-translate-y-0.5 ${
        status.key === "critical"
          ? "border-[rgba(229,83,61,0.35)]"
          : status.key === "watch"
            ? "border-[rgba(232,163,61,0.28)]"
            : ""
      }`}
    >
      {/* Gauge */}
      <div className="flex flex-col items-center flex-none w-[34px]">
        <div className="relative w-4 h-[132px] rounded-lg bg-[#1C2C35] border border-[rgba(234,242,240,0.22)] overflow-hidden">
          {overflow && (
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] text-[#E5533D]">
              ▲
            </div>
          )}
          <div
            className="absolute bottom-0 left-0 right-0 rounded-b-[7px] transition-all duration-500"
            style={{
              height: `${pct}%`,
              background: `linear-gradient(180deg, ${colorVar}, color-mix(in srgb, ${colorVar} 75%, black))`,
            }}
          />
          <div
            className="absolute left-[-4px] right-[-4px] h-px bg-[rgba(234,242,240,0.45)]"
            style={{ bottom: "100%" }}
          />
        </div>
        <div
          className="mt-1.5 w-[26px] h-1 rounded-sm"
          style={{ background: colorVar, boxShadow: `0 0 8px 0 ${colorVar}` }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <div className="text-[15px] font-semibold leading-tight text-[#EAF2F0]">
            {nameTh}
          </div>
          <div
            className={`flex-none font-mono text-[10.5px] font-semibold tracking-wide px-2.5 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap ${
              status.key === "safe"
                ? "bg-[rgba(76,175,109,0.15)] text-[#4CAF6D]"
                : status.key === "watch"
                  ? "bg-[rgba(232,163,61,0.15)] text-[#E8A33D]"
                  : status.key === "critical"
                    ? "bg-[rgba(229,83,61,0.17)] text-[#E5533D]"
                    : "bg-[rgba(124,139,148,0.15)] text-[#7C8B94]"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                status.key === "safe"
                  ? "bg-[#4CAF6D]"
                  : status.key === "watch"
                    ? "bg-[#E8A33D]"
                    : status.key === "critical"
                      ? "bg-[#E5533D]"
                      : "bg-[#7C8B94]"
              }`}
            />
            {status.label}
          </div>
        </div>
        <div className="text-xs text-[#9FB4B0] mt-0.5 mb-3">
          {amphoe && `${amphoe} · `}
          {tumbon && `${tumbon} · `}
          <span className="text-[#6FA8A3] font-bold">{river}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 font-mono">
          <div>
            <div className="text-[10.5px] text-[#6C8480] uppercase tracking-wide">
              ระดับน้ำ
            </div>
            <div className="text-[14.5px] font-semibold text-[#EAF2F0]">
              {fmt(item.waterlevel_msl)}{" "}
              <small className="text-[10.5px] font-normal text-[#9FB4B0]">
                ม.รทก.
              </small>
            </div>
          </div>
          <div>
            <div className="text-[10.5px] text-[#6C8480] uppercase tracking-wide">
              ระดับตลิ่ง
            </div>
            <div className="text-[14.5px] font-semibold text-[#EAF2F0]">
              {fmt(st.min_bank)}{" "}
              <small className="text-[10.5px] font-normal text-[#9FB4B0]">
                ม.รทก.
              </small>
            </div>
          </div>
          <div className="col-span-2 mt-1 pt-2 border-t border-[rgba(234,242,240,0.12)] flex justify-between items-center">
            <div className="text-[10.5px] text-[#6C8480] uppercase tracking-wide">
              {diffLabel || "ส่วนต่างจากตลิ่ง"}
            </div>
            <div
              className={`text-[13px] font-semibold ${
                status.key === "safe"
                  ? "text-[#4CAF6D]"
                  : status.key === "watch"
                    ? "text-[#E8A33D]"
                    : status.key === "critical"
                      ? "text-[#E5533D]"
                      : "text-[#EAF2F0]"
              }`}
            >
              {diffVal !== null && diffVal !== undefined
                ? `${fmt(diffVal)} ม.`
                : "—"}
            </div>
          </div>
          <div className="col-span-2 flex justify-between items-center">
            <div className="text-[10.5px] text-[#6C8480] uppercase tracking-wide">
              อัปเดตล่าสุด
            </div>
            <div className="text-right text-[10.5px] text-[#6C8480] uppercase tracking-wide">
              {new Date(updateTime).toLocaleString("th-TH", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
