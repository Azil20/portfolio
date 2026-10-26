export interface Message {
  text: string;
  isBot: boolean;
}

export type AIProvider = 'openai' | 'groq' | 'gemini' | 'custom';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

const SYSTEM_PROMPT = `You are Med, the official AI Agent assistant on Mohamed Azil's interactive portfolio website.
You speak on behalf of Mohamed Azil, a talented Master 2 Big Data & Artificial Intelligence student and AI/Data Engineer actively seeking a PFE internship starting February 2027.
Your name is Med.

Key Information about Mohamed Azil:
- Profile: Étudiant en dernière année de Master (M2) Big Data, Intelligence Artificielle et Applications Avancées à l’Université Ibn Tofaïl (Kénitra). Spécialisé en Machine Learning, NLP, architectures de données et calcul distribué.
- Objectif: Recherche active d'un Stage de Fin d'Études (PFE) à partir de début février 2027 en tant qu'ingénieur IA, Machine Learning Engineer ou Big Data Engineer.
- Date de Naissance (Date of Birth): 10 Juin 2004 (10/06/2004) [June 10, 2004] au Maroc.
- Âge (Age): Né le 10 juin 2004. Calculez ou indiquez son âge exact selon la date courante (20 ans en 2024, 21 ans en 2025, 22 ans en 2026).
- Contact:
  - Email: ailmohamed@outlook.com
  - Téléphone: +212 689 448 142
  - LinkedIn: https://www.linkedin.com/in/mohamed-azil-3b303b365/
  - GitHub: https://github.com/Azil20
  - Localisation: Maroc (Kénitra / Béni Mellal)
- Formations (Education):
  1. Master Big Data, Intelligence Artificielle et Applications Avancées (M2) (2024 — Présent) — Faculté des Sciences (FSK), Université Ibn Tofaïl, Kénitra.
  2. Licence Sciences Mathématiques et Informatiques (SMI) (2024 — 2025) — Faculté des Sciences (FSK), Université Ibn Tofaïl, Kénitra.
  3. Diplôme de Brevet de Technicien Supérieur (BTS) en Systèmes et Réseaux Informatiques (2022 — 2024) — Lycée Technique Mohammed V, Béni Mellal.
- Expériences Professionnelles (Stages):
  1. Stagiaire Systèmes et Réseaux Informatiques (Mai 2024 — Juin 2024) @ Agence du Bassin Hydraulique de l’Oum Er-Rbia (ABHOER), Béni Mellal: Windows Server 2012, Active Directory, DNS, DHCP, VPN, maintenance postes clients et sécurisation infrastructure.
  2. Stagiaire Informatique & Gestion des Données (Juillet 2023 — Août 2023) @ Office National de Sécurité Sanitaire des Produits Alimentaires (ONSSA), Béni Mellal: Consolidation automatisée de données sanitaires régionales sous Excel, maintenance informatique et support utilisateurs.
- Projets Majeurs:
  1. BMA (Compagnon IA Multilingue pour la Santé Mentale): Classifieur DistilBERT fine-tuné + Google Gemini génératif avec basculement automatique multi-modèles, redirection d'urgence (lignes 15/3114), multilingue (Arabe, FR, EN). PyTorch, DistilBERT, Gemini API, Flask, SQLite.
  2. FraudGuard (Détection de Fraude Bancaire): Pipeline ML sur transactions hautement déséquilibrées (0,17% de fraudes), optimisation PR-AUC/ROC-AUC, explicabilité SHAP et web app Flask pour scoring en temps réel. Python, Scikit-Learn, SHAP, Imbalanced ML, Flask.
  3. IntelEJ Medical Center: Plateforme santé full-stack (React 18, Supabase, Tailwind) avec portails Médecin/Patient et assistant intelligent Al-Rāzī (triage trilingue arabe/français/anglais).
- Compétences:
  - Langages: Python, C++, Java, SQL, TypeScript, JavaScript, Bash, PHP.
  - IA: Deep Learning, Machine Learning, NLP, Transformers, Systèmes Experts, Explicabilité (SHAP), Classification déséquilibrée, PyTorch, Scikit-Learn.
  - Big Data: Gestion distribuée des données & calcul parallèle (Hadoop, Spark), Technologies de stockage Big Data, Algorithmique avancée & Optimisation, Recherche Opérationnelle.
  - Génie Logiciel & Web: Flask, FastAPI, React 18, API REST, Programmation Système (Linux), Tailwind CSS.
  - Bases de Données: Bases de données avancées, PostgreSQL, MySQL, SQLite, Supabase.
  - Systèmes / Outils: Linux, Windows Server, Git, GitHub.
  - Soft Skills: Résolution de problèmes, esprit analytique, travail d’équipe, adaptabilité, rigueur.
  - Certifications:
    1. Oracle AI Database Foundations Associate (1Z0-1195-26)
    2. Oracle Cloud Infrastructure AI Foundations Associate (1Z0-1122-26)
  - Langues: Arabe (maternelle), Français (courant - Niveau B2 TCF), Anglais (opérationnel / technique).
- Philosophy: "Quality, Feel, Purpose, Obsession" - believes in creating intentional, high-performance, and human-centric AI experiences.

Tone & Personality:
- CRITICAL LANGUAGE RULE: Always AUTO-DETECT the user's language (English, French, or Arabic) and reply EXACTLY in that language. Do not mix languages.
- CONCISENESS RULE: Keep responses extremely short, concise, and highly useful (maximum 1 to 2 sentences). Give the user exactly what they need to know without filler.
- Friendly, polished, highly professional, and accurate.
- If asked about Mohamed's date of birth, age, or birthday ("When was Mohamed born?", "What is his age?", "Quel est son âge ?", "Date de naissance ?"): State accurately in the user's language that Mohamed Azil was born on June 10, 2004 (10/06/2004) in Morocco and specify his age.
- If asked about hiring, contact, or collaboration, invite them to connect with Mohamed directly (email: ailmohamed@outlook.com, tel: +212 689 448 142).
- CRITICAL BOUNDARY: If a user asks about anything unrelated to Mohamed Azil (e.g., general programming, math, history, football, etc.), warmly and politely decline. Tell them clearly that you are exclusively here to discuss Mohamed's portfolio, projects, skills, education, and professional experience.`;

// Default configurations per provider
export const PROVIDER_DEFAULTS: Record<AIProvider, { baseUrl: string; model: string; name: string }> = {
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    name: 'OpenAI (GPT-4o Mini)'
  },
  groq: {
    baseUrl: 'https://api.groq.com/openai/v1',
    model: 'llama-3.3-70b-versatile',
    name: 'Groq (Llama 3.3 70B - Fast)'
  },
  gemini: {
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    model: 'gemini-3.7-flash',
    name: 'Google Gemini (3.7 Flash)'
  },
  custom: {
    baseUrl: 'https://api.openai.com/v1',
    model: 'gpt-4o-mini',
    name: 'Custom OpenAI-Compatible'
  }
};

export function getStoredAIConfig(): AIConfig {
  // Check Vite env
  const envKey = (import.meta as any).env?.VITE_AI_API_KEY || '';
  const envProvider = ((import.meta as any).env?.VITE_AI_PROVIDER || 'gemini') as AIProvider;
  const envModel = (import.meta as any).env?.VITE_AI_MODEL || PROVIDER_DEFAULTS[envProvider]?.model || 'gemini-1.5-flash';
  const envBaseUrl = (import.meta as any).env?.VITE_AI_BASE_URL || PROVIDER_DEFAULTS[envProvider]?.baseUrl || '';

  // If env specifies provider or key, use env directly
  if (envKey || (import.meta as any).env?.VITE_AI_PROVIDER) {
    return {
      provider: envProvider,
      apiKey: envKey,
      model: envModel,
      baseUrl: envBaseUrl
    };
  }

  try {
    const stored = localStorage.getItem('portfolio_ai_config');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // ignore
  }

  return {
    provider: envProvider,
    apiKey: envKey,
    model: envModel,
    baseUrl: envBaseUrl
  };
}

export function saveStoredAIConfig(config: AIConfig) {
  try {
    localStorage.setItem('portfolio_ai_config', JSON.stringify(config));
  } catch {
    // ignore
  }
}

// Intelligent fallback responses when no API key is provided yet
function generateKnowledgeFallback(userQuery: string): string {
  const query = userQuery.toLowerCase();

  if (query.includes('project') || query.includes('work') || query.includes('portfolio') || query.includes('bma') || query.includes('fraud') || query.includes('intelej')) {
    return "Mohamed has built several standout AI and data systems:\n\n• **BMA**: AI Mental Health Companion combining fine-tuned DistilBERT & Gemini API (PyTorch, Flask).\n• **FraudGuard**: Fraud detection pipeline for extreme class imbalance (0.17%) with SHAP explainability.\n• **IntelEJ Medical Center**: Full-stack healthcare platform featuring 'Al-Rāzī' intelligent triage in Arabic, French, and English (React, Supabase).\n\nWould you like more details on any of these?";
  }

  if (query.includes('education') || query.includes('parcour') || query.includes('study') || query.includes('degree') || query.includes('master') || query.includes('licence') || query.includes('bts') || query.includes('university') || query.includes('school')) {
    return "Mohamed Azil's academic path (Formations):\n\n• **Master Big Data, Intelligence Artificielle et Applications Avancées (M2)** (2024 — Présent) — Faculté des Sciences (FSK), Université Ibn Tofaïl, Kénitra.\n• **Licence Sciences Mathématiques et Informatiques (SMI)** (2024 — 2025) — Faculté des Sciences (FSK), Université Ibn Tofaïl, Kénitra.\n• **BTS en Systèmes et Réseaux Informatiques** (2022 — 2024) — Lycée Technique Mohammed V, Béni Mellal.";
  }

  if (query.includes('internship') || query.includes('stage') || query.includes('experience') || query.includes('abhoer') || query.includes('onssa')) {
    return "Mohamed Azil's professional experiences & internships:\n\n• **Stagiaire Systèmes et Réseaux Informatiques** @ Agence du Bassin Hydraulique de l'Oum Er-Rbia (ABHOER), Béni Mellal (Mai 2024 — Juin 2024): Configuration Windows Server 2012, Active Directory, DNS, DHCP, VPN, maintenance et sécurisation réseau.\n• **Stagiaire Informatique & Gestion des Données** @ Office National de Sécurité Sanitaire des Produits Alimentaires (ONSSA), Béni Mellal (Juillet 2023 — Août 2023): Consolidation automatisée de données sanitaires sous Excel, support et maintenance informatique.";
  }

  if (query.includes('pfe') || query.includes('recrut') || query.includes('disponib') || query.includes('hire') || query.includes('contact') || query.includes('email') || query.includes('phone') || query.includes('tel')) {
    return "Mohamed Azil recherche activement un **Stage de Fin d'Études (PFE)** débutant en **février 2027** en tant qu'ingénieur IA, Machine Learning Engineer ou Big Data Engineer.\n\nVous pouvez le contacter directement :\n• Email : ailmohamed@outlook.com\n• Téléphone / WhatsApp : +212 689 448 142\n• LinkedIn : https://www.linkedin.com/in/mohamed-azil-3b303b365/\n• GitHub : https://github.com/Azil20";
  }

  if (query.includes('skill') || query.includes('stack') || query.includes('tech') || query.includes('competence') || query.includes('python')) {
    return "Mohamed specializes in:\n\n• **IA & Machine Learning**: Deep Learning, NLP, Transformers, PyTorch, Scikit-Learn, SHAP, DistilBERT, Gemini API.\n• **Big Data**: Hadoop, Apache Spark, calcul distribué, NoSQL, SQL.\n• **Génie Logiciel**: Python, C++, Java, Flask, FastAPI, React 18, TypeScript, Tailwind CSS, Supabase.\n• **Systèmes & Réseaux**: Linux, Windows Server 2012, Active Directory, VPN.\n• **Langues**: Arabe (maternelle), Français (courant - B2 TCF), Anglais (opérationnel / technique).";
  }

  if (
    query.includes('born') ||
    query.includes('birth') ||
    query.includes('age') ||
    query.includes('âge') ||
    query.includes('naissance') ||
    query.includes('né') ||
    query.includes('anniversaire') ||
    query.includes('birthday') ||
    query.includes('10/06') ||
    query.includes('10-06') ||
    query.includes('2004') ||
    query.includes('old are you') ||
    query.includes('how old')
  ) {
    const today = new Date();
    let age = today.getFullYear() - 2004;
    const m = today.getMonth() - 5; // Month is 0-indexed (5 = June)
    if (m < 0 || (m === 0 && today.getDate() < 10)) {
      age--;
    }
    const isFrench = 
      query.includes('naissance') || 
      query.includes('âge') || 
      query.includes('né') || 
      query.includes('anniversaire') || 
      query.includes('quand') ||
      query.includes('quel');

    if (isFrench) {
      return `Mohamed Azil est né le 10 juin 2004 (10/06/2004) au Maroc. Il a actuellement ${age} ans.`;
    }
    return `Mohamed Azil was born on June 10, 2004 (10/06/2004) in Morocco. He is currently ${age} years old.`;
  }

  if (query.includes('about') || query.includes('who') || query.includes('mohamed') || query.includes('azil')) {
    return "Mohamed Azil (né le 10 juin 2004 / born June 10, 2004) est étudiant en dernière année de Master (M2) Big Data, Intelligence Artificielle et Applications Avancées à l’Université Ibn Tofaïl (Kénitra). Passionné par la conception de modèles de Machine Learning robustes et l'ingénierie de données distribuées, il recherche un stage PFE pour février 2027.";
  }

  if (query.includes('hello') || query.includes('hi') || query.includes('hey') || query.includes('salut') || query.includes('bonjour')) {
    return "Hello! I am Med, Mohamed Azil's AI assistant. I can tell you about his M2 Big Data & AI studies, his background, his projects like BMA and FraudGuard, or his search for a PFE internship in Feb 2027. What would you like to know?";
  }

  return "I am Med, Mohamed Azil's AI assistant. He is currently an M2 Big Data & AI student seeking a PFE internship for February 2027. How can I help you regarding his portfolio?";
}

function streamKnowledgeResponse(
  userMsg: string,
  onChunk: (text: string) => void,
  onComplete: () => void
) {
  const fullReply = generateKnowledgeFallback(userMsg);
  let index = 0;
  const interval = setInterval(() => {
    index += 3;
    if (index >= fullReply.length) {
      clearInterval(interval);
      onChunk(fullReply);
      onComplete();
    } else {
      onChunk(fullReply.slice(0, index));
    }
  }, 20);
}

// Native Gemini API call with automatic multi-model failover across working Gemini versions
async function callGeminiNative({
  messages,
  apiKey,
  model,
  onChunk,
  onComplete
}: {
  messages: Message[];
  apiKey: string;
  model: string;
  onChunk: (text: string) => void;
  onComplete: () => void;
}) {
  const cleanModel = model.replace(/^openai\//, '');
  const lastUserMsg = messages[messages.length - 1]?.text || '';

  // Models to attempt in order of availability and speed
  const modelsToTry = Array.from(new Set([
    cleanModel,
    'gemini-3.7-flash',
    'gemini-3.5-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash'
  ]));

  const contents = messages.map((m) => ({
    role: m.isBot ? 'model' : 'user',
    parts: [{ text: m.text }]
  }));

  for (const currentModel of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${encodeURIComponent(apiKey.trim())}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey.trim()
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }]
          },
          contents: contents
        })
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (reply) {
          let idx = 0;
          const interval = setInterval(() => {
            idx += 4;
            if (idx >= reply.length) {
              clearInterval(interval);
              onChunk(reply);
              onComplete();
            } else {
              onChunk(reply.slice(0, idx));
            }
          }, 18);
          return;
        }
      } else {
        const errText = await res.text();
        console.warn(`Gemini failover: model ${currentModel} returned ${res.status}:`, errText);
      }
      // If 429 quota limit, 503 high demand, or 404, loop to try next available model
    } catch {
      // Loop to try next model
    }
  }

  // If live models are temporarily rate-limited, smoothly fallback to Med's intelligent knowledge base
  streamKnowledgeResponse(lastUserMsg, onChunk, onComplete);
}

/**
 * Stream an AI response. If an API key is provided, it calls the LLM with SSE streaming.
 * Otherwise, it smoothly streams from the intelligent local knowledge base with a typewriter effect.
 */
export async function streamAIChat({
  messages,
  config,
  onChunk,
  onComplete,
  onError
}: {
  messages: Message[];
  config: AIConfig;
  onChunk: (fullText: string) => void;
  onComplete: () => void;
  onError: (error: string) => void;
}) {
  const lastUserMsg = messages[messages.length - 1]?.text || '';

  // If no API key configured, use smooth typewriter knowledge fallback
  if (!config.apiKey || !config.apiKey.trim()) {
    streamKnowledgeResponse(lastUserMsg, onChunk, onComplete);
    return;
  }

  // For Gemini provider, call native Gemini endpoint with automatic multi-model failover
  if (config.provider === 'gemini') {
    return callGeminiNative({
      messages,
      apiKey: config.apiKey,
      model: config.model || 'gemini-1.5-flash',
      onChunk,
      onComplete
    });
  }

  // Determine endpoint and model for OpenAI/Groq/Custom
  const providerDef = PROVIDER_DEFAULTS[config.provider] || PROVIDER_DEFAULTS.openai;
  const baseUrl = (config.baseUrl || providerDef.baseUrl).replace(/\/$/, '');
  const model = config.model || providerDef.model;

  // Format message history for OpenAI-compatible endpoint
  const formattedMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map((m) => ({
      role: m.isBot ? 'assistant' : 'user',
      content: m.text
    }))
  ];

  try {
    const endpoint = `${baseUrl}/chat/completions`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey.trim()}`
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: model,
        messages: formattedMessages,
        stream: true,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      let errMsg = `API error (${response.status}): ${response.statusText}`;
      try {
        const parsed = JSON.parse(errText);
        if (parsed.error?.message) errMsg = parsed.error.message;
      } catch {
        if (errText.length < 150) errMsg = errText;
      }
      onError(errMsg);
      return;
    }

    if (!response.body) {
      onError('No response stream returned by API.');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let accumulatedText = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed === 'data: [DONE]') {
          onComplete();
          return;
        }
        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta?.content || '';
            if (delta) {
              accumulatedText += delta;
              onChunk(accumulatedText);
            }
          } catch {
            // ignore JSON parse chunk error
          }
        }
      }
    }

    onComplete();
  } catch (err: any) {
    onError(err.message || 'Failed to connect to AI provider.');
  }
}
