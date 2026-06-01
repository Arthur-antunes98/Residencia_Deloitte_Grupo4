import { test, expect } from '@playwright/test';

test('F4 - CT02: Impedir submissão do formulário de empréstimo com campos em branco', async ({ page }) => {
  
  // ==========================================
  // PASSO 0: PREPARAÇÃO
  // Registrar o usuário para garantir que ele possui conta ativa
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

  // ==========================================
  // INÍCIO DO TESTE F4 CT02 REAL
  // ==========================================

  // Pré-condição: O usuário deve estar na página de formulário do "Request Loan".
  await page.getByRole('link', { name: 'Request Loan' }).click();
  await expect(page.getByRole('heading', { name: 'Apply for a Loan' })).toBeVisible();

  // Passo 1: Deixar os campos "Loan Amount" e "Down Payment" totalmente vazios.
  const amountInput = page.locator('#amount');
  const downPaymentInput = page.locator('#downPayment');
  
  // Limpando os campos apenas para garantir (apesar de já virem vazios)
  await amountInput.clear();
  await downPaymentInput.clear();

  // Validação Passo 1: Os campos permanecem sem nenhum dado inserido.
  await expect(amountInput).toHaveValue('');
  await expect(downPaymentInput).toHaveValue('');

  // Passo 2: Clicar no botão "Apply Now".
  await page.getByRole('button', { name: 'Apply Now' }).click();

  // Validação Passo 2: O sistema falha ao processar a requisição devido à ausência de dados,
  // exibindo uma mensagem de erro interno (falha do backend, característica do ParaBank)
  // ou comportamentos inesperados. Validamos que uma mensagem .error aparece ou o aproved não renderiza.
  await page.waitForTimeout(1500); // Aguardar resposta do backend

  // Verificamos se uma mensagem de erro genérica do servidor aparece na tela
  // O Playwright localizou 2 .error na tela, vamos ser específicos filtrando pela mensagem real de crash do backend
  const errorMessage = page.locator('.error').filter({ hasText: /An internal error/i }).first();
  await expect(errorMessage).toBeVisible();

  // E garantimos que o container de "Aprovado" NUNCA foi renderizado pelo Angular
  const approvedSection = page.locator('#loanRequestApproved');
  await expect(approvedSection).toBeHidden();
});
