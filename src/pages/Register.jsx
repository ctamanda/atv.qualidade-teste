import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedUser = localStorage.getItem('user');
    if (loggedUser) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const validate = () => {
    const tempErrors = {};
    if (!name.trim()) tempErrors.name = 'O nome é obrigatório.';
    
    if (!email) {
      tempErrors.email = 'O e-mail é obrigatório.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Insira um e-mail válido.';
    }
    
    if (!password) {
      tempErrors.password = 'A senha é obrigatória.';
    } else if (password.length < 6) {
      tempErrors.password = 'A senha deve ter pelo menos 6 caracteres.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!validate()) return;

    setLoading(true);
    const result = await api.register(name, email, password);
    setLoading(false);

    if (result.success) {
      localStorage.setItem('user', JSON.stringify(result.user));
      navigate('/dashboard');
    } else {
      setServerError(result.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card glass-panel animate-scale-up">
        <div className="auth-header">
          <div className="logo-icon" data-cy="logo">T</div>
          <h1 className="auth-title">Criar Conta</h1>
          <p className="auth-subtitle">Junte-se ao TaskFlow</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {serverError && (
            <div 
              className="form-error" 
              style={{ 
                background: 'rgba(244, 63, 94, 0.1)', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '20px', 
                textAlign: 'left',
                fontSize: '0.85rem',
                border: '1px solid rgba(244, 63, 94, 0.2)'
              }}
              data-cy="register-error"
            >
              {serverError}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="name">Nome</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              data-cy="name-input"
            />
            {errors.name && <span className="form-error" data-cy="name-error">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="seu-email@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              data-cy="email-input"
            />
            {errors.email && <span className="form-error" data-cy="email-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-cy="password-input"
            />
            {errors.password && <span className="form-error" data-cy="password-error">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '10px' }}
            disabled={loading}
            data-cy="register-submit"
          >
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>

        <p className="auth-subtitle" style={{ marginTop: '24px', fontSize: '0.9rem' }}>
          Já tem uma conta?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }} data-cy="link-login">
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
