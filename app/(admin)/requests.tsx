import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ProductsList from '@/components/ProductList';
import { API_BASE_URL } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BakeryRequestsList from '../../components/BakeryRequestsList';
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

// Формат "среда, 19 ноября 2025"
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
  return `${weekday}, ${Number(day)} ${months[Number(month) - 1]} ${year}`;
}

export default function RequestsHistoryPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tab, setTab] = useState<'bakeries' | 'warehouses' | 'products'>('bakeries');

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      fetch(`${API_BASE_URL}/requests`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setRequests(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };
    fetchRequests();
  }, []);
  

  // Группируем заявки по датам
  const requestsByDate: Record<string, Request[]> = {};
  requests.forEach((req) => {
    if (!requestsByDate[req.request_date]) {
      requestsByDate[req.request_date] = [];
    }
    requestsByDate[req.request_date].push(req);
  });
  const dates = Object.keys(requestsByDate).sort((a, b) => b.localeCompare(a)); // свежие вверх

  return (
    <View style={styles.container}>
      <Text style={styles.header}>История заявок</Text>
      {loading ? (
        <Text style={styles.text}>Загрузка...</Text>
      ) : !selectedDate ? (
        // Список дат
        <FlatList
          data={dates}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dateCard}
              onPress={() => {
                setSelectedDate(item);
                setTab('bakeries');
              }}
            >
              <Text style={styles.dateText}>Заявка на {formatDateRuFull(item)}</Text>
              <Text style={styles.countText}>Булочных: {requestsByDate[item].length}</Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        // Страница подробностей по дате
        <ScrollView style={styles.detailBlock}>
          <View style={styles.backRow}>
            <TouchableOpacity onPress={() => setSelectedDate(null)}>
              <Text style={styles.backText}>← Назад</Text>
            </TouchableOpacity>
            <Text style={styles.selectedDateLabel}>
              {formatDateRuFull(selectedDate)}
            </Text>
          </View>

          {/* Табы */}
          <View style={styles.tabRow}>
            <TouchableOpacity onPress={() => setTab('bakeries')} style={[styles.tab, tab === 'bakeries' && styles.tabActive]}>
              <Text style={styles.tabText}>По булочным</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTab('warehouses')} style={[styles.tab, tab === 'warehouses' && styles.tabActive]}>
              <Text style={styles.tabText}>По складам</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTab('products')} style={[styles.tab, tab === 'products' && styles.tabActive]}>
              <Text style={styles.tabText}>По продуктам</Text>
            </TouchableOpacity>
          </View>

          {/* Контент выбранного таба */}
          {tab === 'bakeries' && (
            <BakeryRequestsList requests={requestsByDate[selectedDate]} />
          )}
          {tab === 'warehouses' && (
            <WarehouseProductsList requests={requestsByDate[selectedDate]} />
          )}
          {tab === 'products' && (
            <ProductsList requests={requestsByDate[selectedDate]} />
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 20 },
  header: { fontSize: 22, color: "#fff", marginBottom: 10, fontWeight: "bold" },
  text: { color: "#aaa", textAlign: "center", marginTop: 40 },
  dateCard: { backgroundColor: "#232428", borderRadius: 14, padding: 16, marginBottom: 15 },
  dateText: { color: "#42a5f5", fontWeight: "bold", fontSize: 15 },
  countText: { color: "#bbb", fontSize: 14, marginTop: 3 },
  detailBlock: { flex: 1 },
  backRow: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backText: { color: "#42a5f5", marginRight: 18, fontSize: 16 },
  selectedDateLabel: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  tabRow: { flexDirection: 'row', marginBottom: 10, marginTop: 6 },
  tab: { backgroundColor: '#232428', marginRight: 8, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7 },
  tabActive: { backgroundColor: '#42a5f5' },
  tabText: { color: "#fff", fontWeight: "600" },
});
