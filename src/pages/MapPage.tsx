import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useLocation as useRouterLocation } from 'react-router-dom';
import L from 'leaflet';
import type { Location } from '../types';
import { getLocations, addLocation, updateLocation, deleteLocation } from '../store';
import { useAuth } from '../AuthContext';
import { useMapContext } from '../MapContext';
import { formatPrice } from '../utils';
import LocationModal from '../components/LocationModal';
import LocationPopup from '../components/LocationPopup';
import 'leaflet/dist/leaflet.css';

import markerIcon from 'leaflet/dist/images/marker-icon.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
});

const MAP_VIEW_KEY = 'my-map-view';
const DEFAULT_CENTER: [number, number] = [12.2388, 109.1967]; // Nha Trang
const DEFAULT_ZOOM = 13;

function getSavedView(): { center: [number, number]; zoom: number } | null {
  try {
    const raw = localStorage.getItem(MAP_VIEW_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveView(center: [number, number], zoom: number) {
  localStorage.setItem(MAP_VIEW_KEY, JSON.stringify({ center, zoom }));
}

function MapEvents({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => onClick(e.latlng.lat, e.latlng.lng),
    moveend: (e) => {
      const map = e.target;
      const c = map.getCenter();
      saveView([c.lat, c.lng], map.getZoom());
    },
    zoomend: (e) => {
      const map = e.target;
      const c = map.getCenter();
      saveView([c.lat, c.lng], map.getZoom());
    },
  });
  return null;
}

function MapRefCapture({ setMap }: { setMap: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => { setMap(map); }, [map, setMap]);
  return null;
}

function InitialView({ locations }: { locations: Location[] }) {
  const map = useMap();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;

    const saved = getSavedView();
    if (saved) {
      map.setView(saved.center, saved.zoom);
      setInitialized(true);
      return;
    }

    // Focus on latest item if we have data
    if (locations.length > 0) {
      const latest = locations[0]; // already sorted by createdAt desc from store
      map.setView([latest.lat, latest.lng], 15);
      setInitialized(true);
      return;
    }

    // No data, no saved view — try user's geolocation
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        map.setView([pos.coords.latitude, pos.coords.longitude], DEFAULT_ZOOM);
        setInitialized(true);
      },
      () => {
        // Geolocation denied/unavailable, keep default
        setInitialized(true);
      },
      { timeout: 5000 }
    );
  }, [map, locations, initialized]);

  return null;
}

export default function MapPage() {
  const { loggedIn } = useAuth();
  const { markerRefs, locations, setLocations, setMap, mapRef } = useMapContext();
  const [pendingClick, setPendingClick] = useState<{ lat: number; lng: number } | null>(null);
  const [editing, setEditing] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const routerLocation = useRouterLocation();

  const refresh = useCallback(async () => {
    const data = await getLocations();
    setLocations(data);
    setLoading(false);
  }, [setLocations]);

  useEffect(() => { refresh(); }, [refresh]);

  // Handle "view on map" from Dashboard
  useEffect(() => {
    const state = routerLocation.state as { focusId?: string } | null;
    if (!state?.focusId || loading) return;
    const loc = locations.find(l => l.id === state.focusId);
    if (!loc) return;
    // Small delay to let map + markers render
    setTimeout(() => {
      mapRef.current?.flyTo([loc.lat, loc.lng], 18);
      const marker = markerRefs.current[state.focusId!];
      if (marker) setTimeout(() => marker.openPopup(), 600);
    }, 100);
    // Clear state so it doesn't re-trigger
    window.history.replaceState({}, '');
  }, [routerLocation.state, loading, locations, mapRef, markerRefs]);

  const handleMapClick = (lat: number, lng: number) => {
    if (loggedIn) setPendingClick({ lat, lng });
  };

  const handleAdd = async (loc: Omit<Location, 'id'>) => {
    await addLocation(loc);
    await refresh();
    setPendingClick(null);
  };

  const handleEdit = async (data: Omit<Location, 'id'>) => {
    if (!editing) return;
    await updateLocation(editing.id, data);
    await refresh();
    setEditing(null);
  };

  const handleToggleStatus = async (id: string) => {
    const loc = locations.find(l => l.id === id);
    if (loc) {
      await updateLocation(id, { status: loc.status === 'selling' ? 'sold' : 'selling' });
      await refresh();
    }
  };

  const handleDelete = async (id: string) => {
    await deleteLocation(id);
    await refresh();
  };

  return (
    <div className="map-page">
      {loading && <div className="loading-bar" />}
      <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} className="map-container">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents onClick={handleMapClick} />
        <MapRefCapture setMap={setMap} />
        {!loading && <InitialView locations={locations} />}
        {locations.map(loc => {
          const label = formatPrice(loc.price, false);
          const isSold = loc.status === 'sold';
          const priceIcon = L.divIcon({
            className: 'price-marker' + (isSold ? ' price-marker-sold' : ''),
            html: `<div class="price-label">${label}</div>`,
            iconSize: [80, 30],
            iconAnchor: [40, 30],
            popupAnchor: [0, -30],
          });
          return (
            <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={priceIcon} ref={(ref) => { if (ref) markerRefs.current[loc.id] = ref; }}>
              <Popup>
                <LocationPopup
                  location={loc}
                  onEdit={setEditing}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      {pendingClick && (
        <LocationModal
          lat={pendingClick.lat}
          lng={pendingClick.lng}
          onSave={handleAdd}
          onCancel={() => setPendingClick(null)}
        />
      )}
      {editing && (
        <LocationModal
          lat={editing.lat}
          lng={editing.lng}
          existing={editing}
          onSave={handleEdit}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
