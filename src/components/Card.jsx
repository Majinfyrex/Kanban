import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const Card = ({ task, columnId, deleteCard }) => {
  const { id, content } = task;

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: id,
    data: {
      type: 'Task',
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const handleDelete = (e) => {
    e.stopPropagation(); // Prevents the drag event from firing when clicking the delete button
    deleteCard(columnId, id);
  };

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md shadow-lg border-2 border-blue-500 opacity-75 cursor-grabbing"
      ></div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group bg-white dark:bg-gray-700 p-3 rounded-md shadow-sm hover:shadow-lg transition-all duration-200 cursor-grab"
    >
      <p className="text-sm text-gray-800 dark:text-gray-200 pr-6">{content}</p>
      <button
        onClick={handleDelete}
        className="absolute top-1 right-1 p-1 rounded-full text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-500 transition-all"
        aria-label="Delete task"
      >
        <TrashIcon />
      </button>
    </div>
  );
};
