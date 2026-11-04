# Consertaí — A confiança que a sua casa precisa 🛠️🛡️

> **Projeto Acadêmico — Universidade de São Paulo (USP)**  
> **Bacharelado em Sistemas de Informação**  
> **Disciplinas:** Empreendedorismo & Resolução de Problemas II (RP II) — 2026  
> **Integrantes:** Diego Aguiar, Luis Gustavo Cerqueira e Mateus de Sales  
> **Deploy GitHub Pages:** [https://cerqueira11.github.io/consertai/](https://cerqueira11.github.io/consertai/)

---

## 📌 Sobre o Projeto

O **Consertaí** é uma plataforma hiperlocal desenvolvida para solucionar o principal gargalo na contratação de serviços residenciais de reparo e manutenção (elétrica, hidráulica, limpeza, pintura e montagem): **a falta de confiança e a insegurança nos preços**.

Ao contrário de plataformas tradicionais baseadas em compra de contatos (leads) ou listas sem validação prévia, o Consertaí atua com validação ativa de profissionais e precificação transparente antes do morador confirmar a visita.

---

## 🌟 Principais Diferenciais e Funcionalidades

### 1. 🛡️ Selo de Confiança Consertaí
* **Checagem Cadastral e de Antecedentes:** Validação de CPF, identidade e antecedentes criminais nos âmbitos federal e estadual.
* **Entrevista de Apresentação:** Entrevista em vídeo de 1 minuto em que o profissional detalha sua experiência e procedimentos de segurança.
* **Critério de Permanência:** Garantia de manutenção de nota mínima (⭐ 4.5) e ausência de advertências graves.

### 2. 💰 Preço Calculado e Transparência Prévia
* **Sem Leilão Oculto:** O morador vê a estimativa de preço base antes de contratar.
* **Fórmula Clara:** `Valor Total = Mão de Obra Base + Peças/Materiais + Deslocamento (R$ 5/km)`
* **Opções Transparentes de Peças:**
  1. *Cliente já possui os materiais* (+R$ 0)
  2. *Prestador compra: reparo básico* (+R$ 30 — fita, veda-rosca, buchas)
  3. *Prestador compra: peça principal* (+R$ 75 — resistência, sifão, torneira)
  4. *Prestador orça na visita com nota fiscal física*
* **Ajuste Bilateral Sem Surpresas:** Caso o serviço seja mais complexo, o prestador propõe novo valor justificando no app; o atendimento só é confirmado após a aprovação expressa do morador.

### 3. 📍 Radar Hiperlocal com Mapa Real (GPS)
* Integração com **Leaflet.js** e camadas de alta resolução (ArcGIS Topográfico, Ruas e Satélite).
* Filtro dinâmico de raio (3 km, 5 km, 8 km e 12 km) com taxa de deslocamento calculada instantaneamente.
* Botão de centralização rápida e visualização dos profissionais no bairro.

### 4. 🔍 Busca Multi-Campo e Filtros Inteligentes
* Campo de busca com suporte a termos específicos e sinônimos (*"chuveiro"*, *"tomada"*, *"disjuntor"* mantêm a categoria **Elétrica** visível e filtram eletricistas que realizam tais serviços).
* Busca simultânea por nome do profissional, título, especialidades e bio.

### 5. 💼 Painel do Prestador e Modelo Justo (Take-rate de 10%)
* Prestadores não compram créditos para ver mensagens.
* A taxa da plataforma (10%) é cobrada **exclusivamente sobre serviços concluídos com sucesso**.
* Acompanhamento de ganhos brutos e líquidos em tempo real.

### 6. 📱 Responsividade Completa (Modo Celular e Modo PC/Web)
* Alternador de visualização integrado na barra superior (`📱 Celular` / `💻 PC / Web`) para apresentações e bancas avaliadoras.
* Alternador rápido de papéis (`Morador` / `Prestador`).

### 7. 📊 Exportação de Evidências Acadêmicas (CSV e JSON)
* Registro automático de eventos no navegador (`localStorage`).
* Aba de Ajustes com botão para **"Baixar Relatório de Evidências (CSV)"** para anexação em relatórios e entregas do Classroom.

---

## 🗂️ Estrutura do Repositório

O projeto foi estruturado seguindo as boas práticas da arquitetura web modular sem necessidade de build complexo, rodando nativamente no navegador e no GitHub Pages:

```
consertai/
├── index.html                   # Estrutura HTML limpa e links principais
├── index.standalone.html        # Versão monolítica em arquivo único (backup/offline)
├── css/
│   └── style.css                # Folha de estilos, variáveis de tema, layouts e Leaflet
├── js/
│   ├── data.js                  # Catálogo de prestadores (P0), fotos, portfólio, categorias e config
│   └── app.js                   # Lógica da aplicação, mapa Leaflet, busca, pedidos e agendamento
├── docs/
│   ├── CONTEXTO_CONSERTAI_MVP.md                    # Dossiê de validações, hipóteses e personas
│   └── ROTEIRO_E_TRANSCRICAO_TESTES_5_USUARIOS.md   # Roteiro de testes com 5 usuários reais e fichas
└── README.md                    # Documentação do projeto
```

---

## 🚀 Como Executar o Projeto

### Opção 1: Acesso Online direto (GitHub Pages)
Acesse diretamente pelo navegador no link:  
👉 **[https://cerqueira11.github.io/consertai/](https://cerqueira11.github.io/consertai/)**

### Opção 2: Execução Local
1. Clone este repositório:
   ```bash
   git clone https://github.com/Cerqueira11/consertai.git
   ```
2. Abra a pasta do projeto e dê dois cliques no arquivo `index.html` (funciona em qualquer navegador moderno: Chrome, Edge, Safari, Firefox).
3. Não requer `npm install`, nem servidor backend rodando.

---

## 🎓 Contexto Acadêmico (USP SI)

Este MVP foi concebido e iterado como parte das entregas avaliativas da disciplina **Resolução de Problemas II (RP II)** no curso de **Sistemas de Informação da USP**, aplicando metodologias ativas de Design Thinking, desenvolvimento enxuto (*Lean Startup*) e testes empíricos com usuários reais moradores de São Paulo.
