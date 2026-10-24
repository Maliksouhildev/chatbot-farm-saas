import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : wsp : sync hospitable
// Nodes   : 13  |  Connections: 11
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WhenExecutedByAnotherWorkflow      executeWorkflowTrigger
// PreparerDevis                      code
// AnalyserLeDevis                    code
// ApiQuoteHospitable1                httpRequest                [creds] [retry]
// RecupererProprietesHospitable      httpRequest                [creds] [retry]
// FormaterPourRedis                  code
// ScheduleTrigger                    scheduleTrigger
// AggregateProperties                aggregate
// BuildCatalogueJson                 code
// RedisSetCatalogue                  redis                      [creds]
// RedisGetCatalogue                  redis                      [creds]
// FormatCatalogueForAi               code
// RouteQuoteVsCatalogue              if
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WhenExecutedByAnotherWorkflow
//    → RouteQuoteVsCatalogue
//      → PreparerDevis
//        → ApiQuoteHospitable1
//          → AnalyserLeDevis
//     .out(1) → RedisGetCatalogue
//        → FormatCatalogueForAi
// ScheduleTrigger
//    → RecupererProprietesHospitable
//      → FormaterPourRedis
//        → AggregateProperties
//          → BuildCatalogueJson
//            → RedisSetCatalogue
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: '98tKzbQKf8cbknW2',
    name: 'wsp : sync hospitable',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class WspSyncHospitableWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '2212efde-ca59-4482-876e-4e3644483dab',
        name: 'When Executed by Another Workflow',
        type: 'n8n-nodes-base.executeWorkflowTrigger',
        version: 1.1,
        position: [-260, 340],
    })
    WhenExecutedByAnotherWorkflow = {
        workflowInputs: {
            values: [
                {
                    name: 'query',
                },
            ],
        },
    };

    @node({
        id: '4b2c3f49-f888-4070-af89-c85b400dfd24',
        name: 'Préparer Devis',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [40, 420],
    })
    PreparerDevis = {
        jsCode: `let rawQuery = $json.query || "";
let data = {};

try {
  // On tente de réparer le JSON s'il manque des guillemets ou des accolades à la fin
  if (rawQuery.includes('{') && !rawQuery.includes('}')) {
    rawQuery += '"}'; 
  }
  data = JSON.parse(rawQuery);
} catch (e) {
  // Si c'est vraiment illisible, on renvoie des valeurs vides pour éviter l'erreur 500
  data = {};
}

return {
  property_id: data.property_id || "",
  start_date: data.start_date || "",
  end_date: data.end_date || "",
  guests: data.guests || 1
};`,
    };

    @node({
        id: '14331d8d-3a74-4ada-9c41-9d45b5527344',
        name: 'Analyser le Devis',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [440, 260],
    })
    AnalyserLeDevis = {
        jsCode: `const response = $input.first().json;

// 1. Si Hospitable renvoie une erreur (occupé, mauvaises dates, faux ID)
if (response.error || response.status_code || response.message) {
    return [{ json: { result: "NON DISPONIBLE : L'appartement est occupé à ces dates." } }];
}

// 2. Si succès, on extrait les données de la nouvelle structure V2
const data = response.data || response;

if (data && data.financials && data.financials.totals && data.financials.totals.total) {
    // On récupère le prix déjà formaté avec la devise (ex: "€167.00")
    const prixTotal = data.financials.totals.total.formatted;
    
    // On récupère le lien de paiement direct généré par Hospitable
    const lienDirect = data.booking_url || "";

    return [{ 
        json: { 
            result: \`DISPONIBLE. Le prix total exact du séjour est de : \${prixTotal}. Le lien de réservation direct pour ces dates est : \${lienDirect}\` 
        } 
    }];
}

// Sécurité par défaut
return [{ json: { result: "NON DISPONIBLE." } }];`,
    };

    @node({
        id: '7a3f7e0d-694e-4ac9-9ba2-c67142a2e7b7',
        name: 'API Quote Hospitable1',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [220, 340],
        credentials: { httpHeaderAuth: { id: 'fWa7mv4OTPOJ9HRv', name: 'Header Auth account' } },
        retryOnFail: true,
        maxTries: 5,
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
            response: {
                response: {
                    neverError: true,
                },
            },
        },
    };

    @node({
        id: 'a6316121-544e-446e-929d-1349b6043b72',
        name: 'Récupérer Propriétés Hospitable',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [-560, 80],
        credentials: { httpHeaderAuth: { id: 'fWa7mv4OTPOJ9HRv', name: 'Header Auth account' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    RecupererProprietesHospitable = {
        url: 'https://public.api.hospitable.com/v2/properties?per_page=100',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        options: {},
    };

    @node({
        id: 'c2482c73-70ce-460f-8d45-1ed350bf715f',
        name: 'Formater pour Redis',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-300, 60],
    })
    FormaterPourRedis = {
        jsCode: `
const properties = $input.first().json.data || [];

const translateAmenity = (am) => {
    const dict = {
        "wifi": "WiFi", "ac": "Climatisation", "free_on_premise_parking": "Parking Gratuit",
        "kitchen": "Cuisine", "tv": "Télévision", "washer": "Lave-linge", "heating": "Chauffage",
        "beach_access": "Accès Plage", "pool": "Piscine", "elevator": "Ascenseur"
    };
    return dict[am] || am;
};

return properties.map(p => {
  const nomAffichage = p.public_name || p.name || "";
  
  let imageUrl = p.picture || "Pas d'image";
  if (imageUrl.includes("?")) imageUrl = imageUrl.split("?")[0];

  let prix = "Sur demande";
  if (p.base_price) {
      prix = p.base_price + (p.currency ? " " + p.currency : " DZD");
  } else if (p.pricing && p.pricing.base_price) {
      prix = p.pricing.base_price + " DZD";
  }

  let equipementsStr = "";
  if (p.amenities && Array.isArray(p.amenities)) {
      const topAmenities = p.amenities.filter(a => ["wifi", "ac", "free_on_premise_parking", "kitchen", "tv", "washer", "beach_access", "elevator"].includes(a));
      if (topAmenities.length > 0) {
          equipementsStr = " | Équipements: " + topAmenities.map(translateAmenity).join(', ');
      }
  }

  let rulesString = p.house_rules ? JSON.stringify(p.house_rules) : "Aucune";
  let checkinInfos = \`Check-in: \${p.checkin || '15:00'} | Check-out: \${p.checkout || '10:00'}\`;

  // THE MAGIC FIX: We append rules and checkin directly to Description_Courte
  // so the AI definitely sees it even if it only reads the Description column!
  let descriptionComplete = (p.summary ? p.summary.substring(0, 200) + "..." : "Pas de description") 
        + equipementsStr 
        + " | RÈGLES ET ANIMAUX: " + rulesString 
        + " | HORAIRES: " + checkinInfos;

  return {
    json: {
      Property_ID: p.id,
      Nom: nomAffichage,
      Ville_Quartier: p.address ? p.address.city : "Non défini",
      Capacite: p.capacity ? p.capacity.max : 0,
      Description_Courte: descriptionComplete,
      Image_URL: imageUrl,
      Prix_Nuit: prix,
      informations: rulesString // Keep to not break existing schema if needed
    }
  };
});
`,
    };

    @node({
        id: 'b9a1955f-0f4f-4f8e-b578-144b519b7a5f',
        name: 'Schedule Trigger',
        type: 'n8n-nodes-base.scheduleTrigger',
        version: 1.2,
        position: [-780, 100],
    })
    ScheduleTrigger = {
        rule: {
            interval: [
                {
                    triggerAtHour: 12,
                },
            ],
        },
    };

    @node({
        id: 'b5b845ae-fbc1-4fc1-ae64-1ef05b2082b8',
        name: 'Aggregate Properties',
        type: 'n8n-nodes-base.aggregate',
        version: 1,
        position: [0, 0],
    })
    AggregateProperties = {
        aggregate: 'aggregateAllItemData',
        destinationFieldName: 'all_properties',
        options: {},
    };

    @node({
        id: '989b8484-8f65-4175-af26-22f6269ee565',
        name: 'Build Catalogue JSON',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [220, 0],
    })
    BuildCatalogueJson = {
        jsCode: `const items = $input.first().json.all_properties || [];
return [{ json: { catalogue_json: JSON.stringify(items) } }];`,
    };

    @node({
        id: 'fecb9b95-1de8-483b-9b95-a74fdd846b6e',
        name: 'Redis SET Catalogue',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [440, 0],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisSetCatalogue = {
        operation: 'set',
        key: 'catalogue_hospitable',
        value: '={{ $json.catalogue_json }}',
    };

    @node({
        id: '75a8c427-f956-4d34-9da4-8425124e2dd6',
        name: 'Redis GET Catalogue',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [620, 620],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisGetCatalogue = {
        operation: 'get',
        key: 'catalogue_hospitable',
        options: {},
    };

    @node({
        id: 'eedb9008-31ee-4cca-92c1-1f3599c99eec',
        name: 'Format Catalogue for AI',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [880, 580],
    })
    FormatCatalogueForAi = {
        jsCode: `const raw = $input.first().json;
const catalogueStr = Object.values(raw)[0] || '[]';
let properties = [];
try { properties = JSON.parse(catalogueStr); } catch(e) {}

const query = ($('When Executed by Another Workflow').first().json.property_name || '').toLowerCase().trim();

let filtered = properties;
if (query) {
    filtered = properties.filter(p => 
        (p.Nom || '').toLowerCase().includes(query) ||
        (p.Ville_Quartier || '').toLowerCase().includes(query)
    );
}

if (filtered.length === 0) filtered = properties;

const result = filtered.map(p => 
    \`ID: \${p.Property_ID} | \${p.Nom} | \${p.Ville_Quartier} | Capacité: \${p.Capacite} | Prix: \${p.Prix_Nuit}\\n\${p.Description_Courte}\`
).join('\\n\\n---\\n\\n');

return [{ json: { result: result || 'Catalogue vide.' } }];`,
    };

    @node({
        id: 'b7f3e1b4-2549-4474-8c32-d853119e9483',
        name: 'Route: Quote vs Catalogue',
        type: 'n8n-nodes-base.if',
        version: 2,
        position: [-100, 540],
    })
    RouteQuoteVsCatalogue = {
        conditions: {
            options: {
                caseSensitive: false,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    leftValue:
                        "={{ $json.query ? ($json.query.includes('property_id') ? 'quote' : 'catalogue') : 'catalogue' }}",
                    rightValue: 'quote',
                    operator: {
                        type: 'string',
                        operation: 'equals',
                    },
                    id: '11111111-2222-3333-4444-555555555555',
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WhenExecutedByAnotherWorkflow.out(0).to(this.RouteQuoteVsCatalogue.in(0));
        this.RouteQuoteVsCatalogue.out(0).to(this.PreparerDevis.in(0));
        this.RouteQuoteVsCatalogue.out(1).to(this.RedisGetCatalogue.in(0));
        this.PreparerDevis.out(0).to(this.ApiQuoteHospitable1.in(0));
        this.ApiQuoteHospitable1.out(0).to(this.AnalyserLeDevis.in(0));
        this.RedisGetCatalogue.out(0).to(this.FormatCatalogueForAi.in(0));
        this.ScheduleTrigger.out(0).to(this.RecupererProprietesHospitable.in(0));
        this.RecupererProprietesHospitable.out(0).to(this.FormaterPourRedis.in(0));
        this.FormaterPourRedis.out(0).to(this.AggregateProperties.in(0));
        this.AggregateProperties.out(0).to(this.BuildCatalogueJson.in(0));
        this.BuildCatalogueJson.out(0).to(this.RedisSetCatalogue.in(0));
    }
}
