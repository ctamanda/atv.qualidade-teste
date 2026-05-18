import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import TaskCard from '../components/TaskCard';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [error, setError] = useState('');
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Autenticação simples e carregamento das tarefas
  useEffect(() => {
    const loggedUserStr = localStorage.getItem('user');
    if (!loggedUserStr) {
      navigate('/login');
      return;
    }
    const loggedUser = JSON.parse(loggedUserStr);
    setUser(loggedUser);

    const fetchTasks = async () => {
      try {
        const data = await api.getTasks(loggedUser.id);
        setTasks(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    setError('');

    if (!newTitle.trim()) {
      setError('O título da tarefa é obrigatório.');
      return;
    }

    setSubmitting(true);
    try {
      const newTask = {
        title: newTitle.trim(),
        description: newDescription.trim(),
        status: 'pending',
        userId: user.id,
      };

      const createdTask = await api.createTask(newTask);
      setTasks((prev) => [createdTask, ...prev]);
      setNewTitle('');
      setNewDescription('');
    } catch (err) {
      console.error(err);
      setError('Não foi possível criar a tarefa.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTask = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  };

  const handleDeleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Filtragem
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    return true; // all
  });

  // Estatísticas
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;
  const completedCount = tasks.filter((t) => t.status === 'completed').length;

  if (!user) {
    return <div style={{ padding: '20px', textLight: 'center' }}>Carregando dados...</div>;
  }

  return (
    <div className="dashboard-container animate-fade-in">
      {/* Header */}
      <header className="dashboard-header">
        <div className="user-profile">
          <div className="avatar">{user.name ? user.name[0].toUpperCase() : 'U'}</div>
          <div className="user-info">
            <div className="username" data-cy="welcome-user">Olá, {user.name}</div>
            <div className="user-email">{user.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          data-cy="logout-btn"
        >
          Sair
        </button>
      </header>

      {/* Form para adicionar tarefas */}
      <section className="glass-panel task-form-panel">
        <h2 className="task-form-title">Nova Tarefa</h2>
        <form onSubmit={handleAddTask}>
          <div className="form-row">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="task-title">Título *</label>
              <input
                id="task-title"
                type="text"
                className="form-input"
                placeholder="Ex: Estudar sobre ferramentas de teste"
                value={newTitle}
                onChange={(e) => {
                  setNewTitle(e.target.value);
                  if (error) setError('');
                }}
                data-cy="new-task-title"
              />
              {error && <span className="form-error" data-cy="new-task-error">{error}</span>}
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="task-desc">Descrição</label>
              <input
                id="task-desc"
                type="text"
                className="form-input"
                placeholder="Opcional..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                data-cy="new-task-desc"
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0, alignSelf: 'end' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
                data-cy="new-task-submit"
              >
                {submitting ? 'Adicionando...' : 'Adicionar'}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Controles e Grid de Tarefas */}
      <main>
        <div className="control-bar">
          <div className="filter-tabs">
            <button
              onClick={() => setFilter('all')}
              className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
              data-cy="filter-all"
            >
              Todas ({tasks.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
              data-cy="filter-pending"
            >
              Pendentes ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
              data-cy="filter-completed"
            >
              Concluídas ({completedCount})
            </button>
          </div>

          <div className="stats-text" data-cy="tasks-stats">
            {pendingCount === 0
              ? '🎉 Todas as tarefas concluídas!'
              : `Faltam ${pendingCount} tarefa(s) pendente(s)`}
          </div>
        </div>

        {/* Grid das tarefas */}
        {loadingTasks ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            Carregando tarefas do servidor...
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className="tasks-grid" data-cy="tasks-list">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onUpdate={handleUpdateTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        ) : (
          <div className="glass-panel empty-state" data-cy="empty-state">
            <div className="empty-icon">📂</div>
            <div className="empty-text">Nenhuma tarefa encontrada</div>
            <div className="empty-subtext">
              {filter === 'all'
                ? 'Comece adicionando uma nova tarefa acima!'
                : filter === 'pending'
                  ? 'Você não tem nenhuma tarefa pendente no momento.'
                  : 'Nenhuma tarefa concluída ainda. Mãos à obra!'}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
