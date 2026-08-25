export const BASE_API_URL = "https://api-v3.thaiwater.net/api/v1/thaiwater30";
export const WATER_LEVEL_API_URL = `${BASE_API_URL}/public/waterlevel_load`;
export const RAIN_24H_API_URL = `${BASE_API_URL}/public/rain_24h`;
export const PROVINCE_NAME_TH = "สงขลา";
export const WATCH_THRESHOLD_M = 0.5;
export const SNAPSHOT_CAPTURED_AT = "2026-08-25 15:30";

export const SNAPSHOT_DATA = [
  {
    waterlevel_msl: "0.06",
    diff_wl_bank: "0.91",
    diff_wl_bank_text: "ต่ำกว่าตลิ่ง (ม.)",
    river_name: "คลองปากรอ",
    station: {
      tele_station_name: { th: "ปากรอ", en: "Songkhla Lake 5" },
      min_bank: 0.97,
      ground_level: -6.322,
    },
    geocode: { province_name: { th: "สงขลา" }, amphoe_name: { th: "สิงหนคร" } },
  },
  {
    waterlevel_msl: "33.44",
    diff_wl_bank: "6.48",
    diff_wl_bank_text: "ต่ำกว่าตลิ่ง (ม.)",
    river_name: "คลองรัตภูมิ",
    station: {
      tele_station_name: { th: "บ้านนาสีทอง", en: "" },
      min_bank: 39.92,
      ground_level: -1.223,
    },
    geocode: { province_name: { th: "สงขลา" }, amphoe_name: { th: "รัตภูมิ" } },
  },
  {
    waterlevel_msl: "-0.19",
    diff_wl_bank: "1.03",
    diff_wl_bank_text: "ต่ำกว่าตลิ่ง (ม.)",
    river_name: "คลองอู่ตะเภา",
    station: {
      tele_station_name: {
        th: "สะพานข้ามคลองอู่ตะเภา",
        en: "Khlong U Taphao Bridge",
      },
      min_bank: 0.84,
      ground_level: -4.515,
    },
    geocode: { province_name: { th: "สงขลา" }, amphoe_name: { th: "หาดใหญ่" } },
  },
];

export const FETCH_ROUTES = [
  { url: WATER_LEVEL_API_URL, parse: "json" },
  {
    url:
      "https://api.codetabs.com/v1/proxy?quest=" +
      encodeURIComponent(WATER_LEVEL_API_URL),
    parse: "json",
  },
  {
    url:
      "https://api.allorigins.win/get?url=" +
      encodeURIComponent(WATER_LEVEL_API_URL),
    parse: "allorigins",
  },
  {
    url: "https://corsproxy.io/?url=" + encodeURIComponent(WATER_LEVEL_API_URL),
    parse: "json",
  },
  {
    url: "https://corsproxy.io/?url=" + encodeURIComponent(WATER_LEVEL_API_URL),
    parse: "json",
  },
];