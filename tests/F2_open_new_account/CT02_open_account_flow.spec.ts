import { test, expect } from '@playwright/test';

test('F2 - CT02: Exige a definição do tipo de conta e de uma conta de origem para o depósito inicial', async ({ page }) => {
  
  // ==========================================
  // PASSO 0: PREPARAÇÃO (Massa de Dados)
  // Registrar o usuário para garantir que ele existe e possui conta ativa
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

  // Após o registro, o usuário já está logado e possui uma conta ativa.

  // ==========================================
  // INÍCIO DO TESTE F2 CT02 REAL
  // ==========================================

  // Passo 1: No menu lateral esquerdo, clique na opção "Abrir Nova Conta" (Open New Account)
  await page.getByRole('link', { name: 'Open New Account' }).click();

  // Validação Passo 1: A página deve ser carregada exibindo o título "Open New Account",
  // um menu suspenso para o tipo de conta e outro para selecionar a conta de origem do depósito
  await expect(page.getByRole('heading', { name: 'Open New Account' })).toBeVisible();

  const accountTypeSelect = page.locator('#type');
  await expect(accountTypeSelect).toBeVisible();

  const fromAccountSelect = page.locator('#fromAccountId');
  await page.waitForTimeout(1500); // Aguardar o Angular carregar as contas
  await expect(fromAccountSelect).toBeVisible();

  // Passo 2: No campo "Que tipo de conta você gostaria de abrir?",
  // selecione o tipo de conta desejado (ex: "SAVINGS" / Economia)
  await accountTypeSelect.selectOption('1'); // 1 = SAVINGS

  // Validação Passo 2: O tipo de conta selecionado deve ser exibido corretamente no campo
  await expect(accountTypeSelect).toHaveValue('1');
  // Confirmar que o texto visível da opção selecionada é "SAVINGS"
  const selectedOptionText = await accountTypeSelect.locator('option:checked').textContent();
  expect(selectedOptionText?.trim()).toBe('SAVINGS');

  // Passo 3: No campo "É necessário um depósito mínimo de $100,00 para transferir da conta",
  // selecione a conta ativa de origem e clique no botão "ABRIR NOVA CONTA"
  // A conta de origem já vem pré-selecionada (primeira conta disponível)
  const fromAccountOptions = await fromAccountSelect.locator('option').count();
  expect(fromAccountOptions).toBeGreaterThanOrEqual(1);

  // Clicar no botão "Open New Account"
  await page.getByRole('button', { name: 'Open New Account' }).click();

  // Validação Passo 3: A página deve ser atualizada exibindo:
  // - Mensagem de sucesso "Account Opened!" (Conta aberta)
  await expect(page.getByText('Account Opened!')).toBeVisible();

  // - O texto "Congratulations, your account is now open." (Parabéns, sua conta agora está aberta.)
  await expect(page.getByText('Congratulations, your account is now open.')).toBeVisible();

  // - O novo número de conta gerado como um link clicável
  const newAccountLink = page.locator('#newAccountId');
  await expect(newAccountLink).toBeVisible();

  // Verificar que o número da conta é um link (âncora) clicável
  const href = await newAccountLink.getAttribute('href');
  expect(href).toBeTruthy();

  // Verificar que o texto do link contém um número (ID da conta)
  const accountIdText = await newAccountLink.textContent();
  expect(accountIdText?.trim()).toMatch(/^\d+$/);
});
