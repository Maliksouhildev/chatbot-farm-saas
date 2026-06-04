import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : wsp ; crm export
// Nodes   : 14  |  Connections: 15
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// ReponsePourIa                      code
// CreerContactHubspot1               hubspot                    [creds]
// PrepWipeKeys                       code
// RedisWipeSystem                    redis                      [creds]
// WhenExecutedByAnotherWorkflow      executeWorkflowTrigger
// ParseArray                         code
// SplitPhotosForUpload               code
// HasPhotos                          if
// TransferImageToCrm                 executeWorkflow            [onError→regular]
// GroupAndFormatApartments           code
// RedisGetState                      redis                      [creds]
// MergeWithRedisState                code
// CheckPhotosBeforeExport            code
// IsExportAllowed                    if
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WhenExecutedByAnotherWorkflow
//    → RedisGetState
//      → MergeWithRedisState
//        → CheckPhotosBeforeExport
//          → IsExportAllowed
//            → ReponsePourIa
//           .out(1) → ParseArray
//              → SplitPhotosForUpload
//                → HasPhotos
//                  → TransferImageToCrm
//                    → GroupAndFormatApartments
//                      → CreerContactHubspot1
//                        → PrepWipeKeys
//                          → RedisWipeSystem
//                            → ReponsePourIa (↩ loop)
//                 .out(1) → GroupAndFormatApartments (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'XzQzgGQcUDzXWC1s',
    name: 'wsp ; crm export',
    active: false,
    projectId: 'eN0JyhHFEkunAK7Y',
    settings: { executionOrder: 'v1' },
})
export class WspCrmExportWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '62776847-4681-4ec4-9957-f1a0ea5787dc',
        name: 'Réponse pour IA',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [900, 780],
    })
    ReponsePourIa = {
        jsCode: `
const input = $input.first().json;
if (input.blocked) {
    return [{ json: { output: 'Export bloqué : ' + input.blocking_reason } }];
}
return [{ json: { output: 'Dossiers transmis avec succès à léquipe Le Bardo !' } }];`,
    };

    @node({
        id: 'c76a39ac-de12-4823-8c29-786e8708d67c',
        name: 'Créer Contact HubSpot1',
        type: 'n8n-nodes-base.hubspot',
        version: 2,
        position: [700, 400],
        credentials: { hubspotAppToken: { id: '5HBUs8WG3nCRPWi0', name: 'HubSpot account' } },
    })
    CreerContactHubspot1 = {
        authentication: 'appToken',
        email: "={{ $json.phone + '-apt' + ($json.appt_id ?? 0) }}@prospect-bardo.com",
        additionalFields: {
            city: '={{ $json.ville_quartier }}',
            message: `=📊 RAPPORT D'ÉVALUATION - CONCIERGERIE LE BARDO 📊

👤 PROFIL CLIENT
- Nom : {{ $json.nom_client || 'Non renseigné' }}
- Téléphone : +{{ $json.phone }}

🏠 CARACTÉRISTIQUES DU BIEN
- Localisation : {{ $json.ville_quartier }}
- Surface validée : {{ $json.surface }}

📋 ANALYSE DU DOSSIER
- Situation actuelle : {{ $json.situation_actuelle }}
- Timing & État estimé : {{ $json.timing_et_etat }}
- Disponibilité : {{ $json.disponibilite_annuelle }}

⭐ SCORE DE QUALIFICATION IA : {{ $json.score_sur_5 }}/5

📸 PHOTOS DU BIEN :
{{ $json.liens_photos || 'Aucune photo reçue' }}
📨 Photos transmises en direct vers le téléphone admin.`,
        },
        options: {},
    };

    @node({
        id: '2bac135b-ac92-4af3-bbd0-03985922df30',
        name: 'Prep Wipe Keys',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [900, 400],
    })
    PrepWipeKeys = {
        jsCode: `const t = $('When Executed by Another Workflow').first().json;
const phone = t.phone || '';
return [
  { json: { key_to_delete: 'photo_urls_' + phone } },
  { json: { key_to_delete: 'vision_batch_' + phone } },
  { json: { key_to_delete: 'photo_count_' + phone } },
  { json: { key_to_delete: 'bot_context_' + phone } },
  { json: { key_to_delete: 'appts_state_' + phone } },
  { json: { key_to_delete: 'lang_stats_' + phone } },
  { json: { key_to_delete: 'user_lang_' + phone } }
];`,
    };

    @node({
        id: '01789c24-84a2-4630-bd1f-f56a2f3253a8',
        name: 'Redis Wipe System',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [1100, 400],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisWipeSystem = {
        operation: 'delete',
        key: '={{ $json.key_to_delete }}',
    };

    @node({
        id: 'a2db89ee-8537-4505-86d7-717dbb922ed9',
        name: 'When Executed by Another Workflow',
        type: 'n8n-nodes-base.executeWorkflowTrigger',
        version: 1.1,
        position: [-2520, 220],
    })
    WhenExecutedByAnotherWorkflow = {
        workflowInputs: {
            values: [
                {
                    name: 'liste_appartements_json',
                },
                {
                    name: 'phone',
                },
                {
                    name: 'nom_client',
                },
                {
                    name: 'liens_photos',
                },
            ],
        },
    };

    @node({
        id: '3ff98b77-8562-4458-88ed-a06fa8eb9065',
        name: 'Parse Array',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-720, 340],
    })
    ParseArray = {
        jsCode: `
const t = $('Merge With Redis State').first().json;
let appartements = [];

try {
  appartements = JSON.parse(t.liste_appartements_json);
  if (!Array.isArray(appartements)) appartements = [appartements];
} catch(e) {
  appartements = [{
    ville_quartier: 'Erreur Parsing JSON',
    surface: '',
    nombre_pieces: '',
    date_disponibilite: '',
    loyer_souhaite: 'Data brute: ' + t.liste_appartements_json
  }];
}

// Split photos per apartment
const allPhotoUrls = (t.liens_photos || '')
    .split('\\n')
    .map(u => u.trim())
    .filter(u => u.startsWith('http') && u.length > 10);

const totalPhotos = allPhotoUrls.length;
const totalApts = appartements.length;

let photoOffset = 0;
const aptPhotoSlices = appartements.map((apt, idx) => {
    const count = apt.photo_count || Math.ceil(totalPhotos / totalApts);
    const slice = allPhotoUrls.slice(photoOffset, photoOffset + count);
    photoOffset += count;
    return slice;
});

const allItems = appartements.map((apt, idx) => ({
  json: {
    phone: t.phone || '',
    nom_client: t.nom_client || 'Non renseigné',
    liens_photos: aptPhotoSlices[idx].join('\\n') || 'Aucune photo reçue',
    ville_quartier: apt.ville_quartier || '',
    surface: String(apt.surface || ''),
    situation_actuelle: String(apt.nombre_pieces || apt.situation_actuelle || ''),
    disponibilite_annuelle: String(apt.date_disponibilite || apt.disponibilite_annuelle || ''),
    timing_et_etat: String(apt.loyer_souhaite || apt.timing_et_etat || ''),
    score_sur_5: '5',
    appt_id: idx
  }
}));

// ⛔ COMPLETENESS FILTER: Skip apartments with no location or no surface
// These are ghost records submitted before the user provided info
const complete = allItems.filter(item => {
  const a = item.json;
  const hasLocation = a.ville_quartier && a.ville_quartier.trim().length > 1;
  const hasSize = a.surface && a.surface.trim().length > 0;
  return hasLocation && hasSize;
});

if (complete.length === 0) {
  // Nothing complete to export — still return one item but flag it
  return [{ json: { ...allItems[0]?.json, _skipped: true, _reason: 'No complete apartments to export' } }];
}

return complete;
`,
    };

    @node({
        id: '0c7b7dcf-5e3c-4b8c-9cf2-07ccbc9b708c',
        name: 'Split Photos for Upload',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-520, 340],
    })
    SplitPhotosForUpload = {
        jsCode: `// Skip if marked as incomplete by Parse Array
const items = $input.all();
if (items[0]?.json?._skipped) {
  // Return empty to stop flow — no photos to process
  return [];
}

const out = [];
let idCounter = 0;
for (const item of $input.all()) {
    const apt = item.json;
    apt.appt_id = idCounter++;
    
    let urls = apt.liens_photos ? apt.liens_photos.split('\\n') : [];
    let hasUploads = false;
    
    for (const u of urls) {
        if (u.trim().length > 10 && u.startsWith('http')) {
            const copy = Object.assign({}, apt);
            copy.url = u.trim();
            out.push({json: copy});
            hasUploads = true;
        }
    }
    
    if (!hasUploads) {
        const copy = Object.assign({}, apt);
        copy.url = "AUCUNE_PHOTO";
        out.push({json: copy});
    }
}
return out;`,
    };

    @node({
        id: 'c8a010ba-1ddc-4a61-8d26-777b49c0d857',
        name: 'Has Photos?',
        type: 'n8n-nodes-base.if',
        version: 1,
        position: [-360, 340],
    })
    HasPhotos = {
        conditions: {
            string: [
                {
                    value1: '={{ $json.url }}',
                    operation: 'notEqual',
                    value2: 'AUCUNE_PHOTO',
                },
            ],
        },
    };

    @node({
        id: 'c5a5af3a-7089-4abd-8a79-811f778c9bf6',
        name: 'Transfer Image to CRM',
        type: 'n8n-nodes-base.executeWorkflow',
        version: 1,
        position: [-220, 120],
        onError: 'continueRegularOutput',
    })
    TransferImageToCrm = {
        workflowId: 'Y7882xaNB7Va89QS',
        mode: 'each',
        options: {},
    };

    @node({
        id: 'ee2d34e5-9137-489c-93ab-a7bbdb4e718a',
        name: 'Group and Format Apartments',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [0, 0],
    })
    GroupAndFormatApartments = {
        jsCode: `
const grouped = {};
for (const item of $input.all()) {
    const apt = item.json;
    const id = apt.appt_id || 0;
    
    if (!grouped[id]) {
        // Clone the original properties
        grouped[id] = Object.assign({}, apt);
        grouped[id].publicLinks = [];
    }
    
    if (apt.hubspot_url && apt.hubspot_url.startsWith('http')) {
        grouped[id].publicLinks.push(apt.hubspot_url);
    }
}

const out = [];
for (const id in grouped) {
    const apt = grouped[id];
    apt.liens_photos = apt.publicLinks.length > 0 ? apt.publicLinks.join('\\n') : 'Aucune photo téléchargée.';
    
    // Cleanup temporary fields
    delete apt.url;
    delete apt.hubspot_url;
    delete apt.publicLinks;
    
    out.push({ json: apt });
}
return out;
`,
    };

    @node({
        id: 'c6537e94-bfc1-4b88-b703-fa32ee828830',
        name: 'Redis Get State',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [-1920, 180],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisGetState = {
        operation: 'get',
        key: "=appts_state_{{ $('When Executed by Another Workflow').first().json.phone }}",
        options: {},
    };

    @node({
        id: '32679863-3c09-43f1-b518-436d926862ee',
        name: 'Merge With Redis State',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1720, 180],
    })
    MergeWithRedisState = {
        jsCode: `
const trigger = $('When Executed by Another Workflow').first().json;
let redisStateStr = $input.first().json.value || null;

// If Redis has the state, use it. Otherwise fall back to what the AI sent.
let finalAppts = trigger.liste_appartements_json;
if (redisStateStr && redisStateStr.startsWith('[')) {
    finalAppts = redisStateStr;
}

return [{
    json: {
        phone: trigger.phone || '',
        nom_client: trigger.nom_client || 'Non renseigné',
        liens_photos: trigger.liens_photos || 'Aucune photo reçue',
        liste_appartements_json: finalAppts
    }
}];`,
    };

    @node({
        id: 'bf1ad426-88d1-41b5-9da7-9a4fe5109844',
        name: 'Check Photos Before Export',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [-1400, 240],
    })
    CheckPhotosBeforeExport = {
        jsCode: `
const trigger = $('When Executed by Another Workflow').first().json;
let appts = [];
try {
    appts = JSON.parse(trigger.liste_appartements_json || '[]');
} catch(e) {
    appts = $input.all().map(i => i.json).filter(j => j.id !== undefined);
}

// Check if liens_photos from trigger has actual photo URLs
const liensPhotos = trigger.liens_photos || "";
const hasRealPhotoUrls = liensPhotos.includes("http") && 
                          !liensPhotos.includes("Aucune");

// Block export if ANY apartment is missing photos AND no photos were provided via liens_photos
const missingPhotos = appts.filter(apt => {
    // Accept photos_transmises:true OR actual photo URLs in liens_photos
    return apt.photos_transmises !== true && !hasRealPhotoUrls;
});

if (missingPhotos.length > 0) {
    const villes = missingPhotos.map(a => a.ville_quartier || 'inconnu').join(', ');
    return [{ json: { ...trigger, blocked: true, blocking_reason: 'Photos manquantes pour : ' + villes } }];
}

// Mark all apartments as having photos (using liens_photos as source of truth)
appts = appts.map(apt => ({ ...apt, photos_transmises: true }));

return [{ json: { ...trigger, blocked: false, liste_appartements_json: JSON.stringify(appts) } }];
`,
    };

    @node({
        id: '2b526274-d5ca-4a78-95da-054a18c5dd2a',
        name: 'Is Export Allowed?',
        type: 'n8n-nodes-base.if',
        version: 2,
        position: [-1200, 240],
    })
    IsExportAllowed = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
            },
            conditions: [
                {
                    leftValue: '={{ $json.blocked }}',
                    rightValue: true,
                    operator: {
                        type: 'boolean',
                        operation: 'equals',
                    },
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
        this.CreerContactHubspot1.out(0).to(this.PrepWipeKeys.in(0));
        this.PrepWipeKeys.out(0).to(this.RedisWipeSystem.in(0));
        this.RedisWipeSystem.out(0).to(this.ReponsePourIa.in(0));
        this.WhenExecutedByAnotherWorkflow.out(0).to(this.RedisGetState.in(0));
        this.ParseArray.out(0).to(this.SplitPhotosForUpload.in(0));
        this.SplitPhotosForUpload.out(0).to(this.HasPhotos.in(0));
        this.HasPhotos.out(0).to(this.TransferImageToCrm.in(0));
        this.HasPhotos.out(1).to(this.GroupAndFormatApartments.in(0));
        this.TransferImageToCrm.out(0).to(this.GroupAndFormatApartments.in(0));
        this.GroupAndFormatApartments.out(0).to(this.CreerContactHubspot1.in(0));
        this.RedisGetState.out(0).to(this.MergeWithRedisState.in(0));
        this.MergeWithRedisState.out(0).to(this.CheckPhotosBeforeExport.in(0));
        this.CheckPhotosBeforeExport.out(0).to(this.IsExportAllowed.in(0));
        this.IsExportAllowed.out(0).to(this.ReponsePourIa.in(0));
        this.IsExportAllowed.out(1).to(this.ParseArray.in(0));
    }
}
