import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : wsp hospitable
// Nodes   : 20  |  Connections: 17
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WebhookFromHospitable              webhook
// CleanPhonePrepareJson              code
// RedisLockReservation               redis                      [creds]
// WaProactiveMessage                 whatsApp                   [creds] [retry]
// ResaDirecteUniquement              if
// WaAlerteAdminT0                    whatsApp                   [creds] [retry]
// Wait6h                             wait
// WaClientWarningT6h                 whatsApp                   [creds] [retry]
// WaitAnother6h                      wait
// WaAdminVerificationRequest         whatsApp                   [creds] [retry]
// WebhookValidate                    webhook
// WaAdminValidated                   whatsApp                   [creds] [retry]
// RespondToWebhookValid              respondToWebhook
// WebhookCancel                      webhook
// HospitableApiCancel                httpRequest                [retry]
// WaAdminCancelled                   whatsApp                   [creds] [retry]
// WaClientCancelled                  whatsApp                   [creds] [retry]
// RespondToWebhookCancel             respondToWebhook
// RedisCheckRecentSearch             redis                      [creds]
// IfClientKnown                      if
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WebhookFromHospitable
//    → ResaDirecteUniquement
//      → CleanPhonePrepareJson
//        → RedisCheckRecentSearch
//          → IfClientKnown
//            → RedisLockReservation
//              → WaProactiveMessage
//                → WaAlerteAdminT0
//                  → Wait6h
//                    → WaClientWarningT6h
//                      → WaitAnother6h
//                        → WaAdminVerificationRequest
// WebhookValidate
//    → WaAdminValidated
//      → RespondToWebhookValid
// WebhookCancel
//    → HospitableApiCancel
//      → WaAdminCancelled
//        → WaClientCancelled
//          → RespondToWebhookCancel
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'G2M4kss6A5AvxPXI',
    name: 'wsp hospitable',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class WspHospitableWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: '17e19a67-d2d7-4616-98e4-de1babf16304',
        webhookId: 'd76004e3-92e8-4515-b3b9-328d257a4f01',
        name: 'Webhook from Hospitable',
        type: 'n8n-nodes-base.webhook',
        version: 2,
        position: [880, -480],
    })
    WebhookFromHospitable = {
        httpMethod: 'POST',
        path: 'hospitable-hold',
        options: {},
    };

    @node({
        id: 'b0cf2081-ac84-4ac3-808b-cd98b1558eb5',
        name: 'Clean Phone & Prepare JSON',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1280, -620],
    })
    CleanPhonePrepareJson = {
        jsCode: `// On pointe vers le bon objet "data" envoyé par Hospitable
const guestData = $json.body.data.guest || {};

// Le numéro de téléphone est dans un tableau (array) appelé "phone_numbers"
// On récupère le premier numéro de la liste, s'il existe
let phoneRaw = "";
if (guestData.phone_numbers && guestData.phone_numbers.length > 0) {
  phoneRaw = guestData.phone_numbers[0];
}

// Sécurité : si le client n'a pas mis de numéro, on stoppe le flux ici
if (!phoneRaw) {
  return []; 
}

// Nettoie le numéro pour qu'il matche WhatsApp (enlève les +, espaces, et remplace le 0 par 213)
//const phoneClean = phoneRaw.replace(/\\D/g, '').replace(/^0/, '213'); 
// On force ton numéro pour le test (À SUPPRIMER EN PRODUCTION)
const phoneClean = "213551671229";

// L'ID de réservation se trouve aussi dans l'objet "data"
const reservation_id = $json.body.data.id;

return [{
  json: {
    phone: phoneClean,
    redis_data: JSON.stringify({
      reservation_id: reservation_id,
      timestamp: Date.now(),
      status: "en_attente_paiement",
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000
    })
  }
}];`,
    };

    @node({
        id: 'f661bc97-a9ad-4bc8-8d81-11499536956a',
        name: 'Redis: Lock Reservation',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [1680, -640],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisLockReservation = {
        operation: 'set',
        key: "={{ 'res_pending:' + $('Clean Phone & Prepare JSON').first().json.phone }}",
        value: "={{ $('Clean Phone & Prepare JSON').first().json.redis_data }}",
    };

    @node({
        id: 'a164106d-ceb1-4337-823e-029863c3d8b2',
        name: 'WA: Proactive Message',
        type: 'n8n-nodes-base.whatsApp',
        version: 1,
        position: [1880, -640],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    WaProactiveMessage = {
        operation: 'send',
        phoneNumberId: '1035565869637770',
        recipientPhoneNumber: "={{ $('Clean Phone & Prepare JSON').first().json.phone }}",
        textBody: `Bonjour ! Je viens de recevoir votre pré-réservation.

Pour finaliser, dites-moi comment vous souhaitez régler : en Euros ou en Dinars ?`,
        additionalFields: {},
        requestOptions: {},
    };

    @node({
        id: 'cee38e74-2f39-49ff-9c4c-ce63559df306',
        name: 'Résa Directe Uniquement',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [1080, -540],
    })
    ResaDirecteUniquement = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'filtre-action',
                    leftValue: '={{ $json.body.action }}',
                    rightValue: 'reservation.created',
                    operator: {
                        type: 'string',
                        operation: 'equals',
                    },
                },
                {
                    id: 'filtre-plateforme',
                    leftValue: '={{ $json.body.data.platform }}',
                    rightValue: '^(manual|direct)$',
                    operator: {
                        type: 'string',
                        operation: 'regex',
                    },
                },
            ],
            combinator: 'and',
        },
        options: {},
    };

    @node({
        id: 'a85f209d-57eb-4821-8146-a60f4ef96d89',
        name: 'WA: Alerte Admin T-0',
        type: 'n8n-nodes-base.whatsApp',
        version: 1,
        position: [2480, -360],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    WaAlerteAdminT0 = {
        operation: 'send',
        phoneNumberId: '1035565869637770',
        recipientPhoneNumber: '213551671229',
        textBody: `=Nouvelle pré-réservation à encaisser.

Client : {{ $('Clean Phone & Prepare JSON').first().json.phone }}
Réservation : {{ $('Webhook from Hospitable').first().json.body.data.id }}

Le client a 12h pour envoyer son reçu. Je t'alerterai à mi-chemin et à l'échéance.`,
        additionalFields: {},
        requestOptions: {},
    };

    @node({
        id: '603cca02-f031-43ca-b943-876430bc4207',
        webhookId: 'wn4nuy80',
        name: 'Wait 6h',
        type: 'n8n-nodes-base.wait',
        version: 1,
        position: [2680, -360],
    })
    Wait6h = {
        resume: 'afterTime',
    };

    @node({
        id: '25c5bbe6-a7a8-4a74-87cc-7a11639b4860',
        name: 'WA: Client Warning T-6h',
        type: 'n8n-nodes-base.whatsApp',
        version: 1,
        position: [2880, -360],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    WaClientWarningT6h = {
        operation: 'send',
        phoneNumberId: '1035565869637770',
        recipientPhoneNumber: "={{ $('Clean Phone & Prepare JSON').first().json.phone }}",
        textBody: `Bonjour ! Petit rappel amical : il vous reste encore 6 heures pour finaliser le virement et m'envoyer votre reçu.

Passé ce délai, les dates pourraient être remises en disponibilité. N'hésitez pas si vous avez besoin d'aide !`,
        additionalFields: {},
        requestOptions: {},
    };

    @node({
        id: 'fedbd7a5-35ab-476e-b5c3-8c42e4eca7d4',
        webhookId: '92e3kmss',
        name: 'Wait another 6h',
        type: 'n8n-nodes-base.wait',
        version: 1,
        position: [3080, -360],
    })
    WaitAnother6h = {
        resume: 'afterTime',
    };

    @node({
        id: '71ff71cf-536c-405a-93ab-d89d3205b231',
        name: 'WA: Admin Verification Request',
        type: 'n8n-nodes-base.whatsApp',
        version: 1,
        position: [3280, -360],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    WaAdminVerificationRequest = {
        operation: 'send',
        phoneNumberId: '1035565869637770',
        recipientPhoneNumber: '213551671229',
        textBody: `=⚠️ DÉLAI DE 12H EXPIRÉ ⚠️

Réservation : {{ $('Webhook from Hospitable').first().json.body.data.id }}
Client : {{ $('Clean Phone & Prepare JSON').first().json.phone }}

Le client a-t-il payé ?

✅ OUI — Garder la réservation :
https://{{ $('Webhook from Hospitable').first().json.headers['x-forwarded-host'] }}/webhook/valid_resa_3imrjm37?resa={{ $('Webhook from Hospitable').first().json.body.data.id }}&phone={{ $('Clean Phone & Prepare JSON').first().json.phone }}

❌ NON — Annuler la réservation :
https://{{ $('Webhook from Hospitable').first().json.headers['x-forwarded-host'] }}/webhook/cancel_resa_bdg94478?resa={{ $('Webhook from Hospitable').first().json.body.data.id }}&phone={{ $('Clean Phone & Prepare JSON').first().json.phone }}`,
        additionalFields: {},
        requestOptions: {},
    };

    @node({
        id: '90811260-0ff1-47c6-9bae-c7f9b2738d77',
        webhookId: 'exfzola6',
        name: 'Webhook Validate',
        type: 'n8n-nodes-base.webhook',
        version: 1.1,
        position: [2080, 40],
    })
    WebhookValidate = {
        path: 'valid_resa_3imrjm37',
        responseMode: 'lastNode',
        options: {},
    };

    @node({
        id: '0a9bbb0e-0f5a-4f78-9108-d9966cdac560',
        name: 'WA: Admin Validated',
        type: 'n8n-nodes-base.whatsApp',
        version: 1,
        position: [2280, 40],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    WaAdminValidated = {
        operation: 'send',
        phoneNumberId: '1035565869637770',
        recipientPhoneNumber: '213551671229',
        textBody: '=✅ Réservation {{$json.query.resa}} VALIDÉE et MAINTENUE. Le rappel a été annulé.',
        additionalFields: {},
        requestOptions: {},
    };

    @node({
        id: '8f5e78fe-a352-40e8-9a5d-b9e5268d57be',
        name: 'Respond to Webhook (Valid)',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [2480, 40],
    })
    RespondToWebhookValid = {
        respondWith: 'text',
        responseBody: 'Réservation validée avec succès. Vous pouvez fermer cette fenêtre.',
        options: {},
    };

    @node({
        id: '52a4f128-caf5-4422-83c1-b3e0f5f02b61',
        webhookId: '3ypjzkyt',
        name: 'Webhook Cancel',
        type: 'n8n-nodes-base.webhook',
        version: 1.1,
        position: [2080, 340],
    })
    WebhookCancel = {
        path: 'cancel_resa_bdg94478',
        responseMode: 'lastNode',
        options: {},
    };

    @node({
        id: '3fd176db-9e60-4737-9338-837ebf3c509c',
        name: 'Hospitable API: Cancel',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.1,
        position: [2280, 340],
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    HospitableApiCancel = {
        method: 'DELETE',
        url: '=https://api.hospitable.com/reservations/{{ $json.query.resa }}',
        authentication: 'headerAuth',
        sendHeaders: true,
        headerParameters: {
            parameters: [
                {
                    name: 'Authorization',
                    value: 'Bearer [INSERT_YOUR_HOSPITABLE_BEARER_TOKEN_HERE]',
                },
            ],
        },
        options: {},
    };

    @node({
        id: '717fa621-3ce5-4489-a7ce-6c3f8959e6f2',
        name: 'WA: Admin Cancelled',
        type: 'n8n-nodes-base.whatsApp',
        version: 1,
        position: [2480, 340],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    WaAdminCancelled = {
        operation: 'send',
        phoneNumberId: '1035565869637770',
        recipientPhoneNumber: '213551671229',
        textBody:
            "=🚫 Réservation {{$('Webhook Cancel').first().json.query.resa}} a été annulée avec succès sur Hospitable suite au non-paiement.",
        additionalFields: {},
        requestOptions: {},
    };

    @node({
        id: 'de8f796c-2352-4c67-b82d-1d957f5eb42a',
        name: 'WA: Client Cancelled',
        type: 'n8n-nodes-base.whatsApp',
        version: 1,
        position: [2680, 340],
        credentials: { whatsAppApi: { id: 'A5i0TdmXFmQSw5T3', name: 'WhatsApp account 2' } },
        retryOnFail: true,
        maxTries: 5,
        waitBetweenTries: 5000,
    })
    WaClientCancelled = {
        operation: 'send',
        phoneNumberId: '1035565869637770',
        recipientPhoneNumber: "={{$('Webhook Cancel').first().json.query.phone}}",
        textBody: `❌ Bonjour. N'ayant pas reçu votre paiement dans le délai de 12 heures, nous avons dû annuler votre réservation et débloquer les dates.
Si vous souhaitez réserver à nouveau, n'hésitez pas à nous recontacter !`,
        additionalFields: {},
        requestOptions: {},
    };

    @node({
        id: '5dc17986-c534-4061-90ea-586463535aff',
        name: 'Respond to Webhook (Cancel)',
        type: 'n8n-nodes-base.respondToWebhook',
        version: 1.1,
        position: [2880, 340],
    })
    RespondToWebhookCancel = {
        respondWith: 'text',
        responseBody:
            'Réservation annulée avec succès via Hospitable. Le client a été notifié. Vous pouvez fermer cette fenêtre.',
        options: {},
    };

    @node({
        id: 'a143bf54-8857-4a13-9aa8-1762226148d8',
        name: 'Redis: Check Recent Search',
        type: 'n8n-nodes-base.redis',
        version: 1,
        position: [1420, -580],
        credentials: { redis: { id: 'V8K02flgy9UVw9wq', name: 'Redis account' } },
    })
    RedisCheckRecentSearch = {
        operation: 'get',
        key: "={{ 'recent_search:' + $json.phone }}",
        options: {},
    };

    @node({
        id: 'b0576870-e693-4084-aaef-cffaa0d04593',
        name: 'If Client Known',
        type: 'n8n-nodes-base.if',
        version: 2.2,
        position: [1540, -620],
    })
    IfClientKnown = {
        conditions: {
            options: {
                caseSensitive: true,
                leftValue: '',
                typeValidation: 'strict',
                version: 2,
            },
            conditions: [
                {
                    id: 'check-val',
                    leftValue: "={{ $json.propertyName || $json.value || '' }}",
                    rightValue: 'true',
                    operator: {
                        type: 'string',
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
        this.WebhookFromHospitable.out(0).to(this.ResaDirecteUniquement.in(0));
        this.CleanPhonePrepareJson.out(0).to(this.RedisCheckRecentSearch.in(0));
        this.RedisLockReservation.out(0).to(this.WaProactiveMessage.in(0));
        this.ResaDirecteUniquement.out(0).to(this.CleanPhonePrepareJson.in(0));
        this.WaProactiveMessage.out(0).to(this.WaAlerteAdminT0.in(0));
        this.WaAlerteAdminT0.out(0).to(this.Wait6h.in(0));
        this.Wait6h.out(0).to(this.WaClientWarningT6h.in(0));
        this.WaClientWarningT6h.out(0).to(this.WaitAnother6h.in(0));
        this.WaitAnother6h.out(0).to(this.WaAdminVerificationRequest.in(0));
        this.WebhookValidate.out(0).to(this.WaAdminValidated.in(0));
        this.WaAdminValidated.out(0).to(this.RespondToWebhookValid.in(0));
        this.WebhookCancel.out(0).to(this.HospitableApiCancel.in(0));
        this.HospitableApiCancel.out(0).to(this.WaAdminCancelled.in(0));
        this.WaAdminCancelled.out(0).to(this.WaClientCancelled.in(0));
        this.WaClientCancelled.out(0).to(this.RespondToWebhookCancel.in(0));
        this.RedisCheckRecentSearch.out(0).to(this.IfClientKnown.in(0));
        this.IfClientKnown.out(0).to(this.RedisLockReservation.in(0));
    }
}
