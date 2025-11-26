// app/boss/audit_history.tsx (путь подставь свой)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuditLog {
  id: number;
  action: string;
  subject_type: string;
  subject_id: number;
  data: any;
  created_at: string;
  user: User;
}

function formatDateTimeRu(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${dd}.${mm}.${yyyy} ${hh}:${min}`;
}

function humanAction(log: AuditLog): string {
  switch (log.action) {
    case 'request.create':
      return 'Создана заявка';
    case 'request.update':
      return 'Изменена заявка';
    case 'request.destroy':
      return 'Удалена заявка';
    case 'request_item.create':
      return 'Добавлен товар в заявку';
    case 'request_item.update':
      return 'Изменено количество в заявке';
    case 'request_item.destroy':
      return 'Удалён товар из заявки';
    default:
      return log.action;
  }
}

export default function AuditHistoryPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadLogs = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const res = await fetch('http://localhost:3000/audit_logs', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data: AuditLog[] = await res.json();
        setLogs(data);
      } else {
        // опционально: показать ошибку
      }

      setLoading(false);
    };

    loadLogs();
  }, []);

  const renderItem = ({ item }: { item: AuditLog }) => (
    <View style={styles.logCard}>
      <Text style={styles.time}>{formatDateTimeRu(item.created_at)}</Text>
      <Text style={styles.user}>
        {item.user?.name || 'Неизвестный пользователь'}
      </Text>
      <Text style={styles.action}>{humanAction(item)}</Text>

      {/* Краткая конкретика по заявкам */}
      {item.subject_type === 'Request' && (
        <Text style={styles.details}>
          Булочная: {item.data?.bakery_name || `ID ${item.data?.bakery_id}`},
          дата заявки: {item.data?.request_date}
        </Text>
      )}

      {item.subject_type === 'RequestItem' && (
        <Text style={styles.details}>
          Булочная: {item.data?.bakery_name || `ID ${item.data?.bakery_id}`},{" "}
          товар: {item.data?.product_name || `ID ${item.data?.product_id}`},{" "}
          количество:{" "}
          {item.data?.old_quantity != null
            ? `${item.data.old_quantity} → ${item.data.new_quantity}`
            : item.data?.quantity}
        </Text>
      )}

    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Журнал действий работников</Text>

      {loading ? (
        <ActivityIndicator color="#42a5f5" />
      ) : logs.length === 0 ? (
        <Text style={styles.text}>Пока нет записей в журнале.</Text>
      ) : (
        <FlatList
          data={logs}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111', padding: 20 },
  backText: { color: '#42a5f5', marginBottom: 10, fontSize: 16 },
  header: { fontSize: 22, color: '#fff', marginBottom: 10, fontWeight: 'bold' },
  text: { color: '#aaa', textAlign: 'center', marginTop: 40 },
  logCard: { backgroundColor: '#232428', borderRadius: 14, padding: 14, marginBottom: 10 },
  time: { color: '#bbb', fontSize: 13, marginBottom: 2 },
  user: { color: '#fff', fontWeight: '600', fontSize: 15 },
  action: { color: '#42a5f5', marginTop: 2, fontSize: 14 },
  details: { color: '#ccc', marginTop: 4, fontSize: 13 },
});
