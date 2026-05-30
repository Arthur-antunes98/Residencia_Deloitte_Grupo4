import { test, expect } from '@playwright/test';

test('F1 - CT03: Permite visualizar conta do usuário', async ({ page }) => {
  
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
  const password = `33`;
  
  await page.locator('input[id="customer.username"]').fill(username);
  await page.locator('input[id="customer.password"]').fill(password);
  await page.locator('input[id="repeatedPassword"]').fill(password);
  await page.getByRole('button', { name: 'Register' }).click();
  await expect(page.locator('.title')).toContainText('Welcome', { timeout: 15000 });

  // Após o registro, o usuário já está logado e uma conta é criada automaticamente.

  // ==========================================
  // INÍCIO DO TESTE CT03 REAL
  // ==========================================

  // Passo 1: No menu lateral esquerdo, clique na opção "Visão Geral das Contas"
  await page.getByRole('link', { name: 'Accounts Overview' }).click();

  // Validação Passo 1: A página deve ser fornecida corretamente exibindo o título "Visão Geral das Contas"
  await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();

  // Passo 2: Visualize uma tabela de contas na tela principal
  const accountTable = page.locator('table#accountTable');
  await page.waitForTimeout(1500); // Aguardar o Angular carregar as contas

  // Validação Passo 2: A tabela deve listar corretamente todas as contas do usuário,
  // exibindo as colunas "Account", "Balance" e "Available Amount", além da linha final com o "Total"
  await expect(accountTable).toBeVisible();

  // Verificar cabeçalhos da tabela (colunas)
  const tableHeader = accountTable.locator('thead');
  await expect(tableHeader).toContainText('Account');
  await expect(tableHeader).toContainText('Balance');
  await expect(tableHeader).toContainText('Available Amount');

  // Verificar que pelo menos uma conta é listada na tabela
  const accountRows = accountTable.locator('tbody tr').filter({ hasText: '$' });
  await expect(accountRows.first()).toBeVisible();

  // Verificar a existência da linha de "Total" no rodapé da tabela
  await expect(accountTable).toContainText('Total');

  // Passo 3: Verifique se os números das contas na coluna "Conta" são links clicáveis
  // Os números das contas devem ser exibidos como links (âncoras), permitindo o clique
  // para direcionar aos detalhes de cada conta
  const accountLinks = accountTable.locator('tbody tr a');
  
  // Verificar que existe pelo menos um link de conta
  const linkCount = await accountLinks.count();
  expect(linkCount).toBeGreaterThan(0);

  // Para cada link encontrado, validar que:
  // 1) É visível na página
  // 2) Possui um atributo href válido (ou seja, é um link clicável de verdade)
  // 3) O texto do link contém um número (ID da conta)
  for (let i = 0; i < linkCount; i++) {
    const link = accountLinks.nth(i);
    await expect(link).toBeVisible();

    // Verifica que o link possui um href (é uma âncora clicável)
    const href = await link.getAttribute('href');
    expect(href).toBeTruthy();
    expect(href).toContain('activity.htm'); // Links de conta apontam para a página de atividade

    // Verifica que o texto do link é um número (ID da conta)
    const text = await link.textContent();
    expect(text?.trim()).toMatch(/^\d+$/);
  }

  // Validação extra: clicar no primeiro link e confirmar que redireciona para os detalhes
  const firstLink = accountLinks.first();
  const accountIdText = await firstLink.textContent();
  await firstLink.click();

  // Deve redirecionar para a página "Account Details", confirmando que o link é funcional
  await expect(page.getByRole('heading', { name: 'Account Details' })).toBeVisible();
  await expect(page.locator('#accountId')).toHaveText(accountIdText as string);
});
