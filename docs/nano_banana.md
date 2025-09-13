# Nano Banana

> Google's state-of-the-art image generation and editing model


## Overview

- **Endpoint**: `https://fal.run/fal-ai/nano-banana/edit`
- **Model ID**: `fal-ai/nano-banana/edit`
- **Category**: image-to-image
- **Kind**: inference
**Tags**: image-editing



## API Information

This model can be used via our HTTP API or more conveniently via our client libraries.
See the input and output schema below, as well as the usage examples.


### Input Schema

The API accepts the following input parameters:


- **`prompt`** (`string`, _required_):
  The prompt for image editing.
  - Examples: "make a photo of the man driving the car down the california coastline"

- **`image_urls`** (`list<string>`, _required_):
  List of URLs of input images for editing.
  - Array of string
  - Examples: ["https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png","https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input-2.png"]

- **`num_images`** (`integer`, _optional_):
  Number of images to generate Default value: `1`
  - Default: `1`
  - Range: `1` to `4`
  - Examples: 1



**Required Parameters Example**:

```json
{
  "prompt": "make a photo of the man driving the car down the california coastline",
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png",
    "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input-2.png"
  ]
}
```

**Full Example**:

```json
{
  "prompt": "make a photo of the man driving the car down the california coastline",
  "image_urls": [
    "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png",
    "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input-2.png"
  ],
  "num_images": 1
}
```


### Output Schema

The API returns the following output format:

- **`images`** (`list<Image>`, _required_):
  The edited images
  - Array of Image
  - Examples: [{"url":"https://storage.googleapis.com/falserverless/example_outputs/nano-banana-multi-edit-output.png"}]

- **`description`** (`string`, _required_):
  Text description or response from Gemini
  - Examples: "Here is a photo of the man driving the car down the California coastline. "



**Example Response**:

```json
{
  "images": [
    {
      "url": "https://storage.googleapis.com/falserverless/example_outputs/nano-banana-multi-edit-output.png"
    }
  ],
  "description": "Here is a photo of the man driving the car down the California coastline. "
}
```


## Usage Examples

### cURL

```bash
curl --request POST \
  --url https://fal.run/fal-ai/nano-banana/edit \
  --header "Authorization: Key $FAL_KEY" \
  --header "Content-Type: application/json" \
  --data '{
     "prompt": "make a photo of the man driving the car down the california coastline",
     "image_urls": [
       "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png",
       "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input-2.png"
     ]
   }'
```

### Python

Ensure you have the Python client installed:

```bash
pip install fal-client
```

Then use the API client to make requests:

```python
import fal_client

def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
           print(log["message"])

result = fal_client.subscribe(
    "fal-ai/nano-banana/edit",
    arguments={
        "prompt": "make a photo of the man driving the car down the california coastline",
        "image_urls": ["https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png", "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input-2.png"]
    },
    with_logs=True,
    on_queue_update=on_queue_update,
)
print(result)
```

### JavaScript

Ensure you have the JavaScript client installed:

```bash
npm install --save @fal-ai/client
```

Then use the API client to make requests:

```javascript
import { fal } from "@fal-ai/client";

const result = await fal.subscribe("fal-ai/nano-banana/edit", {
  input: {
    prompt: "make a photo of the man driving the car down the california coastline",
    image_urls: ["https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input.png", "https://storage.googleapis.com/falserverless/example_inputs/nano-banana-edit-input-2.png"]
  },
  logs: true,
  onQueueUpdate: (update) => {
    if (update.status === "IN_PROGRESS") {
      update.logs.map((log) => log.message).forEach(console.log);
    }
  },
});
console.log(result.data);
console.log(result.requestId);
```


## Additional Resources

### Documentation

- [Model Playground](https://fal.ai/models/fal-ai/nano-banana/edit)
- [API Documentation](https://fal.ai/models/fal-ai/nano-banana/edit/api)
- [OpenAPI Schema](https://fal.ai/api/openapi/queue/openapi.json?endpoint_id=fal-ai/nano-banana/edit)

### fal.ai Platform

- [Platform Documentation](https://docs.fal.ai)
- [Python Client](https://docs.fal.ai/clients/python)
- [JavaScript Client](https://docs.fal.ai/clients/javascript)