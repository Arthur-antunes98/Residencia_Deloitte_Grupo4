import { test, expect } from '@playwright/test';

test('F4 - CT04: Verificar exibição de detalhes e status do resultado do empréstimo', async ({ page }) => {

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
  // INÍCIO DO TESTE F4 CT04 REAL
  // ==========================================

  // Pré-condição: O usuário deve estar posicionado na página de formulário do "Request Loan"
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.locator('.smallText')).toContainText('Welcome');

  await page.getByRole('link', { name: 'Request Loan' }).click();
  await expect(page.getByRole('heading', { name: 'Apply for a Loan' })).toBeVisible();

  // Passo 1: Preencher todos os campos obrigatórios corretamente
  await page.locator('#amount').fill('100');
  await page.locator('#downPayment').fill('10');

  // Aguardar carregamento das contas no select e selecionar a primeira disponível
  await page.waitForTimeout(1000);
  const fromAccountSelect = page.locator('#fromAccountId');
  const sourceAccountId = await fromAccountSelect.locator('option').first().innerText();
  await fromAccountSelect.selectOption(sourceAccountId);

  // Passo 2: Submeter a requisição clicando em "Apply Now"
  await page.getByRole('button', { name: 'Apply Now' }).click();

  // Aguardar processamento do backend
  await page.waitForTimeout(2000);

  // ==========================================
  // VALIDAÇÕES DO THEN
  // ==========================================

  // Validação 1: O resultado é renderizado na área central — cabeçalho "Loan Request Processed" visível
  await expect(page.getByRole('heading', { name: 'Loan Request Processed' })).toBeVisible();

  // Validação 2: A seção de resultado (aprovado ou negado) está presente na área de conteúdo
  const approvedSection = page.locator('#loanRequestApproved');
  const deniedSection = page.locator('#loanRequestDenied');
  const resultRendered = (await approvedSection.isVisible()) || (await deniedSection.isVisible());
  expect(resultRendered).toBeTruthy();

  // Validação 3: O cabeçalho do sistema permanece intacto e visível (logo e área superior)
  // #topPanel contém o logo e #headerPanel contém a barra de navegação superior
  await expect(page.locator('#topPanel')).toBeVisible();
  await expect(page.locator('img.logo')).toBeVisible();
  await expect(page.locator('#headerPanel')).toBeVisible();

  // Validação 4: Os menus de navegação laterais permanecem intactos e totalmente visíveis
  // #leftPanel é o painel lateral esquerdo com os links de navegação do usuário logado
  const leftPanel = page.locator('#leftPanel');
  await expect(leftPanel).toBeVisible();
  await expect(leftPanel.getByRole('link', { name: 'Open New Account' })).toBeVisible();
  await expect(leftPanel.getByRole('link', { name: 'Accounts Overview' })).toBeVisible();
  await expect(leftPanel.getByRole('link', { name: 'Transfer Funds' })).toBeVisible();
  await expect(leftPanel.getByRole('link', { name: 'Bill Pay' })).toBeVisible();
  await expect(leftPanel.getByRole('link', { name: 'Find Transactions' })).toBeVisible();
  await expect(leftPanel.getByRole('link', { name: 'Update Contact Info' })).toBeVisible();
  await expect(leftPanel.getByRole('link', { name: 'Request Loan' })).toBeVisible();
  await expect(leftPanel.getByRole('link', { name: 'Log Out' })).toBeVisible();
});
