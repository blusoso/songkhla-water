import { useState, useEffect, useCallback } from 'react';
import { fetchRain24hData, extractSongkhlaRain24hr, classifyRain24h } from '@/lib/api';

export function useRain24hData() {
  const [rainStations, setRainStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);

  const loadRain = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const json = await fetchRain24hData();
      if (!json) throw new Error('ไม่สามารถดึงข้อมูลฝนได้');
      const songkhlaRain = extractSongkhlaRain24hr(json);
      
      // จัดรูปแบบข้อมูลเพิ่มเติม
      const withMeta = songkhlaRain.map(item => {
        const amount = parseFloat(item.rainfall_amount || item.rain_24h || 0);
        const status = classifyRain24h(amount);
        return { ...item, _rainAmount: amount, _status: status };
      });
      
      // เรียงตามปริมาณฝนมากไปน้อย
      withMeta.sort((a, b) => b._rainAmount - a._rainAmount);
      
      setRainStations(withMeta);
      setUpdatedAt(new Date());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRain();
    const interval = setInterval(loadRain, 5 * 60 * 1000); // รีเฟรชทุก 5 นาที
    return () => clearInterval(interval);
  }, [loadRain]);

  return { rainStations, loading, error, updatedAt, refresh: loadRain };
}