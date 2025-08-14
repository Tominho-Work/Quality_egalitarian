interface WordData {
  text: string
  size: number
  sentiment?: 'positive' | 'negative' | 'neutral'
  category?: string
}

// Utility function to process feedback text into word data
export function processTextToWords(
  texts: string[],
  sentiments?: string[],
  stopWords: string[] = []
): WordData[] {
  const defaultStopWords = [
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
    'after', 'above', 'below', 'between', 'among', 'around', 'through',
    'a', 'an', 'is', 'was', 'are', 'were', 'be', 'been', 'being', 'have',
    'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
    'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ]

  const allStopWords = [...defaultStopWords, ...stopWords.map(w => w.toLowerCase())]
  const wordCounts = new Map<string, { count: number; sentiment: string }>()

  texts.forEach((text, index) => {
    const sentiment = sentiments?.[index] || 'neutral'
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => 
        word.length > 2 && 
        !allStopWords.includes(word) &&
        isNaN(Number(word))
      )

    words.forEach(word => {
      const existing = wordCounts.get(word)
      if (existing) {
        existing.count++
      } else {
        wordCounts.set(word, { count: 1, sentiment })
      }
    })
  })

  return Array.from(wordCounts.entries())
    .map(([text, data]) => ({
      text,
      size: data.count,
      sentiment: data.sentiment as any,
    }))
    .sort((a, b) => b.size - a.size)
    .slice(0, 100) // Limit to top 100 words
}

export type { WordData }