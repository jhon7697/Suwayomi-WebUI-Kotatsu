/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ThemeOptions } from '@mui/material/styles';
import { KOTATSU_COLORS, KOTATSU_RADIUS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';

export const kotatsuThemeOptions: ThemeOptions = {
    palette: {
        mode: 'dark',
        background: {
            default: KOTATSU_COLORS.background,
            paper: KOTATSU_COLORS.surface,
        },
        primary: {
            main: KOTATSU_COLORS.primary,
        },
        secondary: {
            main: KOTATSU_COLORS.primaryAccent,
        },
        text: {
            primary: KOTATSU_COLORS.textPrimary,
            secondary: KOTATSU_COLORS.textSecondary,
        },
        error: {
            main: KOTATSU_COLORS.badge,
        },
    },
    shape: {
        borderRadius: 12,
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h5: {
            fontWeight: 700,
        },
        h6: {
            fontWeight: 600,
        },
        body1: {
            fontSize: '0.95rem',
        },
        body2: {
            fontSize: '0.85rem',
        },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: KOTATSU_COLORS.background,
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${KOTATSU_COLORS.surfaceElevated} transparent`,
                },
            },
        },
        MuiPaper: {
            defaultProps: {
                elevation: 0,
            },
            styleOverrides: {
                root: {
                    backgroundImage: 'none',
                    backgroundColor: KOTATSU_COLORS.surface,
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: KOTATSU_RADIUS.card,
                    backgroundColor: KOTATSU_COLORS.surface,
                    backgroundImage: 'none',
                },
            },
        },
        MuiCardMedia: {
            styleOverrides: {
                root: {
                    borderRadius: KOTATSU_RADIUS.card,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    borderRadius: KOTATSU_RADIUS.chip,
                },
                outlined: {
                    borderColor: 'rgba(255,255,255,0.2)',
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: KOTATSU_RADIUS.button,
                    textTransform: 'none' as const,
                    fontWeight: 500,
                },
                contained: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiFab: {
            styleOverrides: {
                root: {
                    borderRadius: KOTATSU_RADIUS.fab,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: KOTATSU_COLORS.background,
                    backgroundImage: 'none',
                    boxShadow: 'none',
                },
            },
        },
        MuiBottomNavigation: {
            styleOverrides: {
                root: {
                    backgroundColor: KOTATSU_COLORS.surface,
                },
            },
        },
        MuiListItemButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    '&:hover': {
                        backgroundColor: KOTATSU_COLORS.navActive,
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: KOTATSU_RADIUS.bottomSheet,
                    backgroundColor: KOTATSU_COLORS.surfaceElevated,
                },
            },
        },
        MuiDrawer: {
            styleOverrides: {
                paper: {
                    backgroundColor: KOTATSU_COLORS.surface,
                },
            },
        },
        MuiTab: {
            styleOverrides: {
                root: {
                    textTransform: 'none' as const,
                    fontWeight: 500,
                    color: KOTATSU_COLORS.textSecondary,
                    '&.Mui-selected': {
                        color: KOTATSU_COLORS.textPrimary,
                    },
                },
            },
        },
        MuiTabs: {
            styleOverrides: {
                indicator: {
                    backgroundColor: KOTATSU_COLORS.textPrimary,
                    height: 3,
                    borderRadius: '3px 3px 0 0',
                },
            },
        },
        MuiBadge: {
            styleOverrides: {
                colorError: {
                    backgroundColor: KOTATSU_COLORS.badge,
                },
            },
        },
        MuiLinearProgress: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 4,
                },
                bar: {
                    backgroundColor: KOTATSU_COLORS.progress,
                    borderRadius: 4,
                },
            },
        },
    },
};
