# 🛠️ Backend - Desafio Vendergas

Este é o backend da aplicação desenvolvida para o desafio técnico da empresa **Vendergas**, utilizando Node.js, Express, MongoDB e autenticação JWT.

---

## 🚀 Tecnologias utilizadas

- Node.js
- Express.js
- MongoDB Atlas
- JWT (Json Web Token)
- dotenv
- CORS

---

## 🧪 Requisitos atendidos

- [x] Dados persistidos em banco MongoDB com schema de validação
- [x] Autenticação JWT em todas as rotas (PrivateKey via `.env`)
- [x] Porta configurada para `3000`
- [x] Documentação de setup neste `README.md`
- [x] Gitflow com Pull Requests e branches de feature

---

## ⚙️ Setup do Projeto

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/seu-repo.git
cd backend
```

---

### 2. Criar o arquivo .env
Crie um arquivo chamado .env na raiz da pasta backend/ com o seguinte conteúdo:

```bash
PORT=3000
MONGO_URI=mongodb+srv://<seu-usuario-mongodb-aqui>:
MONGO_PASSWORD=<suaSenhaMongoAqui>
MONGO_URI2=@cluster0.88ueiei.mongodb.net/?retryWrites=true&w=majority
PRIVATEKEY=<suaPrivateKeyJWT>
```

### ⚠️ Nunca versionar este arquivo no Git.

---

### 3. Instalar as dependências
```bash
npm install
```

---

### 4. Rodar o servidor em modo dev

```bash
npm run dev
O servidor será iniciado em: http://localhost:3000
```

---

### 🔐 Autenticação JWT
O login bem-sucedido retorna um token JWT válido.

Esse token deve ser enviado no header das requisições protegidas:

```bash
Authorization: Bearer <token>
```

---

## 🛣️ Endpoints

### POST /api/register
Cadastra um novo usuário.

```bash
{
  "name": "Seu Nome",
  "email": "email@exemplo.com",
  "password": "suasenha"
}
```

### POST /api/login
Autentica um usuário e retorna um token JWT.

```bash
{
  "email": "email@exemplo.com",
  "password": "suasenha"
}
```


### GET /api/protected
Rota protegida, requer o token JWT.

Headers:
```bash
Authorization: Bearer <seu_token>
```
```bash
{
  "message": "Acesso concedido a rota protegida.",
  "user": {
    "id": "...",
    "email": "..."
  }
}
```
---
✍️ Autor
Desenvolvido por Antonio Carlos – como parte do desafio técnico da Vendergas.