import React, { useState } from 'react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from './Card';

// --- Icon Definitions (SVG) ---
const PencilIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

// --- The Column Component ---
export const Column = ({ column, addCard, updateColumnTitle, deleteCard, deleteColumn }) => {
  const { id, title, tasks } = column;
  const [newCardContent, setNewCardContent] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(title);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: id,
    data: { type: 'Column' },
  });

  const style = { transition, transform: CSS.Transform.toString(transform) };

  const handleAddCard = () => {
    if (newCardContent.trim() !== '') {
      addCard(id, newCardContent);
      setNewCardContent('');
    }
  };

  const handleTitleBlur = () => {
    if (editedTitle.trim() && editedTitle !== title) {
      updateColumnTitle(id, editedTitle);
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyPress = (e) => {
    if (e.key === 'Enter') e.target.blur();
  };

  const handleDeleteColumn = (e) => {
    // We prevent the event from propagating to avoid triggering drag & drop.
    e.stopPropagation();
    deleteColumn(id);
  }

  // If the column is being dragged, we display a placeholder.
  if (isDragging) {
    return <div ref={setNodeRef} style={style} className="w-64 md:w-72 bg-gray-300 dark:bg-gray-700 rounded-lg shadow-lg opacity-50 border-2 border-blue-500 flex-shrink-0 h-full max-h-[90vh]"></div>;
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="w-64 md:w-72 bg-gray-200 dark:bg-gray-800 rounded-lg shadow-md flex flex-col flex-shrink-0 h-full max-h-[90vh] transition-colors duration-300">
      {/* Column Header - you can grab it here to move it (`...listeners`) */}
      <div {...listeners} className="p-3 border-b border-gray-300 dark:border-gray-700 flex justify-between items-center group cursor-grab">
        {isEditingTitle ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyPress={handleTitleKeyPress}
            className="w-full bg-white dark:bg-gray-700 font-semibold text-md text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
            autoFocus
          />
        ) : (
          <div className="flex items-center justify-between w-full">
            <h2 className="text-md font-semibold text-gray-800 dark:text-gray-200" onClick={() => setIsEditingTitle(true)}>
              {title}
            </h2>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setIsEditingTitle(true)} className="p-1 text-gray-500 hover:text-blue-500"><PencilIcon /></button>
              <button onClick={handleDeleteColumn} className="p-1 text-gray-500 hover:text-red-500"><TrashIcon /></button>
            </div>
          </div>
        )}
      </div>

      {/* Cards Container */}
      <div className="flex-grow p-2 space-y-3 overflow-y-auto">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <Card key={task.id} task={task} columnId={id} deleteCard={deleteCard} />
          ))}
        </SortableContext>
      </div>

      {/* Column Footer for adding a card */}
      <div className="p-2 border-t border-gray-300 dark:border-gray-700">
        <textarea
          placeholder="Add a card..."
          className="w-full p-2 border-none rounded-md resize-none bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 transition-colors duration-300"
          rows="2"
          value={newCardContent}
          onChange={(e) => setNewCardContent(e.target.value)}
        />
        <button
          onClick={handleAddCard}
          className="w-full mt-2 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 transition-colors duration-300"
          disabled={!newCardContent.trim()}
        >
          Add
        </button>
      </div>
    </div>
  );
};
