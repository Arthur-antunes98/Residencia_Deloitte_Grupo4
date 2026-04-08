# 💻 Plano de Testes - ParaBank
## 👨‍💻 Integrantes
- Arthur Antunes  
- Carolina Melo  
- Jarley Miguel  
- Kayki Guilherme  
- Ryan Vitor  

## Nome do Sistema
ParaBank
## Descrição do Sistema 📝
O ParaBank é um sistema bancário online de demonstração que simula o funcinamento de um banco real. Ele permite realizar operações como consulta de contas, tranferências, pagamentos e empréstimos. É usado para aprendizado, testes e validação de sistemas bancários, sem Envolver dinheiro real.
## 🎯 Funcionalidades em Escopo

1. Accounts Overview - Visão Geral da Conta
2. Open New Account - Abrir Conta
3. Transfer Funds
4. Request Loan

## Critérios de Aceite ✅
## Accounts Overview
 # FrontEnd
  - Permite visualizar todas as contas associadas ao usuário autenticado.
  - Permite identificar cada conta de forma única dentro do conjunto apresentado.
  - Permite compreender o saldo e o valor disponível de cada conta exibida.
  - Permite ter uma visão consolidada da posição financeira do usuário.
  - Permite acessar os detalhes de uma conta selecionada, matendo o contexto do sistema.
 # API / BackEnd
  - Permite consultar todas as contas associadas a um cliente a partir de um identificador válido.
  - Retorna dados de contas de forma isolada por cliente, sem mistura de informações.
  - Retorna respostas consistentes e previsíveis, mesmo quando não existem contas associadas.
  - Não expõe dados de contas não pertencentes ao cliente informado.
 ## Open New Account 
  # FrontEnd
  - Permite iniciar a abertura de uma nova conta para um usuário autenticado.
  - Exige a definição do tipo de conta e de uma conta de origem para o depósito inicial.
  - Não permite prosseguir sem as informações mínimas necessárias.
  - Comunica ao usuário o resultado da tentativa da abertura de conta.
  - Mantém o acesso contínuo às demais funcionalidades após a operação.
  # API / BackEnd
  - Permite criar uma nova conta vinculada a um cliente existente.
  - Exige cliente, tipo de conta e conta de origem válidos para processar a criação.
  - Não cria contas quando informações obrigatórias estão ausentes ou inválidas.
  - Em caso de sucesso, a nova conta passa a fazer parte do conjunto de contas do cliente.
  - Em caso de erro, não gera efeitos colaterais parciais sobre contas exigentes.

# Funcionalidades Fora do Escopo
