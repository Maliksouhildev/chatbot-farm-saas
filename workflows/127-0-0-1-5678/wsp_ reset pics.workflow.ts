import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : wsp: reset pics
// Nodes   : 4  |  Connections: 3
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WhenExecutedByAnotherWorkflow      executeWorkflowTrigger
// PrepKeysToDelete                   code
// RedisWipePhotos                    redis                      [creds]
// ReponsePourIa                      code
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WhenExecutedByAnotherWorkflow
//    → PrepKeysToDelete
//      → RedisWipePhotos
//        → ReponsePourIa
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'kCtbKybpBYduPMA8',
    name: 'wsp: reset pics',
    active: false,
    projectId: 'eN0JyhHFEkunAK7Y',
    settings: { executionOrder: 'v1' },
})
export class WspResetPicsWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: 'c00c3876-3d0b-40c2-9fe9-da495b4cf383',
        name: 'When Executed by Another Workflow',
        type: 'n8n-nodes-base.executeWorkflowTrigger',
        version: 1.1,
        position: [-580, -300],
    })
    WhenExecutedByAnotherWorkflow = {
        workflowInputs: {
            values: [
                {
                    name: 'phone',
                },
            ],
        },
    };

    @node({
        id: '92e81ee6-366d-4c78-8809-af979f90d15f',
        name: 'Prep Keys To Delete',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-360, -300],
    })
    PrepKeysToDelete = {
        jsCode: `const phone = $('When Executed by Another Workflow').first().json.phone || '';
return [
  { json: { key_to_delete: 'photo_urls_' + phone } },
  { json: { key_to_delete: 'vision_batch_' + phone } },
  { json: { key_to_delete: 'photo_count_' + phone } }
];`,
    };

    @node({
        id: 'fe0bd97b-1286-4d42-acc3-d7ece0c621ac',
        name: 'Redis Wipe Photos',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-140, -300],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisWipePhotos = {
        operation: 'delete',
        key: '={{ $json.key_to_delete }}',
    };

    @node({
        id: '018b812d-6c0f-4409-874a-3f5002c63d7d',
        name: 'Réponse pour IA',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [80, -300],
    })
    ReponsePourIa = {
        jsCode: 'return [{ json: { result: "Photos effacées avec succès. Demande au client d\'envoyer les nouvelles photos." } }];',
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WhenExecutedByAnotherWorkflow.out(0).to(this.PrepKeysToDelete.in(0));
        this.PrepKeysToDelete.out(0).to(this.RedisWipePhotos.in(0));
        this.RedisWipePhotos.out(0).to(this.ReponsePourIa.in(0));
    }
}
