/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import PaletteIcon from '@mui/icons-material/Palette';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import SourceIcon from '@mui/icons-material/Source';
import StorageIcon from '@mui/icons-material/Storage';
import DownloadIcon from '@mui/icons-material/Download';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import HubIcon from '@mui/icons-material/Hub';
import BackupIcon from '@mui/icons-material/Backup';
import InfoIcon from '@mui/icons-material/Info';
import List from '@mui/material/List';
import { useLingui } from '@lingui/react/macro';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { KotatsuSettingsListItem } from '@/features/kotatsu-ui/components/KotatsuSettingsListItem.tsx';
import { KotatsuScreenLayout } from '@/features/kotatsu-ui/components/KotatsuScreenLayout.tsx';
import { useKotatsuMainScreen } from '@/features/kotatsu-ui/hooks/useKotatsuMainScreen.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { Sources as SourceService } from '@/features/source/services/Sources.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';

export function Settings() {
    const { t } = useLingui();
    const isMobileWidth = MediaQuery.useIsMobileWidth();
    useKotatsuMainScreen();

    useAppTitle(t`Settings`);

    const { data: sourceData } = requestManager.useGetSourceList({ fetchPolicy: 'cache-first' });
    const sources = sourceData?.sources.nodes ?? STABLE_EMPTY_ARRAY;
    const enabledSources = SourceService.filter(sources, { enabled: true }).length;
    const totalSources = sources.length;

    const settingsContent = (
        <List sx={{ padding: 0 }}>
            <KotatsuSettingsListItem
                to={AppRoutes.settings.children.appearance.path}
                icon={<PaletteIcon />}
                title={t`Appearance`}
                subtitle={t`Theme, List mode, Language`}
            />
            <KotatsuSettingsListItem
                to={AppRoutes.browse.path()}
                icon={<SourceIcon />}
                title={t`Manga sources`}
                subtitle={t`${enabledSources} of ${totalSources} on`}
            />
            <KotatsuSettingsListItem
                to={AppRoutes.settings.children.reader.path}
                icon={<AutoStoriesIcon />}
                title={t`Reader settings`}
                subtitle={t`Read mode, Scale mode, Switch pages`}
            />
            <KotatsuSettingsListItem
                to={AppRoutes.settings.children.server.path}
                icon={<StorageIcon />}
                title={t`Storage and network`}
                subtitle={t`Storage usage, Proxy, Content preloading`}
            />
            <KotatsuSettingsListItem
                to={AppRoutes.settings.children.download.path}
                icon={<DownloadIcon />}
                title={t`Downloads`}
                subtitle={t`Downloads folder, Download only via Wi-Fi`}
            />
            <KotatsuSettingsListItem
                to={AppRoutes.updates.path}
                icon={<RssFeedIcon />}
                title={t`Check for new chapters`}
                subtitle={t`Look for updates, Notifications settings`}
            />
            <KotatsuSettingsListItem
                to={AppRoutes.settings.children.tracking.path}
                icon={<HubIcon />}
                title={t`Services`}
                subtitle={t`Suggestions, Synchronization, Tracking`}
            />
            <KotatsuSettingsListItem
                to={AppRoutes.settings.children.backup.path}
                icon={<BackupIcon />}
                title={t`Backup and restore`}
                subtitle={t`Create or restore a backup, Periodic backups`}
            />
            <KotatsuSettingsListItem
                to={AppRoutes.about.path}
                icon={<InfoIcon />}
                title={t`About`}
                subtitle={t`Suwayomi WebUI`}
            />
        </List>
    );

    if (isMobileWidth) {
        return <KotatsuScreenLayout showSearch={false}>{settingsContent}</KotatsuScreenLayout>;
    }

    return settingsContent;
}
