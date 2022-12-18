import { Router } from 'express'
import isAdmin from '../middlewares/isAdmin.middleware.js'
import { uploader } from '../utils/uploader.js'
import { apiErrorLogger } from '../middlewares/logger.middleware.js'
import productsController from '../controllers/products.controller.js'

const router = Router();

router
  .route('/')
    .get(
      productsController.getProducts,
      apiErrorLogger
    )
    .post(
      isAdmin,
      uploader.single('file'),
      productsController.saveNewProduct,
      apiErrorLogger
    )
    .put(
      isAdmin,
      uploader.single('file'),
      productsController.updateProductByCode,
      apiErrorLogger
    )
    .delete(
      isAdmin,
      productsController.deleteProductByCode,
      apiErrorLogger
    )
router
  .route('/:code')
    .get(
      productsController.getProductByCode,
      apiErrorLogger
    )

export default router