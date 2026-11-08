import {
  CULTURAL_ENCYCLOPEDIA,
  type RitualArticle,
} from "@/lib/constants/cultural-encyclopedia";

export async function getEncyclopediaArticles(
  tradition?: string,
  category?: string
): Promise<RitualArticle[]> {
  return CULTURAL_ENCYCLOPEDIA.filter((article) => {
    if (tradition && tradition !== "ALL" && article.tradition !== tradition) {
      return false;
    }
    if (category && category !== "ALL" && article.category !== category) {
      return false;
    }
    return true;
  });
}
