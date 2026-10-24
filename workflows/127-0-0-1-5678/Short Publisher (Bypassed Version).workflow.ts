import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : Short Publisher (Bypassed Version)
// Nodes   : 14  |  Connections: 12
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// ScheduleTrigger                    scheduleTrigger
// ExecuteCommand                     executeCommand
// If_                                if
// EmailEmpty                         emailSend                  [creds]
// Code                               code
// LoopOverItems                      splitInBatches
// ReadWriteFilesFromDisk             readWriteFile
// DeleteClipJson                     executeCommand
// SendEmail                          emailSend                  [creds]
// InitiateYoutubeUpload              httpRequest                [creds]
// ExtractUploadUrl                   code
// UploadVideoToYoutube               httpRequest                [creds]
// ReadSidecar                        executeCommand
// ParseSidecar                       code
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// ScheduleTrigger
//    → ExecuteCommand
//      → If_
//        → Code
//          → LoopOverItems
//           .out(1) → ReadWriteFilesFromDisk
//              → ReadSidecar
//                → ParseSidecar
//                  → InitiateYoutubeUpload
//                    → ExtractUploadUrl
//                      → UploadVideoToYoutube
//       .out(1) → EmailEmpty
// SendEmail
//    → LoopOverItems (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'B331oWlVWY0Q8s2n',
    name: 'Short Publisher (Bypassed Version)',
    active: false,
    projectId: 'eN0JyhHFEkunAK7Y',
})
export class ShortPublisherBypassedVersionWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '75b224d4-527b-4d08-97bc-4955c914b3de',
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        version: 1.2,
        position: [-540, -220],
    })
    ScheduleTrigger = {
        rule: {
            interval: [
                {
                    triggerAtHour: 8,
                },
                {
                    triggerAtHour: 12,
                },
                {
                    triggerAtHour: 16,
                },
                {
                    triggerAtHour: 20,
                },
            ],
        },
    };

    @node({
        id: '9f9d4327-74ce-4377-bc57-efd8e3939032',
        name: 'Execute Command',
        type: 'n8n-nodes-base.executeCommand',
        version: 1,
        position: [-340, -220],
    })
    ExecuteCommand = {
        command: 'ls -1 /files/outputs/*.mp4 | shuf | head -n 1',
    };

    @node({
        id: '477eb5e3-f998-4861-8755-c3aa27d6fc84',
        name: 'If',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [-140, -220],
    })
    If_ = {
        conditions: {
            options: {},
            conditions: [
                {
                    leftValue: '={{ $json.stdout.trim().length }}',
                    rightValue: 0,
                    operator: {
                        type: 'number',
                        operation: 'gt',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: 'a504708e-0bfc-4eb2-838c-471c7cb9c7e7',
        webhookId: '80f08670-92b6-4e8d-b7c6-058539d5bddf',
        name: 'Email Empty',
        type: 'n8n-nodes-base.emailSend',
        version: 2.1,
        position: [60, -20],
        credentials: { smtp: { id: 'y9GfhJenJPSfkVno', name: 'SMTP account' } },
    })
    EmailEmpty = {
        fromEmail: 'mlkmehdid@gmail.com',
        toEmail: 'mlkmehdid@gmail.com',
        subject: '⚠️ Publisher is EMPTY!',
        options: {},
    };

    @node({
        id: '4816fbc5-7f68-42be-9432-346b1c98f707',
        name: 'Code',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [60, -320],
    })
    Code = {
        jsCode: `const files = $input.first().json.stdout.trim().split('\\n').filter(f => f);
return files.map(file => ({ json: { video_path: file } }));`,
    };

    @node({
        id: '057cee70-ee2e-4e83-b13f-0618ad2c0f4a',
        name: 'Loop Over Items',
        type: 'n8n-nodes-base.splitInBatches',
        version: 3,
        position: [240, -340],
    })
    LoopOverItems = {
        options: {},
    };

    @node({
        id: '55dfe836-5bc7-4bfa-afec-1e7e81622e1c',
        name: 'Read/Write Files from Disk',
        type: 'n8n-nodes-base.readWriteFile',
        version: 1,
        position: [460, -320],
    })
    ReadWriteFilesFromDisk = {
        fileSelector: "={{ $('Loop Over Items').item.json.video_path }}",
        options: {
            dataPropertyName: 'data',
        },
    };

    @node({
        id: 'f5e57d1d-8304-4a2c-89a6-f733bebb7779',
        name: 'Delete Clip & JSON',
        type: 'n8n-nodes-base.executeCommand',
        version: 1,
        position: [1460, -320],
    })
    DeleteClipJson = {
        command:
            "rm -f \"{{ $('Loop Over Items').item.json.video_path }}\" \"{{ $('Loop Over Items').item.json.video_path.replace('.mp4','.json') }}\"",
    };

    @node({
        id: '54125c4e-8f9c-4cad-96b8-764f7e714d0b',
        webhookId: '3f903da9-8afc-444f-97f2-a826f6f64c28',
        name: 'Send Email',
        type: 'n8n-nodes-base.emailSend',
        version: 2.1,
        position: [1660, -320],
        credentials: { smtp: { id: 'y9GfhJenJPSfkVno', name: 'SMTP account' } },
    })
    SendEmail = {
        fromEmail: 'mlkmehdid@gmail.com',
        toEmail: 'mlkmehdid@gmail.com',
        subject: '🎬 Short Published! {{ $("Parse Sidecar").first().json.meta.viral_caption || "New Clip" }}',
        options: {
            appendAttribution: false,
        },
        message: `<h2>🎬 New YouTube Short Published!</h2>
<p><strong>Clip Title (Caption):</strong> {{ $('Parse Sidecar').first().json.meta.viral_caption || 'N/A' }}</p>
<p><strong>Game:</strong> {{ $('Parse Sidecar').first().json.meta.game || 'N/A' }}</p>
<p><strong>Theme:</strong> {{ $('Parse Sidecar').first().json.meta.theme || 'N/A' }}</p>
<p><strong>Summary:</strong> {{ $('Parse Sidecar').first().json.meta.global_summary || 'N/A' }}</p>
<hr/>
<p><strong>📁 File:</strong> {{ $('Loop Over Items').item.json.video_path }}</p>
<p><strong>✅ Status:</strong> Uploaded to YouTube and archived.</p>
<p>Check your YouTube Studio for the live link.</p>`,
    };

    @node({
        id: '85aa4008-2841-47c5-801f-2573d5ba5828',
        name: 'Initiate YouTube Upload',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [860, -320],
        credentials: { youTubeOAuth2Api: { id: 'uZZfE7BMA1T5wyqf', name: 'YouTube account' } },
    })
    InitiateYoutubeUpload = {
        method: 'POST',
        url: 'https://www.googleapis.com/upload/youtube/v3/videos',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'youTubeOAuth2Api',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'uploadType',
                    value: 'resumable',
                },
                {
                    name: 'part',
                    value: 'snippet,status',
                },
            ],
        },
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'Content-Type',
                    value: 'application/json',
                },
                {
                    name: 'X-Upload-Content-Type',
                    value: 'video/mp4',
                },
            ],
        },
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            "={{ JSON.stringify({ snippet: { title: ($json.meta.viral_caption || 'INSANE GAMING MOMENT').toUpperCase() + ' 😱💀 #Shorts', description: '😱 ' + ($json.meta.viral_caption || 'INSANE MOMENT').toUpperCase() + '\\n\\n🎮 ' + ($json.meta.global_summary || 'Epic gaming moment!') + '\\n\\n📱 FOLLOW for daily clips! Drop a 🔥 if you want more!\\n\\n#Shorts #Gaming #FunnyMoments #GamingClips #Viral #FYP #Streamer #BrainRot #GamingHighlights #YoutubeShorts #ForYou #Trending #' + ($json.meta.game || 'Gaming').replace(/[^a-zA-Z0-9]/g,''), categoryId: '20' }, status: { privacyStatus: 'public', selfDeclaredMadeForKids: false } }) }}",
        options: {
            response: {
                response: {
                    fullResponse: true,
                },
            },
        },
    };

    @node({
        id: 'f1971981-7fc7-4489-9e29-d190b1424634',
        name: 'Extract Upload URL',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1060, -320],
    })
    ExtractUploadUrl = {
        jsCode: `const resp = $input.first().json;
const uploadUrl = (resp.headers && resp.headers.location) ? resp.headers.location : null;
if (!uploadUrl) throw new Error('No upload URL. Headers: ' + JSON.stringify(resp.headers));
// Binary comes from Parse Sidecar (which grabbed it from Read/Write Files from Disk)
const binary = $('Parse Sidecar').first().binary;
return [{ json: { uploadUrl }, binary }];`,
    };

    @node({
        id: '5b4c38d0-143f-4059-98f5-dd72dd0d12db',
        name: 'Upload Video to YouTube',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [1260, -320],
        credentials: { youTubeOAuth2Api: { id: 'uZZfE7BMA1T5wyqf', name: 'YouTube account' } },
    })
    UploadVideoToYoutube = {
        method: 'PUT',
        url: "={{ $('Extract Upload URL').first().json.uploadUrl }}",
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'youTubeOAuth2Api',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'Content-Type',
                    value: 'video/mp4',
                },
            ],
        },
        sendBody: true,
        contentType: 'binaryData',
        inputDataFieldName: 'data',
        options: {},
    };

    @node({
        id: '1a32f6ff-3c58-4579-90a7-b04e6af3ea7c',
        name: 'Read Sidecar',
        type: 'n8n-nodes-base.executeCommand',
        version: 1,
        position: [600, -320],
    })
    ReadSidecar = {
        command:
            '=SIDECAR="{{ $(\'Loop Over Items\').item.json.video_path.replace(\'.mp4\',\'.json\') }}"; [ -f "$SIDECAR" ] && cat "$SIDECAR" || echo \'{"viral_caption":"INSANE MOMENT","game":"Gaming","global_summary":"An insane gaming moment.","vibe":"High-energy","theme":"Gaming","key_themes":["gaming","funny"]}\'',
    };

    @node({
        id: 'd6fc2e2a-5658-47fc-9fe6-157399946271',
        name: 'Parse Sidecar',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [740, -320],
    })
    ParseSidecar = {
        jsCode: `const raw = $input.first().json.stdout || '{}';
let meta = {};
try { meta = JSON.parse(raw); } catch(e) { meta = { viral_caption: 'INSANE MOMENT', game: 'Gaming', global_summary: 'Epic gaming moment.', vibe: 'High-energy', theme: 'Gaming', key_themes: ['gaming'] }; }
// Carry the video binary forward
const binary = $('Read/Write Files from Disk').first().binary;
return [{ json: { meta, video_path: $('Loop Over Items').item.json.video_path }, binary }];`,
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.ScheduleTrigger.out(0).to(this.ExecuteCommand.in(0));
        this.ExecuteCommand.out(0).to(this.If_.in(0));
        this.If_.out(0).to(this.Code.in(0));
        this.If_.out(1).to(this.EmailEmpty.in(0));
        this.Code.out(0).to(this.LoopOverItems.in(0));
        this.LoopOverItems.out(1).to(this.ReadWriteFilesFromDisk.in(0));
        this.ReadWriteFilesFromDisk.out(0).to(this.ReadSidecar.in(0));
        this.SendEmail.out(0).to(this.LoopOverItems.in(0));
        this.InitiateYoutubeUpload.out(0).to(this.ExtractUploadUrl.in(0));
        this.ExtractUploadUrl.out(0).to(this.UploadVideoToYoutube.in(0));
        this.ReadSidecar.out(0).to(this.ParseSidecar.in(0));
        this.ParseSidecar.out(0).to(this.InitiateYoutubeUpload.in(0));
    }
}
