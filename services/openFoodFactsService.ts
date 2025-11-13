
import { type Product, type OpenFoodFactsResponse } from '../types';

const API_URL = 'https://world.openfoodfacts.org/api/v2/product/';

export const fetchProductByBarcode = async (barcode: string): Promise<Product> => {
  try {
    const response = await fetch(`${API_URL}${barcode}.json`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data: OpenFoodFactsResponse = await response.json();
    if (data.status === 0 || !data.product) {
      throw new Error(data.status === 0 ? "Product not found." : "Invalid data received.");
    }
    return data.product;
  } catch (error) {
    console.error("Failed to fetch product data:", error);
    throw error;
  }
};
