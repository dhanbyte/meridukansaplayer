"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  niche: z
    .string()
    .min(3, { message: "Your niche should be at least 3 characters." }),
  productInfo: z.string().min(20, {
    message: "Please provide at least 20 characters about your product.",
  }),
});

type Step1DetailsProps = {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  initialData: { niche: string; productInfo: string };
  isLoading: boolean;
};

export default function Step1Details({
  onSubmit,
  initialData,
  isLoading,
}: Step1DetailsProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Tell Us About Your Business</CardTitle>
        <CardDescription>
          Provide some details and our AI will generate content for your
          website.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="niche"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Niche</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Artisan Coffee Roasters" {...field} />
                  </FormControl>
                  <FormDescription>
                    What industry or market are you in?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product Information</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your main product or service. What makes it special?"
                      className="resize-none"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Keep it brief and to the point.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} className="ml-auto">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Generating..." : "Generate Content"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
