import { test, expect } from '@playwright/test';

test('F3 - CT02: Comunica o resultado da tentativa de transferência ao usuário', async ({ page }) => {
  
  // ==========================================
  // PASSO 0: PREPARAÇÃO (Massa de Dados)
  // Registrar o usuário, garantir que ele tenha duas contas para a transferência e fazer logout
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

  // Para transferir, precisamos de pelo menos duas contas.
  // O usuário recém-registrado tem apenas uma. Vamos abrir uma nova conta.
  await page.getByRole('link', { name: 'Open New Account' }).click();
  await page.waitForTimeout(1000); // Aguardar carregamento Angular
  await page.getByRole('button', { name: 'Open New Account' }).click();
  await expect(page.getByRole('heading', { name: 'Account Opened!' })).toBeVisible();

  // Fazer logout para iniciar o fluxo limpo de autenticação
  await page.getByRole('link', { name: 'Log Out' }).click();

  // ==========================================
  // INÍCIO DO TESTE F3 CT02 REAL
  // ==========================================

  // Pré-condição: O usuário deve estar autenticado e na tela de Transferência
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.locator('.smallText')).toContainText('Welcome');

  await page.getByRole('link', { name: 'Transfer Funds' }).click();
  await expect(page.getByRole('heading', { name: 'Transfer Funds' })).toBeVisible();

  // Aguardar um momento para o Angular carregar as contas nos dropdowns
  await page.waitForTimeout(2000);

  const amountInput = page.locator('#amount');
  const fromAccountSelect = page.locator('#fromAccountId');
  const toAccountSelect = page.locator('#toAccountId');

  // Passo 1: Selecionar uma conta de origem e uma de destino válidas e diferentes.
  // Pegamos as opções disponíveis.
  const fromOptions = fromAccountSelect.locator('option');
  await expect(fromOptions).toHaveCount(2);

  const account1 = await fromOptions.nth(0).innerText();
  const account2 = await fromOptions.nth(1).innerText();

  // Selecionando conta1 como origem e conta2 como destino
  await fromAccountSelect.selectOption(account1);
  await toAccountSelect.selectOption(account2);

  // Validação Passo 1: Os campos aceitam a seleção e exibem as contas escolhidas
  await expect(fromAccountSelect).toHaveValue(account1);
  await expect(toAccountSelect).toHaveValue(account2);

  // Passo 2: Informar um valor numérico válido (ex: 100)
  const transferAmount = '100';
  await amountInput.fill(transferAmount);

  // Validação Passo 2: O valor é preenchido e formatado corretamente
  await expect(amountInput).toHaveValue(transferAmount);

  // Passo 3: Clicar no botão para confirmar/finalizar a transferência
  await page.getByRole('button', { name: 'Transfer' }).click();

  // Validação Passo 3: O sistema processa e exibe mensagem de sucesso legível,
  // detalhando valor transferido e as contas envolvidas.
  await expect(page.getByRole('heading', { name: 'Transfer Complete!' })).toBeVisible();
  
  // A mensagem no Parabank tem o formato: "$100.00 has been transferred from account #XXXXX to account #YYYYY."
  // Validamos se o texto contém o valor e as duas contas
  const successMessage = page.getByText('has been transferred from account');
  await expect(successMessage).toBeVisible();
  await expect(successMessage).toContainText(account1);
  await expect(successMessage).toContainText(account2);
});
