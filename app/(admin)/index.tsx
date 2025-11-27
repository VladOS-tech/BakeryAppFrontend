import { API_BASE_URL } from '@/constants/config';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';


import ProductsList from '@/components/ProductList';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

function formatDateRuFull(dateString: string): string {
    const months = [
      "января", "февраля", "марта", "апреля",
      "мая", "июня", "июля", "августа",
      "сентября", "октября", "ноября", "декабря"
    ];
    const weekdays = [
      "воскресенье", "понедельник", "вторник", "среда",
      "четверг", "пятница", "суббота"
    ];
  
    const [year, month, day] = dateString.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    const weekday = weekdays[dateObj.getDay()];
    return `${weekday}, ${Number(day)} ${months[Number(month)-1]} ${year} года`;
  }
  

export default function MainPage() {
  const router = useRouter();
  const [tab, setTab] = useState('bakeries');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
const yyyy = now.getFullYear();
const mm = String(now.getMonth() + 1).padStart(2, '0');
const dd = String(now.getDate()).padStart(2, '0');
const today = `${yyyy}-${mm}-${dd}`;

useEffect(() => {
  const fetchRequests = async () => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');
    fetch(`${API_BASE_URL}/requests?date=${today}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading requests:", err);
        setLoading(false);
      });
  };
  fetchRequests();
}, []);


  const hasRequest = requests.length > 0;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Заявка на {formatDateRuFull(today)}</Text>
      {hasRequest && (
        <TabSwitcher tab={tab} setTab={setTab} />
      )}

      {loading && <Text style={styles.text}>Загрузка...</Text>}

      {!loading && !hasRequest && (
        <Text style={styles.text}>Заявок на сегодня нет.</Text>
      )}
      {!loading && hasRequest && tab === 'bakeries' && (
        <BakeryRequestsList
          requests={requests}
          onRequestPress={(id) => router.push(`/bakeries/1/requests/${id}`)}
        />
      )}

      {!loading && hasRequest && tab === 'warehouses' && (
        <WarehouseProductsList requests={requests} />
      )}

      {!loading && hasRequest && tab === 'products' && (
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
