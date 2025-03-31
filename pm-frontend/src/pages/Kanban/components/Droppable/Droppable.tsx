// components/Droppable.tsx

import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DroppableProps {
    id: string;
    children: React.ReactNode;
}

const Droppable: React.FC<DroppableProps> = ({ id, children }) => {
    const { setNodeRef } = useDroppable({
        id,
    });

    return (
        <div
            ref={setNodeRef}
            style={{
                padding: '16px',
                margin: '8px',
                backgroundColor: '#f4f4f4',
                borderRadius: '4px',
                minHeight: '200px',
            }}
        >
            {children}
        </div>
    );
};

export default Droppable;