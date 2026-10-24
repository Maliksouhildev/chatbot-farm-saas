import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : wsp : recherche catalogue
// Nodes   : 3  |  Connections: 2
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// ExecuteWorkflowTrigger             executeWorkflowTrigger
// LireGoogleSheets                   googleSheets               [creds]
// FormaterPourIa                     code
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// ExecuteWorkflowTrigger
//    → LireGoogleSheets
//      → FormaterPourIa
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: '8lcSsO0JfacFeORG',
    name: 'wsp : recherche catalogue',
    active: false,
    projectId: 'eN0JyhHFEkunAK7Y',
    settings: { executionOrder: 'v1' },
})
export class WspRechercheCatalogueWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '225f811c-bade-4ba7-8aa8-cc7c6cc7c01c',
        name: 'Execute Workflow Trigger',
        type: 'n8n-nodes-base.executeWorkflowTrigger',
        version: 1,
        position: [0, 0],
    })
    ExecuteWorkflowTrigger = {};

    @node({
        id: 'd5da689a-a9b8-4a5d-a6d7-2c8dc86fb902',
        name: 'Lire Google Sheets',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [280, 0],
        credentials: { googleSheetsOAuth2Api: { id: 'GQ06erczX288ab4Y', name: 'Google Sheets account 2' } },
    })
    LireGoogleSheets = {
        documentId: {
            __rl: true,
            value: '1a5i0CJA-wphmdeuY0vePPXJmrTtK0bgylQlIrhu1bDM',
            mode: 'list',
            cachedResultName: 'Catalogue Hospitable',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1a5i0CJA-wphmdeuY0vePPXJmrTtK0bgylQlIrhu1bDM/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 'gid=0',
            mode: 'list',
            cachedResultName: 'Feuille 1',
        },
        options: {},
    };

    @node({
        id: 'f94c6461-446b-47dd-9bde-04fbfd6e24bc',
        name: 'Formater pour IA',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [500, 0],
    })
    FormaterPourIa = {
        jsCode: `const rows = $input.all().map(item => item.json);

if (rows.length === 0) {
  return [{ json: { result: "Aucun appartement trouvé dans la base de données." } }];
}

// On nettoie et on envoie le lien de réservation à l'IA
const catalogueClean = rows.map(r => ({
  Property_ID: r.Property_ID || "",
  Nom: r.Nom || "",
  Ville: r.Ville_Quartier || "",
  Capacite: r.Capacite || "",
  Description: r.Description_Courte || "",
  Lien_Reservation: r.Lien_Reservation || ""
}));

return [{ json: { result: JSON.stringify(catalogueClean) } }];`,
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.ExecuteWorkflowTrigger.out(0).to(this.LireGoogleSheets.in(0));
        this.LireGoogleSheets.out(0).to(this.FormaterPourIa.in(0));
    }
}
