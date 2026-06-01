---
name: n8n-expression-master
description: Triggered when writing advanced JavaScript logic inside n8n's double-curly-brace expressions, such as ternary operators, mapping, and array filtering.
---

# Goal
To craft complex, efficient JavaScript logic within n8n expressions `{{ ... }}`.

# Instructions
1. Accessing Data: Use `$json` for the current item, `$input.all()` for all items, `$node["Node Name"].json` to reference past nodes.
2. Ternary Operators: Use inline conditionals for clean fallback logic: `{{ $json.phone ? $json.phone : 'No Phone' }}`.
3. Array Methods: You can use `.map()`, `.filter()`, and `.join()` directly in expressions. Example: `{{ $json.items.map(i => i.id).join(',') }}`.
4. Date Handling: Use `$now` or `luxon.DateTime` for inline date manipulation (e.g., `{{ $now.plus({days:1}).toFormat('yyyy-MM-dd') }}`).

# Constraints
- NEVER use multi-line statements like `if/else` inside an expression; expressions must resolve to a single value. Use Code nodes for complex multi-line blocks.
- Ensure that variables referenced actually exist in the flow to avoid expression resolution errors. Use optional chaining `?.` extensively.

# Examples
```json
{
  "parameters": {
    "keepOnlySet": true,
    "values": {
      "string": [
        {
          "name": "formatted_message",
          "value": "={{ $json.body?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.text?.body || 'No message' }}"
        },
        {
          "name": "tags",
          "value": "={{ $json.tags.filter(t => t.active).map(t => t.name).join(', ') }}"
        }
      ]
    },
    "options": {}
  },
  "id": "b2c3d4e5-f6g7-890a-bcde-f12345678901",
  "name": "Format Data",
  "type": "n8n-nodes-base.set",
  "typeVersion": 2,
  "position": [ 500, 300 ]
}
```
