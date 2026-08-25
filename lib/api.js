import { PROVINCE_NAME_TH, RAIN_24H_API_URL } from './constants';

export function classify(item) {
  const txt = item.diff_wl_bank_text || '';
  
  // ถ้าข้อความบอกว่าล้นตลิ่ง -> วิกฤต
  if (txt.includes('ล้นตลิ่ง')) {
    return { key: 'critical', label: 'วิกฤต' };
  }

  const st = item.station || {};
  const ground = parseFloat(st.ground_level);
  const bank = parseFloat(st.min_bank);
  const level = parseFloat(item.waterlevel_msl);

  // ถ้าข้อมูลไม่ครบ -> ไม่ทราบสถานะ
  if ([ground, bank, level].some(isNaN) || bank <= ground) {
    return { key: 'unknown', label: 'ไม่ทราบสถานะ' };
  }

  const pct = ((level - ground) / (bank - ground)) * 100;

  // 🔥 ถ้า pct ติดลบ (ระดับน้ำต่ำกว่าพื้นดิน) ให้ถือว่าปลอดภัย
  if (pct < 0) {
    return { key: 'safe', label: 'ปลอดภัย' };
  }

  if (pct >= 100) {
    return { key: 'critical', label: 'วิกฤต' };
  } else if (pct >= 70) {
    return { key: 'watch', label: 'เฝ้าระวัง' };
  } else {
    return { key: 'safe', label: 'ปลอดภัย' };
  }
}

export function fmt(v, digits = 2) {
  if (v === null || v === undefined || v === '' || isNaN(parseFloat(v))) return '—';
  return parseFloat(v).toFixed(digits);
}

export function extractSongkhla(json) {
  const all = json?.waterlevel_data?.data || [];
  return all.filter(item => {
    const isSongkhla = item.geocode?.province_name?.th === PROVINCE_NAME_TH;
    const hasValidBank = item.station?.min_bank > 0;
    return isSongkhla && hasValidBank;
  });
}

export function buildGaugePct(item) {
  const st = item.station || {};
  const ground = parseFloat(st.ground_level);
  const bank = parseFloat(st.min_bank);
  const level = parseFloat(item.waterlevel_msl);
  if ([ground, bank, level].some(isNaN) || bank <= ground) return null;
  let pct = ((level - ground) / (bank - ground)) * 100;
  // 🔥 ถ้าติดลบ ให้เป็น 0 (แสดงว่าแห้ง)
  if (pct < 0) pct = 0;
  if (pct > 100) pct = 100;
  return pct;
}

export async function fetchRain24hData() {
  const RAIN_24H_FETCH_ROUTES = [
    { url: RAIN_24H_API_URL, parse: "json" },
    {
      url:
        "https://api.codetabs.com/v1/proxy?quest=" +
        encodeURIComponent(RAIN_24H_API_URL),
      parse: "json",
    },
    {
      url: "https://api.allorigins.win/get?url=" + encodeURIComponent(RAIN_24H_API_URL),
      parse: "allorigins",
    },
  ];

  let json = null;
  for (const route of RAIN_24H_FETCH_ROUTES) {
    try {
      const res = await fetch(route.url, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error("HTTP " + res.status);
      let data;
      if (route.parse === "allorigins") {
        const wrapper = await res.json();
        data = JSON.parse(wrapper.contents);
      } else {
        data = await res.json();
      }
      json = data;
      break;
    } catch (e) {
      console.warn("Rain fetch fallback failed:", e.message);
    }
  }
  return json;
}

export function extractSongkhlaRain24hr(json) {
  const all = json?.rain_data?.data || json?.data || [];
  // สมมติว่า API มีฟิลด์ province_name หรือ station.geocode.province_name
  return all.filter(item => {
    const province = item.province_name?.th || item.geocode?.province_name?.th;
    return province === 'สงขลา';
  });
}


export function classifyRain24h(amount) {
  if (amount === null || amount === undefined) return { key: 'unknown', label: 'ไม่ทราบ' };
  if (amount >= 90) return { key: 'heavy', label: 'หนักมาก', color: '#E5533D' };
  if (amount >= 50) return { key: 'moderate', label: 'ปานกลาง', color: '#E8A33D' };
  if (amount >= 20) return { key: 'light', label: 'เล็กน้อย', color: '#4CAF6D' };
  return { key: 'dry', label: 'แห้ง', color: '#6C8480' };
}