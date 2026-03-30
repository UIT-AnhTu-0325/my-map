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
    if (!title || !price) return;
    setSaving(true);
    await onSave({
      lat,
      lng,
      title,
      description,
      price: parseFloat(price),
      imageUrl,
      tiktokUrl,
      status,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{isEdit ? 'Edit Location' : 'Add Location'}</h2>
        <p className="coords">📍 {lat.toFixed(5)}, {lng.toFixed(5)}</p>
        <form onSubmit={handleSubmit}>
          <label>
            Title *
            <input value={title} onChange={e => setTitle(e.target.value)} required />
          </label>
          <label>
            Description
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          </label>
          <label>
            Price *
            <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
          </label>
          <label>
            Image
            <input type="file" accept="image/*" onChange={handleImageUpload} />
          </label>
          {imageUrl && <img src={imageUrl} alt="Preview" className="image-preview" />}
          <label>
            TikTok Link
            <input value={tiktokUrl} onChange={e => setTiktokUrl(e.target.value)} placeholder="https://www.tiktok.com/..." />
          </label>
          {isEdit && (
            <label>
              Status
              <select value={status} onChange={e => setStatus(e.target.value as 'selling' | 'sold')}>
                <option value="selling">Selling</option>
                <option value="sold">Sold</option>
              </select>
            </label>
          )}
          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn-secondary" disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : isEdit ? 'Update' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
