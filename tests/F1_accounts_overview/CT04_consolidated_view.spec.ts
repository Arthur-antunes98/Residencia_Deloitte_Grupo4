import { test, expect } from '@playwright/test';

test('F1 - CT04: Permite ter uma visão consolidada da posição financeira do usuário', async ({ page }) => {
  
  // ==========================================
  // PASSO 0: PREPARAÇÃO (Massa de Dados)
  // Registrar o usuário e garantir que ele possua MAIS DE UMA conta ativa
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
  await expect(page.locator('.title')).toContainText('Welcome');

  // Criar uma SEGUNDA conta para satisfazer a pré-condição (mais de uma conta ativa)
  await page.getByRole('link', { name: 'Open New Account' }).click();
  await page.waitForTimeout(1500); // Aguardar o formulário carregar

  // Selecionar tipo de conta (SAVINGS para variar da conta corrente padrão)
  await page.locator('#type').selectOption('1'); // 1 = SAVINGS
  await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Open New Account' }).click();

  // Confirmar que a segunda conta foi criada
  await expect(page.getByText('Congratulations, your account is now open.')).toBeVisible();

  // ==========================================
  // INÍCIO DO TESTE CT04 REAL
  // ==========================================

  // Passo 1: No menu lateral esquerdo, clique na opção "Visão Geral das Contas"
  await page.getByRole('link', { name: 'Accounts Overview' }).click();

  // Validação Passo 1: A página deve ser carregada corretamente exibindo o título "Visão Geral das Contas"
  await expect(page.getByRole('heading', { name: 'Accounts Overview' })).toBeVisible();

  // Passo 2: Validar a exibição da tabela principal com o resumo das contas
  const accountTable = page.locator('table#accountTable');
  await page.waitForTimeout(1500); // Aguardar o Angular carregar as contas

  // Validação Passo 2: O sistema deve listar todas as contas de forma unificada,
  // exibindo o número da conta, o saldo ("Balance") e o valor disponível ("Available Amount")
  await expect(accountTable).toBeVisible();

  // Verificar que existem pelo menos 2 contas (pré-condição: mais de uma conta ativa)
  // Filtra apenas linhas que possuem um link (contas reais), excluindo a linha de Total
  const accountRows = accountTable.locator('tbody tr').filter({ has: page.locator('a') });
  const rowCount = await accountRows.count();
  expect(rowCount).toBeGreaterThanOrEqual(2);

  // Verificar que cada linha exibe o número da conta, saldo e valor disponível
  for (let i = 0; i < rowCount; i++) {
    const row = accountRows.nth(i);
    // Cada linha deve ter um link (número da conta)
    await expect(row.locator('a')).toBeVisible();
    // Cada linha deve exibir valores monetários (saldo e valor disponível)
    const rowText = await row.textContent();
    expect(rowText).toContain('$');
  }

  // Passo 3: Analisar a última linha da tabela identificada como "Total"
  // Validação Passo 3: O sistema deve exibir uma linha de fechamento apresentando
  // o somatório total de todas as contas, permitindo que o usuário visualize
  // de forma centralizada e consolidada toda a sua posição financeira atual.
  const totalRow = accountTable.locator('tfoot tr, tbody tr').filter({ hasText: 'Total' });
  await expect(totalRow).toBeVisible();
  await expect(totalRow).toContainText('$');

  // Coletar os saldos individuais de cada conta e somar
  const individualBalances: number[] = [];
  for (let i = 0; i < rowCount; i++) {
    const row = accountRows.nth(i);
    // A segunda coluna (índice 1) contém o saldo ("Balance")
    const balanceCell = row.locator('td').nth(1);
    const balanceText = await balanceCell.textContent();
    // Converter "$1,234.56" para número: remover $, vírgulas e converter
    const balance = parseFloat(balanceText!.replace(/[$,]/g, ''));
    individualBalances.push(balance);
  }

  // Somar todos os saldos individuais
  const expectedTotal = individualBalances.reduce((sum, val) => sum + val, 0);

  // Pegar o valor do "Total" exibido na tabela
  const totalText = await totalRow.locator('td').filter({ hasText: '$' }).first().textContent();
  const displayedTotal = parseFloat(totalText!.replace(/[$,]/g, ''));

  // Validar que o total exibido é igual à soma dos saldos individuais
  // (usando toBeCloseTo para evitar problemas de arredondamento com ponto flutuante)
  expect(displayedTotal).toBeCloseTo(expectedTotal, 2);
});
