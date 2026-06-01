import { test, expect } from '@playwright/test';

test('F2 - CT04: Abertura de conta do tipo Poupança (Savings) com sucesso', async ({ page }) => {
  
  // ==========================================
  // PASSO 0: PREPARAÇÃO (Massa de Dados)
  // Registrar o usuário para garantir que ele existe e possui conta ativa com saldo mínimo
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
  const username = `pedrogomes_${randomSuffix}`;
  const password = `jcleber22`;
  
  await page.locator('input[id="customer.username"]').fill(username);
  await page.locator('input[id="customer.password"]').fill(password);
  await page.locator('input[id="repeatedPassword"]').fill(password);
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.locator('.title')).toContainText('Welcome');

  // Fazer logout para testar o fluxo completo a partir de um usuário previamente cadastrado
  await page.getByRole('link', { name: 'Log Out' }).click();

  // ==========================================
  // INÍCIO DO TESTE F2 CT04 REAL
  // ==========================================

  // Pré-condição: O usuário deve estar autenticado no sistema
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.locator('.smallText')).toContainText('Welcome');

  // Passo 1: No menu lateral esquerdo "Account Services", clicar na opção "Open New Account"
  await page.getByRole('link', { name: 'Open New Account' }).click();

  // Validação Passo 1: A página "Open New Account" deve ser exibida corretamente com o formulário
  await expect(page.getByRole('heading', { name: 'Open New Account' })).toBeVisible();

  const accountTypeSelect = page.locator('#type');
  await expect(accountTypeSelect).toBeVisible();

  const fromAccountSelect = page.locator('#fromAccountId');
  await page.waitForTimeout(1500); // Aguardar o Angular carregar as contas
  await expect(fromAccountSelect).toBeVisible();

  // Passo 2: No campo "What type of Account would you like to open?", selecionar "SAVINGS"
  await accountTypeSelect.selectOption('1'); // 1 = SAVINGS no ParaBank

  // Validação Passo 2: A opção "SAVINGS" deve ser fixada com sucesso no campo
  await expect(accountTypeSelect).toHaveValue('1');
  const selectedOptionText = await accountTypeSelect.locator('option:checked').textContent();
  expect(selectedOptionText?.trim()).toBe('SAVINGS');

  // Passo 3: No campo de seleção de conta existente, escolher uma conta de origem com saldo mínimo
  // A primeira conta disponível já contém o saldo mínimo exigido ($100,00)
  const fromOptions = fromAccountSelect.locator('option');
  const sourceAccountId = await fromOptions.first().innerText();
  await fromAccountSelect.selectOption(sourceAccountId);

  // Validação Passo 3: A conta de origem deve ser selecionada corretamente
  await expect(fromAccountSelect).toHaveValue(sourceAccountId);

  // Passo 4: Clicar no botão "OPEN NEW ACCOUNT"
  await page.getByRole('button', { name: 'Open New Account' }).click();

  // Validação Passo 4: A página deve atualizar e exibir:
  // - Mensagem de sucesso "Account Opened!"
  await expect(page.getByRole('heading', { name: 'Account Opened!' })).toBeVisible();

  // - Texto "Congratulations, your account is now open."
  await expect(page.getByText('Congratulations, your account is now open.')).toBeVisible();

  // - O número da nova conta poupança gerado como link clicável
  const newAccountLink = page.locator('#newAccountId');
  await expect(newAccountLink).toBeVisible();

  // Verificar que o link é clicável (possui href)
  const href = await newAccountLink.getAttribute('href');
  expect(href).toBeTruthy();

  // Verificar que o texto do link é um número de ID válido
  const newAccountIdText = await newAccountLink.innerText();
  expect(newAccountIdText.trim()).toMatch(/^\d+$/);
});
