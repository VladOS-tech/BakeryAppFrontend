import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface BakeryFormProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
  initialName?: string;
  editMode?: boolean;
}

export default function BakeryForm({
  onSubmit,
  onCancel,
  initialName = '',
  editMode = false
}: BakeryFormProps) {
  const [name, setName] = useState(initialName);

  useEffect(() => {
    setName(initialName);
  }, [initialName]);

  return (
    <View style={styles.formContainer}>
      <Text style={styles.title}>{editMode ? 'Редактировать' : 'Добавить'} булочную</Text>
      <Text style={styles.label}>Название булочной</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Введите название"
        placeholderTextColor="#888"
      />
      <TouchableOpacity style={styles.button} onPress={() => onSubmit(name)}>
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
    minWidth: 320,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    marginBottom: 20,
    fontWeight: 'bold',
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
