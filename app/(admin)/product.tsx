import ProductForm from '@/components/ProductForm';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';



interface Product {
  id: number;
  name: string;
  price: number;
  warehouse_id: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  const [initialName, setInitialName] = useState('');
  const [initialPrice, setInitialPrice] = useState('');
  const [initialWarehouseId, setInitialWarehouseId] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');
      fetch('http://localhost:3000/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setProducts(data);
          setLoading(false);
        })
        .catch(() => {
          Alert.alert('Ошибка', 'Не удалось получить продукты');
          setLoading(false);
        });
    };
    fetchProducts();
  }, []);

  const openAddModal = () => {
    setEditMode(false);
    setInitialName('');
    setInitialPrice('');
    setInitialWarehouseId('');
    setCurrentProduct(null);
    setModalVisible(true);
  };

  const openEditModal = (product: Product) => {
    setEditMode(true);
    setCurrentProduct(product);
    setInitialName(product.name);
    setInitialPrice(String(product.price));
    setInitialWarehouseId(String(product.warehouse_id));
    setModalVisible(true);
  };

  const addProduct = async (name: string, price: string, warehouseId: string) => {
    if (!name || !price || !warehouseId) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    const token = await AsyncStorage.getItem('token');
    fetch('http://localhost:3000/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
       },
      body: JSON.stringify({ name, price: Number(price), warehouse_id: Number(warehouseId) }),
    })
      .then(res => res.json())
      .then(newProduct => {
        setProducts(prev => [...prev, newProduct]);
        setModalVisible(false);
      })
      .catch(() => Alert.alert('Ошибка', 'Не удалось добавить продукт'));
  };

  const editProduct = async (name: string, price: string, warehouseId: string) => {
    if (!currentProduct) return;
    if (!name || !price || !warehouseId) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }
    const token = await AsyncStorage.getItem('token');
    fetch(`http://localhost:3000/products/${currentProduct.id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ name, price: Number(price), warehouse_id: Number(warehouseId) }),
    })
      .then(res => res.json())
      .then(updatedProduct => {
        setProducts(prev =>
          prev.map(p => (p.id === currentProduct.id ? updatedProduct : p))
        );
        setModalVisible(false);
      })
      .catch(() => Alert.alert('Ошибка', 'Не удалось обновить продукт'));
  };

  const removeProduct = async (id: number) => {
    const token = await AsyncStorage.getItem('token');
    fetch(`http://localhost:3000/products/${id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.ok) {
          setProducts(prev => prev.filter(p => p.id !== id));
          Alert.alert('Успех', 'Продукт удалён');
        } else {
          Alert.alert('Ошибка', 'Не удалось удалить продукт');
        }
      })
      .catch(() => Alert.alert('Ошибка', 'Ошибка удаления'));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Справочник продуктов</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal} activeOpacity={0.8}>
          <MaterialIcons name="add-circle" size={24} color="#42a5f5" />
          <Text style={styles.addButtonText}>Добавить продукт</Text>
        </TouchableOpacity>
      </View>
      {loading && <Text style={{ color: '#aaa', marginTop: 15 }}>Загрузка...</Text>}
      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productPrice}>Цена: {item.price}</Text>
            <TouchableOpacity onPress={() => openEditModal(item)}>
              <Text style={styles.edit}>✎ Редактировать</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => removeProduct(item.id)}>
              <Text style={styles.delete}>Удалить</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalBg}>
            <ProductForm
                onSubmit={editMode ? editProduct : addProduct}
                onCancel={() => setModalVisible(false)}
                initialName={initialName}
                initialPrice={initialPrice}
                initialWarehouseId={initialWarehouseId}
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
  productRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 7 },
  productName: { color: '#fff', flex: 2 },
  productPrice: { color: '#aaa', flex: 1, marginLeft: 10 },
  edit: { color: '#0af', marginLeft: 10 },
  delete: { color: '#f44', marginLeft: 15 },
  modalBg: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.65)' },
  modalContent: { width: 300, padding: 22, backgroundColor: '#222', borderRadius: 10 },
  modalTitle: { color: '#fff', fontSize: 18, marginBottom: 14 },
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
