import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import type { Location } from '../types';
import { getLocations, addLocation, updateLocation, deleteLocation } from '../store';
import AddLocationModal from '../components/AddLocationModal';
import LocationPopup from '../components/LocationPopup';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const soldIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: 'sold-marker',
});

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onClick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function MapPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [pendingClick, setPendingClick] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getLocations();
    setLocations(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleSave = async (loc: Omit<Location, 'id'>) => {
    await addLocation(loc);
    await refresh();
    setPendingClick(null);
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
      {loading && <div className="loading-bar">Loading...</div>}
      <MapContainer center={[10.8231, 106.6297]} zoom={13} className="map-container">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onClick={(lat, lng) => setPendingClick({ lat, lng })} />
        {locations.map(loc => (
          <Marker key={loc.id} position={[loc.lat, loc.lng]} icon={loc.status === 'sold' ? soldIcon : new L.Icon.Default()}>
            <Popup>
              <LocationPopup location={loc} onToggleStatus={handleToggleStatus} onDelete={handleDelete} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {pendingClick && (
        <AddLocationModal
          lat={pendingClick.lat}
          lng={pendingClick.lng}
          onSave={handleSave}
          onCancel={() => setPendingClick(null)}
        />
      )}
    </div>
  );
}
