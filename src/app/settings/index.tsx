import React from 'react';
import { StyleSheet, View, Text, Switch, ScrollView, Pressable, Platform } from 'react-native';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore, ControlMode, ReferenceMode } from '../../store/settingsStore';
import { useProgressStore } from '../../store/progressStore';
import { GameBackground } from '../../components/ui/GameBackground';
import { Game, Spacing, Typography, Radii } from '../../constants/theme';

function appVersionLabel(): string {
  const version = Constants.expoConfig?.version ?? '';
  const build =
    Platform.OS === 'ios'
      ? Constants.expoConfig?.ios?.buildNumber
      : Constants.expoConfig?.android?.versionCode;
  return build ? `${version} (${build})` : version;
}

export default function SettingsScreen(): React.ReactElement {
  const router = useRouter();
  const settings = useSettingsStore();
  const unlockAllWorlds = useProgressStore((state) => state.unlockAllWorlds);

  return (
    <GameBackground>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} accessibilityLabel="Schließen" hitSlop={8}>
            <Text style={styles.closeBtn}>Fertig</Text>
          </Pressable>
          <Text style={styles.title}>Einstellungen</Text>
          <Pressable
            onLongPress={() => unlockAllWorlds()}
            delayLongPress={5000}
            hitSlop={8}
            style={styles.placeholder}
            accessibilityLabel="App-Version"
          >
            <Text style={styles.version}>{appVersionLabel()}</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Section title="Steuerung">
            <SwitchRow
              label="Haptisches Feedback"
              value={settings.hapticsEnabled}
              onToggle={(v) => settings.setSetting('hapticsEnabled', v)}
            />
            <SwitchRow
              label="Mehrfach-Schieben"
              value={settings.multiSlideEnabled}
              onToggle={(v) => settings.setSetting('multiSlideEnabled', v)}
            />
            <SegmentRow
              label="Steuerung"
              value={settings.controlMode}
              options={
                [
                  { key: 'tap', label: 'Tippen' },
                  { key: 'swipe', label: 'Wischen' },
                  { key: 'both', label: 'Beides' },
                ] as { key: ControlMode; label: string }[]
              }
              onSelect={(v) => settings.setSetting('controlMode', v)}
            />
          </Section>

          <Section title="Anzeige">
            <SwitchRow
              label="Visuelle Effekte"
              value={settings.visualEffectsEnabled}
              onToggle={(v) => settings.setSetting('visualEffectsEnabled', v)}
            />
            <SwitchRow
              label="Timer anzeigen"
              value={settings.timerVisible}
              onToggle={(v) => settings.setSetting('timerVisible', v)}
            />
            <SwitchRow
              label="Zugzähler anzeigen"
              value={settings.moveCounterVisible}
              onToggle={(v) => settings.setSetting('moveCounterVisible', v)}
            />
            <SwitchRow
              label="Restzüge anzeigen"
              value={settings.optimalMovesVisible}
              onToggle={(v) => settings.setSetting('optimalMovesVisible', v)}
            />
            <SwitchRow
              label="Kachelnummern"
              value={settings.tileNumbersVisible}
              onToggle={(v) => settings.setSetting('tileNumbersVisible', v)}
            />
            <SegmentRow
              label="Lösungsbild"
              value={settings.referenceMode}
              options={
                [
                  { key: 'pip', label: 'Ecke' },
                  { key: 'side', label: 'Daneben' },
                  { key: 'ghost', label: 'Overlay' },
                  { key: 'off', label: 'Aus' },
                ] as { key: ReferenceMode; label: string }[]
              }
              onSelect={(v) => settings.setSetting('referenceMode', v)}
            />
          </Section>
        </ScrollView>
      </SafeAreaView>
    </GameBackground>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function SwitchRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: (v: boolean) => void;
}): React.ReactElement {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ true: Game.accentDeep, false: 'rgba(255,255,255,0.12)' }}
        thumbColor="#ffffff"
        accessibilityLabel={label}
      />
    </View>
  );
}

function SegmentRow<T extends string>({
  label,
  value,
  options,
  onSelect,
}: {
  label: string;
  value: T;
  options: { key: T; label: string }[];
  onSelect: (v: T) => void;
}): React.ReactElement {
  return (
    <View style={styles.segmentRow}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.segments}>
        {options.map((opt) => (
          <Pressable
            key={opt.key}
            onPress={() => onSelect(opt.key)}
            style={[styles.segment, value === opt.key && styles.segmentActive]}
            accessibilityLabel={opt.label}
            accessibilityState={{ selected: value === opt.key }}
          >
            <Text style={[styles.segmentText, value === opt.key && styles.segmentTextActive]}>
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  closeBtn: { ...Typography.bodyBold, color: Game.accent },
  title: { ...Typography.h3, color: Game.text },
  placeholder: { minWidth: 48, alignItems: 'flex-end' },
  version: { ...Typography.caption, color: Game.textDim },
  content: { padding: Spacing.md, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  section: { gap: Spacing.sm },
  sectionTitle: {
    ...Typography.captionBold,
    color: Game.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: Spacing.xs,
  },
  sectionCard: {
    backgroundColor: Game.surface,
    borderWidth: 1,
    borderColor: Game.surfaceBorder,
    borderRadius: Radii.lg,
    paddingHorizontal: Spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 2,
  },
  rowLabel: { ...Typography.body, color: Game.text },
  segmentRow: { gap: Spacing.sm, paddingVertical: Spacing.sm },
  segments: {
    flexDirection: 'row',
    borderRadius: Radii.md,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  segment: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  segmentActive: { backgroundColor: Game.accentDeep },
  segmentText: { ...Typography.captionBold, color: Game.textDim },
  segmentTextActive: { color: '#ffffff' },
});
