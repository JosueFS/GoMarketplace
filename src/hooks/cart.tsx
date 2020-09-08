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
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const data = await AsyncStorage.getItem('@GoMktPlace:Products', () =>
        console.log('loaded!'),
      );
      if (data) {
        setProducts([...JSON.parse(data)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productAdded = products.find(p => p.id === product.id);

      if (productAdded) {
        console.log('increment');
        const productIndex = products.findIndex(p => p.id === product.id);
        const newProductList: Product[] = [...products];
        newProductList[productIndex].quantity += 1;

        setProducts(newProductList);

        await AsyncStorage.setItem(
          '@GoMktPlace:Products',
          JSON.stringify(newProductList),
          () => console.log('saved!'),
        );
      } else {
        const List = [...products, { ...product, quantity: 1 }];
        setProducts(List);

        await AsyncStorage.setItem(
          '@GoMktPlace:Products',
          JSON.stringify(List),
          () => console.log('saved!'),
        );
      }
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const productIndex = products.findIndex(p => p.id === id);

      const newProductList: Product[] = [...products];
      newProductList[productIndex].quantity += 1;

      setProducts(newProductList);

      await AsyncStorage.setItem(
        '@GoMktPlace:Products',
        JSON.stringify(newProductList),
        () => console.log('saved!'),
      );
    },

    [products],
  );

  const decrement = useCallback(
    async id => {
      const productIndex = products.findIndex(p => p.id === id);

      const newProductList: Product[] = [...products];

      if (newProductList[productIndex].quantity === 1) {
        newProductList.splice(productIndex, 1);
      } else {
        newProductList[productIndex].quantity -= 1;
      }

      setProducts(newProductList);

      await AsyncStorage.setItem(
        '@GoMktPlace:Products',
        JSON.stringify(newProductList),
        () => console.log('saved!'),
      );
    },

    [products],
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
