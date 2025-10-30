/*
  # Create To-Do List Schema

  ## Overview
  This migration creates the core schema for a feature-rich to-do list application with user authentication support.

  ## New Tables

  ### 1. `todos`
  Main table for storing tasks with rich features:
  - `id` (uuid, primary key) - Unique identifier for each task
  - `user_id` (uuid, foreign key) - Links to auth.users for user ownership
  - `title` (text) - Task title/description
  - `completed` (boolean, default false) - Completion status
  - `priority` (text, default 'medium') - Priority level (low, medium, high)
  - `category` (text, default 'general') - Task category
  - `due_date` (timestamptz, nullable) - Optional due date
  - `position` (integer, default 0) - For drag-and-drop ordering
  - `created_at` (timestamptz) - Timestamp of creation
  - `updated_at` (timestamptz) - Timestamp of last update

  ## Security
  
  ### Row Level Security (RLS)
  - Enable RLS on `todos` table
  - Users can only view their own tasks
  - Users can only create tasks for themselves
  - Users can only update their own tasks
  - Users can only delete their own tasks

  ## Important Notes
  1. All tables use UUID for primary keys
  2. Timestamps are automatically managed
  3. RLS policies ensure complete data isolation between users
  4. Default values prevent null issues
*/

-- Create todos table
CREATE TABLE IF NOT EXISTS todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  completed boolean DEFAULT false NOT NULL,
  priority text DEFAULT 'medium' NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  category text DEFAULT 'general' NOT NULL,
  due_date timestamptz,
  position integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Create policies for todos table
CREATE POLICY "Users can view own todos"
  ON todos
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own todos"
  ON todos
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own todos"
  ON todos
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own todos"
  ON todos
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(completed);
CREATE INDEX IF NOT EXISTS idx_todos_position ON todos(position);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_todos_updated_at
  BEFORE UPDATE ON todos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();