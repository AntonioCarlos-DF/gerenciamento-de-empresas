require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const authMiddleware = require('./middlewares/authMiddleware.js');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware de autenticação JWT


// Montagem da URI do MongoDB
const uri = `${process.env.MONGO_URI}${process.env.MONGO_PASSWORD}${process.env.MONGO_URI2}`;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function start() {
  try {
    await client.connect();
    console.log('Conectado ao MongoDB');

    const db = client.db('desafio');
    const collections = await db.listCollections({ name: 'users' }).toArray();
    if (collections.length === 0) {
      await db.createCollection('users', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'email', 'password'],
            properties: {
              name: { bsonType: 'string', description: 'Nome obrigatório' },
              email: { bsonType: 'string', pattern: '^.+@.+\\..+$', description: 'E-mail válido obrigatório' },
              password: { bsonType: 'string', minLength: 6, description: 'Senha obrigatória com no mínimo 6 caracteres' }
            }
          }
        }
      });
      console.log('Coleção "users" criada com validação');
    }

    const users = db.collection('users');

    // Rotas abertas (registro e login)
    app.post('/api/register', async (req, res) => {
      const { name, email, password } = req.body;
      // Validação básica antes do MongoDB
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos os campos (name, email, password) são obrigatórios.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres.' });
      }
      try {
        const result = await users.insertOne({ name, email, password });
        res.status(201).json({ id: result.insertedId });
      } catch (err) {
        if (err.code === 121) { // DocumentValidationFailure
          return res.status(400).json({ message: 'Falha na validação do documento: ' + err.errmsg });
        }
        console.error(err);
        res.status(500).json({ message: 'Erro interno ao registrar usuário.' });
      }
    });

    app.post('/api/login', async (req, res) => {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
      }
      const user = await users.findOne({ email, password });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
      }
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.PRIVATEKEY,
        { expiresIn: '15s' }
      );
      res.json({ success: true, token });
    });

    app.get('/api/protected', authMiddleware, (req, res) => {
      res.json({ message: 'Acesso concedido à rota protegida.', user: req.user });
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server rodando na porta ${process.env.PORT}`);
    });

  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err);
  }
}

start();
