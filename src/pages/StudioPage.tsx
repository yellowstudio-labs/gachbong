import { useState } from 'react';
import { BackgroundGenerator } from '../components/Studio/BackgroundGenerator';
import { AvatarGenerator } from '../components/Studio/AvatarGenerator';
import { Gallery } from '../components/Studio/Gallery';
import type { GachBongModule } from '../engine/types';

interface StudioPageProps {
  engine: GachBongModule;
}

type StudioTab = 'background' | 'avatar' | 'gallery';

const TAB_CONFIG: { id: StudioTab; label: string; icon: string }[] = [
  { id: 'background', label: 'Background', icon: '🖼️' },
  { id: 'avatar', label: 'Avatar', icon: '👤' },
  { id: 'gallery', label: 'Bộ Sưu Tập', icon: '📁' },
];

export function StudioPage({ engine }: StudioPageProps) {
  const [activeTab, setActiveTab] = useState<StudioTab>('background');

  return (
    <div className="page-container studio-page">
      <div className="studio-header">
        <h1>Gạch Bông Studio</h1>
        <p>Tạo background và avatar từ hoa văn gạch bông</p>
      </div>

      <div className="studio-tabs">
        {TAB_CONFIG.map(tab => (
          <button
            key={tab.id}
            className={`studio-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="studio-content">
        {activeTab === 'background' && <BackgroundGenerator engine={engine} />}
        {activeTab === 'avatar' && <AvatarGenerator engine={engine} />}
        {activeTab === 'gallery' && <Gallery />}
      </div>
    </div>
  );
}
