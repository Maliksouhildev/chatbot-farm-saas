import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : wsp : dispo
// Nodes   : 6  |  Connections: 5
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WhenExecutedByAnotherWorkflow      executeWorkflowTrigger
// AnalyserLeDevis                    code
// ApiQuoteHospitable1                httpRequest                [onError→regular] [creds] [retry]
// MergeResults                       code
// SplitIds                           code
// ScrapeDevisesquare                 httpRequest                [onError→regular] [retry]
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WhenExecutedByAnotherWorkflow
//    → ScrapeDevisesquare
//      → SplitIds
//        → ApiQuoteHospitable1
//          → AnalyserLeDevis
//            → MergeResults
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'cpUwDbRPuJNAwpeM',
    name: 'wsp : dispo',
    active: false,
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
        position: [-1180, -520],
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
    const originalIds = $('Split IDs').all();

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

            results.push({ 
                json: { 
                    result: \`ID: \${property_id} -> STATUT: DISPONIBLE | PRIX: \${prixFinal} | LIEN HOSPITABLE: \${lienDirect}\` 
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
        position: [-260, -520],
        credentials: { httpHeaderAuth: { id: 'fWa7mv4OTPOJ9HRv', name: 'Header Auth account' } },
        onError: 'continueRegularOutput',
        retryOnFail: true,
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
        jsCode: `// Récupère les données du trigger pour la pagination
const triggerData = $('When Executed by Another Workflow').first().json;
const actualData = triggerData.query ? triggerData.query : triggerData;
const page = parseInt(actualData.page) || 1;
const PAGE_SIZE = 3;

// Combine tous les résultats DISPONIBLES
const allResults = $input.all()
    .map(item => item.json.result)
    .filter(r => r && r.includes('STATUT: DISPONIBLE'));

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
    ? \`\\n\\n[INFO: Il reste \${remaining} appartement(s) disponible(s) non encore présenté(s). L'IA peut demander page=\${page + 1} pour les voir.]\`
    : \`\\n\\n⛔ [INFO: Ce sont tous les appartements disponibles pour ces dates. NE RAPPELLE PAS CET OUTIL. Dis au client que toutes les options ont été présentées.]\`;

return [{ json: { result: combinedResults + suffix } }];`,
    };

    @node({
        id: '38fb03d3-73c5-410e-bc20-c5956c923951',
        name: 'Split IDs',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-740, -520],
    })
    SplitIds = {
        jsCode: `const triggerData = $('When Executed by Another Workflow').first().json;
const actualData = triggerData.query ? triggerData.query : triggerData;

// CATALOGUE COMPLET — toujours utilisé pour garantir une recherche exhaustive
// L'IA peut passer n'importe quoi dans property_ids, on ignore et on cherche sur tout le catalogue
const CATALOGUE_COMPLET = "0e4dea37-7994-46d6-beab-67efe3499f5b,ed2e6d1d-0975-46ac-8dec-8d1885500112,d7979f36-0a9d-4380-bd2f-5dbd011ef55b,83216c4b-8612-4d0a-8da8-ea50f181a27b,4b6389a0-2672-4054-aa3e-3bd6847827de,11ae3d86-a80d-49fd-865a-69dd4d3576e7,12951e63-841e-41c5-a200-d24a485e0704,3d9dfb16-f4e6-41b5-834d-e6f1a2f3fd1b,41498064-88b5-4d25-a8e5-ce58be68c813,ba397f86-bcb2-4443-add2-cfb58ab6c418,f6c5de4e-46a4-4193-a072-14d7883f2fbc,0692ebed-1f44-4cfc-98a2-1364603bb05d,bd66df5b-1ddf-44a0-bd48-85eca8edd452,7b792df1-6fb3-47ec-87c4-b69c382584fb,907d81f3-9160-4dcb-8767-94e85662ef61";

const ids = CATALOGUE_COMPLET.split(',');

return ids.map(id => ({
    json: {
        property_id: id.trim(),
        start_date: actualData.start_date,
        end_date: actualData.end_date,
        guests: actualData.guests
    }
}));`,
    };

    @node({
        id: 'f9a78bad-6548-42cb-ab70-8cbc3509b9e5',
        name: 'Scrape DeviseSquare',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-960, -520],
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
        this.WhenExecutedByAnotherWorkflow.out(0).to(this.ScrapeDevisesquare.in(0));
        this.AnalyserLeDevis.out(0).to(this.MergeResults.in(0));
        this.ApiQuoteHospitable1.out(0).to(this.AnalyserLeDevis.in(0));
        this.SplitIds.out(0).to(this.ApiQuoteHospitable1.in(0));
        this.ScrapeDevisesquare.out(0).to(this.SplitIds.in(0));
    }
}
