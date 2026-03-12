import type { ToolTrace, ChatMessage } from '../domain/types.js';
import * as knowledgeTools from './knowledge.js';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  skinType?: string;
}

const PRODUCTS: Product[] = [
  { id: 'prod_1', name: 'Hydrating Sunscreen SPF 50', price: 95, category: 'sunscreen', description: 'Lightweight, non-greasy. Suitable for oily skin.', skinType: 'oily' },
  { id: 'prod_2', name: 'Matte Sunscreen SPF 30', price: 85, category: 'sunscreen', description: 'Oil-free formula for oily and combination skin.', skinType: 'oily' },
  { id: 'prod_3', name: 'Gentle Sunscreen SPF 50', price: 110, category: 'sunscreen', description: 'For sensitive and dry skin.', skinType: 'dry' },
  { id: 'prod_4', name: 'Premium Sunscreen SPF 50+', price: 150, category: 'sunscreen', description: 'Broad spectrum, all skin types.', skinType: 'all' },
  { id: 'prod_5', name: 'Botox Treatment', price: 1200, category: 'treatment', description: 'Injectable treatment for fine lines.' },
  { id: 'prod_6', name: 'Facial Cleanser', price: 75, category: 'skincare', description: 'Daily cleanser for all skin types.' },
];

export function catalogSearch(query: string, filters?: { maxPrice?: number; skinType?: string }): Product[] {
  const q = query.toLowerCase();
  let results = PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
  if (filters?.maxPrice) {
    results = results.filter((p) => p.price <= filters!.maxPrice!);
  }
  if (filters?.skinType) {
    results = results.filter(
      (p) => !p.skinType || p.skinType === filters!.skinType || p.skinType === 'all'
    );
  }
  return results;
}

export function catalogGetProduct(productId: string): Product | null {
  return PRODUCTS.find((p) => p.id === productId) ?? null;
}

export function catalogCompare(productIds: string[]): Product[] {
  return productIds.map((id) => catalogGetProduct(id)).filter((p): p is Product => p !== null);
}

function extractProductIds(message: string): string[] {
  const ids: string[] = [];
  const prodMatch = message.matchAll(/prod_\d+/gi);
  for (const m of prodMatch) ids.push(m[0]);
  return [...new Set(ids)];
}

export async function handleCatalogRequest(
  message: string,
  _history: ChatMessage[],
  useKnowledge = false
): Promise<{ response: string; traces: ToolTrace[] }> {
  const traces: ToolTrace[] = [];
  const lower = message.toLowerCase();

  let knowledgeContext = '';
  if (useKnowledge) {
    const kbResult = await knowledgeTools.handleKnowledgeRequest(message, _history);
    traces.push(...kbResult.traces);
    knowledgeContext = kbResult.response.replace(/^Based on our records:\s*/i, '');
  }

  const productIds = extractProductIds(message);
  const wantsCompare = lower.includes('compare') && productIds.length >= 2;
  const wantsDetails = (lower.includes('detail') || lower.includes('more about') || lower.includes('tell me about')) && productIds.length >= 1;

  if (wantsCompare && productIds.length >= 2) {
    const compared = catalogCompare(productIds);
    traces.push({
      domain: 'catalog',
      toolName: 'catalog_compare',
      args: { product_ids: productIds },
      response: compared,
    });
    if (compared.length === 0) {
      return { response: 'Could not find those products to compare.', traces };
    }
    const comparison = compared.map((p) => `${p.name}: ${p.price} SAR - ${p.description}`).join('\n\n');
    return { response: `Comparison:\n\n${comparison}`, traces };
  }

  if (wantsDetails && productIds.length >= 1) {
    const product = catalogGetProduct(productIds[0]!);
    traces.push({
      domain: 'catalog',
      toolName: 'catalog_get_product',
      args: { product_id: productIds[0] },
      response: product,
    });
    if (!product) {
      return { response: 'Product not found.', traces };
    }
    return {
      response: `${product.name} (${product.price} SAR): ${product.description}. Category: ${product.category}.${product.skinType ? ` Suitable for: ${product.skinType} skin.` : ''}`,
      traces,
    };
  }

  const maxPriceMatch = message.match(/(\d+)\s*sar/i);
  const maxPrice = maxPriceMatch ? parseInt(maxPriceMatch[1], 10) : undefined;
  const skinType = lower.includes('oily') ? 'oily' : lower.includes('dry') ? 'dry' : undefined;

  const query = lower.includes('sunscreen') ? 'sunscreen' : lower.includes('product') ? 'product' : 'skincare';
  const filters = { maxPrice, skinType };

  const results = catalogSearch(query, filters);
  traces.push({
    domain: 'catalog',
    toolName: 'catalog_search',
    args: { query, filters },
    response: results,
  });

  if (results.length === 0) {
    return {
      response: 'No products found matching your criteria. Please try different filters or search terms.',
      traces,
    };
  }

  const list = results
    .slice(0, 5)
    .map((p) => `${p.name} (${p.id}) - ${p.price} SAR`)
    .join('\n');
  const guidance = knowledgeContext ? `\n\nBased on our clinic guidance: ${knowledgeContext}\n\n` : '';
  return {
    response: `${guidance}Here are products that match your search:\n\n${list}\n\nAsk for details (e.g. "Tell me more about prod_1") or compare (e.g. "Compare prod_1 and prod_2").`,
    traces,
  };
}
