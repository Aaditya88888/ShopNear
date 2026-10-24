import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Crisp Vector SVG Marker Icons (avoids broken Leaflet asset png paths in Vite)
const createShopIcon = (isDraggable = false, color = '#EF4444', label = '') =>
  L.divIcon({
    className: 'shop-marker-icon',
    html: `
      <div style="position: relative; display: flex; flex-direction: column; align-items: center; ${
        isDraggable ? 'cursor: grab;' : ''
      }">
        ${
          label
            ? `<div style="background: #0B2B50; color: #ffffff; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 9999px; box-shadow: 0 2px 6px rgba(0,0,0,0.25); white-space: nowrap; margin-bottom: 4px;">${label}</div>`
            : ''
        }
        <div style="width: 36px; height: 36px; background: ${color}; border: 3px solid #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.45); color: #ffffff;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 7px solid ${color}; margin-top: -1px;"></div>
      </div>
    `,
    iconSize: [120, 70],
    iconAnchor: [60, label ? 65 : 42],
    popupAnchor: [0, label ? -65 : -38],
  });

const createUserIcon = () =>
  L.divIcon({
    className: 'user-marker-icon',
    html: `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 28px; height: 28px; background: rgba(37, 99, 235, 0.3); border-radius: 50%; animation: pulse 1.8s infinite;"></div>
        <div style="position: absolute; width: 16px; height: 16px; background: #2563EB; border: 2.5px solid #ffffff; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.35);"></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });

export default function LeafletMap({
  shopCoords, // [lng, lat] or { lng, lat } or { coordinates: [lng, lat] }
  userCoords, // { lat, lng } or [lng, lat]
  shopName = 'Shop Location',
  shopAddress = '',
  draggable = false,
  onMarkerDragEnd = null,
  markerColor = '#EF4444',
  markerLabel = '',
  height = '240px',
  className = '',
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const shopMarkerRef = useRef(null);

  // Normalize coordinates into [lat, lng] for Leaflet
  const extractLatLng = (input) => {
    if (!input) return null;
    if (Array.isArray(input) && input.length === 2) {
      // GeoJSON standard: [lng, lat] -> Leaflet expects [lat, lng]
      const lng = parseFloat(input[0]);
      const lat = parseFloat(input[1]);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    if (typeof input === 'object') {
      if (Array.isArray(input.coordinates)) {
        const lng = parseFloat(input.coordinates[0]);
        const lat = parseFloat(input.coordinates[1]);
        if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
      }
      if (input.lat !== undefined && input.lng !== undefined) {
        const lat = parseFloat(input.lat);
        const lng = parseFloat(input.lng);
        if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
      }
    }
    return null;
  };

  const parsedShop = extractLatLng(shopCoords);
  const parsedUser = extractLatLng(userCoords);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on shop, or user, or default (Delhi NCR)
    const initialCenter = parsedShop || parsedUser || [28.6692, 77.4538];
    const initialZoom = parsedShop && parsedUser ? 13 : 15;

    // Clean up existing map instance if any
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Initialize Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: true,
      scrollWheelZoom: false, // Prevent accidental scrolling when page scrolls
    });

    mapInstanceRef.current = map;

    // Add OpenStreetMap Tile Layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
    }).addTo(map);

    const bounds = [];

    // Add Shop Marker
    if (parsedShop) {
      const shopMarker = L.marker(parsedShop, {
        icon: createShopIcon(draggable, markerColor, markerLabel),
        draggable: Boolean(draggable),
      }).addTo(map);

      shopMarkerRef.current = shopMarker;

      const popupContent = `
        <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
          <strong style="color: #0B2B50; font-size: 13px;">${shopName}</strong>
          ${shopAddress ? `<p style="margin: 3px 0 0; color: #64748B;">${shopAddress}</p>` : ''}
          ${draggable ? `<p style="margin: 4px 0 0; color: #00C66B; font-weight: 600;">Drag pin to adjust shop entrance</p>` : ''}
        </div>
      `;

      shopMarker.bindPopup(popupContent);

      if (draggable && onMarkerDragEnd) {
        shopMarker.on('dragend', (e) => {
          const newPos = e.target.getLatLng();
          // Pass back in GeoJSON [longitude, latitude] order
          onMarkerDragEnd([newPos.lng, newPos.lat]);
        });
      }

      bounds.push(parsedShop);
    }

    // Add User Location Marker if available
    if (parsedUser) {
      const userMarker = L.marker(parsedUser, {
        icon: createUserIcon(),
      }).addTo(map);

      userMarker.bindPopup(`
        <div style="font-family: inherit; font-size: 12px;">
          <strong style="color: #2563EB;">Your Location</strong>
        </div>
      `);

      bounds.push(parsedUser);
    }

    // Fit map bounds to show both pins if both exist
    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else if (bounds.length === 1) {
      map.setView(bounds[0], 15);
    }

    // Modal render fix: Invalidate size after modal animation completes
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [
    parsedShop ? parsedShop[0] : null,
    parsedShop ? parsedShop[1] : null,
    parsedUser ? parsedUser[0] : null,
    parsedUser ? parsedUser[1] : null,
    draggable,
    shopName,
    shopAddress,
  ]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-[#DCEBFF] shadow-xs ${className}`}>
      <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-0" />
      {draggable && (
        <div className="absolute top-2 right-2 z-10 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-[#DCEBFF] shadow-xs text-[11px] font-semibold text-[#0B2B50] flex items-center gap-1.5 pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-[#00C66B] animate-pulse"></span>
          <span>Drag marker to adjust location</span>
        </div>
      )}
    </div>
  );
}
