/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import { useNavigate } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { useQueryParam, StringParam } from 'use-query-params';
import { useCallback, useState } from 'react';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { SearchParam } from '@/base/Base.types.ts';
import { KOTATSU_COLORS, KOTATSU_RADIUS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';

type KotatsuSearchBarProps = {
    placeholder?: string;
    onMenuClick?: () => void;
    enableGlobalSearch?: boolean;
};

export const KotatsuSearchBar = ({ placeholder, onMenuClick, enableGlobalSearch = true }: KotatsuSearchBarProps) => {
    const { t } = useLingui();
    const navigate = useNavigate();
    const [query, setQuery] = useQueryParam(SearchParam.QUERY, StringParam);
    const [searchValue, setSearchValue] = useState(query ?? '');

    const submitSearch = useCallback(() => {
        const trimmed = searchValue.trim();
        if (!trimmed) {
            setQuery(undefined);
            return;
        }

        if (enableGlobalSearch) {
            navigate(AppRoutes.sources.children.searchAll.path(trimmed));
            return;
        }

        setQuery(trimmed);
    }, [enableGlobalSearch, navigate, searchValue, setQuery]);

    return (
        <Stack
            direction="row"
            sx={{
                alignItems: 'center',
                gap: 1,
                px: 2,
                pt: 'max(12px, env(safe-area-inset-top))',
                pb: 1,
            }}
        >
            <Stack
                direction="row"
                sx={{
                    flex: 1,
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1.25,
                    borderRadius: KOTATSU_RADIUS.search,
                    backgroundColor: KOTATSU_COLORS.searchBackground,
                }}
            >
                <SearchIcon sx={{ color: KOTATSU_COLORS.textSecondary, fontSize: 22 }} />
                <InputBase
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            submitSearch();
                        }
                    }}
                    placeholder={placeholder ?? t`Search manga`}
                    sx={{
                        flex: 1,
                        color: KOTATSU_COLORS.textPrimary,
                        fontSize: '1rem',
                        '& input::placeholder': {
                            color: KOTATSU_COLORS.textSecondary,
                            opacity: 1,
                        },
                    }}
                />
            </Stack>
            <IconButton onClick={onMenuClick} sx={{ color: KOTATSU_COLORS.textPrimary }}>
                <MoreVertIcon />
            </IconButton>
        </Stack>
    );
};
