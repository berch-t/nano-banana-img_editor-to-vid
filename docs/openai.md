Developer quickstart
====================

Take your first steps with the OpenAI API.

The OpenAI API provides a simple interface to state-of-the-art AI [models](/docs/models) for text generation, natural language processing, computer vision, and more. This example generates [text output](/docs/guides/text) from a prompt, as you might using ChatGPT.

Generate text from a model

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5",
    input: "Write a one-sentence bedtime story about a unicorn."
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    input="Write a one-sentence bedtime story about a unicorn."
)

print(response.output_text)
```

```bash
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5",
        "input": "Write a one-sentence bedtime story about a unicorn."
    }'
```

[

Configure your development environment

Install and configure an official OpenAI SDK to run the code above.

](/docs/libraries)[

Responses starter app

Start building with the Responses API

](https://github.com/openai/openai-responses-starter-app)[

Text generation and prompting

Learn more about prompting, message roles, and building conversational apps.

](/docs/guides/text)

Analyze images and files
------------------------

Send image URLs, uploaded files, or PDF documents directly to the model to extract text, classify content, or detect visual elements.

Image URL

Analyze the content of an image

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5",
    input: [
        {
            role: "user",
            content: [
                {
                    type: "input_text",
                    text: "What is in this image?",
                },
                {
                    type: "input_image",
                    image_url: "https://openai-documentation.vercel.app/images/cat_and_otter.png",
                },
            ],
        },
    ],
});

console.log(response.output_text);
```

```bash
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5",
        "input": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": "What is in this image?"
                    },
                    {
                        "type": "input_image",
                        "image_url": "https://openai-documentation.vercel.app/images/cat_and_otter.png"
                    }
                ]
            }
        ]
    }'
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": "What teams are playing in this image?",
                },
                {
                    "type": "input_image",
                    "image_url": "https://upload.wikimedia.org/wikipedia/commons/3/3b/LeBron_James_Layup_%28Cleveland_vs_Brooklyn_2018%29.jpg"
                }
            ]
        }
    ]
)

print(response.output_text)
```

File URL

Use a file URL as input

```bash
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5",
        "input": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_text",
                        "text": "Analyze the letter and provide a summary of the key points."
                    },
                    {
                        "type": "input_file",
                        "file_url": "https://www.berkshirehathaway.com/letters/2024ltr.pdf"
                    }
                ]
            }
        ]
    }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5",
    input: [
        {
            role: "user",
            content: [
                {
                    type: "input_text",
                    text: "Analyze the letter and provide a summary of the key points.",
                },
                {
                    type: "input_file",
                    file_url: "https://www.berkshirehathaway.com/letters/2024ltr.pdf",
                },
            ],
        },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_text",
                    "text": "Analyze the letter and provide a summary of the key points.",
                },
                {
                    "type": "input_file",
                    "file_url": "https://www.berkshirehathaway.com/letters/2024ltr.pdf",
                },
            ],
        },
    ]
)

print(response.output_text)
```

Upload file

Upload a file and use it as input

```bash
curl https://api.openai.com/v1/files \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -F purpose="user_data" \
    -F file="@draconomicon.pdf"

curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5",
        "input": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "input_file",
                        "file_id": "file-6F2ksmvXxt4VdoqmHRw6kL"
                    },
                    {
                        "type": "input_text",
                        "text": "What is the first dragon in the book?"
                    }
                ]
            }
        ]
    }'
```

```javascript
import fs from "fs";
import OpenAI from "openai";
const client = new OpenAI();

const file = await client.files.create({
    file: fs.createReadStream("draconomicon.pdf"),
    purpose: "user_data",
});

const response = await client.responses.create({
    model: "gpt-5",
    input: [
        {
            role: "user",
            content: [
                {
                    type: "input_file",
                    file_id: file.id,
                },
                {
                    type: "input_text",
                    text: "What is the first dragon in the book?",
                },
            ],
        },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

file = client.files.create(
    file=open("draconomicon.pdf", "rb"),
    purpose="user_data"
)

response = client.responses.create(
    model="gpt-5",
    input=[
        {
            "role": "user",
            "content": [
                {
                    "type": "input_file",
                    "file_id": file.id,
                },
                {
                    "type": "input_text",
                    "text": "What is the first dragon in the book?",
                },
            ]
        }
    ]
)

print(response.output_text)
```

[

Image inputs guide

Learn to use image inputs to the model and extract meaning from images.

](/docs/guides/images)[

File inputs guide

Learn to use file inputs to the model and extract meaning from documents.

](/docs/guides/pdf-files)

Extend the model with tools
---------------------------

Give the model access to external data and functions by attaching [tools](/docs/guides/tools). Use built-in tools like web search or file search, or define your own for calling APIs, running code, or integrating with third-party systems.

Web search

Use web search in a response

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5",
    tools: [
        { type: "web_search" },
    ],
    input: "What was a positive news story from today?",
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    tools=[{"type": "web_search"}],
    input="What was a positive news story from today?"
)

print(response.output_text)
```

```bash
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5",
        "tools": [{"type": "web_search"}],
        "input": "what was a positive news story from today?"
    }'
```

File search

Search your files in a response

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-4.1",
    input="What is deep research by OpenAI?",
    tools=[{
        "type": "file_search",
        "vector_store_ids": ["<vector_store_id>"]
    }]
)
print(response)
```

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
    model: "gpt-4.1",
    input: "What is deep research by OpenAI?",
    tools: [
        {
            type: "file_search",
            vector_store_ids: ["<vector_store_id>"],
        },
    ],
});
console.log(response);
```

Function calling

Call your own function

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const tools = [
    {
        type: "function",
        name: "get_weather",
        description: "Get current temperature for a given location.",
        parameters: {
            type: "object",
            properties: {
                location: {
                    type: "string",
                    description: "City and country e.g. Bogotá, Colombia",
                },
            },
            required: ["location"],
            additionalProperties: false,
        },
        strict: true,
    },
];

const response = await client.responses.create({
    model: "gpt-5",
    input: [
        { role: "user", content: "What is the weather like in Paris today?" },
    ],
    tools,
});

console.log(response.output[0].to_json());
```

```python
from openai import OpenAI

client = OpenAI()

tools = [
    {
        "type": "function",
        "name": "get_weather",
        "description": "Get current temperature for a given location.",
        "parameters": {
            "type": "object",
            "properties": {
                "location": {
                    "type": "string",
                    "description": "City and country e.g. Bogotá, Colombia",
                }
            },
            "required": ["location"],
            "additionalProperties": False,
        },
        "strict": True,
    },
]

response = client.responses.create(
    model="gpt-5",
    input=[
        {"role": "user", "content": "What is the weather like in Paris today?"},
    ],
    tools=tools,
)

print(response.output[0].to_json())
```

```bash
curl -X POST https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "input": [
      {"role": "user", "content": "What is the weather like in Paris today?"}
    ],
    "tools": [
      {
        "type": "function",
        "name": "get_weather",
        "description": "Get current temperature for a given location.",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "City and country e.g. Bogotá, Colombia"
            }
          },
          "required": ["location"],
          "additionalProperties": false
        },
        "strict": true
      }
    ]
  }'
```

Remote MCP

Call a remote MCP server

```bash
curl https://api.openai.com/v1/responses \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $OPENAI_API_KEY" \
-d '{
  "model": "gpt-5",
    "tools": [
      {
        "type": "mcp",
        "server_label": "dmcp",
        "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
        "server_url": "https://dmcp-server.deno.dev/sse",
        "require_approval": "never"
      }
    ],
    "input": "Roll 2d4+1"
  }'
```

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const resp = await client.responses.create({
  model: "gpt-5",
  tools: [
    {
      type: "mcp",
      server_label: "dmcp",
      server_description: "A Dungeons and Dragons MCP server to assist with dice rolling.",
      server_url: "https://dmcp-server.deno.dev/sse",
      require_approval: "never",
    },
  ],
  input: "Roll 2d4+1",
});

console.log(resp.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

resp = client.responses.create(
    model="gpt-5",
    tools=[
        {
            "type": "mcp",
            "server_label": "dmcp",
            "server_description": "A Dungeons and Dragons MCP server to assist with dice rolling.",
            "server_url": "https://dmcp-server.deno.dev/sse",
            "require_approval": "never",
        },
    ],
    input="Roll 2d4+1",
)

print(resp.output_text)
```

[

Use built-in tools

Learn about powerful built-in tools like web search and file search.

](/docs/guides/tools)[

Function calling guide

Learn to enable the model to call your own custom code.

](/docs/guides/function-calling)

Stream responses and build realtime apps
----------------------------------------

Use server‑sent [streaming events](/docs/guides/streaming-responses) to show results as they’re generated, or the [Realtime API](/docs/guides/realtime) for interactive voice and multimodal apps.

Stream server-sent events from the API

```javascript
import { OpenAI } from "openai";
const client = new OpenAI();

const stream = await client.responses.create({
    model: "gpt-5",
    input: [
        {
            role: "user",
            content: "Say 'double bubble bath' ten times fast.",
        },
    ],
    stream: true,
});

for await (const event of stream) {
    console.log(event);
}
```

```python
from openai import OpenAI
client = OpenAI()

stream = client.responses.create(
    model="gpt-5",
    input=[
        {
            "role": "user",
            "content": "Say 'double bubble bath' ten times fast.",
        },
    ],
    stream=True,
)

for event in stream:
    print(event)
```

[

Use streaming events

Use server-sent events to stream model responses to users fast.

](/docs/guides/streaming-responses)[

Get started with the Realtime API

Use WebRTC or WebSockets for super fast speech-to-speech AI apps.

](/docs/guides/realtime)

Build agents
------------

Use the OpenAI platform to build [agents](/docs/guides/agents) capable of taking action—like [controlling computers](/docs/guides/tools-computer-use)—on behalf of your users. Use the Agents SDK for Python or TypeScript to create orchestration logic on the backend.

Build a language triage agent

```javascript
import { Agent, run } from '@openai/agents';

const spanishAgent = new Agent({
    name: 'Spanish agent',
    instructions: 'You only speak Spanish.',
});

const englishAgent = new Agent({
    name: 'English agent',
    instructions: 'You only speak English',
});

const triageAgent = new Agent({
    name: 'Triage agent',
    instructions:
        'Handoff to the appropriate agent based on the language of the request.',
    handoffs: [spanishAgent, englishAgent],
});

const result = await run(triageAgent, 'Hola, ¿cómo estás?');
console.log(result.finalOutput);
```

```python
from agents import Agent, Runner
import asyncio

spanish_agent = Agent(
    name="Spanish agent",
    instructions="You only speak Spanish.",
)

english_agent = Agent(
    name="English agent",
    instructions="You only speak English",
)

triage_agent = Agent(
    name="Triage agent",
    instructions="Handoff to the appropriate agent based on the language of the request.",
    handoffs=[spanish_agent, english_agent],
)

async def main():
    result = await Runner.run(triage_agent, input="Hola, ¿cómo estás?")
    print(result.final_output)

if __name__ == "__main__":
    asyncio.run(main())
```

[

Build agents that can take action

Learn how to use the OpenAI platform to build powerful, capable AI agents.

](/docs/guides/agents)

Was this page useful?

Text generation
===============

Learn how to prompt a model to generate text.

With the OpenAI API, you can use a [large language model](/docs/models) to generate text from a prompt, as you might using ChatGPT. Models can generate almost any kind of text response—like code, mathematical equations, structured JSON data, or human-like prose.

Here's a simple example using the [Responses API](/docs/api-reference/responses).

Generate text from a simple prompt

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5",
    input: "Write a one-sentence bedtime story about a unicorn."
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    input="Write a one-sentence bedtime story about a unicorn."
)

print(response.output_text)
```

```bash
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5",
        "input": "Write a one-sentence bedtime story about a unicorn."
    }'
```

An array of content generated by the model is in the `output` property of the response. In this simple example, we have just one output which looks like this:

```json
[
    {
        "id": "msg_67b73f697ba4819183a15cc17d011509",
        "type": "message",
        "role": "assistant",
        "content": [
            {
                "type": "output_text",
                "text": "Under the soft glow of the moon, Luna the unicorn danced through fields of twinkling stardust, leaving trails of dreams for every child asleep.",
                "annotations": []
            }
        ]
    }
]
```

**The `output` array often has more than one item in it!** It can contain tool calls, data about reasoning tokens generated by [reasoning models](/docs/guides/reasoning), and other items. It is not safe to assume that the model's text output is present at `output[0].content[0].text`.

Some of our [official SDKs](/docs/libraries) include an `output_text` property on model responses for convenience, which aggregates all text outputs from the model into a single string. This may be useful as a shortcut to access text output from the model.

In addition to plain text, you can also have the model return structured data in JSON format - this feature is called [**Structured Outputs**](/docs/guides/structured-outputs).

Prompt engineering
------------------

**Prompt engineering** is the process of writing effective instructions for a model, such that it consistently generates content that meets your requirements.

Because the content generated from a model is non-deterministic, prompting to get your desired output is a mix of art and science. However, you can apply techniques and best practices to get good results consistently.

Some prompt engineering techniques work with every model, like using message roles. But different models might need to be prompted differently to produce the best results. Even different snapshots of models within the same family could produce different results. So as you build more complex applications, we strongly recommend:

*   Pinning your production applications to specific [model snapshots](/docs/models) (like `gpt-5-2025-08-07` for example) to ensure consistent behavior
*   Building [evals](/docs/guides/evals) that measure the behavior of your prompts so you can monitor prompt performance as you iterate, or when you change and upgrade model versions

Now, let's examine some tools and techniques available to you to construct prompts.

Message roles and instruction following
---------------------------------------

You can provide instructions to the model with differing levels of authority using the `instructions` API parameter along with **message roles**.

The `instructions` parameter gives the model high-level instructions on how it should behave while generating a response, including tone, goals, and examples of correct responses. Any instructions provided this way will take priority over a prompt in the `input` parameter.

Generate text with instructions

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5",
    reasoning: { effort: "low" },
    instructions: "Talk like a pirate.",
    input: "Are semicolons optional in JavaScript?",
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    reasoning={"effort": "low"},
    instructions="Talk like a pirate.",
    input="Are semicolons optional in JavaScript?",
)

print(response.output_text)
```

```bash
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5",
        "reasoning": {"effort": "low"},
        "instructions": "Talk like a pirate.",
        "input": "Are semicolons optional in JavaScript?"
    }'
```

The example above is roughly equivalent to using the following input messages in the `input` array:

Generate text with messages using different roles

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5",
    reasoning: { effort: "low" },
    input: [
        {
            role: "developer",
            content: "Talk like a pirate."
        },
        {
            role: "user",
            content: "Are semicolons optional in JavaScript?",
        },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    reasoning={"effort": "low"},
    input=[
        {
            "role": "developer",
            "content": "Talk like a pirate."
        },
        {
            "role": "user",
            "content": "Are semicolons optional in JavaScript?"
        }
    ]
)

print(response.output_text)
```

```bash
curl "https://api.openai.com/v1/responses" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-5",
        "reasoning": {"effort": "low"},
        "input": [
            {
                "role": "developer",
                "content": "Talk like a pirate."
            },
            {
                "role": "user",
                "content": "Are semicolons optional in JavaScript?"
            }
        ]
    }'
```

Note that the `instructions` parameter only applies to the current response generation request. If you are [managing conversation state](/docs/guides/conversation-state) with the `previous_response_id` parameter, the `instructions` used on previous turns will not be present in the context.

The OpenAI model spec describes how our models give different levels of priority to messages with different roles.

|developer|user|assistant|
|---|---|---|
|developer messages are instructions provided by the application developer, prioritized ahead of user messages.|user messages are instructions provided by an end user, prioritized behind developer messages.|Messages generated by the model have the assistant role.|

A multi-turn conversation may consist of several messages of these types, along with other content types provided by both you and the model. Learn more about [managing conversation state here](/docs/guides/conversation-state).

You could think about `developer` and `user` messages like a function and its arguments in a programming language.

*   `developer` messages provide the system's rules and business logic, like a function definition.
*   `user` messages provide inputs and configuration to which the `developer` message instructions are applied, like arguments to a function.

Reusable prompts
----------------

In the OpenAI dashboard, you can develop reusable [prompts](/chat/edit) that you can use in API requests, rather than specifying the content of prompts in code. This way, you can more easily build and evaluate your prompts, and deploy improved versions of your prompts without changing your integration code.

Here's how it works:

1.  **Create a reusable prompt** in the [dashboard](/chat/edit) with placeholders like `{{customer_name}}`.
2.  **Use the prompt** in your API request with the `prompt` parameter. The prompt parameter object has three properties you can configure:
    *   `id` — Unique identifier of your prompt, found in the dashboard
    *   `version` — A specific version of your prompt (defaults to the "current" version as specified in the dashboard)
    *   `variables` — A map of values to substitute in for variables in your prompt. The substitution values can either be strings, or other Response input message types like `input_image` or `input_file`. [See the full API reference](/docs/api-reference/responses/create).

String variables

Generate text with a prompt template

```javascript
import OpenAI from "openai";
const client = new OpenAI();

const response = await client.responses.create({
    model: "gpt-5",
    prompt: {
        id: "pmpt_abc123",
        version: "2",
        variables: {
            customer_name: "Jane Doe",
            product: "40oz juice box"
        }
    }
});

console.log(response.output_text);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    prompt={
        "id": "pmpt_abc123",
        "version": "2",
        "variables": {
            "customer_name": "Jane Doe",
            "product": "40oz juice box"
        }
    }
)

print(response.output_text)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5",
    "prompt": {
      "id": "pmpt_abc123",
      "version": "2",
      "variables": {
        "customer_name": "Jane Doe",
        "product": "40oz juice box"
      }
    }
  }'
```

Variables with file input

Prompt template with file input variable

```javascript
import fs from "fs";
import OpenAI from "openai";
const client = new OpenAI();

// Upload a PDF we will reference in the prompt variables
const file = await client.files.create({
    file: fs.createReadStream("draconomicon.pdf"),
    purpose: "user_data",
});

const response = await client.responses.create({
    model: "gpt-5",
    prompt: {
        id: "pmpt_abc123",
        variables: {
            topic: "Dragons",
            reference_pdf: {
                type: "input_file",
                file_id: file.id,
            },
        },
    },
});

console.log(response.output_text);
```

```python
import openai, pathlib

client = openai.OpenAI()

# Upload a PDF we will reference in the variables
file = client.files.create(
    file=open("draconomicon.pdf", "rb"),
    purpose="user_data",
)

response = client.responses.create(
    model="gpt-5",
    prompt={
        "id": "pmpt_abc123",
        "variables": {
            "topic": "Dragons",
            "reference_pdf": {
                "type": "input_file",
                "file_id": file.id,
            },
        },
    },
)

print(response.output_text)
```

```bash
# Assume you have already uploaded the PDF and obtained FILE_ID
curl https://api.openai.com/v1/responses   -H "Authorization: Bearer $OPENAI_API_KEY"   -H "Content-Type: application/json"   -d '{
    "model": "gpt-5",
    "prompt": {
      "id": "pmpt_abc123",
      "variables": {
        "topic": "Dragons",
        "reference_pdf": {
          "type": "input_file",
          "file_id": "file-abc123"
        }
      }
    }
  }'
```

Next steps
----------

Now that you known the basics of text inputs and outputs, you might want to check out one of these resources next.

[

Build a prompt in the Playground

Use the Playground to develop and iterate on prompts.

](/chat/edit)[

Generate JSON data with Structured Outputs

Ensure JSON data emitted from a model conforms to a JSON schema.

](/docs/guides/structured-outputs)[

Full API reference

Check out all the options for text generation in the API reference.

](/docs/api-reference/responses)

Was this page useful?

Reasoning models
================

Explore advanced reasoning and problem-solving models.

**Reasoning models** like [GPT-5](/docs/models/gpt-5) are LLMs trained with reinforcement learning to perform reasoning. Reasoning models think before they answer, producing a long internal chain of thought before responding to the user. Reasoning models excel in complex problem solving, coding, scientific reasoning, and multi-step planning for agentic workflows. They're also the best models for Codex CLI, our lightweight coding agent.

We provide smaller, faster models (`gpt-5-mini` and `gpt-5-nano`) that are less expensive per token. The larger model (`gpt-5`) is slower and more expensive but often generates better responses for complex tasks and broad domains.

Get started with reasoning
--------------------------

Reasoning models can be used through the [Responses API](/docs/api-reference/responses/create) as seen here.

Using a reasoning model in the Responses API

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const prompt = `
Write a bash script that takes a matrix represented as a string with 
format '[1,2],[3,4],[5,6]' and prints the transpose in the same format.
`;

const response = await openai.responses.create({
    model: "gpt-5",
    reasoning: { effort: "medium" },
    input: [
        {
            role: "user",
            content: prompt,
        },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

prompt = """
Write a bash script that takes a matrix represented as a string with 
format '[1,2],[3,4],[5,6]' and prints the transpose in the same format.
"""

response = client.responses.create(
    model="gpt-5",
    reasoning={"effort": "medium"},
    input=[
        {
            "role": "user", 
            "content": prompt
        }
    ]
)

print(response.output_text)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5",
    "reasoning": {"effort": "medium"},
    "input": [
      {
        "role": "user",
        "content": "Write a bash script that takes a matrix represented as a string with format \"[1,2],[3,4],[5,6]\" and prints the transpose in the same format."
      }
    ]
  }'
```

In the example above, the `reasoning.effort` parameter guides the model on how many reasoning tokens to generate before creating a response to the prompt.

Specify `low`, `medium`, or `high` for this parameter, where `low` favors speed and economical token usage, and `high` favors more complete reasoning. The default value is `medium`, which is a balance between speed and reasoning accuracy.

How reasoning works
-------------------

Reasoning models introduce **reasoning tokens** in addition to input and output tokens. The models use these reasoning tokens to "think," breaking down the prompt and considering multiple approaches to generating a response. After generating reasoning tokens, the model produces an answer as visible completion tokens and discards the reasoning tokens from its context.

Here is an example of a multi-step conversation between a user and an assistant. Input and output tokens from each step are carried over, while reasoning tokens are discarded.

![Reasoning tokens aren't retained in context](https://cdn.openai.com/API/docs/images/context-window.png)

While reasoning tokens are not visible via the API, they still occupy space in the model's context window and are billed as output tokens.

### Managing the context window

It's important to ensure there's enough space in the context window for reasoning tokens when creating responses. Depending on the problem's complexity, the models may generate anywhere from a few hundred to tens of thousands of reasoning tokens. The exact number of reasoning tokens used is visible in the [usage object of the response object](/docs/api-reference/responses/object), under `output_tokens_details`:

```json
{
    "usage": {
        "input_tokens": 75,
        "input_tokens_details": {
            "cached_tokens": 0
        },
        "output_tokens": 1186,
        "output_tokens_details": {
            "reasoning_tokens": 1024
        },
        "total_tokens": 1261
    }
}
```

Context window lengths are found on the [model reference page](/docs/models), and will differ across model snapshots.

### Controlling costs

If you're managing context manually across model turns, you can discard older reasoning items _unless_ you're responding to a function call, in which case you must include all reasoning items between the function call and the last user message.

To manage costs with reasoning models, you can limit the total number of tokens the model generates (including both reasoning and final output tokens) by using the [`max_output_tokens`](/docs/api-reference/responses/create#responses-create-max_output_tokens) parameter.

### Allocating space for reasoning

If the generated tokens reach the context window limit or the `max_output_tokens` value you've set, you'll receive a response with a `status` of `incomplete` and `incomplete_details` with `reason` set to `max_output_tokens`. This might occur before any visible output tokens are produced, meaning you could incur costs for input and reasoning tokens without receiving a visible response.

To prevent this, ensure there's sufficient space in the context window or adjust the `max_output_tokens` value to a higher number. OpenAI recommends reserving at least 25,000 tokens for reasoning and outputs when you start experimenting with these models. As you become familiar with the number of reasoning tokens your prompts require, you can adjust this buffer accordingly.

Handling incomplete responses

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const prompt = `
Write a bash script that takes a matrix represented as a string with 
format '[1,2],[3,4],[5,6]' and prints the transpose in the same format.
`;

const response = await openai.responses.create({
    model: "gpt-5",
    reasoning: { effort: "medium" },
    input: [
        {
            role: "user",
            content: prompt,
        },
    ],
    max_output_tokens: 300,
});

if (
    response.status === "incomplete" &&
    response.incomplete_details.reason === "max_output_tokens"
) {
    console.log("Ran out of tokens");
    if (response.output_text?.length > 0) {
        console.log("Partial output:", response.output_text);
    } else {
        console.log("Ran out of tokens during reasoning");
    }
}
```

```python
from openai import OpenAI

client = OpenAI()

prompt = """
Write a bash script that takes a matrix represented as a string with 
format '[1,2],[3,4],[5,6]' and prints the transpose in the same format.
"""

response = client.responses.create(
    model="gpt-5",
    reasoning={"effort": "medium"},
    input=[
        {
            "role": "user", 
            "content": prompt
        }
    ],
    max_output_tokens=300,
)

if response.status == "incomplete" and response.incomplete_details.reason == "max_output_tokens":
    print("Ran out of tokens")
    if response.output_text:
        print("Partial output:", response.output_text)
    else: 
        print("Ran out of tokens during reasoning")
```

### Keeping reasoning items in context

When doing [function calling](/docs/guides/function-calling) with a reasoning model in the [Responses API](/docs/apit-reference/responses), we highly recommend you pass back any reasoning items returned with the last function call (in addition to the output of your function). If the model calls multiple functions consecutively, you should pass back all reasoning items, function call items, and function call output items, since the last `user` message. This allows the model to continue its reasoning process to produce better results in the most token-efficient manner.

The simplest way to do this is to pass in all reasoning items from a previous response into the next one. Our systems will smartly ignore any reasoning items that aren't relevant to your functions, and only retain those in context that are relevant. You can pass reasoning items from previous responses either using the `previous_response_id` parameter, or by manually passing in all the [output](/docs/api-reference/responses/object#responses/object-output) items from a past response into the [input](/docs/api-reference/responses/create#responses-create-input) of a new one.

For advanced use cases where you might be truncating and optimizing parts of the context window before passing them on to the next response, just ensure all items between the last user message and your function call output are passed into the next response untouched. This will ensure that the model has all the context it needs.

Check out [this guide](/docs/guides/conversation-state) to learn more about manual context management.

### Encrypted reasoning items

When using the Responses API in a stateless mode (either with `store` set to `false`, or when an organization is enrolled in zero data retention), you must still retain reasoning items across conversation turns using the techniques described above. But in order to have reasoning items that can be sent with subsequent API requests, each of your API requests must have `reasoning.encrypted_content` in the `include` parameter of API requests, like so:

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "o4-mini",
    "reasoning": {"effort": "medium"},
    "input": "What is the weather like today?",
    "tools": [ ... function config here ... ],
    "include": [ "reasoning.encrypted_content" ]
  }'
```

Any reasoning items in the `output` array will now have an `encrypted_content` property, which will contain encrypted reasoning tokens that can be passed along with future conversation turns.

Reasoning summaries
-------------------

While we don't expose the raw reasoning tokens emitted by the model, you can view a summary of the model's reasoning using the the `summary` parameter. See our [model documentation](/docs/models) to check which reasoning models support summaries.

Different models support different reasoning summary settings. For example, our computer use model supports the `concise` summarizer, while o4-mini supports `detailed`. To access the most detailed summarizer available for a model, set the value of this parameter to `auto`. `auto` will be equivalent to `detailed` for most reasoning models today, but there may be more granular settings in the future.

Reasoning summary output is part of the `summary` array in the `reasoning` [output item](/docs/api-reference/responses/object#responses/object-output). This output will not be included unless you explicitly opt in to including reasoning summaries.

The example below shows how to make an API request that includes a reasoning summary.

Include a reasoning summary with the API response

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const response = await openai.responses.create({
  model: "gpt-5",
  input: "What is the capital of France?",
  reasoning: {
    effort: "low",
    summary: "auto",
  },
});

console.log(response.output);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.responses.create(
    model="gpt-5",
    input="What is the capital of France?",
    reasoning={
        "effort": "low",
        "summary": "auto"
    }
)

print(response.output)
```

```bash
curl https://api.openai.com/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-5",
    "input": "What is the capital of France?",
    "reasoning": {
        "effort": "low",
        "summary": "auto"
    }
  }'
```

This API request will return an output array with both an assistant message and a summary of the model's reasoning in generating that response.

```json
[
    {
        "id": "rs_6876cf02e0bc8192b74af0fb64b715ff06fa2fcced15a5ac",
        "type": "reasoning",
        "summary": [
            {
                "type": "summary_text",
                "text": "**Answering a simple question**\n\nI\u2019m looking at a straightforward question: the capital of France is Paris. It\u2019s a well-known fact, and I want to keep it brief and to the point. Paris is known for its history, art, and culture, so it might be nice to add just a hint of that charm. But mostly, I\u2019ll aim to focus on delivering a clear and direct answer, ensuring the user gets what they\u2019re looking for without any extra fluff."
            }
        ]
    },
    {
        "id": "msg_6876cf054f58819284ecc1058131305506fa2fcced15a5ac",
        "type": "message",
        "status": "completed",
        "content": [
            {
                "type": "output_text",
                "annotations": [],
                "logprobs": [],
                "text": "The capital of France is Paris."
            }
        ],
        "role": "assistant"
    }
]
```

Before using summarizers with our latest reasoning models, you may need to complete organization verification to ensure safe deployment. Get started with verification on the platform settings page.

Advice on prompting
-------------------

There are some differences to consider when prompting a reasoning model. Reasoning models provide better results on tasks with only high-level guidance, while GPT models often benefit from very precise instructions.

*   A reasoning model is like a senior co-worker—you can give them a goal to achieve and trust them to work out the details.
*   A GPT model is like a junior coworker—they'll perform best with explicit instructions to create a specific output.

For more information on best practices when using reasoning models, [refer to this guide](/docs/guides/reasoning-best-practices).

### Prompt examples

Coding (refactoring)

OpenAI o-series models are able to implement complex algorithms and produce code. This prompt asks o1 to refactor a React component based on some specific criteria.

Refactor code

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const prompt = `
Instructions:
- Given the React component below, change it so that nonfiction books have red
  text. 
- Return only the code in your reply
- Do not include any additional formatting, such as markdown code blocks
- For formatting, use four space tabs, and do not allow any lines of code to 
  exceed 80 columns

const books = [
  { title: 'Dune', category: 'fiction', id: 1 },
  { title: 'Frankenstein', category: 'fiction', id: 2 },
  { title: 'Moneyball', category: 'nonfiction', id: 3 },
];

export default function BookList() {
  const listItems = books.map(book =>
    <li>
      {book.title}
    </li>
  );

  return (
    <ul>{listItems}</ul>
  );
}
`.trim();

const response = await openai.responses.create({
    model: "gpt-5",
    input: [
        {
            role: "user",
            content: prompt,
        },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

prompt = """
Instructions:
- Given the React component below, change it so that nonfiction books have red
  text. 
- Return only the code in your reply
- Do not include any additional formatting, such as markdown code blocks
- For formatting, use four space tabs, and do not allow any lines of code to 
  exceed 80 columns

const books = [
  { title: 'Dune', category: 'fiction', id: 1 },
  { title: 'Frankenstein', category: 'fiction', id: 2 },
  { title: 'Moneyball', category: 'nonfiction', id: 3 },
];

export default function BookList() {
  const listItems = books.map(book =>
    <li>
      {book.title}
    </li>
  );

  return (
    <ul>{listItems}</ul>
  );
}
"""

response = client.responses.create(
    model="gpt-5",
    input=[
        {
            "role": "user",
            "content": prompt,
        }
    ]
)

print(response.output_text)
```

Coding (planning)

OpenAI o-series models are also adept in creating multi-step plans. This example prompt asks o1 to create a filesystem structure for a full solution, along with Python code that implements the desired use case.

Plan and create a Python project

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const prompt = `
I want to build a Python app that takes user questions and looks 
them up in a database where they are mapped to answers. If there 
is close match, it retrieves the matched answer. If there isn't, 
it asks the user to provide an answer and stores the 
question/answer pair in the database. Make a plan for the directory 
structure you'll need, then return each file in full. Only supply 
your reasoning at the beginning and end, not throughout the code.
`.trim();

const response = await openai.responses.create({
    model: "gpt-5",
    input: [
        {
            role: "user",
            content: prompt,
        },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

prompt = """
I want to build a Python app that takes user questions and looks 
them up in a database where they are mapped to answers. If there 
is close match, it retrieves the matched answer. If there isn't, 
it asks the user to provide an answer and stores the 
question/answer pair in the database. Make a plan for the directory 
structure you'll need, then return each file in full. Only supply 
your reasoning at the beginning and end, not throughout the code.
"""

response = client.responses.create(
    model="gpt-5",
    input=[
        {
            "role": "user",
            "content": prompt,
        }
    ]
)

print(response.output_text)
```

STEM Research

OpenAI o-series models have shown excellent performance in STEM research. Prompts asking for support of basic research tasks should show strong results.

Ask questions related to basic scientific research

```javascript
import OpenAI from "openai";

const openai = new OpenAI();

const prompt = `
What are three compounds we should consider investigating to 
advance research into new antibiotics? Why should we consider 
them?
`;

const response = await openai.responses.create({
    model: "gpt-5",
    input: [
        {
            role: "user",
            content: prompt,
        },
    ],
});

console.log(response.output_text);
```

```python
from openai import OpenAI

client = OpenAI()

prompt = """
What are three compounds we should consider investigating to 
advance research into new antibiotics? Why should we consider 
them?
"""

response = client.responses.create(
    model="gpt-5",
    input=[
        {
            "role": "user", 
            "content": prompt
        }
    ]
)

print(response.output_text)
```

Use case examples
-----------------

Some examples of using reasoning models for real-world use cases can be found in the cookbook.

[

Using reasoning for data validation

Evaluate a synthetic medical data set for discrepancies.

](https://cookbook.openai.com/examples/o1/using_reasoning_for_data_validation)[

Using reasoning for routine generation

Use help center articles to generate actions that an agent could perform.

](https://cookbook.openai.com/examples/o1/using_reasoning_for_routine_generation)

Was this page useful?