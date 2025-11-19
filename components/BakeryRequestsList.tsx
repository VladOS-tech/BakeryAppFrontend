import React from 'react';
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
  bakery: Bakery;
  request_items: RequestItem[];
  request_date: string;
}

interface Bakery {
  id: number;
  name: string;
}


interface Props {
  requests: Request[];
  onRequestPress?: (requestId: number) => void;
}

const BakeryRequestsList: React.FC<Props> = ({ requests, onRequestPress }) => {
  if (!requests.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Нет заявок для булочных</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.bakeryBlock}>
          <Text style={styles.bakeryName}>{item.bakery.name}</Text>
          {item.request_items.map((ri) => (
            <TouchableOpacity
              key={ri.id}
              onPress={() => onRequestPress?.(item.id)}
              style={styles.requestItem}
            >
              <Text style={styles.productText}>
                {ri.product.name}: {ri.quantity} шт.
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      contentContainerStyle={styles.listContent}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { color: '#aaa', fontSize: 16 },
  listContent: { paddingBottom: 30 },
  bakeryBlock: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 8,
  },
  bakeryName: {
    color: '#0af',
    fontSize: 20,
    marginBottom: 10,
    fontWeight: '700',
  },
  requestItem: {
    paddingVertical: 6,
  },
  productText: {
    color: '#fff',
    fontSize: 16,
  },
});

/*const BakeryRequestsList: React.FC<Props> = ({ bakeryId }) => {
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
*/
export default BakeryRequestsList;
