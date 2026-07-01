export type Category = {
  id: string;
  name: string;
  color: string;
};

export type TaskType = {
  id: string;
  description: string;
  is_complete: boolean;
  completed_by: string | null;
  completed_at: string | null;
  attachedPhotos?: string[];
};

export type Note = {
  id: string;
  title: string;
  body: string | null;
  author: string;
  created_at: string;
  category_id: string | null;
  is_complete?: boolean;
  image_url?: string | null;
  category?: string; // Used in dashboard mapped data
  categories?: { name: string; color: string } | null;
  tasks?: TaskType[];
};

export type CalendarEvent = {
  id: string;
  title: string;
  start_time: string;
  category: string | null;
  author: string;
};