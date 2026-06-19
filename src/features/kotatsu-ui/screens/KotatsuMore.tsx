/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import SettingsIcon from '@mui/icons-material/Settings';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import BackupOutlinedIcon from '@mui/icons-material/BackupOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import { useLingui } from '@lingui/react/macro';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { KotatsuSettingsListItem } from '@/features/kotatsu-ui/components/KotatsuSettingsListItem.tsx';
import { KOTATSU_COLORS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';
import { useKotatsuMainScreen } from '@/features/kotatsu-ui/hooks/useKotatsuMainScreen.ts';

export const KotatsuMore = () => {
    const { t } = useLingui();
    useKotatsuMainScreen();

    return (
        <Box sx={{ backgroundColor: KOTATSU_COLORS.background, minHeight: '100%', pb: 10 }}>
            {/* Header */}
            <Stack sx={{ px: 2, pt: 'max(16px, env(safe-area-inset-top))', pb: 2 }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                    <SettingsIcon sx={{ fontSize: 28, color: KOTATSU_COLORS.textPrimary }} />
                    <Typography variant="h5" sx={{ color: KOTATSU_COLORS.textPrimary, fontWeight: 700 }}>
                        {t`More`}
                    </Typography>
                </Stack>
            </Stack>

            <List disablePadding>
                <KotatsuSettingsListItem
                    icon={<PaletteOutlinedIcon />}
                    title={t`Appearance`}
                    subtitle={t`Theme, colors, display`}
                    to={AppRoutes.settings.children.appearance.path}
                />
                <KotatsuSettingsListItem
                    icon={<MenuBookOutlinedIcon />}
                    title={t`Library`}
                    subtitle={t`Categories, global update`}
                    to={AppRoutes.settings.children.library.path}
                />
                <KotatsuSettingsListItem
                    icon={<TuneOutlinedIcon />}
                    title={t`Reader`}
                    subtitle={t`Reading modes, display, navigation`}
                    to={AppRoutes.settings.children.reader.path}
                />
                <KotatsuSettingsListItem
                    icon={<CloudDownloadOutlinedIcon />}
                    title={t`Downloads`}
                    subtitle={t`Automatic downloads, download ahead`}
                    to={AppRoutes.settings.children.downloads.path}
                />

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1 }} />

                <KotatsuSettingsListItem
                    icon={<LanguageOutlinedIcon />}
                    title={t`Browse`}
                    subtitle={t`Sources, extensions, languages`}
                    to={AppRoutes.settings.children.browse.path}
                />
                <KotatsuSettingsListItem
                    icon={<SyncOutlinedIcon />}
                    title={t`Tracking`}
                    subtitle={t`MyAnimeList, AniList, MangaUpdates`}
                    to={AppRoutes.settings.children.tracking.path}
                />
                <KotatsuSettingsListItem
                    icon={<BackupOutlinedIcon />}
                    title={t`Backup`}
                    subtitle={t`Create and restore backups`}
                    to={AppRoutes.settings.children.backup.path}
                />

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1 }} />

                <KotatsuSettingsListItem
                    icon={<ImageOutlinedIcon />}
                    title={t`Images`}
                    subtitle={t`Image processing, quality`}
                    to={AppRoutes.settings.children.images.path}
                />
                <KotatsuSettingsListItem
                    icon={<StorageOutlinedIcon />}
                    title={t`Server`}
                    subtitle={t`Server settings, WebUI`}
                    to={AppRoutes.settings.children.server.path}
                />
                <KotatsuSettingsListItem
                    icon={<DevicesOutlinedIcon />}
                    title={t`Device`}
                    subtitle={t`Device-specific settings`}
                    to={AppRoutes.settings.children.device.path}
                />

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', my: 1 }} />

                <KotatsuSettingsListItem
                    icon={<InfoOutlinedIcon />}
                    title={t`About`}
                    subtitle={t`Version, licenses`}
                    to={AppRoutes.settings.children.about.path}
                />
            </List>
        </Box>
    );
};
