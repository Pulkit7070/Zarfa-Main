interface Synonym {
  [key: string]: string[];
}

const synonyms: Synonym = {
  price: ["cost", "value", "worth", "rate", "amount"],
  "market cap": [
    "market capitalization",
    "mcap",
    "marketcap",
    "cap",
    "market size",
  ],
  employee: ["worker", "staff", "team member", "personnel", "colleague"],
  salary: ["pay", "wage", "compensation", "income", "earnings"],
  company: ["business", "organization", "firm", "corporation", "enterprise"],
  blockchain: ["chain", "ledger", "crypto", "cryptocurrency"],
  aptos: ["apt", "aptoschain"],
  payment: ["transaction", "transfer", "pay", "send money"],
  overview: ["summary", "report", "analysis", "breakdown"],
  department: ["team", "division", "group", "section", "unit"],
};

const commonTypos: { [key: string]: string } = {
  // Aptos variations
  aptos: "aptos",
  apts: "aptos",
  aptoss: "aptos",
  apots: "aptos",
  apt: "aptos",

  // Market variations
  makret: "market",
  markt: "market",
  marcet: "market",
  markrt: "market",

  // Price variations
  prise: "price",
  pric: "price",
  pricer: "price",
  prce: "price",

  // Company variations
  compny: "company",
  comapny: "company",
  copany: "company",
  compani: "company",

  // Employee variations
  employe: "employee",
  employess: "employees",
  employes: "employees",
  emplyees: "employees",

  // Common words
  teh: "the",
  adn: "and",
  ther: "there",
  thier: "their",
  recieve: "receive",
  definately: "definitely",
  occured: "occurred",
  accomodate: "accommodate",
  reccomend: "recommend",
  begining: "beginning",
  recieved: "received",
  occurance: "occurrence",
  priviledge: "privilege",
  neccessary: "necessary",
  succesful: "successful",
  seperate: "separate",
  independant: "independent",
  embarass: "embarrass",
  occurence: "occurrence",
  maintenence: "maintenance",
  existance: "existence",
  aquire: "acquire",
  belive: "believe",
  soemthing: "something",
  intermet: "internet",
  makr: "make",
  hwo: "how",
  waht: "what",
  whta: "what",
  jsut: "just",
  dont: "don't",
  wont: "won't",
  cant: "can't",
  isnt: "isn't",
  arent: "aren't",
  werent: "weren't",
  shouldnt: "shouldn't",
  wouldnt: "wouldn't",
  couldnt: "couldn't",
};

export const fixTypos = (text: string): string => {
  let correctedText = text;

  // Fix common typos
  for (const [typo, correction] of Object.entries(commonTypos)) {
    const regex = new RegExp(`\\b${typo}\\b`, "gi");
    correctedText = correctedText.replace(regex, correction);
  }

  return correctedText;
};

export const expandSynonyms = (text: string): string => {
  let expandedText = text.toLowerCase();

  for (const [mainWord, synonymList] of Object.entries(synonyms)) {
    for (const synonym of synonymList) {
      const regex = new RegExp(`\\b${synonym}\\b`, "gi");
      if (expandedText.match(regex)) {
        expandedText = expandedText.replace(regex, mainWord);
      }
    }
  }

  return expandedText;
};

export const extractKeywords = (text: string): string[] => {
  const commonWords = [
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "about",
    "into",
    "through",
    "during",
    "before",
    "after",
    "above",
    "below",
    "up",
    "down",
    "out",
    "off",
    "over",
    "under",
    "again",
    "further",
    "then",
    "once",
    "here",
    "there",
    "when",
    "where",
    "why",
    "how",
    "all",
    "any",
    "both",
    "each",
    "few",
    "more",
    "most",
    "other",
    "some",
    "such",
    "no",
    "nor",
    "not",
    "only",
    "own",
    "same",
    "so",
    "than",
    "too",
    "very",
    "can",
    "will",
    "just",
    "should",
    "now",
    "i",
    "me",
    "my",
    "myself",
    "we",
    "our",
    "ours",
    "ourselves",
    "you",
    "your",
    "yours",
    "yourself",
    "yourselves",
    "he",
    "him",
    "his",
    "himself",
    "she",
    "her",
    "hers",
    "herself",
    "it",
    "its",
    "itself",
    "they",
    "them",
    "their",
    "theirs",
    "themselves",
    "what",
    "which",
    "who",
    "whom",
    "this",
    "that",
    "these",
    "those",
    "am",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "having",
    "do",
    "does",
    "did",
    "doing",
    "would",
    "could",
    "should",
    "may",
    "might",
    "must",
    "shall",
  ];

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !commonWords.includes(word));

  return [...new Set(words)];
};

export const detectIntent = (
  text: string
): {
  intent: string;
  confidence: number;
  entities: string[];
} => {
  const correctedText = fixTypos(text);
  const expandedText = expandSynonyms(correctedText);
  const keywords = extractKeywords(expandedText);

  const intents = {
    price_query: [
      "price",
      "cost",
      "value",
      "current",
      "live",
      "real-time",
      "market cap",
      "worth",
    ],
    greeting: [
      "hi",
      "hello",
      "hey",
      "good morning",
      "good afternoon",
      "greetings",
      "how are you",
    ],
    company_analysis: [
      "company",
      "business",
      "overview",
      "summary",
      "analysis",
      "employee",
      "department",
    ],
    blockchain_query: [
      "blockchain",
      "aptos",
      "crypto",
      "consensus",
      "transaction",
      "fees",
    ],
    payment_query: [
      "payment",
      "transaction",
      "transfer",
      "send",
      "receive",
      "money",
    ],
    employee_query: [
      "employee",
      "worker",
      "staff",
      "team",
      "salary",
      "compensation",
    ],
    market_query: ["market", "trading", "volume", "rank", "cap", "summary"],
  };

  let bestIntent = "general";
  let bestScore = 0;

  for (const [intent, intentKeywords] of Object.entries(intents)) {
    const matches = keywords.filter((keyword) =>
      intentKeywords.some(
        (intentKeyword) =>
          keyword.includes(intentKeyword) || intentKeyword.includes(keyword)
      )
    );

    const score = matches.length / Math.max(keywords.length, 1);

    if (score > bestScore) {
      bestScore = score;
      bestIntent = intent;
    }
  }

  return {
    intent: bestIntent,
    confidence: bestScore,
    entities: keywords,
  };
};

export const smartTextProcessing = (
  text: string
): {
  originalText: string;
  correctedText: string;
  intent: string;
  confidence: number;
  keywords: string[];
  suggestions: string[];
} => {
  const correctedText = fixTypos(text);
  const { intent, confidence, entities } = detectIntent(correctedText);

  const suggestions = [];
  if (correctedText !== text) {
    suggestions.push("Fixed spelling errors");
  }

  return {
    originalText: text,
    correctedText,
    intent,
    confidence,
    keywords: entities,
    suggestions,
  };
};
