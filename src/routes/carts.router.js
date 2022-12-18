import { Router } from 'express'
import { apiErrorLogger } from '../middlewares/logger.middleware.js'
import cartsController from '../controllers/carts.controller.js'

const router = Router()

router
  .route('/products')
    .get(
      cartsController.getProductsInCart,
      apiErrorLogger
    )
    .post(
      cartsController.addProductToCart,
      apiErrorLogger
    )
    .put(
      cartsController.addOrSubstractOneUnit,
      apiErrorLogger
    )
    .delete(
      cartsController.deleteFromCartOrEmpty,
      apiErrorLogger
    )

router
  .route('/products/confirm')
    .post(
      cartsController.confirmOrder,
      apiErrorLogger
    )

export default router