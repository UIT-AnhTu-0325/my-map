import type { Location } from '../types';
import { useAuth } from '../AuthContext';
import { formatPrice } from '../utils';

interface Props {
  location: Location;
  onEdit: (location: Location) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function LocationPopup({ location, onEdit, onToggleStatus, onDelete }: Props) {
  const { loggedIn } = useAuth();
  const masked = !loggedIn;
  const googleMapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;

  return (
    <div className="location-popup">
      <h3>{location.title}</h3>
      <p className="price">{formatPrice(location.price, masked)}</p>
      <span className={`status-badge ${location.status}`}>{location.status === 'selling' ? 'Đang bán' : 'Đã bán'}</span>
      <div className="popup-links">
        {location.tiktokUrl && (
          <a href={location.tiktokUrl} target="_blank" rel="noopener noreferrer" className="link-btn tiktok">🎵 TikTok</a>
        )}
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" className="link-btn gmaps">🗺️ Google Maps</a>
      </div>
      {loggedIn && (
        <div className="popup-actions">
          <button onClick={() => onEdit(location)}>Sửa</button>
          <button onClick={() => onToggleStatus(location.id)}>
            {location.status === 'selling' ? 'Đã bán' : 'Đang bán'}
          </button>
          <button className="btn-danger" onClick={() => onDelete(location.id)}>Xóa</button>
        </div>
      )}
    </div>
  );
}
