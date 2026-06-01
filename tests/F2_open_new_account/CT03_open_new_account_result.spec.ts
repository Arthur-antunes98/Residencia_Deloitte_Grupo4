import { test, expect } from '@playwright/test';

test('F2 - CT03: Comunica ao usuário o resultado da tentativa de abertura de conta', async ({ page }) => {
  
  // ==========================================
  // PASSO 0: PREPARAÇÃO (Massa de Dados)
  // Registrar o usuário para garantir que ele existe e possui uma conta de origem com saldo
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
  const password = `jcleber22`; // Senha conforme solicitada
  
  await page.locator('input[id="customer.username"]').fill(username);
  await page.locator('input[id="customer.password"]').fill(password);
  await page.locator('input[id="repeatedPassword"]').fill(password);
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.locator('.title')).toContainText('Welcome');

  // Fazer logout para testar o fluxo completo a partir de um usuário previamente cadastrado
  await page.getByRole('link', { name: 'Log Out' }).click();

  // ==========================================
  // INÍCIO DO TESTE F2 CT03 REAL
  // ==========================================

  // Pré-condição: O usuário deve estar autenticado no sistema
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();

  // Garantir que a autenticação ocorreu com sucesso
  await expect(page.locator('.smallText')).toContainText('Welcome');

  // Passo 1: No menu lateral esquerdo "Account Services", clicar na opção "Open New Account".
  await page.getByRole('link', { name: 'Open New Account' }).click();

  // Validação Passo 1: A página "Open New Account" deve ser exibida corretamente
  await expect(page.getByRole('heading', { name: 'Open New Account' })).toBeVisible();

  // Passo 2: No campo "What type of Account would you like to open?", selecionar "CHECKING"
  const accountTypeSelect = page.locator('#type');
  await accountTypeSelect.selectOption('0'); // 0 é geralmente o valor de CHECKING no Parabank

  // Validação Passo 2: A opção CHECKING deve ser selecionada. 
  // O sistema deve exibir dinamicamente a mensagem informando sobre a obrigatoriedade do depósito mínimo.
  // Aguardar um instante para o Angular atualizar a tela (mensagem de depósito mínimo)
  await page.waitForTimeout(1000); 
  // O Parabank normalmente exibe algo como "A minimum of $100.00 must be deposited..."
  const minimumDepositMessage = page.getByText('minimum of $');
  await expect(minimumDepositMessage).toBeVisible();
  
  const mustBeDepositedMessage = page.getByText('must be deposited into this account at time of opening');
  await expect(mustBeDepositedMessage).toBeVisible();

  // Passo 3: No campo "Please choose an existing account...", selecionar uma conta de origem com saldo
  const fromAccountSelect = page.locator('#fromAccountId');
  // Como o usuário acabou de ser registrado, ele já tem uma conta de origem que aparece na lista
  // O Angular carrega isso dinamicamente, vamos aguardar as opções preencherem
  await page.waitForTimeout(1000); 
  
  // Pegamos a primeira conta disponível (que sabemos que tem saldo pois é o bônus de boas-vindas)
  const sourceAccountId = await fromAccountSelect.locator('option').first().innerText();
  await fromAccountSelect.selectOption(sourceAccountId);

  // Validação Passo 3: A conta de origem selecionada deve ser fixada no campo
  await expect(fromAccountSelect).toHaveValue(sourceAccountId);

  // Passo 4: Clicar no botão "OPEN NEW ACCOUNT"
  await page.getByRole('button', { name: 'Open New Account' }).click();

  // Validação Passo 4: A página deve ser atualizada com sucesso, exibindo "Account Opened!"
  // e "Congratulations, your account is now open." 
  // O sistema deve fornecer explicitamente o ID numérico da nova conta como link clicável.
  await expect(page.getByRole('heading', { name: 'Account Opened!' })).toBeVisible();
  await expect(page.locator('p').filter({ hasText: 'Congratulations, your account is now open.' })).toBeVisible();
  
  const newAccountIdLink = page.locator('#newAccountId');
  await expect(newAccountIdLink).toBeVisible();
  
  // Verificar se é um número (ID numérico explícito)
  const newIdText = await newAccountIdLink.innerText();
  expect(newIdText).toMatch(/^\d+$/); // Garante que o texto dentro do link são apenas números
});
