import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Типы данных
interface Product {
  id: number;
  name: string;
}

interface Bakery {
  id: number;
  name: string;
}

interface RequestItem {
  id: number;
  quantity: number;
  product: Product;
}

interface Request {
  id: number;
  request_date: string;
  request_items: RequestItem[];
  bakery: Bakery;
  status?: string; // статус можно расширить
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

export default function WorkerHomePage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  // Здесь можно получить ID работника (из auth или props)
  const workerBakeryId = 1; // пример - в реальном проекте подставить из профиля/авторизации

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      fetch(`http://localhost:3000/requests?bakery_id=${workerBakeryId}`, {
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
  

  const navigateToCreateRequest = () => {
    // если используешь Expo Router:
    // router.push("/requests/new")
    Alert.alert('Перейти на страницу создания заявки');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Рабочий кабинет</Text>
      <Text style={styles.bakeryInfo}>Булочная: <Text style={styles.bakeryName}>Кубанская</Text></Text>

      <TouchableOpacity style={styles.addButton} onPress={navigateToCreateRequest}>
        <Text style={styles.addButtonText}>Создать заявку на сегодня</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Ваши последние заявки</Text>
      {loading
        ? <Text style={styles.text}>Загрузка...</Text>
        : <FlatList
            data={requests}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.date}>{formatDateRuFull(item.request_date)}</Text>
                {item.request_items.map(it => (
                  <Text style={styles.product} key={it.id}>
                    {it.product?.name}: {it.quantity} шт.
                  </Text>
                ))}
              </View>
            )}
          />
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", padding: 20 },
  header: { fontSize: 22, color: "#fff", marginBottom: 10, fontWeight: "bold" },
  bakeryInfo: { color: "#aaa", marginBottom: 10, fontSize: 15 },
  bakeryName: { color: "#42a5f5", fontWeight: "600" },
  addButton: { backgroundColor: "#42a5f5", borderRadius: 10, alignItems: 'center', padding: 13, marginVertical: 18 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  sectionTitle: { color: "#fff", fontSize: 17, fontWeight: "bold", marginTop: 18, marginBottom: 7 },
  card: { backgroundColor: "#232428", borderRadius: 13, padding: 15, marginBottom: 13 },
  date: { color: "#4db6ac", fontSize: 15, fontWeight: "600" },
  product: { color: "#fff", fontSize: 15, marginLeft: 7, marginTop: 4 },
  text: { color: "#aaa", textAlign: "center", marginTop: 30 },
});
