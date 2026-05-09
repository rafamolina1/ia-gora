import Groq from "groq-sdk";

export function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY ausente.");
  }

  return new Groq({ apiKey });
}
