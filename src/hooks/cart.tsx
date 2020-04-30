import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const dataString = await AsyncStorage.getItem('@GoMarketplace:cart');
      if (dataString) setProducts(JSON.parse(dataString));
    }

    loadProducts();
  }, []);

  const increment = useCallback(
    async id => {
      const product = products.map(i =>
        i.id === id ? { ...i, quantity: i.quantity + 1 } : i,
      );

      setProducts(product);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(product),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const product = products.map(i =>
        i.id === id ? { ...i, quantity: i.quantity - 1 } : i,
      );

      setProducts(product);

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(product),
      );
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const findProduct = products.find(i => i.id === product.id);

      if (findProduct) {
        increment(product.id);
      } else {
        setProducts(oldProducts => [
          ...oldProducts,
          { ...product, quantity: 1 },
        ]);
      }

      await AsyncStorage.setItem(
        '@GoMarketplace:cart',
        JSON.stringify(products),
      );
    },
    [increment, products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
