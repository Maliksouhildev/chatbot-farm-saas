import { workflow, node, links } from '@n8n-as-code/transformer';

// <workflow-map>
// Workflow : VOD Scraper (Bypassed Version)
// Nodes   : 8  |  Connections: 7
//
// NODE INDEX
// ──────────────────────────────────────────────────────────────────
// Property name                    Node type (short)         Flags
// WebhookManual                      webhook
// ScheduleDailyAt3Am                 scheduleTrigger
// ChannelList                        code
// InstallUpdateYtDlp                 executeCommand
// DownloadVod                        executeCommand             [retry]
// FilterAndPrioritizeStreams         executeCommand
// Check100gbStorageLimit             executeCommand
// WhenClickingTestWorkflow           manualTrigger
//
// ROUTING MAP
// ──────────────────────────────────────────────────────────────────
// WebhookManual
//    → Check100gbStorageLimit
//      → InstallUpdateYtDlp
//        → ChannelList
//          → DownloadVod
//            → FilterAndPrioritizeStreams
// ScheduleDailyAt3Am
//    → Check100gbStorageLimit (↩ loop)
// WhenClickingTestWorkflow
//    → Check100gbStorageLimit (↩ loop)
// </workflow-map>

// =====================================================================
// METADATA DU WORKFLOW
// =====================================================================

@workflow({
    id: 'fY4JGHRUcU7Igzls',
    name: 'VOD Scraper (Bypassed Version)',
    active: true,
    settings: { executionOrder: 'v1' },
})
export class VodScraperBypassedVersionWorkflow {
    // =====================================================================
    // CONFIGURATION DES NOEUDS
    // =====================================================================

    @node({
        id: 'webhook-trigger',
        webhookId: 'scrape-vod-trigger',
        name: 'Webhook (Manual)',
        type: 'n8n-nodes-base.webhook',
        version: 1,
        position: [500, 20],
    })
    WebhookManual = {
        path: 'scrape-vod',
        options: {},
    };

    @node({
        id: 'schedule-trigger',
        name: 'Schedule (Daily at 3 AM)',
        type: 'n8n-nodes-base.scheduleTrigger',
        version: 1.1,
        position: [520, 220],
    })
    ScheduleDailyAt3Am = {
        rule: {
            interval: [
                {
                    triggerAtHour: 21,
                },
            ],
        },
    };

    @node({
        id: 'channel-list',
        name: 'Channel List',
        type: 'n8n-nodes-base.code',
        version: 2,
        position: [1120, 120],
    })
    ChannelList = {
        jsCode: `return [
  { "json": { "target_url": "https://www.youtube.com/@KreekCraft/streams" } },
  { "json": { "target_url": "https://www.youtube.com/@DenisDaily/streams" } },
  { "json": { "target_url": "https://www.youtube.com/@ItsFunneh/streams" } },
  { "json": { "target_url": "https://www.youtube.com/@MeganPlays/streams" } },
  { "json": { "target_url": "https://www.youtube.com/@Thinknoodles/streams" } },
  { "json": { "target_url": "https://www.youtube.com/@LeahAshe/streams" } },
  { "json": { "target_url": "https://www.youtube.com/@russoplaysgames/streams" } },
  { "json": { "target_url": "https://www.youtube.com/@FoltynFamily/streams" } },
  { "json": { "target_url": "https://www.youtube.com/@MyUsernamesThis/streams" } },
  { "json": { "target_url": "https://www.youtube.com/@IBella/streams" } },
  { "json": { "target_url": "https://www.youtube.com/@flamingo/videos" } },
  { "json": { "target_url": "https://www.youtube.com/@LankyBox/videos" } },
  { "json": { "target_url": "https://www.twitch.tv/bandites/videos" } },
  { "json": { "target_url": "https://www.twitch.tv/tanqr/videos" } }
];`,
    };

    @node({
        id: 'install-ytdlp',
        name: 'Install/Update yt-dlp',
        type: 'n8n-nodes-base.executeCommand',
        version: 1,
        position: [940, 120],
    })
    InstallUpdateYtDlp = {
        command:
            'rm -f /files/temp/download_count.txt && echo 0 > /files/temp/download_count.txt; cp -n /files/inputs/download_stream.sh /files/download_stream.sh 2>/dev/null || true; cp -n /files/inputs/filter_streams.js /files/filter_streams.js 2>/dev/null || true; chmod a+rx /files/yt-dlp /files/download_stream.sh /files/filter_streams.js 2>/dev/null || true',
    };

    @node({
        id: 'download-vod',
        name: 'Download VOD',
        type: 'n8n-nodes-base.executeCommand',
        version: 1,
        position: [1280, 120],
        retryOnFail: true,
        maxTries: 3,
        waitBetweenTries: 5000,
    })
    DownloadVod = {
        executeOnce: false,
        command: '=/files/download_stream.sh "{{ $json.target_url }}" 2',
    };

    @node({
        id: 'filter-and-prioritize-streams',
        name: 'Filter and Prioritize Streams',
        type: 'n8n-nodes-base.executeCommand',
        version: 1,
        position: [1480, 120],
    })
    FilterAndPrioritizeStreams = {
        executeOnce: true,
        command: 'node /files/filter_streams.js',
    };

    @node({
        id: 'check-storage',
        name: 'Check 100GB Storage Limit',
        type: 'n8n-nodes-base.executeCommand',
        version: 1,
        position: [760, 120],
    })
    Check100gbStorageLimit = {
        command:
            'size=$(du -sm /files/inputs 2>/dev/null | awk \'{print $1}\'); if [ ! -z "$size" ] && [ "$size" -gt 102400 ]; then echo "STORAGE LIMIT EXCEEDED: Inputs folder is over 100GB. Please delete old streams." >&2; exit 1; fi; echo "Storage OK: ${size}MB"',
    };

    @node({
        id: '46ed9027-8e5e-49f2-a782-87e6b6838dc8',
        name: 'When clicking ‘Test workflow’',
        type: 'n8n-nodes-base.manualTrigger',
        version: 1,
        position: [340, 120],
    })
    WhenClickingTestWorkflow = {};

    // =====================================================================
    // ROUTAGE ET CONNEXIONS
    // =====================================================================

    @links()
    defineRouting() {
        this.WebhookManual.out(0).to(this.Check100gbStorageLimit.in(0));
        this.ScheduleDailyAt3Am.out(0).to(this.Check100gbStorageLimit.in(0));
        this.Check100gbStorageLimit.out(0).to(this.InstallUpdateYtDlp.in(0));
        this.InstallUpdateYtDlp.out(0).to(this.ChannelList.in(0));
        this.ChannelList.out(0).to(this.DownloadVod.in(0));
        this.DownloadVod.out(0).to(this.FilterAndPrioritizeStreams.in(0));
        this.WhenClickingTestWorkflow.out(0).to(this.Check100gbStorageLimit.in(0));
    }
}
