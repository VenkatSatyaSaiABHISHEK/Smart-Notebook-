export const processWithGroq = async (text, task = "format") => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error("Groq API key not found in environment variables.");

  let systemPrompt = "";
  if (task === "format") {
    systemPrompt = "You are an AI study assistant. The user will provide raw notes, messy text, or random data. Your job is to format and summarize it into clean, readable, professional study notes using markdown. If the text is random characters (like an API key or ID), just explain politely what it appears to be, rather than formatting it as notes. Keep your response concise and directly provide the notes/explanation without filler greetings.";
  } else if (task === "explain_code") {
    systemPrompt = "You are an expert programming instructor. The user will provide a code snippet. Explain what the code does clearly and concisely. Keep the explanation short (under 4 sentences if possible) and focus on the core logic.";
  } else if (task === "extract_blocks") {
    systemPrompt = `You are an AI assistant and JSON data extractor. The user will paste text, ask a question, or provide code.
Your task is to parse everything and return ONLY a valid JSON array of objects. Do NOT use markdown code blocks like \`\`\`json outside the array. Just return the raw JSON array.
If the user asks a normal question (e.g. "What is React?"), act like an AI bot and answer it in a text block.
If you see code, extract it as a "code" block, simulate its output in the "output" field, and explain it in "aiExample".
If you see regular notes, extract it as a "text" block with markdown.
Format:
[
  { "type": "code", "language": "python", "content": "print('hello')", "output": "hello", "aiExample": "Prints a greeting." },
  { "type": "text", "content": "## Today's Learnings\\nWe learned about printing." }
]`;
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
          { type: "text", text: systemPrompt + "\\n\\nPlease process the information in this image according to the rules above. Extract all text, code, or describe the image." },
          { type: "image_url", image_url: { url: text } }
        ]
      }
    ];
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 0.5,
      max_tokens: 1024
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to fetch from Groq");
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
};
