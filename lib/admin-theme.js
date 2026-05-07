// Theme tokens for admin dashboard.
// Pages migrated to theme: newsletter
// Pages still using hardcoded dark colours: overview, contacts, pipeline, outreach,
//   calendar, handoffs, analytics, tenders
// Migrate these one page at a time in future sessions.

export const themes = {
  dark: {
    // Backgrounds
    pageBg: '#1a1625',
    cardBg: 'rgba(255,255,255,0.04)',
    cardBgHover: 'rgba(255,255,255,0.06)',
    cardBorder: 'rgba(255,255,255,0.06)',
    inputBg: 'rgba(255,255,255,0.06)',
    // Text
    textPrimary: '#ffffff',
    textSecondary: 'rgba(255,255,255,0.65)',
    textMuted: 'rgba(255,255,255,0.35)',
    textLabel: 'rgba(255,255,255,0.3)',
    // Interactive
    accent: '#9B51E0',
    accentBg: 'rgba(155,81,224,0.08)',
    accentBorder: 'rgba(155,81,224,0.4)',
    // Status
    success: '#2DD4BF',
    warning: '#D97706',
    danger: '#FF4279',
    // Table
    headerBorder: 'rgba(255,255,255,0.06)',
    rowBorder: 'rgba(255,255,255,0.03)',
    // Sidebar
    sidebarBg: '#1a1625',
    sidebarBorder: 'rgba(255,255,255,0.06)',
    sidebarText: 'rgba(255,255,255,0.5)',
    sidebarTextActive: '#ffffff',
    sidebarHover: 'rgba(255,255,255,0.02)',
  },
  light: {
    // Backgrounds
    pageBg: '#FAF6F1',
    cardBg: '#ffffff',
    cardBgHover: '#f5f0eb',
    cardBorder: 'rgba(0,0,0,0.08)',
    inputBg: 'rgba(0,0,0,0.04)',
    // Text
    textPrimary: '#221C2B',
    textSecondary: 'rgba(0,0,0,0.65)',
    textMuted: 'rgba(0,0,0,0.4)',
    textLabel: 'rgba(0,0,0,0.35)',
    // Interactive
    accent: '#9B51E0',
    accentBg: 'rgba(155,81,224,0.06)',
    accentBorder: 'rgba(155,81,224,0.3)',
    // Status
    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',
    // Table
    headerBorder: 'rgba(0,0,0,0.08)',
    rowBorder: 'rgba(0,0,0,0.04)',
    // Sidebar - stays dark in both modes for contrast
    sidebarBg: '#221C2B',
    sidebarBorder: 'rgba(255,255,255,0.06)',
    sidebarText: 'rgba(255,255,255,0.5)',
    sidebarTextActive: '#ffffff',
    sidebarHover: 'rgba(255,255,255,0.02)',
  },
}
