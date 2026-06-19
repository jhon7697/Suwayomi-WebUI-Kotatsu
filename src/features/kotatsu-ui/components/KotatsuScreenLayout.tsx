/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import { KotatsuSearchBar } from '@/features/kotatsu-ui/components/KotatsuSearchBar.tsx';
import type { KotatsuFilterId } from '@/features/kotatsu-ui/components/KotatsuFilterChips.tsx';
import { KotatsuFilterChips } from '@/features/kotatsu-ui/components/KotatsuFilterChips.tsx';
import { KOTATSU_COLORS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';

type KotatsuScreenLayoutProps = {
    children: ReactNode;
    showSearch?: boolean;
    showFilters?: boolean;
    activeFilters?: KotatsuFilterId[];
    onFilterToggle?: (filter: KotatsuFilterId) => void;
    headerExtra?: ReactNode;
    onMenuClick?: () => void;
    enableGlobalSearch?: boolean;
};

export const KotatsuScreenLayout = ({
    children,
    showSearch = true,
    showFilters = false,
    activeFilters,
    onFilterToggle,
    headerExtra,
    onMenuClick,
    enableGlobalSearch,
}: KotatsuScreenLayoutProps) => {
    const isMobileWidth = MediaQuery.useIsMobileWidth();

    if (!isMobileWidth) {
        return children;
    }

    return (
        <Box sx={{ backgroundColor: KOTATSU_COLORS.background, minHeight: '100%' }}>
            {showSearch && <KotatsuSearchBar onMenuClick={onMenuClick} enableGlobalSearch={enableGlobalSearch} />}
            {headerExtra}
            {showFilters && <KotatsuFilterChips activeFilters={activeFilters} onFilterToggle={onFilterToggle} />}
            {children}
        </Box>
    );
};
