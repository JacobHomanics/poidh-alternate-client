"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getChatGPTResponse, getChatGPTResponse2 } from "../services/openaiService";
import type { NextPage } from "next";
import { formatEther, parseEther } from "viem";
import { base, degen, mainnet } from "viem/chains";
import { useAccount } from "wagmi";
import { switchChain } from "wagmi/actions";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Slider } from "~~/components/Slider";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { wagmiConfig } from "~~/services/web3/wagmiConfig";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  const { writeContractAsync: writePoidhAsync } = useScaffoldWriteContract("poidh");

  const [input, setInput] = useState("");
  const [descriptionResponse, setDescriptionResponse] = useState("");
  const [titleResponse, setTitleResponse] = useState("");

  const [isBountyGenerated, setIsBountyGenerated] = useState(false);
  const [isBountyOnchain, setIsBountyOnchain] = useState(false);

  const [isGenerating, setIsGenering] = useState(false);

  const { data: bountyCount, refetch } = useScaffoldReadContract({
    contractName: "poidh",
    functionName: "getBountiesLength",
  });

  const handleSend = async () => {
    setIsGenering(true);
    try {
      const result = await fetch(`/api/openai/route1?input=${input}&difficulty=${difficultyValue}`);
      const chatResponse = await result.json();

      // const chatResponse = getChatGPTResponse(input, difficultyValue);
      setDescriptionResponse(chatResponse);

      try {
        const result2 = await fetch(`/api/openai/route2?input=${input}`);
        const chatResponse2 = await result2.json();
        // const chatResponse2 = await getChatGPTResponse2(chatResponse);
        setTitleResponse(chatResponse2);

        setIsBountyGenerated(true);
      } catch (error) {
        console.error("Error fetching ChatGPT response:", error);
      }
    } catch (error) {
      console.error("Error fetching ChatGPT response:", error);
    }

    setIsGenering(false);
  };

  const [difficultyValue, setDifficultyValue] = useState(2);
  const handleSliderChange = (value: any) => {
    setDifficultyValue(value);
  };

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSelect = async (src: string) => {
    setSelectedImage(src === selectedImage ? null : src); // Toggle selection
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center p-4 bg-base-300 gap-4">
        <p className="text-4xl">Difficulty-Based Bounty Generator</p>

        <div className="flex flex-col justify-center bg-base-100 rounded-lg p-4">
          <div className="w-[400px]">
            <p className="text-center text-2xl">Describe your bounty</p>
            <textarea
              className="w-full p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-primary bg-secondary text-center"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="..."
              rows={1}
            />
          </div>

          <div>
            <div className="flex flex-col items-center justify-center w-full p-4">
              <p className="m-0 text-md">Difficulty Level</p>
              <p className="m-0 text-3xl">{difficultyValue}</p>

              <Slider onValueChange={handleSliderChange} />
            </div>
          </div>

          {isGenerating ? (
            <p className="text-center">Generating...</p>
          ) : (
            <button onClick={handleSend} className="btn btn-primary btn-lg">
              Generate
            </button>
          )}
        </div>

        {isBountyGenerated && (
          <div className="flex flex-col justify-center items-center bg-base-100 rounded-lg p-4">
            <p className="m-0">Bounty</p>
            <input
              type="text"
              value={titleResponse}
              onChange={e => setTitleResponse(e.target.value)}
              placeholder="Type something..."
              className="focus:border-primary bg-secondary w-[400px] rounded-lg border p-4"
            />
            <p className="m-0">Task</p>
            <div className="w-[800px]">
              <textarea
                className="w-full p-4 border rounded-lg shadow-sm focus:outline-none focus:ring-2 resize-none focus:border-primary bg-secondary"
                value={descriptionResponse}
                onChange={e => setDescriptionResponse(e.target.value)}
                placeholder="Type your message here..."
                rows={8}
              />
            </div>

            <p className="m-0 text-xl">Select Chain</p>
            <div className="flex flex-wrap gap-4">
              {[
                { img: "/degen.png", chain: "degen" },
                { img: "/base.png", chain: "base" },
              ].map(src => (
                <div
                  key={src.img}
                  onClick={() => handleSelect(src.chain)}
                  className={`cursor-pointer rounded-lg border-2 p-1 transition ${
                    selectedImage === src.chain
                      ? "border-blue-500 bg-blue-100"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                  }`}
                >
                  <Image src={src.img} alt="Test" width={32} height={32} />
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary btn-lg"
              onClick={async () => {
                if (selectedImage === "base") {
                  await switchChain(wagmiConfig, { chainId: base.id });
                  console.log("Switched");
                } else if (selectedImage === "degen") {
                  await switchChain(wagmiConfig, { chainId: degen.id });
                }

                await writePoidhAsync({
                  functionName: "createSoloBounty",
                  value: parseEther(".0001"),
                  args: [titleResponse, descriptionResponse],
                });

                await refetch();

                setIsBountyOnchain(true);
              }}
            >
              Submit
            </button>

            {isBountyOnchain && (
              <div className="flex flex-col justify-center items-center rounded-lg">
                <p>Access bounty:</p>
                <Link
                  href={`https://poidh.xyz/${selectedImage}/bounty/${(bountyCount || BigInt(0)) - BigInt(1)}`}
                  target="#"
                  className="hover:underline"
                >{`https://poidh.xyz/${selectedImage}/bounty/${(bountyCount || BigInt(0)) - BigInt(1)}`}</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
