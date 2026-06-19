/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { NavbarItem } from '@/features/navigation-bar/NavigationBar.types.ts';
import { ListItemLink } from '@/base/components/lists/ListItemLink.tsx';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import ListItemIcon from '@mui/material/ListItemIcon';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import type { ComponentProps } from 'react';
import { useMemo } from 'react';
import ListItem from '@mui/material/ListItem';
import Badge from '@mui/material/Badge';
import { useLingui } from '@lingui/react/macro';
import { useNavBarContext } from '@/features/navigation-bar/NavbarContext.tsx';
import Box from '@mui/material/Box';
import { KOTATSU_COLORS, KOTATSU_RADIUS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';

export const NavigationBarItem = ({
    path,
    title,
    IconComponent,
    SelectedIconComponent,
    useBadge,
    slots,
    forceCollapsed,
}: NavbarItem & {
    slots?: {
        listItemLink?: Partial<ComponentProps<typeof ListItemLink>>;
    };
    forceCollapsed?: boolean;
}) => {
    const { t } = useLingui();
    const location = useLocation();
    const { isCollapsed: isCollapsedContext } = useNavBarContext();
    const theme = useTheme();
    const badgeInfo = useBadge?.();
    const isMobileWidth = MediaQuery.useIsMobileWidth();

    const isCollapsed = forceCollapsed ?? isCollapsedContext;

    const isActive = location.pathname.startsWith(path);
    const Icon = isActive ? SelectedIconComponent : IconComponent;

    const { listItemProps, listItemIconProps } = useMemo(
        () => ({
            listItemProps: isCollapsed ? { p: 0.5, display: 'flex', flexDirection: 'column' } : {},
            listItemIconProps: isCollapsed ? { justifyContent: 'center' } : {},
        }),
        [isCollapsed],
    );

    const kotatsuMobileStyle = isMobileWidth && isCollapsed;

    return (
        <ListItemLink
            {...slots?.listItemLink}
            selected={!isCollapsed && isActive}
            sx={{
                p: 0,
                m: 0,
                ...slots?.listItemLink?.sx,
            }}
            to={path}
        >
            <CustomTooltip
                title={
                    <>
                        {t(title)}
                        <br />
                        {badgeInfo?.title}
                    </>
                }
                placement="right"
            >
                <ListItem sx={listItemProps}>
                    <ListItemIcon sx={listItemIconProps}>
                        <Badge
                            badgeContent={badgeInfo?.count}
                            sx={{
                                '& .MuiBadge-badge': {
                                    backgroundColor: KOTATSU_COLORS.badge,
                                    color: '#fff',
                                    fontSize: '0.65rem',
                                    minWidth: 18,
                                    height: 18,
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: KOTATSU_RADIUS.navPill,
                                    px: kotatsuMobileStyle && isActive ? 2 : 1,
                                    py: kotatsuMobileStyle ? 0.75 : 0,
                                    backgroundColor:
                                        kotatsuMobileStyle && isActive ? KOTATSU_COLORS.navActive : 'transparent',
                                }}
                            >
                                <Icon
                                    sx={{
                                        color: isActive ? KOTATSU_COLORS.textPrimary : KOTATSU_COLORS.textSecondary,
                                        fontSize: kotatsuMobileStyle ? 24 : undefined,
                                        ...(!kotatsuMobileStyle &&
                                            theme.applyStyles('dark', {
                                                color: isActive ? 'primary.light' : undefined,
                                            })),
                                    }}
                                />
                            </Box>
                        </Badge>
                    </ListItemIcon>
                </ListItem>
            </CustomTooltip>
        </ListItemLink>
    );
};
