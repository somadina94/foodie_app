import { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, Lock } from 'lucide-react-native';

import type { Order } from '@/services/orderService';
import { listOrderMessages, sendOrderMessage } from '@/services/orderMessageService';
import { outgoingTick, roleLabel } from '@/lib/orderChat';
import { ApiError } from '@/services/apiClient';
import { theme } from '@/lib/theme';

function formatTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(
      new Date(iso),
    );
  } catch {
    return '';
  }
}

function canViewChat(order: Order): boolean {
  return (
    Boolean(order.vendorUser) &&
    order.status !== 'cancelled' &&
    order.status !== 'pending_payment' &&
    order.status !== 'pending_kitchen'
  );
}

const chatClosed = (order: Order) => order.status === 'delivered';

export function OrderChatSection({
  orderId,
  order,
  currentUserId,
}: {
  orderId: string;
  order: Order;
  currentUserId: string | undefined;
}) {
  const qc = useQueryClient();
  const scrollRef = useRef<ScrollView>(null);
  const [draft, setDraft] = useState('');
  const allowed = canViewChat(order);
  const closed = chatClosed(order);

  const query = useQuery({
    queryKey: ['order-messages', orderId],
    queryFn: () => listOrderMessages(orderId),
    enabled: Boolean(orderId) && allowed,
    refetchInterval: allowed && !closed ? 5000 : false,
  });

  const mutation = useMutation({
    mutationFn: (text: string) => sendOrderMessage(orderId, text),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['order-messages', orderId] });
      setDraft('');
    },
  });

  const messages = query.data?.data.messages ?? [];

  useEffect(() => {
    if (messages.length) {
      requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }
  }, [messages.length]);

  if (!allowed) {
    return (
      <View className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
        <Text className="text-center text-sm text-neutral-500">
          Chat opens after the kitchen is assigned to your order.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="rounded-2xl border border-neutral-100 bg-white shadow-sm"
      keyboardVerticalOffset={100}
    >
      <View className="border-b border-neutral-100 px-4 py-3">
        <Text className="text-base font-bold text-neutral-900">Order chat</Text>
        <Text className="mt-0.5 text-xs text-neutral-500">Customer, kitchen & rider</Text>
      </View>

      {closed ? (
        <View className="flex-row items-center gap-2 border-b border-neutral-100 bg-neutral-50 px-3 py-2">
          <Lock size={16} color="#737373" />
          <Text className="text-xs text-neutral-600">Delivered — chat is read-only.</Text>
        </View>
      ) : null}

      {query.isPending ? (
        <View className="items-center py-8">
          <ActivityIndicator color={theme.primary} />
        </View>
      ) : query.isError ? (
        <Text className="p-4 text-center text-sm text-red-600">
          {query.error instanceof ApiError ? query.error.message : 'Could not load messages.'}
        </Text>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={{ maxHeight: 280 }}
          nestedScrollEnabled
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 12, paddingBottom: 16 }}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          <View className="gap-2">
            {messages.map((msg) => {
              const isMine = msg.sender._id === currentUserId;
              const tick = currentUserId ? outgoingTick(msg, currentUserId, order) : 'sent';
              return (
                <View key={msg._id} className={`flex-row ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <View
                    className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                      isMine ? 'rounded-br-sm bg-emerald-100' : 'rounded-bl-sm border border-neutral-200 bg-neutral-50'
                    }`}
                  >
                    {!isMine ? (
                      <Text className="mb-1 text-[10px] font-bold uppercase text-primary">
                        {roleLabel(msg.sender.role)} · {msg.sender.name.split(' ')[0]}
                      </Text>
                    ) : null}
                    <Text className="text-sm leading-5 text-neutral-900">{msg.text}</Text>
                    <Text className="mt-1 text-right text-[10px] text-neutral-400">
                      {formatTime(msg.createdAt)}
                      {isMine ? (tick === 'read' ? ' ✓✓' : tick === 'delivered' ? ' ✓✓' : ' ✓') : ''}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {!closed ? (
        <View className="flex-row items-end gap-2 border-t border-neutral-100 p-3">
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message…"
            placeholderTextColor="#a3a3a3"
            multiline
            className="max-h-24 flex-1 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-base text-neutral-900"
          />
          <Pressable
            onPress={() => {
              const t = draft.trim();
              if (t) mutation.mutate(t);
            }}
            disabled={mutation.isPending || !draft.trim()}
            className="rounded-xl p-3 active:opacity-80"
            style={{ backgroundColor: theme.primary }}
          >
            {mutation.isPending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Send color="#fff" size={22} />
            )}
          </Pressable>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
