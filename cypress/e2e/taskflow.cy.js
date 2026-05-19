describe('TaskFlow - E2E', () => {
  const user = {
    email: 'teste@cypress.com',
    password: 'senha123',
  };

  describe('Autenticação', () => {
    it('Login', () => {
      cy.visit('/login');
      cy.get('[data-cy="email-input"]').type(user.email);
      cy.get('[data-cy="password-input"]').type(user.password);
      cy.get('[data-cy="login-submit"]').click();
      cy.url().should('include', '/dashboard');
    });
  });

  describe('Tarefas', () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.visit('/login');
      cy.get('[data-cy="email-input"]').type(user.email);
      cy.get('[data-cy="password-input"]').type(user.password);
      cy.get('[data-cy="login-submit"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('Criar tarefa', () => {
      cy.intercept('POST', '**/tasks').as('createTask');
      cy.intercept('DELETE', '**/tasks/**').as('deleteTask');

      cy.get('[data-cy="new-task-title"]').type('Tarefa Cypress');
      cy.get('[data-cy="new-task-desc"]').type('Descrição da tarefa Cypress');
      cy.get('[data-cy="new-task-submit"]').click();
      cy.wait('@createTask');

      cy.contains('[data-cy="task-title-text"]', 'Tarefa Cypress').should('exist');

      cy.contains('[data-cy="task-title-text"]', 'Tarefa Cypress')
        .parents('[data-cy^="task-item-"]')
        .within(() => {
          cy.get('[data-cy="task-delete-btn"]').click();
        });
      cy.wait('@deleteTask');
    });

    it('Editar tarefa', () => {
      cy.intercept('POST', '**/tasks').as('createTask');
      cy.intercept('PATCH', '**/tasks/**').as('updateTask');
      cy.intercept('DELETE', '**/tasks/**').as('deleteTask');

      cy.get('[data-cy="new-task-title"]').type('Tarefa Para Editar');
      cy.get('[data-cy="new-task-submit"]').click();
      cy.wait('@createTask');

      cy.contains('[data-cy="task-title-text"]', 'Tarefa Para Editar')
        .parents('[data-cy^="task-item-"]')
        .within(() => {
          cy.get('[data-cy="task-edit-btn"]').click();
        });

      cy.get('[data-cy="task-edit-title"]')
        .clear()
        .type('Tarefa Editada')
        .should('have.value', 'Tarefa Editada');

      cy.get('[data-cy="task-save-btn"]').click();
      cy.wait('@updateTask');

      cy.contains('[data-cy="task-title-text"]', 'Tarefa Editada').should('exist');

      cy.contains('[data-cy="task-title-text"]', 'Tarefa Editada')
        .parents('[data-cy^="task-item-"]')
        .within(() => {
          cy.get('[data-cy="task-delete-btn"]').click();
        });
      cy.wait('@deleteTask');
    });

    it('Excluir tarefa', () => {
      cy.intercept('POST', '**/tasks').as('createTask');
      cy.intercept('DELETE', '**/tasks/**').as('deleteTask');

      cy.get('[data-cy="new-task-title"]').type('Tarefa Para Excluir');
      cy.get('[data-cy="new-task-submit"]').click();
      cy.wait('@createTask');

      cy.contains('[data-cy="task-title-text"]', 'Tarefa Para Excluir')
        .parents('[data-cy^="task-item-"]')
        .within(() => {
          cy.get('[data-cy="task-delete-btn"]').click();
        });

      cy.wait('@deleteTask');
      cy.contains('[data-cy="task-title-text"]', 'Tarefa Para Excluir').should('not.exist');
    });

    it('Filtrar tarefas pendentes e concluídas', () => {
      cy.intercept('POST', '**/tasks').as('createTask');
      cy.intercept('PATCH', '**/tasks/**').as('updateTask');
      cy.intercept('DELETE', '**/tasks/**').as('deleteTask');

      cy.get('[data-cy="new-task-title"]').type('Tarefa Pendente Cypress');
      cy.get('[data-cy="new-task-submit"]').click();
      cy.wait('@createTask');

      cy.get('[data-cy="new-task-title"]').type('Tarefa Concluída Cypress');
      cy.get('[data-cy="new-task-submit"]').click();
      cy.wait('@createTask');

      cy.contains('[data-cy="task-title-text"]', 'Tarefa Concluída Cypress')
        .parents('[data-cy^="task-item-"]')
        .within(() => {
          cy.get('[data-cy="task-checkbox"]').check({ force: true });
        });
      cy.wait('@updateTask');

      cy.get('[data-cy="filter-pending"]').click();
      cy.contains('Tarefa Pendente Cypress').should('exist');
      cy.contains('Tarefa Concluída Cypress').should('not.exist');

      cy.get('[data-cy="filter-completed"]').click();
      cy.contains('Tarefa Concluída Cypress').should('exist');
      cy.contains('Tarefa Pendente Cypress').should('not.exist');

      cy.get('[data-cy="filter-all"]').click();
      cy.contains('Tarefa Pendente Cypress').should('exist');
      cy.contains('Tarefa Concluída Cypress').should('exist');

      cy.contains('[data-cy="task-title-text"]', 'Tarefa Pendente Cypress')
        .parents('[data-cy^="task-item-"]')
        .within(() => {
          cy.get('[data-cy="task-delete-btn"]').click();
        });
      cy.wait('@deleteTask');

      cy.contains('[data-cy="task-title-text"]', 'Tarefa Concluída Cypress')
        .parents('[data-cy^="task-item-"]')
        .within(() => {
          cy.get('[data-cy="task-delete-btn"]').click();
        });
      cy.wait('@deleteTask');
    });
  });
});
