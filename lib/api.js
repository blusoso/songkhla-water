import { PROVINCE_NAME_TH } from './constants';

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