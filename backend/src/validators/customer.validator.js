const Joi = require('joi');

const createCustomerSchema = Joi.object({
  customer_name: Joi.string().min(2).max(255).required().messages({
    'any.required': 'Customer name is required',
    'string.min': 'Customer name must be at least 2 characters',
  }),
  mobile: Joi.string().allow('', null).max(20),
  email: Joi.string().email().allow('', null).messages({
    'string.email': 'Please provide a valid email',
  }),
  business_name: Joi.string().allow('', null).max(255),
  gst_number: Joi.string().allow('', null).max(20),
  customer_type: Joi.string()
    .valid('Retail', 'Wholesale', 'Distributor')
    .required()
    .messages({
      'any.required': 'Customer type is required',
      'any.only': 'Customer type must be Retail, Wholesale, or Distributor',
    }),
  address: Joi.string().allow('', null),
  status: Joi.string().valid('Lead', 'Active', 'Inactive').default('Lead'),
  follow_up_date: Joi.date().allow(null).iso(),
  notes: Joi.string().allow('', null),
});

const updateCustomerSchema = Joi.object({
  customer_name: Joi.string().min(2).max(255),
  mobile: Joi.string().allow('', null).max(20),
  email: Joi.string().email().allow('', null),
  business_name: Joi.string().allow('', null).max(255),
  gst_number: Joi.string().allow('', null).max(20),
  customer_type: Joi.string().valid('Retail', 'Wholesale', 'Distributor'),
  address: Joi.string().allow('', null),
  status: Joi.string().valid('Lead', 'Active', 'Inactive'),
  follow_up_date: Joi.date().allow(null).iso(),
  notes: Joi.string().allow('', null),
}).min(1);

const createFollowUpSchema = Joi.object({
  follow_up_date: Joi.date().iso().required().messages({
    'any.required': 'Follow-up date is required',
  }),
  notes: Joi.string().allow('', null),
});

module.exports = {
  createCustomerSchema,
  updateCustomerSchema,
  createFollowUpSchema,
};
