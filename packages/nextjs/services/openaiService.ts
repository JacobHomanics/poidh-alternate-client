// src/services/openaiService.ts
import axios from "axios";

export const getChatGPTResponse = async (prompt: string, difficulty: number) => {
  console.log(process.env.OPENAI_API_KEY);

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4", // You can use 'gpt-3.5-turbo' or another model
      messages: [
        { role: "user", content: prompt },
        {
          role: "system",
          content: `You want to create bounty description without a title for the user based on their prompt. The requirements for bounty fulfilment are a picture proving the bounty is complete. Pics or it didn't happen. Please only include the bounty text. This bounty is considered to be as difficult as ${difficulty.toString()} on a 1 out of 10 scale. Where anything from 1-3 is really easy, 4-7 is average. 8-10 is difficult`,
        },
      ],
      max_tokens: 150, // Adjust based on your needs
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    },
  );
  return response.data.choices[0].message.content;
};

export const getChatGPTResponse2 = async (prompt: string) => {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4", // You can use 'gpt-3.5-turbo' or another model
      messages: [
        { role: "user", content: prompt },
        {
          role: "system",
          content:
            "Derive a title from the prompt. Please only include the title text. Please do not add double quotes.",
        },
      ],
      max_tokens: 150, // Adjust based on your needs
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    },
  );
  return response.data.choices[0].message.content;
};
