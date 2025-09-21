import { InferenceClient } from "@huggingface/inference";
import { writeFile } from "fs";

const inference = new InferenceClient(process.env.AI_ACCESS_TOKEN || "");

// embed the given text
async function embed() {
  const output = await inference.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: "This is a test",
  });
  console.log(output);
}

// translate the given text to hindi
async function translate() {
  const result = await inference.translation({
    model: "Helsinki-NLP/opus-mt-en-hi",
    inputs: "How is the weather in India",
  });
  console.log(result);
}

async function answerQuestion() {
  const result = await inference.questionAnswering({
    model: "deepset/roberta-base-squad2",
    inputs: {
      context: "The quick brown fox jumps over the lazy dog",
      //   question: "What is the color of fox?",
      question: "What is the meaning of life?",
    },
  });

  console.log(result);
}

async function textToImage() {
  const result = await inference.textToImage({
    model: "stabilityai/stable-diffusion-2",
    inputs: "Cat in the hat on a mat",
    parameters: {
      negative_prompt: "blurry",
    },
  });

  const buffer = Buffer.from(result);
  writeFile("image.png", buffer, () => {
    console.log("image saved");
  });
}

(() => {
  try {
    //   embed();
    //   translate();
    //   answerQuestion();
    textToImage();
  } catch (error) {
    console.log("Error:", error);
  }
})();
