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
    const orderProducts = db.collection("order_products");

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
        const allProducts = await products
          .find({ userId: new ObjectId(req.user.id) })
          .toArray();

        const formattedProducts = allProducts.map((product) => ({
          ...product,
          _id: product._id.toString(),
          company: product.company.toString(),
        }));

        res.json(formattedProducts);
      } catch (err) {
        console.error(err);
        res.status(500).json({
          message: "Erro ao buscar produtos",
          error: err.message,
        });
      }
    });

    app.post("/api/products", authMiddleware, async (req, res) => {
      try {
        const { name, price, description, company } = req.body;

        // Validações
        if (!name || typeof name !== "string" || name.trim().length < 2) {
          return res.status(400).json({
            message: "Nome do produto deve ter pelo menos 2 caracteres",
          });
        }

        const priceNum = parseFloat(price);
        if (isNaN(priceNum) || priceNum <= 0) {
          return res.status(400).json({
            message: "Preço deve ser um número positivo",
          });
        }

        if (!company || !ObjectId.isValid(company)) {
          return res.status(400).json({
            message: "ID da empresa inválido",
          });
        }

        // Verificar se empresa existe e pertence ao usuário
        const companyExists = await companies.findOne({
          _id: new ObjectId(company),
          userId: new ObjectId(req.user.id)
        });

        if (!companyExists) {
          return res.status(400).json({
            message: "Empresa não encontrada ou não pertence a você",
          });
        }

        const newProduct = {
          name: name.trim(),
          price: priceNum,
          description: description?.trim() || "",
          company: new ObjectId(company),
          createdAt: new Date(),
          userId: new ObjectId(req.user.id)
        };

        const result = await products.insertOne(newProduct);

        const insertedProduct = {
          ...newProduct,
          _id: result.insertedId.toString(),
          company: company,
        };

        res.status(201).json(insertedProduct);
      } catch (err) {
        console.error("Erro completo:", err);

        if (err.name === "MongoServerError" && err.code === 121) {
          const validationErrors = [];
          if (err.errInfo && err.errInfo.details) {
            err.errInfo.details.schemaRulesNotSatisfied.forEach((rule) => {
              rule.propertiesNotSatisfied?.forEach((prop) => {
                validationErrors.push(
                  `${prop.propertyName}: ${prop.description}`
                );
              });
            });
          }

          return res.status(400).json({
            message: "Erro de validação",
            details:
              validationErrors.length > 0
                ? validationErrors
                : err.errInfo.details,
          });
        }

        res.status(500).json({
          message: "Erro ao criar produto",
          error: err.message,
        });
      }
    });

    app.put("/api/products/:id", authMiddleware, async (req, res) => {
      try {
        const { id } = req.params;
        const { name, price, description, companyId } = req.body;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "ID inválido" });
        }

        // Verificar se o produto pertence ao usuário
        const product = await products.findOne({
          _id: new ObjectId(id),
          userId: new ObjectId(req.user.id)
        });

        if (!product) {
          return res.status(404).json({ message: "Produto não encontrado" });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (price) updateData.price = parseFloat(price);
        if (description) updateData.description = description;
        if (companyId) {
          // Verificar se a nova empresa pertence ao usuário
          const companyExists = await companies.findOne({
            _id: new ObjectId(companyId),
            userId: new ObjectId(req.user.id)
          });
          
          if (!companyExists) {
            return res.status(400).json({
              message: "Empresa não encontrada ou não pertence a você"
            });
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
        
        const updatedProduct = await products.findOne({
          _id: new ObjectId(id),
        });

        res.json({
          ...updatedProduct,
          _id: updatedProduct._id.toString(),
          company: updatedProduct.company.toString(),
        });
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

        const product = await products.findOne({
          _id: new ObjectId(id),
          userId: new ObjectId(req.user.id)
        });

        if (!product) {
          return res.status(404).json({ message: "Produto não encontrado" });
        }

        res.json(product);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar produto" });
      }
    });

    app.delete("/api/products/:id", authMiddleware, async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "ID de produto inválido" });
        }

        // Verificar se o produto pertence ao usuário
        const product = await products.findOne({
          _id: new ObjectId(id),
          userId: new ObjectId(req.user.id)
        });

        if (!product) {
          return res.status(404).json({ message: "Produto não encontrado" });
        }

        const result = await products.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Produto não encontrado" });
        }

        res.json({ message: "Produto excluído com sucesso" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao excluir produto" });
      }
    });

    // ======================================
    // ROTAS PARA EMPRESAS (PROTEGIDAS)
    // ======================================
    app.get("/api/companies", authMiddleware, async (req, res) => {
      try {
        const allCompanies = await companies
          .find({ userId: new ObjectId(req.user.id) })
          .toArray();

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
          userId: new ObjectId(req.user.id),
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

        // Verificar se a empresa pertence ao usuário
        const company = await companies.findOne({
          _id: new ObjectId(id),
          userId: new ObjectId(req.user.id)
        });

        if (!company) {
          return res.status(404).json({ message: "Empresa não encontrada" });
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

    app.delete("/api/companies/:id", authMiddleware, async (req, res) => {
      try {
        const { id } = req.params;

        // Verificar se a empresa pertence ao usuário
        const company = await companies.findOne({
          _id: new ObjectId(id),
          userId: new ObjectId(req.user.id)
        });

        if (!company) {
          return res.status(404).json({ message: "Empresa não encontrada" });
        }

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "ID inválido" });
        }

        const result = await companies.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Empresa não encontrada" });
        }

        res.json({ message: "Empresa excluída com sucesso" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao excluir empresa" });
      }
    });

    // ======================================
    // ROTAS PARA CLIENTES (PROTEGIDAS)
    // ======================================
    app.get("/api/customers", authMiddleware, async (req, res) => {
      try {
        const allCustomers = await customers
          .find({ userId: new ObjectId(req.user.id) })
          .toArray();
          
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

        // Verificar se a empresa pertence ao usuário
        const company = await companies.findOne({
          _id: new ObjectId(companyId),
          userId: new ObjectId(req.user.id)
        });

        if (!company) {
          return res.status(400).json({
            message: "Empresa não encontrada ou não pertence a você"
          });
        }

        const newCustomer = {
          name,
          email,
          phone: phone || "",
          company: new ObjectId(companyId),
          createdAt: new Date(),
          userId: new ObjectId(req.user.id)
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

        // Verificar se o cliente pertence ao usuário
        const customer = await customers.findOne({
          _id: new ObjectId(id),
          userId: new ObjectId(req.user.id)
        });

        if (!customer) {
          return res.status(404).json({ message: "Cliente não encontrado" });
        }

        const updateData = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phone) updateData.phone = phone;
        if (companyId) {
          if (!ObjectId.isValid(companyId)) {
            return res.status(400).json({ message: "ID da empresa inválido" });
          }
          
          // Verificar se a nova empresa pertence ao usuário
          const company = await companies.findOne({
            _id: new ObjectId(companyId),
            userId: new ObjectId(req.user.id)
          });
          
          if (!company) {
            return res.status(400).json({
              message: "Empresa não encontrada ou não pertence a você"
            });
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

    app.delete("/api/customers/:id", authMiddleware, async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "ID inválido" });
        }

        // Verificar se o cliente pertence ao usuário
        const customer = await customers.findOne({
          _id: new ObjectId(id),
          userId: new ObjectId(req.user.id)
        });

        if (!customer) {
          return res.status(404).json({ message: "Cliente não encontrado" });
        }

        const result = await customers.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Cliente não encontrado" });
        }

        res.json({ message: "Cliente excluído com sucesso" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao excluir cliente" });
      }
    });

    // ======================================
    // ROTAS PARA PEDIDOS (PROTEGIDAS)
    // ======================================
    app.get("/api/orders", authMiddleware, async (req, res) => {
      try {
        const ordersList = await orders
          .aggregate([
            {
              $match: { userId: new ObjectId(req.user.id) }
            },
            {
              $lookup: {
                from: "customers",
                localField: "customer",
                foreignField: "_id",
                as: "customer"
              }
            },
            { $unwind: "$customer" },
            {
              $lookup: {
                from: "companies",
                localField: "company",
                foreignField: "_id",
                as: "company"
              }
            },
            { $unwind: "$company" },
            {
              $lookup: {
                from: "orderProducts",
                localField: "_id",
                foreignField: "order",
                as: "items",
              },
            },
            {
              $addFields: {
                calculatedTotal: {
                  $sum: {
                    $map: {
                      input: "$items",
                      as: "item",
                      in: {
                        $multiply: ["$$item.quantity", "$$item.product.price"],
                      },
                    },
                  },
                },
              },
            },
            {
              $project: {
                _id: 1,
                number: 1,
                customer: {
                  _id: 1,
                  name: 1
                },
                company: {
                  _id: 1,
                  tradeName: 1
                },
                observation: 1,
                date: 1,
                status: 1,
                total: { $ifNull: ["$total", "$calculatedTotal"] },
              },
            },
          ])
          .toArray();

        res.json(ordersList);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao buscar pedidos" });
      }
    });

    app.post("/api/orders", authMiddleware, async (req, res) => {
      try {
        const { customerId, companyId, observation, total } = req.body;

        if (!customerId || !companyId || total === undefined) {
          return res.status(400).json({
            message: "Cliente, empresa e total são obrigatórios",
          });
        }

        if (!ObjectId.isValid(customerId) || !ObjectId.isValid(companyId)) {
          return res.status(400).json({ message: "IDs inválidos" });
        }

        // Verificar se o cliente pertence ao usuário
        const customer = await customers.findOne({
          _id: new ObjectId(customerId),
          userId: new ObjectId(req.user.id)
        });

        if (!customer) {
          return res.status(400).json({
            message: "Cliente não encontrado ou não pertence a você"
          });
        }

        // Verificar se a empresa pertence ao usuário
        const company = await companies.findOne({
          _id: new ObjectId(companyId),
          userId: new ObjectId(req.user.id)
        });

        if (!company) {
          return res.status(400).json({
            message: "Empresa não encontrada ou não pertence a você"
          });
        }

        const newOrder = {
          number: `PED-${Date.now()}`,
          customer: new ObjectId(customerId),
          company: new ObjectId(companyId),
          observation,
          total: parseFloat(total),
          date: new Date(),
          createdAt: new Date(),
          status: "pendente",
          userId: new ObjectId(req.user.id)
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
        const { status, observation } = req.body;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "ID inválido" });
        }

        // Verificar se o pedido pertence ao usuário
        const order = await orders.findOne({
          _id: new ObjectId(id),
          userId: new ObjectId(req.user.id)
        });

        if (!order) {
          return res.status(404).json({ message: "Pedido não encontrado" });
        }

        const updateFields = {};
        if (status) updateFields.status = status;
        if (observation) updateFields.observation = observation;

        if (Object.keys(updateFields).length === 0) {
          return res.status(400).json({ message: "Nada para atualizar" });
        }

        const result = await orders.updateOne(
          { _id: new ObjectId(id) },
          { $set: updateFields }
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

    app.delete("/api/orders/:id", authMiddleware, async (req, res) => {
      try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
          return res.status(400).json({ message: "ID inválido" });
        }

        // Verificar se o pedido pertence ao usuário
        const order = await orders.findOne({
          _id: new ObjectId(id),
          userId: new ObjectId(req.user.id)
        });

        if (!order) {
          return res.status(404).json({ message: "Pedido não encontrado" });
        }

        // Deletar itens do pedido primeiro
        await orderProducts.deleteMany({ order: new ObjectId(id) });

        // Deletar o pedido
        const result = await orders.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ message: "Pedido não encontrado" });
        }

        res.json({ message: "Pedido deletado com sucesso" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Erro ao deletar pedido" });
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

        // Verificar se o pedido pertence ao usuário
        const order = await orders.findOne({
          _id: new ObjectId(orderId),
          userId: new ObjectId(req.user.id)
        });

        if (!order) {
          return res.status(400).json({
            message: "Pedido não encontrado ou não pertence a você"
          });
        }

        // Verificar se o produto pertence ao usuário
        const product = await products.findOne({
          _id: new ObjectId(productId),
          userId: new ObjectId(req.user.id)
        });

        if (!product) {
          return res.status(400).json({
            message: "Produto não encontrado ou não pertence a você"
          });
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

          // Verificar se o pedido pertence ao usuário
          const order = await orders.findOne({
            _id: new ObjectId(orderId),
            userId: new ObjectId(req.user.id)
          });

          if (!order) {
            return res.status(400).json({
              message: "Pedido não encontrado ou não pertence a você"
            });
          }

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

        // Verificar se o item existe e pertence a um pedido do usuário
        const orderItem = await orderProducts.findOne({
          _id: new ObjectId(id)
        });
        
        if (!orderItem) {
          return res.status(404).json({ message: "Item não encontrado" });
        }
        
        // Verificar se o pedido pertence ao usuário
        const order = await orders.findOne({
          _id: orderItem.order,
          userId: new ObjectId(req.user.id)
        });

        if (!order) {
          return res.status(403).json({
            message: "Você não tem permissão para editar este item"
          });
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

    app.delete(
      "/api/order-products/delete-by-order/:orderId",
      authMiddleware,
      async (req, res) => {
        try {
          const { orderId } = req.params;

          if (!ObjectId.isValid(orderId)) {
            return res.status(400).json({ message: "ID do pedido inválido" });
          }

          // Verificar se o pedido pertence ao usuário
          const order = await orders.findOne({
            _id: new ObjectId(orderId),
            userId: new ObjectId(req.user.id)
          });

          if (!order) {
            return res.status(403).json({
              message: "Você não tem permissão para excluir estes itens"
            });
          }

          const result = await orderProducts.deleteMany({
            order: new ObjectId(orderId),
          });

          res.json({
            message: `${result.deletedCount} itens deletados com sucesso`,
          });
        } catch (err) {
          console.error(err);
          res.status(500).json({ message: "Erro ao deletar itens do pedido" });
        }
      }
    );

    app.listen(process.env.PORT, () => {
      console.log(`Server rodando na porta ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Erro ao iniciar o servidor:", err);
  }
}

start();