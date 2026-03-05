# 🎫 Queue Management System

A simple queue management system that simulates a queue machine commonly used in stores or service counters, where customers can take a queue number and wait for their turn to be served.

The system provides two interfaces: a customer-facing page for taking queue numbers (with automatic PDF ticket download), and an admin panel for processing queues. All connected screens update in realtime via Socket.IO, so multiple queue machines can run simultaneously without conflicts.

---

## Features

- Customers can join the queue by clicking "Masuk Antrian" and instantly receive a downloadable PDF ticket
- Admin panel displays all queues in a table with the ability to mark them as processed
- Realtime updates across all connected browsers using Socket.IO — no page refresh needed
- Atomic queue numbering using MongoDB's `findOneAndUpdate` with `$inc` to prevent duplicates, even under concurrent requests
- Works out of the box on an empty database — the counter document is created automatically via `upsert`
- In-memory fallback mode when MongoDB is not available, so the server can still run for demo purposes

---

## Tech Stack

| Technology      | Purpose                          |
| --------------- | -------------------------------- |
| **Node.js**     | Runtime environment              |
| **Express**     | Web framework & API server       |
| **MongoDB**     | Database (via Mongoose ODM)      |
| **Socket.IO**   | Realtime bidirectional events    |
| **PDFKit**      | PDF ticket generation            |
| **HTML/CSS/JS** | Frontend (vanilla, no framework) |

---

## Folder Structure

```
queue-app/
├── server.js
├── migrate.js
├── package.json
├── .env
├── .gitignore
├── README.md
│
├── config/
│   └── db.js
│
├── models/
│   ├── Queue.js
│   └── Counter.js
│
├── routes/
│   └── queueRoutes.js
│
├── controllers/
│   └── queueController.js
│
├── services/
│   └── queueService.js
│
├── sockets/
│   └── socket.js
│
├── public/
│   ├── index.html
│   ├── admin.html
│   └── script.js
│
└── utils/
    └── pdfGenerator.js
```

---

## Installation

### Prerequisites

- **Node.js** v16 or higher
- **MongoDB** running locally (or a MongoDB Atlas connection string)

### Steps

1. **Navigate to the project folder**

   ```bash
   cd queue-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root:

   ```env
   PORT=3000
   MONGO_URI=mongodb://localhost:27017/queueapp
   ```

4. **Start MongoDB**

   Make sure MongoDB is running on your machine:

   ```bash
   # Windows (usually runs as a service automatically)
   # Or start manually:
   mongod

   # macOS / Linux:
   sudo systemctl start mongod
   ```

5. **Run database migration** (optional)

   ```bash
   npm run migrate

   # To reset all data and re-seed:
   npm run migrate:reset
   ```

   > The server can start without running migration first. The counter document will be created automatically on the first queue request.

6. **Start the application**

   ```bash
   # Development (auto-restart on file changes)
   npm run dev

   # Production
   npm start
   ```

7. **Open in browser**

   - Customer Page: [http://localhost:3000/](http://localhost:3000/)
   - Admin Page: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## API Endpoints

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

## Socket.IO Events

| Event           | Direction       | Description                         |
| --------------- | --------------- | ----------------------------------- |
| `queue_created` | Server → Client | Emitted when a new queue is created |
| `queue_updated` | Server → Client | Emitted when a queue status changes |

---

## Database Design

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

This ensures no duplicate queue numbers are generated, even when multiple machines send requests at the exact same time.

---

## Design Considerations

- **MongoDB atomic operations** were chosen for the queue counter because a simple read-then-write approach would risk generating duplicate numbers under concurrent requests. Using `findOneAndUpdate` with `$inc` and `upsert: true` guarantees atomicity and also handles the case where the counter document doesn't exist yet.

- **Socket.IO** was used instead of polling because the queue display needs to feel instant. When a customer takes a number, every connected screen (including other queue machines and the admin panel) should reflect the change immediately without manual refreshing.

- **Separation of concerns** — the codebase is split into controllers (request handling), services (business logic), and models (data schema). This makes it easier to swap out the data layer or add new features without touching unrelated code.

- **PDF ticket generation** simulates the physical ticket that a real queue machine would print. Using PDFKit keeps the dependency lightweight, and the ticket is streamed directly to the browser response without writing temporary files to disk.

- **In-memory fallback** — when MongoDB is unavailable, the service layer automatically switches to an in-memory store. This allows the application to run for demonstration or development purposes without requiring a database setup.

---

## Assumptions

- Queue numbers follow the format `A001`, `A002`, `A003`, etc. Only a single queue type is implemented (no categories like "Teller", "Customer Service", etc.)
- There is no admin authentication — the admin page is publicly accessible at `/admin`
- Multiple queue machines (browsers) connect to the same backend API and share a single counter
- Queue data is not reset daily — a manual reset can be done via `npm run migrate:reset`
- The PDF ticket is a simple receipt-style document, not a full-page printout
