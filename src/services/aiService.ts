import { GoogleGenerativeAI } from "@google/generative-ai";
import { fetchCryptoPrice } from "./priceService";
import { fixTypos } from "./textProcessingService";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Debug API Key
console.log("🔑 API Key Status:", {
  hasApiKey: !!GEMINI_API_KEY,
  keyLength: GEMINI_API_KEY?.length || 0,
  keyPrefix: GEMINI_API_KEY?.substring(0, 10) + "..." || "Not found",
});

if (!GEMINI_API_KEY) {
  console.warn(
    "Gemini API key not found. AI features will use fallback responses."
  );
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

interface Employee {
  id: string;
  name: string;
  email: string;
  designation: string;
  department: string;
  salary: number;
  wallet_address: string;
  join_date: string;
  status: 'active' | 'inactive';
  created_at?: string;
  hire_date?: string;
}

interface Payment {
  id: string;
  employee_id: string;
  amount: number;
  token: string;
  transaction_hash?: string;
  status: 'pending' | 'completed' | 'failed';
  payment_date: string;
  created_at?: string;
  employee_name?: string;
  transaction_id?: string;
}

export interface AIContext {
  employees: Employee[];
  payments: Payment[];
  companyName: string;
}

// Advanced memory and thinking system
interface ConversationMemory {
  message: string;
  response: string;
  type: string;
  timestamp: Date;
  topics: string[];
  entities: string[];
  intent: string;
  context: Record<string, unknown>;
}

interface ThinkingContext {
  currentTopic: string;
  primaryCrypto: string;
  userIntent: string;
  conversationPhase: "initial" | "exploring" | "deep_dive" | "comparative";
  establishedFacts: Record<string, unknown>;
  userPreferences: string[];
  recentQuestions: string[];
}

let conversationMemory: ConversationMemory[] = [];
let thinkingContext: ThinkingContext = {
  currentTopic: "monad",
  primaryCrypto: "monad",
  userIntent: "general",
  conversationPhase: "initial",
  establishedFacts: {},
  userPreferences: [],
  recentQuestions: [],
};

const analyzeMessage = (
  message: string
): { topics: string[]; entities: string[]; intent: string } => {
  const topics = [];
  const entities = [];

  // Topic detection - expanded for comprehensive company intelligence
  if (/(price|cost|value|worth)/i.test(message)) topics.push("pricing");
  if (/(ath|all.?time.?high|highest|peak)/i.test(message)) topics.push("ath");
  if (/(atl|all.?time.?low|lowest|bottom)/i.test(message)) topics.push("atl");
  if (/(founder|create|start|who)/i.test(message)) topics.push("foundation");
  if (/(market|cap|rank|volume)/i.test(message)) topics.push("market_data");
  if (/(analysis|technical|trend)/i.test(message)) topics.push("analysis");
  if (/(compare|vs|versus)/i.test(message)) topics.push("comparison");

  // Company intelligence topics
  if (/(employee|staff|worker|team)/i.test(message)) topics.push("employees");
  if (/(salary|wage|pay|compensation|income)/i.test(message))
    topics.push("salary");
  if (/(highest|top|maximum|most)/i.test(message)) topics.push("highest");
  if (/(lowest|bottom|minimum|least)/i.test(message)) topics.push("lowest");
  if (/(newest|latest|recent|new)/i.test(message)) topics.push("newest");
  if (/(oldest|first|original)/i.test(message)) topics.push("oldest");
  if (/(total|count|number|how many)/i.test(message)) topics.push("count");
  if (/(overview|summary|breakdown|list)/i.test(message))
    topics.push("overview");
  if (/(company|business|organization)/i.test(message)) topics.push("company");
  if (/(payroll|payment|budget)/i.test(message)) topics.push("payroll");
  if (/(department|division|team)/i.test(message)) topics.push("department");
  if (/(average|mean|typical)/i.test(message)) topics.push("average");
  if (/(increase|growth|rise|percentage)/i.test(message)) topics.push("growth");
  if (/(name|called|title)/i.test(message)) topics.push("name");
  if (/(does|do|business|industry)/i.test(message))
    topics.push("business_type");

  // Entity detection
  const cryptos =
    message.match(
      /(monad|mon|bitcoin|btc|ethereum|eth|cardano|ada|solana|sol)/gi
    ) || [];
  entities.push(...cryptos.map((c) => c.toLowerCase()));

  const people =
    message.match(/(founder|creator|ceo|mo|shaikh|avery|ching)/gi) || [];
  entities.push(...people.map((p) => p.toLowerCase()));

  const departments =
    message.match(
      /(engineering|marketing|sales|hr|finance|operations|design|product)/gi
    ) || [];
  entities.push(...departments.map((d) => d.toLowerCase()));

  // Intent detection - expanded
  let intent = "general";
  if (/(what|whats|tell me)/i.test(message)) intent = "question";
  if (/(how|explain|why)/i.test(message)) intent = "explanation";
  if (/(compare|difference|vs)/i.test(message)) intent = "comparison";
  if (/(founder|who|create)/i.test(message)) intent = "knowledge";
  if (/(list|show|give me)/i.test(message)) intent = "data_request";
  if (/(overview|summary)/i.test(message)) intent = "summary";

  return { topics, entities, intent };
};

const updateThinkingContext = (
  message: string,
  analysis: {
    topics: string[];
    entities: string[];
    intent: string;
  }
) => {
  // Update primary crypto
  if (
    analysis.entities.includes("bitcoin") ||
    analysis.entities.includes("btc")
  ) {
    thinkingContext.primaryCrypto = "bitcoin";
  } else if (
    analysis.entities.includes("ethereum") ||
    analysis.entities.includes("eth")
  ) {
    thinkingContext.primaryCrypto = "ethereum";
  } else if (
    analysis.entities.includes("monad") ||
    analysis.entities.includes("mon") ||
    analysis.topics.includes("ath") ||
    analysis.topics.includes("atl")
  ) {
    thinkingContext.primaryCrypto = "monad";
  }

  // Update topic
  if (analysis.topics.length > 0) {
    thinkingContext.currentTopic = analysis.topics[0];
  }

  // Update intent
  thinkingContext.userIntent = analysis.intent;

  // Update conversation phase
  const messageCount = conversationMemory.length;
  if (messageCount < 3) thinkingContext.conversationPhase = "initial";
  else if (messageCount < 7) thinkingContext.conversationPhase = "exploring";
  else thinkingContext.conversationPhase = "deep_dive";

  // Track recent questions
  thinkingContext.recentQuestions.push(message);
  if (thinkingContext.recentQuestions.length > 5) {
    thinkingContext.recentQuestions = thinkingContext.recentQuestions.slice(-5);
  }
};

const addToMemory = (
  message: string,
  response: string,
  responseType: string
) => {
  const analysis = analyzeMessage(message);

  conversationMemory.push({
    message,
    response,
    type: responseType,
    timestamp: new Date(),
    topics: analysis.topics,
    entities: analysis.entities,
    intent: analysis.intent,
    context: { ...thinkingContext },
  });

  // Keep last 20 exchanges for deep context
  if (conversationMemory.length > 20) {
    conversationMemory = conversationMemory.slice(-20);
  }

  updateThinkingContext(message, analysis);
};

const intelligentThinking = (
  message: string
): { shouldAnswer: boolean; directAnswer?: string; reasoning: string } => {
  const analysis = analyzeMessage(message);

  console.log("🤔 AI Thinking:", {
    message,
    analysis,
    currentContext: thinkingContext,
    recentMemory: conversationMemory
      .slice(-3)
      .map((m) => ({ msg: m.message, topics: m.topics })),
  });

  // Intelligent reasoning based on context

  // ATH questions - always answer with Aptos unless another crypto explicitly mentioned
  if (analysis.topics.includes("ath")) {
    const targetCrypto =
      analysis.entities.find((e) =>
        ["bitcoin", "ethereum", "cardano", "solana"].includes(e)
      ) || "aptos";
    return {
      shouldAnswer: true,
      directAnswer: "ath",
      reasoning: `User asking about ATH. Context suggests ${targetCrypto}. This is a Monad app, so default to Monad unless specifically mentioned otherwise.`,
    };
  }

  // ATL questions
  if (analysis.topics.includes("atl")) {
    const targetCrypto =
      analysis.entities.find((e) =>
        ["bitcoin", "ethereum", "cardano", "solana"].includes(e)
      ) || "aptos";
    return {
      shouldAnswer: true,
      directAnswer: "atl",
      reasoning: `User asking about ATL. Context suggests ${targetCrypto}.`,
    };
  }

  // Founder questions
  if (
    analysis.topics.includes("foundation") ||
    analysis.entities.includes("founder")
  ) {
    return {
      shouldAnswer: true,
      directAnswer: "founder",
      reasoning: `User asking about founder. In Aptos context, this means Mo Shaikh and Avery Ching.`,
    };
  }

  // Price questions
  if (analysis.topics.includes("pricing")) {
    const targetCrypto =
      analysis.entities.find((e) =>
        ["bitcoin", "ethereum", "cardano", "solana"].includes(e)
      ) || thinkingContext.primaryCrypto;
    return {
      shouldAnswer: true,
      directAnswer: "price",
      reasoning: `User asking about price. Target crypto: ${targetCrypto}`,
    };
  }

  // If we've been in a conversation and user asks vague questions, use context
  if (conversationMemory.length > 2 && analysis.intent === "question") {
    const recentTopics = conversationMemory.slice(-3).flatMap((m) => m.topics);
    if (
      recentTopics.includes("ath") ||
      recentTopics.includes("atl") ||
      recentTopics.includes("pricing")
    ) {
      return {
        shouldAnswer: true,
        directAnswer: "contextual",
        reasoning: `Based on conversation history, user likely wants ${thinkingContext.primaryCrypto} data.`,
      };
    }
  }

  return {
    shouldAnswer: false,
    reasoning: "Need more context or should use Gemini for complex response.",
  };
};

const createSystemPrompt = (context: AIContext) => {
  const employeeData =
    context.employees.length > 0
      ? context.employees
          .map(
            (emp) =>
              `- ${emp.name}: ${emp.designation} in ${emp.department}, Salary: $${emp.salary}`
          )
          .join("\n")
      : "- No employees in system yet";

  const paymentData =
    context.payments.length > 0
      ? context.payments
          .slice(-5)
          .map(
            (payment) =>
              `- $${payment.amount} to ${
                payment.employee_name || "Employee"
              } on ${payment.created_at || "N/A"}`
          )
          .join("\n")
      : "- No payments made yet";

  const memoryContext = conversationMemory
    .slice(-5)
    .map(
      (m) =>
        `User: ${m.message} (Topics: ${m.topics.join(
          ", "
        )}) -> AI: ${m.response.substring(0, 100)}...`
    )
    .join("\n");

  const factContext = Object.entries(thinkingContext.establishedFacts)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  return `You are a friendly, knowledgeable AI assistant who works with ${context.companyName}. You're like a helpful colleague who knows a lot about crypto, business data, and blockchain stuff. Be conversational, natural, and helpful - like chatting with a friend who happens to be really smart about these topics.

Your personality:
- Casual and conversational, but still professional
- Use "you" and "I" naturally 
- Explain things in a relatable way
- Use occasional emojis but don't overdo it
- Be genuinely helpful and curious about what users want to know

What you know about:
- ${context.companyName} (Monad-based payroll company) - ${context.employees.length} employees, ${context.payments.length} payments processed
- Live crypto prices and market data, especially Monad (MON)
- Blockchain and crypto concepts, particularly EVM-compatible chains
- Business analytics and insights

Current company data:
${employeeData}

Recent payments:
${paymentData}

Conversation context:
${memoryContext}

Things you've established in our chat:
${factContext}

Be natural, helpful, and remember our conversation. If someone asks about crypto prices, give them real data but explain it in a friendly way. If they want company info, share it conversationally. Just be yourself - knowledgeable but approachable!`;
};

const handleIntelligentQueries = async (
  message: string,
  context: AIContext
): Promise<string | null> => {
  const thinking = intelligentThinking(message);

  console.log("🧠 Intelligent Analysis:", thinking);

  // First check for company intelligence questions
  const companyResponse = handleCompanyIntelligence(message, context);
  if (companyResponse) {
    addToMemory(message, companyResponse, "company_intelligence");
    return companyResponse;
  }

  if (!thinking.shouldAnswer) return null;

  try {
    switch (thinking.directAnswer) {
      case "ath":
        const athCrypto = thinkingContext.primaryCrypto;
        const athData = await fetchCryptoPrice(athCrypto);
        if (athData?.ath) {
          const athDate = new Date(athData.athDate || "").toLocaleDateString();
          const distanceFromATH = athData.athChangePercentage || 0;

          const response = `🎯 **${athCrypto.toUpperCase()} All-Time High**

📈 **ATH Price:** $${athData.ath.toFixed(4)} (${athDate})
� **Current Price:** $${athData.price.toFixed(4)}
📉 **Distance from ATH:** ${distanceFromATH.toFixed(1)}%

${
  distanceFromATH > -50
    ? "💡 Still within reasonable distance of peak levels!"
    : "🔍 Significant discount from peak - interesting opportunity for long-term investors."
}`;

          thinkingContext.establishedFacts[`${athCrypto}_ath`] = athData.ath;
          addToMemory(message, response, "ath_intelligent");
          return response;
        }
        break;

      case "atl":
        const atlCrypto = thinkingContext.primaryCrypto;
        const atlData = await fetchCryptoPrice(atlCrypto);
        if (atlData?.atl) {
          const atlDate = new Date(atlData.atlDate || "").toLocaleDateString();
          const gainFromATL = atlData.atlChangePercentage || 0;

          const response = `� **${atlCrypto.toUpperCase()} All-Time Low**

� **ATL Price:** $${atlData.atl.toFixed(6)} (${atlDate})
� **Current Price:** $${atlData.price.toFixed(4)}
📈 **Growth from ATL:** +${gainFromATL.toFixed(1)}%

🚀 Impressive ${gainFromATL.toFixed(0)}% recovery from absolute lows!`;

          thinkingContext.establishedFacts[`${atlCrypto}_atl`] = atlData.atl;
          addToMemory(message, response, "atl_intelligent");
          return response;
        }
        break;

      case "founder":
        const founderResponse = `Oh, you're asking about who founded Monad? That's Keone Hon and James Hunsaker!

These guys have serious credentials - Keone was at Jump Trading leading high-frequency trading systems, and James has deep experience in distributed systems. They're building Monad to be one of the fastest EVM-compatible blockchains out there.

Monad is designed for massive throughput and low latency while staying fully Ethereum-compatible. They're using some really clever parallel execution and optimistic processing techniques to achieve speeds that are orders of magnitude faster than traditional EVM chains.

Pretty exciting stuff - they're bringing high-performance trading technology to blockchain infrastructure!`;

        thinkingContext.establishedFacts["monad_founder"] =
          "Keone Hon and James Hunsaker";
        addToMemory(message, founderResponse, "founder_intelligent");
        return founderResponse;

      case "price":
        const priceCrypto = thinkingContext.primaryCrypto;
        const priceData = await fetchCryptoPrice(priceCrypto);
        if (priceData) {
          // Create a natural, conversational response
          const changeDirection = priceData.change24h >= 0 ? "up" : "down";
          const changeEmoji = priceData.change24h >= 0 ? "📈" : "📉";

          const response = `Hey! So ${priceCrypto.toUpperCase()} is currently trading at **$${priceData.price.toFixed(
            2
          )}** ${changeEmoji}

The price is ${changeDirection} ${Math.abs(priceData.change24h).toFixed(
            2
          )}% in the last 24 hours. It has a market cap of around $${(
            priceData.marketCap / 1e9
          ).toFixed(2)} billion, making it rank #${
            priceData.rank || "N/A"
          } in the market.

Daily trading volume is sitting at about $${(priceData.volume / 1e6).toFixed(
            2
          )} million, which shows ${
            priceData.volume > 100000000
              ? "pretty solid interest from traders"
              : "moderate activity"
          }.

Looking at the bigger picture - the all-time high was $${priceData.ath?.toFixed(
            2
          )} back in ${new Date(
            priceData.athDate || ""
          ).toLocaleDateString()}, so we're currently ${Math.abs(
            priceData.athChangePercentage || 0
          ).toFixed(1)}% below that peak. ${
            Math.abs(priceData.athChangePercentage || 0) > 70
              ? "That's quite a discount from the highs!"
              : "Not too far from the all-time high."
          }

The all-time low was $${priceData.atl?.toFixed(
            4
          )}, so we've recovered ${priceData.atlChangePercentage?.toFixed(
            1
          )}% from those lows. ${
            (priceData.atlChangePercentage || 0) > 100
              ? "Pretty impressive recovery!"
              : "Still building back up."
          }`;

          thinkingContext.establishedFacts[`${priceCrypto}_price`] =
            priceData.price;
          addToMemory(message, response, "price_intelligent");
          return response;
        }
        break;
    }
  } catch (error) {
    console.error("Error in intelligent query handling:", error);
  }

  return null;
};

const fallbackResponses = {
  greeting: [
    "Hey there! I'm your AI assistant here at Zarfa. I know quite a bit about your company data, payroll stuff, and of course Monad and crypto in general. What's up? What would you like to chat about?",
    "Hi! I'm here to help with anything related to your business, Monad (MON) prices, employee data, or just general crypto talk. I've got access to live market data and your company analytics. What can I help you with?",
    "Hello! I'm your friendly AI assistant. I can dig into your employee data, check crypto prices, explain blockchain stuff, or just have a chat about business. What's on your mind today?",
  ],
  clarification: [
    "Hmm, I want to make sure I give you exactly what you're looking for. Could you be a bit more specific about what you'd like to know? 🤔",
    "I'd love to help! Just want to make sure I understand - are you asking about a specific crypto, or something about your company data?",
    "Could you help me out with a bit more detail? I want to give you the best answer possible!",
  ],
  intelligent: [
    "Let me think about this for a second and give you some insights based on what I'm seeing...",
    "Interesting question! Based on the current data I have access to, here's what I can tell you...",
    "Good question! Let me break this down for you with some real information...",
  ],
  general: [
    "I'm here to help with anything about your business, crypto prices, employee stuff, or just general blockchain chat. What would you like to know?",
    "Feel free to ask me about your company data, Monad (MON) market info, employee analytics, or really anything crypto-related!",
    "I can help with business insights, crypto analysis, payroll questions, or just chat about blockchain tech. What interests you?",
  ],
};

const getContextualFallback = (message: string): string => {
  const messageCount = conversationMemory.length;

  // Detect greeting
  if (
    /(hi|hello|hey|good morning|good afternoon|good evening)/i.test(message)
  ) {
    return fallbackResponses.greeting[
      Math.floor(Math.random() * fallbackResponses.greeting.length)
    ];
  }

  // Detect general questions
  if (/(help|what can you do|what do you know|tell me about)/i.test(message)) {
    return fallbackResponses.general[
      Math.floor(Math.random() * fallbackResponses.general.length)
    ];
  }

  // If someone asks about "Aptos" directly, clarify we're using Monad
  if (/(aptos|apt)/i.test(message) && /(price|what is|about)/i.test(message)) {
    return "Just a heads up - this app uses **Monad (MON)** blockchain, not Aptos! Monad is a high-performance EVM-compatible chain. Did you want to know about Monad prices or features instead?";
  }

  if (messageCount > 3) {
    return fallbackResponses.intelligent[
      Math.floor(Math.random() * fallbackResponses.intelligent.length)
    ];
  }

  return fallbackResponses.clarification[
    Math.floor(Math.random() * fallbackResponses.clarification.length)
  ];
};

export const generateAIResponse = async (
  message: string,
  context: AIContext
): Promise<string> => {
  console.log("🧠 Generating ultra-intelligent response for:", message);
  console.log("📊 Full context:", {
    employees: context.employees.length,
    payments: context.payments.length,
    company: context.companyName,
    conversationMemory: conversationMemory.length,
    thinkingContext,
  });

  // First, try intelligent contextual handling
  try {
    const intelligentResponse = await handleIntelligentQueries(
      message,
      context
    );
    if (intelligentResponse) {
      console.log("🎯 Returning contextually intelligent response");
      return intelligentResponse;
    }
  } catch (error) {
    console.warn("Intelligent queries failed, continuing with Gemini:", error);
  }

  // Fix typos in the message
  const correctedMessage = fixTypos(message);
  if (correctedMessage !== message) {
    console.log("✏️ Fixed typos:", message, "->", correctedMessage);
  }

  if (!genAI) {
    console.log("🔄 Using contextual fallback - no API key");
    const response = getContextualFallback(correctedMessage);
    addToMemory(correctedMessage, response, "contextual_fallback");
    return response;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
      generationConfig: {
        temperature: 0.95,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1200,
      },
    });

    const systemPrompt = createSystemPrompt(context);
    const fullPrompt = `${systemPrompt}\n\nUser Question: ${correctedMessage}\n\nRespond naturally like a knowledgeable friend who happens to know a lot about crypto and business. Be conversational, friendly, and helpful. Use emojis sparingly and naturally. Avoid overly formal language or rigid structures. Just chat normally while being informative.`;

    console.log("🚀 Calling Gemini with ultra-smart prompt...");
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from AI");
    }

    // Clean up the response - remove any meta-commentary
    const cleanedText = text
      .trim()
      .replace(/^(Here's|Let me|I'll provide|Based on)/i, "")
      .replace(/\*\*Analysis:\*\*/g, "🧠 **AI Analysis:**")
      .replace(/\*\*Summary:\*\*/g, "📋 **Summary:**")
      .trim();

    addToMemory(correctedMessage, cleanedText, "gemini_intelligent");
    return cleanedText;
  } catch (error) {
    console.error("❌ AI service error:", error);

    // Enhanced error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      // Check specific Gemini API errors
      if (error.message.includes("API_KEY")) {
        console.error("🔑 API Key issue detected");
      }
      if (error.message.includes("quota")) {
        console.error("💰 API quota exceeded");
      }
      if (error.message.includes("model")) {
        console.error("🤖 Model configuration issue");
      }
    }

    console.log("🔄 Falling back to contextual response");

    const response = getContextualFallback(correctedMessage);
    addToMemory(correctedMessage, response, "error_fallback");
    return response;
  }
};

// Receipt processing for VAT refunds
export interface VATReceiptData {
  vatAmount: number;
  totalAmount: number;
  merchantName: string;
  merchantAddress: string;
  receiptNumber: string;
  purchaseDate: string;
  vatRegistrationNumber: string;
  confidence: number;
  extractedText?: string;
}

export const processVATReceipt = async (imageFile: File): Promise<VATReceiptData> => {
  console.log("🧾 Processing VAT receipt with AI:", imageFile.name);
  console.log("📁 File type:", imageFile.type);
  console.log("📏 File size:", (imageFile.size / 1024).toFixed(2), "KB");

  if (!genAI) {
    console.warn("⚠️ Gemini API not available, using mock data");
    // Return mock data for testing
    return {
      vatAmount: 15.0,
      totalAmount: 100.0,
      merchantName: "Sample Store",
      merchantAddress: "123 Main St, City",
      receiptNumber: "REC-" + Date.now(),
      purchaseDate: new Date().toISOString().split('T')[0],
      vatRegistrationNumber: "VAT-123456789",
      confidence: 0.85,
    };
  }

  try {
    console.log("🔄 Converting file to base64...");
    // Convert image to base64
    const imageData = await fileToBase64(imageFile);
    console.log("✅ Base64 conversion complete");
    
    // Use Gemini 2.5 Pro (latest model)
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-pro",
    });
    console.log("🤖 Gemini model initialized: gemini-2.5-pro");

    const prompt = `You are an expert at reading receipts, invoices, and tax documents. Your task is to extract VAT/tax information from this document.

CRITICAL INSTRUCTIONS - READ CAREFULLY:

1. FIRST, read ALL visible text in the document from top to bottom
2. Look at tables, line items, and totals sections carefully
3. Find these EXACT pieces of information:

MERCHANT/COMPANY INFO:
- Company name is usually at the TOP of the document (first text block)
- Address is usually right below the company name
- VAT registration number is often near the company info or at the bottom

FINANCIAL INFORMATION:
- Look for a table or list showing:
  * "Subtotal" or "Net Amount" (amount before VAT)
  * "VAT" or "Tax" or "GST" (the tax amount charged)
  * "Total" or "Total with VAT" or "Amount Due" (final amount including VAT)
- If you see a VAT percentage (like "20% VAT"), CALCULATE the amount:
  Example: Subtotal £200, VAT 20% → VAT Amount = £200 × 0.20 = £40

DOCUMENT IDENTIFIERS:
- Receipt/Invoice number: Look for "Invoice no.", "Receipt no.", "Order no.", "Document no."
- Date: Look for "Date:", "Invoice Date:", "Purchase Date:" - convert to YYYY-MM-DD format

CONFIDENCE SCORING RULES:
- If you can READ and EXTRACT all fields clearly → confidence = 0.9
- If you can extract most fields (missing 1-2) → confidence = 0.7
- If you extract some fields but many are missing → confidence = 0.5
- If the document is unreadable or you can't extract anything → confidence = 0.1

IMPORTANT: Even if some fields are missing, if you can clearly see the VAT amount and total, set confidence to at least 0.7!

OUTPUT FORMAT (respond ONLY with this JSON, no other text):
{
  "vatAmount": <number (just the number, no currency symbol)>,
  "totalAmount": <number (total including VAT)>,
  "merchantName": "<company name from top of document>",
  "merchantAddress": "<full address or 'Not found'>",
  "receiptNumber": "<invoice/receipt number or 'Not found'>",
  "purchaseDate": "<YYYY-MM-DD format>",
  "vatRegistrationNumber": "<VAT reg number or empty string>",
  "confidence": <0.0 to 1.0 - be generous if you can read the key financial data>
}

Example of good extraction (confidence 0.9):
{
  "vatAmount": 40.00,
  "totalAmount": 240.00,
  "merchantName": "Apple Store UK",
  "merchantAddress": "123 Oxford Street, London, W1D 2LG",
  "receiptNumber": "INV-2024-001234",
  "purchaseDate": "2024-11-01",
  "vatRegistrationNumber": "GB123456789",
  "confidence": 0.9
}

NOW ANALYZE THE DOCUMENT AND RETURN ONLY THE JSON.`;

    console.log("📤 Sending request to Gemini API...");
    console.log("📋 Prompt length:", prompt.length, "characters");

    // First, extract all text from the document
    console.log("📖 Step 1: Extracting all text from document...");
    const textExtractionPrompt = "Extract ALL visible text from this document. List everything you can see, line by line, exactly as it appears.";
    
    const textResult = await model.generateContent([
      textExtractionPrompt,
      {
        inlineData: {
          data: imageData.split(',')[1],
          mimeType: imageFile.type,
        },
      },
    ]);

    const extractedText = await textResult.response.text();
    console.log("📄 Extracted Text from Document:");
    console.log(extractedText);
    console.log("=" .repeat(50));

    // Now use the extracted text + image for structured data extraction
    console.log("🔍 Step 2: Extracting structured data...");
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageData.split(',')[1], // Remove data:image/...;base64, prefix
          mimeType: imageFile.type,
        },
      },
    ]);

    const response = await result.response;
    const text = response.text();
    
    console.log("📥 Raw AI Response received");
    console.log("📄 Response length:", text.length, "characters");
    console.log("🤖 Full AI Response:", text);

    // Clean up the response - remove markdown code blocks if present
    const jsonText = text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    console.log("🧹 Cleaned JSON text:", jsonText);

    // Parse the JSON response
    let receiptData: VATReceiptData;
    try {
      receiptData = JSON.parse(jsonText);
      console.log("✅ JSON parsed successfully");
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      console.error("📄 Failed to parse:", jsonText);
      throw new Error(`Failed to parse AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }

    // Validate and sanitize the data
    console.log("🔍 Validating extracted data...");
    receiptData.vatAmount = Number(receiptData.vatAmount) || 0;
    receiptData.totalAmount = Number(receiptData.totalAmount) || 0;
    receiptData.confidence = Math.min(Math.max(Number(receiptData.confidence) || 0, 0), 1);
    receiptData.extractedText = text;

    console.log("✅ Receipt processed successfully:");
    console.log("  💰 VAT Amount:", receiptData.vatAmount);
    console.log("  💵 Total Amount:", receiptData.totalAmount);
    console.log("  🏪 Merchant:", receiptData.merchantName);
    console.log("  🧾 Receipt No:", receiptData.receiptNumber);
    console.log("  📅 Date:", receiptData.purchaseDate);
    console.log("  🎯 Confidence:", (receiptData.confidence * 100).toFixed(1) + "%");
    
    return receiptData;

  } catch (error) {
    console.error("❌ Error processing receipt:", error);
    console.error("🔍 Error type:", error instanceof Error ? error.constructor.name : typeof error);
    console.error("📄 Error message:", error instanceof Error ? error.message : String(error));
    console.error("📚 Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    
    // Return fallback data with low confidence
    return {
      vatAmount: 0,
      totalAmount: 0,
      merchantName: "Unable to extract",
      merchantAddress: "",
      receiptNumber: "MANUAL-" + Date.now(),
      purchaseDate: new Date().toISOString().split('T')[0],
      vatRegistrationNumber: "",
      confidence: 0.1,
      extractedText: error instanceof Error ? error.message : "Processing failed",
    };
  }
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateCompanyInsights = (context: AIContext) => {
  const { employees, payments } = context;

  const totalPayroll = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const avgSalary = employees.length > 0 ? totalPayroll / employees.length : 0;

  const departmentCounts: { [key: string]: number } = {};
  employees.forEach((emp) => {
    departmentCounts[emp.department] =
      (departmentCounts[emp.department] || 0) + 1;
  });

  const completedPayments = payments.filter((p) => p.status === "completed");
  const totalPaid = completedPayments.reduce((sum, p) => sum + p.amount, 0);

  return {
    totalEmployees: employees.length,
    totalPayroll,
    avgSalary,
    departmentCounts,
    totalPaid,
    completedPayments: completedPayments.length,
    pendingPayments: payments.filter((p) => p.status === "pending").length,
  };
};

const generateCompanyAnalytics = (context: AIContext) => {
  const { employees, payments, companyName } = context;

  if (employees.length === 0) {
    return {
      totalEmployees: 0,
      totalPayroll: 0,
      avgSalary: 0,
      highestPaid: null,
      lowestPaid: null,
      newestEmployee: null,
      oldestEmployee: null,
      departmentBreakdown: {},
      salaryRange: { min: 0, max: 0 },
      payrollGrowth: 0,
      totalPaid: 0,
      lastPayment: null,
      companyDescription: `${companyName} is an innovative blockchain-based payroll company using Monad technology for secure, fast, and transparent employee payments.`,
    };
  }

  const totalPayroll = employees.reduce(
    (sum, emp) => sum + (emp.salary || 0),
    0
  );
  const avgSalary = totalPayroll / employees.length;

  const sortedBySalary = [...employees].sort(
    (a, b) => (b.salary || 0) - (a.salary || 0)
  );
  const highestPaid = sortedBySalary[0];
  const lowestPaid = sortedBySalary[sortedBySalary.length - 1];

  // Department breakdown
  const departmentBreakdown: {
    [key: string]: { count: number; totalSalary: number; avgSalary: number };
  } = {};
  employees.forEach((emp) => {
    const dept = emp.department || "Unassigned";
    if (!departmentBreakdown[dept]) {
      departmentBreakdown[dept] = { count: 0, totalSalary: 0, avgSalary: 0 };
    }
    departmentBreakdown[dept].count++;
    departmentBreakdown[dept].totalSalary += emp.salary || 0;
    departmentBreakdown[dept].avgSalary =
      departmentBreakdown[dept].totalSalary / departmentBreakdown[dept].count;
  });

  // Salary range
  const salaryRange = {
    min: Math.min(...employees.map((emp) => emp.salary || 0)),
    max: Math.max(...employees.map((emp) => emp.salary || 0)),
  };

  // Payment analytics
  const completedPayments = payments.filter((p) => p.status === "completed");
  const totalPaid = completedPayments.reduce(
    (sum, p) => sum + (p.amount || 0),
    0
  );
  const lastPayment =
    payments.length > 0 ? payments[payments.length - 1] : null;

  // Sort by hire date (assuming created_at or hire_date field)
  const sortedByDate = [...employees].sort((a, b) => {
    const dateA = new Date(a.created_at || a.hire_date || "1970-01-01");
    const dateB = new Date(b.created_at || b.hire_date || "1970-01-01");
    return dateB.getTime() - dateA.getTime();
  });

  const newestEmployee = sortedByDate[0];
  const oldestEmployee = sortedByDate[sortedByDate.length - 1];

  return {
    totalEmployees: employees.length,
    totalPayroll,
    avgSalary,
    highestPaid,
    lowestPaid,
    newestEmployee,
    oldestEmployee,
    departmentBreakdown,
    salaryRange,
    totalPaid,
    lastPayment,
    completedPayments: completedPayments.length,
    pendingPayments: payments.filter((p) => p.status === "pending").length,
    companyDescription: `${companyName} is an innovative blockchain-based payroll company using Monad technology for secure, fast, and transparent employee payments. We leverage cutting-edge EVM-compatible blockchain infrastructure to revolutionize how businesses handle payroll operations.`,
  };
};

const handleCompanyIntelligence = (
  message: string,
  context: AIContext
): string | null => {
  const analysis = analyzeMessage(message);
  const analytics = generateCompanyAnalytics(context);

  console.log("🏢 Company Intelligence Analysis:", { analysis, analytics });

  // Basic conversational responses
  if (
    /(thank you|thanks|thx|appreciate|great|awesome|perfect|excellent)/i.test(
      message
    ) &&
    message.length < 50
  ) {
    const responses = [
      "You're welcome! Happy to help with your business intelligence needs. Anything else you'd like to know about your company or Aptos?",
      "Glad I could help! I'm here whenever you need insights about your employees, payroll, or crypto market data.",
      "My pleasure! Feel free to ask me anything about your business operations or Aptos blockchain.",
      "You're welcome! I'm always ready to dive into your company data or provide market analysis.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Simple greetings
  if (
    /(^hi$|^hello$|^hey$|good morning|good afternoon|good evening)/i.test(
      message.trim()
    )
  ) {
    return "Hey there! I'm here to help you with anything about your company, employees, payroll, or crypto stuff. I know your business data pretty well and can check live Monad (MON) prices too. What's up?";
  }

  // Salary overview questions - catch various forms
  if (
    /overview.*(salary|salaries|pay|compensation)/i.test(message) ||
    /salary.*(overview|breakdown|summary)/i.test(message) ||
    /(salary|salaries).*(overview|breakdown|list)/i.test(message)
  ) {
    const employeeList = context.employees
      .sort((a, b) => (b.salary || 0) - (a.salary || 0))
      .map(
        (emp, index) =>
          `${index + 1}. **${emp.name}** - ${emp.designation} (${
            emp.department
          }) - $${emp.salary?.toLocaleString()}`
      )
      .join("\n");

    return `💰 **Salary Overview**

**Company Salary Stats:**
• Total Employees: ${analytics.totalEmployees}
• Total Monthly Payroll: $${analytics.totalPayroll.toLocaleString()}
• Average Salary: $${analytics.avgSalary.toLocaleString()}
• Salary Range: $${analytics.salaryRange.min.toLocaleString()} - $${analytics.salaryRange.max.toLocaleString()}
• Salary Spread: $${(
      analytics.salaryRange.max - analytics.salaryRange.min
    ).toLocaleString()}

**Employee List (by salary):**
${employeeList}

**Department Salary Breakdown:**
${Object.entries(analytics.departmentBreakdown)
  .map(
    ([dept, data]) =>
      `• **${dept}**: ${
        data.count
      } employees, avg $${data.avgSalary.toLocaleString()}, total $${data.totalSalary.toLocaleString()}`
  )
  .join("\n")}

**Key Insights:**
• Highest earner makes ${(
      ((analytics.highestPaid?.salary || 0) /
        (analytics.lowestPaid?.salary || 1)) *
      100
    ).toFixed(0)}% more than lowest earner
• ${Object.keys(analytics.departmentBreakdown).length} departments represented`;
  }

  // Company name questions
  if (
    analysis.topics.includes("name") ||
    /what.*(company|business).*name/i.test(message)
  ) {
    return `🏢 **Company Name:** ${context.companyName}

${analytics.companyDescription}

We currently have ${analytics.totalEmployees} employees and have processed ${analytics.completedPayments} successful payments using Monad blockchain technology.`;
  }

  // What does the company do
  if (
    analysis.topics.includes("business_type") ||
    /what.*(company|business).*(do|does)/i.test(message)
  ) {
    return `# 🚀 What ${context.companyName} Does:

${analytics.companyDescription}

## Key Services:

- Blockchain-based payroll processing
- Monad-powered employee payments
- Secure & transparent salary distribution on EVM-compatible infrastructure
- Real-time payment tracking
- High-performance crypto payroll solutions

## Current Operations:

- ${analytics.totalEmployees} active employees
- $${analytics.totalPayroll.toLocaleString()} total monthly payroll
- ${analytics.completedPayments} payments processed
- ${Object.keys(analytics.departmentBreakdown).length} departments`;
  }

  // Employee count
  if (
    analysis.topics.includes("count") &&
    analysis.topics.includes("employees")
  ) {
    return `👥 **Employee Count:** ${analytics.totalEmployees} employees

**Department Breakdown:**
${Object.entries(analytics.departmentBreakdown)
  .map(
    ([dept, data]) =>
      `• ${dept}: ${
        data.count
      } employees (avg salary: $${data.avgSalary.toLocaleString()})`
  )
  .join("\n")}

**Payroll Overview:**
• Total monthly payroll: $${analytics.totalPayroll.toLocaleString()}
• Average salary: $${analytics.avgSalary.toLocaleString()}`;
  }

  // Highest paid employee
  if (analysis.topics.includes("highest") && analysis.topics.includes("paid")) {
    if (!analytics.highestPaid) {
      return "I don't have information about employee salaries at the moment.";
    }

    return `# 💰 Highest Paid Employee: ${analytics.highestPaid.name}

## Position: ${analytics.highestPaid.designation}
## Department: ${analytics.highestPaid.department}
## Salary: $${analytics.highestPaid.salary?.toLocaleString()}
## Percentage of total payroll: ${(
      ((analytics.highestPaid.salary || 0) / analytics.totalPayroll) *
      100
    ).toFixed(1)}%

This represents our top compensation tier, ${(
      ((analytics.highestPaid.salary || 0) / analytics.avgSalary - 1) *
      100
    ).toFixed(0)}% above average salary.`;
  }

  // Lowest paid employee
  if (
    (analysis.topics.includes("lowest") &&
      analysis.topics.includes("employees")) ||
    /lowest.*(paid|salary|employee)/i.test(message)
  ) {
    if (!analytics.lowestPaid) {
      return "No employee data available yet.";
    }
    return `📊 **Lowest Paid Employee:** ${analytics.lowestPaid.name}

• **Position:** ${analytics.lowestPaid.designation}
• **Department:** ${analytics.lowestPaid.department}
• **Salary:** $${analytics.lowestPaid.salary?.toLocaleString()}
• **Percentage of total payroll:** ${(
      (analytics.lowestPaid.salary / analytics.totalPayroll) *
      100
    ).toFixed(1)}%

This represents our entry-level compensation, ${(
      (1 - analytics.lowestPaid.salary / analytics.avgSalary) *
      100
    ).toFixed(0)}% below average salary.`;
  }

  // Newest employee
  if (
    analysis.topics.includes("newest") &&
    analysis.topics.includes("employees")
  ) {
    if (!analytics.newestEmployee) {
      return "No employee data available yet.";
    }
    return `🆕 **Newest Employee:** ${analytics.newestEmployee.name}

• **Position:** ${analytics.newestEmployee.designation}
• **Department:** ${analytics.newestEmployee.department}
• **Salary:** $${analytics.newestEmployee.salary?.toLocaleString()}
• **Joined:** ${new Date(
      analytics.newestEmployee.created_at ||
        analytics.newestEmployee.hire_date ||
        ""
    ).toLocaleDateString()}

Welcome to our growing team! They're earning ${
      analytics.newestEmployee.salary > analytics.avgSalary ? "above" : "below"
    } average salary.`;
  }

  // Employee list/overview
  if (
    (analysis.topics.includes("overview") &&
      analysis.topics.includes("employees")) ||
    /list.*(employee|staff)/i.test(message) ||
    /(employee|salary).*(breakdown|overview)/i.test(message)
  ) {
    const employeeList = context.employees
      .sort((a, b) => (b.salary || 0) - (a.salary || 0))
      .map(
        (emp, index) =>
          `${index + 1}. **${emp.name}** - ${emp.designation} (${
            emp.department
          }) - $${emp.salary?.toLocaleString()}`
      )
      .join("\n");

    return `👥 **Complete Employee Overview**

**Company Stats:**
• Total Employees: ${analytics.totalEmployees}
• Total Payroll: $${analytics.totalPayroll.toLocaleString()}/month
• Average Salary: $${analytics.avgSalary.toLocaleString()}
• Salary Range: $${analytics.salaryRange.min.toLocaleString()} - $${analytics.salaryRange.max.toLocaleString()}

**Employee List (by salary):**
${employeeList}

**Department Summary:**
${Object.entries(analytics.departmentBreakdown)
  .map(
    ([dept, data]) =>
      `• ${dept}: ${
        data.count
      } employees, $${data.totalSalary.toLocaleString()} total`
  )
  .join("\n")}`;
  }

  // Last payment info
  if (
    /last.*(payment|paid)/i.test(message) ||
    analysis.topics.includes("payroll")
  ) {
    if (!analytics.lastPayment) {
      return "No payments have been made yet.";
    }
    return `💳 **Last Payment Information:**

• **Amount:** $${analytics.lastPayment.amount?.toLocaleString()}
• **Employee:** ${analytics.lastPayment.employee_name || "N/A"}
• **Date:** ${new Date(
      analytics.lastPayment.created_at || ""
    ).toLocaleDateString()}
• **Status:** ${analytics.lastPayment.status}
• **Transaction ID:** ${analytics.lastPayment.transaction_id || "N/A"}

**Payment Summary:**
• Total Payments Completed: ${analytics.completedPayments}
• Total Amount Paid: $${analytics.totalPaid.toLocaleString()}
• Pending Payments: ${analytics.pendingPayments}`;
  }

  // Average salary
  if (
    analysis.topics.includes("average") &&
    analysis.topics.includes("salary")
  ) {
    return `📊 **Average Salary Analysis:**

• **Company Average:** $${analytics.avgSalary.toLocaleString()}
• **Salary Range:** $${analytics.salaryRange.min.toLocaleString()} - $${analytics.salaryRange.max.toLocaleString()}
• **Spread:** $${(
      analytics.salaryRange.max - analytics.salaryRange.min
    ).toLocaleString()}

**Department Averages:**
${Object.entries(analytics.departmentBreakdown)
  .map(
    ([dept, data]) =>
      `• ${dept}: $${data.avgSalary.toLocaleString()} (${data.count} employees)`
  )
  .join("\n")}`;
  }

  return null;
};
