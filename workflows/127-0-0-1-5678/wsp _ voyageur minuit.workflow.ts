import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : wsp : voyageur minuit
// Nodes   : 9  |  Connections: 7
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// RecupererVoyageursHospitable       httpRequest                [retry]
// SeparerVoyageurs                   itemLists
// GoogleSheets                       googleSheets
// _1RecupererProprietes              httpRequest                [retry]
// _2SeparerProprietes                itemLists
// _3RecupererReservationsParAppart   httpRequest                [retry]
// _4ExtraireVoyageursPropres         code
// _5GoogleSheets                     googleSheets
// TousLesJoursAMinuit1               scheduleTrigger
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// RecupererVoyageursHospitable
//    → SeparerVoyageurs
//      → GoogleSheets
// TousLesJoursAMinuit1
//    → _1RecupererProprietes
//      → _2SeparerProprietes
//        → _3RecupererReservationsParAppart
//          → _4ExtraireVoyageursPropres
//            → _5GoogleSheets
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'Q9RPfSgvQUM31ctS',
    name: 'wsp : voyageur minuit',
    active: false,
    settings: { executionOrder: 'v1' },
})
export class WspVoyageurMinuitWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '089c0d04-624f-41c3-9450-4f9dba4e8feb',
        name: 'Récupérer Voyageurs Hospitable',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [1160, 0],
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    RecupererVoyageursHospitable = {
        url: 'https://public.api.hospitable.com/v2/guests',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        options: {},
    };

    @node({
        id: 'acbcf083-8c39-43e6-979a-57398162b3a5',
        name: 'Séparer Voyageurs',
        type: 'n8n-nodes-base.itemLists',
        version: 3,
        position: [1360, 0],
    })
    SeparerVoyageurs = {
        fieldToSplitOut: 'data',
        options: {},
    };

    @node({
        id: 'c9edb195-2862-4ea9-b884-b85f74bb9810',
        name: 'Google Sheets',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [1020, 180],
    })
    GoogleSheets = {
        operation: 'appendOrUpdate',
        documentId: {
            __rl: true,
            value: '1CPcdn76Q-p5Xba1SU9HDHyaZUezeqpS5R25OaNAZ0YE',
            mode: 'list',
            cachedResultName: 'crm temporaire voyageur ',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1CPcdn76Q-p5Xba1SU9HDHyaZUezeqpS5R25OaNAZ0YE/edit?usp=drivesdk',
        },
        sheetName: {
            __rl: true,
            value: 'gid=0',
            mode: 'list',
            cachedResultName: 'Feuille 1',
            cachedResultUrl:
                'https://docs.google.com/spreadsheets/d/1CPcdn76Q-p5Xba1SU9HDHyaZUezeqpS5R25OaNAZ0YE/edit#gid=0',
        },
        columns: {
            mappingMode: 'autoMapInputData',
            value: {},
            matchingColumns: ['Email'],
            schema: [
                {
                    id: 'Email',
                    displayName: 'Email',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Prénom',
                    displayName: 'Prénom',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Nom',
                    displayName: 'Nom',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'Téléphone',
                    displayName: 'Téléphone',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
                {
                    id: 'ID_Voyageur',
                    displayName: 'ID_Voyageur',
                    required: false,
                    defaultMatch: false,
                    display: true,
                    type: 'string',
                    canBeUsedToMatch: true,
                    removed: false,
                },
            ],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: '40c818ee-129a-439f-9629-06baabc2a5b7',
        name: '1. Récupérer Propriétés',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [1880, -20],
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    _1RecupererProprietes = {
        url: 'https://public.api.hospitable.com/v2/properties',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        options: {},
    };

    @node({
        id: '3e266775-c1d8-469d-a3cf-c01a6e812149',
        name: '2. Séparer Propriétés',
        type: 'n8n-nodes-base.itemLists',
        version: 3,
        position: [2080, -20],
    })
    _2SeparerProprietes = {
        fieldToSplitOut: 'data',
        options: {},
    };

    @node({
        id: '5b4a8645-8c90-4ef0-bc4f-55be16bdcac1',
        name: '3. Récupérer Réservations par Appart',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [2280, -20],
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    _3RecupererReservationsParAppart = {
        url: 'https://public.api.hospitable.com/v2/reservations',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendQuery: true,
        queryParameters: {
            parameters: [
                {
                    name: 'properties[]',
                    value: '={{ $json.id }}',
                },
                {
                    name: 'include',
                    value: 'guest',
                },
            ],
        },
        options: {},
    };

    @node({
        id: 'd9887e2d-ff3d-464a-91c4-c41267e139b0',
        name: '4. Extraire Voyageurs Propres',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [2480, -20],
    })
    _4ExtraireVoyageursPropres = {
        jsCode: `const uniqueGuests = {};
const items = $input.all();

// On fouille dans chaque requête de réservation pour extraire uniquement les voyageurs
items.forEach(item => {
  const reservations = item.json.data || [];
  
  reservations.forEach(res => {
    if (res.guest && res.guest.id) {
      uniqueGuests[res.guest.id] = {
        ID_Voyageur: res.guest.id,
        Prénom: res.guest.first_name || "",
        Nom: res.guest.last_name || "",
        Téléphone: res.guest.phone || "Inconnu",
        Email: res.guest.email || "Non fourni"
      };
    }
  });
});

// On renvoie la liste propre, sans doublons
return Object.values(uniqueGuests).map(g => ({ json: g }));`,
    };

    @node({
        id: 'c7218aa8-2c2d-4022-a489-6645a9ae0443',
        name: '5. Google Sheets',
        type: 'n8n-nodes-base.googleSheets',
        version: 4.5,
        position: [2680, -20],
    })
    _5GoogleSheets = {
        operation: 'appendOrUpdate',
        documentId: {
            __rl: true,
            value: '1CPcdn76Q-p5Xba1SU9HDHyaZUezeqpS5R25OaNAZ0YE',
            mode: 'list',
        },
        sheetName: {
            __rl: true,
            value: 'gid=0',
            mode: 'list',
        },
        columns: {
            mappingMode: 'defineBelow',
            value: {
                ID_Voyageur: '={{ $json.ID_Voyageur }}',
                Prénom: '={{ $json.Prénom }}',
                Nom: '={{ $json.Nom }}',
                Téléphone: '={{ $json.Téléphone }}',
                Email: '={{ $json.Email }}',
            },
            matchingColumns: ['ID_Voyageur'],
            schema: [],
            attemptToConvertTypes: false,
            convertFieldsToString: false,
        },
        options: {},
    };

    @node({
        id: '33da5b43-e9d7-4db0-8439-e6040c5cf1e9',
        name: 'Tous les jours à Minuit1',
        type: 'n8n-nodes-base.scheduleTrigger',
        version: 1.2,
        position: [1680, -20],
    })
    TousLesJoursAMinuit1 = {
        rule: {
            interval: [{}],
        },
    };

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.RecupererVoyageursHospitable.out(0).to(this.SeparerVoyageurs.in(0));
        this.SeparerVoyageurs.out(0).to(this.GoogleSheets.in(0));
        this._1RecupererProprietes.out(0).to(this._2SeparerProprietes.in(0));
        this._2SeparerProprietes.out(0).to(this._3RecupererReservationsParAppart.in(0));
        this._3RecupererReservationsParAppart.out(0).to(this._4ExtraireVoyageursPropres.in(0));
        this._4ExtraireVoyageursPropres.out(0).to(this._5GoogleSheets.in(0));
        this.TousLesJoursAMinuit1.out(0).to(this._1RecupererProprietes.in(0));
    }
}
