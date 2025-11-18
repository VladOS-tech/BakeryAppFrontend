import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface RequestItem {
  id: number;
  quantity: number;
  product: Product;
}

interface Request {
  id: number;
  created_at: string;
  request_items?: RequestItem[];
}


interface Props {
  bakeryId: string;
}

const BakeryRequestsList: React.FC<Props> = ({ bakeryId }) => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`http://localhost:3000/requests?bakery_id=${bakeryId}`)
      .then(res => res.json())
      .then(data => {
        setRequests(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [bakeryId]);

  const onRequestPress = (requestId: number) => {
    router.push(`/bakeries/${bakeryId}/requests/${requestId}`);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading requests...</Text>
      </View>
    );
  }

  if (requests.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No requests found for this bakery.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.item} onPress={() => onRequestPress(item.id)}>
          <Text style={styles.text}>Request ID: {item.id}</Text>
          <Text style={styles.text}>Date: {new Date(item.created_at).toLocaleDateString()}</Text>
          {item.request_items?.map((ri) => (
            <Text style={[styles.text, { marginLeft: 12, fontSize: 15 }]} key={ri.id}>
              {ri.product?.name}: {ri.quantity} шт.
            </Text>
          ))}
        </TouchableOpacity>
      )}
    />
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
  text: {
    color: '#fff',
    fontSize: 16,
  },
});

export default BakeryRequestsList;
