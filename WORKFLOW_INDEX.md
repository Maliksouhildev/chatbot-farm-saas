# n8n Workflow Index

This index provides a 1-sentence summary of each n8n workflow in the workspace. Read this file to locate the correct JSON workflow before attempting to open any large `.json` files.

- **image_flow.json**: Manages the processing and validation of WhatsApp images, context setting, and CRM exports.
- **image_upload_subworkflow.json**: Subworkflow that downloads fresh image URLs and binary files to upload them directly into HubSpot.
- **publisher.json**: A scheduled workflow that executes commands and handles empty email reporting logic.
- **subworkflow1.json**: Subworkflow handling quote analysis and API integration with Hospitable to merge and split IDs.
- **subworkflow2.json**: Subworkflow managing AI responses, creating HubSpot contacts, and wiping Redis cache keys.
- **subworkflow3.json**: Subworkflow dedicated to preparing and analyzing quotes by fetching properties from Hospitable.
- **subworkflow4.json**: Subworkflow for formatting AI responses and checking specific state statuses in Redis.
- **subworkflow5.json**: Subworkflow processing Hospitable webhooks, preparing JSON data, locking reservations in Redis, and sending proactive WhatsApp messages.
- **sub_hubspot_upload.json**: Subworkflow that securely downloads binary files from fresh URLs and formats the output for HubSpot uploads.
- **sub_reset_photos.json**: Subworkflow responsible for resetting, preparing, and wiping photo data keys from the Redis cache.
- **wsp.json**: The core WhatsApp routing workflow that sets context, routes AI requests, and processes downloaded images.
- **youtubeshort.json**: Scheduled workflow that finds active YouTube streams, edits fields, and handles email notifications.
