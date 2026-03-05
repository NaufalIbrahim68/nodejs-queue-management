# 🎫 Queue Management System

A web-based queue management system built for stores and service centers. Customers can take queue numbers and receive PDF tickets, while admins can manage and process queues in realtime.

---

## 📸 Features

- **Queue Creation** – Customers click "Masuk Antrian" to join the queue
- **PDF Ticket Download** – Automatically generates and downloads a PDF ticket with queue number, date, and status
- **Admin Dashboard** – View all queues, process them, and track statistics
- **Realtime Updates** – All connected browsers update instantly via Socket.IO (no page refresh needed)
- **Atomic Queue Numbering** – Uses MongoDB atomic `findOneAndUpdate` + `$inc` to prevent duplicate queue numbers even with simultaneous requests from multiple locations
- **Auto-initialization** – Works on an empty database; counter document is created automatically via `upsert`

---

## 🛠️ Tech Stack

| Technology   | Purpose                        |
| ------------ | ------------------------------ |
| **Node.js**  | Runtime environment            |
| **Express**  | Web framework & API server     |
| **MongoDB**  | Database (with Mongoose ODM)   |
| **Socket.IO**| Realtime bidirectional events   |
| **PDFKit**   | PDF ticket generation          |
| **HTML/CSS/JS** | Frontend (vanilla, no framework) |

---

## 📁 Folder Structure

```
queue-app/
├── server.js               # Main entry point
├── migrate.js              # Database migration script
├── package.json
├── .env                    # Environment variables
├── .gitignore
├── README.md
│
├── config/
│   └── db.js               # MongoDB connection
│
├── models/
│   ├── Queue.js            # Queue document schema
│   └── Counter.js          # Atomic counter schema
│
├── routes/
│   └── queueRoutes.js      # API route definitions
│
├── controllers/
│   └── queueController.js  # Request handlers
│
├── services/
│   └── queueService.js     # Business logic layer
│
├── sockets/
│   └── socket.js           # Socket.IO event handlers
│
├── public/
│   ├── index.html          # Customer queue page
│   └── admin.html          # Admin dashboard
│
└── utils/
    └── pdfGenerator.js     # PDF ticket generator
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** v16+ installed
- **MongoDB** running locally (or use MongoDB Atlas)

### Steps

1. **Clone or navigate to the project folder**

   ```bash
   cd queue-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file (or edit the existing one):

   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/queueapp
   ```

4. **Start MongoDB**

   Make sure MongoDB is running locally:

   ```bash
   # On Windows (if installed as a service, it runs automatically)
   # Or start manually:
   mongod

   # On macOS/Linux:
   sudo systemctl start mongod
   ```

5. **Run database migration**

   ```bash
   # Create collections and seed counter
   npm run migrate

   # Or reset everything and re-seed
   npm run migrate:reset
   ```

   > **Note:** The server can start without MongoDB. Migration can be run later when the database is available.

6. **Run the application**

   ```bash
   # Development (with auto-restart)
   npm run dev

   # Production
   npm start
   ```

7. **Open in browser**

   - Customer Page: [http://localhost:3000/](http://localhost:3000/)
   - Admin Page: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 📡 API Endpoints

### Create Queue

```
POST /api/queue
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "queueNumber": "A001",
    "number": 1,
    "status": "waiting",
    "createdAt": "2026-03-05T03:20:00.000Z"
  }
}
```

### Get All Queues

```
GET /api/queue
```

### Get Latest Queue Number

```
GET /api/queue/latest
```

### Update Queue Status

```
PATCH /api/queue/:id
```

**Body:**
```json
{
  "status": "processed"
}
```

### Download PDF Ticket

```
GET /api/queue/:id/ticket
```

---

## 🔌 Socket.IO Events

| Event           | Direction       | Description                          |
| --------------- | --------------- | ------------------------------------ |
| `queue_created` | Server → Client | Emitted when a new queue is created  |
| `queue_updated` | Server → Client | Emitted when a queue status changes  |

---

## 🗄️ Database Design

### `queues` Collection

```json
{
  "_id": "ObjectId",
  "queueNumber": "A001",
  "number": 1,
  "status": "waiting | processed",
  "createdAt": "Date"
}
```

### `counters` Collection

```json
{
  "name": "queue",
  "seq": 12
}
```

**Atomic Counter Strategy:**

```javascript
const counter = await Counter.findOneAndUpdate(
  { name: 'queue' },
  { $inc: { seq: 1 } },
  { new: true, upsert: true }
);
```

This ensures no duplicate queue numbers even with concurrent requests from multiple machines.

---

## 📜 License

ISC
