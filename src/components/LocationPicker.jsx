import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationPicker.css';
import { MapPin, LocateFixed, X } from 'lucide-react';

const VIZAG_CENTRE = { lat: 17.7231, lng: 83.3013 };

// A map with a fixed pin in the middle: the customer moves the map until the pin
// sits on their home, or taps "Use my location". Loaded only when it's opened.
export default function LocationPicker({ initial, onConfirm, onClose }) {
  const mapElement = useRef(null);
  const map = useRef(null);
  const [point, setPoint] = useState(initial);
  const [status, setStatus] = useState(() => (initial || !navigator.geolocation ? null : 'Finding you…'));

  // Moves the map to the phone's GPS position (the browser asks permission first).
  const findMe = (m) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        m.setView([position.coords.latitude, position.coords.longitude], 17);
        setStatus(null);
      },
      () => setStatus("Couldn't get your location. Move the map so the pin sits on your home."),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  useEffect(() => {
    const start = initial ?? VIZAG_CENTRE;
    const m = L.map(mapElement.current, { zoomControl: false }).setView([start.lat, start.lng], initial ? 17 : 12);
    L.control.zoom({ position: 'bottomright' }).addTo(m);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(m);
    m.on('moveend', () => {
      const centre = m.getCenter();
      setPoint({ lat: centre.lat, lng: centre.lng });
    });
    map.current = m;
    if (!initial && navigator.geolocation) findMe(m);
    return () => m.remove();
    // The map is created once, when the picker opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToMyLocation = () => {
    if (!navigator.geolocation) {
      setStatus("Your browser can't share location. Move the map so the pin sits on your home.");
      return;
    }
    setStatus('Finding you…');
    findMe(map.current);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 flex items-stretch sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div
        className="glass w-full sm:max-w-lg flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pin-title"
      >
        <div className="p-6 pb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold text-muted tracking-widest uppercase mb-2">DELIVERY LOCATION</p>
            <h2 id="pin-title" className="text-2xl font-bold tracking-tight uppercase">Pin Your Location</h2>
            <p className="text-sm text-muted mt-1">Move the map so the pin sits on your home.</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1 text-muted hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative flex-1 min-h-[320px] sm:flex-none sm:h-[380px] border-y border-border">
          <div ref={mapElement} className="pt-map absolute inset-0" />
          <MapPin className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full w-10 h-10 text-accent fill-accent/30 z-[500]" />
        </div>

        {status && <p className="px-6 pt-4 text-sm text-muted">{status}</p>}

        <div className="p-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={goToMyLocation}
            className="flex-1 border-2 border-border hover:border-foreground text-foreground py-4 font-bold tracking-wider uppercase text-sm transition-colors flex items-center justify-center gap-2"
          >
            <LocateFixed className="w-4 h-4" /> Use my location
          </button>
          <button
            type="button"
            disabled={!point}
            onClick={() => onConfirm({ lat: point.lat, lng: point.lng })}
            className="flex-1 bg-accent hover:bg-accent-hover text-white py-4 font-bold tracking-wider uppercase text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm location
          </button>
        </div>
      </div>
    </div>
  );
}
