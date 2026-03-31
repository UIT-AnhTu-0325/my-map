import { useState } from 'react';
import type { Location } from '../types';

interface Props {
  lat: number;
  lng: number;
  existing?: Location;
  onSave: (data: Omit<Location, 'id'>) => void;
  onCancel: () => void;
}

export default function LocationModal({ lat, lng, existing, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [price, setPrice] = useState(existing ? String(existing.price) : '');
  const [imageUrl, setImageUrl] = useState(existing?.imageUrl ?? '');
  const [tiktokUrl, setTiktokUrl] = useState(existing?.tiktokUrl ?? '');
  const [status, setStatus] = useState(existing?.status ?? 'selling');
  const [saving, setSaving] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // Real estate fields
  const [address, setAddress] = useState(existing?.address ?? '');
  const [landArea, setLandArea] = useState(existing?.landArea ? String(existing.landArea) : '');
  const [floorArea, setFloorArea] = useState(existing?.floorArea ? String(existing.floorArea) : '');
  const [floors, setFloors] = useState(existing?.floors ? String(existing.floors) : '');
  const [bedrooms, setBedrooms] = useState(existing?.bedrooms ? String(existing.bedrooms) : '');
  const [bathrooms, setBathrooms] = useState(existing?.bathrooms ? String(existing.bathrooms) : '');
  const [frontWidth, setFrontWidth] = useState(existing?.frontWidth ? String(existing.frontWidth) : '');
  const [featuresStr, setFeaturesStr] = useState(existing?.features?.join(', ') ?? '');

  const isEdit = !!existing;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    setSaving(true);
    const features = featuresStr.split(',').map(s => s.trim()).filter(Boolean);
    await onSave({
      lat, lng, title, description,
      price: price ? parseFloat(price) : 0, imageUrl, tiktokUrl, status,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      address: address || undefined,
      landArea: landArea ? parseFloat(landArea) : undefined,
      floorArea: floorArea ? parseFloat(floorArea) : undefined,
      floors: floors ? parseInt(floors) : undefined,
      bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
      bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
      frontWidth: frontWidth ? parseFloat(frontWidth) : undefined,
      features: features.length > 0 ? features : undefined,
    });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{isEdit ? 'Chỉnh sửa' : 'Thêm địa điểm'}</h2>
        <p className="coords">📍 {lat.toFixed(5)}, {lng.toFixed(5)}</p>
        <form onSubmit={handleSubmit}>
          <label>
            Tiêu đề *
            <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="Nhà 2 tầng Hẻm Lò Bò" />
          </label>
          <label>
            Giá (tỷ đồng)
            <input type="number" step="0.001" value={price} onChange={e => setPrice(e.target.value)} placeholder="2.58" />
          </label>
          <label>
            Địa chỉ
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Hẻm Lò Bò, Phương Sài, Nha Trang" />
          </label>

          {isEdit && (
            <label>
              Trạng thái
              <select value={status} onChange={e => setStatus(e.target.value as 'selling' | 'sold')}>
                <option value="selling">Đang bán</option>
                <option value="sold">Đã bán</option>
              </select>
            </label>
          )}

          <button type="button" className="toggle-more" onClick={() => setShowMore(!showMore)}>
            {showMore ? '▲ Ẩn bớt' : '▼ Thêm thông tin'}
          </button>

          {showMore && (
            <>
              <div className="form-row">
                <label className="form-third">DT đất (m²)<input type="number" step="0.1" value={landArea} onChange={e => setLandArea(e.target.value)} placeholder="29.9" /></label>
                <label className="form-third">DT sàn (m²)<input type="number" step="0.1" value={floorArea} onChange={e => setFloorArea(e.target.value)} placeholder="59.8" /></label>
                <label className="form-third">Ngang (m)<input type="number" step="0.01" value={frontWidth} onChange={e => setFrontWidth(e.target.value)} placeholder="4.55" /></label>
              </div>
              <div className="form-row">
                <label className="form-third">Tầng<input type="number" value={floors} onChange={e => setFloors(e.target.value)} placeholder="2" /></label>
                <label className="form-third">PN<input type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)} placeholder="2" /></label>
                <label className="form-third">WC<input type="number" value={bathrooms} onChange={e => setBathrooms(e.target.value)} placeholder="2" /></label>
              </div>
              <label>
                Mô tả
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Mô tả chi tiết..." />
              </label>
              <label>
                Tiện ích (phân cách bằng dấu phẩy)
                <input value={featuresStr} onChange={e => setFeaturesStr(e.target.value)} placeholder="Ban công, Hẻm thông, Gần chợ" />
              </label>
              <label>
                Hình ảnh
                <input type="file" accept="image/*" onChange={handleImageUpload} />
              </label>
              {imageUrl && <img src={imageUrl} alt="Preview" className="image-preview" />}
              <label>
                TikTok
                <input value={tiktokUrl} onChange={e => setTiktokUrl(e.target.value)} placeholder="https://www.tiktok.com/..." />
              </label>
            </>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn-secondary" disabled={saving}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
