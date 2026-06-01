import { test, expect } from '@playwright/test';

test('F2 - CT05: Verificar se a nova conta criada é listada imediatamente no Accounts Overview', async ({ page }) => {
  
  // ==========================================
  // PASSO 0: PREPARAÇÃO (Massa de Dados)
  // Registrar o usuário e abrir uma nova conta para capturar o ID gerado
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

  // Fazer logout para testar o fluxo completo a partir de um usuário previamente cadastrado
  await page.getByRole('link', { name: 'Log Out' }).click();

  // ==========================================
  // INÍCIO DO TESTE F2 CT05 REAL
  // ==========================================

  // Pré-condição: O usuário deve estar autenticado no sistema
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.locator('.smallText')).toContainText('Welcome');

  // Pré-condição: O usuário deve ter acabado de concluir a abertura de uma nova conta
  // Abrindo uma nova conta para capturar o ID gerado
  await page.getByRole('link', { name: 'Open New Account' }).click();
  await expect(page.getByRole('heading', { name: 'Open New Account' })).toBeVisible();
  await page.waitForTimeout(1000); // Aguardar Angular carregar
  await page.getByRole('button', { name: 'Open New Account' }).click();
  await expect(page.getByRole('heading', { name: 'Account Opened!' })).toBeVisible();

  // Capturar o ID da nova conta criada
  const newAccountLink = page.locator('#newAccountId');
  const newAccountId = await newAccountLink.innerText();

  // Passo 1: No menu lateral esquerdo "Account Services", clicar na opção "Accounts Overview"
  await page.getByRole('link', { name: 'Accounts Overview' }).click();

  // Validação Passo 1: O sistema deve redirecionar para a página de Visão Geral das Contas
  await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();

  // Passo 2: Localizar a tabela principal de listagem de contas na tela
  const accountTable = page.locator('table#accountTable');
  await page.waitForTimeout(1500); // Aguardar o Angular carregar a tabela com dados atualizados
  await expect(accountTable).toBeVisible();

  // Validação Passo 2: A tabela deve carregar com todas as informações atualizadas
  // Verificar que a tabela possui cabeçalhos esperados (Account, Balance, Available)
  await expect(accountTable).toContainText('Account');
  await expect(accountTable).toContainText('Balance');
  await expect(accountTable).toContainText('Available');

  // Passo 3: Validar a presença do ID da nova conta criada na coluna "Conta"
  // Buscar na tabela a linha que contém o ID da conta recém-criada
  const newAccountRow = accountTable.locator('tr').filter({ hasText: newAccountId });
  await expect(newAccountRow).toBeVisible();

  // Validação Passo 3: A nova conta deve constar na listagem exibindo:
  // - Seu número correspondente (ID) como link clicável
  const accountLink = newAccountRow.getByRole('link', { name: newAccountId });
  await expect(accountLink).toBeVisible();

  // - Saldo inicial atualizado (deve exibir um valor em dólar)
  const balanceCell = newAccountRow.locator('td').nth(1);
  const balanceText = await balanceCell.innerText();
  expect(balanceText.trim()).toMatch(/^\$[\d,.]+$/); // Formato $XXX.XX

  // - Valor disponível de forma consolidada (deve exibir um valor em dólar)
  const availableCell = newAccountRow.locator('td').nth(2);
  const availableText = await availableCell.innerText();
  expect(availableText.trim()).toMatch(/^\$[\d,.]+$/); // Formato $XXX.XX
});
