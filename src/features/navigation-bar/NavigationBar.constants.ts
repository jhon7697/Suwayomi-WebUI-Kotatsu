/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import RssFeedIcon from '@mui/icons-material/RssFeed';
import RssFeedOutlinedIcon from '@mui/icons-material/RssFeedOutlined';
import HistoryIcon from '@mui/icons-material/History';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ExploreIcon from '@mui/icons-material/Explore';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import GetAppIcon from '@mui/icons-material/GetApp';
import GetAppOutlinedIcon from '@mui/icons-material/GetAppOutlined';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useLingui } from '@lingui/react/macro';
import { msg, plural } from '@lingui/core/macro';
import type { NavbarItem } from '@/features/navigation-bar/NavigationBar.types.ts';
import { NavBarItemMoreGroup } from '@/features/navigation-bar/NavigationBar.types.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { DownloaderState } from '@/lib/graphql/generated/graphql-base.types.ts';

type RestrictedNavBarItem<Show extends NavbarItem['show']> = Omit<NavbarItem, 'show'> & { show: Show };

const NAVIGATION_BAR_BASE_ITEMS = [
    {
        path: AppRoutes.history.path,
        title: msg`History`,
        SelectedIconComponent: HistoryIcon,
        IconComponent: HistoryOutlinedIcon,
        show: 'both',
        moreGroup: NavBarItemMoreGroup.GENERAL,
    },
    {
        path: AppRoutes.library.path() as RestrictedNavBarItem<'both'>['path'],
        title: msg`Favorites`,
        SelectedIconComponent: FavoriteIcon,
        IconComponent: FavoriteBorderIcon,
        show: 'both',
        moreGroup: NavBarItemMoreGroup.GENERAL,
    },
    {
        path: AppRoutes.browse.path() as RestrictedNavBarItem<'both'>['path'],
        title: msg`Explore`,
        SelectedIconComponent: ExploreIcon,
        IconComponent: ExploreOutlinedIcon,
        show: 'both',
        moreGroup: NavBarItemMoreGroup.GENERAL,
    },
    {
        path: AppRoutes.updates.path,
        title: msg`Updates`,
        SelectedIconComponent: RssFeedIcon,
        IconComponent: RssFeedOutlinedIcon,
        show: 'both',
        moreGroup: NavBarItemMoreGroup.GENERAL,
        useBadge: () => {
            const { data } = requestManager.useGetRecentlyUpdatedChapters(undefined, {
                fetchPolicy: 'cache-and-network',
            });
            const count = data?.chapters.totalCount ?? 0;

            if (!count) {
                return { count: 0, title: '' };
            }

            return {
                count,
                title: plural(count, {
                    one: '# update',
                    other: '# updates',
                }),
            };
        },
    },
] as const satisfies RestrictedNavBarItem<'both'>[];

const NAVIGATION_BAR_DESKTOP_ITEMS = [
    {
        path: AppRoutes.downloads.path,
        title: msg`Downloads`,
        moreTitle: msg`Download queue`,
        SelectedIconComponent: GetAppIcon,
        IconComponent: GetAppOutlinedIcon,
        show: 'desktop',
        moreGroup: NavBarItemMoreGroup.HIDDEN_ITEM,
        useBadge: () => {
            const { t } = useLingui();
            const { data } = requestManager.useGetDownloadStatus();
            const downloadStatus = data?.downloadStatus;

            const isPaused = downloadStatus?.state === DownloaderState.Stopped;
            const count = downloadStatus?.queue.length ?? 0;

            if (!count) {
                return {
                    count,
                    title: '',
                };
            }

            return {
                count,
                title: isPaused ? t`Paused — ${count} remaining` : t`${count} remaining`,
            };
        },
    },
    {
        path: AppRoutes.settings.path,
        title: msg`Settings`,
        SelectedIconComponent: SettingsIcon,
        IconComponent: SettingsIcon,
        show: 'desktop',
        moreGroup: NavBarItemMoreGroup.SETTING_INFO,
    },
    {
        path: AppRoutes.about.path,
        title: msg`About`,
        SelectedIconComponent: InfoIcon,
        IconComponent: InfoIcon,
        show: 'desktop',
        moreGroup: NavBarItemMoreGroup.SETTING_INFO,
    },
] as const satisfies RestrictedNavBarItem<'desktop'>[];

export const NAVIGATION_BAR_MOBILE_ITEMS = [
    {
        path: AppRoutes.settings.path,
        title: msg`Suggestions`,
        SelectedIconComponent: LightbulbIcon,
        IconComponent: LightbulbOutlinedIcon,
        show: 'mobile',
        moreGroup: NavBarItemMoreGroup.GENERAL,
    },
] as const satisfies RestrictedNavBarItem<'mobile'>[];

export const NAVIGATION_BAR_ITEMS = [
    ...NAVIGATION_BAR_BASE_ITEMS,
    ...NAVIGATION_BAR_DESKTOP_ITEMS,
    ...NAVIGATION_BAR_MOBILE_ITEMS,
] as const satisfies NavbarItem[];

export const KOTATSU_HIDDEN_MORE_ITEMS = [
    {
        path: AppRoutes.settings.children.categories.path,
        title: msg`Categories`,
        SelectedIconComponent: ListAltIcon,
        IconComponent: ListAltIcon,
        show: 'both',
        moreGroup: NavBarItemMoreGroup.HIDDEN_ITEM,
    },
] as const satisfies NavbarItem[];
