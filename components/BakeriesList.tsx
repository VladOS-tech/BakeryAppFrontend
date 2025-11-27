import { API_BASE_URL } from '@/constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Bakery {
  id: number;
  name: string;
}

const BakeriesList: React.FC = () => {
  const router = useRouter();
  const [bakeries, setBakeries] = useState<Bakery[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchBakeries = async () => {
      const token = await AsyncStorage.getItem('token');
      fetch(`${API_BASE_URL}/bakeries`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          setBakeries(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    };
    fetchBakeries();
  }, []);
  

  const onBakeryPress = (id: number) => {
    router.push(`/bakeries/${id}`); // Переход на страницу заявок по булочной
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.bakeryName}>Loading bakeries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bakeries}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
          style={styles.item}
          onPress={() => onBakeryPress(item.id)}
        >
            <Text style={styles.bakeryName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 40,
    paddingHorizontal: 20,
  },
  item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  bakeryName: {
    color: '#fff',
    fontSize: 18,
  },
});

export default BakeriesList;
