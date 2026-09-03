export interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  owner_id: number;
  created_at: string;
}

export interface TaskInput {
  title: string;
  description: string;
  completed: boolean;
}
