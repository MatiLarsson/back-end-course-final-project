export class ProductsDTONewInsert {
  constructor(product) {
    this.timestamp = Date.now(),
    this.name = product.name.trim(),
    this.description = product.description.trim(),
    this.code = Math.random().toString(36).substring(2, 15),
    this.thumbnail = product.thumbnail.trim(),
    this.price = Number(product.price),
    this.stock = Number(product.stock)
  }
}

export class ProductsDTOUpdateInsert {
  constructor(updatedProduct, originalProduct, file) {
    this.timestamp = Date.now(),
    this.name = updatedProduct?.name ? updatedProduct.trim() : originalProduct.name,
    this.description = updatedProduct?.description ? updatedProduct.description.trim() : originalProduct.description,
    this.code = originalProduct?.code,
    this.thumbnail = file?.filename ? file.filename.trim() : originalProduct.thumbnail,
    this.price = updatedProduct?.price ? Number(updatedProduct.price) : originalProduct.price,
    this.stock = updatedProduct?.stock ? Number(updatedProduct.stock) : originalProduct.stock
  }
}