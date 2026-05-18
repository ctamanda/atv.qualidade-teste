describe('TaskFlow - E2E', () => {
  const user = {
    email: 'teste1@gmail.com',
    password: '12344321',
  };

  it('Login', () => {
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type(user.email);
    cy.get('[data-cy="password-input"]').type(user.password);
    cy.get('[data-cy="login-submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  beforeEach(() => {
    // login antes de cada teste
    cy.visit('/login');
    cy.get('[data-cy="email-input"]').type(user.email);
    cy.get('[data-cy="password-input"]').type(user.password);
    cy.get('[data-cy="login-submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('Criar tarefa', () => {
    cy.get('[data-cy="new-task-title"]').type('Tarefa Cypress');
    cy.get('[data-cy="new-task-desc"]').type('Descrição da tarefa Cypress');
    cy.get('[data-cy="new-task-submit"]').click();

    cy.contains('[data-cy="task-title-text"]', 'Tarefa Cypress').should('exist');
  });

  it('Editar tarefa', () => {
    cy.contains('[data-cy="task-title-text"]', 'Tarefa Cypress')
      .parents('[data-cy^="task-item-"]')
      .within(() => {
        cy.get('[data-cy="task-edit-btn"]').click();
      });

    cy.get('[data-cy="task-edit-title"]').clear().type('Tarefa Cypress Editada');
    cy.get('[data-cy="task-save-btn"]').click();

    cy.contains('[data-cy="task-title-text"]', 'Tarefa Cypress Editada').should('exist');
  });

  it('Excluir tarefa', () => {
    cy.contains('[data-cy="task-title-text"]', 'Tarefa Cypress Editada')
      .parents('[data-cy^="task-item-"]')
      .within(() => {
        cy.get('[data-cy="task-delete-btn"]').click();
      });

    cy.contains('[data-cy="task-title-text"]', 'Tarefa Cypress Editada').should('not.exist');
  });

  it('Filtrar tarefas pendentes e concluídas', () => {
    // cria tarefa pendente
    cy.get('[data-cy="new-task-title"]').type('Tarefa Pendente');
    cy.get('[data-cy="new-task-submit"]').click();

    // cria tarefa concluída
    cy.get('[data-cy="new-task-title"]').type('Tarefa Concluída');
    cy.get('[data-cy="new-task-submit"]').click();

    cy.contains('[data-cy="task-title-text"]', 'Tarefa Concluída')
      .parents('[data-cy^="task-item-"]')
      .within(() => {
        cy.get('[data-cy="task-checkbox"]').check({ force: true });
      });

    // filtro pendentes
    cy.get('[data-cy="filter-pending"]').click();
    cy.contains('Tarefa Pendente').should('exist');
    cy.contains('Tarefa Concluída').should('not.exist');

    // filtro concluídas
    cy.get('[data-cy="filter-completed"]').click();
    cy.contains('Tarefa Concluída').should('exist');
    cy.contains('Tarefa Pendente').should('not.exist');

    // todas
    cy.get('[data-cy="filter-all"]').click();
    cy.contains('Tarefa Pendente').should('exist');
    cy.contains('Tarefa Concluída').should('exist');
  });
});
