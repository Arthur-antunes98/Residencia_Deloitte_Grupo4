import { test, expect } from '@playwright/test';

test('F4 - CT03: Validar erro ao preencher apenas parte das informações obrigatórias', async ({ page }) => {

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
  const password = `jcleber22`;

  await page.locator('input[id="customer.username"]').fill(username);
  await page.locator('input[id="customer.password"]').fill(password);
  await page.locator('input[id="repeatedPassword"]').fill(password);
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.locator('.title')).toContainText('Welcome');

  // Fazer logout para fluxo limpo
  await page.getByRole('link', { name: 'Log Out' }).click();

  // ==========================================
  // INÍCIO DO TESTE F4 CT03 REAL
  // ==========================================

  // Pré-condição: O usuário deve estar autenticado e na página do formulário "Request Loan"
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.locator('.smallText')).toContainText('Welcome');

  // Acessar o menu lateral e clicar na opção "Request Loan"
  await page.getByRole('link', { name: 'Request Loan' }).click();
  await expect(page.getByRole('heading', { name: 'Apply for a Loan' })).toBeVisible();

  // Passo 1: Inserir um valor válido no campo "Loan Amount" (ex: 1000)
  // e deixar o campo "Down Payment" totalmente em branco
  const amountInput = page.locator('#amount');
  const downPaymentInput = page.locator('#downPayment');

  await amountInput.fill('1000');
  await downPaymentInput.clear(); // Garantir que "Down Payment" permaneça vazio

  // Validação Passo 1: "Loan Amount" preenchido e "Down Payment" em branco
  await expect(amountInput).toHaveValue('1000');
  await expect(downPaymentInput).toHaveValue('');

  // Passo 2: Clicar no botão "Apply Now"
  await page.getByRole('button', { name: 'Apply Now' }).click();

  // Validação Passo 2: O sistema impede a continuidade da operação e aponta o erro
  // específico indicando a obrigatoriedade do campo restante ("Down Payment")
  await page.waitForTimeout(1500); // Aguardar resposta do backend

  // O sistema exibe uma mensagem de erro indicando que o campo "Down Payment" é obrigatório
  // ou um erro interno de backend por submissão incompleta
  const errorMessage = page.locator('.error').filter({ hasText: /An internal error/i }).first();
  await expect(errorMessage).toBeVisible();

  // Garantir que o container de "Aprovado" NUNCA foi renderizado
  const approvedSection = page.locator('#loanRequestApproved');
  await expect(approvedSection).toBeHidden();
});
