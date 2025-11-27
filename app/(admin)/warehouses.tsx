import WarehouseForm from '@/components/WarehouseForm';
import { API_BASE_URL } from '@/constants/config';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Warehouse {
  id: number;
  name: string;
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState<Warehouse | null>(null);
  const [initialName, setInitialName] = useState('');

  useEffect(() => {
    const fetchWarehouses = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      fetch(`${API_BASE_URL}/warehouses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setWarehouses(data);
          setLoading(false);
        })
        .catch(() => {
          Alert.alert('Ошибка', 'Не удалось получить склады');
          setLoading(false);
        });
    };
    fetchWarehouses();
  }, []);
  

  const openAddModal = () => {
    setEditMode(false);
    setInitialName('');
    setCurrentWarehouse(null);
    setModalVisible(true);
  };

  const openEditModal = (warehouse: Warehouse) => {
    setEditMode(true);
    setCurrentWarehouse(warehouse);
    setInitialName(warehouse.name);
    setModalVisible(true);
  };

  const addWarehouse = async (name: string) => {
    if (!name) {
      Alert.alert('Ошибка', 'Заполните название');
      return;
    }
    const token = await AsyncStorage.getItem('token');
    fetch(`${API_BASE_URL}/warehouses`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name }),
    })
      .then(res => res.json())
      .then(newWarehouse => {
        setWarehouses(prev => [...prev, newWarehouse]);
        setModalVisible(false);
      })
      .catch(() => Alert.alert('Ошибка', 'Не удалось добавить склад'));
  };
  

  const editWarehouse = async (name: string) => {
    if (!currentWarehouse) return;
    if (!name) {
      Alert.alert('Ошибка', 'Заполните название');
      return;
    }
    const token = await AsyncStorage.getItem('token');
    fetch(`${API_BASE_URL}/warehouses/${currentWarehouse.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ name }),
    })
      .then(res => res.json())
      .then(updatedWarehouse => {
        setWarehouses(prev =>
          prev.map(w => (w.id === currentWarehouse.id ? updatedWarehouse : w))
        );
        setModalVisible(false);
      })
      .catch(() => Alert.alert('Ошибка', 'Не удалось обновить склад'));
  };
  

  const removeWarehouse = async (id: number) => {
    const token = await AsyncStorage.getItem('token');
    fetch(`${API_BASE_URL}/warehouses/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.ok) {
          setWarehouses(prev => prev.filter(w => w.id !== id));
          Alert.alert('Успех', 'Склад удалён');
        } else {
          Alert.alert('Ошибка', 'Не удалось удалить склад');
        }
      })
      .catch(() => Alert.alert('Ошибка', 'Ошибка удаления'));
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Справочник складов</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal} activeOpacity={0.8}>
          <MaterialIcons name="add-circle" size={24} color="#42a5f5" />
          <Text style={styles.addButtonText}>Добавить склад</Text>
        </TouchableOpacity>
      </View>
      {loading && <Text style={{ color: '#aaa', marginTop: 15 }}>Загрузка...</Text>}
      <FlatList
        data={warehouses}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.warehouseRow}>
            <Text style={styles.warehouseName}>{item.name}</Text>
            <TouchableOpacity onPress={() => openEditModal(item)}>
              <Text style={styles.edit}>✎ Редактировать</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeWarehouse(item.id)}>
              <Text style={styles.delete}>Удалить</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
            <WarehouseForm
              onSubmit={editMode ? editWarehouse : addWarehouse}
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
  header: { color: '#fff', fontSize: 22, marginBottom: 15 },
  warehouseRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 7 },
  warehouseName: { color: '#fff', flex: 2 },
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
