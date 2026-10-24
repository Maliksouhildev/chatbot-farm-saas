import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : wsp downlaod image
// Nodes   : 6  |  Connections: 5
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// ExecuteSubworkflow                 executeWorkflowTrigger
// GetFreshUrl                        httpRequest                [creds] [retry]
// CheckFreshUrl                      code
// DownloadBinaryFile                 httpRequest                [creds] [retry]
// UploadToHubspot                    httpRequest                [creds] [retry]
// FormatOutput                       code
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// ExecuteSubworkflow
//    → GetFreshUrl
//      → CheckFreshUrl
//        → DownloadBinaryFile
//          → UploadToHubspot
//            → FormatOutput
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'Y7882xaNB7Va89QS',
    name: 'wsp downlaod image',
    active: false,
    projectId: 'eN0JyhHFEkunAK7Y',
    settings: { executionOrder: 'v1' },
})
export class WspDownlaodImageWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '2cdfd1f7-4192-48be-b2f0-f8329888fe0f',
        name: 'Execute Subworkflow',
        type: 'n8n-nodes-base.executeWorkflowTrigger',
        version: 1.1,
        position: [0, 0],
    })
    ExecuteSubworkflow = {
        workflowInputs: {
            values: [
                {
                    name: 'url',
                },
                {
                    name: 'phone',
                },
                {
                    name: 'nom_client',
                },
                {
                    name: 'ville_quartier',
                },
                {
                    name: 'surface',
                },
                {
                    name: 'situation_actuelle',
                },
                {
                    name: 'disponibilite_annuelle',
                },
                {
                    name: 'timing_et_etat',
                },
                {
                    name: 'score_sur_5',
                },
                {
                    name: 'appt_id',
                    type: 'number',
                },
                {
                    name: 'liens_photos',
                },
            ],
        },
    };

    @node({
        id: '29fca393-43bd-4db4-80ec-57a04491e69b',
        name: 'Get Fresh URL',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [200, 0],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 3000,
    })
    GetFreshUrl = {
        url: '=https://graph.facebook.com/v21.0/{{ $json.url.match(/mid=([^&]+)/)[1] }}',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        options: {},
    };

    @node({
        id: 'fd0d3956-47c6-4eb5-b0cb-94473b7292ed',
        name: 'Check Fresh URL',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [360, 0],
    })
    CheckFreshUrl = {
        jsCode: `// If Get Fresh URL failed, pass through with a flag
const input = $input.first().json;
if (input.error || !input.url) {
    const original = $('Execute Subworkflow').first().json;
    return [{ json: { ...original, url: null, _failed: true } }];
}
return [{ json: input }];`,
    };

    @node({
        id: '6cd1f8ab-b3f2-4c32-9af2-ad6aad2b5929',
        name: 'Download Binary File',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [500, 0],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 2000,
    })
    DownloadBinaryFile = {
        url: '={{ $json.url }}',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'whatsAppApi',
        options: {
            response: {
                response: {
                    responseFormat: 'file',
                },
            },
        },
    };

    @node({
        id: '7ecc6f6d-d8d2-4b67-9546-f6f833256a69',
        name: 'Upload to HubSpot',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [700, 0],
        credentials: { hubspotAppToken: { id: '5HBUs8WG3nCRPWi0', name: 'HubSpot account' } },
        retryOnFail: true,
        maxTries: 2,
        waitBetweenTries: 2000,
    })
    UploadToHubspot = {
        method: 'POST',
        url: 'https://api.hubapi.com/files/v3/files',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'hubspotAppToken',
        sendBody: true,
        contentType: 'multipart-form-data',
        bodyParameters: {
            parameters: [
                {
                    name: 'folderPath',
                    value: '/appartements',
                },
                {
                    name: 'options',
                    value: '{"access":"PUBLIC_INDEXABLE"}',
                },
                {
                    parameterType: 'formBinaryData',
                    name: 'file',
                    inputDataFieldName: 'data',
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'c999df25-e3b9-4724-89dc-ac038391c02f',
        name: 'Format Output',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [900, 0],
    })
    FormatOutput = {
        jsCode: `
const original = $('Execute Subworkflow').first().json;
let hsUrl = 'upload_echoue';
try {
    const uploadResult = $input.first().json;
    hsUrl = uploadResult.url || uploadResult.default_hosting_url || 'upload_echoue';
} catch(e) {}
const finalItem = Object.assign({}, original);
finalItem.hubspot_url = hsUrl;
return [{ json: finalItem }];
`,
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.ExecuteSubworkflow.out(0).to(this.GetFreshUrl.in(0));
        this.GetFreshUrl.out(0).to(this.CheckFreshUrl.in(0));
        this.CheckFreshUrl.out(0).to(this.DownloadBinaryFile.in(0));
        this.DownloadBinaryFile.out(0).to(this.UploadToHubspot.in(0));
        this.UploadToHubspot.out(0).to(this.FormatOutput.in(0));
    }
}
