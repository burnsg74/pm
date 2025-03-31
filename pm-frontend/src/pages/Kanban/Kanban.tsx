import {
    DndContext,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import {useEffect, useState} from "react";
import Droppable from "./components/Droppable/Droppable";
import Draggable from "./components/Draggable/Draggable";

type TaskType = {
    id: number;
    title: string;
    description: string;
    status: "Backlog" | "In Progress" | "Done" | "Hold";
    due_date: string;
    priority: "Low" | "Medium" | "High";
    created_at: string;
    updated_at: string;
    recurring: string | null;
    recurring_parent_id: number | null;
};
const KanbanBoard: React.FC = () => {
    const [tasks, setTasks] = useState<TaskType[]>([]);
    const [columns, setColumns] = useState<{ [key: string]: TaskType[] }>({
        "Backlog": [],
        "In Progress": [],
        "Done": [],
        "Hold": []
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const API_BASE_URL = import.meta.env.VITE_API_URL;
                const response = await fetch(`${API_BASE_URL}/api/db`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: "SELECT * FROM tasks",
                    }),
                });

                const data = await response.json();
                setTasks(data);
                console.log("Fetched tasks:", data);
            } catch (error) {
                console.error("Error fetching tasks:", error);
            }
        };

        fetchTasks();
    }, []);

    useEffect(() => {
        const newColumns: { [key: string]: TaskType[] } = {
            "Backlog": [],
            "In Progress": [],
            "Done": [],
            "Hold": []
        };

        tasks.forEach(task => {
            newColumns[task.status].push(task);
        });

        setColumns(newColumns);
    }, [tasks]);


    const onDragEnd = (event: any) => {
        console.log("Event", event);
        const {active, over} = event;
        console.log("Drag End", active, over);

        if (!over) {
            return;
        }

        const activeId = active.id as string;
        const overId = over.id as string;
        console.log(`Task ${activeId} dropped into column ${overId}`);

        const sourceColumnId = tasks.find(task => task.id === parseInt(activeId))?.status;
        const destColumnId = overId;

        if (!sourceColumnId || !destColumnId || sourceColumnId === destColumnId) {
            console.error(`Invalid drop target: ${overId}`);
            return;
        }

        const draggedTask = tasks.find(task => task.id === parseInt(activeId));

        if (!draggedTask) {
            console.error(`Task ${activeId} not found`);
            return;
        }

        const updatedTasks = tasks.map(task =>
            task.id === draggedTask.id ? {
                ...task,
                status: destColumnId as "Backlog" | "In Progress" | "Done" | "Hold"
            } : task
        );

        setTasks(updatedTasks);


    };


    return (
        <div style={{display: 'flex', flexDirection: 'row'}}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
            >
                {Object.entries(columns).map(([columnId, columnTasks]) => (
                    <Droppable key={columnId} id={columnId}>
                        <h2>{columnId}</h2>
                        <SortableContext items={columnTasks.map(task => task.id)}
                                         strategy={verticalListSortingStrategy}>
                            {columnTasks.map(task => (
                                <Draggable key={task.id} id={task.id}>
                                    <div
                                        style={{
                                            padding: '16px',
                                            margin: '4px',
                                            backgroundColor: '#fff',
                                            borderRadius: '4px',
                                            border: '1px solid lightgrey',
                                        }}
                                    >
                                        <h4>{task.title}</h4>
                                        <p>{task.description}</p>
                                    </div>
                                </Draggable>
                            ))}
                        </SortableContext>
                    </Droppable>
                ))}
            </DndContext>
        </div>
    )
}

export default KanbanBoard;