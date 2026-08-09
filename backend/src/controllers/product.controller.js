const productService = require('../services/product.service');
const s3Service = require('../services/s3.service');
const { success, created } = require('../utils/apiResponse');

const getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query);
    return success(res, 'Products retrieved successfully', result);
  } catch (err) {
    next(err);
  }
};

const getProductById = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return success(res, 'Product retrieved successfully', product);
  } catch (err) {
    next(err);
  }
};

const createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body);
    return created(res, 'Product created successfully', product);
  } catch (err) {
    next(err);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body);
    return success(res, 'Product updated successfully', product);
  } catch (err) {
    next(err);
  }
};

const stockIn = async (req, res, next) => {
  try {
    const result = await productService.stockIn(
      req.params.id,
      req.body.quantity,
      req.body.reason,
      req.user.id
    );
    return success(res, 'Stock added successfully', result);
  } catch (err) {
    next(err);
  }
};

const stockOut = async (req, res, next) => {
  try {
    const result = await productService.stockOut(
      req.params.id,
      req.body.quantity,
      req.body.reason,
      req.user.id
    );
    return success(res, 'Stock removed successfully', result);
  } catch (err) {
    next(err);
  }
};

const getStockMovements = async (req, res, next) => {
  try {
    const result = await productService.getStockMovements(
      req.params.id,
      req.query
    );
    return success(res, 'Stock movements retrieved successfully', result);
  } catch (err) {
    next(err);
  }
};

const getAllStockMovements = async (req, res, next) => {
  try {
    const result = await productService.getStockMovements(null, req.query);
    return success(res, 'Stock movements retrieved successfully', result);
  } catch (err) {
    next(err);
  }
};

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }
    const imageUrl = await s3Service.uploadFile(req.file);
    return success(res, 'Image uploaded successfully', { url: imageUrl });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  stockIn,
  stockOut,
  getStockMovements,
  getAllStockMovements,
  uploadImage,
};
