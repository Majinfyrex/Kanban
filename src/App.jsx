import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, pointerWithin } from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { Column } from './components/Column';
import { Card } from './components/Card';

const App = () => {
  // --- State Management ---
  const [columns, setColumns] = useState([]);
  const [activeTask, setActiveTask] = useState(null);
  const [activeColumn, setActiveColumn] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // --- Effects ---

  // Load data from localStorage once.
  useEffect(() => {
    const savedData = localStorage.getItem('kanban-data');
    const savedTheme = localStorage.getItem('theme');

    if (savedData) {
      try { setColumns(JSON.parse(savedData)); } catch { setColumns(getDefaultColumns()); }
    } else {
      setColumns(getDefaultColumns());
    }

    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  // Save data whenever columns change.
  useEffect(() => {
    if (columns.length > 0) {
      localStorage.setItem('kanban-data', JSON.stringify(columns));
    }
  }, [columns]);

  // Handle dark/light mode toggle.
  useEffect(() => {
    const root = window.document.documentElement;
    const newTheme = darkMode ? 'dark' : 'light';
    root.classList.remove(darkMode ? 'light' : 'dark');
    root.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
  }, [darkMode]);


  // --- Helper Functions ---

  // Returns initial default columns.
  function getDefaultColumns() {
    return [
      { id: 'col-1', title: 'À Faire', tasks: [{ id: 'task-1', content: 'Apprendre React' }] },
      { id: 'col-2', title: 'En Cours', tasks: [{ id: 'task-2', content: 'Créer un tableau Kanban' }] },
      { id: 'col-3', title: 'Terminé', tasks: [] }
    ];
  }

  // --- Data Manipulation Functions ---

  // Adds a new column.
  const addColumn = () => {
    const newColumn = { id: `col-${Date.now()}`, title: 'Nouvelle Colonne', tasks: [] };
    setColumns([...columns, newColumn]);
  };

  // Deletes a column.
  const deleteColumn = (columnId) => {
    const newColumns = columns.filter(col => col.id !== columnId);
    setColumns(newColumns);
  };

  // Adds a new card.
  const addCard = (columnId, cardContent) => {
    const newCard = { id: `task-${Date.now()}`, content: cardContent };
    const newColumns = columns.map(col => {
      if (col.id === columnId) {
        return { ...col, tasks: [...col.tasks, newCard] };
      }
      return col;
    });
    setColumns(newColumns);
  };

  // Updates a column title.
  const updateColumnTitle = (columnId, newTitle) => {
    const newColumns = columns.map(col => {
      if (col.id === columnId) {
        return { ...col, title: newTitle };
      }
      return col;
    });
    setColumns(newColumns);
  };

  // Deletes a card.
  const deleteCard = (columnId, cardId) => {
    const newColumns = columns.map(col => {
      if (col.id === columnId) {
        const newTasks = col.tasks.filter(task => task.id !== cardId);
        return { ...col, tasks: newTasks };
      }
      return col;
    });
    setColumns(newColumns);
  };

  // --- Drag and Drop Handlers ---

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  // Triggers when dragging starts.
  function handleDragStart(event) {
    const { active } = event;
    const { type } = active.data.current;

    if (type === 'Task') {
      const task = columns.flatMap(col => col.tasks).find(t => t.id === active.id);
      setActiveTask(task);
    }
    if (type === 'Column') {
      const column = columns.find(c => c.id === active.id);
      setActiveColumn(column);
    }
  }

  // Triggers when dragging ends.
  function handleDragEnd(event) {
    const { active, over } = event;
    setActiveTask(null);
    setActiveColumn(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    // Case 1: Dragging a column.
    if (activeId !== overId && active.data.current?.type === 'Column') {
      const oldIndex = columns.findIndex(c => c.id === activeId);
      const newIndex = columns.findIndex(c => c.id === overId);
      setColumns(currentCols => arrayMove(currentCols, oldIndex, newIndex));
      return;
    }

    // Case 2: Dragging a task.
    if (active.data.current?.type === 'Task') {
      const sourceCol = columns.find(col => col.tasks.some(task => task.id === activeId));
      const destCol = columns.find(col => col.id === over.id || col.tasks.some(task => task.id === over.id));

      if (!sourceCol || !destCol) return;

      // Case 2a: Moving task in same column.
      if (sourceCol.id === destCol.id) {
        const oldTaskIndex = sourceCol.tasks.findIndex(t => t.id === activeId);
        const newTaskIndex = destCol.tasks.findIndex(t => t.id === overId);
        
        const reorderedTasks = arrayMove(sourceCol.tasks, oldTaskIndex, newTaskIndex);
        const newColumns = columns.map(col => {
          if (col.id === sourceCol.id) {
            return { ...col, tasks: reorderedTasks };
          }
          return col;
        });
        setColumns(newColumns);

      } else {
        // Case 2b: Moving task to different column.
        const taskToMove = sourceCol.tasks.find(t => t.id === activeId);
        if (!taskToMove) return;

        // Remove from source
        const newSourceTasks = sourceCol.tasks.filter(t => t.id !== activeId);
        
        // Find insertion index in destination
        const overTaskIndex = destCol.tasks.findIndex(t => t.id === overId);
        
        let newDestTasks;
        if (overTaskIndex !== -1) {
          // Insert at specific index
          newDestTasks = [
            ...destCol.tasks.slice(0, overTaskIndex),
            taskToMove,
            ...destCol.tasks.slice(overTaskIndex)
          ];
        } else {
          // Insert at the end
          newDestTasks = [...destCol.tasks, taskToMove];
        }

        // Create new columns array with all updates
        const newColumns = columns.map(col => {
            if (col.id === sourceCol.id) {
                return { ...col, tasks: newSourceTasks };
            }
            if (col.id === destCol.id) {
                return { ...col, tasks: newDestTasks };
            }
            return col;
        });
        setColumns(newColumns);
      }
    }
  }

  const toggleDarkMode = () => setDarkMode(prevMode => !prevMode);

  // --- JSX Rendering ---
  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd} collisionDetection={pointerWithin}>
      <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <header className="p-3 bg-gray-200 dark:bg-gray-800 shadow-md flex justify-between items-center">
          <h1 className="text-xl font-bold">Tableau Kanban</h1>
          <button onClick={toggleDarkMode} className="p-2 rounded-full bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors duration-300" aria-label="Toggle dark mode">
            {darkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.472 4.057a.75.75 0 011.06 0l1.59 1.59a.75.75 0 01-1.06 1.06L7.472 5.117a.75.75 0 010-1.06zM4.057 7.472a.75.75 0 010 1.06l1.59 1.59a.75.75 0 01-1.06 1.06L4.057 8.532a.75.75 0 010-1.06zM2.25 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3a.75.75 0 01-.75-.75zM4.057 16.528a.75.75 0 011.06 0l1.59 1.59a.75.75 0 01-1.06 1.06l-1.59-1.59a.75.75 0 010-1.06zM7.472 19.943a.75.75 0 010 1.06l1.59 1.59a.75.75 0 01-1.06 1.06l-1.59-1.59a.75.75 0 01-1.06 0zM12 21.75a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V22.5a.75.75 0 01.75-.75zM16.528 19.943a.75.75 0 010-1.06l1.59-1.59a.75.75 0 011.06 1.06l-1.59 1.59a.75.75 0 01-1.06 0zM19.943 16.528a.75.75 0 010-1.06l1.59-1.59a.75.75 0 011.06 1.06l-1.59 1.59a.75.75 0 01-1.06 0zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5h2.25a.75.75 0 01.75.75zM19.943 7.472a.75.75 0 010-1.06l-1.59-1.59a.75.75 0 011.06-1.06l1.59 1.59a.75.75 0 010 1.06zM16.528 4.057a.75.75 0 01-1.06 0l-1.59-1.59a.75.75 0 011.06-1.06l1.59 1.59a.75.75 0 011.06 0zM12 7a5 5 0 100 10 5 5 0 000-10z" clipRule="evenodd" /></svg>
            )}
          </button>
        </header>
        <main className="flex-grow p-4 overflow-x-auto">
          <div className="flex flex-row space-x-4 h-full items-start">
            <SortableContext items={columns.map(c => c.id)} strategy={horizontalListSortingStrategy}>
              {columns.map((column) => (
                <Column key={column.id} column={column} addCard={addCard} updateColumnTitle={updateColumnTitle} deleteCard={deleteCard} deleteColumn={deleteColumn} />
              ))}
            </SortableContext>
            <button onClick={addColumn} className="bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-gray-200 p-3 rounded-lg h-fit hover:bg-gray-400 dark:hover:bg-gray-600 flex-shrink-0">
              + Ajouter une autre colonne
            </button>
          </div>
        </main>
      </div>
      <DragOverlay>
        {activeColumn ? <Column column={activeColumn} addCard={()=>{}} updateColumnTitle={()=>{}} deleteCard={()=>{}} deleteColumn={()=>{}} /> : null}
        {activeTask ? <Card task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default App;
