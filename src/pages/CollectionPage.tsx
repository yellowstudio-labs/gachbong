import { PatternShowcase } from '../components/PatternShowcase';
import type { GachBongModule } from '../engine/types';

interface CollectionPageProps {
    engine: GachBongModule;
}

export function CollectionPage({ engine }: CollectionPageProps) {
    return (
        <div className="page-container">
            <PatternShowcase engine={engine} />
        </div>
    );
}
