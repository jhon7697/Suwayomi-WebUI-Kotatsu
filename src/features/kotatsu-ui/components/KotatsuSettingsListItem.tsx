/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode } from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { KOTATSU_COLORS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';

type KotatsuSettingsListItemProps = {
    to?: string;
    icon?: ReactNode;
    title: string;
    subtitle?: string;
    onClick?: () => void;
    endAdornment?: ReactNode;
};

export const KotatsuSettingsListItem = ({
    to,
    icon,
    title,
    subtitle,
    onClick,
    endAdornment,
}: KotatsuSettingsListItemProps) => {
    const content = (
        <>
            {icon && (
                <Typography component="span" sx={{ mr: 2, display: 'flex', color: KOTATSU_COLORS.textPrimary }}>
                    {icon}
                </Typography>
            )}
            <ListItemText
                primary={title}
                secondary={subtitle}
                slotProps={{
                    primary: {
                        sx: {
                            color: KOTATSU_COLORS.textPrimary,
                            fontWeight: 500,
                            fontSize: '1rem',
                        },
                    },
                    secondary: {
                        sx: {
                            color: KOTATSU_COLORS.textSecondary,
                            fontSize: '0.875rem',
                            mt: 0.25,
                        },
                    },
                }}
            />
            {endAdornment}
        </>
    );

    if (to) {
        return (
            <ListItemButton
                component={Link}
                to={to}
                sx={{
                    px: 2,
                    py: 1.75,
                    alignItems: 'flex-start',
                }}
            >
                {content}
            </ListItemButton>
        );
    }

    return (
        <ListItemButton onClick={onClick} sx={{ px: 2, py: 1.75, alignItems: 'flex-start' }}>
            {content}
        </ListItemButton>
    );
};
