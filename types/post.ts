export interface PostListItem {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  photoDescription: string;
  subtitle: string;
  section: string;
  status: string;
  visitors: number;
  createdAt: string;
  categoryName: string;
  categoryId: number;
  userId: number;
  autorId?: number | null;
  autorName?: string | null;
  userName?: string | null;
}

export interface PostDetail extends PostListItem {
  body: string;
  head: string | null;
  newsType: string;
  updatedAt: string | null;
  userId: number;
  authorEmail: string;
  tags: string[];
}

export interface PostUserOption {
  id: number;
  name: string;
  email: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}