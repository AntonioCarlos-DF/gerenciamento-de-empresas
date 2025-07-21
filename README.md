# Sistema de Gerenciamento de Empresas

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Um sistema completo para gerenciamento de empresas, clientes, produtos e pedidos, desenvolvido com React (frontend) e Node.js/Express (backend).

## Visão Geral

Este projeto é uma solução completa para gerenciamento de negócios, permitindo:

- Cadastro e autenticação de usuários
- Gerenciamento de empresas
- Controle de clientes
- Administração de produtos
- Criação e acompanhamento de pedidos

## Tecnologias Utilizadas

### Frontend

- React com TypeScript
- Tailwind CSS para estilização
- Axios para requisições HTTP
- React Router para navegação

### Backend

- Node.js com Express
- MongoDB para armazenamento de dados
- Mongoose para modelagem de dados
- JSON Web Tokens (JWT) para autenticação
- Dotenv para gerenciamento de variáveis de ambiente

### Ferramentas

- Docker (para containerização do MongoDB)
- Postman (para teste de API)
- Git (controle de versão)

## Estrutura de Pastas

```bash
├── backend/ # Código do servidor
│ ├── src/
│ │ ├── controllers/ # Lógica de controle
│ │ ├── middlewares/ # Middlewares de autenticação
│ │ ├── models/ # Modelos de dados
│ │ ├── routes/ # Definição de rotas
│ │ └── utils/ # Utilitários
│ ├── .env.example # Exemplo de variáveis de ambiente
│ └── package.json # Dependências do backend
│
├── frontend/ # Aplicação web
│ ├── public/ # Assets públicos
│ ├── src/
│ │ ├── components/ # Componentes reutilizáveis
│ │ ├── pages/ # Páginas da aplicação
│ │ ├── services/ # Serviços de API
│ │ ├── types/ # Tipos TypeScript
│ │ ├── App.tsx # Componente principal
│ │ └── index.tsx # Ponto de entrada
│ ├── .env.example # Exemplo de variáveis de ambiente
│ └── package.json # Dependências do frontend
│
├── docker-compose.yml # Configuração do Docker para MongoDB
├── .gitignore # Arquivos ignorados pelo Git
└── README.md # Este arquivo
```

## Como Executar o Projeto

### Pré-requisitos

- Node.js (v18 ou superior)
- npm (v9 ou superior)
- Docker (opcional, para rodar o MongoDB via container)

### Passo a Passo

### 1. **Clonar o repositório**

```bash
git clone https://github.com/AntonioCarlos-DF/gerenciamento-de-empresas.git
cd gerenciamento-de-empresas
```

### 2. Configurar o backend

```bash
cd backend
cp .env.example .env
# Editar o .env com suas configurações
npm install
```

Exemplo da env a ser seguido:

```bash
MONGO_URI=mongodb+srv://<Seu_user_mongoDB>:
MONGO_PASSWORD=<Sua_senha_MongoDB>
MONGO_URI2=<Final_da_URL_do_seu_Cluster_MongoDB>
PORT=3000
PRIVATEKEY=<Sua_private_keyJWT>
```

### 3. Configurar o frontend

```bash
cd ../frontend
cp .env.example .env
# Editar o .env com suas configurações
npm install
```

Exemplo da env a ser seguido:

```bash
VITE_API_BASE_URL=http://localhost
VITE_API_BASE_PORT=<Porta_de_preferencia>
```

A porta padrão é 3000

### 4. Iniciar o backend

```bash
cd ../backend
npm run dev
```

### 5. Iniciar o frontend

```bash
cd ../frontend
npm run dev
```

### 6. Iniciar frontend e backend

```bash
cd ../gerenciamento-de-empresas
npm install
npm run dev
```

O projeto possui o package Concurrently, para rodar multiplos codigos ao mesmo tempo.

### 7. Acessar a aplicação

Abra seu navegador em: http://localhost:5173

---

## Features Principais

- **Autenticação de Usuários**
  - Registro e login com validação de e-mail
  - Proteção de rotas com JWT
  - Recuperação de sessão
- **Gerenciamento de Empresas**
  - CRUD completo de empresas
  - Validação de CNPJ
  - Formatação automática de CNPJ
- **Gerenciamento de Clientes**
  - Cadastro de clientes vinculados a empresas
  - Validação de dados
  - Busca e filtragem
- **Gerenciamento de Produtos**
  - Cadastro de produtos com preços
  - Validação de dados
  - Associação a empresas
- **Gerenciamento de Pedidos**
  - Criação de pedidos com múltiplos produtos
  - Cálculo automático de totais
  - Acompanhamento de status
  - Detalhamento de itens do pedido

---

## Coleção postman

Este projeto possui uma coleção do postman para teste dos endpoints,
pode ser acessado via importação do codigo disponibilizado no arquivo **Postman.json**

### Para importar:

1. Copie o conteudo do **Postman.json**
2. Abra seu postman
3. clique em "importar"
4. Cole o conteudo com ctrl+c

Se a coleção for importada com sucesso, voce tera acesso aos endpoints que podem ser testados após server backend ser ligado.

## Contato

**Antonio Carlos - GitHub - <antoniocarlosdf@outlook.com>**
