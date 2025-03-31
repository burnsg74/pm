// components/Draggable.tsx

import React from 'react';
import { useDraggable } from '@dnd-kit/core';

interface DraggableProps {
    id: number;
    children: React.ReactNode;
}

const Draggable: React.FC<DraggableProps> = ({ id, children }) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: id.toString(),
    });

    const style = transform
        ? {
            transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
        : undefined;

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
            {children}
        </div>
    );
};

export default Draggable;