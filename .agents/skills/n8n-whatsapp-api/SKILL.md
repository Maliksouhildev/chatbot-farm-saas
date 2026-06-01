---
name: n8n-whatsapp-api
description: Triggered when configuring WhatsApp Business API triggers, sending WhatsApp messages via HTTP Request nodes with Bearer tokens, or parsing incoming WhatsApp webhook payloads.
---

# Goal
To configure and parse WhatsApp Business API webhooks and requests flawlessly within n8n.

# Instructions
1. Webhooks: Use an HTTP Request node (or Webhook node) to receive data. The WhatsApp payload is deeply nested under `$json.body.entry[0].changes[0].value`.
2. Extract the sender's phone number via `{{ $json.body.entry[0].changes[0].value.messages[0].from }}` and the message text via `{{ $json.body.entry[0].changes[0].value.messages[0].text.body }}`.
3. HTTP Requests to WA API: Ensure the method is `POST`, the URL is `https://graph.facebook.com/v17.0/{{phone_number_id}}/messages`.
4. Authentication: Use Bearer tokens correctly in the Headers `Authorization: Bearer <token>`.
5. Body: Set `messaging_product` to `"whatsapp"`, specify `to`, and `type` (e.g., `"text"`, `"template"`).

# Constraints
- NEVER hardcode Bearer tokens in plaintext; prefer variables or credentials unless instructed.
- NEVER assume `$json.body` is completely safe; always use conditional expressions (`?`) if properties might be missing.

# Examples
```json
{
  "parameters": {
    "method": "POST",
    "url": "https://graph.facebook.com/v17.0/123456789/messages",
    "authentication": "genericCredentialType",
    "genericAuthType": "httpBearerAuth",
    "sendBody": true,
    "specifyBody": "json",
    "jsonBody": "={\n  \"messaging_product\": \"whatsapp\",\n  \"to\": \"{{ $json.body.entry[0].changes[0].value.messages[0].from }}\",\n  \"type\": \"text\",\n  \"text\": {\n    \"body\": \"Hello from n8n!\"\n  }\n}",
    "options": {}
  },
  "id": "c1a2b3d4-e5f6-7890-abcd-ef1234567890",
  "name": "Send WhatsApp Msg",
  "type": "n8n-nodes-base.httpRequest",
  "typeVersion": 4,
  "position": [ 800, 300 ]
}
```
