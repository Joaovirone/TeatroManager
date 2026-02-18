import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';

export type FeedbackType = 'success' | 'error' | 'info';

interface FeedbackProps {
  message: string;
  type?: FeedbackType;
  duration?: number;
  onHide?: () => void;
}

const colorMap: Record<FeedbackType, string> = {
  success: '#10B981',
  error: '#EF4444',
  info: '#6366F1',
};

export default function Feedback({ message, type = 'info', duration = 3000, onHide }: FeedbackProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(duration),
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start(() => {
      if (onHide) onHide();
    });
  }, [message]);

  return (
    <Animated.View style={[styles.container, { backgroundColor: colorMap[type], opacity }]}> 
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 12,
    zIndex: 1000,
    elevation: 5,
    alignItems: 'center',
  },
  text: {
    color: '#FFF',
    fontWeight: '600',
  },
});
