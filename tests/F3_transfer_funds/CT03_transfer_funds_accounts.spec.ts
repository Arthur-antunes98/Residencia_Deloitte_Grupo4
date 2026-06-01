import { test, expect } from '@playwright/test';

test('F3 - CT03: Validar que os seletores de origem e destino carregam as contas ativas do usuário', async ({ page }) => {
  
  // ==========================================
  // PASSO 0: PREPARAÇÃO (Massa de Dados)
  // Registrar o usuário, garantir que ele tenha duas contas para validar o preenchimento, e fazer logout
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

  // Criando uma segunda conta para garantir que o sistema traz as opções corretamente para quem tem múltiplas contas
  await page.getByRole('link', { name: 'Open New Account' }).click();
  await page.waitForTimeout(1000); 
  await page.getByRole('button', { name: 'Open New Account' }).click();
  await expect(page.getByRole('heading', { name: 'Account Opened!' })).toBeVisible();

  // Fazer logout
  await page.getByRole('link', { name: 'Log Out' }).click();

  // ==========================================
  // INÍCIO DO TESTE F3 CT03 REAL
  // ==========================================

  // Pré-condição: Autenticar e acessar a tela de "Transferência de fundos"
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.locator('.smallText')).toContainText('Welcome');

  await page.getByRole('link', { name: 'Transfer Funds' }).click();
  await expect(page.getByRole('heading', { name: 'Transfer Funds' })).toBeVisible();

  // Passo 1: Inspecionar as opções disponíveis nos campos "From account" e "To account"
  // Aguardamos um instante para que a requisição de backend do Angular (AJAX) retorne os números das contas
  await page.waitForTimeout(2000);

  const fromAccountSelect = page.locator('#fromAccountId');
  const toAccountSelect = page.locator('#toAccountId');

  // Validação: Os dois campos devem estar preenchidos/populados automaticamente com as contas 
  // vinculadas ao usuário logado, permitindo a seleção sem falhas ou travamentos.
  
  // Verificamos se existem opções ("options") dentro dos elementos "select"
  const fromOptions = fromAccountSelect.locator('option');
  const toOptions = toAccountSelect.locator('option');

  // O usuário criou duas contas na preparação, portanto esperamos encontrar pelo menos 2 opções populadas
  await expect(fromOptions).toHaveCount(2);
  await expect(toOptions).toHaveCount(2);

  // Verificamos que conseguimos interagir (clicar e selecionar) sem travamentos
  const accountId1 = await fromOptions.nth(0).innerText();
  const accountId2 = await fromOptions.nth(1).innerText();

  // Permite seleção sem falhas (validando que o valor muda conforme selecionamos)
  await fromAccountSelect.selectOption(accountId2);
  await expect(fromAccountSelect).toHaveValue(accountId2);

  await toAccountSelect.selectOption(accountId1);
  await expect(toAccountSelect).toHaveValue(accountId1);
});
