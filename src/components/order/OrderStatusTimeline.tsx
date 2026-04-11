import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';

import { theme } from '@/lib/theme';
import { ORDER_STATUS_STEPS, isCancelled, statusStepIndex } from '@/lib/orderStatusFlow';
import { orderFulfillmentLabel } from '@/lib/orderLabels';

/** Plain RN styles only — avoids NativeWind/render quirks that surfaced as missing navigation context on rider flows. */
export function OrderStatusTimeline({ status }: { status: string }) {
  if (isCancelled(status)) {
    return (
      <View style={styles.cancelWrap}>
        <Text style={styles.cancelText}>This order was cancelled</Text>
      </View>
    );
  }

  const currentIdx = statusStepIndex(status);
  return (
    <View style={styles.card}>
      <Text style={styles.sectionLabel}>Status</Text>
      <View style={styles.steps}>
        {ORDER_STATUS_STEPS.map((step, i) => {
          const done = currentIdx >= i && currentIdx >= 0;
          const active = i === currentIdx;
          return (
            <View key={step} style={styles.row}>
              <View
                style={[
                  styles.dot,
                  done ? styles.dotDone : styles.dotTodo,
                  active && styles.dotActive,
                ]}
              >
                {done ? <Check color="#fff" size={18} strokeWidth={2.5} /> : null}
              </View>
              <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>
                {orderFulfillmentLabel(step)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cancelWrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cancelText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#991b1b',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f5f5f5',
    backgroundColor: '#fff',
    padding: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#a3a3a3',
  },
  steps: {
    marginTop: 12,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
  },
  dotDone: {
    backgroundColor: theme.primary,
  },
  dotTodo: {
    backgroundColor: '#e5e5e5',
  },
  dotActive: {
    borderWidth: 2,
    borderColor: 'rgba(247, 103, 7, 0.45)',
  },
  stepLabel: {
    flex: 1,
    fontSize: 14,
    color: '#737373',
  },
  stepLabelActive: {
    fontWeight: '700',
    color: '#171717',
  },
});
