---
name: n8n-json-core
description: Triggered when writing or modifying core n8n node JSON structures, managing the nodes and connections arrays, generating UUIDs, or adjusting X/Y coordinates in a workflow export.
---

# Goal
To write and manage flawless n8n node JSON structures, handle valid UUID generation, map node connections, and ensure correct UI positioning.

# Instructions
1. When generating a node, always include `parameters`, `id` (random valid UUID), `name` (unique string), `type` (valid n8n node type string), `typeVersion` (integer, usually 1 or 2), and `position` ([X, Y]).
2. Position: Every new node should increment the X coordinate by at least 200 from the previous node, and Y by 0 or 200 for parallel branches, to prevent overlapping in the n8n UI.
3. Connections: To wire nodes, locate the `connections` object at the root of the workflow JSON. The structure is `connections: { "Source Node Name": { "main": [ [ { "node": "Target Node Name", "type": "main", "index": 0 } ] ] } }`. Update this object correctly.
4. Ensure valid JSON without trailing commas.

# Constraints
- NEVER leave `connections` orphaned or nodes disconnected without explicitly stating why.
- NEVER break valid JSON formatting or change `id` of existing nodes.
- Do not output duplicate node `id`s.

# Examples
```json
{
  "nodes": [
    {
      "parameters": {},
      "id": "e4f8d423-9c87-4d92-bb88-34a58cf09f12",
      "name": "Start",
      "type": "n8n-nodes-base.start",
      "typeVersion": 1,
      "position": [ 240, 300 ]
    },
    {
      "parameters": {
        "rule": {
          "interval": [ { "field": "minutes", "minutesInterval": 5 } ]
        }
      },
      "id": "19b8823f-42de-4e33-8a3b-9a8c1f9b7cde",
      "name": "Schedule Trigger",
      "type": "n8n-nodes-base.scheduleTrigger",
      "typeVersion": 1,
      "position": [ 460, 300 ]
    }
  ],
  "connections": {
    "Start": {
      "main": [ [ { "node": "Schedule Trigger", "type": "main", "index": 0 } ] ]
    }
  }
}
```
