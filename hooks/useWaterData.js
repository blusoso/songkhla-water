import { useState, useEffect, useCallback, useRef } from 'react';
import { FETCH_ROUTES } from '@/lib/constants';
import { extractSongkhla, classify, buildGaugePct } from '@/lib/api'; // 👈 import เพิ่ม buildGaugePct

export function useWaterData() {
  const [stations, setStations] = useState([]);
  const [liveMode, setLiveMode] = useState(false);
  const [updatedText, setUpdatedText] = useState('กำลังโหลดข้อมูล…');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [summary, setSummary] = useState({ total: 0, safe: 0, watch: 0, critical: 0 });

  const isFetchingRef = useRef(false);

  const renderStations = useCallback((items, isLive = true) => {
    // คำนวณเปอร์เซ็นต์และสถานะสำหรับทุก item
    const withMeta = items.map(item => {
      const pct = buildGaugePct(item);
      const status = classify(item);
      return { ...item, _pct: pct, _status: status };
    });

    // เรียงลำดับ: critical → watch → unknown → safe
    const RANK = { critical: 0, watch: 1, unknown: 2, safe: 3 };
    const sorted = withMeta.sort((a, b) => {
      const rankA = RANK[a._status.key] ?? 99;
      const rankB = RANK[b._status.key] ?? 99;
      if (rankA !== rankB) return rankA - rankB;
      
      // 🔥 ถ้าสถานะเดียวกัน ให้เรียงตามเปอร์เซ็นต์จากมากไปน้อย
      // ถ้า pct เป็น null ให้ไปอยู่ท้ายสุด
      const pctA = a._pct ?? -1;
      const pctB = b._pct ?? -1;
      return pctB - pctA; // มากไปน้อย
    });

    // นับจำนวนตามสถานะ
    const counts = { safe: 0, watch: 0, critical: 0, unknown: 0 };
    sorted.forEach(item => {
      const key = item._status.key;
      if (key === 'safe') counts.safe++;
      else if (key === 'watch') counts.watch++;
      else if (key === 'critical') counts.critical++;
      else counts.unknown++;
    });

    // เก็บข้อมูลโดยไม่รวม _pct และ _status
    const cleanData = sorted.map(({ _pct, _status, ...rest }) => rest);

    setStations(cleanData);
    setSummary({
      total: cleanData.length,
      safe: counts.safe,
      watch: counts.watch,
      critical: counts.critical,
    });
    setLoading(false);
    setErrorMsg(null);
    setLiveMode(isLive);
  }, []);

  const attemptLiveFetch = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (stations.length === 0) {
      setLoading(true);
    }
    setErrorMsg(null);

    let json = null;
    let lastErr = null;

    for (const route of FETCH_ROUTES) {
      try {
        const res = await fetch(route.url, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        let data;
        if (route.parse === 'allorigins') {
          const wrapper = await res.json();
          data = JSON.parse(wrapper.contents);
        } else {
          data = await res.json();
        }
        json = data;
        break;
      } catch (e) {
        lastErr = e;
      }
    }

    isFetchingRef.current = false;

    if (!json) {
      setErrorMsg(lastErr?.message || 'ไม่สามารถเชื่อมต่อ API ได้');
      setLoading(false);
      setUpdatedText(`อัปเดตไม่สำเร็จ: ${lastErr?.message || 'unknown error'}`);
      return;
    }

    try {
      const songkhla = extractSongkhla(json);
      if (songkhla.length === 0) {
        throw new Error('ไม่พบสถานีในจังหวัดสงขลาในข้อมูลที่ได้รับ');
      }

      renderStations(songkhla, true);
      console.log('songkhla', songkhla);
      
      const now = new Date();
      setUpdatedText(`อัปเดตล่าสุด ${now.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'medium' })}`);
    } catch (e) {
      setErrorMsg(e.message);
      setLoading(false);
      setUpdatedText(`ประมวลผลข้อมูลไม่สำเร็จ: ${e.message}`);
    }
  }, [stations.length, renderStations]);

  const manualImport = useCallback((jsonString) => {
    try {
      const json = JSON.parse(jsonString);
      const songkhla = extractSongkhla(json);
      if (songkhla.length === 0) {
        return { success: false, message: 'แยกวิเคราะห์ JSON สำเร็จ แต่ไม่พบสถานีในจังหวัดสงขลา' };
      }
      renderStations(songkhla, true);
      const now = new Date();
      setUpdatedText(`อัปเดตจากข้อมูลที่นำเข้าด้วยตนเอง ${now.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'medium' })}`);
      return { success: true, message: `นำเข้าข้อมูลสำเร็จ (${songkhla.length} สถานี)` };
    } catch (e) {
      return { success: false, message: `แยกวิเคราะห์ JSON ไม่สำเร็จ: ${e.message}` };
    }
  }, [renderStations]);

  useEffect(() => {
    attemptLiveFetch();
    const interval = setInterval(attemptLiveFetch, 5 * 60 * 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    stations,
    liveMode,
    updatedText,
    loading,
    errorMsg,
    summary,
    attemptLiveFetch,
    manualImport,
  };
}