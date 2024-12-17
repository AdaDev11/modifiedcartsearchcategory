import { makeAutoObservable, runInAction } from "mobx";
import axios from "axios";
import { configure } from "mobx";

export interface Product {
    id: number;
    title: string;
    category: string;
    price: number;
    images: string[];
    description: string;
    quantity: number;
    thumbnail: string;
}

configure({
    enforceActions: "always",
});

class ProductStore {
    products: Product[] = [];
    isLoading: boolean = false;
    totalProducts: number = 0;
    limit: number = 4;
    skip: number = 0;
    searchQuery: string = "";
    cart: { product: Product; quantity: number }[] = [];
    cartAll: { product: Product; quantity: number }[] = [];
    asc: string = "asc";

    constructor() {
        makeAutoObservable(this);
    }

    async fetchProducts() {
        this.isLoading = true;
        try {
            const response = await axios.get(
                `https://dummyjson.com/products?limit=${this.limit}&skip=${this.skip}&select=title,price,description,category,images`
            );
            this.products = response.data.products;
            this.totalProducts = response.data.total;
            runInAction(() => {
                this.totalProducts = response.data.length;
            });
        } catch (error) {
            console.error("Error fetch:", error);
        } finally {
            runInAction(() => {
                this.isLoading = false;
            });
        }
    }

    async searchProducts(query: string) {
        this.isLoading = true;
        try {
            const res = await axios.get(
                `https://dummyjson.com/products/search?q=${query}`
            );
            console.log("search fetching data: " + res.data);
            this.products = res.data.products;
            console.log("products search " + this.products);
            this.totalProducts = res.data.total;
        } catch (error) {
            console.error("Search error: ", error);
        } finally {
            this.isLoading = false;
        }
    }

    async filterCategories(category: string) {
        this.isLoading = true;
        try {
            const res = await axios.get(
                `https://dummyjson.com/products/category/${category}`
            );
            this.products = res.data.products;
        } catch (error) {
            console.error("Categories fetching error ", error);
        } finally {
            this.isLoading = false;
        }
    }

    async sortproductsAscDesc() {
        this.isLoading = true;
        try {
            const res = await axios.get(
                `https://dummyjson.com/products?sortBy=title&order=${this.asc}`
            );
            this.products = res.data.products;
            this.asc = this.asc === "asc" ? "desc" : "asc";
        } catch (error) {
            console.error("Sorting products error: ", error);
        } finally {
            this.isLoading = false;
        }
    }

    setPage(page: number) {
        this.skip = (page - 1) * this.limit;
        this.fetchProducts();
    }

    async addToCart(userId: number, products: { product: Product; quantity: number }[]) {
        try {
            const newProduct = products[0];
            const existingItem = this.cart.find(
                (item) => item.product.id === newProduct.id
            );

            if (existingItem) {
                existingItem.quantity += newProduct.quantity;
                this.changeQuantity(
                    existingItem.product.id,
                    existingItem.quantity
                );
            } else {
                const res = await axios.post(
                    "https://dummyjson.com/carts/add",
                    {
                        userId,
                        products,
                    }
                );

                const cartData = res.data;

                const newCart = cartData.products.map((product: Product) => ({
                    product: {
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        thumbnail: product.thumbnail,
                    },
                    quantity: product.quantity,
                    total: product.total,
                    discountedPrice: product.discountedPrice,
                }));

                this.cart = [...this.cart, ...newCart];
            }

            console.log("Updated cart:", this.cart);
        } catch (error) {
            console.error("Add to cart error:", error);
        }
    }

    get totalPrice() {
        return this.cart.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
        );
    }

    changeQuantity = (id: number, newQuantity: number) => {
        const item = this.cart.find((cartItem) => cartItem.product.id === id);
        if (item) {
            item.quantity = newQuantity;
        }
    };

    removeFromCart = (id: number) => {
        this.cart = this.cart.filter((cartItem) => cartItem.product.id !== id);
    };
}

const productStore = new ProductStore();
export default productStore;
