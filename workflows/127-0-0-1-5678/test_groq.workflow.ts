import { Workflow, node } from 'n8n-as-code';
export class TestGroq extends Workflow {
    @node({
        id: 'trigger',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [0, 0],
    })
    Trigger = {};

    @node({
        id: 'groq-models',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [200, 0],
        credentials: { groqApi: { id: 'PF1ZMT03O2E5waqU', name: 'Groq account 2' } },
    })
    GroqModels = {
        method: 'GET',
        url: 'https://api.groq.com/openai/v1/models',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'groqApi',
        sendBody: false,
    };

    defineRouting() {
        this.Trigger.out(0).to(this.GroqModels.in(0));
    }
}
