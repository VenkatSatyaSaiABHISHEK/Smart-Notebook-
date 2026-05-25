export const processWithGroq = async (text, task = "format") => {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!apiKey) throw new Error("Groq API key not found in environment variables.");

  let systemPrompt = "";
  if (task === "format") {
    systemPrompt = "You are an AI study assistant. The user will provide raw notes, messy text, or random data. Your job is to format and summarize it into clean, readable, professional study notes using markdown. If the text is random characters (like an API key or ID), just explain politely what it appears to be, rather than formatting it as notes. Keep your response concise and directly provide the notes/explanation without filler greetings.";
  } else if (task === "explain_code") {
    systemPrompt = "You are an expert programming instructor. You explain programming concepts in simple, easy-to-understand terms suitable for beginner students, using a warm and friendly teacher tone. The user will provide a code snippet. At the very beginning of your explanation, you MUST output a line specifying the topic of the code, formatted exactly as: 'Topic: [Topic Name]' (e.g., 'Topic: Recursion', 'Topic: Mathematics', 'Topic: Sorting', 'Topic: Dynamic Programming'). Then explain what the code does step-by-step, using simple analogies and short sentences. If the code is recursive or mathematical, trace each recursive or iterative call step-by-step (e.g., showing how the function calls itself with different arguments, then how it returns values back from the base case up to the final result). Format the response using subheadings and you MUST specify the line number or range of lines being executed in the original code for EACH step, formatted exactly as: '### Step X (Line Y): [Title]' or '### Step X (Lines Y-Z): [Title]' (e.g., '### Step 1 (Line 2): Initialize base case'). Trace each step. At the end of each step's explanation, if any variables are created or changed, list their updated values on a new line formatted exactly as: 'State: var1 = val1, var2 = val2' (e.g., 'State: x = 5, y = 10'). For recursive functions, you MUST also output the exact call stack at the end of each step (on its own line, before or after the State line) formatted exactly as: 'Call Stack: func(args1) [status1] -> func(args2) [status2] -> ...' (e.g., 'Call Stack: GCD(24, 36) [Suspended] -> GCD(24, 12) [Active]'). The status should be one of: 'Active', 'Suspended', or 'Base Case' or 'Returning [value]'. If it is not recursive, you can omit the Call Stack line. Every markdown code block you output MUST have a unique random 6-character lowercase alphanumeric id in the opening tag, formatted exactly like: ```[language] id=\"[random_6_char_id]\"```.";
  } else if (task === "extract_blocks") {
    systemPrompt = `You are an AI assistant and JSON data extractor. You act as a friendly programming instructor, explaining complex ideas in simple, clean, student-friendly terms. The user will paste text, ask a question, or provide code.
Your task is to parse everything and return ONLY a valid JSON array of objects. Do NOT use markdown code blocks like \`\`\`json outside the array. Just return the raw JSON array.
If the user asks a normal question (e.g. "What is React?"), act like an AI bot and answer it in a text block.
If you see code, extract it as a "code" block, simulate its output in the "output" field, and explain it in "aiExample".
Inside the "aiExample" field, provide a detailed step-by-step execution trace of the code using simple, conversational, beginner-friendly explanations. At the very beginning of the explanation, you MUST output a line specifying the topic of the code, formatted exactly as: 'Topic: [Topic Name]' (e.g., 'Topic: Recursion', 'Topic: Mathematics'). Format the response using subheadings, and you MUST specify the executing line number or range of lines in the heading of each step, formatted exactly as '### Step X (Line Y): [Title]' or '### Step X (Lines Y-Z): [Title]'. If it is recursive/mathematical, trace each call and return back step-by-step. At the end of each step's explanation, if any variables are created or changed, list their updated values on a new line formatted exactly as: 'State: var1 = val1, var2 = val2' (e.g., 'State: x = 5, y = 10'). For recursive functions, you MUST also output the exact call stack at the end of each step (on its own line, before or after the State line) formatted exactly as: 'Call Stack: func(args1) [status1] -> func(args2) [status2] -> ...' (e.g., 'Call Stack: GCD(24, 36) [Suspended] -> GCD(24, 12) [Active]'). The status should be one of: 'Active', 'Suspended', or 'Base Case' or 'Returning [value]'. If it is not recursive, you can omit the Call Stack line. Every markdown code block in the explanation must have a unique random 6-character lowercase alphanumeric id in the opening tag like: \`\`\`[language] id="[random_6_char_id]"\`\`\`.
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
      max_tokens: 4096
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Failed to fetch from Groq");
  }

  const data = await response.json();
  return {
    text: data.choices[0].message.content.trim(),
    usage: data.usage || { total_tokens: 0, prompt_tokens: 0, completion_tokens: 0 }
  };
};
