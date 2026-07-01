export type Note = {
  id: string;
  title: string;
  body: string;
  category: string;
  created_at: string;
  author: string;
  tasks: Task[];
};

export type Task = {
  id: string;
  description: string;
  is_complete: boolean;
  completed_by: string | null;
  completed_at: string | null;
};
