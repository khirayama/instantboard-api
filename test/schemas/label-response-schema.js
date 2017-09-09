const memberResponseSchema = {
  type: 'object',
  required: ['id', 'name', 'requestStatus'],
  properties: {
    id: {
      type: 'number',
    },
    name: {
      type: 'string',
    },
    requestStatus: {
      type: 'string',
    },
  },
};

const labelResponseSchema = {
  type: 'object',
  required: [
    'id',
    'priority',
    'visibled',
    'members',
    'createdAt',
    'updatedAt',
  ],
  properties: {
    id: {
      type: 'integer',
    },
    priority: {
      type: 'integer',
    },
    visibled: {
      type: 'boolean',
    },
    members: {
      type: 'array',
      items: memberResponseSchema,
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
  memberResponseSchema,
  labelResponseSchema,
  labelsResponseSchema,
};
