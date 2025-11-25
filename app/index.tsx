import { registerRootComponent } from 'expo';
import React from 'react';
import { StatusBar, SafeAreaView, StyleSheet } from 'react-native';
import MainScreen from '../screens/MainScreen';

function App() {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <SafeAreaView style={styles.container}>
        <MainScreen />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});

export default registerRootComponent(App);
