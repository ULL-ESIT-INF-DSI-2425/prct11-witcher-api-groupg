[![Tests](https://github.com/ULL-ESIT-INF-DSI-2425/prct11-witcher-api-groupg/actions/workflows/ci.yml/badge.svg)](https://github.com/ULL-ESIT-INF-DSI-2425/prct11-witcher-api-groupg/actions/workflows/ci.yml)
[![Coverage Status](https://coveralls.io/repos/github/ULL-ESIT-INF-DSI-2425/prct11-witcher-api-groupg/badge.svg?branch=main)](https://coveralls.io/github/ULL-ESIT-INF-DSI-2425/prct11-witcher-api-groupg?branch=main)

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
- El **material** de que está hecho:
  - Steel
  - Wood
  - Stone
  - Iron
  - Leather
  - Cloth
  - Glass
  - Bronze
  - Silver
  - Gold
  - Unknown
- Su **peso**.
- Su **valor** en coronas.

### 🧒 Cliente
Un cliente tiene los siguientes atributos:
- Su **nombre**.
- Su **raza**:
  - Human
  - Elf
  - Dwarf
  - Orc
  - Sorcerer
  - Mage
  - Warrior
  - Hunter
  - Barbarian
  - Cleric
  - Assassin
  - Unknown
- La **ubicación** en la que se encuentra.

### 🧒 Mercader
Un mercader tiene los siguientes atributos:
- Su **nombre**.
- Su **tipo**:
  - General
  - Alchemist
  - Blacksmith
  - Gunsmith
  - Craftman
  - Tailor
  - Jeweler
  - Mage
  - Unknown
- La **ubicación** en la que se encuentra.

### 💰 Transacción
Una transacción deberá contemplar los siguientes atributos:
- El **tipo** de transacción. Podemos diferenciar 2 tipos:
  - Venta realizada de un mercader.
  - Compra realizada de un cliente.
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
  "name": "Sword",
  "description": "Long sword",
  "material": "Silver",
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
  "name": "Sword",
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
  "name": "Sword",
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

### **POST** `/hunters`
Crea un nuevo cazador.

#### 🔸 Body:
```json
{
  "name": "Yennefer of Vengerberg",
  "race": "Sorcerer",
  "location": "Novigrad",
}
```

#### 🔸 Responses:
- `201 Created`: Retorna cazador creado.
- `501 Not Implemented`: Retorna error.

---

### **GET** `/hunters?name=xxx&race=xxx&location=xxx`

Obtiene cazadores filtrados por parámetros opcionales.

#### 🔸 Parámetros (opcionales):
- `name`: nombre del cazador.
- `race`: raza del cazador.
- `location`: ubicación del cazador.

#### 🔸 Responses:
- `200 OK`: Retorna lista de cazadores que cumplen con los filtros.
- `404 Not Found`: No hay cazadores que cumplan.
- `500`: Retorna error.

---

### **GET** `/hunters/:id`

Obtiene un cazador por su ID.

#### 🔸 Parámetros:
- `id`: ID del cazador a buscar.

#### 🔸 Responses:
- `200 OK`: Retorna el cazador solicitado.
- `404 Not Found`: Cazador no encontrado.
- `500`: Retorna error.

---

### **PATCH** `/hunters?name=xxx`

Actualiza un cazador por su nombre.

#### 🔸 Parámetros:
- `name`: nombre del cazador.

#### 🔸 Body:
```json
{
  "name": "Yennefer of Vengerberg",
  "race": "Sorcerer",
  "location": "Novigrad",
}
```

#### 🔸 Responses:
- `200 OK`: Retorna el cazador actualizado.
- `400 Bad Request`: Actualización no válida o falta el nombre.
- `404 Not Found`: No hay cazador con el nombre especificado.
- `500`: Retorna error.

---

### **PATCH** `/hunters/:id`

Actualiza un cazador por su ID.

#### 🔸 Parámetros:
- `id`: ID del cazador.

#### 🔸 Body:
```json
{
  "name": "Yennefer of Vengerberg",
  "race": "Sorcerer",
  "location": "Novigrad",
}
```

#### 🔸 Responses:
- `200 OK`: Retorna el cazador actualizado.
- `400 Bad Request`: Actualización no válida.
- `404 Not Found`: Cazador no encontrado.
- `500`: Retorna error.

---

### **DELETE** `/hunters?name=xxx&race=xxx&location=xxx`

Elimina cazadores por filtros opcionales.

#### 🔸 Parámetros (opcionales):
- `name`
- `race`
- `location`

#### 🔸 Responses:
- `200 OK`: Retorna lista de cazadores eliminados.
- `404 Not Found`: No hay cazadores que cumplan.
- `500`: Retorna error.

---

### **DELETE** `/hunters/:id`

Elimina un cazador por su ID.

#### 🔸 Parámetros:
- `id`: ID del cazador a eliminar.

#### 🔸 Responses:
- `200 OK`: Retorna lista de cazadores eliminados.
- `404 Not Found`: Cazador no encontrado.
- `500`: Retorna error.

---

## 🧙 Merchants API

### **POST** `/merchants`
Crea un nuevo mercader.

#### 🔸 Body:
```json
{
  "name": "Hattori",
  "type": "Blacksmith",
  "location": "Novigrad"
}
```

#### 🔸 Responses:
- `201 Created`: Retorna mercader creado.
- `501 Not Implemented`: Retorna error.

---

### **GET** `/merchants?name=xxx&type=xxx&location=xxx`

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

### **GET** `/merchants/:id`

Obtiene un mercader por su ID.

#### 🔸 Parámetros:
- `id`: ID del mercader a buscar.

#### 🔸 Responses:
- `200 OK`: Retorna el mercader solicitado.
- `404 Not Found`: Mercader no encontrado.
- `500`: Retorna error.

---

### **PATCH** `/merchants?name=xxx`

Actualiza un mercader por su nombre.

#### 🔸 Parámetros:
- `name`: nombre del mercader.

#### 🔸 Body:
```json
{
  "name": "Hattori",
  "type": "Blacksmith",
  "location": "Novigrad"
}
```

#### 🔸 Responses:
- `200 OK`: Retorna el mercader actualizado.
- `400 Bad Request`: Actualización no válida o falta el nombre.
- `404 Not Found`: No hay mercader con el nombre especificado.
- `500`: Retorna error.

---

### **PATCH** `/merchants/:id`

Actualiza un mercader por su ID.

#### 🔸 Parámetros:
- `id`: ID del mercader.

#### 🔸 Body:
```json
{
  "name": "Hattori",
  "type": "Blacksmith",
  "location": "Novigrad"
}
```

#### 🔸 Responses:
- `200 OK`: Retorna el mercader actualizado.
- `400 Bad Request`: Actualización no válida.
- `404 Not Found`: Mercader no encontrado.
- `500`: Retorna error.

---

### **DELETE** `/merchants?name=xxx&type=xxx&location=xxx`

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

### **DELETE** `/merchants/:id`

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
            "name": "Sword",
            "amount": 20
        },
        {
            "name": "Shield",
            "amount": 1
        }
    ],
    "involvedName": "XX",
    "involvedType": "Hunter",
    "type": "Buy"
}
```
---

### **GET** `/transactions`
Obtiene todas las transacciones con filtros opcionales.

####🔸 Parámetros (opcionales):
- `type`: Tipo de transacción (Buy/Sell).

🔸 Responses:
- `200 OK`: Retorna lista de transacciones.

- `500`: Retorna error.

---

### **GET** `/transactions/by-name`
Obtiene transacciones filtradas por nombre del involucrado (Hunter/Merchants).

🔸 Parámetros (opcionales):
- `name`: Nombre del Hunter/Merchant.

🔸 Responses:
- `200 OK`: Retorna lista de transacciones.

- `404 Not Found`: No se encontró el involucrado.

- `500`: Retorna error.

---

### GET /transactions/by-date
Obtiene transacciones filtradas por rango de fechas y tipo.

🔸 Parámetros (requeridos):
- `startDate`: Fecha de inicio (YYYY-MM-DD).

- `endDate`: Fecha de fin (YYYY-MM-DD).

- `type`: Tipo de transacción (Buy/Sell/Both).

🔸 Responses:
- `200 OK`: Retorna lista de transacciones.

- `400 Bad Request`: Faltan parámetros o son inválidos.

- `404 Not Found`: No hay transacciones en el rango.

- `500`: Retorna error.

---

### GET /transactions/:id
Obtiene una transacción por su ID.

🔸 Parámetros:
- `id`: ID de la transacción.

🔸 Responses:
- `200 OK`: Retorna la transacción solicitada.

- `404 Not Found`: Transacción no encontrada.

- `500`: Retorna error.

---

### PATCH /transactions/:id
Actualiza una transacción por su ID (modifica cantidades de bienes). Solo modifica la cantidad de bienes involucrados en la transacción si es posible.

🔸 Parámetros:
- `id`: ID de la transacción.

🔸 Body:
```json
{
  "goods": [
        {
            "name": "Sword",
            "amount": 20
        },
        {
            "name": "Shield",
            "amount": 1
        }
    ],
}
```

🔸 Responses:
- `200 OK`: Retorna la transacción actualizada.

- `400 Bad Request`: No hay stock suficiente o bienes no válidos.

- `404 Not Found`: Transacción no encontrada.

- `500`: Retorna error.

---

### DELETE /transactions/:id
Elimina una transacción por su ID (revierte cambios en stock).

🔸 Parámetros:
- `id`: ID de la transacción.

🔸 Responses:
- `200 OK`: Retorna la transacción eliminada.

- `400 Bad Request`: No se puede revertir el stock.

- `404 Not Found`: Transacción no encontrada.

- `500`: Retorna error.