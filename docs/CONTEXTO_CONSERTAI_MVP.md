# Consertaí — Contexto do projeto e do MVP (para o agente que vai continuar o site)

> Leia tudo antes de mexer em qualquer coisa. O objetivo é **melhorar o MVP já existente (`index.html`)** e deixá-lo pronto para entrega e apresentação, sem quebrar o que já funciona.

## 1. Situação e prazos

- Projeto de faculdade (curso de Sistemas de Informação, USP). Mesma entrega vale para **Empreendedorismo** e **RP II (Resolução de Problemas)**, da mesma professora.
- Grupo: **Diego Aguiar, Luis Gustavo Cerqueira e Mateus de Sales**.
- **Entrega no Classroom: 04/11/2026 (hoje).** Apresentação provavelmente **quinta-feira (05/11)**; o comunicado da professora também cita 08/11 para entrega do MVP e 09/11 para apresentação parcial. Trate **hoje** como o prazo real.
- Linguagem do produto e dos textos: **português do Brasil**.

## 2. O que é o Consertaí

**Marketplace hiperlocal de serviços domésticos** (eletricista, encanador, diarista, pintor, montador), com dois lados: moradores que contratam e prestadores autônomos.

**Problema (validado em 5 entrevistas semiestruturadas, simuladas; 4 hipóteses, todas confirmadas):**
- **Morador:** medo de colocar um desconhecido dentro de casa, preço sem transparência, profissional que some ou muda o valor no final.
- **Prestador:** renda instável, dependência de indicação, orçamentos que não fecham, plataformas que cobram comissão alta ou cobram para entregar contatos.
- Hoje os dois usam grupos de bairro (WhatsApp/Facebook), que são bagunçados e viram "leilão de preço".

**Solução:** app de hiperlocalidade em formato de **"Vitrine de Reputação"**. O profissional só entra com o **Selo de Confiança** (checagem de antecedentes criminais + entrevista em vídeo, feitas pelo Consertaí). O perfil mostra foto, nome, selo e avaliações; o **preço é calculado pelo app e mostrado antes de contratar**; sem leilão de contatos.

**Proposta de valor:**
- Morador: paz de espírito (a segurança da indicação de um amigo, com a agilidade de um app).
- Prestador: valorização e estabilidade (reputação construída, agenda cheia perto de casa, sem pagar para receber contatos).

**Personas:**
- **Mariana, 34:** trabalha fora, mora de aluguel, sem tempo, medo de ser enganada.
- **Carlos, 42:** carpinteiro autônomo, vive de indicação, renda instável, desconfia de comissão abusiva.

## 3. O que o grupo aprendeu (experimento anterior, resultado "parcialmente confirmado")

- 2 prestadores toparam participar, mas com ressalvas (comissão e segurança dos documentos; um pediu contato por telefone).
- Dos 3 clientes, só 1 aceitou avançar com dados básicos; 1 exigiu **foto e avaliações**; 1 aceitou testar sem compromisso fixo por receio de **aumento de preço**.
- Decisão: **modificar** a solução. Perfil com foto/nome/selo/avaliações em destaque, regras de preço e **comissão transparentes desde o cadastro**, cadastro de prestador com opção de contato humano (telefone).

## 4. O que a professora cobra nesta atividade (texto do Classroom + comunicado)

Desenvolver e postar o **MVP (Minimum Viable Product)** e a **validação com 5 potenciais clientes**:

1. **Descrição da solução (através do MVP) e link** onde ela possa verificar. **Descrever a ferramenta usada** para fazer o MVP.
2. **Transcrição da validação** com os 5 usuários: se foi entrevista, transcrever as 5 entrevistas mínimas; se foi vídeo, o número e o conteúdo dos feedbacks, curtidas, leads etc.
3. Na apresentação: detalhar **técnicas, ferramentas e tecnologias** usadas no desenvolvimento.

Critérios implícitos do comunicado:
- Não se espera produto comercial completo, mas uma **solução funcional, testável e coerente com o problema**, com as principais funcionalidades que demonstrem a proposta de valor.
- Deve **permitir uso ou teste por usuários reais** e vir com **evidências de funcionamento**.
- Pode ser MVP funcional ou MVP de serviço; tecnologias compatíveis com o curso de SI.
- Pergunta-chave: *qual é a menor versão da solução que podemos colocar em teste?*

### Regras importantes (não negociáveis)
- **A validação precisa ser feita com pessoas reais.** Nunca invente, "simule" ou escreva falas de entrevistados. Se for ajudar, produza apenas o **roteiro de teste** e um **modelo de transcrição** em branco.
- Publicado no **GitHub Pages (público, só arquivos estáticos)**: não coletar nem commitar dados pessoais reais, documentos, chaves secretas ou tokens. Profissionais de exemplo são fictícios.
- O site é um **MVP em teste**; deixar isso claro na interface.

## 5. Plano de teste que o grupo já entregou (manter coerência)

- **Quem:** 5 usuários (3 moradores e 2 prestadores do bairro). Incluir pelo menos 1 pessoa pouco familiarizada com tecnologia.
- **Moradores:** "Seu chuveiro não esquenta: mostre como contrataria alguém"; "O que você entende por Perfil verificado / Selo de Confiança?"; "O preço faz sentido? Entende como foi calculado?"
- **Prestadores:** "Faça o seu cadastro"; "Aceite a solicitação (ou conteste o valor)"; "Me diga quanto você paga de comissão e quanto recebe."
- **Registro:** onde clica, onde hesita ou erra, tempo, comentários, nota de 1 a 5 de confiança.
- **Critérios de sucesso:** 2 de 3 moradores contratariam só com a tela do perfil; 4 de 5 completam a missão sem ajuda; os 2 prestadores explicam como o valor foi calculado e quanto receberiam; maioria dá nota 4+ e ninguém desiste do cadastro.

## 6. Estado atual do MVP (`index.html`, arquivo anexo)

- **Stack:** HTML + CSS + JavaScript puro, **arquivo único**, sem build, sem dependências. Fonte Plus Jakarta Sans (Google Fonts). Estado em `localStorage` (chave `cs`). Pronto para GitHub Pages (`index.html` na raiz).
- **Arquitetura:** objeto `V` com uma função por tela (retorna HTML), `render()`, `go(tela, contexto)`, `back()`, estado `S` (pedidos, prestadores cadastrados, prestador atual), formulários em `F` (pedido), `K` (cadastro), `M` (contestação). Config no topo: `CFG = { whats, form, taxa }`.
- **Layout:** coluna mobile (máx. 430px) centralizada.

### Telas (10, seguindo o protótipo entregue)
Morador: **Início → Solicitar serviço → Seu pedido (3 prestadores) → Perfil do profissional → Solicitação enviada**, mais abas **Pedidos** e **Perfil**.
Prestador: **Cadastro → Painel → Nova solicitação → Contestar valor → Valor em revisão**.

### Regras de negócio já implementadas
- **Preço = mão de obra (base do prestador) + peças (R$ 30 se o prestador compra; R$ 0 se o cliente tem) + deslocamento (R$ 5 × km arredondado para cima).** Prestadores de exemplo: João Silva (base 80, 2 km → R$ 120), Carlos Souza (base 85, 3,5 km → R$ 135), Marcos Lima (base 100, 5 km → R$ 155), todos "Elétrica".
- **Taxa do Consertaí: 10% só sobre serviços concluídos**, exibida no cadastro e no painel (`CFG.taxa`).
- **Contestar valor:** o prestador sugere um valor maior com motivo e justificativa; o pedido vai a "Em análise"; **o cliente precisa aprovar** em "Pedidos" (decisão do grupo: evitar "o preço muda no final").
- Status do pedido: Aguardando resposta → (Em análise) → Confirmado → Concluído (ou Cancelado). Ganhos do painel = soma dos concluídos já descontada a taxa.
- Cadastro de prestador com **foto** (redimensionada para 160 px e salva em base64), aparece na lista de prestadores da categoria escolhida.
- Opcionais por configuração: `CFG.whats` (botão "Avisar pelo WhatsApp" com mensagem pronta) e `CFG.form` (envia cadastros para um endpoint de formulário).
- Botão "Limpar dados do teste" na aba Perfil.

### Teste já feito
Fluxo completo rodado em ambiente simulado (jsdom) sem erros de execução; **não foi visto em navegador real nem em celular.**

## 7. Identidade visual

- Marca: "Consert" + "aí" (acento diferente), slogan **"A confiança que a sua casa precisa"**.
- App (telas entregues): verde-escuro `#176B54`, menta `#D4E7DF`, fundo `#F2F4F3`, texto `#1E2A26`; ícone verde com martelo.

## 8. O que ainda falta / sugestões (priorize pelo prazo)

**Essencial hoje**
1. Abrir no celular e corrigir qualquer bug visual ou de fluxo; garantir que funciona no GitHub Pages (caminhos, HTTPS).
2. Preencher `CFG.whats` e `CFG.form` se o grupo fornecer (o MVP vira "de serviço" de verdade, com pedidos e cadastros chegando de fora).
3. Rodapé/aviso "MVP em teste, dados fictícios".
4. Conferir que dá para executar sem ajuda todas as tarefas da seção 5.

**Bom ter (se sobrar tempo)**
- **Registro de evidências:** salvar eventos com horário (tela aberta, pedido criado, contestação etc.) e um botão para **exportar JSON/CSV**, para anexar como "evidência de funcionamento" e ajudar nas transcrições.
- Categorias além de Elétrica com prestadores de exemplo; botão "Ver todas".
- Mensagem clara quando não há prestadores na categoria; validações e estados vazios.
- Acessibilidade básica (contraste, rótulos, foco) e boa leitura no celular; ícone/favicon/`manifest` (PWA simples).
- Sincronizar entre aparelhos (Firebase/Supabase) **só se houver tempo e sem segredos no repositório**; caso contrário, manter `localStorage` e explicar a limitação na descrição.

**Fora de escopo:** pagamento real, backend próprio, verificação real de antecedentes, publicar dados reais de pessoas.

## 9. Textos úteis para a entrega

**Ferramenta utilizada (modelo):** *HTML, CSS e JavaScript puro (arquivo único), com `localStorage` para persistência no navegador, hospedado no GitHub Pages.* Complementar com as ferramentas extras que o agente realmente usar.

**Descrição da solução (modelo):** *Consertaí é uma plataforma hiperlocal que conecta moradores a prestadores de serviços domésticos verificados (Selo de Confiança). O MVP permite ao morador descrever o problema, comparar prestadores com preço final calculado pelo app, ver o perfil com avaliações e contratar; e ao prestador cadastrar-se com foto, receber solicitações, aceitar ou contestar o valor (com aprovação do cliente) e acompanhar ganhos já descontada a taxa de 10%.*

## 10. Como trabalhar

- Mantenha **um único `index.html`**, a menos que haja motivo forte.
- Preserve nomes de telas e funções (`V`, `go`, `render`, `hire` etc.) ao refatorar, para o grupo conseguir explicar o código na apresentação.
- Comente o código nos pontos-chave (cálculo de preço, aprovação de ajuste, cadastro) e **explique ao final o que mudou**, em linguagem simples, para o grupo defender na apresentação.
- Na dúvida entre "mais funcionalidades" e "menos risco de quebrar", escolha **menos risco**: o prazo é hoje.
