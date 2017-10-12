const taskResponseSchema = {
  type: 'object',
  required: [
    'id',
    'label',
    'priority',
    'content',
    'completed',
    'text', // For response
    'schedule', // For response
    'createdAt',
    'updatedAt',
  ],
  properties: {
    id: {
      type: 'integer',
    },
    label: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
        },
        name: {
          type: 'string',
        },
        priority: {
          type: 'integer',
        },
        visibled: {
          type: 'boolean',
        },
      },
    },
    priority: {
      type: 'integer',
    },
    content: {
      type: 'string',
    },
    completed: {
      type: 'boolean',
    },
    text: {
      type: 'string',
    },
    schedule: {
      type: ['object', 'null'],
    },
    createdAt: {
      type: ['string', 'object'],
    },
    updatedAt: {
      type: ['string', 'object'],
    },
  },
};

const tasksResponseSchema = {
  type: 'array',
  items: taskResponseSchema,
};

module.exports = {
  taskResponseSchema,
  tasksResponseSchema,
};
