export default {
  id: 'launch-day-crisis',
  name: 'Launch Day Crisis',

  description: `It's 9:55 AM on launch day. The user is a Project Manager responsible for making sure the Horizon v2.0 product launch happens smoothly at 10:00 AM. Sales has communicated the launch time to a major customer. Engineering said things looked good yesterday. The roadmap status is marked "Ready." But error spikes have appeared, and the situation is about to escalate.`,

  llmContext: `The team works at Acme Corp on the "Horizon" product team. Key people:
- Sarah Chen: Engineering Manager, coordinating the launch
- Alex Rivera: Senior Engineer, investigating 500-error spikes on /api/users (~2% of requests since 8:45 AM)
- Jordan Kim: Product Designer, led the dashboard redesign
- Priya Patel: VP of Product, executive sponsor

The launch includes a major dashboard redesign, new API endpoints, and updated onboarding flow. Marketing has a press release queued for 10 AM. The error spikes are not yet resolved — possibly a race condition in connection pooling.

The user's actions should drive realistic workplace consequences. If they ask about launch readiness, the engineer should express concern. If issues are flagged, stakeholders should get nervous. Email from concerned customers may arrive. Tasks may need to be created or status changed to "blocked."`,

  llmEnabled: false,

  simulations: ['email-app', 'pulse-chat', 'docs-lib', 'task-board'],

  actionSchemas: {
    'email-app':  ['add-email', 'mark-unread'],
    'pulse-chat': ['add-message', 'trigger-typing'],
    'docs-lib':   ['add-comment', 'update-status'],
    'task-board': ['add-task', 'move-task']
  },

  triggers: [
    {
      id: 'engineer-reply-triggers-email',
      on: 'chat:message-received',
      match: { conversationId: 'alex-rivera' },
      once: true,
      delay: 4000,
      llmGuard: 'Does this message from the engineer indicate a problem, concern, or risk related to the launch (e.g., errors, issues, not ready)? Only answer true if the reply signals something is wrong.',
      actions: [
        {
          target: 'email-app',
          type: 'add-email',
          payload: {
            from: 'Priya Patel <priya@acmecorp.com>',
            to: 'me@acmecorp.com',
            subject: 'URGENT – Customer Concern',
            body: `Hi,

We're seeing unexpected behavior in testing on our end. The customer success team just flagged it.

Can you please confirm the launch status? Marketing is about to push the press release and I need to know if we should hold.

This is time-sensitive — please respond ASAP.

Thanks,
Priya Patel
VP of Product`,
          }
        }
      ]
    }
  ]
};
