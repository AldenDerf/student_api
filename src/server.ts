import "dotenv/config";
import express from "express";
import studentRoutes from "./routes/student.routes.ts";
import { pool } from "./db.ts";

pool
  .query("SELECT NOW()")
  .then(() => console.log("Database connected successfully"))
  .catch((err) =>
    console.error(
      "Database connection failed. Check .env, Supabase, and your network:",
      err?.message || err,
    ),
  );


// Create application
const app = express();

// PORT configuration
const PORT = Number(process.env.PORT) || 5000;

// Middleware to parse JSON body
app.use(express.json());


app.use("/students", studentRoutes);


// listen on port 4000
app.listen(PORT, "0.0.0.0",() => {
  console.log(`Server is running on port ${PORT}`);
});

