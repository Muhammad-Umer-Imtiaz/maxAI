import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
  },
  fields: [
    // Email added by default
    {
      name: 'firstName',
      type: 'text',
      required: true,
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
    },
    {
      name: 'gender',
      type: 'text',
      required: true,
    },
    {
      name: 'plan',
      type: 'select',
      required: true,
      defaultValue: 'free',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Starter', value: 'starter' },
        { label: 'Pro Fit', value: 'proFit' },
        { label: 'Max Flex', value: 'maxFlex' },
      ],
    },
    {
      name: 'language',
      type: 'select',
      required: true,
      defaultValue: 'english',
      options: [
        { label: 'English', value: 'english' },
        { label: 'Arabic', value: 'arabic' },
        { label: 'Spanish', value: 'spanish' },
        { label: 'French', value: 'french' },
      ],
    },
    {
      name: 'aiCallsUsed',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'maxAiCalls',
      type: 'number',
      defaultValue: 1, // Free plan gets 1 call
      access: {
        read: () => true,
        update: () => true,
      },
    },
    {
      name: 'aiCallHistory',
      type: 'array',
      fields: [
        { name: 'timestamp', type: 'date' },
        { name: 'type', type: 'text' }, // e.g., "nutrition", "workout"
        { name: 'response', type: 'textarea' },
      ],
    },

    // ---------- Stripe billing mirror fields ----------
    {
      name: 'stripeCustomerId',
      type: 'text',
      admin: { readOnly: true },
      index: true,
    },
    {
      name: 'stripeSubscriptionId',
      type: 'text',
      admin: { readOnly: true },
      index: true,
    },
    {
      name: 'stripePriceId',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'stripeProductId',
      type: 'text',
      admin: { readOnly: true },
    },
    {
      name: 'subscriptionStatus',
      type: 'select',
      admin: { readOnly: true },
      options: [
        { label: 'Trialing', value: 'trialing' },
        { label: 'Active', value: 'active' },
        { label: 'Past Due', value: 'past_due' },
        { label: 'Canceled', value: 'canceled' },
        { label: 'Unpaid', value: 'unpaid' },
        { label: 'Incomplete', value: 'incomplete' },
        { label: 'Incomplete Expired', value: 'incomplete_expired' },
        { label: 'Paused', value: 'paused' },
      ],
    },
    {
      name: 'cancelAtPeriodEnd',
      type: 'checkbox',
      admin: { readOnly: true },
      defaultValue: false,
    },
    {
      name: 'currentPeriodEnd',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'callsPeriodStart',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'callsPeriodEnd',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'planUpdatedAt',
      type: 'date',
      admin: { readOnly: true },
    },
    {
      name: 'emailVerified',
      type: 'checkbox',
      defaultValue: false,
      access: {
        read: () => true,
        update: () => true,
      },
    },
    {
      name: 'paypalSubscriptionId',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'paypalCustomerId',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
