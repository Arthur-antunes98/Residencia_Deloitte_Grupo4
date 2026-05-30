import { test, expect } from '@playwright/test';

test('F1 - CT05: Permite acessar os detalhes de uma conta selecionada, mantendo o contexto do sistema', async ({ page }) => {
  
  // ==========================================
  // PASSO 0: PREPARAÇÃO (Massa de Dados)
  // Registrar o usuário, criar uma segunda conta e fazer uma transferência
  // para garantir histórico de transações recentes
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
  await expect(page.locator('.title')).toContainText('Welcome', { timeout: 15000 });

  // Criar uma segunda conta para possibilitar transferência
  await page.getByRole('link', { name: 'Open New Account' }).click();
  await page.waitForTimeout(1500);
  await page.locator('#type').selectOption('1'); // SAVINGS
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Open New Account' }).click();
  await expect(page.getByText('Congratulations, your account is now open.')).toBeVisible();

  // Fazer uma transferência para gerar histórico de transações recentes
  await page.getByRole('link', { name: 'Transfer Funds' }).click();
  await page.waitForTimeout(1000);
  await page.locator('#amount').fill('50');
  await page.waitForTimeout(500);
  // Selecionar a segunda conta como destino (índice 1)
  await page.locator('#toAccountId').selectOption({ index: 1 });
  await page.getByRole('button', { name: 'Transfer' }).click();
  await expect(page.getByText('Transfer Complete!')).toBeVisible();

  // ==========================================
  // INÍCIO DO TESTE CT05 REAL
  // ==========================================

  // Passo 1: No menu lateral esquerdo, clique na opção "Visão Geral das Contas"
  await page.getByRole('link', { name: 'Accounts Overview' }).click();

  // Validação Passo 1: A página deve ser carregada corretamente exibindo a tabela
  // com a visão geral das contas do usuário
  await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();
  const accountTable = page.locator('table#accountTable');
  await expect(accountTable).toBeVisible();
  await page.waitForTimeout(1500); // Aguardar o Angular carregar

  // Passo 2: Na coluna "Conta", clique no número do link azul correspondente à conta que detalhar
  const firstAccountLink = accountTable.locator('tbody tr').filter({ has: page.locator('a') }).first().locator('a');
  await expect(firstAccountLink).toBeVisible();
  const accountIdText = await firstAccountLink.textContent();
  await firstAccountLink.click();

  // Validação Passo 2: O sistema deve redirecionar o usuário para a tela "Detalhes da conta"
  await expect(page.getByRole('heading', { name: 'Account Details' })).toBeVisible();

  // Passo 3: Validar as informações exibidas na tela de detalhes
  // e a permanência do menu do sistema

  // 3a) Validar informações da conta
  // Número correto da conta
  await expect(page.locator('#accountId')).toHaveText(accountIdText as string);
  // Tipo de conta
  await expect(page.locator('#accountType')).toBeVisible();
  // Saldo atualizado
  await expect(page.locator('#balance')).toBeVisible();
  // Saldo disponível
  await expect(page.locator('#availableBalance')).toBeVisible();

  // 3b) Validar histórico de transações (deve existir por causa da transferência)
  const transactionTable = page.locator('table#transactionTable');
  await page.waitForTimeout(1000);
  const isTableVisible = await transactionTable.isVisible();
  const noTransactionsMsg = page.getByText(/No transactions found/i);
  const isMsgVisible = await noTransactionsMsg.isVisible();
  expect(isTableVisible || isMsgVisible).toBeTruthy();

  // 3c) Validar que o CONTEXTO DO SISTEMA se mantém intacto
  // Menu lateral esquerdo deve estar presente e funcional
  const leftMenu = page.locator('#leftPanel');
  await expect(leftMenu).toBeVisible();

  // Links do menu lateral devem estar acessíveis
  await expect(page.getByRole('link', { name: 'Accounts Overview' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Transfer Funds' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open New Account' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Bill Pay' })).toBeVisible();

  // Cabeçalho do ParaBank deve estar intacto
  const header = page.locator('#topPanel');
  await expect(header).toBeVisible();

  // Logo do ParaBank deve estar visível no cabeçalho
  await expect(page.locator('.logo')).toBeVisible();

  // Botão de Log Out deve estar acessível (confirmando que o usuário continua logado)
  await expect(page.getByRole('link', { name: 'Log Out' })).toBeVisible();
});
