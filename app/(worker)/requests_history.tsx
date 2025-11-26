import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import ProductsList from '@/components/ProductList';

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
interface Bakery {
  id: number;
  name: string;
}
interface Request {
  id: number;
  bakery: Bakery;
  bakery_id: number;
  request_items: RequestItem[];
  request_date: string;
}

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

export default function BakeryRequestsHistoryPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      const bakeryId = await AsyncStorage.getItem('bakeryId');

      const res = await fetch('http://localhost:3000/requests', {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (res.ok) {
        const data: Request[] = await res.json();
        const myBakeryRequests = data.filter(
          r => String(r.bakery_id) === String(bakeryId)
        );
        setRequests(myBakeryRequests);
      }

      setLoading(false);
    };

    fetchRequests();
  }, []);

  // Группируем по датам
  const requestsByDate: Record<string, Request[]> = {};
  requests.forEach((req) => {
    if (!requestsByDate[req.request_date]) {
      requestsByDate[req.request_date] = [];
    }
    requestsByDate[req.request_date].push(req);
  });
  const dates = Object.keys(requestsByDate).sort((a, b) => b.localeCompare(a));

  return (
    <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← На главный экран</Text>
      </TouchableOpacity>
      <Text style={styles.header}>История заявок булочной</Text>
      {loading ? (
        <Text style={styles.text}>Загрузка...</Text>
      ) : requests.length === 0 ? (
        <Text style={styles.text}>Для этой булочной ещё нет заявок.</Text>
      ) : !selectedDate ? (
        // список дат
        <FlatList
          data={dates}
          keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dateCard}
              onPress={() => setSelectedDate(item)}
            >
              <Text style={styles.dateText}>
                Заявка на {formatDateRuFull(item)}
              </Text>
            </TouchableOpacity>
          )}
        />
      ) : (
        // подробности по дате: только по продуктам
        <ScrollView style={styles.detailBlock}>
          <View style={styles.backRow}>
            <TouchableOpacity onPress={() => setSelectedDate(null)}>
              <Text style={styles.backText}>← Назад</Text>
            </TouchableOpacity>
            <Text style={styles.selectedDateLabel}>
              {formatDateRuFull(selectedDate)}
            </Text>
          </View>

          <ProductsList requests={requestsByDate[selectedDate]} />
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
});
