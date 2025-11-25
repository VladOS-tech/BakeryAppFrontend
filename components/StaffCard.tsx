import StaffForm from '@/components/StaffForm';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Bakery { id: number; name: string }
interface User {
  id: number;
  name: string;
  phone: string;
  role: string;
  bakeries: Bakery[];
}
interface StaffCardProps {
  userId: number;
  onClose: () => void;
  onDeleted: (id: number) => void;
  onEdited: () => void;
}

export default function StaffCard({ userId, onClose, onDeleted, onEdited }: StaffCardProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('token');
      fetch(`http://localhost:3000/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => { setUser(data); setLoading(false); });
    };
    fetchUser();
  }, [userId, editModal]);
  

  const getRoleText = (role: string) =>
    role === "worker" ? "Работник" : (role === "manager" ? "Начальник" : "—");

  const handleDelete = async () => {
    const token = await AsyncStorage.getItem('token');
    fetch(`http://localhost:3000/users/${userId}`, {
      method: "DELETE",
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.ok) onDeleted(userId);
        else Alert.alert('Ошибка', 'Не удалось удалить');
      });
  };
  
  

  if (loading || !user) return (
    <View style={styles.cardContent}>
      <Text style={{ color: "#ccc" }}>Загрузка...</Text>
      <TouchableOpacity onPress={onClose}>
        <Text style={styles.cancelText}>Закрыть</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.cardContent}>
      {/* Просмотр */}
      {!editModal ? (
        <>
          <Text style={styles.modalTitle}>{user.name}</Text>
          <Text style={styles.info}>Телефон: {user.phone}</Text>
          <Text style={styles.info}>Роль: {getRoleText(user.role)}</Text>
          <Text style={styles.info}>
            Булочные: {user.bakeries.length > 0 ? user.bakeries.map(b => b.name).join(', ') : "—"}
          </Text>
          <View style={styles.cardRow}>
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditModal(true)}>
              <Text style={styles.editText}>Изменить</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
              <Text style={styles.deleteText}>Удалить</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Закрыть</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Modal visible={editModal} animationType="slide" transparent>
          <View style={styles.modalBg}>
            <StaffForm
              initialUser={user}
              isEdit
              onSubmit={() => { setEditModal(false); onEdited(); }}
              onCancel={() => setEditModal(false)}
            />
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContent: { width: 340, padding: 22, backgroundColor: '#222', borderRadius: 11, alignItems: "stretch" },
  modalTitle: { color: '#fff', fontSize: 18, marginBottom: 14, fontWeight: "bold" },
  info: { color: "#aaa", fontSize: 16, marginBottom: 7 },
  cardRow: { flexDirection: "row", gap: 18, marginTop: 24, marginBottom: 12 },
  editBtn: { backgroundColor: "#42a5f5", padding: 12, borderRadius: 7 },
  editText: { color: "#fff", fontWeight: "600" },
  deleteBtn: { backgroundColor: "#f44", padding: 12, borderRadius: 7  },
  deleteText: { color: "#fff", fontWeight: "600" },
  cancelText: { color: "#aaa", marginTop: 16, textAlign: "center" },
  modalBg: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.65)' },
});
