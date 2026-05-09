import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const API_KEY = process.env.VITE_GEMINI_API_KEY || "AIzaSyBb8UW1NK7xBNtOOd93qYaNsCNB9j_PtFE";
const genAI = new GoogleGenerativeAI(API_KEY);

async function testGeneration() {
  try {
    console.log("Testing Gemini Flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const res = await model.generateContent("Hello!");
    console.log("Success with Gemini:", res.response.text());
  } catch (err) {
    console.error("Error with Gemini:", err.message);
  }

  try {
    console.log("\nTesting Gemma...");
    const model2 = genAI.getGenerativeModel({ model: "gemma-4-26b-a4b-it" });
    const res2 = await model2.generateContent("Hello!");
    console.log("Success with Gemma:", res2.response.text());
  } catch (err) {
    console.error("Error with Gemma:", err.message);
  }
}

testGeneration();
