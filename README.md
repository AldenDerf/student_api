# Student Management REST API

A beginner-friendly REST API built for **ITE 303 — Web Systems and Technologies 2**. This API manages student records stored in a PostgreSQL database (hosted on Supabase) using Express 5 and TypeScript.

---

## 🛠️ Tech Stack

- **Runtime:** Node.js 24
- **Language:** TypeScript
- **Framework:** Express 5
- **Database:** PostgreSQL (Supabase) via `pg` (node-postgres)
- **Package Manager:** pnpm (v12.18.0)

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (do not commit this file to version control). It should define the following environment variables:

| Variable Name | Description | Example / Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string from Supabase | `postgresql://<user>:<password>@<host>:5432/<database>` |
| `PORT` | *(Optional)* Port on which the API server listens | `5000` |

---

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/AldenDerf/student_api.git
   cd student_api
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure environment:**
   Create a `.env` file in the root folder with your database connection:
   ```env
   DATABASE_URL=your_supabase_postgresql_connection_string
   PORT=5000
   ```

4. **Verify types & compile:**
   ```bash
   pnpm typecheck
   pnpm build
   ```

---

## 💻 Local Development Commands

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts development server with live watch mode via `tsx` |
| `pnpm typecheck` | Checks TypeScript types without emitting files |
| `pnpm build` | Compiles TypeScript source (`src/`) to JavaScript (`dist/`) |
| `pnpm start` | Runs the compiled application (`dist/server.js`) |

---

## 📡 REST API Endpoints

Base URL: `http://localhost:5000/students`

### 1. Get All Students
- **Method:** `GET`
- **Route:** `/students`
- **Expected Status:** `200 OK`
- **Response Example:**
  ```json
  [
    {
      "id": 1,
      "student_number": "2026-001",
      "first_name": "Ana",
      "last_name": "Santos",
      "course": "BSIT",
      "year_level": 3
    }
  ]
  ```

---

### 2. Get Single Student by ID
- **Method:** `GET`
- **Route:** `/students/:id`
- **Expected Status Codes:**
  - `200 OK` — Student record found
  - `400 Bad Request` — Student ID is not a positive integer
  - `404 Not Found` — Student ID does not exist in database
- **Response Example:**
  ```json
  {
    "id": 1,
    "student_number": "2026-001",
    "first_name": "Ana",
    "last_name": "Santos",
    "course": "BSIT",
    "year_level": 3
  }
  ```

---

### 3. Create a Student Record
- **Method:** `POST`
- **Route:** `/students`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "student_number": "2026-006",
    "first_name": "Maria",
    "last_name": "Clara",
    "course": "BSIT",
    "year_level": 1
  }
  ```
- **Validation Rules:**
  - `student_number`, `first_name`, `last_name`, and `course` must be non-empty strings.
  - `year_level` must be an integer between 1 and 4.
- **Expected Status Codes:**
  - `201 Created` — Student record successfully inserted (returns the created record)
  - `400 Bad Request` — Missing fields, empty strings, or invalid `year_level`
  - `409 Conflict` — `student_number` already exists (unique constraint violation)

---

### 4. Update an Existing Student
- **Method:** `PUT`
- **Route:** `/students/:id`
- **Headers:** `Content-Type: application/json`
- **Request Body (Complete Representation):**
  ```json
  {
    "student_number": "2026-006",
    "first_name": "Maria",
    "last_name": "Clara",
    "course": "BSCS",
    "year_level": 2
  }
  ```
- **Expected Status Codes:**
  - `200 OK` — Student record successfully updated (returns updated record)
  - `400 Bad Request` — Invalid ID parameter or missing/invalid body fields
  - `404 Not Found` — Student with specified ID does not exist
  - `409 Conflict` — Updated `student_number` collides with another existing student

---

### 5. Delete a Student
- **Method:** `DELETE`
- **Route:** `/students/:id`
- **Expected Status Codes:**
  - `204 No Content` — Student successfully deleted (no response body)
  - `400 Bad Request` — Student ID is not a positive integer
  - `404 Not Found` — Student with specified ID does not exist

---

## 🧪 Postman Testing Instructions

1. Open **Postman** and create a new collection named `Student API`.
2. Add the following requests:
   - **`GET All Students`**: `GET http://localhost:5000/students`
   - **`POST Create Student`**: `POST http://localhost:5000/students` with raw JSON body.
   - **`PUT Update Student`**: `PUT http://localhost:5000/students/:id` with raw JSON body.
   - **`DELETE Student`**: `DELETE http://localhost:5000/students/:id`.
3. Test edge cases:
   - Provide an invalid ID (e.g. `/students/abc`) to verify `400 Bad Request`.
   - Provide a non-existent ID (e.g. `/students/99999`) to verify `404 Not Found`.
   - Submit duplicate `student_number` on POST to verify `409 Conflict`.
