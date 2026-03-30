import type { Location } from '../types';

interface Props {
  location: Location;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function LocationPopup({ location, onToggleStatus, onDelete }: Props) {
  return (
    <div className="location-popup">
      {location.imageUrl && <img src={location.imageUrl} alt={location.title} />}
      <h3>{location.title}</h3>
      <p className="price">${location.price.toFixed(2)}</p>
      {location.description && <p>{location.description}</p>}
      <span className={`status-badge ${location.status}`}>{location.status}</span>
      <div className="popup-actions">
        <button onClick={() => onToggleStatus(location.id)}>
          {location.status === 'selling' ? 'Mark Sold' : 'Mark Selling'}
        </button>
        <button className="btn-danger" onClick={() => onDelete(location.id)}>Delete</button>
      </div>
    </div>
  );
}
