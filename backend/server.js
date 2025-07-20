require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middlewares/authMiddleware.js");

const app = express();
app.use(cors());
app.use(express.json());

const uri = `${process.env.MONGO_URI}${process.env.MONGO_PASSWORD}${process.env.MONGO_URI2}`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function start() {
  try {
    await client.connect();
    console.log("Conectado ao MongoDB");

    const db = client.db("desafio");

    // Obter todas as coleções existentes
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    // Verificar e criar coleção users se necessário
    if (!collectionNames.includes("users")) {
      await db.createCollection("users", {
        validator: {
          $jsonSchema: {
            bsonType: "object",
            required: ["name", "email", "password"],
            properties: {
              name: { bsonType: "string", description: "Nome obrigatório" },
              email: {
                bsonType: "string",
                pattern: "^.+@.+\\..+$",
                description: "E-mail válido obrigatório",
              },
              password: {
                bsonType: "string",
                minLength: 6,
                description: "Senha obrigatória com no mínimo 6 caracteres",
              },
            },
          },
        },
      });
      console.log('Coleção "users" criada com validação');
    }

    // Verificar e criar outras coleções
    const requiredCollections = [
      "products",
      "companies",
      "customers",
      "orders",
      "order_products", // Nova coleção para pedido_produto
    ];

    for (const colName of requiredCollections) {
      if (!collectionNames.includes(colName)) {
        await db.createCollection(colName);
        console.log(`Coleção "${colName}" criada`);
      }
    }

    const users = db.collection("users");
    const products = db.collection("products");
    const companies = db.collection("companies");
    const customers = db.collection("customers");
    const orders = db.collection("orders");
    const orderProducts = db.collection("order_products"); // Nova coleção

    // Rotas abertas (registro e login)
    app.post("/api/register", async (req, res) => {
      const { name, email, password } = req.body;
      // Validação básica antes do MongoDB
      if (!name || !email || !password) {
        return res.status(400).json({
          message: "Todos os campos (name, email, password) são obrigatórios.",
        });
      }
      if (password.length < 6) {
        return res
          .status(400)
          .json({ message: "A senha deve ter no mínimo 6 caracteres." });
      }
      try {
        const result = await users.insertOne({ name, email, password });
        res.status(201).json({ id: result.insertedId });
      } catch (err) {
        if (err.code === 121) {
          // DocumentValidationFailure
          return res.status(400).json({
            message: "Falha na validação do documento: " + err.errmsg,
          });
        }
        console.error(err);
        res.status(500).json({ message: "Erro interno ao registrar usuário." });
      }
    });

    app.post("/api/login", async (req, res) => {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email e senha são obrigatórios." });
      }
      const user = await users.findOne({ email, password });
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: "Credenciais inválidas" });
      }
      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.PRIVATEKEY,
        { expiresIn: "1h" }
      );

      // Retorna dados do usuário sem a senha
      const userData = {
        id: user._id,
        name: user.name,
        email: user.email,
      };

      res.json({ success: true, token, user: userData });
    });

    // ======================================
    // ROTAS PARA PRODUTOS (PROTEGIDAS)
    // ======================================
    app.get("/api/products", authMiddleware, async (req, res) => {
      try {
        const allProducts = await products.find().toArray();
        res.json(allProducts);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar produtos" });
      }
    });

    app.post("/api/products", authMiddleware, async (req, res) => {
      try {
        const { name, price, description, companyId } = req.body;

        if (!name || !price || !companyId) {
          return res.status(400).json({
            message: "Nome, preço e empresa são obrigatórios",
          });
        }

        if (!ObjectId.isValid(companyId)) {
          return res.status(400).json({ message: "ID da empresa inválido" });
        }

        const newProduct = {
          name,
          price: parseFloat(price),
          description: description || "",
          company: new ObjectId(companyId),
          createdAt: new Date(),
        };

        const result = await products.insertOne(newProduct);
        res.status(201).json({ _id: result.insertedId, ...newProduct });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao criar produto" });
      }
    });

    app.put("/api/products/:id", authMiddleware, async (req, res) => {
      try {
        const { id } = req.params;
        const { name, price, description, companyId } = req.body;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "ID inválido" });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (price) updateData.price = parseFloat(price);
        if (description) updateData.description = description;
        if (companyId) {
          if (!ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: "ID da empresa inválido" });
          }
          updateData.company = new ObjectId(companyId);
        }

        const result = await products.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Produto não encontrado" });
        }

        res.json({ message: "Produto atualizado com sucesso" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao atualizar produto" });
      }
    });

    app.get("/api/products/:id", authMiddleware, async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "ID inválido" });
        }

        const product = await products.findOne({ _id: new ObjectId(id) });

        if (!product) {
          return res.status(404).json({ message: "Produto não encontrado" });
        }

        res.json(product);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar produto" });
      }
    });

    // ======================================
    // ROTAS PARA EMPRESAS (PROTEGIDAS)
    // ======================================
    app.get("/api/companies", authMiddleware, async (req, res) => {
      try {
        const allCompanies = await companies.find().toArray();
        res.json(allCompanies);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar empresas" });
      }
    });

    app.post("/api/companies", authMiddleware, async (req, res) => {
      try {
        const { tradeName, legalName, cnpj } = req.body;

        if (!tradeName || !legalName || !cnpj) {
          return res.status(400).json({
            message: "Nome fantasia, razão social e CNPJ são obrigatórios",
          });
        }

        const newCompany = {
          tradeName,
          legalName,
          cnpj,
          createdAt: new Date(),
        };

        const result = await companies.insertOne(newCompany);
        res.status(201).json({ _id: result.insertedId, ...newCompany });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao criar empresa" });
      }
    });

    app.put("/api/companies/:id", authMiddleware, async (req, res) => {
      try {
        const { id } = req.params;
        const { tradeName, legalName, cnpj } = req.body;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "ID inválido" });
        }

        const updateData = {};
        if (tradeName) updateData.tradeName = tradeName;
        if (legalName) updateData.legalName = legalName;
        if (cnpj) updateData.cnpj = cnpj;

        const result = await companies.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Empresa não encontrada" });
        }

        res.json({ message: "Empresa atualizada com sucesso" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao atualizar empresa" });
      }
    });

    // ======================================
    // ROTAS PARA CLIENTES (PROTEGIDAS)
    // ======================================
    app.get("/api/customers", authMiddleware, async (req, res) => {
      try {
        const allCustomers = await customers.find().toArray();
        res.json(allCustomers);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar clientes" });
      }
    });

    app.post("/api/customers", authMiddleware, async (req, res) => {
      try {
        const { name, email, phone, companyId } = req.body;

        if (!name || !email || !companyId) {
          return res.status(400).json({
            message: "Nome, email e empresa são obrigatórios",
          });
        }

        if (!ObjectId.isValid(companyId)) {
          return res.status(400).json({ message: "ID da empresa inválido" });
        }

        const newCustomer = {
          name,
          email,
          phone: phone || "",
          company: new ObjectId(companyId),
          createdAt: new Date(),
        };

        const result = await customers.insertOne(newCustomer);
        res.status(201).json({ _id: result.insertedId, ...newCustomer });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao criar cliente" });
      }
    });

    app.put("/api/customers/:id", authMiddleware, async (req, res) => {
      try {
        const { id } = req.params;
        const { name, email, phone, companyId } = req.body;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "ID inválido" });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (companyId) {
          if (!ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: "ID da empresa inválido" });
          }
          updateData.company = new ObjectId(companyId);
        }

        const result = await customers.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Cliente não encontrado" });
        }

        res.json({ message: "Cliente atualizado com sucesso" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao atualizar cliente" });
      }
    });

    // ======================================
    // ROTAS PARA PEDIDOS (PROTEGIDAS)
    // ======================================
    app.get("/api/orders", authMiddleware, async (req, res) => {
      try {
        // Agregar pedidos com informações relacionadas
        const allOrders = await orders
          .aggregate([
            {
              $lookup: {
                from: "customers",
                localField: "customer",
                foreignField: "_id",
                as: "customer",
              },
            },
            {
              $lookup: {
                from: "companies",
                localField: "company",
                foreignField: "_id",
                as: "company",
              },
            },
            {
              $unwind: "$customer",
            },
            {
              $unwind: "$company",
            },
          ])
          .toArray();

        res.json(allOrders);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar pedidos" });
      }
    });

    app.post("/api/orders", authMiddleware, async (req, res) => {
      try {
        const { number, customerId, companyId, observation } = req.body;

        if (!number || !customerId || !companyId) {
          return res.status(400).json({
            message: "Número, cliente e empresa são obrigatórios",
          });
        }

        if (!ObjectId.isValid(customerId) || !ObjectId.isValid(companyId)) {
          return res.status(400).json({ message: "IDs inválidos" });
        }

        const newOrder = {
          number,
          customer: new ObjectId(customerId),
          company: new ObjectId(companyId),
          observation: observation || "",
          date: new Date(),
          createdAt: new Date(),
        };

        const result = await orders.insertOne(newOrder);
        res.status(201).json({ _id: result.insertedId, ...newOrder });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao criar pedido" });
      }
    });

    app.put("/api/orders/:id", authMiddleware, async (req, res) => {
      try {
        const { id } = req.params;
        const { number, customerId, companyId, observation } = req.body;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "ID inválido" });
        }

        const updateData = {};
        if (number) updateData.number = number;
        if (customerId) {
          if (!ObjectId.isValid(customerId)) {
            return res.status(400).json({ message: "ID do cliente inválido" });
          }
          updateData.customer = new ObjectId(customerId);
        }
        if (companyId) {
          if (!ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: "ID da empresa inválido" });
          }
          updateData.company = new ObjectId(companyId);
        }
        if (observation) updateData.observation = observation;

        const result = await orders.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Pedido não encontrado" });
        }

        res.json({ message: "Pedido atualizado com sucesso" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao atualizar pedido" });
      }
    });

    // ======================================
    // ROTAS PARA PEDIDO_PRODUTO (PROTEGIDAS)
    // ======================================
    app.post("/api/order-products", authMiddleware, async (req, res) => {
      try {
        const { orderId, productId, quantity } = req.body;

        if (!orderId || !productId || !quantity) {
          return res.status(400).json({
            message: "Pedido, produto e quantidade são obrigatórios",
          });
        }

        if (!ObjectId.isValid(orderId) || !ObjectId.isValid(productId)) {
          return res.status(400).json({ message: "IDs inválidos" });
        }

        const newOrderProduct = {
          order: new ObjectId(orderId),
          product: new ObjectId(productId),
          quantity: parseInt(quantity),
          createdAt: new Date(),
        };

        const result = await orderProducts.insertOne(newOrderProduct);
        res.status(201).json({ _id: result.insertedId, ...newOrderProduct });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao criar item do pedido" });
      }
    });

    app.get(
      "/api/order-products/:orderId",
      authMiddleware,
      async (req, res) => {
        try {
          const { orderId } = req.params;

          if (!ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "ID do pedido inválido" });
          }

          // Agregar produtos do pedido com informações completas
          const orderItems = await orderProducts
            .aggregate([
              { $match: { order: new ObjectId(orderId) } },
              {
                $lookup: {
                  from: "products",
                  localField: "product",
                  foreignField: "_id",
                  as: "product",
                },
              },
              { $unwind: "$product" },
            ])
            .toArray();

          res.json(orderItems);
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: "Erro ao buscar itens do pedido" });
        }
      }
    );

    app.put("/api/order-products/:id", authMiddleware, async (req, res) => {
      try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "ID inválido" });
        }

        if (!quantity) {
          return res.status(400).json({ message: "Quantidade é obrigatória" });
        }

        const result = await orderProducts.updateOne(
          { _id: new ObjectId(id) },
          { $set: { quantity: parseInt(quantity) } }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: "Item não encontrado" });
        }

        res.json({ message: "Item atualizado com sucesso" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao atualizar item" });
      }
    });

    // Rota protegida de exemplo
    app.get("/api/protected", authMiddleware, (req, res) => {
      res.json({
        message: "Acesso concedido à rota protegida.",
        user: req.user,
      });
    });

    app.listen(process.env.PORT, () => {
      console.log(`Server rodando na porta ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Erro ao iniciar o servidor:", err);
  }
}

start();
