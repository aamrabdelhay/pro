export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface ProductLite {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  description: string;
  price: number;
  oldPrice: number | null;
  image: string;
  tags: string[];
  rating: number;
  reviews: number;
  badge: string | null;
}

export type CardProduct = Pick<
  ProductLite,
  "id" | "name" | "category" | "subcategory" | "price" | "oldPrice" | "image" | "badge" | "rating"
>;

export interface ConsultantReply {
  message: string;
  chips: string[];
  recommendations: string[];
  reasons?: Record<string, string>;
  done: boolean;
  answers?: Record<string, string>;
}
