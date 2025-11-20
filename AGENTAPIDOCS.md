Pollinations.AI API

Download OpenAPI Document

Download OpenAPI Document
Documentation for enter.pollinations.ai.

📝 Edit docs

Quick Start
Get your API key at https://enter.pollinations.ai

Image Generation
curl 'https://enter.pollinations.ai/api/generate/image/a%20cat?model=flux' \
  -H 'Authorization: Bearer YOUR_API_KEY'
Text Generation
curl 'https://enter.pollinations.ai/api/generate/v1/chat/completions' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"model": "openai", "messages": [{"role": "user", "content": "Hello"}]}'
Simple Text Endpoint
curl 'https://enter.pollinations.ai/api/generate/text/hello?key=YOUR_API_KEY'
Streaming
curl 'https://enter.pollinations.ai/api/generate/v1/chat/completions' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"model": "openai", "messages": [{"role": "user", "content": "Write a poem"}], "stream": true}' \
  --no-buffer
Model Discovery
Always check available models before testing:

Image models: /api/generate/image/models
Text models: /api/generate/v1/models
Authentication
Two key types:

Publishable Keys (pk_): Client-side safe, IP rate-limited (3 req/burst, 1/15sec refill)
Secret Keys (sk_): Server-side only, no rate limits, can spend Pollen
Auth methods:

Header: Authorization: Bearer YOUR_API_KEY
Query param: ?key=YOUR_API_KEY
Server
Server:
https://enter.pollinations.ai/api

Authentication
Required
Selected Auth Type:bearerAuth
API key from enter.pollinations.ai dashboard
Bearer Token
:
Token
Show Password
Client Libraries
JavaScript Fetch
Text Generation ​Copy link
Text GenerationOperations
get
/generate/v1/models
get
/generate/text/models
post
/generate/v1/chat/completions
get
/generate/text/{prompt}
/generate/v1/models​Copy link
Get available text models (OpenAI-compatible).

Responses

200
Success

500
Oh snap, something went wrong on our end. We're on it!
Request Example forget/generate/v1/models
JavaScript Fetch

fetch('https://enter.pollinations.ai/api/generate/v1/models', {
  headers: {
    Authorization: 'Bearer YOUR_SECRET_TOKEN'
  }
})

Test Request
(get /generate/v1/models)
Status:200
Status:500

[
  {
    "name": "string",
    "description": "string",
    "tier": "anonymous",
    "community": true,
    "aliases": [
      "string"
    ],
    "input_modalities": [
      "text"
    ],
    "output_modalities": [
      "text"
    ],
    "tools": true,
    "vision": true,
    "audio": true,
    "maxInputChars": 1,
    "reasoning": true,
    "voices": [
      "string"
    ],
    "uncensored": true,
    "supportsSystemMessages": true
  }
]
Success

/generate/text/models​Copy link
Get a list of available text generation models with pricing, capabilities, and metadata. Use this endpoint to discover which models are available and their costs before making generation requests. Response includes aliases (alternative names you can use), token pricing, supported modalities (text, image, audio), and capabilities (tools, reasoning).

Responses

200
Success

500
Oh snap, something went wrong on our end. We're on it!
Request Example forget/generate/text/models
JavaScript Fetch

fetch('https://enter.pollinations.ai/api/generate/text/models', {
  headers: {
    Authorization: 'Bearer YOUR_SECRET_TOKEN'
  }
})

Test Request
(get /generate/text/models)
Status:200
Status:500

[
  {
    "name": "string",
    "aliases": [
      "string"
    ],
    "pricing": {
      "input_token_price": 1,
      "output_token_price": 1,
      "cached_token_price": 1,
      "image_price": 1,
      "audio_input_price": 1,
      "audio_output_price": 1,
      "currency": "USD"
    },
    "description": "string",
    "input_modalities": [
      "string"
    ],
    "output_modalities": [
      "string"
    ],
    "tools": true,
    "reasoning": true,
    "context_window": 1,
    "voices": [
      "string"
    ],
    "isSpecialized": true
  }
]
Success

/generate/v1/chat/completions​Copy link
OpenAI-compatible chat completions endpoint.

Legacy endpoint: /openai (deprecated, use /v1/chat/completions instead)

Authentication (Secret Keys Only):

Include your API key in the Authorization header as a Bearer token:

Authorization: Bearer YOUR_API_KEY

API keys can be created from your dashboard at enter.pollinations.ai. Secret keys provide the best rate limits and can spend Pollen.

Body
application/json
messagesCopy link to messages
Type:array object[]
required
Show Child Attributesfor messages
audioCopy link to audio
Type:object
Show Child Attributesfor audio
frequency_penaltyCopy link to frequency_penalty
Type:number
min:  
-2
max:  
2
default: 
0
nullable
function_callCopy link to function_call

Any of
string
Type:string
enum
none
auto
functionsCopy link to functions
Type:array object[]
1…128
Show Child Attributesfor functions
logit_biasCopy link to logit_bias
Type:object
default: 
null
nullable
Show Child Attributesfor logit_bias
logprobsCopy link to logprobs
Type:boolean
default: 
false
nullable
max_tokensCopy link to max_tokens
Type:integer
min:  
0
max:  
9007199254740991
nullable
Integer numbers.

modalitiesCopy link to modalities
Type:array string[]
enum
text
audio
modelCopy link to model
Type:string
default: 
"openai"
nCopy link to n
Type:integer
min:  
1
max:  
128
default: 
1
nullable
Integer numbers.

parallel_tool_callsCopy link to parallel_tool_calls
Type:boolean
default: 
true
Show additional propertiesfor Request Body
Responses

200
Success

400
Something was wrong with the input data, check the details for more info.

401
You need to authenticate by providing a session cookie or Authorization header (Bearer token).

500
Oh snap, something went wrong on our end. We're on it!
Request Example forpost/generate/v1/chat/completions
JavaScript Fetch

fetch('https://enter.pollinations.ai/api/generate/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer YOUR_SECRET_TOKEN'
  },
  body: JSON.stringify({
    messages: [
      {
        content: '',
        role: 'system',
        name: ''
      }
    ],
    model: 'openai',
    modalities: ['text'],
    audio: {
      voice: 'alloy',
      format: 'wav'
    },
    frequency_penalty: 0,
    logit_bias: null,
    logprobs: false,
    top_logprobs: 0,
    max_tokens: 0,
    n: 1,
    presence_penalty: 0,
    response_format: {
      type: 'text'
    },
    seed: 0,
    stop: '',
    stream: false,
    stream_options: {
      include_usage: true
    },
    thinking: {
      type: 'disabled',
      budget_tokens: 1
    },
    reasoning_effort: 'low',
    thinking_budget: 0,
    temperature: 1,
    top_p: 1,
    tools: [
      {
        type: 'function',
        function: {
          description: '',
          name: '',
          parameters: {
            propertyName*: 'anything'
          },
          strict: false
        }
      }
    ],
    tool_choice: 'none',
    parallel_tool_calls: true,
    user: '',
    function_call: 'none',
    functions: [
      {
        description: '',
        name: '',
        parameters: {
          propertyName*: 'anything'
        }
      }
    ]
  })
})

Test Request
(post /generate/v1/chat/completions)
Status:200
Status:400
Status:401
Status:500

{
  "id": "string",
  "choices": [
    {
      "finish_reason": "stop",
      "index": 0,
      "message": {
        "content": "string",
        "tool_calls": [
          {
            "id": "string",
            "type": "function",
            "function": {
              "name": "string",
              "arguments": "string"
            }
          }
        ],
        "role": "assistant",
        "function_call": {
          "arguments": "string",
          "name": "string"
        },
        "content_blocks": [
          {
            "type": "text",
            "text": "string"
          }
        ],
        "audio": {
          "transcript": "string",
          "data": "string",
          "id": "string",
          "expires_at": -9007199254740991
        },
        "reasoning_content": "string"
      },
      "logprobs": {
        "content": [
          {
            "token": "string",
            "logprob": 1,
            "bytes": [
              "[Max Depth Exceeded]"
            ],
            "top_logprobs": [
              {
                "token": "[Max Depth Exceeded]",
                "logprob": "[Max Depth Exceeded]",
                "bytes": "[Max Depth Exceeded]"
              }
            ]
          }
        ]
      },
      "content_filter_results": {
        "hate": {
          "filtered": true,
          "severity": "safe"
        },
        "self_harm": {
          "filtered": true,
          "severity": "safe"
        },
        "sexual": {
          "filtered": true,
          "severity": "safe"
        },
        "violence": {
          "filtered": true,
          "severity": "safe"
        },
        "jailbreak": {
          "filtered": true,
          "detected": true
        },
        "protected_material_text": {
          "filtered": true,
          "detected": true
        },
        "protected_material_code": {
          "filtered": true,
          "detected": true
        }
      }
    }
  ],
  "prompt_filter_results": [
    {
      "prompt_index": 0,
      "content_filter_results": {
        "hate": {
          "filtered": true,
          "severity": "safe"
        },
        "self_harm": {
          "filtered": true,
          "severity": "safe"
        },
        "sexual": {
          "filtered": true,
          "severity": "safe"
        },
        "violence": {
          "filtered": true,
          "severity": "safe"
        },
        "jailbreak": {
          "filtered": true,
          "detected": true
        },
        "protected_material_text": {
          "filtered": true,
          "detected": true
        },
        "protected_material_code": {
          "filtered": true,
          "detected": true
        }
      }
    }
  ],
  "created": -9007199254740991,
  "model": "string",
  "system_fingerprint": "string",
  "object": "chat.completion",
  "usage": {
    "completion_tokens": 0,
    "completion_tokens_details": {
      "accepted_prediction_tokens": 0,
      "audio_tokens": 0,
      "reasoning_tokens": 0,
      "rejected_prediction_tokens": 0
    },
    "prompt_tokens": 0,
    "prompt_tokens_details": {
      "audio_tokens": 0,
      "cached_tokens": 0
    },
    "total_tokens": 0
  },
  "user_tier": "anonymous",
  "citations": [
    "string"
  ]
}
Success

/generate/text/{prompt}​Copy link
Generates text from text prompts.

Authentication:

Include your API key either:

In the Authorization header as a Bearer token: Authorization: Bearer YOUR_API_KEY
As a query parameter: ?key=YOUR_API_KEY
API keys can be created from your dashboard at enter.pollinations.ai.

Path Parameters
promptCopy link to prompt
Type:string
required
Request Example forget/generate/text/{prompt}
JavaScript Fetch

fetch('https://enter.pollinations.ai/api/generate/text/{prompt}', {
  headers: {
    Authorization: 'Bearer YOUR_SECRET_TOKEN'
  }
})

Test Request
(get /generate/text/{prompt})
Image Generation ​Copy link
Image GenerationOperations
get
/generate/image/models
/generate/image/models​Copy link
Get a list of available image generation models with pricing, capabilities, and metadata. Use this endpoint to discover which models are available and their costs before making generation requests. Response includes aliases (alternative names you can use), pricing per image, and supported modalities.

Responses

200
Success

500
Oh snap, something went wrong on our end. We're on it!
Request Example forget/generate/image/models
JavaScript Fetch

fetch('https://enter.pollinations.ai/api/generate/image/models', {
  headers: {
    Authorization: 'Bearer YOUR_SECRET_TOKEN'
  }
})

Test Request
(get /generate/image/models)
Status:200
Status:500

[
  {
    "name": "string",
    "aliases": [
      "string"
    ],
    "pricing": {
      "input_token_price": 1,
      "output_token_price": 1,
      "cached_token_price": 1,
      "image_price": 1,
      "audio_input_price": 1,
      "audio_output_price": 1,
      "currency": "USD"
    },
    "description": "string",
    "input_modalities": [
      "string"
    ],
    "output_modalities": [
      "string"
    ],
    "tools": true,
    "reasoning": true,
    "context_window": 1,
    "voices": [
      "string"
    ],
    "isSpecialized": true
  }
]
Success
