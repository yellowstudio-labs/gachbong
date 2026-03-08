import { useState, useEffect } from 'react';
import { getGalleryItems, removeGalleryItem, clearGallery } from '../../utils/galleryStorage';
import type { GalleryItem } from '../../utils/galleryStorage';
import { patternList } from '../../data/patterns';

export function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Load items from localStorage
  const loadItems = () => {
    setItems(getGalleryItems());
  };

  useEffect(() => {
    loadItems();

    // Listen for gallery updates
    const handleUpdate = () => loadItems();
    window.addEventListener('gallery-updated', handleUpdate);
    return () => window.removeEventListener('gallery-updated', handleUpdate);
  }, []);

  // Handle delete
  const handleDelete = (id: string) => {
    removeGalleryItem(id);
    loadItems();
  };

  // Handle clear all
  const handleClearAll = () => {
    if (confirm('Bạn có chắc muốn xóa tất cả ảnh trong bộ sưu tập?')) {
      clearGallery();
      loadItems();
    }
  };

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get pattern names
  const getPatternNames = (item: GalleryItem) => {
    if (item.type === 'background' && item.settings.pattern !== undefined) {
      const pattern = patternList.find(p => p.id === item.settings.pattern);
      return pattern?.nameVn || 'Unknown';
    }
    if (item.type === 'avatar' && item.settings.patterns) {
      return item.settings.patterns
        .map(id => patternList.find(p => p.id === id)?.nameVn)
        .filter(Boolean)
        .join(', ');
    }
    return '';
  };

  return (
    <div className="gallery-container">
      <div className="gallery-header">
        <h2>Bộ Sưu Tập Của Bạn</h2>
        <p>{items.length} ảnh đã lưu</p>
        {items.length > 0 && (
          <button className="clear-all-button" onClick={handleClearAll}>
            🗑️ Xóa tất cả
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="gallery-empty">
          <p>Chưa có ảnh nào được lưu</p>
          <p className="hint">Tạo background hoặc avatar và xuất để lưu vào đây</p>
        </div>
      ) : (
        <div className="gallery-grid">
          {items.map(item => (
            <div key={item.id} className="gallery-item">
              <div
                className="gallery-thumbnail"
                onClick={() => setSelectedItem(item)}
              >
                <img src={item.thumbnail} alt={item.type} />
                <div className="gallery-overlay">
                  <span className="view-icon">👁️</span>
                </div>
              </div>
              <div className="gallery-item-info">
                <span className="item-type">
                  {item.type === 'background' ? '🖼️ Background' : '👤 Avatar'}
                </span>
                <span className="item-pattern">{getPatternNames(item)}</span>
                <span className="item-date">{formatDate(item.createdAt)}</span>
              </div>
              <button
                className="delete-button"
                onClick={() => handleDelete(item.id)}
                title="Xóa"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content gallery-detail-modal" onClick={e => e.stopPropagation()}>
            <h3>{selectedItem.type === 'background' ? 'Background' : 'Avatar'}</h3>

            <div className="detail-preview">
              <img src={selectedItem.thumbnail} alt={selectedItem.type} />
            </div>

            <div className="detail-info">
              <p><strong>Loại:</strong> {selectedItem.type === 'background' ? 'Background' : `Avatar ${selectedItem.settings.gridSize}×${selectedItem.settings.gridSize}`}</p>
              <p><strong>Hoa văn:</strong> {getPatternNames(selectedItem)}</p>
              <p><strong>Độ phân giải:</strong> {selectedItem.settings.resolution.width} × {selectedItem.settings.resolution.height}</p>
              <p><strong>Định dạng:</strong> {selectedItem.settings.format.toUpperCase()}</p>
              <p><strong>Ngày tạo:</strong> {formatDate(selectedItem.createdAt)}</p>
            </div>

            <button className="modal-close" onClick={() => setSelectedItem(null)}>
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
