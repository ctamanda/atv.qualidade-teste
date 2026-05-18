const BASE_URL = 'http://localhost:3000';

export const api = {
  // Authentication
  async login(email, password) {
    try {
      const response = await fetch(`${BASE_URL}/users?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
      if (!response.ok) {
        throw new Error('Falha na comunicação com o servidor.');
      }
      const users = await response.json();
      if (users.length > 0) {
        const { password: _, ...userWithoutPassword } = users[0];
        return { success: true, user: userWithoutPassword };
      } else {
        return { success: false, message: 'E-mail ou senha incorretos.' };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro ao tentar se conectar ao servidor.' };
    }
  },

  // Cadastro de usuário
  async register(name, email, password) {
    try {
      // Verifica se e-mail já existe
      const checkResponse = await fetch(`${BASE_URL}/users?email=${encodeURIComponent(email)}`);
      const existingUsers = await checkResponse.json();
      
      if (existingUsers.length > 0) {
        return { success: false, message: 'E-mail já está em uso.' };
      }

      const response = await fetch(`${BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      
      if (!response.ok) throw new Error();
      const newUser = await response.json();
      
      const { password: _, ...userWithoutPassword } = newUser;
      return { success: true, user: userWithoutPassword };
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, message: 'Erro ao cadastrar usuário.' };
    }
  },

  // Get Tasks for a specific user
  async getTasks(userId) {
    const response = await fetch(`${BASE_URL}/tasks?userId=${userId}`);
    if (!response.ok) {
      throw new Error('Erro ao buscar tarefas.');
    }
    return response.json();
  },

  // Create Task
  async createTask(task) {
    const response = await fetch(`${BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    if (!response.ok) {
      throw new Error('Erro ao criar tarefa.');
    }
    return response.json();
  },

  // Update Task (PATCH to only update specific fields like status or title)
  async updateTask(taskId, updates) {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error('Erro ao atualizar tarefa.');
    }
    return response.json();
  },

  // Delete Task
  async deleteTask(taskId) {
    const response = await fetch(`${BASE_URL}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Erro ao excluir tarefa.');
    }
    return true;
  }
};
