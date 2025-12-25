
import { ImageMetadata } from '../types';

/**
 * Calculates a search relevance score for an image based on a string query.
 * Simulates semantic understanding by weighting different metadata fields.
 */
export const calculateSearchRelevance = (img: ImageMetadata, query: string): number => {
  const q = query.toLowerCase().trim();
  if (!q) return 0;
  
  const tokens = q.split(/\s+/).filter(t => t.length > 1);
  if (tokens.length === 0) return 0;

  let totalScore = 0;

  tokens.forEach(token => {
    // 1. Category Match (Very High weight)
    const category = img.category.toLowerCase();
    if (category === token) totalScore += 25;
    else if (category.includes(token)) totalScore += 10;

    // 2. Tag Match (High weight)
    img.tags.forEach(tag => {
      const t = tag.toLowerCase();
      if (t === token) totalScore += 20;
      else if (t.includes(token)) totalScore += 5;
    });

    // 3. Color Match (High weight for specific hexes or prefixes)
    const color = img.dominant_color.toLowerCase();
    if (color === token || color === '#' + token) totalScore += 20;
    else if (color.includes(token)) totalScore += 5;

    // 4. Description Match (Medium weight with word boundary bonus)
    const desc = img.description.toLowerCase();
    if (desc.includes(token)) {
      // Check for word boundaries to give a "semantic" boost
      const wordBoundaryRegex = new RegExp(`\\b${token}\\b`, 'i');
      if (wordBoundaryRegex.test(desc)) totalScore += 12;
      else totalScore += 4;
    }
  });

  // Global modifiers
  // Penalty for very short descriptions if they don't match well
  if (img.description.length < 10 && totalScore < 10) totalScore *= 0.8;

  return totalScore;
};

/**
 * Calculates the similarity score between two images based on metadata.
 * Used for "Similar Images" and recommendations.
 */
export const calculateSimilarity = (imgA: ImageMetadata, imgB: ImageMetadata): number => {
  if (imgA.image_id === imgB.image_id) return 0;

  // 1. Tag Similarity (Enhanced Jaccard Index)
  const setA = new Set(imgA.tags.map(t => t.toLowerCase()));
  const setB = new Set(imgB.tags.map(t => t.toLowerCase()));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  const tagScore = (intersection.size / (union.size || 1)) * 0.6; // 60% weight

  // 2. Category Similarity
  const categoryScore = imgA.category.toLowerCase() === imgB.category.toLowerCase() ? 0.25 : 0; // 25% weight

  // 3. Color Similarity (Strict hex match)
  const colorScore = imgA.dominant_color.toLowerCase() === imgB.dominant_color.toLowerCase() ? 0.15 : 0; // 15% weight

  return tagScore + categoryScore + colorScore;
};

/**
 * Simulates a high-scale vector-like search by filtering metadata first
 */
export const findSimilarImages = (target: ImageMetadata, pool: ImageMetadata[], limit: number = 10): ImageMetadata[] => {
  return pool
    .map(img => ({ img, score: calculateSimilarity(target, img) }))
    .sort((a, b) => b.score - a.score)
    .filter(item => item.score > 0.05) // Threshold for "similarity"
    .slice(0, limit)
    .map(item => item.img);
};
