import StaffCard from '@/components/StaffCard';
import StaffForm from '@/components/StaffForm';
import { API_BASE_URL } from '@/constants/config';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface User {
  id: number;
  name: string;
}

export default function StaffPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);

  // Для карточки сотрудника
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [cardModalVisible, setCardModalVisible] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      fetch(`${API_BASE_URL}/users?role=worker`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setUsers(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };
    fetchUsers();
  }, [modalVisible, cardModalVisible]);
  

  // Добавление работника
  const handleAdd = (newUser: User) => {
    setModalVisible(false);
    setUsers(prev => [...prev, newUser]);
  };

  // После удаления работника из списка
  const handleRemoveFromList = (id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setCardModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Управление персоналом</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
          activeOpacity={0.8}
        >
          <MaterialIcons name="add-circle" size={24} color="#42a5f5" />
          <Text style={styles.addButtonText}>Добавить работника</Text>
        </TouchableOpacity>
      </View>

      {loading && <Text style={{ color: '#aaa', marginTop: 15 }}>Загрузка...</Text>}
      <FlatList
        data={users}
        keyExtractor={user => user.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userRow}
            onPress={() => {
              setSelectedUserId(item.id);
              setCardModalVisible(true);
            }}
          >
            <Text style={styles.userName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <StaffForm
            onSubmit={handleAdd}
            onCancel={() => setModalVisible(false)}
          />
        </View>
      </Modal>

      <Modal visible={cardModalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
          {selectedUserId && (
            <StaffCard
              userId={selectedUserId}
              onClose={() => setCardModalVisible(false)}
              onDeleted={handleRemoveFromList}
              onEdited={() => setCardModalVisible(false)}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#111' },
  header: { color: '#fff', fontSize: 22, marginBottom: 15 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222f36',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 11,
  },
  addButtonText: {
    color: '#42a5f5', fontSize: 16, fontWeight: 'bold', marginLeft: 7, letterSpacing: 0.10,
  },
  userRow: {
    backgroundColor: "#232428", borderRadius: 13, padding: 15, marginBottom: 13,
  },
  userName: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  modalBg: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.65)' },
});
