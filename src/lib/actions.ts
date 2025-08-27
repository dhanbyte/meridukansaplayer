"use server";

import { rearrangeContent } from "@/ai/flows/rearrange-content";
import { suggestText } from "@/ai/flows/suggest-text";
import { z } from "zod";

const inputSchema = z.object({
  niche: z.string().min(3, "Niche must be at least 3 characters long."),
  productInfo: z
    .string()
    .min(10, "Product info must be at least 10 characters long."),
});

export async function generateInitialContent(input: {
  niche: string;
  productInfo: string;
}) {
  try {
    const validatedInput = inputSchema.safeParse(input);
    if (!validatedInput.success) {
      return { error: validatedInput.error.errors.map((e) => e.message).join(', ') };
    }
    
    const [rearranged, suggestions] = await Promise.all([
      rearrangeContent({
        niche: validatedInput.data.niche,
        textContent: validatedInput.data.productInfo,
      }),
      suggestText({
        niche: validatedInput.data.niche,
        productInfo: validatedInput.data.productInfo,
      }),
    ]);
    
    return {
      rearrangedContent: rearranged.rearrangedContent,
      suggestions: suggestions.suggestions,
    };
  } catch (error) {
    console.error("Error in generateInitialContent:", error);
    return {
      error: "Failed to generate content due to a server error. Please try again.",
    };
  }
}
