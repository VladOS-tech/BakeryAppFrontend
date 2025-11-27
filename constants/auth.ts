import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export async function logout() {
  try {
    await AsyncStorage.multiRemove([
      'token',
      'userId',
      'userName',
      'bakeryId',
      'bakeryName',
      'role',
    ]);

    router.dismissAll?.();
    router.replace('/login');
  } catch (e) {
    console.log('Logout error', e);
  }
}
