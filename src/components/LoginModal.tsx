import { useState } from 'react';
import { useAuth } from '../AuthContext';

interface Props {
  onClose: () => void;
}

export default function LoginModal({ onClose }: Props) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const ok = await login(username, password);
    if (ok) {
      onClose();
    } else {
      setError('Sai tên đăng nhập hoặc mật khẩu');
    }
    setLoading(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Đăng nhập</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Tên đăng nhập
            <input value={username} onChange={e => setUsername(e.target.value)} required />
          </label>
          <label>
            Mật khẩu
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </label>
          {error && <p className="error-text">{error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={loading}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
