import RequestForm from '@/components/RequestForm';
import { logout } from '@/constants/auth';
import { API_BASE_URL } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Product {
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
  user_id: number;
  bakery_id: number;
  request_items: RequestItem[];
  request_date: string;
}

function formatDateRuFull(dateString: string): string {
  const months = [
    "января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа",
    "сентября", "октября", "ноября", "декабря"
  ];
  const weekdays = [
    "воскресенье", "понедельник", "вторник", "среда",
    "четверг", "пятница", "суббота"
  ];
  const [year, month, day] = dateString.split('-');
  const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
  

  return `${weekdays[dateObj.getDay()]}, ${Number(day)} ${months[Number(month)-1]} ${year} года`;
}

export default function WorkerHomePage({ navigation }: any) {
  const [requestToday, setRequestToday] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [userName, setUserName] = useState('');
  const [bakeryName, setBakeryName] = useState('');
  const [creating, setCreating] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const hour = now.getHours();
  const canEdit = hour >= 6 && hour < 14;
  const today = new Date().toISOString().slice(0,10);
  const [editing, setEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadInfo = async () => {
      const userName = await AsyncStorage.getItem('userName');
      const bakeryName = await AsyncStorage.getItem('bakeryName');
      setUserName(userName || '');
      setBakeryName(bakeryName || '');
      setProfileLoading(false);
    };
    loadInfo();
  }, []);

  useEffect(() => {
    const fetchRequest = async () => {
      const token = await AsyncStorage.getItem('token');
      const userId = await AsyncStorage.getItem('userId');
      const bakeryId = await AsyncStorage.getItem('bakeryId');
      const res = await fetch(`${API_BASE_URL}/requests?date=${today}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data: Request[] = await res.json();
        // Находим заявку именно текущего пользователя!
        const bakeryRequest = data.find(r => String(r.bakery_id) === String(bakeryId));
        setRequestToday(bakeryRequest || null);
      }
      setLoading(false);
    };
    fetchRequest();
  }, [now, creating]);
  

  const loadProducts = async () => {
    setProductsLoading(true);
    const token = await AsyncStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/products`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) setProducts(await res.json());
    setProductsLoading(false);
  };

  const handleCreate = async (items: { product_id: number; quantity: number }[]) => {
    const token = await AsyncStorage.getItem('token');
    const bakeryId = await AsyncStorage.getItem('bakeryId');
    const userId = await AsyncStorage.getItem('userId');
    const today = new Date().toISOString().slice(0,10);

    const requestRes = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        request: {
          user_id: Number(userId),
          bakery_id: Number(bakeryId),
          request_date: today
        }
      })
    });
    if (!requestRes.ok) {
      if (requestRes.status === 422 || requestRes.status === 409) {
        alert('На эту дату заявка для этой булочной уже существует');
      } else {
        alert('Ошибка при создании заявки');
      }
      return;
    }

    const requestData = await requestRes.json();
    const requestId = requestData.id;
    await Promise.all(items.map(async ({ product_id, quantity }) => {
      await fetch(`${API_BASE_URL}/request_items`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          request_item: {
            request_id: requestId,
            product_id,
            quantity
          }
        })
      });
    })); 

    setCreating(false);
    setNow(new Date());

    /*if (requestRes.ok) {
      setCreating(false);
      setNow(new Date()); // Обновить заявки
    } else {
      alert("Ошибка при создании заявки");
    }*/
  };

  const handleUpdate = async (
    items: {
      product_id: number;
      quantity: number;
      request_item_id?: number;
    }[]
  ) => {
    if (!requestToday) return;

    const token = await AsyncStorage.getItem('token');

    const oldByProductId: Record<number, RequestItem> = Object.fromEntries(
      requestToday.request_items.map(ri => [ri.product.id, ri])
    );

    const newByProductId: Record<
      number,
      { product_id: number; quantity: number; request_item_id?: number }
    > = Object.fromEntries(items.map(i => [i.product_id, i]));

    const toDelete = requestToday.request_items.filter(
      ri => !newByProductId[ri.product.id]
    );

    const toUpdate = items.filter(i => {
      const old = oldByProductId[i.product_id];
      return old && old.quantity !== i.quantity;
    });

    const toCreate = items.filter(i => !oldByProductId[i.product_id]);

    // DELETE
    await Promise.all(
      toDelete.map(ri =>
        fetch(`${API_BASE_URL}/request_items/${ri.id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    );

    // PATCH
    await Promise.all(
      toUpdate.map(i => {
        const ri = oldByProductId[i.product_id];
        return fetch(`${API_BASE_URL}/request_items/${ri.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            request_item: { quantity: i.quantity },
          }),
        });
      })
    );

    // POST
    await Promise.all(
      toCreate.map(i =>
        fetch(`${API_BASE_URL}/request_items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            request_item: {
              request_id: requestToday.id,
              product_id: i.product_id,
              quantity: i.quantity,
            },
          }),
        })
      )
    );

    setEditing(false);
    setNow(new Date());
  };

  if (loading || profileLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Загрузка...</Text>
      </View>
    );
  }

  if (creating) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Создание заявки</Text>
        {productsLoading
          ? <Text style={styles.text}>Загрузка товаров...</Text>
          : (
            <RequestForm
              products={products}
              onSubmit={handleCreate}
              submitLabel="Создать заявку"
            />
          )}
        <TouchableOpacity style={[styles.addButton, { marginTop: 30 }]} onPress={() => setCreating(false)}>
          <Text style={styles.addButtonText}>Отмена</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (editing && requestToday) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.header}>Редактирование заявки</Text>
        {productsLoading ? (
          <Text style={styles.text}>Загрузка товаров...</Text>
        ) : (
          <RequestForm
            products={products}
            // Преобразуем request_items в формат initialItems для формы
            initialItems={Object.fromEntries(
              requestToday.request_items.map(ri => [ri.product.id, ri.quantity])
            )}
            onSubmit={handleUpdate}
            submitLabel="Сохранить изменения"
          />
        )}
  
        <TouchableOpacity
          style={[styles.addButton, { marginTop: 30 }]}
          onPress={() => setEditing(false)}
        >
          <Text style={styles.addButtonText}>Отмена</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }
  

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        Добро пожаловать{userName ? `, ${userName}` : ""}!
      </Text>
      <Text style={styles.bakeryInfo}>
        Булочная: <Text style={styles.bakeryName}>{bakeryName}</Text>
      </Text>
      <Text style={styles.subHeader}>Заявка на {formatDateRuFull(today)}</Text>

      {!requestToday && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={async () => { await loadProducts(); setCreating(true); }}
        >
          <Text style={styles.addButtonText}>Создать заявку на сегодня</Text>
        </TouchableOpacity>
      )}

{requestToday && (
  <View style={styles.requestCard}>
    <Text style={styles.sectionTitle}>Ваша заявка:</Text>
    {requestToday.request_items.map(item => (
      <Text style={styles.product} key={item.id}>
        - {item.product.name}: {item.quantity} шт.
      </Text>
    ))}

    {/* ВРЕМЕННО: редактирование всегда доступно */}
    <TouchableOpacity
      style={styles.editButton}
      onPress={async () => {
        await loadProducts();
        setEditing(true);
      }}
    >
      <Text style={styles.addButtonText}>Изменить заявку</Text>
    </TouchableOpacity>

    {/*
    {canEdit ? (
      <TouchableOpacity
        style={styles.editButton}
        onPress={async () => {
          await loadProducts();
          setEditing(true);
        }}
      >
        <Text style={styles.addButtonText}>Изменить заявку</Text>
      </TouchableOpacity>
    ) : (
      <Text style={styles.disabledEdit}>
        Редактирование доступно с 06:00 до 14:00
      </Text>
    )}
    */}
  </View>
)}


    <TouchableOpacity
      style={styles.historyButton}
      onPress={() => router.push('/requests_history')} // путь подставь свой
    >
      <Text style={styles.historyButtonText}>История заявок</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.logoutButton}
      onPress={logout}
    >
      <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
    </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 20 },
  header: { fontSize: 22, color: '#fff', marginBottom: 6, fontWeight: "bold" },
  subHeader: { fontSize: 18, color: '#fff', textAlign: 'center', marginBottom: 14 },
  bakeryInfo: { color: "#aaa", marginBottom: 4, fontSize: 15 },
  bakeryName: { color: "#42a5f5", fontWeight: "600" },
  addButton: { backgroundColor: "#42a5f5", borderRadius: 10, alignItems: 'center', padding: 14, marginVertical: 16 },
  addButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  requestCard: { backgroundColor: "#232428", borderRadius: 15, padding: 18, marginVertical: 13 },
  sectionTitle: { color: "#fff", fontWeight: "bold", fontSize: 16, marginBottom: 11 },
  product: { color: "#fff", fontSize: 15, marginLeft: 7, marginTop: 4 },
  editButton: { marginTop: 18, alignSelf: 'flex-start', backgroundColor: "#42a5f5", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 },
  disabledEdit: { marginTop: 12, color: "#888", fontSize: 14, fontWeight: "bold" },
  historyButton: { marginTop: 35, alignSelf: 'center', padding: 10 },
  historyButtonText: { color: "#42a5f5", fontSize: 16, fontWeight: "bold" },
  text: { color: "#aaa", fontSize: 15, textAlign: "center", marginTop: 22 },
  logoutButton: {
    marginTop: 10,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#f44336',
  },
  logoutButtonText: {
    color: '#f44336',
    fontSize: 15,
    fontWeight: '600',
  },

});
