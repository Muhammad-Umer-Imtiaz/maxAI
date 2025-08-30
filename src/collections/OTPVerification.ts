import type { CollectionConfig } from 'payload'

export const OTPVerifications: CollectionConfig = {
  slug: 'otp-verifications',
  access: {
    read: () => false,
    create: () => true,
    update: () => false,
    delete: () => true,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      index: true,
    },
    {
      name: 'otp',
      type: 'text',
      required: true,
    },
    {
      name: 'verified',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'expiresAt',
      type: 'date',
      required: true,
      index: true,
    },
  ],
}
