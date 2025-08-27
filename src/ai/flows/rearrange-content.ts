'use server';

/**
 * @fileOverview A tool that intelligently rearranges user-provided content.
 *
 * - rearrangeContent - A function that rearranges the content.
 * - RearrangeContentInput - The input type for the rearrangeContent function.
 * - RearrangeContentOutput - The return type for the rearrangeContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RearrangeContentInputSchema = z.object({
  niche: z.string().describe('The business niche of the website.'),
  textContent: z.string().describe('The textual content about the product.'),
});
export type RearrangeContentInput = z.infer<typeof RearrangeContentInputSchema>;

const RearrangeContentOutputSchema = z.object({
  rearrangedContent: z.string().describe('The intelligently rearranged content.'),
});
export type RearrangeContentOutput = z.infer<typeof RearrangeContentOutputSchema>;

export async function rearrangeContent(input: RearrangeContentInput): Promise<RearrangeContentOutput> {
  return rearrangeContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rearrangeContentPrompt',
  input: {schema: RearrangeContentInputSchema},
  output: {schema: RearrangeContentOutputSchema},
  prompt: `You are an expert website content strategist. Given the following business niche and textual content, rearrange the content in the most effective order for a website.

Niche: {{{niche}}}
Content: {{{textContent}}}

Rearranged Content:`,
});

const rearrangeContentFlow = ai.defineFlow(
  {
    name: 'rearrangeContentFlow',
    inputSchema: RearrangeContentInputSchema,
    outputSchema: RearrangeContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return {rearrangedContent: output!.rearrangedContent!};
  }
);
