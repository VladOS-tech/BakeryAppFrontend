import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface RequestItem {
  id: number;
  quantity: number;
  product: Product;
}

interface Request {
  id: number;
  request_items: RequestItem[];
  request_date: string;
}

interface Props {
  requests: Request[];
}

const ProductsList: React.FC<Props> = ({ requests }) => {
  // Группировка: суммируем разные позиции одного товара
  const productMap: { [key: number]: { product: Product; quantity: number } } = {};

  requests.forEach((request) => {
    request.request_items.forEach((item) => {
      if (!productMap[item.product.id]) {
        productMap[item.product.id] = { product: item.product, quantity: 0 };
      }
      productMap[item.product.id].quantity += item.quantity;
    });
  });

  const products = Object.values(productMap);

  if (!products.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Нет продуктов в заявках</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.product.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.productRow}>
          <Text style={styles.productName}>{item.product.name}</Text>
          <Text style={styles.productQuantity}>{item.quantity} шт.</Text>
        </View>
      )}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { color: '#aaa', fontSize: 16 },
  listContent: { paddingBottom: 30 },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
  },
  productName: { color: '#fff', fontSize: 16 },
  productQuantity: { color: '#0af', fontSize: 16 },
});

export default ProductsList;
