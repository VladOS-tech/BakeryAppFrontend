import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen({ navigation }: any) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    if (!phone || !password) {
      setError('Введите телефон и пароль');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        await AsyncStorage.setItem('token', data.token);
        if (data.name) await AsyncStorage.setItem('userName', data.name);
        if (data.bakeries && Array.isArray(data.bakeries) && data.bakeries[0]) {
          await AsyncStorage.setItem('bakeryName', data.bakeries[0].name);
          await AsyncStorage.setItem('bakeryId', String(data.bakeries[0].id));
        }
        if (data.id) await AsyncStorage.setItem('userId', String(data.id));

        if (data.role === "worker") {
          router.replace('/(worker)');
        } else if (data.role === "manager") router.replace('/(admin)');
      } else setError(data.error || "Неверный телефон или пароль");
    } catch {
      setError('Ошибка сети');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Вход в систему</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        style={styles.input}
        placeholder="Телефон"
        keyboardType="phone-pad"
        placeholderTextColor="#888"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={styles.input}
        placeholder="Пароль"
        secureTextEntry
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Войти</Text>
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#111" },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 24 },
  input: { backgroundColor: "#232428", width: 240, color: "#fff", borderRadius: 7, padding: 11, marginBottom: 13, fontSize: 16 },
  button: { backgroundColor: "#42a5f5", paddingVertical: 13, paddingHorizontal: 44, borderRadius: 8 },
  error: { color: "#f55", marginBottom: 15, textAlign: "center" },
});
