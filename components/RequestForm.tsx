import { MaterialIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Product {
  id: number;
  name: string;
}

type InitialItems = { [productId: number]: number };
type RequestItemIds = { [productId: number]: number };

interface RequestFormProps {
  products: Product[];
  initialItems?: InitialItems;
  requestItemIds?: RequestItemIds;
  loading?: boolean;
  submitLabel?: string;
  onSubmit: (
    items: { product_id: number; quantity: number; request_item_id?: number }[]
  ) => void;
}

export default function RequestForm({
  products,
  initialItems = {},
  requestItemIds = {},
  loading = false,
  submitLabel = 'Сохранить заявку',
  onSubmit,
}: RequestFormProps) {
  const [selected, setSelected] = useState<{ [id: number]: boolean }>(() => {
    const obj: { [id: number]: boolean } = {};
    products.forEach(p => {
      if (initialItems[p.id]) obj[p.id] = true;
    });
    return obj;
  });

  const [quantities, setQuantities] = useState<{ [id: number]: string }>(() => {
    const obj: { [id: number]: string } = {};
    products.forEach(p => {
      if (initialItems[p.id]) obj[p.id] = initialItems[p.id].toString();
    });
    return obj;
  });

  const [search, setSearch] = useState('');

  const filteredProducts = useMemo(
    () =>
      products.filter(p =>
        p.name.toLowerCase().includes(search.trim().toLowerCase())
      ),
    [products, search]
  );

  const toggleSelect = (id: number) => {
    setSelected(sel => {
      const copy = { ...sel };
      if (copy[id]) {
        delete copy[id];
        setQuantities(q => {
          const q2 = { ...q };
          delete q2[id];
          return q2;
        });
      } else {
        copy[id] = true;
        setQuantities(q => ({ ...q, [id]: '1' }));
      }
      return copy;
    });
  };

  const handleQuantityChange = (id: number, value: string) => {
    setQuantities(q => ({ ...q, [id]: value.replace(/\D/g, '') }));
  };

  const handleSubmit = () => {
    const items = Object.entries(quantities)
      .filter(([id, qty]) => selected[Number(id)] && Number(qty) > 0)
      .map(([product_id, quantity]) => ({
        product_id: Number(product_id),
        quantity: Number(quantity),
        request_item_id: requestItemIds[Number(product_id)],
      }));
    onSubmit(items);
  };

  return (
    <View>
      <TextInput
        style={styles.search}
        value={search}
        onChangeText={setSearch}
        placeholder="Поиск..."
        placeholderTextColor="#888"
      />
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <TouchableOpacity
              onPress={() => toggleSelect(item.id)}
              style={styles.checkbox}
            >
              {selected[item.id] ? (
                <MaterialIcons
                  name="check-box"
                  size={24}
                  color="#42a5f5"
                />
              ) : (
                <MaterialIcons
                  name="check-box-outline-blank"
                  size={24}
                  color="#aaa"
                />
              )}
            </TouchableOpacity>
            <Text style={styles.productName}>{item.name}</Text>
            {selected[item.id] && (
              <TextInput
                style={styles.input}
                value={quantities[item.id] ?? '1'}
                onChangeText={val => handleQuantityChange(item.id, val)}
                keyboardType="number-pad"
                placeholder="1"
                placeholderTextColor="#888"
                editable={!loading}
              />
            )}
          </View>
        )}
      />
      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.4 }]}
        onPress={handleSubmit}
        disabled={loading}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>{submitLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  search: { backgroundColor: '#232428', borderRadius: 7, padding: 11, color: "#fff", fontSize: 16, marginBottom: 13 },
  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, justifyContent: 'flex-start' },
  checkbox: { marginRight: 8 },
  productName: { color: "#fff", fontSize: 15, flex: 1 },
  input: { color: '#fff', backgroundColor: '#232428', borderRadius: 8, padding: 8, width: 64, textAlign: 'center', fontSize: 15, marginLeft: 10 },
  button: { backgroundColor: "#42a5f5", borderRadius: 10, alignItems: 'center', padding: 14, marginVertical: 18 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});
