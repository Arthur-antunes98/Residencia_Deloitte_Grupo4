# 💻 Plano de Testes - ParaBank
## 👨‍💻👩‍💻 Integrantes
- Arthur Antunes  
- Carolina Melo  
- Jarley Miguel  
- Kayki Guilherme  
- Ryan Vitor  

# Nome do Sistema
ParaBank

# Descrição do Sistema 📝
O ParaBank é um sistema bancário online de demonstração que simula o funcionamento de um banco real. Ele permite realizar operações como consulta de contas, transferências, pagamentos e empréstimos. É usado para aprendizado, testes e validação de sistemas bancários, sem Envolver dinheiro real.

# 🎯 Funcionalidades em Escopo

1. Accounts Overview - Visão Geral da Conta
2. Open New Account - Abrir Nova Conta
3. Transfer Funds - Transferir Fundos
4. Request Loan - Solicitar Empréstimo

# Critérios de Aceite ✅

## Accounts Overview
 ### FrontEnd
  - Permite visualizar todas as contas associadas ao usuário autenticado.
  - Permite identificar cada conta de forma única dentro do conjunto apresentado.
  - Permite compreender o saldo e o valor disponível de cada conta exibida.
  - Permite ter uma visão consolidada da posição financeira do usuário.
  - Permite acessar os detalhes de uma conta selecionada, matendo o contexto do sistema.
 ### API / BackEnd
  - Permite consultar todas as contas associadas a um cliente a partir de um identificador válido.
  - Retorna dados de contas de forma isolada por cliente, sem mistura de informações.
  - Retorna respostas consistentes e previsíveis, mesmo quando não existem contas associadas.
  - Não expõe dados de contas não pertencentes ao cliente informado.
    
 ## Open New Account 
  ### FrontEnd
  - Permite iniciar a abertura de uma nova conta para um usuário autenticado.
  - Exige a definição do tipo de conta e de uma conta de origem para o depósito inicial.
  - Não permite prosseguir sem as informações mínimas necessárias.
  - Comunica ao usuário o resultado da tentativa da abertura de conta.
  - Mantém o acesso contínuo às demais funcionalidades após a operação.
  ### API / BackEnd
  - Permite criar uma nova conta vinculada a um cliente existente.
  - Exige cliente, tipo de conta e conta de origem válidos para processar a criação.
  - Não cria contas quando informações obrigatórias estão ausentes ou inválidas.
  - Em caso de sucesso, a nova conta passa a fazer parte do conjunto de contas do cliente.
  - Em caso de erro, não gera efeitos colaterais parciais sobre contas exigentes.
    
## Transfer Funds
 ### FrontEnd
 - Permite transferir valores entre contas pertencentes ao usuário  autenticado.
 - Exige valor, conta de origem e conta de destino para realizar a operação.
 - Não permite a execução da transferÊncia sem informações essenciais.
 - Comunica o resultado da tentativa de transferência ao usuário.
 - Mantém o contexto de navegação do sistema após a operação.
 ### API / BackEnd
 - Permite registrar uma transação de transferência entre contas válidas.
 - Garante que as contas envolvidas pertencem ao mesmo cliente.
 - Registra a transferência de forma atÔmica, sem estados intermediários inconsistentes.
 - Em caso de erro, não altera saldos nem cria transações parciais.
 - Retorna resposta coerente com o resultado da operação.
   
## Request Loan
 ### FrontEnd
 - Permite ao usuário solicitar um empréstimo associado à sua conta.
 - Exige valor do empréstimo, valor de entrada e conta de origem.
 - Não permite a submissão da solicitação sem as informações necessárias.
 - Apresenta ao usuário o resultado da solicitação dentro do próprio fluxo.
 - Mantém o uso contínuo do sistema após a solicitação.
 ### API / BeckEnd
 - Permite registrar solicitações de empréstimos para clientes existentes.
 - Exige cliente, valores e conta de origem válidos.
 - Retorna de forma clara o resultado da solicitação (processada ou não).
 - Em caso de sucesso, gera um empréstimo vinculado ao cliente e à conta.
 - Em caso de erro, não provoca alterações parciais em dados finaceiros.
   
# 🚫 Funcionalidades Fora do Escopo
 - Integração com sistemas bancários reais
 - Processamento financeiro real
 - Testes de segurança avançada
 - Testes de performance em larga escala
 - Funcionalidades não descritas no escopo do sistema
 - Envio de notificações reais (e-mail/SMS)
 - Análise de crédito real para empréstimos

# Estratégia de Testes 🧪
  Descreva, de forma resumida: 
  - Qual o objetivo dos testes.
  - quais tipos ou níveis de teste serão considerados
  - Quais ferramentas podem ser utilizadas

# ⚠️ Premissas e Riscos
 ## Premissas

 ## Riscos

# Gerenciamento do Projeto 📊
 ## Metodologia
  - Abordagem: Metodologia ágil - Scrum
  - Ferramenta de controle: Trello

 ## Organização em Sprints
  Descrever como o projeto será divido em sprints
  considere informar: 
  - quais sprints compõe o projeto
  -  a duração de cada sprint
  -  as funcionalidades ou focos primncipais de cada sprint

# 📅 Cronograma
  - Data de início do projeto: 23/04/2026
  - Data prevista de encerramento: 04/06/2026
