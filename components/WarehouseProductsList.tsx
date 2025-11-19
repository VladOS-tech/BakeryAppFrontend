import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

interface Warehouse {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  warehouse: Warehouse;
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

const WarehouseProductsList: React.FC<Props> = ({ requests }) => {
  // Группируем товары по складам с суммированием количества
  const warehouseMap: { [key: number]: { warehouse: Warehouse; products: { [key: number]: { product: Product; quantity: number } } } } = {};

  requests.forEach((request) => {
    request.request_items.forEach((item) => {
      const wh = item.product.warehouse;
      if (!warehouseMap[wh.id]) {
        warehouseMap[wh.id] = { warehouse: wh, products: {} };
      }
      if (!warehouseMap[wh.id].products[item.product.id]) {
        warehouseMap[wh.id].products[item.product.id] = { product: item.product, quantity: 0 };
      }
      warehouseMap[wh.id].products[item.product.id].quantity += item.quantity;
    });
  });

  // Преобразуем объект в массив для FlatList
  const warehouses = Object.values(warehouseMap);

  return (
    <FlatList
      data={warehouses}
      keyExtractor={(item) => item.warehouse.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.warehouseBlock}>
          <Text style={styles.warehouseName}>{item.warehouse.name}</Text>
          {Object.values(item.products).map(({ product, quantity }) => (
            <View key={product.id} style={styles.productRow}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productQuantity}>{quantity} шт.</Text>
            </View>
          ))}
        </View>
      )}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  listContent: { paddingBottom: 30 },
  warehouseBlock: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 8,
  },
  warehouseName: {
    color: '#0af',
    fontSize: 20,
    marginBottom: 10,
    fontWeight: '700',
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  productName: { color: '#fff', fontSize: 16 },
  productQuantity: { color: '#aaa', fontSize: 16 },
});

export default WarehouseProductsList;
