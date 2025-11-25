import BakeryForm from '@/components/BakeryForm';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Bakery {
  id: number;
  name: string;
}

export default function BakeriesPage() {
  const [bakeries, setBakeries] = useState<Bakery[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBakery, setCurrentBakery] = useState<Bakery | null>(null);
  const [initialName, setInitialName] = useState('');

  useEffect(() => {
    const fetchBakeries = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      fetch('http://localhost:3000/bakeries', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setBakeries(data);
          setLoading(false);
        })
        .catch(() => {
          Alert.alert('Ошибка', 'Не удалось получить булочные');
          setLoading(false);
        });
    };
    fetchBakeries();
  }, []);
  

  const openAddModal = () => {
    setEditMode(false);
    setInitialName('');
    setCurrentBakery(null);
    setModalVisible(true);
  };

  const openEditModal = (bakery: Bakery) => {
    setEditMode(true);
    setCurrentBakery(bakery);
    setInitialName(bakery.name);
    setModalVisible(true);
  };

  const addBakery = async (name: string) => {
    if (!name) {
      Alert.alert('Ошибка', 'Заполните название');
      return;
    }
    const token = await AsyncStorage.getItem('token');
    fetch('http://localhost:3000/bakeries', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name }),
    })
      .then(res => res.json())
      .then(newBakery => {
        setBakeries(prev => [...prev, newBakery]);
        setModalVisible(false);
      })
      .catch(() => Alert.alert('Ошибка', 'Не удалось добавить булочную'));
  };
  

  const editBakery = async (name: string) => {
    if (!currentBakery) return;
    if (!name) {
      Alert.alert('Ошибка', 'Заполните название');
      return;
    }
    const token = await AsyncStorage.getItem('token');
    fetch(`http://localhost:3000/bakeries/${currentBakery.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name }),
    })
      .then(res => res.json())
      .then(updatedBakery => {
        setBakeries(prev =>
          prev.map(b => (b.id === currentBakery.id ? updatedBakery : b))
        );
        setModalVisible(false);
      })
      .catch(() => Alert.alert('Ошибка', 'Не удалось обновить булочную'));
  };
  
  const removeBakery = async (id: number) => {
    const token = await AsyncStorage.getItem('token');
    fetch(`http://localhost:3000/bakeries/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.ok) {
          setBakeries(prev => prev.filter(b => b.id !== id));
          Alert.alert('Успех', 'Булочная удалена');
        } else {
          Alert.alert('Ошибка', 'Не удалось удалить булочную');
        }
      })
      .catch(() => Alert.alert('Ошибка', 'Ошибка удаления'));
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Справочник булочных</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal} activeOpacity={0.8}>
          <MaterialIcons name="add-circle" size={24} color="#42a5f5" />
          <Text style={styles.addButtonText}>Добавить булочную</Text>
        </TouchableOpacity>
      </View>
      {loading && <Text style={{ color: '#aaa', marginTop: 15 }}>Загрузка...</Text>}
      <FlatList
        data={bakeries}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.bakeryRow}>
            <Text style={styles.bakeryName}>{item.name}</Text>
            <TouchableOpacity onPress={() => openEditModal(item)}>
              <Text style={styles.edit}>✎ Редактировать</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeBakery(item.id)}>
              <Text style={styles.delete}>Удалить</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
            <BakeryForm
              onSubmit={editMode ? editBakery : addBakery}
              onCancel={() => setModalVisible(false)}
              initialName={initialName}
              editMode={editMode}
            />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#111' },
  header: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  bakeryRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 7 },
  bakeryName: { color: '#fff', flex: 2 },
  edit: { color: '#0af', marginLeft: 10 },
  delete: { color: '#f44', marginLeft: 15 },
  modalBg: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.65)' },
  modalContent: { width: 300, padding: 22, backgroundColor: '#222', borderRadius: 10 },
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
    elevation: 3,
    shadowColor: '#42a5f5',
    shadowOpacity: 0.23,
    shadowOffset: { width: 0, height: 3 },
  },
  addButtonText: {
    color: '#42a5f5',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 7,
    letterSpacing: 0.10,
  },
});
