import { StyleSheet } from 'react-native';
import { COLORS } from './color';

export const SPACING = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const TYPO = StyleSheet.create({
  h1: { color: COLORS.backgroundn, fontSize: 32, fontWeight: '700' },
  h2: { color: COLORS.backgroundn, fontSize: 22, fontWeight: '700' },
  body: { color: COLORS.backgroundn, fontSize: 16 },
  muted: { color: COLORS.quaternary, fontSize: 14 },
  link: { color: COLORS.quinary, fontWeight: '600' },
});

export const LAYOUT = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.backgroundd, padding: SPACING.lg },
  center: { alignItems: 'center', justifyContent: 'center' },
  rowCenter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  gapSm: { rowGap: SPACING.sm, columnGap: SPACING.sm },
  gapMd: { rowGap: SPACING.md, columnGap: SPACING.md },
});

export const FORMS = StyleSheet.create({
  label: { color: COLORS.backgroundn, marginTop: SPACING.sm },
  input: {
    color: COLORS.backgroundn,
    borderColor: COLORS.quaternary,
    borderWidth: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  placeholder: { color: COLORS.quaternary },
  segmentedWrap: {
    flexDirection: 'row',
    gap: SPACING.sm,
    backgroundColor: '#111',
    padding: SPACING.sm,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#222',
  },
  segmentedItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.quaternary,
  },
  segmentedItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
});

export const BUTTONS = StyleSheet.create({
  primary: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md + 2,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  primaryText: { color: COLORS.backgroundn, fontWeight: '700' },
  ghost: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.quaternary,
    alignItems: 'center',
  },
  ghostText: { color: COLORS.backgroundn, fontWeight: '600' },
});

export const signOut = StyleSheet.create({
  signOut: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: COLORS.backgroundd,
  paddingVertical: 14,
  borderRadius: 12,
  marginTop: 18,
  borderWidth: 1,
  borderColor: COLORS.quaternary,
},
signOutText: {
  color: COLORS.primary,
  fontSize: 16,
  fontWeight: "700",
  marginLeft: 8,
},
});