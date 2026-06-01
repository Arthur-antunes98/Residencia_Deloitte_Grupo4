import { test, expect } from '@playwright/test';

test('F3 - CT01: Validar o carregamento correto e a exibição dos elementos na tela Transfer Funds', async ({ page }) => {
  
  // ==========================================
  // PASSO 0: PREPARAÇÃO (Massa de Dados)
  // Registrar o usuário para garantir que ele existe e fazer login
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

  // Fazer logout para iniciar o fluxo limpo de autenticação
  await page.getByRole('link', { name: 'Log Out' }).click();

  // ==========================================
  // INÍCIO DO TESTE F3 CT01 REAL
  // ==========================================

  // Pré-condição: O usuário deve estar autenticado no sistema
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.locator('.smallText')).toContainText('Welcome');

  // Passo 1: Clicar no menu ou acessar diretamente a URL da funcionalidade "Transfer Funds"
  await page.getByRole('link', { name: 'Transfer Funds' }).click();

  // Validação: A página deve carregar completamente (título "Transfer Funds" visível)
  await expect(page.getByRole('heading', { name: 'Transfer Funds' })).toBeVisible();

  // Aguardar um momento para o Angular carregar as contas nos dropdowns
  await page.waitForTimeout(1500);

  // Validação: Os campos "Amount" (Valor), "From account" (Origem), "To account" (Destino) 
  // e o botão "TRANSFER" devem estar visíveis e prontos para interação.
  
  const amountInput = page.locator('#amount');
  await expect(amountInput).toBeVisible();
  await expect(amountInput).toBeEnabled();

  const fromAccountSelect = page.locator('#fromAccountId');
  await expect(fromAccountSelect).toBeVisible();
  await expect(fromAccountSelect).toBeEnabled();

  const toAccountSelect = page.locator('#toAccountId');
  await expect(toAccountSelect).toBeVisible();
  await expect(toAccountSelect).toBeEnabled();

  const transferButton = page.getByRole('button', { name: 'Transfer' });
  await expect(transferButton).toBeVisible();
  await expect(transferButton).toBeEnabled();
});
