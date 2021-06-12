/* 
    This is just the schema of the tables for reference.
    This file is not executed by the code.
 */

/* 
    Before running the nodejs server.
    - Create the database "homejam_assessment".
    - Create the following tables.
 */

/* 
    Refer the readme to get visualized schema.
 */

CREATE TABLE IF NOT EXISTS teacher (
    teacher_id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student (
    student_id SERIAL PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS class (
    class_id SERIAL PRIMARY KEY,
    subject_name TEXT NOT NULL,
    fk_teacher_id SERIAL REFERENCES teacher(teacher_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS class_student (
    class_student_id SERIAL PRIMARY KEY,
    fk_class_id SERIAL REFERENCES class(class_id) ON DELETE CASCADE,
    fk_student_id SERIAL REFERENCES student(student_id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
