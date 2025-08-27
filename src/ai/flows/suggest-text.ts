// src/ai/flows/suggest-text.ts
'use server';
/**
 * @fileOverview A flow to suggest text options for website sections based on niche and product information.
 *
 * - suggestText - A function that generates text suggestions.
 * - SuggestTextInput - The input type for the suggestText function.
 * - SuggestTextOutput - The return type for the suggestText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTextInputSchema = z.object({
  niche: z.string().describe('The business niche of the website.'),
  productInfo: z.string().describe('Short textual content about the product.'),
});
export type SuggestTextInput = z.infer<typeof SuggestTextInputSchema>;

const SuggestTextOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('An array of text suggestions for website sections.'),
});
export type SuggestTextOutput = z.infer<typeof SuggestTextOutputSchema>;

export async function suggestText(input: SuggestTextInput): Promise<SuggestTextOutput> {
  return suggestTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTextPrompt',
  input: {schema: SuggestTextInputSchema},
  output: {schema: SuggestTextOutputSchema},
  prompt: `You are a marketing expert specializing in website content creation.

  Based on the niche and product information provided, generate three different text suggestions for the website's main sections (e.g., headline, about us, features).

  Niche: {{{niche}}}
  Product Information: {{{productInfo}}}

  Output the suggestions in array. For example: [suggestion1, suggestion2, suggestion3].
  `,
});

const suggestTextFlow = ai.defineFlow(
  {
    name: 'suggestTextFlow',
    inputSchema: SuggestTextInputSchema,
    outputSchema: SuggestTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
