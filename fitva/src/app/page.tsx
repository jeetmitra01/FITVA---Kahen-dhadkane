"use client";
import { Button } from "@/components/ui/button";
import PromptForm from "@/components/PromptForm";
import { useState } from "react";

export default function Home() {
  const [choices, setChoices] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
    <div>
      <main>
        <PromptForm 
        isLoading = {isLoading}
        onSubmit={async (prompt: string) => {
          setIsLoading(true);
          const response = await fetch("/api/chat-gpt", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              prompt: prompt
            })
          }
          )
          setIsLoading(false);
          const result = await response.json();
          console.log(result);
          setChoices(result.choices);
        }} />

        {choices.map((choice: {
          index: number;
          message: { content: string; };
        }) => {
          return (
            <p key={choice.index}>{choice.message.content}</p>
          )
        })
        }
      </main>
    </div>
  );
}
