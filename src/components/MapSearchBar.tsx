import { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import type { Location } from '../types';
import { parseInput, filterLocations, searchPlaces, type GeoSearchResult } from '../searchUtils';

interface MapSearchBarProps {
  locations: Location[];
  markerRefs: React.RefObject<Record<string, L.Marker>>;
  mapRef: React.RefObject<L.Map | null>;
}

export default function MapSearchBar({ locations, markerRefs, mapRef }: MapSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [geoResults, setGeoResults] = useState<GeoSearchResult[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const parsed = parseInput(query);

  const filteredLocations =
    parsed.type === 'text' && parsed.query.length >= 2
      ? filterLocations(locations, parsed.query)
      : [];

  const hasTextQuery = parsed.type === 'text' && parsed.query.length >= 2;
  const showNoResults = hasTextQuery && filteredLocations.length === 0 && geoResults.length === 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    const result = parseInput(value);
    if (result.type === 'coordinate' || (result.type === 'text' && result.query.length >= 2)) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setGeoResults([]);
    }

    // Debounced geocode search for text queries
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (result.type === 'text' && result.query.length >= 3) {
      debounceRef.current = setTimeout(async () => {
        const results = await searchPlaces(result.query);
        setGeoResults(results);
      }, 400);
    } else {
      setGeoResults([]);
    }
  };

  const handleLocationSelect = useCallback(
    (loc: Location) => {
      mapRef.current?.flyTo([loc.lat, loc.lng], 18);
      const marker = markerRefs.current[loc.id];
      if (marker) marker.openPopup();
      setQuery('');
      setIsOpen(false);
      setGeoResults([]);
    },
    [mapRef, markerRefs]
  );

  const handleCoordinateSelect = useCallback(
    (lat: number, lng: number) => {
      mapRef.current?.flyTo([lat, lng], 18);
      setQuery('');
      setIsOpen(false);
      setGeoResults([]);
    },
    [mapRef]
  );

  const handleGeoSelect = useCallback(
    (result: GeoSearchResult) => {
      mapRef.current?.flyTo([result.lat, result.lng], 18);
      setQuery('');
      setIsOpen(false);
      setGeoResults([]);
    },
    [mapRef]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (parsed.type === 'coordinate') {
        handleCoordinateSelect(parsed.lat, parsed.lng);
      } else if (filteredLocations.length > 0) {
        handleLocationSelect(filteredLocations[0]);
      } else if (geoResults.length > 0) {
        handleGeoSelect(geoResults[0]);
      }
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const truncate = (text: string, maxLen: number) =>
    text.length > maxLen ? text.slice(0, maxLen) + '…' : text;

  return (
    <div className="map-search-bar" ref={containerRef}>
      <div className="search-input-wrapper">
        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Tìm kiếm địa điểm hoặc dán tọa độ..."
          className="search-input"
        />
      </div>

      {isOpen && (
        <div className="search-results">
          {parsed.type === 'coordinate' && (
            <button type="button" className="search-result-item coordinate-result" onClick={() => handleCoordinateSelect(parsed.lat, parsed.lng)}>
              <span className="result-title">Đi tới {parsed.lat}, {parsed.lng}</span>
            </button>
          )}

          {filteredLocations.length > 0 && (
            <>
              <div className="search-section-label">Địa điểm đã lưu</div>
              {filteredLocations.map((loc) => (
                <button type="button" key={loc.id} className="search-result-item" onClick={() => handleLocationSelect(loc)}>
                  <span className="result-title">{loc.title}</span>
                  <span className={`status-badge ${loc.status}`}>{loc.status}</span>
                  {loc.description && <span className="result-description">{truncate(loc.description, 80)}</span>}
                </button>
              ))}
            </>
          )}

          {geoResults.length > 0 && (
            <>
              <div className="search-section-label">Tìm trên bản đồ</div>
              {geoResults.map((r, i) => (
                <button type="button" key={i} className="search-result-item geo-result" onClick={() => handleGeoSelect(r)}>
                  <span className="result-title">{truncate(r.name, 80)}</span>
                </button>
              ))}
            </>
          )}

          {showNoResults && <div className="search-no-results">Không tìm thấy địa điểm</div>}
        </div>
      )}
    </div>
  );
}
