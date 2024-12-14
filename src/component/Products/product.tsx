import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import productStore from "./MOBXProductsStore";
import {
    Card,
    Image,
    Pagination,
    Loader,
    Text,
    Modal,
    Button,
    Stack,
    Divider,
    Group,
    TextInput,
    Checkbox,
    Burger,
    Anchor,
} from "@mantine/core";
import "@mantine/core/styles.css";
import { debounce } from "lodash";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import "./products.css";

const OrderForm = observer(() => {
    interface Product {
        id: number;
        title: string;
        category: string;
        price: number;
        images: string[];
        description: string;
    }

    useEffect(() => {
        productStore.fetchProducts();
    }, []);

    const [selectedProduct, setSelectedProduct] = useState<Product | null>(
        null
    );
    const [cartOpened, setCartOpened] = useState(false);

    const handleOpenCart = () => setCartOpened(true);
    const handleCloseCart = () => setCartOpened(false);
    const [search, setSearch] = useState("");
    const [selectCategoryValue, setSelectCategoryValue] = useState("");
    const [orderModalOpened, setOrderModalOpened] = useState(false);
    const [opened, { toggle }] = useDisclosure(false);

    const form = useForm({
        mode: "uncontrolled",
        initialValues: {
            email: "",
            termsOfService: false,
        },

        validate: {
            email: (value) =>
                /^\S+@\S+$/.test(value) ? null : "Invalid email",
        },
    });

    const debouncedSearch = debounce((query) => {
        productStore.searchProducts(query);
    }, 300);

    const handelSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        setSearch(query);
        console.log(query);
        if (query.trim()) {
            debouncedSearch(query);
        } else {
            productStore.fetchProducts();
        }
    };

    const handleCategory = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        await productStore.filterCategories(value);
        setSelectCategoryValue(value);
        console.log("category" + value);
    };

    return (
        <>
            {selectedProduct && (
                <Modal
                    opened={!!selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    title={selectedProduct.title}
                >
                    <Image
                        src={selectedProduct.images[0]}
                        alt={selectedProduct.title}
                        height={200}
                        fit="cover"
                    />
                    <Text>{selectedProduct.description}</Text>
                    <Text>{selectedProduct.price}$</Text>
                    <Button
                        variant="light"
                        color="blue"
                        fullWidth
                        mt="md"
                        onClick={() => productStore.addToCart(selectedProduct)}
                    >
                        Add to Cart
                    </Button>
                </Modal>
            )}
            <Modal
                opened={orderModalOpened}
                onClose={() => setOrderModalOpened(false)}
                title="Confirm Your Order"
            >
                <Stack>
                    <Text>
                        Order Summary
                    </Text>
                    {productStore.cart.map(({ product, quantity }) => (
                        <Group key={product.id}>
                            <Text>{product.title}</Text>
                            <Text>x{quantity}</Text>
                            <Text>
                                ${(product.price * quantity).toFixed(2)}
                            </Text>
                        </Group>
                    ))}
                    <Divider />
                    <Text>
                        Total: ${productStore.totalPrice.toFixed(2)}
                    </Text>

                    <form
                        onSubmit={form.onSubmit((values) =>
                            console.log(values)
                        )}
                    >
                        <Stack>
                            <TextInput
                                withAsterisk
                                label="Name"
                                placeholder="Name"
                                key={form.key("name")}
                                {...form.getInputProps("name")}
                            />

                            <TextInput
                                withAsterisk
                                label="Name"
                                placeholder="Addres"
                                key={form.key("addres")}
                                {...form.getInputProps("addres")}
                            />

                            <TextInput
                                withAsterisk
                                label="Name"
                                placeholder="Phone number"
                                key={form.key("phone number")}
                                {...form.getInputProps("phone number")}
                            />
                        </Stack>
                    </form>

                    <Checkbox
                        mt="md"
                        label="I agree to sell my privacy"
                        key={form.key("termsOfService")}
                        {...form.getInputProps("termsOfService", {
                            type: "checkbox",
                        })}
                    />

                    <Button
                        variant="filled"
                        color="green"
                        onClick={() => {
                            alert("Order placed successfully!");
                            setOrderModalOpened(false);
                        }}
                    >
                        Confirm Order
                    </Button>
                </Stack>
            </Modal>
            {cartOpened && (
                <Modal
                    opened={cartOpened}
                    onClose={handleCloseCart}
                    title="Shopping Cart"
                >
                    {productStore.cart.length === 0 ? (
                        <Text>Cart is empty</Text>
                    ) : (
                        <Stack>
                            {productStore.cart.map(({ product, quantity }) => (
                                <Card
                                    key={product.id}
                                    shadow="sm"
                                    padding="lg"
                                    radius="md"
                                >
                                    <Group>
                                        <Image
                                            src={product.images[0]}
                                            alt={product.title}
                                            width={50}
                                            height={50}
                                        />
                                        <Stack style={{ flex: 1 }}>
                                            <Text>{product.title}</Text>
                                            <Group>
                                                <Button
                                                    onClick={() =>
                                                        productStore.changeQuantity(
                                                            product.id,
                                                            quantity - 1
                                                        )
                                                    }
                                                >
                                                    -
                                                </Button>
                                                <Text>{quantity}</Text>
                                                <Button
                                                    onClick={() =>
                                                        productStore.changeQuantity(
                                                            product.id,
                                                            quantity + 1
                                                        )
                                                    }
                                                >
                                                    +
                                                </Button>
                                            </Group>
                                            <Text>
                                                {(
                                                    product.price * quantity
                                                ).toFixed(2)}
                                                $
                                            </Text>
                                        </Stack>
                                        <Button
                                            color="red"
                                            onClick={() =>
                                                productStore.removeFromCart(
                                                    product.id
                                                )
                                            }
                                        >
                                            Remove
                                        </Button>
                                    </Group>
                                </Card>
                            ))}
                            <Divider />
                            <Text>
                                Total: {productStore.totalPrice.toFixed(2)}$
                            </Text>
                            <Button
                                variant="filled"
                                color="green"
                              onClick={() => {
                                setOrderModalOpened(true); 
                                handleCloseCart(); 
                                 alert("Order placed successfully!");
                                    }}
                            >
                                Confirm Order
                            </Button>
                        </Stack>
                    )}
                </Modal>
            )}
            <header className="header">
                <div className="inner">
                    <Group className="links">
                        <Burger
                            opened={opened}
                            onClick={toggle}
                            hiddenFrom="sm"
                        />
                    </Group>

                    <Group className="links">
                        <Anchor
                            href="#"
                            className="link"
                            onClick={handleOpenCart}
                        >
                            <span className="cartCount">
                                {productStore.cart.length}
                            </span>
                        </Anchor>

                        <Anchor href="#" className="link">
                            Categories: {selectCategoryValue}
                            <select onChange={handleCategory}>
                                <option value="beauty">Beauty</option>
                                <option value="fragrances">Fragrances</option>
                                <option value="furniture">Furniture</option>
                                <option value="groceries">Groceries</option>
                                <option value="home-decoration">
                                    Home-decoration
                                </option>
                                <option value="kitchen-accessories">
                                    Kitchen-accessories
                                </option>
                                <option value="laptops">Laptops</option>
                                <option value="mens-shirts">Mens-shirts</option>
                                <option value="mens-shoes">Mens-shoes</option>
                                <option value="mens-watches">
                                    Mens-watches
                                </option>
                                <option value="motorcycle">Motorcycle</option>
                                <option value="skin-care">Skin-care</option>
                                <option value="smartphones">Smartphones</option>
                                <option value="sports-accessories">
                                    Sports-accessories
                                </option>
                                <option value="sunglasses">Sunglasses</option>
                                <option value="tablets">Tablets</option>
                                <option value="tops">Tops</option>
                                <option value="vehicle">Vehicle</option>
                                <option value="womens-bags">Womens-bags</option>
                                <option value="womens-dresses">
                                    Womens-dresses
                                </option>
                                <option value="womens-shoes">
                                    Womens-shoes
                                </option>
                                <option value="womens-watches">
                                    Womens-watches
                                </option>
                            </select>
                        </Anchor>
                    </Group>

                    <input
                        className="input"
                        placeholder="Search products"
                        value={search}
                        onChange={handelSearch}
                    />
                </div>
            </header>
            <h1>Products</h1>

            <Pagination
               
                total={Math.ceil(
                    (Number(productStore.totalProducts) || 0) / (Number(productStore.limit) || 1)
                )}
                onChange={(page) => productStore.setPage(page)}
                className="pagination"
            />
            {productStore.isLoading ? (
                <div className="loader">
                    <Loader/>
                </div>
            ) : (
                <div className="product-grid">
                    {productStore.products.map((product) => (
                        <div className="card" key={product.id}>
                            <img
                                className="card-image"
                                onClick={() => setSelectedProduct(product)}
                                src={
                                    product.images && product.images[0]
                                        ? product.images[0]
                                        : ""
                                }
                                alt={product.title}
                            />
                            <div className="card-title">{product.title}</div>
                            <div className="card-price">${product.price}</div>
                            <div className="card-buttons">
                                <button
                                    onClick={() => setSelectedProduct(product)}
                                >
                                    View
                                </button>
                                <button
                                    onClick={() =>
                                        productStore.addToCart(product)
                                    }
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
});

export default OrderForm;
