// Version: 0.1.0
import React, { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { getMembers, getTasks, getAbsences, moveTask, createTask, deleteTask } from '../api/client';
import { getISOWeek, format } from 'date-fns';

function AbsenceBadge({ absences, memberId }) {
  const today = new Date().toISOString().slice(0, 10);
  const active = absences.filter(a => a.member_id === memberId && a.date_from <= today && a.date_to >= today);
  return active.map(a => (
    <div key={a.id} className={`absence-badge ${a.type}`}>
      {a.type} {a.date_from !== a.date_to ? `${a.date_from.slice(5)} – ${a.date_to.slice(5)}` : a.date_from.slice(5)}
    </div>
  ));
}

export default function Board() {
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [addingTo, setAddingTo] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const load = useCallback(async () => {
    const [m, t, a] = await Promise.all([getMembers(), getTasks(), getAbsences()]);
    setMembers(m);
    setTasks(t);
    setAbsences(a);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onDragEnd = async ({ source, destination, draggableId }) => {
    if (!destination) return;
    const taskId = parseInt(draggableId, 10);
    const destMemberId = parseInt(destination.droppableId, 10);
    setTasks(prev => {
      const updated = prev.map(t => t.id === taskId ? { ...t, member_id: destMemberId, position: destination.index } : t);
      return updated;
    });
    await moveTask(taskId, { member_id: destMemberId, position: destination.index });
  };

  const handleAddTask = async (memberId) => {
    if (!newTitle.trim()) return;
    await createTask({ member_id: memberId, title: newTitle.trim() });
    setNewTitle('');
    setAddingTo(null);
    load();
  };

  const handleDelete = async (taskId) => {
    await deleteTask(taskId);
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const week = `KW ${getISOWeek(new Date())} / ${format(new Date(), 'yyyy')}`;

  return (
    <>
      <header>
        <h1>Team Board</h1>
        <span className="week-label">{week}</span>
        <nav>
          <a href="/standups">Standups</a>
        </nav>
      </header>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board">
          {members.map(member => {
            const memberTasks = tasks.filter(t => t.member_id === member.id).sort((a, b) => a.position - b.position);
            return (
              <div key={member.id} className="column">
                <div className="column-header">{member.name}</div>
                <AbsenceBadge absences={absences} memberId={member.id} />
                <Droppable droppableId={String(member.id)}>
                  {(provided) => (
                    <div className="task-list" ref={provided.innerRef} {...provided.droppableProps}>
                      {memberTasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                          {(prov, snap) => (
                            <div
                              className={`task-card ${task.priority ? 'priority-high' : ''} ${task.source === 'email' ? 'task-source-email' : ''} ${snap.isDragging ? 'dragging' : ''}`}
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              onDoubleClick={() => handleDelete(task.id)}
                              title="Doppelklick zum Löschen"
                            >
                              {task.title}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
                {addingTo === member.id ? (
                  <div style={{ padding: '0 8px 8px' }}>
                    <input
                      autoFocus
                      value={newTitle}
                      onChange={e => setNewTitle(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddTask(member.id); if (e.key === 'Escape') setAddingTo(null); }}
                      placeholder="Task-Name…"
                      style={{ width: '100%', padding: '4px 6px', borderRadius: 4, border: '1px solid #cbd5e1', fontSize: '0.82rem' }}
                    />
                  </div>
                ) : (
                  <button className="add-task-btn" onClick={() => setAddingTo(member.id)}>+ Task</button>
                )}
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </>
  );
}
