import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Facecam Test
// Nodes   : 9  |  Connections: 9
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// ManualTrigger                      manualTrigger
// FindStream                         executeCommand
// EditFields                         set
// GetReferenceFrame                  executeCommand
// ReadReference                      readWriteFile
// CamVisionPrep                      code
// CamVisionCall                      httpRequest                [onError→out(1)] [creds]
// ParseCamConfig                     code
// ExtractCrop                        executeCommand
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// ManualTrigger
//    → FindStream
//      → EditFields
//        → GetReferenceFrame
//          → ReadReference
//            → CamVisionPrep
//              → CamVisionCall
//                → ParseCamConfig
//                  → ExtractCrop
//               .out(1) → ParseCamConfig (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'KoeIx1msxnfWlUii',
    name: 'Facecam Test',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class FacecamTestWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: 'manual-trigger',
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [0, 0],
    })
    ManualTrigger = {};

    @node({
        id: 'find-stream',
        name: 'Find Stream',
        type: 'n8n-nodes-base.executeCommand',
        version: 1,
        position: [200, 0],
    })
    FindStream = {
        command: 'ls -1 /files/inputs/ | grep "\\.mp4$" | head -n 1',
    };

    @node({
        id: 'edit-fields',
        name: 'Edit Fields',
        type: 'n8n-nodes-base.set',
        version: 3.4,
        position: [400, 0],
    })
    EditFields = {
        assignments: {
            assignments: [
                {
                    id: '1',
                    name: 'stream_file',
                    value: '={{ $json.stdout.trim() }}',
                    type: 'string',
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'get-ref-frame',
        name: 'Get Reference Frame',
        type: 'n8n-nodes-base.executeCommand',
        version: 1,
        position: [600, 0],
    })
    GetReferenceFrame = {
        command:
            '=file="/files/inputs/{{ $json.stream_file }}"; rm -f /files/temp/test_ref.jpg; ffmpeg -loglevel error -y -ss 00:05:00 -i "$file" -vf "scale=480:-1" -vframes 1 -q:v 2 "/files/temp/test_ref.jpg" || true; ls -1 /files/temp/test_ref.jpg',
    };

    @node({
        id: 'read-ref',
        name: 'Read Reference',
        type: 'n8n-nodes-base.readWriteFile',
        version: 1,
        position: [800, 0],
    })
    ReadReference = {
        fileSelector: '=/files/temp/test_ref.jpg',
        options: {
            dataPropertyName: 'data',
        },
    };

    @node({
        id: 'cam-vision-prep',
        name: 'Cam Vision Prep',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1000, 0],
    })
    CamVisionPrep = {
        jsCode: `const base64Data = $('Read Reference').first().binary.data.data.replace(/[\\n\\r\\s]/g, "");
const streamFile = $('Edit Fields').first().json.stream_file;
return [{ json: { file: streamFile, cam_vision_payload: { model: "qwen/qwen-vl-plus:free", max_tokens: 512, messages: [ { role: "user", content: [ { type: "text", text: "This is a gaming livestream frame (480x270 pixels). Find the streamer's webcam PiP (Picture-in-Picture) overlay. It could be a real person, vtuber, or emoji. Return ONLY strict JSON: {\\"found\\": true, \\"xmin\\": 10, \\"ymin\\": 10, \\"xmax\\": 150, \\"ymax\\": 100} with pixel coords in the 480x270 image. If there is no webcam overlay, return {\\"found\\": false}." }, { type: "image_url", image_url: { url: \`data:image/jpeg;base64,\${base64Data}\` } } ] } ], response_format: { type: "json_object" } } } }];`,
    };

    @node({
        id: 'cam-vision-call',
        name: 'Cam Vision Call',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [1200, 0],
        credentials: { httpHeaderAuth: { id: 'pwmTF4Pl54IWy5Kz', name: 'Header Auth account 2' } },
        onError: 'continueErrorOutput',
    })
    CamVisionCall = {
        method: 'POST',
        url: 'https://openrouter.ai/api/v1/chat/completions',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: '={{ $json.cam_vision_payload }}',
        options: {},
    };

    @node({
        id: 'parse-cam',
        name: 'Parse Cam Config',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1400, 0],
    })
    ParseCamConfig = {
        jsCode: `const item = $input.first().json;
const streamFile = item.file || $('Edit Fields').first().json.stream_file;

// Handle OpenRouter choices format
if (!item.choices || item.choices.length === 0) {
    return [{ json: { ai_found: false, cam_w: 0, cam_h: 0, cam_x: 0, cam_y: 0, raw: item, file: streamFile, note: 'No AI choices returned - fallback to no-cam mode' } }];
}

let content = item.choices[0].message.content;
let result = { found: false };
try { result = JSON.parse(content); } catch (e) { result = { found: false, parse_error: e.message }; }

if (!result.found || result.xmin === undefined || result.xmax === undefined) {
    return [{ json: { ai_found: false, cam_w: 0, cam_h: 0, cam_x: 0, cam_y: 0, raw: result, file: streamFile, note: 'AI returned found:false or no coords - fullscreen mode' } }];
}

const imgW = 480, imgH = 270, videoRealW = 1920, videoRealH = 1080;
const scale = videoRealW / imgW;

let bestBox = { xmin: result.xmin, ymin: result.ymin, xmax: result.xmax, ymax: result.ymax };
let faceX = ((bestBox.xmin + bestBox.xmax) / 2) * scale;
let faceY = ((bestBox.ymin + bestBox.ymax) / 2) * scale;
let faceW = (bestBox.xmax - bestBox.xmin) * scale;

let cropW = faceW * 2.6;
if (cropW < 260) cropW = 260;
if (cropW > 680) cropW = 680;
let cropH = cropW * (9/16);

let startX = faceX - (cropW / 2);
let startY = faceY - (cropH * 0.40) - 20;

if (startX < 0) startX = 0;
if (startY < 0) startY = 0;
if (startX + cropW > videoRealW) startX = videoRealW - cropW;
if (startY + cropH > videoRealH) startY = videoRealH - cropH;

return [{ json: { cam_x: Math.floor(startX), cam_y: Math.floor(startY), cam_w: Math.floor(cropW), cam_h: Math.floor(cropH), ai_found: true, raw: result, file: streamFile } }];`,
    };

    @node({
        id: 'extract-crop',
        name: 'Extract Crop',
        type: 'n8n-nodes-base.executeCommand',
        version: 1,
        position: [1600, 0],
    })
    ExtractCrop = {
        command:
            '=if [ "{{ $json.ai_found }}" = "true" ]; then file="/files/inputs/{{ $json.file }}"; ffmpeg -loglevel error -y -ss 00:05:00 -i "$file" -vf "crop={{ $json.cam_w }}:{{ $json.cam_h }}:{{ $json.cam_x }}:{{ $json.cam_y }}" -vframes 1 -q:v 2 "/files/temp/test_crop_result.jpg" && echo "Facecam crop OK: {{ $json.cam_w }}x{{ $json.cam_h }} at ({{ $json.cam_x }},{{ $json.cam_y }})"; else echo "No facecam detected - fullscreen mode would be used"; fi',
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.ManualTrigger.out(0).to(this.FindStream.in(0));
        this.FindStream.out(0).to(this.EditFields.in(0));
        this.EditFields.out(0).to(this.GetReferenceFrame.in(0));
        this.GetReferenceFrame.out(0).to(this.ReadReference.in(0));
        this.ReadReference.out(0).to(this.CamVisionPrep.in(0));
        this.CamVisionPrep.out(0).to(this.CamVisionCall.in(0));
        this.CamVisionCall.out(0).to(this.ParseCamConfig.in(0));
        this.CamVisionCall.out(1).to(this.ParseCamConfig.in(0));
        this.ParseCamConfig.out(0).to(this.ExtractCrop.in(0));
    }
}
