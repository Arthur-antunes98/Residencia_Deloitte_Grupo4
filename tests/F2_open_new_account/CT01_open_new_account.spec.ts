import { test, expect } from '@playwright/test';

test('F2 - CT01: Permite iniciar a abertura de uma nova conta para um usuário autenticado', async ({ page }) => {
  
  // ==========================================
  // PASSO 0: PREPARAÇÃO (Massa de Dados)
  // Registrar o usuário para garantir que ele existe
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

  // Fazer logout para testar o fluxo completo de login
  await page.getByRole('link', { name: 'Log Out' }).click();

  // ==========================================
  // INÍCIO DO TESTE F2 CT01 REAL
  // ==========================================

  // Pré-condição: O usuário deve estar na página inicial do ParaBank
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');

  // Passo 1: Insira as credenciais válidas nos campos de login e clique no botão "Log In"
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();

  // Validação Passo 1: O usuário é autenticado com sucesso e a página de visão geral
  // da conta (Visão geral das contas) é exibida
  await expect(page.locator('.smallText')).toContainText('Welcome');
  await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();

  // Passo 2: Clique na opção "Abrir Nova Conta" (Open New Account) localizada no menu lateral esquerdo
  await page.getByRole('link', { name: 'Open New Account' }).click();

  // Validação Passo 2: O sistema redireciona o usuário para a página de abertura de conta,
  // exibindo as opções iniciais do formulário
  await expect(page.getByRole('heading', { name: 'Open New Account' })).toBeVisible();

  // Verificar que o formulário de abertura de conta está presente com seus campos
  // Dropdown de tipo de conta (CHECKING / SAVINGS)
  const accountTypeSelect = page.locator('#type');
  await expect(accountTypeSelect).toBeVisible();

  // Dropdown de conta de origem (From Account)
  const fromAccountSelect = page.locator('#fromAccountId');
  await page.waitForTimeout(1000); // Aguardar o Angular carregar as contas
  await expect(fromAccountSelect).toBeVisible();

  // Botão de "Open New Account"
  await expect(page.getByRole('button', { name: 'Open New Account' })).toBeVisible();

  // Verificar que as opções de tipo de conta estão disponíveis
  const options = accountTypeSelect.locator('option');
  const optionCount = await options.count();
  expect(optionCount).toBeGreaterThanOrEqual(2); // CHECKING e SAVINGS no mínimo
});
