import { test, expect } from '@playwright/test';

test('F1 - CT02: Visualizar Detalhes da Conta a partir da Visão Geral', async ({ page }) => {
  
  // ==========================================
  // PASSO 0: PREPARAÇÃO (Massa de Dados)
  // Registrar o usuário para garantir que ele está logado e possui uma conta ativa
  // ==========================================
  await page.goto('https://parabank.parasoft.com/parabank/register.htm');
  await page.locator('input[id="customer.firstName"]').fill('J');
  await page.locator('input[id="customer.lastName"]').fill('Cleber');
  await page.locator('input[id="customer.address.street"]').fill('Rua Principal 123');
  await page.locator('input[id="customer.address.city"]').fill('São Paulo');
  await page.locator('input[id="customer.address.state"]').fill('SP');
  await page.locator('input[id="customer.address.zipCode"]').fill('01000-000');
  await page.locator('input[id="customer.phoneNumber"]').fill('11999999999');
  await page.locator('input[id="customer.ssn"]').fill('123456789');
  
  const randomSuffix = Math.floor(Math.random() * 10000).toString();
  const username = `jcleber22_${randomSuffix}`;
  const password = `33`;
  
  await page.locator('input[id="customer.username"]').fill(username);
  await page.locator('input[id="customer.password"]').fill(password);
  await page.locator('input[id="repeatedPassword"]').fill(password);
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.locator('.title')).toContainText('Welcome');
  
  // Após o registro, o usuário já está logado e uma nova conta é gerada automaticamente pelo ParaBank.

  // ==========================================
  // INÍCIO DO TESTE CT02 REAL
  // ==========================================

  // Passo 1: No menu lateral esquerdo, clique no link "Visão Geral das Contas" (Accounts Overview)
  await page.getByRole('link', { name: 'Accounts Overview' }).click();
  
  // Validação Passo 1: O sistema deve direcionar o usuário para a página de visão geral
  await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();

  // Passo 2: Localize a tabela de contas e escolha um ID de conta específico
  const accountTable = page.locator('table#accountTable');
  await page.waitForTimeout(1500); // Aguardar o Angular carregar as contas
  
  // Pega o link (a) de dentro da primeira linha que contém um saldo
  const firstAccountLink = accountTable.locator('tr').filter({ hasText: '$' }).first().locator('a');
  
  // Validação do Passo 2: O ID da conta selecionada deve estar visível e formatado como um link
  await expect(firstAccountLink).toBeVisible();
  const accountIdText = await firstAccountLink.textContent(); // Vamos guardar o número da conta para verificar depois

  // Passo 3: Clique no link correspondente ao ID da conta escolhida
  await firstAccountLink.click();

  // Validação do Passo 3: O sistema deve redirecionar para a página "Account Details"
  await expect(page.getByRole('heading', { name: 'Account Details' })).toBeVisible();

  // Passo 4: Validar informações exibidas na nova página de detalhes da conta
  // Validação: Exibir número da conta, tipo de conta, saldo atual e saldo disponível
  await expect(page.locator('#accountId')).toHaveText(accountIdText as string); // Verifica se abriu a conta certa
  await expect(page.locator('#accountType')).toBeVisible();
  await expect(page.locator('#balance')).toBeVisible();
  await expect(page.locator('#availableBalance')).toBeVisible();

  // Validação: Exibir uma tabela com o histórico de transações ou a mensagem de que não há transações
  const transactionTable = page.locator('table#transactionTable');
  const noTransactionsMsg = page.getByText(/No transactions found/i);
  
  // Como o ParaBank coloca os dois elementos no HTML (escondendo um deles),
  // o Playwright deu um erro de "strict mode" por achar dois resultados.
  // Vamos resolver isso verificando a visibilidade de forma inteligente:
  await page.waitForTimeout(1000); // Esperar a tela terminar de carregar
  
  const isTableVisible = await transactionTable.isVisible();
  const isMsgVisible = await noTransactionsMsg.isVisible();
  
  // Exige que pelo menos UM dos dois esteja visível na tela
  expect(isTableVisible || isMsgVisible).toBeTruthy();
});
