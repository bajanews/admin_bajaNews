export interface Gallery {
  id: number;
  name: string;
  createdAt: string;
  imageCount: number;
}

export interface GalleryImage {
  id: number;
  name: string;
  caption: string;
  galleryId: number;
  createdAt: string | null;
}