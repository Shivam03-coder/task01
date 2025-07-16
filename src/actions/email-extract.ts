"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function extractEmailsFromJson(
  data: any,
): Promise<{ emails: string[]; info: string } | string> {
  const jsonString = JSON.stringify(data, null, 2);

  const prompt = `
You are an email extraction and summarization assistant.

Given the following JSON data:

- Extract **all email addresses** you can find *anywhere* in the data.
- Write a **concise summary (approximately 100 words)** describing the overall content of the data.

✅ Your response must be valid **JSON only**, in this exact format:

\`\`\`json
{
  "emails": ["email1@example.com", "email2@example.com"],
  "info": "A concise ~100-word summary of the data here."
}
\`\`\`

⚠️ Strict rules:
- Do NOT include any explanation, markdown, or extra text outside the JSON.
- Only return the JSON object in the exact format shown.

---

Here is the JSON data to analyze:

\`\`\`json
${jsonString}
\`\`\`
`.trim();

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Remove code fences if any
    const cleaned = text
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (
      !parsed ||
      !Array.isArray(parsed.emails) ||
      typeof parsed.info !== "string"
    ) {
      throw new Error("Invalid LLM response shape");
    }

    // Clean emails (deduplicate, normalize)
    const uniqueEmails = Array.from(
      new Set(
        parsed.emails
          .map((e: string) => e.trim().toLowerCase())
          .filter(Boolean),
      ),
    );

    return {
      emails: uniqueEmails as string[],
      info: parsed.info.trim(),
    };
  } catch (error) {
    console.error("Error extracting emails and summary:", error);
    return "Failed to extract emails and summary";
  }
}
