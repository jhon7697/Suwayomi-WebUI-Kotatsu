/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import List from '@mui/material/List';
import PaletteIcon from '@mui/icons-material/Palette';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import DownloadIcon from '@mui/icons-material/Download';
import HubIcon from '@mui/icons-material/Hub';
import SettingsIcon from '@mui/icons-material/Settings';
import BuildIcon from '@mui/icons-material/Build';
import { useLingui } from '@lingui/react/macro';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { KotatsuSettingsListItem } from '@/features/kotatsu-ui/components/KotatsuSettingsListItem.tsx';
import { KotatsuScreenLayout } from '@/features/kotatsu-ui/components/KotatsuScreenLayout.tsx';
import { useKotatsuMainScreen } from '@/features/kotatsu-ui/hooks/useKotatsuMainScreen.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';

export const KotatsuSettings: React.FC = () => {
    const { t } = useLingui();
    const isMobileWidth = MediaQuery.useIsMobileWidth();
    useKotatsuMainScreen();

    useAppTitle(t`Settings`);

    const settingsContent = (
        <List sx={{ padding: 0 }}>
            <KotatsuSettingsListItem
                to={AppRoutes.settings.children.webui.path}
                icon={<SettingsIcon />}
                title={t`General`}
                subtitle={t`Language, Layout, Interface`}
            />
            <KotatsuSettingsListItem
                to={AppRoutes.settings.children.appearance.path}
                icon={<PaletteIcon />}
                title={t`Appearance`}
                subtitle={t`Theme, List mode, Animations`}
            />
            <KotatsuSettingsListItem
                to={AppRoutes.settings.children.reader.path}
                icon={<AutoStoriesIcon />}
                title={t`Reader`}
                subtitle={t`Read mode, Scale mode, Switch pages`}
            />
            <KotatsuSettingsListItem
                to={AppRoutes.settings.children.download.path}
                icon={<DownloadIcon />}
                title={t`Downloads`}
                subtitle={t`Downloads folder, Download only via Wi-Fi`}
            />
            <KotatsuSettingsListItem
                to={AppRoutes.settings.children.tracking.path}
                icon={<HubIcon />}
                title={t`Tracking`}
                subtitle={t`Synchronization, Tracking services`}
            />
            <KotatsuSettingsListItem
                to={AppRoutes.settings.children.server.path}
                icon={<BuildIcon />}
                title={t`Advanced`}
                subtitle={t`Storage usage, Proxy, Backup and restore`}
            />
        </List>
    );

    if (isMobileWidth) {
        return <KotatsuScreenLayout showSearch={false}>{settingsContent}</KotatsuScreenLayout>;
    }

    return settingsContent;
};
