---
name: n8n-gamma-api
description: Triggered for Gamma API automation to generate presentations, parse structured JSON slides, and handle API timeouts/errors.
---

# Goal
To build robust HTTP Request flows that interface with the Gamma API for presentation generation, including handling long-running requests and escaping AI strings.

# Instructions
1. Gamma API Requests: Use `POST https://api.gamma.app/v1/presentations`. Ensure headers include `Authorization: Bearer <API_KEY>`.
2. Content Generation: Pass structured markdown or JSON array formats depending on the API payload definition.
3. String Escaping: When passing AI-generated strings into the JSON body, ALWAYS use `.replace(/"/g, '\\"')` or `JSON.stringify()` in the expression to avoid breaking the JSON.
4. Error Handling: Because generation takes time, wrap the request in a sub-workflow or use the Settings tab of the node to enable "Continue On Fail" and "Timeout" settings. Use an `IF` node after to check `$json.error`.

# Constraints
- NEVER embed unescaped AI-generated text directly into a stringified JSON body.
- Always include error routing if the Gamma generation fails or times out.

# Examples
```json
{
  "parameters": {
    "method": "POST",
    "url": "https://api.gamma.app/v1/presentations",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        { "name": "Authorization", "value": "Bearer {{ $credentials.gammaApiToken }}" }
      ]
    },
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={\n  \"title\": \"{{ JSON.stringify($json.presentation_title) }}\",\n  \"content\": {{ JSON.stringify($json.slide_content) }}\n}",
    "options": {}
  },
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Generate Gamma Presentation",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4,
  "position": [ 700, 300 ],
  "settings": {
    "continueOnFail": true
  }
}
```
