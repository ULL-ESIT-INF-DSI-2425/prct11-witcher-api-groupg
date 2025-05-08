[![Tests](https://github.com/ULL-ESIT-INF-DSI-2425/prct11-witcher-api-groupg/actions/workflows/ci.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2425/prct11-witcher-api-groupg/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/ULL-ESIT-INF-DSI-2425/prct11-witcher-api-groupg/badge.svg?branch=main)](https://coveralls.io/github/ULL-ESIT-INF-DSI-2425/prct11-witcher-api-groupg?branch=main)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=ULL-ESIT-INF-DSI-2425_prct11-witcher-api-groupg&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=ULL-ESIT-INF-DSI-2425_prct11-witcher-api-groupg)


Transactions:
POST
localhost:3000/transactions
Body:
{
  "goods": [
    {
      "name": "Espada"
      "amount": 10
    },
    {
      "name": "Escudo"
      "amount": 5
    }
  ],
  "involvedName": "Pepe",
  "involvedType": "Hunter",
  "type": "Buy"
}
GET
localhost:3000/transactions/id
localhost:3000/transactions/?name=xxx&type=xxx

# ⚔️ API REST La Posada del Lobo Blanco ⚔️ 

## ✍️ Autores
- 👤 **Jonathan Martínez Pérez - alu0101254098@ull.edu.es**
- 👤 **José Ángel Mederos Rivas - alu0101368832@ull.edu.es**
- 👤 **Joel Saavedra Páez - alu0101437415@ull.edu.es**

## 📜 Descripción del Proyecto  
Este sistema se encarga de gestionar el inventario de la Posada del Lobo Blanco, del mundo de The Witcher. Su objetivo es facilitar la administración de recursos, permitiendo el registro, consulta y control de bienes, mercaderes, clientes y transacciones.   
Se utilizará la extensión de Visual Studio **POSTMAN** para realizar las HTTP Requests  
Se hace uso de **MongoDB** para ofrecer una base de datos en la que almacenar los diferentes objetos.

## 🔍 Elementos del Sistema

### 📦 Bien
Un bien consta de los siguientes atributos:
- Un **ID** único que permita identificarlo.
- Su **nombre**.
- Una **descripción** que refleje la historia y utilidad del bien.
- El **material** de que está hecho.
- Su **peso**.
- Su **valor** en coronas.

### 🧒 Cliente
Un cliente tiene los siguientes atributos:
- Su **nombre**.
- Su **raza**(humano, elfo, enano...).
- La **ubicación** en la que se encuentra.

### 🧒 Mercader
Un mercader tiene los siguientes atributos:
- Su **nombre**.
- Su **tipo**(herrero, alquimista, general...).
- La **ubicación** en la que se encuentra.

### 💰 Transacción
Una transacción deberá contemplar los siguientes atributos:
- El **tipo** de transacción. Podemos diferenciar 2 tipos:
  - Venta realizada a un mercader.
  - Compra realizada a un cliente.
- La **fecha** en la que se realiza la transacción.
- La lista de **bienes** intercambiados.
- La cantidad de **coronas** involucradas en la transacción.
- El **involucrado**, siendo este el mercader en caso de compra o el cliente en caso de venta. 

## ⚙️ Requisitos del Sistema  
Antes de proceder con la instalación, asegúrate de contar con los siguientes requisitos:  

| Requisito  | Versión Recomendada |
|------------|---------------------|
| 🟢 **Node.js**  | `>= 22.0.0` |
| 🔴 **npm**  | `>= 9.0.0` |
| 🔵 **TypeScript** | `>= 5.0.0` |

---

## </> Obtener el Código 
Para obtener el código fuente debes clonar este repositorio, para ello ejecuta el siguiente comando:  

```sh
git clone https://github.com/ULL-ESIT-INF-DSI-2425/prct11-witcher-api-groupg.git
cd prct11-witcher-api-groupg
```

---

## 🛠 Dependencias 
Este programa necesita una serie de dependencias para funcionar, entre ellas se encuentran: TSDoc, Inquirer.js, Vitest, LowDB, entre otras.
Ejecuta el siguiente comando para instalar todas las dependencias necesarias:  

```sh
npm install
```

---

## 💾 Base de Datos
Utilizaremos un cluster en Mongo Atlas para al almacenar los bienes, los mercaderes, los clientes y las transacciones.

## 🚀 Ejecución
Para compilar y ejecutar el sistema ejecuta el siguiente comando:  

```sh
tsc
npm run dev
```

## 📦 Goods API

### **POST** `/goods`

Crea un nuevo bien.

#### 🔸 Body:
```json
{
  "name": "Espada",
  "description": "Espada larga",
  "material": "Plata",
  "weight": 5,
  "stock": 2,
  "value": 500
}
```

#### 🔸 Responses:
- `201 Created`: Retorna bien creado.
- `501 Not Implemented`: Retorna error.

---

### **GET** `/goods?name=xxx&description=xxx&material=xxx`

Obtiene bienes filtrados por parámetros opcionales.

#### 🔸 Parámetros (opcionales):
- `name`: nombre del bien.
- `description`: descripción del bien.
- `material`: material del bien.

#### 🔸 Responses:
- `200 OK`: Retorna lista de bienes que cumplen con los filtros.
- `404 Not Found`: No hay bienes que cumplan.
- `500`: Retorna error.

---

### **GET** `/goods/:id`

Obtiene un bien por su ID.

#### 🔸 Parámetros:
- `id`: ID del bien a buscar.

#### 🔸 Responses:
- `200 OK`: Retorna el bien solicitado.
- `404 Not Found`: Bien no encontrado.
- `500`: Retorna error.

---

### **PATCH** `/goods?name=xxx`

Actualiza un bien por su nombre.

#### 🔸 Parámetros:
- `name`: nombre del bien.

#### 🔸 Body:
```json
{
  "stock": 2,
  "value": 500
}
```

#### 🔸 Responses:
- `200 OK`: Retorna el bien actualizado.
- `400 Bad Request`: Actualización no válida o falta el nombre.
- `404 Not Found`: No hay bien con el nombre especificado.
- `500`: Retorna error.

---

### **PATCH** `/goods/:id`

Actualiza un bien por su ID.

#### 🔸 Parámetros:
- `id`: ID del bien.

#### 🔸 Body:
```json
{
  "stock": 2,
  "value": 500
}
```

#### 🔸 Responses:
- `200 OK`: Retorna el bien actualizado.
- `400 Bad Request`: Actualización no válida.
- `404 Not Found`: Bien no encontrado.
- `500`: Retorna error.

---

### **DELETE** `/goods?name=xxx&description=xxx&material=xxx`

Elimina bienes por filtros opcionales.

#### 🔸 Parámetros (opcionales):
- `name`
- `description`
- `material`

#### 🔸 Responses:
- `200 OK`: Retorna lista de bienes eliminados.
- `404 Not Found`: No hay bienes que cumplan.
- `500`: Retorna error.

---

### **DELETE** `/goods/:id`

Elimina un bien por su ID.

#### 🔸 Parámetros:
- `id`: ID del bien a eliminar.

#### 🔸 Responses:
- `200 OK`: Retorna lista de bienes eliminados.
- `404 Not Found`: Bien no encontrado.
- `500`: Retorna error.

---

## 🧝 Hunters API

### **POST** `/hunter`
Crea un nuevo cazador.

#### 🔸 Body:
```json
{
  "name": "Yennefer de Vengerberg",
  "type": "Hechicero",
  "location": "Novigrado",
}
```

#### 🔸 Responses:
- `201 Created`: Retorna cazador creado.
- `501 Not Implemented`: Retorna error.

---

### **GET** `/hunter?name=xxx&type=xxx&location=xxx`

Obtiene cazadores filtrados por parámetros opcionales.

#### 🔸 Parámetros (opcionales):
- `name`: nombre del cazador.
- `type`: tipo del cazador.
- `location`: ubicación del cazador.

#### 🔸 Responses:
- `200 OK`: Retorna lista de cazadores que cumplen con los filtros.
- `404 Not Found`: No hay cazadores que cumplan.
- `500`: Retorna error.

---

### **GET** `/hunter/:id`

Obtiene un cazador por su ID.

#### 🔸 Parámetros:
- `id`: ID del cazador a buscar.

#### 🔸 Responses:
- `200 OK`: Retorna el cazador solicitado.
- `404 Not Found`: Cazador no encontrado.
- `500`: Retorna error.

---

### **PATCH** `/hunter?name=xxx`

Actualiza un cazador por su nombre.

#### 🔸 Parámetros:
- `name`: nombre del cazador.

#### 🔸 Body:
```json
{
  "location": "Kaer Morhen"
}
```

#### 🔸 Responses:
- `200 OK`: Retorna el cazador actualizado.
- `400 Bad Request`: Actualización no válida o falta el nombre.
- `404 Not Found`: No hay cazador con el nombre especificado.
- `500`: Retorna error.

---

### **PATCH** `/hunter/:id`

Actualiza un cazador por su ID.

#### 🔸 Parámetros:
- `id`: ID del cazador.

#### 🔸 Body:
```json
{
  "stock": 2,
  "value": 500
}
```

#### 🔸 Responses:
- `200 OK`: Retorna el cazador actualizado.
- `400 Bad Request`: Actualización no válida.
- `404 Not Found`: Cazador no encontrado.
- `500`: Retorna error.

---

### **DELETE** `/hunter?name=xxx&type=xxx&location=xxx`

Elimina cazadores por filtros opcionales.

#### 🔸 Parámetros (opcionales):
- `name`
- `type`
- `location`

#### 🔸 Responses:
- `200 OK`: Retorna lista de cazadores eliminados.
- `404 Not Found`: No hay cazadores que cumplan.
- `500`: Retorna error.

---

### **DELETE** `/hunter/:id`

Elimina un cazador por su ID.

#### 🔸 Parámetros:
- `id`: ID del cazador a eliminar.

#### 🔸 Responses:
- `200 OK`: Retorna lista de cazadores eliminados.
- `404 Not Found`: Cazador no encontrado.
- `500`: Retorna error.

---

## 🧙 Merchants API

### **POST** `/merchant`
Crea un nuevo mercader.

#### 🔸 Body:
```json
{
  "name": "Hattori",
  "type": "Herrero",
  "location": "Novigrad"
}
```

#### 🔸 Responses:
- `201 Created`: Retorna mercader creado.
- `501 Not Implemented`: Retorna error.

---

### **GET** `/merchant?name=xxx&type=xxx&location=xxx`

Obtiene mercaderes filtrados por parámetros opcionales.

#### 🔸 Parámetros (opcionales):
- `name`: nombre del mercader.
- `type`: tipo del mercader.
- `location`: ubicación del mercader.

#### 🔸 Responses:
- `200 OK`: Retorna lista de mercaderes que cumplen con los filtros.
- `404 Not Found`: No hay mercaderes que cumplan.
- `500`: Retorna error.

---

### **GET** `/merchant/:id`

Obtiene un mercader por su ID.

#### 🔸 Parámetros:
- `id`: ID del mercader a buscar.

#### 🔸 Responses:
- `200 OK`: Retorna el mercader solicitado.
- `404 Not Found`: Mercader no encontrado.
- `500`: Retorna error.

---

### **PATCH** `/merchant?name=xxx`

Actualiza un mercader por su nombre.

#### 🔸 Parámetros:
- `name`: nombre del mercader.

#### 🔸 Body:
```json
{
  "location": "Vizima"
}
```

#### 🔸 Responses:
- `200 OK`: Retorna el mercader actualizado.
- `400 Bad Request`: Actualización no válida o falta el nombre.
- `404 Not Found`: No hay mercader con el nombre especificado.
- `500`: Retorna error.

---

### **PATCH** `/merchant/:id`

Actualiza un mercader por su ID.

#### 🔸 Parámetros:
- `id`: ID del mercader.

#### 🔸 Body:
```json
{
  "stock": 2,
  "value": 500
}
```

#### 🔸 Responses:
- `200 OK`: Retorna el mercader actualizado.
- `400 Bad Request`: Actualización no válida.
- `404 Not Found`: Mercader no encontrado.
- `500`: Retorna error.

---

### **DELETE** `/merchant?name=xxx&type=xxx&location=xxx`

Elimina mercaderes por filtros opcionales.

#### 🔸 Parámetros (opcionales):
- `name`
- `type`
- `location`

#### 🔸 Responses:
- `200 OK`: Retorna lista de mercaderes eliminados.
- `404 Not Found`: No hay mercaderes que cumplan.
- `500`: Retorna error.

---

### **DELETE** `/merchant/:id`

Elimina un mercader por su ID.

#### 🔸 Parámetros:
- `id`: ID del mercader a eliminar.

#### 🔸 Responses:
- `200 OK`: Retorna lista de mercaderes eliminados.
- `404 Not Found`: Mercader no encontrado.
- `500`: Retorna error.

---

## 🔁 Transactions API

### **POST** `/transactions`
De los bienes especificados se meterán en la transaccion los que existan o los que tengan stock, el resto se ignorarán, si no hay stock de ninguno o ninguno existe se mostrará un error
#### 🔸 Body:
```json
{
    "goods": [
        {
            "name": "Espada",
            "amount": 20
        },
        {
            "name": "Escudo",
            "amount": 1
        }
    ],
    "involvedName": "XX",
    "involvedType": "Hunter",
    "type": "Buy"
}
```
### **GET** `/transactions`

### **GET** `/transactions/:id`

### **PATCH** `/transactions`

### **PATCH** `/transactions/:id`

### **DELETE** `/transactions`

### **DELETE** `/transactions/:id`
