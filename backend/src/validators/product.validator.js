const Joi = require('joi');

const createProductSchema = Joi.object({
  product_name: Joi.string().min(2).max(255).required().messages({
    'any.required': 'Product name is required',
  }),
  sku: Joi.string().min(2).max(50).required().messages({
    'any.required': 'SKU is required',
  }),
  category: Joi.string().min(2).max(100).required().messages({
    'any.required': 'Category is required',
  }),
  unit_price: Joi.number().min(0).required().messages({
    'any.required': 'Unit price is required',
    'number.min': 'Unit price cannot be negative',
  }),
  current_stock: Joi.number().integer().min(0).default(0),
  minimum_stock: Joi.number().integer().min(0).default(0),
  warehouse_location: Joi.string().allow('', null).max(100),
  image_url: Joi.string().uri().allow('', null),
});

const updateProductSchema = Joi.object({
  product_name: Joi.string().min(2).max(255),
  sku: Joi.string().min(2).max(50),
  category: Joi.string().min(2).max(100),
  unit_price: Joi.number().min(0),
  minimum_stock: Joi.number().integer().min(0),
  warehouse_location: Joi.string().allow('', null).max(100),
  image_url: Joi.string().uri().allow('', null),
}).min(1);

const stockMovementSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required().messages({
    'any.required': 'Quantity is required',
    'number.min': 'Quantity must be at least 1',
  }),
  reason: Joi.string().allow('', null),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  stockMovementSchema,
};
