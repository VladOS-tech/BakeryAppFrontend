import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';


interface Warehouse {
  id: number;
  name: string;
}

interface ProductFormProps {
  onSubmit: (name: string, price: string, warehouseId: string) => void;
  onCancel: () => void;
  initialName?: string;
  initialPrice?: string;
  initialWarehouseId?: string;
  editMode?: boolean;
}

export default function ProductForm({
  onSubmit,
  onCancel,
  initialName = '',
  initialPrice = '',
  initialWarehouseId,
  editMode = false
}: ProductFormProps) {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [name, setName] = useState(initialName);
  const [price, setPrice] = useState(initialPrice);
  const [warehouseId, setWarehouseId] = useState(initialWarehouseId || '');

  useEffect(() => {
    setName(initialName);
    setPrice(initialPrice);
    setWarehouseId(initialWarehouseId || '');
  }, [initialName, initialPrice, initialWarehouseId]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      const token = await AsyncStorage.getItem('token');
      fetch('http://localhost:3000/warehouses', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(setWarehouses)
        .catch(() => {});
    };
    fetchWarehouses();
  }, []);
  

  return (
    <View style={styles.formContainer}>
  <Text style={styles.title}>{editMode ? 'Редактировать' : 'Добавить'} продукт</Text>
  <Text style={styles.label}>Название</Text>
  <TextInput
    style={styles.input}
    value={name}
    onChangeText={setName}
    placeholder="Введите название"
    placeholderTextColor="#888"
  />
  <Text style={styles.label}>Цена</Text>
  <TextInput
    style={styles.input}
    value={price}
    onChangeText={setPrice}
    keyboardType="numeric"
    placeholder="Введите цену"
    placeholderTextColor="#888"
  />
  <Text style={styles.label}>Склад</Text>
  <Picker
    selectedValue={warehouseId}
    onValueChange={setWarehouseId}
    style={styles.picker}
  >
    <Picker.Item label="Выберите склад..." value="" />
    {warehouses.map(wh => (
      <Picker.Item key={wh.id} label={wh.name} value={String(wh.id)} />
    ))}
  </Picker>
  <TouchableOpacity style={styles.button} onPress={() => onSubmit(name, price, warehouseId)}>
    <Text style={styles.buttonText}>СОХРАНИТЬ</Text>
  </TouchableOpacity>
  <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
    <Text style={styles.cancelText}>ОТМЕНИТЬ</Text>
  </TouchableOpacity>
</View>
  );
}

const styles = StyleSheet.create({
    formContainer: {
      padding: 24,
      borderRadius: 16,
      backgroundColor: '#17181a',
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowOffset: { width: 0, height: 4 },
      elevation: 8,
      minWidth: 320,
    },
    title: {
      color: '#fff',
      fontSize: 22,
      marginBottom: 20,
      fontWeight: 'bold',
      letterSpacing: 0.5,
      alignSelf: 'center',
    },
    label: {
      color: '#aaa',
      fontSize: 15,
      marginVertical: 7,
      marginLeft: 2,
      fontWeight: '500',
    },
    input: {
      backgroundColor: '#232428',
      color: '#fff',
      padding: 13,
      fontSize: 16,
      borderRadius: 8,
      marginBottom: 14,
      borderWidth: 1,
      borderColor: '#444',
    },
    picker: {
      backgroundColor: '#232428',
      color: '#fff',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#444',
      marginBottom: 16,
      fontSize: 16,
      padding: 13,
    },
    button: {
        backgroundColor: '#48bb78',
        borderRadius: 8,
        marginTop: 12,
        paddingVertical: 13,
        alignItems: 'center'
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        letterSpacing: 0.15,
    },
    cancelButton: {
      backgroundColor: '#333',
      paddingVertical: 13,
      marginTop: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelText: {
      color: '#999',
      fontSize: 16,
      fontWeight: '500',
    }
  });
  
