require('dotenv').config();
const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Middleware de autenticação JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1]; // Espera 'Bearer <token>'
  try {
    const decoded = jwt.verify(token, process.env.VENDERGAS);
    req.user = decoded; // Payload disponível em req.user
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token inválido.' });
  }
}

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
              password: { bsonType: 'string', minLength: 6, description: 'Senha obrigatória' }
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
      const result = await users.insertOne({ name, email, password });
      res.status(201).json({ id: result.insertedId });
    });

    app.post('/api/login', async (req, res) => {
      const { email, password } = req.body;
      const user = await users.findOne({ email, password });
      if (!user) {
        return res.status(401).json({ success: false, message: 'Credenciais inválidas' });
      }
      // Gera token JWT
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.PRIVATEKEY,
        { expiresIn: '1h' }
      );
      res.json({ success: true, token });
    });

    // Aplica o middleware para todas as rotas a partir daqui
    app.use(authMiddleware);

    // Exemplo de rota protegida
    app.get('/api/protected', (req, res) => {
      res.json({ message: 'Acesso concedido a rota protegida.', user: req.user });
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server rodando na porta ${process.env.PORT}`);
    });

  } catch (err) {
    console.error(err);
  }
}

start();