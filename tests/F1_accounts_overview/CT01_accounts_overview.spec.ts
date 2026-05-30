import { test, expect } from '@playwright/test';

test('F1 CT01: Permite visualizar todas as contas associadas ao usuário autenticado', async ({ page }) => {
  
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
  
  // Mantendo o sufixo aleatório para garantir que o teste nunca quebre por "usuário já existe"
  const randomSuffix = Math.floor(Math.random() * 10000).toString();
  const username = `jcleber22_${randomSuffix}`;
  const password = `33`;
  
  await page.locator('input[id="customer.username"]').fill(username);
  await page.locator('input[id="customer.password"]').fill(password);
  await page.locator('input[id="repeatedPassword"]').fill(password);
  await page.getByRole('button', { name: 'Register' }).click();
  
  // Esperar o registro concluir (a tela Welcome aparece)
  await expect(page.locator('.title')).toContainText('Welcome');
  
  // Fazer logout para podermos testar o fluxo exato de Login do CT01
  await page.getByRole('link', { name: 'Log Out' }).click();

  // ==========================================
  // INÍCIO DO TESTE CT01 REAL
  // ==========================================

  // Pré-condição: Acessar a página do ParaBank
  await page.goto('https://parabank.parasoft.com/parabank/index.htm');

  // Passo 1: Inserir o nome de usuário e a senha e clicar em "Log In"
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.getByRole('button', { name: 'Log In' }).click();

  // Validação do Passo 1: Mensagem de boas-vindas
  await expect(page.locator('.smallText')).toContainText('Welcome');

  // Passo 2: Clicar na opção "Accounts Overview" no menu lateral
  await page.getByRole('link', { name: 'Accounts Overview' }).click();

  // Validação do Passo 2: Título "Accounts Overview"
  await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();

  // Passo 3: Validar a exibição das linhas da tabela de contas
  const accountTable = page.locator('table#accountTable');
  await expect(accountTable).toBeVisible();

  // Validação do Passo 3: Verificar se o formato consolidado (linhas) e o somatório (Total) existem
  await page.waitForTimeout(1500); // Aguardar as contas serem carregadas pelo sistema (Angular)
  const accountRows = accountTable.locator('tr').filter({ hasText: '$' }); // Pega as linhas que mostram valores em dinheiro
  await expect(accountRows.first()).toBeVisible(); // Garante que pelo menos uma conta é listada
  
  // Validar a existência da linha de "Total" no rodapé
  await expect(accountTable).toContainText('Total');
});
