/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactElement } from 'react';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import UpdateIcon from '@mui/icons-material/Update';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { KOTATSU_COLORS, KOTATSU_RADIUS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';

export type KotatsuFilterId = 'onDevice' | 'newChapters' | 'completed';

type KotatsuFilterChipsProps = {
    activeFilters?: KotatsuFilterId[];
    onFilterToggle?: (filter: KotatsuFilterId) => void;
    show?: boolean;
};

const FILTER_CONFIG: Record<KotatsuFilterId, { label: ReturnType<typeof msg>; icon: ReactElement }> = {
    onDevice: {
        label: msg`On device`,
        icon: <DescriptionOutlinedIcon sx={{ fontSize: 18 }} />,
    },
    newChapters: {
        label: msg`New chapters`,
        icon: <UpdateIcon sx={{ fontSize: 18 }} />,
    },
    completed: {
        label: msg`Completed`,
        icon: <DoneAllIcon sx={{ fontSize: 18 }} />,
    },
};

export const KotatsuFilterChips = ({ activeFilters = [], onFilterToggle, show = true }: KotatsuFilterChipsProps) => {
    const { t } = useLingui();

    if (!show) {
        return null;
    }

    return (
        <Stack
            direction="row"
            sx={{
                gap: 1,
                px: 2,
                pb: 1.5,
                overflowX: 'auto',
                '&::-webkit-scrollbar': { display: 'none' },
            }}
        >
            {(Object.keys(FILTER_CONFIG) as KotatsuFilterId[]).map((filterId) => {
                const config = FILTER_CONFIG[filterId];
                const isActive = activeFilters.includes(filterId);

                return (
                    <Chip
                        key={filterId}
                        icon={config.icon}
                        label={t(config.label)}
                        variant="outlined"
                        clickable
                        onClick={() => onFilterToggle?.(filterId)}
                        sx={{
                            borderRadius: KOTATSU_RADIUS.chip,
                            borderColor: KOTATSU_COLORS.chipBorder,
                            color: KOTATSU_COLORS.textPrimary,
                            backgroundColor: isActive ? KOTATSU_COLORS.navActive : 'transparent',
                            '& .MuiChip-icon': {
                                color: KOTATSU_COLORS.textPrimary,
                            },
                            flexShrink: 0,
                        }}
                    />
                );
            })}
        </Stack>
    );
};
