import { useState, useEffect, useCallback } from 'react';
import type { Location } from '../types';
import { getLocations, updateLocation, deleteLocation } from '../store';
import { useAuth } from '../AuthContext';
import { formatPrice } from '../utils';
import LocationModal from '../components/LocationModal';

export default function Dashboard() {
  const { loggedIn } = useAuth();
  const masked = !loggedIn;

  const [locations, setLocations] = useState<Location[]>([]);
  const [filter, setFilter] = useState<'all' | 'selling' | 'sold'>('all');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Location | null>(null);

  const refresh = useCallback(async () => {
    const data = await getLocations();
    setLocations(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const selling = locations.filter(l => l.status === 'selling');
  const sold = locations.filter(l => l.status === 'sold');
  const totalRevenue = sold.reduce((sum, l) => sum + l.price, 0);
  const totalListing = selling.reduce((sum, l) => sum + l.price, 0);

  const filtered = filter === 'all' ? locations : locations.filter(l => l.status === filter);

  const handleToggle = async (id: string) => {
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

  const handleEdit = async (data: Omit<Location, 'id'>) => {
    if (!editing) return;
    await updateLocation(editing.id, data);
    await refresh();
    setEditing(null);
  };

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      {loading ? <p>Loading...</p> : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Items</span>
              <span className="stat-value">{locations.length}</span>
            </div>
            <div className="stat-card selling">
              <span className="stat-label">Selling</span>
              <span className="stat-value">{selling.length}</span>
              <span className="stat-sub">{formatPrice(totalListing, masked)}</span>
            </div>
            <div className="stat-card sold">
              <span className="stat-label">Sold</span>
              <span className="stat-value">{sold.length}</span>
              <span className="stat-sub">{formatPrice(totalRevenue, masked)}</span>
            </div>
            <div className="stat-card revenue">
              <span className="stat-label">Revenue</span>
              <span className="stat-value">{formatPrice(totalRevenue, masked)}</span>
            </div>
          </div>

          <div className="filter-bar">
            {(['all', 'selling', 'sold'] as const).map(f => (
              <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="items-list">
            {filtered.length === 0 && <p className="empty">No items yet. Go to the map to add locations.</p>}
            {filtered.map(loc => (
              <div key={loc.id} className="item-card">
                {loc.imageUrl && <img src={loc.imageUrl} alt={loc.title} />}
                <div className="item-info">
                  <h3>{loc.title}</h3>
                  <p className="price">{formatPrice(loc.price, masked)}</p>
                  {loc.description && <p className="desc">{loc.description}</p>}
                  <span className={`status-badge ${loc.status}`}>{loc.status}</span>
                  <div className="popup-links">
                    {loc.tiktokUrl && (
                      <a href={loc.tiktokUrl} target="_blank" rel="noopener noreferrer" className="link-btn tiktok">🎵 TikTok</a>
                    )}
                    <a href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`} target="_blank" rel="noopener noreferrer" className="link-btn gmaps">🗺️ Google Maps</a>
                  </div>
                </div>
                {loggedIn && (
                  <div className="item-actions">
                    <button onClick={() => setEditing(loc)}>Edit</button>
                    <button onClick={() => handleToggle(loc.id)}>
                      {loc.status === 'selling' ? 'Mark Sold' : 'Mark Selling'}
                    </button>
                    <button className="btn-danger" onClick={() => handleDelete(loc.id)}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
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
