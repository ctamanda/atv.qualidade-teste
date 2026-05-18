import React, { useState } from 'react';
import { api } from '../services/api';

export default function TaskCard({ task, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggleStatus = async () => {
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      const updated = await api.updateTask(task.id, { status: newStatus });
      onUpdate(updated);
    } catch (err) {
      console.error(err);
      alert('Não foi possível atualizar o status da tarefa.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!editTitle.trim()) {
      setError('O título não pode ser vazio.');
      return;
    }

    setLoading(true);
    try {
      const updated = await api.updateTask(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      onUpdate(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError('Falha ao salvar as alterações da tarefa.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.deleteTask(task.id);
      onDelete(task.id);
    } catch (err) {
      console.error(err);
      alert('Não foi possível excluir a tarefa.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setError('');
    setIsEditing(false);
  };

  const isCompleted = task.status === 'completed';

  return (
    <div 
      className={`task-card glass-panel animate-fade-in ${isCompleted ? 'completed' : ''}`}
      data-cy={`task-item-${task.id}`}
      data-status={task.status}
    >
      {isEditing ? (
        <form onSubmit={handleSave} className="edit-form" data-cy="task-edit-form">
          <div className="form-group" style={{ marginBottom: '8px' }}>
            <input
              type="text"
              className="form-input"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Título da tarefa"
              data-cy="task-edit-title"
              autoFocus
            />
            {error && <span className="form-error" data-cy="task-edit-error">{error}</span>}
          </div>
          <div className="form-group" style={{ marginBottom: '12px' }}>
            <textarea
              className="form-input"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Descrição (opcional)"
              data-cy="task-edit-desc"
              rows={2}
              style={{ resize: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              className="btn btn-secondary btn-text" 
              onClick={handleCancel}
              disabled={loading}
              data-cy="task-cancel-btn"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ padding: '8px 16px', borderRadius: '10px' }}
              disabled={loading}
              data-cy="task-save-btn"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      ) : (
        <>
          <div>
            <div className="task-header">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={isCompleted}
                  onChange={handleToggleStatus}
                  disabled={loading}
                  data-cy="task-checkbox"
                />
                <span className="checkmark"></span>
              </label>
              <h3 className="task-title" data-cy="task-title-text">
                {task.title}
              </h3>
            </div>
            {task.description && (
              <p className="task-desc" data-cy="task-desc-text">
                {task.description}
              </p>
            )}
          </div>

          <div className="task-footer">
            <button
              className="btn btn-secondary btn-text"
              onClick={() => setIsEditing(true)}
              disabled={loading}
              data-cy="task-edit-btn"
              style={{ fontSize: '0.85rem' }}
            >
              Editar
            </button>
            <button
              className="btn btn-danger btn-text"
              onClick={handleDelete}
              disabled={loading}
              data-cy="task-delete-btn"
              style={{ fontSize: '0.85rem', color: '#f43f5e' }}
            >
              Excluir
            </button>
          </div>
        </>
      )}
    </div>
  );
}
