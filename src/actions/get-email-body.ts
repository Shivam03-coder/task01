"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateSalesEmailToAutomobileCompany(
  recipientEmail: string,
  info: string,
): Promise<string> {
  const prompt = `
You are a professional sales copywriting assistant for a Tyre Company.

Your task:

- Write a **personalized, professional, high-quality sales email** to an **Automobile Company** with the given recipient email: **${recipientEmail}**.
- Assume you're a salesperson offering **premium, reliable, and affordable tyres** designed for automobile manufacturers or service centers.
- Use the provided company **info** to tailor the message to their needs, industry, or specialization.
- Mention key selling points (e.g. durability, safety, cost efficiency, quality service).
- Include a clear **call to action** (e.g. suggesting a meeting, call, or partnership discussion).
- Keep it **friendly, professional, and authentic**, around 100–150 words.
- Use **natural greeting** (e.g. "Hi team at [Company]", "Hello", etc.).
- Do **NOT** mention that you're using AI or JSON data.
- Return **ONLY** the email body as plain text. No markdown, JSON, or explanations.
- My company name is "Tyres Company" and my company website is "https://www.tyrescompany.com".
- Best regards, [Your Name] [Your Title] [Your Tyre Company Name] [Your Contact Information]
- My name is "John Doe" and my title is "Sales Manager" and my contact information is "john.doe@tyrescompany.com".

Here is the company info to use for personalization:

${info}
  `.trim();

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean up any code fences or markdown
    const cleaned = text.replace(/```.*\n?/g, "").trim();

    return cleaned;
  } catch (error) {
    console.error("Error generating sales email:", error);
    return "Failed to generate personalized sales email.";
  }
}
