import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : wsp : verifier paiement
// Nodes   : 3  |  Connections: 2
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WhenExecutedByAnotherWorkflow      executeWorkflowTrigger
// FormatAiResponse                   code
// RedisCheckStatus1                  redis                      [creds]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WhenExecutedByAnotherWorkflow
//    → RedisCheckStatus1
//      → FormatAiResponse
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'MRFnDCvajn6YaxpI',
    name: 'wsp : verifier paiement',
    active: false,
    projectId: 'eN0JyhHFEkunAK7Y',
    settings: { executionOrder: 'v1' },
})
export class WspVerifierPaiementWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: 'ada2bfe4-16cd-41e7-9939-b4a566b306ab',
        name: 'When Executed by Another Workflow',
        type: 'n8n-nodes-base.executeWorkflowTrigger',
        version: 1.1,
        position: [-60, -200],
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
        id: '0fddfb42-4c26-484c-bcfd-d8d7db065aa1',
        name: 'Format AI Response',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [380, -160],
    })
    FormatAiResponse = {
        jsCode: `// On attrape la valeur de Redis, peu importe le nom que n8n lui donne
const redisData = Object.values($input.first().json)[0];

// Si c'est vide, on annule
if (!redisData) {
  return [{ json: { status: "AUCUNE_RESERVATION", message: "Le client n'a pas de réservation en attente. Continue la vente normale." } }];
}

// On convertit le texte de Redis en vrai JSON
let data;
try {
    data = JSON.parse(redisData);
} catch (e) {
    return [{ json: { status: "AUCUNE_RESERVATION", message: "Continue la vente." } }];
}

// On calcule le temps restant (12 heures)
const hoursLeft = Math.floor(12 - ((Date.now() - data.timestamp) / (1000 * 60 * 60)));

// Si le délai est dépassé → traiter exactement comme AUCUNE_RESERVATION, ne pas mentionner l'expiration
if (hoursLeft <= 0) {
   return [{ json: { status: "AUCUNE_RESERVATION", message: "Le client n'a pas de réservation en attente. Continue la vente normale." } }];
}

// Si tout est bon, on donne le feu vert à l'IA
return [{ 
  json: { 
    status: "EN_ATTENTE_DE_PAIEMENT",
    reservation_id: data.reservation_id,
    heures_restantes: hoursLeft,
    message_ia: \`Le client a bloqué l'appartement. Il lui reste \${hoursLeft} heures. DEMANDE-LUI SON MOYEN DE PAIEMENT IMMEDIATEMENT.\`
  } 
}];
`,
    };

    @node({
        id: '43712b8f-6420-43a3-8385-e48dbf0910b1',
        name: 'Redis: Check Status1',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [160, -160],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisCheckStatus1 = {
        operation: 'get',
        key: "={{ 'res_pending:' + $json.phone }}",
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WhenExecutedByAnotherWorkflow.out(0).to(this.RedisCheckStatus1.in(0));
        this.RedisCheckStatus1.out(0).to(this.FormatAiResponse.in(0));
    }
}
