import type { CollectionConfig } from 'payload'

export const FitnessPrograms: CollectionConfig = {
  slug: 'fitness-programs',
  access: {
    read: ({ req }) => {
      if (req.user?.email) {
        return { user: { equals: req.user.email } }
      }
      return false
    },
    create: () => true,
    update: ({ req }) => {
      if (req.user?.email) {
        return { user: { equals: req.user.email } }
      }
      return false
    },
    delete: ({ req }) => {
      if (req.user?.email) {
        return { user: { equals: req.user.email } }
      }
      return false
    },
  },
  fields: [
    {
      name: 'user',
      type: 'email',
      required: true,
      index: true,
    },
    {
      name: 'userDetails',
      type: 'group',
      fields: [
        { name: 'age', type: 'number' },
        { name: 'weight', type: 'number' },
        { name: 'height', type: 'text' },
        { name: 'fitnessGoals', type: 'textarea' },
        { name: 'injuries', type: 'textarea' },
        { name: 'fitnessLevel', type: 'text' },
        { name: 'workoutDaysPerWeek', type: 'number' },
        { name: 'dietaryRestrictions', type: 'textarea' },
      ],
    },
    {
      name: 'workoutPlan',
      type: 'json',
      required: true,
    },
    {
      name: 'dietPlan',
      type: 'json',
      required: true,
    },
    {
      name: 'generatedAt',
      type: 'date',
      defaultValue: () => new Date(),
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
        { label: 'Draft', value: 'draft' },
      ],
      defaultValue: 'active',
    },
  ],
  timestamps: true,
}
