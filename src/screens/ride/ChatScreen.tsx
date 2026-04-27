import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import { useRide } from '../../context/RideContext';
import { rideAPI, addWSHandler, removeWSHandler, type WSMessage } from '../../services/api';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

type ChatMessage = {
  id: string;
  senderType: string;
  content: string;
  createdAt: string;
};

export const ChatScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { rideId, driver } = useRide();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!rideId) return;

    rideAPI.getMessages(rideId).then((res) => {
      if (res?.messages) {
        setMessages(res.messages.map((m: Record<string, string>) => ({
          id: m.id,
          senderType: m.sender_type,
          content: m.content,
          createdAt: m.created_at,
        })));
      }
    }).catch(console.error);

    const handler = (msg: WSMessage) => {
      if (msg.type === 'chat_message') {
        const payload = msg.payload as Record<string, unknown>;
        if (payload.ride_id === rideId) {
          setMessages(prev => [...prev, {
            id: payload.message_id as string,
            senderType: payload.sender_type as string,
            content: payload.content as string,
            createdAt: new Date().toISOString(),
          }]);
        }
      }
    };

    addWSHandler(handler);
    return () => removeWSHandler(handler);
  }, [rideId]);

  const sendMessage = async () => {
    if (!input.trim() || !rideId) return;
    const text = input.trim();
    setInput('');

    try {
      await rideAPI.sendMessage(rideId, text);
    } catch (error) {
      console.error('Send message failed:', error);
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMe = item.senderType === 'rider';
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{driver?.name ?? t('ride.driver')}</Text>
          <Text style={styles.headerSub}>{t('ride.inRideChat')}</Text>
        </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={t('ride.typeMessage')}
            placeholderTextColor={colors.onSurfaceVariant}
            onSubmitEditing={sendMessage}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Ionicons name="send" size={20} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.surface },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.screenPadding, paddingVertical: spacing.md,
    backgroundColor: colors.surfaceContainerLow,
  },
  backButton: { marginRight: spacing.md },
  headerInfo: { flex: 1 },
  headerName: { fontFamily: typography.fontFamily.headline, fontSize: typography.fontSize.bodyLarge, fontWeight: '600' as never, color: colors.onSurface },
  headerSub: { fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.bodySmall, color: colors.onSurfaceVariant },
  messagesList: { padding: spacing.screenPadding, flexGrow: 1 },
  messageBubble: { maxWidth: '75%', padding: spacing.md, borderRadius: spacing.borderRadius.xl, marginBottom: spacing.sm },
  myMessage: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  theirMessage: { alignSelf: 'flex-start', backgroundColor: colors.surfaceContainerHigh },
  messageText: { fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.bodyMedium },
  myMessageText: { color: colors.surface },
  theirMessageText: { color: colors.onSurface },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.screenPadding, paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceContainerLow,
  },
  input: {
    flex: 1, height: 44, borderRadius: spacing.borderRadius.full,
    backgroundColor: colors.surfaceContainerHigh, paddingHorizontal: spacing.md,
    fontFamily: typography.fontFamily.body, fontSize: typography.fontSize.bodyMedium,
    color: colors.onSurface, marginRight: spacing.sm,
  },
  sendButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
});
