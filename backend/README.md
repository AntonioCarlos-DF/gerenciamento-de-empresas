# Backend do Sistema de Gerenciamento

Este é o backend do Sistema de Gerenciamento de Empresas, desenvolvido com Node.js, Express e MongoDB.

## Tecnologias Principais

- **Node.js**: Ambiente de execução JavaScript
- **Express**: Framework web para Node.js
- **MongoDB**: Banco de dados NoSQL
- **Mongoose**: ODM (Object Data Modeling) para MongoDB
- **JWT**: Autenticação baseada em tokens
- **Dotenv**: Gerenciamento de variáveis de ambiente
- **Cors**: Middleware para habilitar CORS

## Estrutura de Pastas

```bash
backend/
│ └── middlewares/ # Middlewares de autenticação e validação
│   └── authMiddleware.js
│
├── .env.example # Exemplo de arquivo de ambiente
├── package.json # Dependências e scripts
└── server.js # Ponto de entrada da aplicação e endpoints
```
---
## Configuração

### 1. Se não criou ainda, crie o `.env`

```bash
touch .env
```

### 2. Configure as variaveis no arquivo `.env`

```bash
MONGO_URI=mongodb+srv://<Seu_user_mongoDB>:
MONGO_PASSWORD=<Sua_senha_MongoDB>
MONGO_URI2=<Final_da_URL_do_seu_Cluster_MongoDB>
PORT=3000
PRIVATEKEY=<Sua_private_keyJWT>
```
---
## Instalação

```bash
npm install
```

## Execução

### Modo Desenvolvimento

```bash
npm run dev
```

### Modo Produção

```bash
npm start
```

---

## Rotas da API

### Autenticação

- POST /api/register - Registrar novo usuário
- POST /api/login - Fazer login
- GET /api/check-email - Verificar disponibilidade de e-mail

### Empresas

- GET /api/companies - Listar todas as empresas
- POST /api/companies - Criar nova empresa
- PUT /api/companies/:id - Atualizar empresa
- DELETE /api/companies/:id - Excluir empresa

### Clientes

- GET /api/customers - Listar todos os clientes
- POST /api/customers - Criar novo cliente
- PUT /api/customers/:id - Atualizar cliente
- DELETE /api/customers/:id - Excluir cliente

### Produtos

- GET /api/products - Listar todos os produtos
- POST /api/products - Criar novo produto
- PUT /api/products/:id - Atualizar produto
- GET /api/products/:id - Obter detalhes de um produto
- DELETE /api/products/:id - Excluir produto

### Pedidos

- GET /api/orders - Listar todos os pedidos
- POST /api/orders - Criar novo pedido
- PUT /api/orders/:id - Atualizar pedido
- DELETE /api/orders/:id - Excluir pedido

### Itens de Pedido

- POST /api/order-products - Adicionar item a um pedido
- GET /api/order-products/:orderId - Listar itens de um pedido
- PUT /api/order-products/:id - Atualizar item de pedido
- DELETE /api/order-products/delete-by-order/:orderId - Excluir todos os itens de um pedido

---

## Modelos de Dados

### Usuário (User)

```bash
{
  name: String,
  email: { type: String, unique: true },
  password: String
}
```

### Empresa (Company)

```bash
{
  tradeName: String,
  legalName: String,
  cnpj: { type: String, unique: true },
  userId: { type: ObjectId, ref: 'User' }
}
```

### Cliente (Customer)

```bash
{
  name: String,
  email: String,
  phone: String,
  company: { type: ObjectId, ref: 'Company' },
  userId: { type: ObjectId, ref: 'User' }
}
```

### Produto (Product)

```bash
{
  name: String,
  price: Number,
  description: String,
  company: { type: ObjectId, ref: 'Company' },
  userId: { type: ObjectId, ref: 'User' }
}
```

### Pedido (Order)

```bash
{
  number: String,
  customer: { type: ObjectId, ref: 'Customer' },
  company: { type: ObjectId, ref: 'Company' },
  observation: String,
  total: Number,
  date: Date,
  status: String,
  userId: { type: ObjectId, ref: 'User' }
}
```

### Item de Pedido (OrderProduct)

```bash
{
  order: { type: ObjectId, ref: 'Order' },
  product: { type: ObjectId, ref: 'Product' },
  quantity: Number
}
```

---

## Middlewares

- authMiddleware:
  - Verifica a validade do token JWT e anexa o usuário autenticado ao objeto de requisição
- Error Handling:
  - Middleware centralizado para tratamento de erros

---

## Testes

Para executar os testes:

```bash
npm test
```
---
## Melhorias Futuras
- Implementar paginação nas listagens
- Adicionar sistema de permissões de usuário
- Implementar upload de imagens para produtos
- Adicionar relatórios e estatísticas