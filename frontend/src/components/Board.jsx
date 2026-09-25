// Version: 0.6.1
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
  getMembers, getTasks, getAbsences,
  moveTask, createTask, updateTask, deleteTask, copyTask,
  createAbsence, deleteAbsence,
  createMember, deleteMember,
} from '../api/client';
import { getISOWeek, format, differenceInCalendarDays, parseISO } from 'date-fns';

function DueBadge({ date }) {
  const today = new Date().toISOString().slice(0, 10);
  const diff = differenceInCalendarDays(parseISO(date), parseISO(today));
  let cls = 'due-normal';
  if (diff < 0) cls = 'due-overdue';
  else if (diff === 0) cls = 'due-today';
  else if (diff <= 3) cls = 'due-soon';
  const label = diff < 0
    ? `${Math.abs(diff)}d überfällig`
    : diff === 0
    ? 'Heute fällig'
    : date.slice(5).replace('-', '.');
  return <span className={`due-badge ${cls}`}>{label}</span>;
}

const COLOR_OPTIONS = [
  { key: 'black', label: 'Standard (schwarz)', color: '#0f172a' },
  { key: 'blue',  label: 'Urlaub / ZA (blau)',  color: '#2563eb' },
  { key: 'red',   label: 'Onsite (rot)',        color: '#dc2626' },
  { key: 'green', label: 'Diverses (grün)',     color: '#16a34a' },
];

function TaskModal({ task, members, onClose, onSave, onDelete, onCopy }) {
  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes || '');
  const [priority, setPriority] = useState(!!task.priority);
  const [dueDate, setDueDate] = useState(task.due_date || '');
  const [colorCategory, setColorCategory] = useState(task.color_category || 'black');

  // Multi-copy state
  const [showCopySection, setShowCopySection] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [copying, setCopying] = useState(false);

  const otherMembers = members.filter(m => m.id !== task.member_id);

  const toggleSelectMember = (mId) => {
    setSelectedMembers(prev =>
      prev.includes(mId) ? prev.filter(id => id !== mId) : [...prev, mId]
    );
  };

  const handleSelectAll = () => {
    if (selectedMembers.length === otherMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(otherMembers.map(m => m.id));
    }
  };

  const handleExecuteCopy = async () => {
    if (selectedMembers.length === 0) return;
    setCopying(true);
    try {
      await onCopy(task.id, selectedMembers);
      setShowCopySection(false);
    } finally {
      setCopying(false);
    }
  };

  const save = () => onSave({
    title,
    notes,
    priority: priority ? 1 : 0,
    due_date: dueDate,
    color_category: colorCategory,
  });

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
          autoFocus
        />
        <textarea
          className="modal-textarea"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Notizen…"
          rows={3}
        />

        {/* Farbauswahl: Schwarz, Blau, Rot, Grün */}
        <div className="modal-color-picker">
          <span className="modal-color-label">Schriftfarbe / Kategorie</span>
          <div className="modal-color-options">
            {COLOR_OPTIONS.map(opt => (
              <label
                key={opt.key}
                className={`color-radio-btn ${colorCategory === opt.key ? 'selected' : ''}`}
                onClick={() => setColorCategory(opt.key)}
              >
                <span className={`color-dot ${opt.key}`} />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="modal-row">
          <label className="modal-check">
            <input type="checkbox" checked={priority} onChange={e => setPriority(e.target.checked)} />
            Hohe Priorität
          </label>
          <div className="modal-due-field">
            <label className="modal-due-label">Fällig</label>
            <input
              type="date"
              className="modal-input modal-due-input"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Kopieren-Bereich (Multi-Select) */}
        {showCopySection && (
          <div className="modal-copy-box">
            <div className="modal-copy-header">
              <span>Task an Kollegen kopieren:</span>
              <button
                type="button"
                className="btn-abw"
                onClick={handleSelectAll}
              >
                {selectedMembers.length === otherMembers.length ? 'Keine' : 'Alle auswählen'}
              </button>
            </div>
            <div className="modal-copy-grid">
              {otherMembers.map(m => (
                <label key={m.id} className="modal-copy-item">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(m.id)}
                    onChange={() => toggleSelectMember(m.id)}
                  />
                  <span>{m.name}</span>
                </label>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-primary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                disabled={selectedMembers.length === 0 || copying}
                onClick={handleExecuteCopy}
              >
                {copying ? 'Kopiere…' : `An ${selectedMembers.length} Kollege(n) kopieren`}
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                onClick={() => setShowCopySection(false)}
              >
                Schließen
              </button>
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-primary" onClick={save}>Speichern</button>
          <button className="btn-danger" onClick={onDelete}>Löschen</button>
          <button className="btn-secondary" onClick={onClose}>Abbrechen</button>
          <button
            type="button"
            className="btn-secondary"
            style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--teal-dark)' }}
            onClick={() => setShowCopySection(v => !v)}
            title="Diesen Task für einen oder mehrere andere Kollegen kopieren"
          >
            Kopieren
          </button>
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
              <button className="btn-danger-sm" onClick={() => onDelete(m.id)}>×</button>
            </div>
          ))}
        </div>
        <input className="modal-input" value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
        <input className="modal-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="E-Mail (optional)" />
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

function initials(name) {
  return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

const AVATAR_COLORS = [
  '#6366f1','#0ea5e9','#10b981','#f59e0b','#ef4444',
  '#8b5cf6','#ec4899','#14b8a6','#f97316','#84cc16',
];

// Die 4 Mitarbeiter, die fix unten angeordnet sein sollen
const BOTTOM_MEMBER_NAMES = [
  'corinna rehberger-gruber',
  'markus weber',
  'andreas kautek',
  'gernot dachs'
];

function isBottomMember(name) {
  const n = (name || '').trim().toLowerCase();
  return BOTTOM_MEMBER_NAMES.some(bm => n.includes(bm) || bm.includes(n));
}

export default function Board() {
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [addingTo, setAddingTo] = useState(null);
  const [addError, setAddError] = useState('');
  const inputRef = useRef(null);
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
    const title = inputRef.current?.value?.trim();
    if (!title) { setAddError('Bitte einen Titel eingeben.'); return; }
    setAddError('');
    try {
      await createTask({ member_id: memberId, title });
      setAddingTo(null);
      load();
    } catch (e) {
      console.error('createTask failed', e);
      setAddError(`Fehler: ${e?.response?.data?.error || e.message}`);
    }
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

  const handleCopyTask = async (taskId, targetMemberIds) => {
    await copyTask(taskId, { target_member_ids: targetMemberIds });
    await load();
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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
      if (e.key === 'n' || e.key === 'N') {
        if (members.length > 0) {
          e.preventDefault();
          setAddingTo(members[0].id);
        }
      } else if (e.key === 'Escape') {
        setEditingTask(null);
        setAbsenceModal(null);
        setShowMemberPanel(false);
        setAddingTo(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [members]);

  const week = `KW ${getISOWeek(new Date())} / ${format(new Date(), 'yyyy')}`;

  // Aufteilung: Haupt-Team vs. 4 fixe Kollegen unten
  const topMembers = members.filter(m => !isBottomMember(m.name));
  const bottomMembers = members.filter(m => isBottomMember(m.name));

  const renderColumn = (member, idx) => {
    const memberTasks = tasks.filter(t => t.member_id === member.id).sort((a, b) => a.position - b.position);
    const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
    const isAbsent = absences.some(a => {
      const today = new Date().toISOString().slice(0, 10);
      return a.member_id === member.id && a.date_from <= today && a.date_to >= today;
    });

    return (
      <div key={member.id} className={`column${isAbsent ? ' column-absent' : ''}`}>
        <div className="column-header" style={{ '--accent': color }}>
          <div className="avatar" style={{ background: color }}>{initials(member.name)}</div>
          <div className="column-meta">
            <span className="column-name">{member.name}</span>
            <span className="column-sub">{memberTasks.length} Task{memberTasks.length !== 1 ? 's' : ''}</span>
          </div>
          <button className="btn-abw" onClick={() => setAbsenceModal(member)} title="Abwesenheit">Abw</button>
        </div>
        <AbsenceBadge absences={absences} memberId={member.id} />
        <Droppable droppableId={String(member.id)}>
          {(provided, snapshot) => (
            <div
              className={`task-list${snapshot.isDraggingOver ? ' drag-over' : ''}`}
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              {memberTasks.map((task, index) => {
                const colorCls = `color-${task.color_category || 'black'}`;
                return (
                  <Draggable key={task.id} draggableId={String(task.id)} index={index}>
                    {(prov, snap) => (
                      <div
                        className={`task-card ${colorCls}${task.priority ? ' priority-high' : ''}${snap.isDragging ? ' dragging' : ''}`}
                        ref={prov.innerRef}
                        {...prov.draggableProps}
                        {...prov.dragHandleProps}
                        onClick={() => !snap.isDragging && setEditingTask(task)}
                      >
                        <div className="task-card-top">
                          {task.priority === 1 && <span className="priority-chip">HOCH</span>}
                          <span className="task-title">{task.title}</span>
                          {task.notes && <span className="task-notes-dot" title={task.notes} />}
                        </div>
                        {task.due_date && <DueBadge date={task.due_date} />}
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <div className="add-task-area">
          {addingTo === member.id ? (
            <>
              <input
                ref={inputRef}
                autoFocus
                onKeyDown={e => {
                  if (e.key === 'Enter') { e.preventDefault(); handleAddTask(member.id); }
                  if (e.key === 'Escape') { setAddingTo(null); setAddError(''); }
                }}
                placeholder="Task-Name…"
                className="add-task-input"
              />
              {addError && <div className="add-task-error">{addError}</div>}
              <div className="add-task-btns">
                <button
                  className="btn-add-confirm"
                  onMouseDown={e => { e.preventDefault(); handleAddTask(member.id); }}
                >
                  Hinzufügen
                </button>
                <button
                  className="btn-add-cancel"
                  onMouseDown={e => { e.preventDefault(); setAddingTo(null); setAddError(''); }}
                >
                  Abbrechen
                </button>
              </div>
            </>
          ) : (
            <button className="add-task-btn" onClick={() => { setAddError(''); setAddingTo(member.id); }}>+ Task hinzufügen</button>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="board-toolbar">
        <span className="week-label">{week}</span>
        <button className="btn-header" onClick={() => setShowMemberPanel(true)}>Team verwalten</button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="board-sections">
          {/* Obere Sektion: Haupt-Team Spalten */}
          <div className="board-main-section">
            <div className="board">
              {topMembers.map((member, idx) => renderColumn(member, idx))}
            </div>
          </div>

          {/* Untere Sektion: Immer unten fixierte 4 Kollegen */}
          {bottomMembers.length > 0 && (
            <div className="board-bottom-section">
              <div className="board-bottom-grid">
                {bottomMembers.map((member, idx) => renderColumn(member, topMembers.length + idx))}
              </div>
            </div>
          )}
        </div>
      </DragDropContext>

      {editingTask && (
        <TaskModal
          task={editingTask}
          members={members}
          onClose={() => setEditingTask(null)}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          onCopy={handleCopyTask}
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
