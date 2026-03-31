import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Location } from '../types';
import { getLocations, updateLocation, deleteLocation } from '../store';
import { useAuth } from '../AuthContext';
import { formatPrice } from '../utils';
import LocationModal from '../components/LocationModal';

export default function Dashboard() {
  const { loggedIn } = useAuth();
  const masked = !loggedIn;
  const navigate = useNavigate();

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
      <h1>Tổng quan</h1>
      {loading ? <p>Đang tải...</p> : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Tổng số</span>
              <span className="stat-value">{locations.length}</span>
            </div>
            <div className="stat-card selling">
              <span className="stat-label">Đang bán</span>
              <span className="stat-value">{selling.length}</span>
              <span className="stat-sub">{formatPrice(totalListing, masked)}</span>
            </div>
            <div className="stat-card sold">
              <span className="stat-label">Đã bán</span>
              <span className="stat-value">{sold.length}</span>
              <span className="stat-sub">{formatPrice(totalRevenue, masked)}</span>
            </div>
            <div className="stat-card revenue">
              <span className="stat-label">Doanh thu</span>
              <span className="stat-value">{formatPrice(totalRevenue, masked)}</span>
            </div>
          </div>

          <div className="filter-bar">
            {(['all', 'selling', 'sold'] as const).map(f => (
              <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
                {f === 'all' ? 'Tất cả' : f === 'selling' ? 'Đang bán' : 'Đã bán'}
              </button>
            ))}
          </div>

          <div className="items-list">
            {filtered.length === 0 && <p className="empty">Chưa có mục nào. Vào bản đồ để thêm địa điểm.</p>}
            {filtered.map(loc => (
              <div key={loc.id} className="item-card">
                {loc.imageUrl && <img src={loc.imageUrl} alt={loc.title} />}
                <div className="item-info">
                  <h3>{loc.title}</h3>
                  <p className="price">{formatPrice(loc.price, masked)}</p>
                  {loc.address && <p className="address">📍 {loc.address}</p>}
                  {(loc.landArea || loc.floorArea || loc.bedrooms || loc.bathrooms || loc.floors || loc.frontWidth) && (
                    <div className="property-specs">
                      {loc.landArea && <span>🏠 {loc.landArea}m²</span>}
                      {loc.floorArea && <span>📐 {loc.floorArea}m² sàn</span>}
                      {loc.frontWidth && <span>↔️ {loc.frontWidth}m ngang</span>}
                      {loc.floors && <span>🏗️ {loc.floors} tầng</span>}
                      {loc.bedrooms && <span>🛏️ {loc.bedrooms} PN</span>}
                      {loc.bathrooms && <span>🚿 {loc.bathrooms} WC</span>}
                    </div>
                  )}
                  {loc.features && loc.features.length > 0 && (
                    <div className="property-features">
                      {loc.features.map((f, i) => <span key={i} className="feature-tag">{f}</span>)}
                    </div>
                  )}
                  {loc.description && <p className="desc">{loc.description}</p>}
                  <span className={`status-badge ${loc.status}`}>{loc.status === 'selling' ? 'Đang bán' : 'Đã bán'}</span>
                  <div className="popup-links">
                    <button type="button" className="link-btn map-view" onClick={() => navigate('/', { state: { focusId: loc.id } })}>📍 Xem bản đồ</button>
                    {loc.tiktokUrl && (
                      <a href={loc.tiktokUrl} target="_blank" rel="noopener noreferrer" className="link-btn tiktok">🎵 TikTok</a>
                    )}
                    <a href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`} target="_blank" rel="noopener noreferrer" className="link-btn gmaps">🗺️ Google Maps</a>
                  </div>
                </div>
                {loggedIn && (
                  <div className="item-actions">
                    <button onClick={() => setEditing(loc)}>Sửa</button>
                    <button onClick={() => handleToggle(loc.id)}>
                      {loc.status === 'selling' ? 'Đã bán' : 'Đang bán'}
                    </button>
                    <button className="btn-danger" onClick={() => handleDelete(loc.id)}>Xóa</button>
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
