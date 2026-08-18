// Version: 0.2.0
import React, { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  getMembers, getTasks, getAbsences,
  moveTask, createTask, updateTask, deleteTask,
  createAbsence, deleteAbsence,
  createMember, deleteMember,
} from '../api/client';
import { getISOWeek, format } from 'date-fns';

function TaskModal({ task, onClose, onSave, onDelete }) {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes || '');
  const [priority, setPriority] = useState(!!task.priority);

  const save = () => onSave({ title, notes, priority: priority ? 1 : 0 });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Task bearbeiten</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <input
          className="modal-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && save()}
          placeholder="Titel"
        />
        <textarea
          className="modal-textarea"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notizen…"
          rows={4}
        />
        <label className="modal-check">
          <input type="checkbox" checked={priority} onChange={e => setPriority(e.target.checked)} />
          Hohe Priorität
        </label>
        <div className="modal-actions">
          <button className="btn-primary" onClick={save}>Speichern</button>
          <button className="btn-danger" onClick={onDelete}>Löschen</button>
          <button className="btn-secondary" onClick={onClose}>Abbrechen</button>
        </div>
      </div>
    </div>
  );
}

function AbsenceModal({ member, absences, onClose, onCreate, onDelete }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [type, setType] = useState('URLAUB');
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const memberAbsences = absences.filter(a => a.member_id === member.id);

  const add = () => {
    if (dateTo < dateFrom) return;
    onCreate({ member_id: member.id, type, date_from: dateFrom, date_to: dateTo });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Abwesenheit — {member.name}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        {memberAbsences.length > 0 && (
          <div className="absence-list-modal">
            {memberAbsences.map(a => (
              <div key={a.id} className={`absence-item absence-badge ${a.type}`}>
                <span>{a.type} {a.date_from} – {a.date_to}</span>
                <button className="btn-danger-sm" onClick={() => onDelete(a.id)}>×</button>
              </div>
            ))}
          </div>
        )}
        <select className="modal-select" value={type} onChange={e => setType(e.target.value)}>
          <option>URLAUB</option>
          <option>ZA</option>
          <option>KS</option>
          <option>OTHER</option>
        </select>
        <div className="modal-row">
          <input type="date" className="modal-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
          <input type="date" className="modal-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button className="btn-primary" onClick={add}>Eintragen</button>
          <button className="btn-secondary" onClick={onClose}>Schließen</button>
        </div>
      </div>
    </div>
  );
}

function MemberPanel({ members, onClose, onAdd, onDelete }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const add = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), email: email.trim() || null });
    setName('');
    setEmail('');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Team verwalten</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="member-list-modal">
          {members.map(m => (
            <div key={m.id} className="member-item">
              <span>{m.name}</span>
              <button className="btn-danger-sm" onClick={() => onDelete(m.id)} title="Entfernen">×</button>
            </div>
          ))}
        </div>
        <input
          className="modal-input"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Name"
        />
        <input
          className="modal-input"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="E-Mail (optional)"
        />
        <div className="modal-actions">
          <button className="btn-primary" onClick={add}>Hinzufügen</button>
          <button className="btn-secondary" onClick={onClose}>Schließen</button>
        </div>
      </div>
    </div>
  );
}

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
  const [editingTask, setEditingTask] = useState(null);
  const [absenceModal, setAbsenceModal] = useState(null);
  const [showMemberPanel, setShowMemberPanel] = useState(false);

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
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, member_id: destMemberId, position: destination.index } : t));
    await moveTask(taskId, { member_id: destMemberId, position: destination.index });
  };

  const handleAddTask = async (memberId) => {
    if (!newTitle.trim()) return;
    await createTask({ member_id: memberId, title: newTitle.trim() });
    setNewTitle('');
    setAddingTo(null);
    load();
  };

  const handleSaveTask = async (updates) => {
    await updateTask(editingTask.id, updates);
    setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...updates } : t));
    setEditingTask(null);
  };

  const handleDeleteTask = async () => {
    await deleteTask(editingTask.id);
    setTasks(prev => prev.filter(t => t.id !== editingTask.id));
    setEditingTask(null);
  };

  const handleCreateAbsence = async (payload) => {
    await createAbsence(payload);
    const a = await getAbsences();
    setAbsences(a);
  };

  const handleDeleteAbsence = async (id) => {
    await deleteAbsence(id);
    setAbsences(prev => prev.filter(a => a.id !== id));
  };

  const handleAddMember = async (payload) => {
    await createMember(payload);
    const m = await getMembers();
    setMembers(m);
  };

  const handleDeleteMember = async (id) => {
    await deleteMember(id);
    setMembers(prev => prev.filter(m => m.id !== id));
    setTasks(prev => prev.filter(t => t.member_id !== id));
  };

  const week = `KW ${getISOWeek(new Date())} / ${format(new Date(), 'yyyy')}`;

  return (
    <>
      <header>
        <h1>Team Board</h1>
        <span className="week-label">{week}</span>
        <nav>
          <button className="btn-header" onClick={() => setShowMemberPanel(true)}>Team</button>
          <a href="/standups">Standups</a>
        </nav>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board">
          {members.map(member => {
            const memberTasks = tasks.filter(t => t.member_id === member.id).sort((a, b) => a.position - b.position);
            return (
              <div key={member.id} className="column">
                <div className="column-header">
                  <span className="column-name">{member.name}</span>
                  <span className="task-count">{memberTasks.length}</span>
                  <button className="btn-abw" onClick={() => setAbsenceModal(member)} title="Abwesenheit eintragen">Abw</button>
                </div>
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
                              onClick={() => !snap.isDragging && setEditingTask(task)}
                            >
                              <span>{task.title}</span>
                              {task.notes && <span className="task-notes-dot" title={task.notes} />}
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

      {editingTask && (
        <TaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
        />
      )}

      {absenceModal && (
        <AbsenceModal
          member={absenceModal}
          absences={absences}
          onClose={() => setAbsenceModal(null)}
          onCreate={handleCreateAbsence}
          onDelete={handleDeleteAbsence}
        />
      )}

      {showMemberPanel && (
        <MemberPanel
          members={members}
          onClose={() => setShowMemberPanel(false)}
          onAdd={handleAddMember}
          onDelete={handleDeleteMember}
        />
      )}
    </>
  );
}
