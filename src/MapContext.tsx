import { createContext, useContext, useRef, useState } from 'react';
import type { Location } from './types';
import L from 'leaflet';

interface MapContextValue {
  mapRef: React.RefObject<L.Map | null>;
  markerRefs: React.RefObject<Record<string, L.Marker>>;
  locations: Location[];
  setLocations: (locs: Location[]) => void;
  setMap: (map: L.Map) => void;
}

const MapCtx = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: React.ReactNode }) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<Record<string, L.Marker>>({});
  const [locations, setLocations] = useState<Location[]>([]);

  const setMap = (map: L.Map) => { mapRef.current = map; };

  return (
    <MapCtx.Provider value={{ mapRef, markerRefs, locations, setLocations, setMap }}>
      {children}
    </MapCtx.Provider>
  );
}

export function useMapContext() {
  const ctx = useContext(MapCtx);
  if (!ctx) throw new Error('useMapContext must be used within MapProvider');
  return ctx;
}
