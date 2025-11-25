import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Bakery {
  id: number;
  name: string;
}
interface User {
  id: number;
  name: string;
  phone: string;
  role: string;
  bakeries: Bakery[];
}
interface StaffFormProps {
  onSubmit: (user: User) => void;
  onCancel: () => void;
  initialUser?: User;
  isEdit?: boolean;
}

export default function StaffForm({ onSubmit, onCancel, initialUser, isEdit }: StaffFormProps) {
  const [name, setName] = useState(initialUser?.name || '');
  const [phone, setPhone] = useState(initialUser?.phone || '');
  const [bakeries, setBakeries] = useState<Bakery[]>([]);
  const [selectedBakeryIds, setSelectedBakeryIds] = useState<number[]>(initialUser?.bakeries?.map(b => b.id) || []);
  const [error, setError] = useState('');
  const [password, setPassword] = useState(''); // не установлен при edit

  useEffect(() => {
    const fetchBakeries = async () => {
      const token = await AsyncStorage.getItem('token');
      fetch('http://localhost:3000/bakeries', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(setBakeries);
    };
    fetchBakeries();
  }, []);
  

  // Обновление стейтов при смене initialUser/editMode
  useEffect(() => {
    if (initialUser) {
      setName(initialUser.name);
      setPhone(initialUser.phone);
      setSelectedBakeryIds(initialUser.bakeries.map(b => b.id));
      setPassword('');
    } else {
      setName('');
      setPhone('');
      setSelectedBakeryIds([]);
      setPassword('');
    }
  }, [initialUser, isEdit]);

  const toggleBakery = (id: number) => {
    setSelectedBakeryIds(ids =>
      ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]
    );
  };

  const submit = async () => {
    if (
      !name ||
      !phone ||
      (isEdit ? false : !password) ||
      selectedBakeryIds.length === 0
    ) {
      setError('Заполните все поля и выберите хотя бы одну булочную');
      return;
    }
    const url =
      isEdit && initialUser
        ? `http://localhost:3000/users/${initialUser.id}`
        : 'http://localhost:3000/users';
    const method = isEdit ? 'PUT' : 'POST';
    const userPayload: any = { name, phone, role: "worker" };
    if (!isEdit) userPayload.password = password;
  
    const token = await AsyncStorage.getItem('token');
    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        user: userPayload,
        bakery_ids: selectedBakeryIds,
      }),
    })
      .then(res => res.json())
      .then(u => {
        if (!u.id) setError("Ошибка при сохранении сотрудника");
        else onSubmit(u);
      })
      .catch(() => setError("Ошибка сети или сервера"));
  };
  
  return (
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>
        {isEdit ? "Редактировать работника" : "Добавить работника"}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Имя"
        placeholderTextColor="#888"
      />
      {!isEdit && (
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder="Пароль"
          secureTextEntry
          placeholderTextColor="#888"
        />
      )}
      <TextInput
        style={styles.input}
        value={phone}
        onChangeText={setPhone}
        placeholder="Телефон"
        keyboardType="phone-pad"
        placeholderTextColor="#888"
      />
      <Text style={{ color: "#fff", marginVertical: 7 }}>Булочные:</Text>
      <FlatList
        data={bakeries}
        keyExtractor={b => b.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => toggleBakery(item.id)} style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{
              color: selectedBakeryIds.includes(item.id) ? "#42a5f5" : "#fff", margin: 4
            }}>
              {selectedBakeryIds.includes(item.id) ? "✓ " : ""}{item.name}
            </Text>
          </TouchableOpacity>
        )}
        style={{ maxHeight: 120 }}
        scrollEnabled={bakeries.length > 6}
      />
      <View style={{ flexDirection: "row", marginTop: 18, justifyContent: "space-between" }}>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: "#42a5f5" }]}
          onPress={submit}
        >
          <Text style={{ color: "#fff", fontWeight: "bold" }}>Сохранить</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modalButton, { backgroundColor: "#555" }]}
          onPress={onCancel}
        >
          <Text style={{ color: "#fff" }}>Отмена</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContent: { width: 340, padding: 22, backgroundColor: '#222', borderRadius: 11 },
  modalTitle: { color: '#fff', fontSize: 18, marginBottom: 14, fontWeight: "bold" },
  input: { backgroundColor: "#232428", color: "#fff", borderRadius: 7, padding: 9, marginBottom: 8, fontSize: 16 },
  modalButton: {
    flex: 1, alignItems: "center", padding: 11, marginHorizontal: 5, borderRadius: 8,
  },
  error: { color: "#ff6060", marginBottom: 7, textAlign: "center" },
});
