// app/boss/audit_history.tsx (путь подставь свой)
import { API_BASE_URL } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

  const [mode, setMode] = useState<'today' | 'all'>('today');
  const [selectedBakeryId, setSelectedBakeryId] = useState<number | null>(null);

  const [offset, setOffset] = useState(0);
  const PAGE_SIZE = 50;
  const [hasMore, setHasMore] = useState(true);
  const [allBakeries, setAllBakeries] = useState<{ id: number; name: string }[]>([]);

  const bakeryOptions = React.useMemo(
    () => {
      const map = new Map<number, string>();
      logs.forEach(log => {
        const id = Number(log.data?.bakery_id);
        if (!id) return;
        const name =
          log.data?.bakery_name || `Булочная #${log.data?.bakery_id}`;
        if (!map.has(id)) map.set(id, name);
      });
      return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    },
    [logs]
  );


  const loadLogs = async (reset: boolean) => {
    setLoading(true);
    const token = await AsyncStorage.getItem('token');

    const todayStr = new Date().toISOString().slice(0, 10);
    const params: string[] = [];

    if (mode === 'today') {
      params.push(`from=${todayStr}`, `to=${todayStr}`);
    }

    if (selectedBakeryId) {
      params.push(`bakery_id=${selectedBakeryId}`);
    }

    const currentOffset = reset ? 0 : offset;
    params.push(`limit=${PAGE_SIZE}`, `offset=${currentOffset}`);

    const res = await fetch(
      `${API_BASE_URL}/audit_logs?${params.join('&')}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (res.ok) {
      const data: AuditLog[] = await res.json();
      setHasMore(data.length === PAGE_SIZE);
      setLogs(prev => (reset ? data : [...prev, ...data]));
      setOffset(currentOffset + data.length);

      if (allBakeries.length === 0 && !selectedBakeryId) {
        const map = new Map<number, string>();
        data.forEach(log => {
          const id = Number(log.data?.bakery_id);
          if (!id) return;
          const name =
            log.data?.bakery_name || `Булочная #${log.data?.bakery_id}`;
          if (!map.has(id)) map.set(id, name);
        });
        setAllBakeries(
          Array.from(map.entries()).map(([id, name]) => ({ id, name }))
        );
      }
    }

    setLoading(false);
  };

  React.useEffect(() => {
    loadLogs(true); // первый запуск и при смене режима/булочной
  }, [mode, selectedBakeryId]);

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

      {/* Переключатель режимов */}
      <View style={styles.modeRow}>
        <Text
          style={[
            styles.modeButton,
            mode === 'today' && styles.modeButtonActive,
          ]}
          onPress={() => setMode('today')}
        >
          Сегодня
        </Text>
        <Text
          style={[
            styles.modeButton,
            mode === 'all' && styles.modeButtonActive,
          ]}
          onPress={() => {
            setOffset(0);
            setMode('all');
          }}
        >
          Все
        </Text>
      </View>

      {/* Фильтр по булочной (простая версия: по данным логов) */}
      <View style={styles.bakeryRow}>
        <Text
          style={[
            styles.bakeryChip,
            selectedBakeryId === null && styles.bakeryChipActive,
          ]}
          onPress={() => {
            setSelectedBakeryId(null);
            setOffset(0);
          }}
        >
          Все булочные
        </Text>

        {allBakeries.map(b => (
          <Text
            key={b.id}
            style={[
              styles.bakeryChip,
              selectedBakeryId === b.id && styles.bakeryChipActive,
            ]}
            onPress={() => {
              setSelectedBakeryId(b.id);
              setOffset(0);
            }}
          >
            {b.name}
          </Text>
        ))}
      </View>

      {loading && logs.length === 0 ? (
        <ActivityIndicator color="#42a5f5" />
      ) : logs.length === 0 ? (
        <Text style={styles.text}>Пока нет записей в журнале.</Text>
      ) : (
        <>
          <FlatList
            data={logs}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
          />

          {mode === 'all' && hasMore && !loading && (
            <Text
              style={styles.moreButton}
              onPress={() => loadLogs(false)}
            >
              Показать ещё
            </Text>
          )}

          {loading && (
            <ActivityIndicator
              color="#42a5f5"
              style={{ marginTop: 10 }}
            />
          )}
        </>
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
  modeRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  modeButton: {
    color: '#aaa',
    marginRight: 16,
    fontSize: 15,
  },
  modeButtonActive: {
    color: '#42a5f5',
    fontWeight: 'bold',
  },
  bakeryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  bakeryChip: {
    color: '#aaa',
    marginRight: 10,
    marginBottom: 6,
    fontSize: 14,
  },
  bakeryChipActive: {
    color: '#42a5f5',
    fontWeight: '600',
  },
  moreButton: {
    color: '#42a5f5',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    fontSize: 15,
  },

});
