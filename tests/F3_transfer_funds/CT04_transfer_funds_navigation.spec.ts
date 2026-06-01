import { test, expect } from '@playwright/test';

test('F3 - CT04: Manter o contexto de navegação do sistema após a operação de transferência', async ({ page }) => {
  
  // ==========================================
  // PASSO 0: PREPARAÇÃO (Massa de Dados)
  // Registrar o usuário, criar uma segunda conta para realizar a transferência e fazer logout
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
  const password = `jcleber22`;
  
  await page.locator('input[id="customer.username"]').fill(username);
  await page.locator('input[id="customer.password"]').fill(password);
  await page.locator('input[id="repeatedPassword"]').fill(password);
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.locator('.title')).toContainText('Welcome');

  // Criando uma segunda conta
  await page.getByRole('link', { name: 'Open New Account' }).click();
  await page.waitForTimeout(1000); 
  await page.getByRole('button', { name: 'Open New Account' }).click();
  await expect(page.getByRole('heading', { name: 'Account Opened!' })).toBeVisible();

  // Fazer logout
  await page.getByRole('link', { name: 'Log Out' }).click();

  // ==========================================
  // INÍCIO DO TESTE F3 CT04 REAL
  // ==========================================

  // Pré-condição: Autenticar e acessar a tela de "Transferência de fundos"
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.locator('.smallText')).toContainText('Welcome');

  await page.getByRole('link', { name: 'Transfer Funds' }).click();
  await expect(page.getByRole('heading', { name: 'Transfer Funds' })).toBeVisible();

  // Passo 1: Preencher os dados da transferência, clicar em "Confirmar/Finalizar" e aguardar o resultado
  await page.waitForTimeout(2000); // Aguardar o Angular carregar as contas
  const amountInput = page.locator('#amount');
  const fromAccountSelect = page.locator('#fromAccountId');
  const toAccountSelect = page.locator('#toAccountId');

  // Capturar as contas para uso futuro
  const fromOptions = fromAccountSelect.locator('option');
  const account1 = await fromOptions.nth(0).innerText();
  const account2 = await fromOptions.nth(1).innerText();

  await fromAccountSelect.selectOption(account1);
  await toAccountSelect.selectOption(account2);
  
  const transferAmount = '100';
  await amountInput.fill(transferAmount);
  await page.getByRole('button', { name: 'Transfer' }).click();

  // Validação Passo 1: O sistema conclui a ação, exibe feedback, e mantém visíveis o menu de navegação e dados da sessão
  await expect(page.getByRole('heading', { name: 'Transfer Complete!' })).toBeVisible();
  await expect(page.locator('#leftPanel')).toBeVisible(); // Menu lateral visível
  await expect(page.locator('.smallText')).toContainText('Welcome'); // Dados da sessão visíveis
  await expect(page.getByRole('link', { name: 'Log Out' })).toBeVisible(); // Usuário continua logado

  // Passo 2: Clicar em qualquer link do menu lateral (ex: "Accounts Overview")
  await page.getByRole('link', { name: 'Accounts Overview' }).click();

  // Validação Passo 2: O sistema redireciona o usuário para a tela selecionada imediatamente, sem solicitar novo login
  await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();
  // Se tivéssemos sido deslogados, o botão 'Log In' estaria visível, então validamos que não está
  await expect(page.locator('input[name="username"]')).toBeHidden(); 

  // Passo 3: Verificar o saldo da conta de origem utilizada na operação anterior ou o histórico de transações
  // Vamos clicar na conta de origem para abrir a tela de Account Details e ver as transações
  await page.getByRole('link', { name: account1, exact: true }).click();
  
  // Aguarda a tela de detalhes carregar
  await expect(page.getByRole('heading', { name: 'Account Details' })).toBeVisible();
  
  // Validação Passo 3: O sistema exibe as informações atualizadas refletindo o impacto da transferência
  // Procurando pela transação de envio de fundos no valor da transferência
  await page.waitForTimeout(1500); // Aguardar Angular carregar a tabela de transações
  const transactionTable = page.locator('table#transactionTable');
  await expect(transactionTable).toBeVisible();

  // A tabela deve conter a descrição "Funds Transfer Sent" e o valor debitado ("$100.00")
  await expect(transactionTable).toContainText('Funds Transfer Sent');
  
  // Pega a linha que contém 'Funds Transfer Sent' e valida se possui o valor correto
  const transferRow = transactionTable.locator('tr').filter({ hasText: 'Funds Transfer Sent' }).first();
  await expect(transferRow).toContainText('$100.00');
});
