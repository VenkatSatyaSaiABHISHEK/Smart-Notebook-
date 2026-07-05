import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const processWithGroq = async (text, task = "format") => {
  // Check token limit before calling Groq API
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      const userRef = doc(db, "users", currentUser.uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const userData = snap.data();
        const tokensUsed = userData.tokensUsed || 0;
        if (tokensUsed >= 100000000) {
          throw new Error("Daily Groq token limit reached (100,000,000 tokens). Please wait for it to reset.");
        }
      }
    } catch (err) {
      if (err.message.includes("Daily Groq token limit reached")) {
        throw err;
      }
      console.error("Failed to check user token budget in groqService:", err);
    }
  }

  const apiKey1 = import.meta.env.VITE_GROQ_API_KEY;
  const apiKey2 = import.meta.env.VITE_GROQ_API_KEY_2;
  const apiKeys = [apiKey1, apiKey2].filter(Boolean);

  if (apiKeys.length === 0) {
    throw new Error("Groq API key not found in environment variables.");
  }

  let systemPrompt = "";
  if (task === "format") {
    systemPrompt = "You are an AI study assistant. The user will provide raw notes, messy text, or random data. Your job is to format and summarize it into clean, readable, professional study notes using markdown. If the text is random characters (like an API key or ID), just explain politely what it appears to be, rather than formatting it as notes. Keep your response concise and directly provide the notes/explanation without filler greetings.";
  } else if (task === "explain_code") {
    systemPrompt = "You are an expert programming instructor. You explain programming concepts in simple, easy-to-understand terms suitable for beginner students, using a warm and friendly teacher tone. The user will provide a code snippet. At the very beginning of your explanation, you MUST output a line specifying the topic of the code, formatted exactly as: 'Topic: [Topic Name]' (e.g., 'Topic: Recursion', 'Topic: Mathematics', 'Topic: Sorting', 'Topic: Dynamic Programming'). Then explain what the code does step-by-step, using simple analogies and short sentences. If the code is recursive or mathematical, trace each recursive or iterative call step-by-step (e.g., showing how the function calls itself with different arguments, then how it returns values back from the base case up to the final result). Format the response using subheadings and you MUST specify the line number or range of lines being executed in the original code for EACH step, formatted exactly as: '### Step X (Line Y): [Title]' or '### Step X (Lines Y-Z): [Title]' (e.g., '### Step 1 (Line 2): Initialize base case'). Trace each step. At the end of each step's explanation, if any variables are created or changed, list their updated values on a new line formatted exactly as: 'State: var1 = val1, var2 = val2' (e.g., 'State: x = 5, y = 10'). For recursive functions, you MUST also output the exact call stack at the end of each step (on its own line, before or after the State line) formatted exactly as: 'Call Stack: func(args1) [status1] -> func(args2) [status2] -> ...' (e.g., 'Call Stack: GCD(24, 36) [Suspended] -> GCD(24, 12) [Active]'). The status should be one of: 'Active', 'Suspended', or 'Base Case' or 'Returning [value]'. If it is not recursive, you can omit the Call Stack line. Every markdown code block you output MUST have a unique random 6-character lowercase alphanumeric id in the opening tag, formatted exactly like: ```[language] id=\"[random_6_char_id]\"```.";
  } else if (task === "extract_blocks") {
    systemPrompt = `You are an AI assistant and JSON data extractor. You act as a friendly programming instructor, explaining complex ideas in simple, clean, student-friendly terms.
Your task is to parse the user's text and return a valid JSON object containing a "blocks" array. Each block must represent a logical section, question, table, or code snippet.
CRITICAL DESIGN RULES:
1. Re-organize the information logically. If it is a disorganized PDF extraction, structure it topic-by-topic or section-by-section.
2. If the text contains tabular data (e.g. lists of team members, Day Ranges, roles, schedules, tables, rows), you MUST extract it as a "text" block and format it using a clean, beautiful Markdown table (using | headers and dividers).
3. If you see code, extract it as a "code" block, simulate its output in the "output" field, and explain it in "aiExample".
Inside the "aiExample" field, provide a detailed step-by-step execution trace of the code using simple, conversational, beginner-friendly explanations. At the very beginning of the explanation, you MUST output a line specifying the topic of the code, formatted exactly as: 'Topic: [Topic Name]' (e.g., 'Topic: Recursion', 'Topic: Mathematics'). Format the response using subheadings, and you MUST specify the executing line number or range of lines in the heading of each step, formatted exactly as '### Step X (Line Y): [Title]' or '### Step X (Lines Y-Z): [Title]'. If it is recursive/mathematical, trace each call and return back step-by-step. At the end of each step's explanation, if any variables are created or changed, list their updated values on a new line formatted exactly as: 'State: var1 = val1, var2 = val2' (e.g., 'State: x = 5, y = 10'). For recursive functions, you MUST also output the exact call stack at the end of each step (on its own line, before or after the State line) formatted exactly as: 'Call Stack: func(args1) [status1] -> func(args2) [status2] -> ...' (e.g., 'Call Stack: GCD(24, 36) [Suspended] -> GCD(24, 12) [Active]'). The status should be one of: 'Active', 'Suspended', or 'Base Case' or 'Returning [value]'. If it is not recursive, you can omit the Call Stack line. Every markdown code block in the explanation must have a unique random 6-character lowercase alphanumeric id in the opening tag like: \`\`\`[language] id="[random_6_char_id]"\`\`\`.
4. Ensure the JSON is completely valid. Do NOT use markdown code blocks like \`\`\`json outside the JSON object. Just return the JSON object directly.
Format structure:
{
  "blocks": [
    { "type": "code", "language": "python", "content": "print('hello')", "output": "hello", "aiExample": "Trace explaining greeting." },
    { "type": "text", "content": "## Today's Learnings\\n\\n| Topic | Description |\\n|---|---|\\n| Printing | Standard console output |" }
  ]
}`;
  } else if (task === "analyze_image") {
    systemPrompt = `You are a smart OCR and visual learning assistant. The user will upload an image (which could contain handwritten notes, diagrams, study questions, or coding problems).
Your task is to analyze the image thoroughly and return a valid JSON object (NOT markdown code blocks, just raw JSON text) with the following structure:
{
  "description": "A clear, engaging description of what the image is, its content, and visual context (e.g., 'A whiteboard diagram showing quicksort partitioning').",
  "ocrText": "The complete extracted text or code from the image, preserving lines and formatting as much as possible.",
  "chunks": [
    {
      "id": "chunk_1",
      "type": "text", // "text" or "code"
      "title": "Section/Question Title (e.g., Quicksort Algorithm or Problem 1)",
      "content": "The actual text or code of this specific logical section."
    }
  ]
}
Analyze the image 'question-wise' or 'section-wise'. Split the text and code into logical, bite-sized sections (chunks) that represent distinct learning units or individual questions.
CRITICAL DESIGN RULES:
1. Re-organize the information logically. Structure it topic-by-topic or section-by-section.
2. If the visual notes/ocr contain tabular data (e.g. list of team members, Day Ranges, tables, rows, schedules), you MUST format the content of the chunk using a clean, beautiful Markdown table (using | headers and dividers).
3. Ensure the JSON is completely valid and correctly escaped.`;
  }

  let model = "llama-3.1-8b-instant";
  let messages = [
    { role: "system", content: systemPrompt },
    { role: "user", content: text }
  ];

  if (typeof text === 'string' && text.startsWith("data:image/")) {
    model = "llama-3.2-11b-vision-preview";
    messages = [
      {
        role: "user",
        content: [
          { type: "text", text: systemPrompt + "\n\nPlease process the information in this image according to the rules above. Extract all text, code, or describe the image." },
          { type: "image_url", image_url: { url: text } }
        ]
      }
    ];
  }

  let lastError = null;
  for (let i = 0; i < apiKeys.length; i++) {
    const currentKey = apiKeys[i];
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${currentKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.5,
          max_tokens: 4096
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || "Failed to fetch from Groq";
        console.warn(`Groq API Key ${i + 1} failed: ${errorMessage}. Trying next key.`);
        lastError = new Error(errorMessage);
        continue;
      }

      const data = await response.json();
      return {
        text: data.choices[0].message.content.trim(),
        usage: data.usage || { total_tokens: 0, prompt_tokens: 0, completion_tokens: 0 }
      };
    } catch (err) {
      console.warn(`Request failed with Groq API Key ${i + 1}: ${err.message}. Trying next key.`);
      lastError = err;
    }
  }

  throw lastError || new Error("All Groq API keys failed.");
};
