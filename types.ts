
export interface Product {
  product_name: string;
  image_url: string;
  brands: string;
  ingredients_text_with_allergens: string;
  nutriments: { [key: string]: string | number };
  quantity: string;
  nutriscore_grade: string;
}

export interface OpenFoodFactsResponse {
  status: number;
  product: Product;
  code: string;
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  sources?: GroundingChunk[];
}

export enum View {
  Scanner,
  Product,
  Chat,
  Frigo
}
