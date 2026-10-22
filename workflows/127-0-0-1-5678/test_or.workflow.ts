import { Workflow, node } from 'n8n-as-code';
export class TestOpenRouter extends Workflow {
    @node({
        id: 'trigger',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [0, 0],
    })
    Trigger = {};

    @node({
        id: 'openrouter',
        type: 'n8n-nodes-base.httpRequest',
        version: 4.2,
        position: [200, 0],
        credentials: { httpHeaderAuth: { id: 'UfD1bS9Xf5V1W9jE', name: 'Openrouter' } },
    })
    OpenRouter = {
        method: 'POST',
        url: 'https://openrouter.ai/api/v1/chat/completions',
        authentication: 'predefinedCredentialType',
        nodeCredentialType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: '{"model": "qwen/qwen-vl-plus:free", "messages": [{"role": "user", "content": "hello"}]}',
    };

    defineRouting() {
        this.Trigger.out(0).to(this.OpenRouter.in(0));
    }
}
