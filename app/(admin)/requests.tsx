import { useNavigation } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ProductsList from '@/components/ProductList';
import BakeryRequestsList from '../../components/BakeryRequestsList';
import TabSwitcher from '../../components/TabSwitcher';
import WarehouseProductsList from '../../components/WarehouseProductsList';

interface Product {
  id: number;
  name: string;
  price: number;
  warehouse: Warehouse;
}

interface Warehouse {
  id: number;
  name: string;
}

interface RequestItem {
  id: number;
  quantity: number;
  product: Product;
}

interface Bakery {
  id: number;
  name: string;
}

interface Request {
  id: number;
  bakery: Bakery;
  request_items: RequestItem[];
  request_date: string;
}

const TABS = [
  { key: 'bakeries', label: 'По булочным' },
  { key: 'warehouses', label: 'По складам' },
  { key: 'products', label: 'По продуктам' },
];

export default function RequestsPage() {
  const router = useRouter();
  const navigation = useNavigation();
  const [tab, setTab] = useState('bakeries');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().slice(0, 10); // Формат YYYY-MM-DD

  // Загрузка данных с backend при монтировании компонента
  useEffect(() => {
    fetch(`http://localhost:3000/requests?date=${today}`)
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading requests:", err);
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Заявка на {today}</Text>
      <TabSwitcher tab={tab} setTab={setTab} />

      {loading && <Text style={styles.text}>Загрузка...</Text>}

      {!loading && tab === 'bakeries' && (
        <BakeryRequestsList
          requests={requests}
          onRequestPress={(id) => router.push(`/bakeries/1/requests/${id}`)} // Пример с bakeryId=1, подкорректируйте
        />
      )}

      {!loading && tab === 'warehouses' && (
        
        <WarehouseProductsList requests={requests} />
      )}

      {!loading && tab === 'products' && (
        <ProductsList requests={requests} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 20 },
  header: { fontSize: 20, color: '#fff', marginBottom: 15, textAlign: 'center' },
  text: { color: '#fff', fontSize: 16, textAlign: 'center', marginTop: 20 },
});
