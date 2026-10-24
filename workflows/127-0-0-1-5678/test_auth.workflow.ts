import { Workflow, node } from 'n8n-as-code';
export class TestAuth extends Workflow {
    @node({ id: 'trigger', type: 'n8n-nodes-base.manualTrigger', version: 1, position: [0, 0] }) Trigger = {};
    @node({ id: 'test-or', type: 'n8n-nodes-base.httpRequest', version: 4.2, position: [200, 0], credentials: { httpHeaderAuth: { id: 'UfD1bS9Xf5V1W9jE', name: 'Openrouter' } } })
    TestOr = { method: 'GET', url: 'https://openrouter.ai/api/v1/auth/key', authentication: 'predefinedCredentialType', nodeCredentialType: 'httpHeaderAuth' };
    defineRouting() { this.Trigger.out(0).to(this.TestOr.in(0)); }
}
