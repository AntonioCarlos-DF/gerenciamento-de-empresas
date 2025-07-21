# Frontend do Sistema de Gerenciamento

Interface web do Sistema de Gerenciamento de Empresas, desenvolvida com React e TypeScript.

## Tecnologias Principais

- **React**: Biblioteca JavaScript para construção de UIs
- **TypeScript**: Superset tipado de JavaScript
- **Tailwind CSS**: Framework CSS utilitário
- **React Router**: Gerenciamento de rotas
- **Axios**: Cliente HTTP para requisições à API
- **React Icons**: Biblioteca de ícones
- **Vite**: Build tool e servidor de desenvolvimento

## Estrutura de Pastas

```bash
  frontend/
├── public/ # Arquivos estáticos
│ └── vite.svg # Ícone padrão
│
├── src/
│ ├── components/ # Componentes reutilizáveis
│ │ ├── Header.tsx # Cabeçalho do dashboard
│ │ ├── Loading.tsx # Componente de carregamento
│ │ ├── ProtectedRoute.tsx # Teste de rotas protegidas
│ │ └── Sidebar.tsx # Menu lateral do dashboard
│ │
│ ├── pages/ # Páginas da aplicação
│ │ ├── Login / # Páginas de autenticação
│ │ ├── Companies/ # Páginas de empresas
│ │ ├── Customers/ # Páginas de clientes
│ │ ├── Orders/ # Páginas de pedidos
│ │ ├── NewOrders/ # Páginas de criação de pedidos
│ │ ├── Products/ # Páginas de produtos
│ │ └── Register/ # Páginas de Registro
│ │
│ ├── services/ # Serviços e integrações
│ │ └── api.ts # Configuração do Axios
│ │
│ ├── types/ # Tipos TypeScript
│ │ └── appTypes.ts
│ │
│ ├── App.tsx # Componente principal
│ ├── main.tsx # Ponto de entrada
│ └── vite-env.d.ts # Tipos do Vite
│
├── .env # Variáveis de ambiente
├── index.html # Página HTML principal
├── package.json # Dependências e scripts
└── tsconfig.json # Configuração do TypeScript
```

---

## Configuração

### 1. Se não criou ainda, crie o `.env`

```bash
touch .env
```

### 2. Configure as variaveis no arquivo `.env`

```bash
VITE_API_BASE_URL=http://localhost
VITE_API_BASE_PORT=<Sua_porta>
```

A porta padrão é 3000

---

## Execução

Modo Desenvolvimento

```bash
npm run dev
```

Build para Produção

```bash
npm run build
```

Preview do Build

```bash
npm run preview
```

---

## Principais Componentes

### Layout

- Header: Cabeçalho da aplicação com navegação
- Sidebar: Menu lateral para navegação entre seções
- Loading: Componente de carregamento

### UI

- Button: Botão personalizável
- Input: Campo de entrada com validação
- Table: Componente de tabela reutilizável
- Modal: Modal para formulários e detalhes
- Alert: Componente de alerta/notificação

### Páginas

- LoginPage: Página de autenticação
- RegisterPage: Página de registro de usuário
- CompaniesPage: Listagem e gerenciamento de empresas
- CustomersPage: Listagem e gerenciamento de clientes
- ProductsPage: Listagem e gerenciamento de produtos
- OrdersPage: Listagem e gerenciamento de pedidos

---

## Funcionalidades Principais

### Autenticação

- Formulários de login e registro com validação
- Armazenamento de token JWT no localStorage
- Tempo de validade do token de 1h, pode ser alterado no backend no arquivo server.js
- Redirecionamento automático para login quando necessário

### Empresas

- Listagem de empresas com paginação
- Formulário de criação/edição com validação de CNPJ
- Formatação automática de CNPJ
- Exclusão com confirmação

### Clientes

- Cadastro de clientes vinculados a empresas
- Busca e filtragem de clientes
- Edição em linha para campos simples

### Produtos

- Listagem de produtos com busca
- Formulário de criação/edição com validação de preço
- Associação automática à empresa do usuário

### Pedidos

- Criação de pedidos com múltiplos produtos
- Cálculo automático de total do pedido
- Acompanhamento de status
- Detalhamento de itens do pedido

---

## Estilização

A aplicação utiliza Tailwind v4 CSS para estilização.

- Principais características:
- Design responsivo para todos os dispositivos
- Cores temáticas (roxo como cor primária)
- Componentes acessíveis

---

## Testes

Para executar os testes:

```bash
npm test
```

---

## Melhorias Futuras

- Implementar dashboard com resumo de informações
- Adicionar gráficos para visualização de dados
- Implementar sistema de notificações
- Adicionar modo escuro/claro
- Desenvolver versão mobile

---
