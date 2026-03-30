import { useState } from 'react';
import type { Location } from '../types';

interface Props {
  lat: number;
  lng: number;
  onSave: (location: Omit<Location, 'id'>) => void;
  onCancel: () => void;
}

export default function AddLocationModal({ lat, lng, onSave, onCancel }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);

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
      status: 'selling',
      createdAt: new Date().toISOString(),
    });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Add Location</h2>
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
          <div className="modal-actions">
            <button type="button" onClick={onCancel} className="btn-secondary" disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
