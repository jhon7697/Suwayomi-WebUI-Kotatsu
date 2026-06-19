/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import SdStorageOutlinedIcon from '@mui/icons-material/SdStorageOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import CasinoOutlinedIcon from '@mui/icons-material/CasinoOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PushPinOutlinedIcon from '@mui/icons-material/PushPinOutlined';
import { Link, useNavigate } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { Sources as SourceService } from '@/features/source/services/Sources.ts';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { KotatsuScreenLayout } from '@/features/kotatsu-ui/components/KotatsuScreenLayout.tsx';
import { useKotatsuMainScreen } from '@/features/kotatsu-ui/hooks/useKotatsuMainScreen.ts';
import { KOTATSU_COLORS, KOTATSU_RADIUS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';

const QuickActionButton = ({ icon, label, to }: { icon: React.ReactNode; label: string; to: string }) => (
    <Button
        component={Link}
        to={to}
        sx={{
            flex: 1,
            flexDirection: 'column',
            gap: 0.75,
            py: 2,
            borderRadius: KOTATSU_RADIUS.card,
            backgroundColor: KOTATSU_COLORS.surface,
            color: KOTATSU_COLORS.textPrimary,
            textTransform: 'none',
            '&:hover': { backgroundColor: KOTATSU_COLORS.navActive },
        }}
    >
        {icon}
        <Typography variant="body2">{label}</Typography>
    </Button>
);

const SourceIcon = ({ name, iconUrl }: { name: string; iconUrl?: string | null }) => (
    <Stack spacing={0.5} sx={{ alignItems: 'center', minWidth: 72 }}>
        <Box
            sx={{
                width: 56,
                height: 56,
                borderRadius: KOTATSU_RADIUS.card,
                backgroundColor: KOTATSU_COLORS.surface,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
            }}
        >
            {iconUrl ? (
                <Box
                    component="img"
                    src={iconUrl}
                    alt={name}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            ) : (
                <Typography sx={{ fontWeight: 700, fontSize: '1.25rem' }}>{name.charAt(0).toUpperCase()}</Typography>
            )}
        </Box>
        <Stack direction="row" spacing={0.25} sx={{ alignItems: 'center' }}>
            <PushPinOutlinedIcon sx={{ fontSize: 12, color: KOTATSU_COLORS.textSecondary }} />
            <Typography
                variant="caption"
                noWrap
                sx={{ color: KOTATSU_COLORS.textSecondary, maxWidth: 64, textAlign: 'center' }}
            >
                {name}
            </Typography>
        </Stack>
    </Stack>
);

export const KotatsuExplore = () => {
    const { t } = useLingui();
    const navigate = useNavigate();
    const { openSettings } = useKotatsuMainScreen();

    useAppTitle(t`Explore`);

    const {
        settings: { showNsfw },
    } = useMetadataServerSettings();

    const { data, loading, error, refetch } = requestManager.useGetSourceList();
    const sources = data?.sources.nodes ?? STABLE_EMPTY_ARRAY;

    const pinnedSources = useMemo(
        () =>
            SourceService.filter(sources, {
                isNsfw: showNsfw ? undefined : false,
                enabled: true,
                keepLocalSource: true,
            }).slice(0, 12),
        [sources, showNsfw],
    );

    const randomSource = useCallback(() => {
        if (!pinnedSources.length) {
            return;
        }
        const source = pinnedSources[Math.floor(Math.random() * pinnedSources.length)];
        navigate(AppRoutes.sources.children.browse.path(source.id));
    }, [navigate, pinnedSources]);

    const headerExtra = (
        <Stack sx={{ px: 2, pb: 2, gap: 2 }}>
            <Stack direction="row" sx={{ gap: 1.5 }}>
                <QuickActionButton
                    icon={<SdStorageOutlinedIcon />}
                    label={t`Local storage`}
                    to={AppRoutes.library.path()}
                />
                <QuickActionButton icon={<BookmarkBorderIcon />} label={t`Bookmarks`} to={AppRoutes.library.path()} />
            </Stack>
            <Stack direction="row" sx={{ gap: 1.5 }}>
                <Button
                    onClick={randomSource}
                    sx={{
                        flex: 1,
                        flexDirection: 'column',
                        gap: 0.75,
                        py: 2,
                        borderRadius: KOTATSU_RADIUS.card,
                        backgroundColor: KOTATSU_COLORS.surface,
                        color: KOTATSU_COLORS.textPrimary,
                        textTransform: 'none',
                    }}
                >
                    <CasinoOutlinedIcon />
                    <Typography variant="body2">{t`Random`}</Typography>
                </Button>
                <QuickActionButton icon={<DownloadOutlinedIcon />} label={t`Downloads`} to={AppRoutes.downloads.path} />
            </Stack>
            <Button
                endIcon={<ExpandMoreIcon />}
                sx={{
                    justifyContent: 'space-between',
                    borderRadius: KOTATSU_RADIUS.card,
                    backgroundColor: KOTATSU_COLORS.surface,
                    color: KOTATSU_COLORS.textPrimary,
                    textTransform: 'none',
                    px: 2,
                    py: 1.5,
                }}
            >
                {t`Source presets`}
            </Button>
        </Stack>
    );

    if (error) {
        return (
            <KotatsuScreenLayout onMenuClick={openSettings} headerExtra={headerExtra}>
                <EmptyViewAbsoluteCentered
                    message={t`Unable to load data`}
                    messageExtra={getErrorMessage(error)}
                    retry={() => refetch().catch(defaultPromiseErrorHandler('KotatsuExplore::refetch'))}
                />
            </KotatsuScreenLayout>
        );
    }

    return (
        <KotatsuScreenLayout onMenuClick={openSettings} headerExtra={headerExtra}>
            <Stack sx={{ px: 2, pb: 10 }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="h6" sx={{ color: KOTATSU_COLORS.textPrimary, fontWeight: 600 }}>
                        {t`Manga sources`}
                    </Typography>
                    <Typography
                        component={Link}
                        to={AppRoutes.browse.path()}
                        sx={{ color: KOTATSU_COLORS.textSecondary, textDecoration: 'none' }}
                    >
                        {t`Catalog`}
                    </Typography>
                </Stack>

                {loading ? (
                    <LoadingPlaceholder />
                ) : (
                    <Grid container spacing={1.5}>
                        {pinnedSources.map((source) => (
                            <Grid key={source.id} size={{ xs: 3 }}>
                                <Box
                                    component={Link}
                                    to={AppRoutes.sources.children.browse.path(source.id)}
                                    sx={{ textDecoration: 'none' }}
                                >
                                    <SourceIcon name={source.displayName} iconUrl={source.iconUrl} />
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Stack>
        </KotatsuScreenLayout>
    );
};
