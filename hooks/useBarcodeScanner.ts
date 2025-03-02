import { useState } from 'react';

interface ProductData {
  name: string;
  storageCategory: 'fridge' | 'cupboard' | 'freezer' | 'unknown';
  dateType: 'best_before' | 'use_by' | 'unknown';
  isFrozen: boolean;
  imageUrl?: string;
  brand?: string;
}

export const useBarcodeScanner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [productData, setProductData] = useState<ProductData | null>(null);

  const fetchProductData = async (barcode: string): Promise<ProductData | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v3/product/${barcode}.json`);
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.product) {
        throw new Error('Product not found');
      }
      
      // Extract relevant information from the API response
      const product = data.product;

      // ===== PRODUCT NAME EXTRACTION =====
      // Extract product name - prioritize full product name
      let productName = '';
      
      // Combine brand and product name if they're separate and brand isn't already in product name
      if (product.brands && product.product_name && 
          !product.product_name.toLowerCase().includes(product.brands.toLowerCase())) {
        productName = `${product.brands} ${product.product_name}`;
      } else {
        productName = product.product_name || product.product_name_en || '';
      }
      
      // Fallback if no product name is found
      if (!productName) {
        productName = product.generic_name || 'Unknown Product';
      }
      
      // Get brand if available
      const brand = product.brands || '';

      // ===== FROZEN STATUS DETECTION =====
      // Check multiple indicators to determine if product is frozen
      let isFrozen = false;
      
      const frozenKeywords = ['frozen', 'freezer', '-18°', '-18 °', 'ice cream'];
      const frozenIndicators = [
        product.generic_name,
        product.product_name,
        product.storage_conditions,
        product.conservation_conditions
      ].filter(Boolean).some(field => 
        frozenKeywords.some(keyword => 
          field.toLowerCase().includes(keyword)
        )
      );
      
      const frozenTags = [
        ...(product.categories_tags || []),
        ...(product.labels_tags || []),
        ...(product.states_tags || [])
      ].some(tag => tag.includes('frozen'));
      
      isFrozen = frozenIndicators || frozenTags;

      // ===== STORAGE CATEGORY DETERMINATION =====
      let storageCategory: 'fridge' | 'cupboard' | 'freezer' | 'unknown' = 'unknown';
      
      // Check explicit storage instructions from storage_conditions
      if (product.storage_conditions) {
        const storageText = product.storage_conditions.toLowerCase();
        
        // Look for pre-opening storage instructions (higher priority)
        // For "after opening" instructions, we still want the original storage location
        const beforeOpeningInstructions = storageText.split(/once opened|after opening/i)[0];
        
        // First check freezer
        if (frozenKeywords.some(keyword => storageText.includes(keyword))) {
          storageCategory = 'freezer';
        }
        // Then check for fridge terms in pre-opening instructions
        else if (/refrigerat|fridge|cool|chilled|0-5\s*°|under\s*5\s*°/.test(beforeOpeningInstructions)) {
          storageCategory = 'fridge';
        }
        // Then check for ambient storage terms in pre-opening instructions
        else if (/room temperature|dry place|ambient|store in a cool and dry|pantry/.test(beforeOpeningInstructions)) {
          storageCategory = 'cupboard';
        }
        // If no clear pre-opening instructions, check entire text
        else if (/refrigerat|fridge|cool|chilled|0-5\s*°|under\s*5\s*°/.test(storageText)) {
          storageCategory = 'fridge';
        }
        // Default to cupboard for most products with storage instructions that don't fit above
        else {
          storageCategory = 'cupboard';
        }
      }
      
      // Try conservation_conditions if storage_conditions didn't yield results
      if (storageCategory === 'unknown' && product.conservation_conditions) {
        const conserveText = product.conservation_conditions.toLowerCase();
        
        if (frozenKeywords.some(keyword => conserveText.includes(keyword))) {
          storageCategory = 'freezer';
        } else if (/refrigerat|fridge|cool|chilled|0-5\s*°|under\s*5\s*°/.test(conserveText)) {
          storageCategory = 'fridge';
        } else if (/room temperature|dry place|ambient|cool and dry|pantry/.test(conserveText)) {
          storageCategory = 'cupboard';
        }
      }
      
      // If product is frozen but storage category is still unknown
      if (storageCategory === 'unknown' && isFrozen) {
        storageCategory = 'freezer';
      }
      
      // Infer storage category based on product categories if still unknown
      if (storageCategory === 'unknown' && product.categories_tags) {
        const categoryTags = product.categories_tags.map((tag: string) => tag.toLowerCase());
        
        // Refrigerated categories
        if (categoryTags.some((tag: string) => 
            /dairy|cheese|yogurt|milk|cream|butter|fresh-meat|seafood|deli|ready-meals|prepared-salads/.test(tag))) {
          storageCategory = 'fridge';
        }
        // Frozen categories
        else if (categoryTags.some((tag: string) => 
            /frozen|ice-cream|ice-creams|sorbet/.test(tag))) {
          storageCategory = 'freezer';
        }
        // Shelf-stable categories
        else if (categoryTags.some((tag: string) => 
            /canned|biscuits|cookies|crackers|chips|crisps|snacks|cereals|pastas|rice|flour|sugar|oils|sauces|drinks|beverages|candy|chocolate/.test(tag))) {
          storageCategory = 'cupboard';
        }
      }
      
      // Default to cupboard if still unknown - most packaged grocery items are shelf-stable
      if (storageCategory === 'unknown') {
        storageCategory = 'cupboard';
      }

      // ===== DATE TYPE DETERMINATION =====
      let dateType: 'best_before' | 'use_by' | 'unknown' = 'unknown';
      
      // Check if expiration info exists
      if (product.expiration_date_info) {
        const expirationInfo = product.expiration_date_info.toLowerCase();
        if (expirationInfo.includes('best before')) {
          dateType = 'best_before';
        } else if (expirationInfo.includes('use by')) {
          dateType = 'use_by';
        }
      }
      
      // Try to infer date type from product category if still unknown
      if (dateType === 'unknown') {
        // Perishable products typically have use_by dates
        if (storageCategory === 'fridge' && product.categories_tags) {
          const categoryTags = product.categories_tags.map((tag: string) => tag.toLowerCase());
          if (categoryTags.some((tag: string) => 
              /dairy|milk|yogurt|fresh-meat|fish|seafood|ready-meals|prepared-salads|deli|cheese/.test(tag))) {
            dateType = 'use_by';
          } else {
            dateType = 'best_before';
          }
        }
        // Frozen products typically have best_before dates
        else if (storageCategory === 'freezer' || isFrozen) {
          dateType = 'best_before';
        }
        // Shelf-stable products almost always have best_before dates
        else if (storageCategory === 'cupboard') {
          dateType = 'best_before';
        }
      }
      
      // Default to best_before if still unknown, as it's more common
      if (dateType === 'unknown') {
        dateType = 'best_before';
      }
      
      // Create structured product data
      const extractedData: ProductData = {
        name: productName,
        storageCategory,
        dateType,
        isFrozen,
        imageUrl: product.image_url,
        brand
      };
      
      setProductData(extractedData);
      return extractedData;
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    productData,
    fetchProductData
  };
};