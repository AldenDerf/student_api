import type { Request, Response } from "express";
import { pool } from "../db.ts";

interface StudentInput {
  student_number: string;
  first_name: string;
  last_name: string;
  course: string;
  year_level: number;
}

// Helper function to validate ID parameter
function parseStudentId(idParam: unknown): number | null {
  if (typeof idParam !== "string") {
    return null;
  }
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

// Helper function to validate student payload
function validateStudentInput(body: unknown): { error?: string; data?: StudentInput } {
  if (!body || typeof body !== "object") {
    return { error: "Request body must be a valid JSON object." };
  }

  const { student_number, first_name, last_name, course, year_level } = body as Record<string, unknown>;

  if (
    typeof student_number !== "string" ||
    student_number.trim() === "" ||
    typeof first_name !== "string" ||
    first_name.trim() === "" ||
    typeof last_name !== "string" ||
    last_name.trim() === "" ||
    typeof course !== "string" ||
    course.trim() === ""
  ) {
    return {
      error: "All fields (student_number, first_name, last_name, course, year_level) are required and cannot be empty.",
    };
  }

  if (
    typeof year_level !== "number" ||
    !Number.isInteger(year_level) ||
    year_level < 1 ||
    year_level > 4
  ) {
    return {
      error: "year_level must be an integer between 1 and 4.",
    };
  }

  return {
    data: {
      student_number: student_number.trim(),
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      course: course.trim(),
      year_level,
    },
  };
}

// GET /students - Fetch all students
export async function getStudents(_req: Request, res: Response): Promise<void> {
  try {
    const result = await pool.query("SELECT * FROM students ORDER BY id;");
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ message: "Could not load students" });
  }
}

// GET /students/:id - Fetch single student by ID
export async function getStudentById(req: Request, res: Response): Promise<void> {
  const id = parseStudentId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: "Student ID must be a positive integer" });
    return;
  }

  try {
    const result = await pool.query("SELECT * FROM students WHERE id = $1;", [id]);
    if (result.rowCount === 0) {
      res.status(404).json({ message: "Student not found" });
      return;
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching student:", err);
    res.status(500).json({ message: "Could not load student" });
  }
}

// POST /students - Create a new student
export async function createStudent(req: Request, res: Response): Promise<void> {
  const validation = validateStudentInput(req.body);
  if (validation.error || !validation.data) {
    res.status(400).json({ message: validation.error });
    return;
  }

  const { student_number, first_name, last_name, course, year_level } = validation.data;

  try {
    const result = await pool.query(
      `INSERT INTO students (student_number, first_name, last_name, course, year_level)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *;`,
      [student_number, first_name, last_name, course, year_level]
    );

    res.status(201).json(result.rows[0]);
  } catch (err: unknown) {
    const pgError = err as { code?: string };
    if (pgError?.code === "23505") {
      res.status(409).json({ message: "Student number already exists" });
      return;
    }
    console.error("Error creating student:", err);
    res.status(500).json({ message: "Could not create student" });
  }
}

// PUT /students/:id - Update an existing student (complete representation required)
export async function updateStudent(req: Request, res: Response): Promise<void> {
  const id = parseStudentId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: "Student ID must be a positive integer" });
    return;
  }

  const validation = validateStudentInput(req.body);
  if (validation.error || !validation.data) {
    res.status(400).json({ message: validation.error });
    return;
  }

  const { student_number, first_name, last_name, course, year_level } = validation.data;

  try {
    const result = await pool.query(
      `UPDATE students
       SET student_number = $1, first_name = $2, last_name = $3, course = $4, year_level = $5
       WHERE id = $6
       RETURNING *;`,
      [student_number, first_name, last_name, course, year_level, id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    res.status(200).json(result.rows[0]);
  } catch (err: unknown) {
    const pgError = err as { code?: string };
    if (pgError?.code === "23505") {
      res.status(409).json({ message: "Student number already exists" });
      return;
    }
    console.error("Error updating student:", err);
    res.status(500).json({ message: "Could not update student" });
  }
}

// DELETE /students/:id - Delete a student by ID
export async function deleteStudent(req: Request, res: Response): Promise<void> {
  const id = parseStudentId(req.params.id);
  if (id === null) {
    res.status(400).json({ message: "Student ID must be a positive integer" });
    return;
  }

  try {
    const result = await pool.query(
      "DELETE FROM students WHERE id = $1 RETURNING id;",
      [id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({ message: "Student not found" });
      return;
    }

    res.status(204).send();
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ message: "Could not delete student" });
  }
}
