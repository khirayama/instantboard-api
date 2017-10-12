const requestResponseSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'integer',
    },
    status: {
      type: 'string',
    },
    member: {
      type: 'object',
      properties: {
        id: {
          type: 'integer',
        },
        name: {
          type: ['string', 'null'],
        },
      },
    },
  },
};

const labelResponseSchema = {
  type: 'object',
  required: [
    'id',
    'name',
    'priority',
    'visibled',
    'requests',
    'createdAt',
    'updatedAt',
  ],
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
    requests: {
      type: 'array',
      items: requestResponseSchema,
    },
    createdAt: {
      type: ['string', 'object'],
    },
    updatedAt: {
      type: ['string', 'object'],
    },
  },
};

const labelsResponseSchema = {
  type: 'array',
  items: labelResponseSchema,
};

module.exports = {
  labelResponseSchema,
  labelsResponseSchema,
};
