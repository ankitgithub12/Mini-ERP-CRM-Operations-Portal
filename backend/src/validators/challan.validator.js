const Joi = require('joi');

const createChallanSchema = Joi.object({
  customer_id: Joi.string().uuid().required().messages({
    'any.required': 'Customer is required',
    'string.guid': 'Invalid customer ID',
  }),
  status: Joi.string().valid('DRAFT').default('DRAFT'),
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.string().uuid().required().messages({
          'any.required': 'Product ID is required',
          'string.guid': 'Invalid product ID',
        }),
        quantity: Joi.number().integer().min(1).required().messages({
          'any.required': 'Quantity is required',
          'number.min': 'Quantity must be at least 1',
        }),
      })
    )
    .min(1)
    .required()
    .messages({
      'any.required': 'At least one item is required',
      'array.min': 'At least one item is required',
    }),
});

const updateChallanSchema = Joi.object({
  customer_id: Joi.string().uuid(),
  items: Joi.array()
    .items(
      Joi.object({
        product_id: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).required(),
      })
    )
    .min(1),
}).min(1);

module.exports = { createChallanSchema, updateChallanSchema };
