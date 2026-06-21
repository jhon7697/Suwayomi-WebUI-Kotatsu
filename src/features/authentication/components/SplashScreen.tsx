/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { StackProps } from '@mui/material/Stack';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { ServerAddressSetting } from '@/features/settings/components/ServerAddressSetting.tsx';

export const SplashScreen = ({
    slots,
}: {
    slots?: {
        stackProps?: StackProps;
        serverAddressProps?: StackProps;
    };
}) => (
    <Stack
        {...slots?.stackProps}
        sx={{
            position: 'relative',
            minWidth: '100vw',
            minHeight: '100vh',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#000000',
            gap: 3,
            ...slots?.stackProps?.sx,
        }}
    >
        <Typography
            sx={{
                fontSize: '2.5rem',
                fontWeight: 700,
                color: '#b8c5d6',
                letterSpacing: '0.05em',
            }}
        >
            Kotatsu
        </Typography>
        <CircularProgress size={32} sx={{ color: '#b8c5d6' }} />
        <Stack
            {...slots?.serverAddressProps}
            sx={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                ...slots?.serverAddressProps?.sx,
            }}
        >
            <ServerAddressSetting />
        </Stack>
    </Stack>
);
