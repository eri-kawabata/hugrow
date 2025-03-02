describe('レポート画面', () => {
  beforeEach(() => {
    cy.login('test-user');
    cy.visit('/report');
  });

  it('基本的なユーザーフローが機能すること', () => {
    // レポートの表示確認
    cy.findByRole('heading', { name: '学習レポート' }).should('exist');
    
    // 感情記録の確認
    cy.findByText('感情分析').click();
    cy.findByText('週間ムードの変化').should('be.visible');
    
    // グラフの操作
    cy.get('[data-testid="mood-chart"]').trigger('mouseover');
    cy.get('.tooltip').should('be.visible');
  });

  it('エラー時のリカバリーが機能すること', () => {
    // APIエラーの発生
    cy.intercept('/api/sel-responses', { statusCode: 500 }).as('getResponses');
    cy.reload();
    
    // エラー表示の確認
    cy.findByText('エラーが発生しました').should('be.visible');
    
    // 再試行
    cy.findByRole('button', { name: '再試行' }).click();
    cy.wait('@getResponses');
    
    // 正常表示の確認
    cy.findByText('感情分析').should('be.visible');
  });
}); 