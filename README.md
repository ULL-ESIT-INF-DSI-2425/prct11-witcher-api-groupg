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

### **GET** `/transactions`

### **GET** `/transactions/:id`

### **PATCH** `/transactions`

### **PATCH** `/transactions/:id`

### **DELETE** `/transactions`

### **DELETE** `/transactions/:id`
