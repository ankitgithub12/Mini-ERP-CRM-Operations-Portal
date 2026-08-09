const express = require('express');
const multer = require('multer');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authenticateUser = require('../middleware/auth');
const authorizeRoles = require('../middleware/authorize');
const { validate } = require('../middleware/validateRequest');
const {
  createProductSchema,
  updateProductSchema,
  stockMovementSchema,
} = require('../validators/product.validator');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// All routes require authentication
router.use(authenticateUser);

// POST /api/products/upload
router.post(
  '/upload',
  authorizeRoles('Admin', 'Warehouse'),
  upload.single('image'),
  productController.uploadImage
);

// GET /api/products
router.get(
  '/',
  authorizeRoles('Admin', 'Sales', 'Warehouse', 'Accounts'),
  productController.getProducts
);

// GET /api/stock-movements (all stock movements)
router.get(
  '/stock-movements',
  authorizeRoles('Admin', 'Warehouse', 'Accounts'),
  productController.getAllStockMovements
);

// GET /api/products/:id
router.get(
  '/:id',
  authorizeRoles('Admin', 'Sales', 'Warehouse', 'Accounts'),
  productController.getProductById
);

// POST /api/products
router.post(
  '/',
  authorizeRoles('Admin', 'Warehouse'),
  validate(createProductSchema),
  productController.createProduct
);

// PUT /api/products/:id
router.put(
  '/:id',
  authorizeRoles('Admin', 'Warehouse'),
  validate(updateProductSchema),
  productController.updateProduct
);

// POST /api/products/:id/stock-in
router.post(
  '/:id/stock-in',
  authorizeRoles('Admin', 'Warehouse'),
  validate(stockMovementSchema),
  productController.stockIn
);

// POST /api/products/:id/stock-out
router.post(
  '/:id/stock-out',
  authorizeRoles('Admin', 'Warehouse'),
  validate(stockMovementSchema),
  productController.stockOut
);

// GET /api/products/:id/stock-movements
router.get(
  '/:id/stock-movements',
  authorizeRoles('Admin', 'Warehouse', 'Accounts'),
  productController.getStockMovements
);

module.exports = router;
