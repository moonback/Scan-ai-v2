import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface DetectedProduct {
  name: string;
  brand?: string;
  quantity?: number;
  price?: number;
  barcode?: string;
}

export interface VisionAnalysisResult {
  products: DetectedProduct[];
  totalAmount?: number;
  store?: string;
  date?: string;
  type: 'receipt' | 'basket';
}

/**
 * Convertit une image (File ou base64) en format base64
 */
const imageToBase64 = async (image: File | string): Promise<string> => {
  if (typeof image === 'string') {
    // Si c'est déjà du base64, on le nettoie
    return image.replace(/^data:image\/[a-z]+;base64,/, '');
  }
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.replace(/^data:image\/[a-z]+;base64,/, '');
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(image);
  });
};

/**
 * Analyse une image de ticket de caisse ou de panier avec Gemini Vision
 */
export const analyzeReceiptOrBasket = async (
  image: File | string,
  type: 'receipt' | 'basket' = 'receipt'
): Promise<VisionAnalysisResult> => {
  try {
    const base64Image = await imageToBase64(image);
    
    const prompt = type === 'receipt' 
      ? `Analyse ce ticket de caisse et extrais tous les produits achetés. Pour chaque produit, identifie :
- Le nom du produit
- La marque (si visible)
- La quantité
- Le prix unitaire ou total
- Le code-barres EAN-13 (si visible)

Retourne les informations au format JSON avec cette structure exacte :
{
  "products": [
    {
      "name": "nom du produit",
      "brand": "marque (optionnel)",
      "quantity": 1,
      "price": 0.00,
      "barcode": "code-barres si visible (optionnel)"
    }
  ],
  "totalAmount": 0.00,
  "store": "nom du magasin",
  "date": "date d'achat si visible"
}

Si tu ne peux pas identifier un produit avec certitude, ne l'inclus pas. Sois précis et ne crée pas de produits fictifs.`
      : `Analyse cette photo de panier de courses et liste tous les produits visibles. Pour chaque produit, identifie :
- Le nom du produit (si visible sur l'emballage)
- La marque (si visible)
- La quantité estimée (nombre d'unités visibles)

Retourne les informations au format JSON avec cette structure exacte :
{
  "products": [
    {
      "name": "nom du produit",
      "brand": "marque (optionnel)",
      "quantity": 1
    }
  ]
}

Si tu ne peux pas identifier un produit avec certitude, ne l'inclus pas. Sois précis.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }
      ],
      config: {
        temperature: 0.1,
        maxOutputTokens: 2048,
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    
    // Extraire le JSON de la réponse
    let jsonText = text.trim();
    
    // Si responseMimeType est "application/json", le texte devrait déjà être du JSON
    // Sinon, on essaie d'extraire le JSON du texte
    if (!jsonText.startsWith('{')) {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonText = jsonMatch[0];
      }
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Erreur parsing JSON:", parseError, "Texte reçu:", text);
      throw new Error("Impossible de parser la réponse de l'IA. Veuillez réessayer.");
    }
    
    return {
      products: parsed.products || [],
      totalAmount: parsed.totalAmount,
      store: parsed.store,
      date: parsed.date,
      type
    };

  } catch (error) {
    console.error("Error analyzing image with Gemini Vision:", error);
    throw new Error("Impossible d'analyser l'image. Veuillez réessayer avec une photo plus claire.");
  }
};

