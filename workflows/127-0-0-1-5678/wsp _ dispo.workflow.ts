import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : wsp : dispo
// Nodes   : 10  |  Connections: 9
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WhenExecutedByAnotherWorkflow      executeWorkflowTrigger
// RedisGetPagination                 redis                      [creds]
// CalculatePage                      code
// RedisSetPagination                 redis                      [creds]
// AnalyserLeDevis                    code
// ApiQuoteHospitable1                httpRequest                [onError→regular] [creds] [retry]
// MergeResults                       code
// LireGoogleSheets                   googleSheets               [creds]
// FormatSheetsData                   code
// ScrapeDevisesquare                 httpRequest                [onError→regular] [retry]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WhenExecutedByAnotherWorkflow
//    → RedisGetPagination
//      → CalculatePage
//        → RedisSetPagination
//          → ScrapeDevisesquare
//            → LireGoogleSheets
//              → FormatSheetsData
//                → ApiQuoteHospitable1
//                  → AnalyserLeDevis
//                    → MergeResults
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'cpUwDbRPuJNAwpeM',
    name: 'wsp : dispo',
    active: false,
    projectId: 'eN0JyhHFEkunAK7Y',
    settings: { executionOrder: 'v1' },
})
export class WspDispoWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: 'cc60ad2f-3a33-45f5-adbd-8cdae7448e18',
        name: 'When Executed by Another Workflow',
        type: 'n8n-nodes-base.executeWorkflowTrigger',
        version: 1.1,
        position: [-1700, -460],
    })
    WhenExecutedByAnotherWorkflow = {
        workflowInputs: {
            values: [
                {
                    name: 'property_ids',
                },
                {
                    name: 'start_date',
                },
                {
                    name: 'end_date',
                },
                {
                    name: 'guests',
                    type: 'number',
                },
                {
                    name: 'phone',
                },
                {
                    name: 'first_name',
                },
                {
                    name: 'last_name',
                },
                {
                    name: 'page',
                    type: 'number',
                },
            ],
        },
    };

    @node({
        id: 'redis-get-pagination',
        name: 'Redis Get Pagination',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-1480, -460],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisGetPagination = {
        operation: 'get',
        key: '=pagination_{{ $json.query?.phone || $json.phone }}',
        options: {},
    };

    @node({
        id: 'calculate-page',
        name: 'Calculate Page',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1280, -460],
    })
    CalculatePage = {
        jsCode: `const triggerData = $('When Executed by Another Workflow').first().json;
const actualData = triggerData.query ? triggerData.query : triggerData;

let previousState = null;
const redisOutput = $input.first()?.json?.propertyName || $input.first()?.json?.value;
if (redisOutput) {
    try { previousState = JSON.parse(redisOutput); } catch(e) {}
}

let newPage = 1;
if (previousState && 
    previousState.start_date === actualData.start_date &&
    previousState.end_date === actualData.end_date &&
    previousState.guests == actualData.guests) {
    newPage = (parseInt(previousState.page) || 1) + 1;
}

const newState = {
    start_date: actualData.start_date,
    end_date: actualData.end_date,
    guests: actualData.guests,
    page: newPage
};
return [{ json: { newState, pageToUse: newPage } }];`,
    };

    @node({
        id: 'redis-set-pagination',
        name: 'Redis Set Pagination',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-1080, -460],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisSetPagination = {
        operation: 'set',
        key: "=pagination_{{ $('When Executed by Another Workflow').first().json.query?.phone || $('When Executed by Another Workflow').first().json.phone }}",
        value: '={{ JSON.stringify($json.newState) }}',
    };

    @node({
        id: '2d6d10c7-e1eb-4572-9b9f-fbf285046565',
        name: 'Analyser le Devis',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-40, -600],
    })
    AnalyserLeDevis = {
        jsCode: `try {
    const results = [];
    const httpResponses = $input.all();
    const originalIds = $('Format Sheets Data').all();

    // 🟢 SCRAPING DEVISESQUARE
    let TAUX_CHANGE_DZD = 240; 
    try {
        const htmlNode = $('Scrape DeviseSquare').first();
        if (htmlNode && htmlNode.json && htmlNode.json.data) {
            const html = htmlNode.json.data;
            const match = html.match(/1 EURO[\\s\\S]*?buy[\\s\\S]*?<h1>(\\d{3})/i); 
            if (match && match[1]) {
                TAUX_CHANGE_DZD = parseInt(match[1], 10);
            }
        }
    } catch(e) {}

    // Sécurité si Hospitable n'a rien renvoyé du tout
    if (!httpResponses || httpResponses.length === 0) {
        return [{ json: { result: "ERREUR: Aucune donnée reçue." } }];
    }

    for (let i = 0; i < httpResponses.length; i++) {
        const response = httpResponses[i].json || {};
        const property_id = (originalIds[i] && originalIds[i].json) ? originalIds[i].json.property_id : "ID_INCONNU";
        
        // Guard: skip WhatsApp API responses that leaked into this context
        if (response.messaging_product === 'whatsapp' || response.object === 'whatsapp_business_account') {
            results.push({ json: { result: \`ID: \${property_id} -> STATUT: INDISPONIBLE\` } });
            continue;
        }

        if (response.error || response.status_code || response.message) {
            results.push({ json: { result: \`ID: \${property_id} -> STATUT: INDISPONIBLE\` } });
            continue;
        }

        const data = response.data || response;

        if (data && data.financials && data.financials.totals && data.financials.totals.total) {
            const prixEuroFormat = data.financials.totals.total.formatted;
            const prixCentimes = data.financials.totals.total.amount;
            
            const prixEuroVal = prixCentimes / 100;
            const prixDZD = Math.round(prixEuroVal * TAUX_CHANGE_DZD);
            const prixDzdFormate = prixDZD.toLocaleString('fr-FR') + " DA";
            
            const prixFinal = \`\${prixEuroFormat} (soit \${prixDzdFormate})\`;
            // C'EST CE LIEN QUE L'IA DOIT UTILISER :
            let lienDirect = data.booking_url || "";
            if (lienDirect && originalIds[i] && originalIds[i].json) {
                let start = originalIds[i].json.start_date;
                let end = originalIds[i].json.end_date;
                let guests = originalIds[i].json.guests;
                if (!lienDirect.includes("check_in")) {
                    const sep = lienDirect.includes("?") ? "&" : "?";
                    lienDirect += \`\${sep}check_in=\${start}&check_out=\${end}&guests=\${guests}\`;
                // No extra params — Hospitable booking page only supports check_in, check_out, guests
                }
            } 

            const propertyName = originalIds[i].json.Nom || property_id;
            const propertyCapacite = originalIds[i].json.Capacite || "N/A";
            const propertyDescription = originalIds[i].json.Description_Courte || "";
            results.push({ 
                json: { 
                    result: \`[**\${propertyName}**] -> STATUT: DISPONIBLE | PRIX: \${prixFinal} | CAPACITÉ: \${propertyCapacite} | DESCRIPTION: \${propertyDescription} | LIEN: \${lienDirect}\`,
                    propertyName: propertyName
                } 
            });
        } else {
            results.push({ json: { result: \`ID: \${property_id} -> STATUT: INDISPONIBLE\` } });
        }
    }

    return results;

} catch (error) {
    // Si le code plante, n8n ne crashera pas, il enverra ça à l'IA :
    return [{ json: { result: "ERREUR CRITIQUE DANS L'ANALYSE: " + error.message } }];
}`,
    };

    @node({
        id: 'aed66587-75f4-43d2-87bd-0fa0e717563b',
        name: 'API Quote Hospitable1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-240, -620],
        credentials: { httpHeaderAuth: { id: 'fWa7mv4OTPOJ9HRv', name: 'Header Auth account' } },
        onError: 'continueRegularOutput',
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 5000,
    })
    ApiQuoteHospitable1 = {
        method: 'POST',
        url: "={{ 'https://public.api.hospitable.com/v2/properties/' + $json.property_id + '/quote' }}",
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody:
            '={{ { "checkin_date": $json.start_date, "checkout_date": $json.end_date, "guests": { "adults": $json.guests, "children": 0, "infants": 0, "pets": 0 } } }}',
        options: {
            batching: {
                batch: {
                    batchSize: 1,
                    batchInterval: 4000,
                },
            },
            response: {
                response: {
                    neverError: true,
                },
            },
        },
    };

    @node({
        id: 'c7b8e794-9f3e-4a1d-81d0-3cb8a8904ebe',
        name: 'Merge Results',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [180, -600],
    })
    MergeResults = {
        jsCode: `// Récupère la page calculée par le noeud 'Calculate Page'
const page = parseInt($('Calculate Page').first().json.pageToUse) || 1;
const PAGE_SIZE = 3;

// Combine tous les résultats DISPONIBLES et les trie par Nom pour garantir un ordre 100% déterministe
const allResults = $input.all()
    .map(item => item.json)
    .filter(r => r.result && r.result.includes('STATUT: DISPONIBLE'))
    .sort((a, b) => a.propertyName.localeCompare(b.propertyName))
    .map(item => item.result);

// Calcule les indices de pagination
const startIdx = (page - 1) * PAGE_SIZE;
const endIdx = startIdx + PAGE_SIZE;
const pageResults = allResults.slice(startIdx, endIdx);
const totalAvailable = allResults.length;
const remaining = Math.max(0, totalAvailable - endIdx);

// Si cette page est vide → aucune nouvelle option
if (pageResults.length === 0) {
    return [{ json: { result: "AUCUNE_NOUVELLE_OPTION - Tous les appartements disponibles ont déjà été présentés." } }];
}

const combinedResults = pageResults.join('\\n\\n');
const suffix = remaining > 0 
    ? \`\\n\\n[INFO: Il reste \${remaining} appartement(s) disponible(s) non encore présenté(s). L'IA a affiché la page \${page}. (NE LUI DIS PAS QU'IL RESTE DES OPTIONS SI LE CLIENT NE DEMANDE PAS)]\`
    : \`\\n\\n⛔ [INFO: Ce sont tous les appartements disponibles pour ces dates. NE RAPPELLE PAS CET OUTIL. Dis au client que toutes les options ont été présentées.]\`;

return [{ json: { result: combinedResults + suffix } }];`,
    };

    @node({
        id: 'd5da689a-a9b8-4a5d-a6d7-2c8dc86fb902',
        name: 'Lire Google Sheets',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [-700, -560],
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
        id: 'format-sheets-data',
        name: 'Format Sheets Data',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-480, -600],
    })
    FormatSheetsData = {
        jsCode: `const triggerData = $('When Executed by Another Workflow').first().json;
const actualData = triggerData.query ? triggerData.query : triggerData;

return $input.all().map(item => {
    const r = item.json;
    return {
        json: {
            ...r,
            property_id: r.Property_ID,
            start_date: actualData.start_date,
            end_date: actualData.end_date,
            guests: actualData.guests
        }
    };
}).filter(i => i.json.property_id);`,
    };

    @node({
        id: 'f9a78bad-6548-42cb-ab70-8cbc3509b9e5',
        name: 'Scrape DeviseSquare',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-880, -480],
        onError: 'continueRegularOutput',
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    ScrapeDevisesquare = {
        url: 'https://devisesquare.com/',
        options: {
            response: {
                response: {
                    responseFormat: 'text',
                },
            },
        },
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WhenExecutedByAnotherWorkflow.out(0).to(this.RedisGetPagination.in(0));
        this.RedisGetPagination.out(0).to(this.CalculatePage.in(0));
        this.CalculatePage.out(0).to(this.RedisSetPagination.in(0));
        this.RedisSetPagination.out(0).to(this.ScrapeDevisesquare.in(0));
        this.AnalyserLeDevis.out(0).to(this.MergeResults.in(0));
        this.ApiQuoteHospitable1.out(0).to(this.AnalyserLeDevis.in(0));
        this.LireGoogleSheets.out(0).to(this.FormatSheetsData.in(0));
        this.FormatSheetsData.out(0).to(this.ApiQuoteHospitable1.in(0));
        this.ScrapeDevisesquare.out(0).to(this.LireGoogleSheets.in(0));
    }
}
