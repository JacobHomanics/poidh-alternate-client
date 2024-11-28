import { NextResponse } from "next/server";
import axios from "axios";

//@params - req: Request
export const GET = async (request: Request) => {
  const url = new URL(request.url);
  const prompt = url.searchParams.get("input");

  let response: any;

  try {
    response = await axios.post(
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
  } catch (ex) {
    response = null;
    // error
    console.log(ex);
    return NextResponse.json({ error: (ex as Error).message }, { status: 500 });
  }
  if (response) {
    // success
    const json = response.data.choices[0].message.content;
    console.log(json);
    return NextResponse.json(json, { status: 200 });
  }
};
