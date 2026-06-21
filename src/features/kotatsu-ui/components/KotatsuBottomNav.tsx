/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useLocation, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import CollectionsBookmarkOutlinedIcon from '@mui/icons-material/CollectionsBookmarkOutlined';
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import NewReleasesOutlinedIcon from '@mui/icons-material/NewReleasesOutlined';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import ExploreOutlinedIcon from '@mui/icons-material/ExploreOutlined';
import ExploreIcon from '@mui/icons-material/Explore';
import HistoryIcon from '@mui/icons-material/History';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useLingui } from '@lingui/react/macro';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { KOTATSU_COLORS, KOTATSU_RADIUS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';

type NavItem = {
    label: string;
    path: string;
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
    matchPaths: string[];
};

const NavButton = ({
    item,
    isActive,
    onClick,
}: {
    item: NavItem;
    isActive: boolean;
    onClick: () => void;
}) => (
    <ButtonBase
        onClick={onClick}
        sx={{
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0.25,
            py: 1,
            position: 'relative',
            borderRadius: '12px',
            transition: 'all 0.2s ease',
        }}
    >
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 56,
                height: 28,
                borderRadius: KOTATSU_RADIUS.navPill,
                backgroundColor: isActive ? KOTATSU_COLORS.navActive : 'transparent',
                transition: 'background-color 0.2s ease',
            }}
        >
            <Box sx={{ color: isActive ? KOTATSU_COLORS.textPrimary : KOTATSU_COLORS.textMuted, fontSize: 22, display: 'flex' }}>
                {isActive ? item.activeIcon : item.icon}
            </Box>
        </Box>
        <Typography
            variant="caption"
            sx={{
                fontSize: '0.7rem',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? KOTATSU_COLORS.textPrimary : KOTATSU_COLORS.textMuted,
                lineHeight: 1.2,
            }}
        >
            {item.label}
        </Typography>
    </ButtonBase>
);

export const KotatsuBottomNav = () => {
    const { t } = useLingui();
    const navigate = useNavigate();
    const location = useLocation();

    const navItems: NavItem[] = [
        {
            label: t`Shelf`,
            path: AppRoutes.library.path(),
            icon: <CollectionsBookmarkOutlinedIcon sx={{ fontSize: 'inherit' }} />,
            activeIcon: <CollectionsBookmarkIcon sx={{ fontSize: 'inherit' }} />,
            matchPaths: ['/library'],
        },
        {
            label: t`Explore`,
            path: AppRoutes.browse.path(),
            icon: <ExploreOutlinedIcon sx={{ fontSize: 'inherit' }} />,
            activeIcon: <ExploreIcon sx={{ fontSize: 'inherit' }} />,
            matchPaths: ['/browse', '/sources', '/extensions'],
        },
        {
            label: t`Updates`,
            path: AppRoutes.updates.path,
            icon: <NewReleasesOutlinedIcon sx={{ fontSize: 'inherit' }} />,
            activeIcon: <NewReleasesIcon sx={{ fontSize: 'inherit' }} />,
            matchPaths: ['/updates'],
        },
        {
            label: t`History`,
            path: AppRoutes.history.path,
            icon: <HistoryIcon sx={{ fontSize: 'inherit' }} />,
            activeIcon: <HistoryIcon sx={{ fontSize: 'inherit' }} />,
            matchPaths: ['/history'],
        },
        {
            label: t`More`,
            path: AppRoutes.more.path,
            icon: <MoreHorizIcon sx={{ fontSize: 'inherit' }} />,
            activeIcon: <MoreHorizIcon sx={{ fontSize: 'inherit' }} />,
            matchPaths: ['/more', '/settings', '/about'],
        },
    ];

    const activeIndex = navItems.findIndex((item) =>
        item.matchPaths.some((p) => location.pathname.startsWith(p)),
    );

    return (
        <Box
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1300,
                backgroundColor: KOTATSU_COLORS.surface,
                borderTop: '1px solid rgba(255,255,255,0.06)',
                pb: 'env(safe-area-inset-bottom)',
            }}
        >
            <Stack direction="row" sx={{ px: 1 }}>
                {navItems.map((item, index) => (
                    <NavButton
                        key={item.path}
                        item={item}
                        isActive={activeIndex === index}
                        onClick={() => navigate(item.path)}
                    />
                ))}
            </Stack>
        </Box>
    );
};
