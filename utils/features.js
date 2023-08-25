class Features {
  constructor(products, sortByPrice, name) {
    this.products = products;
    this.sortByPrice = sortByPrice;
    this.name = name;
  }


  sort() {
    if (this.sortByPrice) {
      this.products.sort((a, b) => {
        return a.price - b.price;
      });
    }
  }

  search() {
    if (this.name) {
      const filteredProduct = this.products.filter((product) => {
        return product.name == this.name;
      });
      // console.log(filteredProduct);
      this.products = filteredProduct;
    }
    return this.products;
  }
}

module.exports = Features;
