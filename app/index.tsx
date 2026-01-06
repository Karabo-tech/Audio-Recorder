import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import MainScreen from '../screens/MainScreen';

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      <MainScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
