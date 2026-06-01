import { test, expect } from '@playwright/test';

test('F3 - CT05: Transferência entre Contas do Mesmo Usuário validando saldos', async ({ page }) => {
  
  // ==========================================
  // PASSO 0: PREPARAÇÃO (Massa de Dados)
  // Registrar o usuário, criar uma segunda conta e garantir que temos saldo suficiente
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

  // Criando uma segunda conta para ter duas ativas no mesmo perfil
  await page.getByRole('link', { name: 'Open New Account' }).click();
  await page.waitForTimeout(1000); 
  await page.getByRole('button', { name: 'Open New Account' }).click();
  await expect(page.getByRole('heading', { name: 'Account Opened!' })).toBeVisible();

  // Fazer logout para o fluxo autônomo
  await page.getByRole('link', { name: 'Log Out' }).click();

  // ==========================================
  // INÍCIO DO TESTE F3 CT05 REAL
  // ==========================================

  // Pré-condição: Autenticar
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();
  await expect(page.locator('.smallText')).toContainText('Welcome');

  // Passo 1: Verificar o saldo atual das contas antes de iniciar a operação.
  // Como o Parabank exibe os saldos de forma centralizada no Accounts Overview, 
  // capturamos de lá para a validação matemática.
  await page.getByRole('link', { name: 'Accounts Overview' }).click();
  await page.waitForTimeout(1500); // Aguardar carregamento da tabela

  const accountTable = page.locator('table#accountTable');
  await expect(accountTable).toBeVisible();

  // Função auxiliar para capturar o saldo da tabela como número (removendo '$' e vírgulas)
  async function getBalance(accountIndex: number) {
    const row = accountTable.locator('tbody tr').nth(accountIndex);
    const text = await row.locator('td').nth(1).innerText();
    return parseFloat(text.replace(/[^0-9.-]+/g, ""));
  }

  // Função auxiliar para capturar o ID da conta
  async function getAccountId(accountIndex: number) {
    const row = accountTable.locator('tbody tr').nth(accountIndex);
    return await row.locator('td').nth(0).innerText();
  }

  const account1Id = await getAccountId(0);
  const account2Id = await getAccountId(1);
  const initialBalance1 = await getBalance(0);
  const initialBalance2 = await getBalance(1);

  // Acessar a tela "Transfer Funds"
  await page.getByRole('link', { name: 'Transfer Funds' }).click();
  await expect(page.getByRole('heading', { name: 'Transfer Funds' })).toBeVisible();

  // Passo 2: No campo "Amount", inserir um valor válido. Selecionar conta de origem e destino e transferir.
  await page.waitForTimeout(1500); // Aguardar dropdowns carregarem
  const fromAccountSelect = page.locator('#fromAccountId');
  const toAccountSelect = page.locator('#toAccountId');
  
  await fromAccountSelect.selectOption(account1Id);
  await toAccountSelect.selectOption(account2Id);
  
  const transferAmount = 100;
  await page.locator('#amount').fill(transferAmount.toString());
  
  // Clicar no botão "Transfer"
  await page.getByRole('button', { name: 'Transfer' }).click();

  // Validação Passo 2: Sistema processa com sucesso e exibe mensagem
  await expect(page.getByRole('heading', { name: 'Transfer Complete!' })).toBeVisible();

  // Passo 3: Navegar até "Accounts Overview" e validar os saldos das duas contas.
  await page.getByRole('link', { name: 'Accounts Overview' }).click();
  await page.waitForTimeout(1500); // Aguardar atualizar os dados da tabela

  const finalBalance1 = await getBalance(0);
  const finalBalance2 = await getBalance(1);

  // Validação Passo 3: 
  // O saldo da conta de origem deve estar debitado exatamente no valor transferido.
  expect(finalBalance1).toBeCloseTo(initialBalance1 - transferAmount, 2);
  
  // A conta de destino deve apresentar o valor acrescido imediatamente.
  expect(finalBalance2).toBeCloseTo(initialBalance2 + transferAmount, 2);
});
