export interface TagItem {
  object: string;
  attribute: string;
  displayName: string;
  langName: string;
  description?: string;
  preview?: string; // Path to preview image, e.g., "/previews/xxx.webp"
}
