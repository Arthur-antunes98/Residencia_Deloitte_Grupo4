import { test, expect } from '@playwright/test';

test('F4 - CT01: Validar solicitação de empréstimo com dados válidos', async ({ page }) => {
  
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
  // INÍCIO DO TESTE F4 CT01 REAL
  // ==========================================

  // Pré-condição: O usuário deve estar logado no sistema
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.locator('.smallText')).toContainText('Welcome');

  // Passo 1: Acessar o menu lateral e clicar na opção "Request Loan"
  await page.getByRole('link', { name: 'Request Loan' }).click();

  // Validação Passo 1: A página deve carregar exibindo o formulário e os campos obrigatórios
  await expect(page.getByRole('heading', { name: 'Apply for a Loan' })).toBeVisible();
  await expect(page.locator('#amount')).toBeVisible();
  await expect(page.locator('#downPayment')).toBeVisible();
  await expect(page.locator('#fromAccountId')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Apply Now' })).toBeVisible();

  // Passo 2: Preencher o formulário com dados válidos e clicar em "Apply Now"
  // Dados super conservadores para garantir aprovação: Loan Amount: 100, Down Payment: 10
  await page.locator('#amount').fill('100');
  await page.locator('#downPayment').fill('10');

  // Para garantir que a conta de origem seja carregada no menu suspenso pelo Angular
  const fromAccountSelect = page.locator('#fromAccountId');
  await page.waitForTimeout(1000); 
  const sourceAccountId = await fromAccountSelect.locator('option').first().innerText();
  await fromAccountSelect.selectOption(sourceAccountId);

  // Clicar no botão Apply Now
  await page.getByRole('button', { name: 'Apply Now' }).click();

  // Validação Passo 2: O sistema processa a requisição e exibe a seção de confirmação do empréstimo
  await page.waitForTimeout(2000);

  // Passo 3: Validar as informações do empréstimo processado na tela
  // Mensagem "Loan Request Processed"
  await expect(page.getByRole('heading', { name: 'Loan Request Processed' })).toBeVisible();

  // Status "Approved"
  // Se estiver escondido, significa que o empréstimo foi negado. Vamos tentar capturar o erro:
  const isDenied = await page.locator('#loanRequestDenied').isVisible();
  if (isDenied) {
    const errorMsg = await page.locator('#loanRequestDenied').innerText();
    console.error('EMPRÉSTIMO FOI NEGADO PELO PARABANK:', errorMsg);
  }

  // Aguardamos até que a palavra 'Approved' fique visível na tela
  // O Playwright achou 2 elementos com a palavra "Approved". Vamos usar strict com getByText('Approved', { exact: true })
  const approvedText = page.getByText('Approved', { exact: true });
  await expect(approvedText).toBeVisible({ timeout: 10000 });

  // Link com o número da nova conta criada
  const newAccountLink = page.locator('#newAccountId');
  await expect(newAccountLink).toBeVisible();
  
  // Garantir que o texto gerado possui um número e não está vazio
  await expect(newAccountLink).not.toBeEmpty();
  const newAccountIdText = await newAccountLink.innerText();
  expect(newAccountIdText.trim()).toMatch(/^\d+$/); // Verifica se o ID é numérico
});
