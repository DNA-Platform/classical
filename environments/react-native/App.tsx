import React, { useState } from 'react';
import { ReactNode } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, Button } from 'react-native';

export default function App() {
  console.log("Hello World Debugging!");
  const [showDots, setShowDots] = useState(true);
  const toggleDots = () => {
    setShowDots(!showDots);
  };

  return (
    <View style={styles.container}>
      <Text>Open up App.tsx to start working on your app!</Text>
      <StatusBar style="auto" />
      <Button title="Toggle Dots" onPress={toggleDots} />
      <ScrollView contentContainerStyle={styles.scrollView}>
        {showDots && dots()}
      </ScrollView>
    </View>
  );
}

function dots(): ReactNode[] {
  const dots: ReactNode[] = [];
  for (let i = 0; i < 50; i++) {
    dots.push(
      <View key={i}>
        <Text>.</Text>
      </View>
    );
  }
  return dots;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50, // Ensures the ScrollView starts at the top
  },
  scrollView: {
    alignItems: 'center',
    justifyContent: 'flex-start', // Start content from the top
  },
});
