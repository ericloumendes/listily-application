import { Express } from "express";
import swaggerUi from "swagger-ui-express";

export function registerSwagger(app: Express): void {
  const openapi = {
    openapi: "3.0.3",
    info: {
      title: "Full API Docs",
      version: "1.0.0",
      description: "API documentation for Usuario, Supermercado, Categoria, Lista, Produto, and Preco",
    },
    servers: [{ url: "/" }],
    components: {
      schemas: {
        Usuario: {
          type: "object",
          properties: {
            pk: { type: "integer" },
            nome: { type: "string" },
            email: { type: "string" },
            senha: { type: "string", description: "Password (hashed using bcrypt)" },
            rg: { type: "string" },
            data_criacao: { type: "string", format: "date" }
          },
          required: ["nome", "email", "senha", "rg"]
        },
        Supermercado: {
          type: "object",
          properties: {
            pk: { type: "integer" },
            nome: { type: "string" },
            endereco: { type: "string" }
          },
          required: ["nome", "endereco"]
        },
        Categoria: {
          type: "object",
          properties: {
            pk: { type: "integer" },
            nome: { type: "string" }
          },
          required: ["nome"]
        },
        Lista: {
          type: "object",
          properties: {
            pk: { type: "integer" },
            nome: { type: "string" },
            usuario_pk: { type: "integer" },
            usuario: { $ref: "#/components/schemas/Usuario" },
            produtos: { type: "array", items: { $ref: "#/components/schemas/Produto" } }
          }
        },
        Produto: {
          type: "object",
          properties: {
            pk: { type: "integer", description: "Primary key of the product" },
            nome: { type: "string", description: "Name of the product" },
            descricao: { type: "string", description: "Description of the product" },
            codigo_barras: { type: "string", description: "Barcode of the product" },
            data_cadastro: { type: "string", format: "date", description: "Date of product registration" },
            supermercado_pk: { type: "integer", description: "ID of the associated supermarket" },
            categoria_pk: { type: "integer", description: "ID of the associated category" },
            imagemBase64: { type: "string", description: "Base64 encoded image data" }
          },
          required: ["nome", "descricao", "codigo_barras", "data_cadastro", "supermercado_pk", "categoria_pk"]
        },
        Preco: {
          type: "object",
          properties: {
            pk: { type: "integer" },
            preco: { type: "number", format: "decimal" },
            data_registro: { type: "string", format: "date" },
            produto_pk: { type: "integer" },
            produto: { $ref: "#/components/schemas/Produto" }
          },
          required: ["preco", "data_registro", "produto_pk"]
        }
      }
    },
    paths: {
      "/auth/login": {
        post: {
          summary: "Authenticate a user and retrieve a JWT",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    email: { type: "string", description: "User email" },
                    senha: { type: "string", description: "User password" }
                  },
                  required: ["email", "senha"]
                },
                example: {
                  email: "user@example.com",
                  senha: "userpassword"
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Authentication successful, JWT returned",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      token: { type: "string", description: "JWT token" }
                    }
                  },
                  example: {
                    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  }
                }
              }
            },
            "400": { description: "Email or password missing" },
            "401": { description: "Invalid email or password" },
            "500": { description: "Server error" }
          }
        }
    },
      "/usuario": {
        post: {
          summary: "Create a new user",
          requestBody: {
            required: true,
            content: { "application/json": { schema: { $ref: "#/components/schemas/Usuario" } } }
          },
          responses: {
            "201": { description: "User created (password will be hashed)" },
            "400": { description: "Bad request" }
          }
        },
        get: { summary: "Get all users", responses: { "200": { description: "List of users" }, "404": { description: "No users found" } } }
      },
      "/usuario/{pk}": {
        get: {
          summary: "Get user by ID",
          parameters: [{ name: "pk", in: "path", required: true, schema: { type: "integer" } }],
          responses: { "200": { description: "User object" }, "404": { description: "User not found" } }
        },
        put: {
          summary: "Update user by ID",
          parameters: [{ name: "pk", in: "path", required: true, schema: { type: "integer" } }],
          requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Usuario" } } } },
          responses: {
            "200": { description: "Updated user (password will be hashed if provided)" },
            "400": { description: "Bad request" },
            "404": { description: "User not found" }
          }
        },
        delete: {
          summary: "Delete user by ID",
          parameters: [{ name: "pk", in: "path", required: true, schema: { type: "integer" } }],
          responses: { "204": { description: "User deleted" }, "404": { description: "User not found" } }
        }
      },
      "/supermercado": {
        post: { summary: "Create a new supermercado", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Supermercado" } } } }, responses: { "201": { description: "Supermercado created" }, "400": { description: "Bad request" } } },
        get: { summary: "Get all supermercados", responses: { "200": { description: "List of supermercados" }, "404": { description: "No supermercados found" } } }
      },
      "/supermercado/{pk}": {
        get: { summary: "Get supermercado by ID", parameters: [{ name: "pk", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Supermercado object" }, "404": { description: "Supermercado not found" } } },
        put: { summary: "Update supermercado by ID", parameters: [{ name: "pk", in: "path", required: true, schema: { type: "integer" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Supermercado" } } } }, responses: { "200": { description: "Updated supermercado" }, "400": { description: "Bad request" }, "404": { description: "Supermercado not found" } } },
        delete: { summary: "Delete supermercado by ID", parameters: [{ name: "pk", in: "path", required: true, schema: { type: "integer" } }], responses: { "204": { description: "Supermercado deleted" }, "404": { description: "Supermercado not found" } } }
      },
      "/categoria": {
        post: { summary: "Create a new category", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Categoria" } } } }, responses: { "201": { description: "Category created" }, "400": { description: "Bad request" } } },
        get: { summary: "Get all categories", responses: { "200": { description: "List of categories" }, "404": { description: "No categories found" } } }
      },
      "/categoria/{pk}": {
        get: { summary: "Get category by ID", parameters: [{ name: "pk", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Category object" }, "404": { description: "Category not found" } } },
        put: { summary: "Update category by ID", parameters: [{ name: "pk", in: "path", required: true, schema: { type: "integer" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Categoria" } } } }, responses: { "200": { description: "Updated category" }, "400": { description: "Bad request" }, "404": { description: "Category not found" } } },
        delete: { summary: "Delete category by ID", parameters: [{ name: "pk", in: "path", required: true, schema: { type: "integer" } }], responses: { "204": { description: "Category deleted" }, "404": { description: "Category not found" } } }
      },
      "/lista": {
        post: { summary: "Create a new list", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Lista" } } } }, responses: { "201": { description: "List created" } } },
        get: { summary: "Get all lists", responses: { "200": { description: "List of lists" } } }
      },
      "/lista/{pk}": {
        get: { summary: "Get list by ID", parameters: [{ name: "pk", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "List object" }, "404": { description: "List not found" } } },
        put: { summary: "Update list by ID", parameters: [{ name: "pk", in: "path", required: true, schema: { type: "integer" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Lista" } } } }, responses: { "200": { description: "Updated list" }, "404": { description: "List not found" } } },
        delete: { summary: "Delete list by ID", parameters: [{ name: "pk", in: "path", required: true, schema: { type: "integer" } }], responses: { "204": { description: "List deleted" }, "404": { description: "List not found" } } }
      },
      "/lista/usuario/{usuario_pk}": {
        get: { summary: "Get all lists by user ID", parameters: [{ name: "usuario_pk", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Lists of the user" }, "404": { description: "No lists found for this user" } } }
      },
      "/produto": {
        post: { summary: "Create a new product", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Produto" } } } }, responses: { "201": { description: "Product created" }, "400": { description: "Bad request" }, "404": { description: "Supermercado or Categoria not found" } } },
        get: { summary: "Get all products", responses: { "200": { description: "List of products" }, "404": { description: "No products found" } } }
      },
      "/produto/{pk}": {
        get: { summary: "Get product by ID", parameters: [{ name: "pk", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Product object" }, "404": { description: "Product not found" } } },
        put: { summary: "Update product by ID", parameters: [{ name: "pk", in: "path", required: true, schema: { type: "integer" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Produto" } } } }, responses: { "200": { description: "Updated product" }, "400": { description: "Bad request" }, "404": { description: "Product, Supermercado or Categoria not found" } } },
        delete: { summary: "Delete product by ID", parameters: [{ name: "pk", in: "path", required: true, schema: { type: "integer" } }], responses: { "204": { description: "Product deleted" }, "404": { description: "Product not found" } } }
      },
      "/produto/lista": {
        post: { summary: "Add a product to a list", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { produto_pk: { type: "integer" }, lista_pk: { type: "integer" } }, required: ["produto_pk","lista_pk"] } } } }, responses: { "200": { description: "Product added to list" }, "400": { description: "Bad request" }, "404": { description: "Product or List not found" } } },
      },
      "/produto/lista/remover": {
        post: { summary: "Remove a product from a list", requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { produto_pk: { type: "integer" }, lista_pk: { type: "integer" } }, required: ["produto_pk","lista_pk"] } } } }, responses: { "200": { description: "Product removed from list" }, "400": { description: "Bad request" }, "404": { description: "Product or List not found" } } }
      },
      "/produto/codigo-barras": {
        post: {
          summary: "Search for a product by barcode",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    codigo_barras: { type: "string", description: "Product's barcode" }
                  },
                  required: ["codigo_barras"]
                },
                example: {
                  codigo_barras: "12345"
                }
              }
            }
          },
          responses: {
            "200": {
              description: "Product found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Produto" }
                }
              }
            },
            "400": { description: "Bad request, missing codigo_barras" },
            "404": { description: "Product not found" },
            "500": { description: "Internal server error" }
          }
        }
      },
      "/preco": {
        post: { summary: "Create a new price record", requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Preco" } } } }, responses: { "201": { description: "Price record created" }, "400": { description: "Bad request" }, "404": { description: "Produto not found" } } },
        get: { summary: "Get all price records", responses: { "200": { description: "List of price records" }, "404": { description: "No price records found" } } }
      },
      "/preco/{pk}": {
        get: { summary: "Get price record by ID", parameters: [{ name: "pk", in: "path", required: true, schema: { type: "integer" } }], responses: { "200": { description: "Price record object" }, "404": { description: "Price record not found" } } },
        put: { summary: "Update price record by ID", parameters: [{ name: "pk", in: "path", required: true, schema: { type: "integer" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Preco" } } } }, responses: { "200": { description: "Updated price record" }, "400": { description: "Bad request" }, "404": { description: "Price record or Produto not found" } } },
        delete: { summary: "Delete price record by ID", parameters: [{ name: "pk", in: "path", required: true, schema: { type: "integer" } }], responses: { "204": { description: "Price record deleted" }, "404": { description: "Price record not found" } } }
      }
    }
  } as const;

  app.use("/", swaggerUi.serve, swaggerUi.setup(openapi, { explorer: false }));
  app.get("/openapi.json", (_req, res) => res.json(openapi));
}
