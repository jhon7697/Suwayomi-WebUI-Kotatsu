/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import { KOTATSU_COLORS, KOTATSU_RADIUS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';

export const KotatsuContinueFab = () => {
    const { t } = useLingui();
    const isMobileWidth = MediaQuery.useIsMobileWidth();

    const { data } = requestManager.useGetRecentlyReadChapters(undefined, {
        fetchPolicy: 'cache-first',
    });

    const latestChapter = data?.chapters?.nodes?.[0];

    if (!isMobileWidth || !latestChapter) {
        return null;
    }

    const { manga } = latestChapter;

    return (
        <Button
            component={Link}
            to={AppRoutes.reader.path(manga.id, latestChapter.sourceOrder)}
            state={Chapters.getReaderOpenChapterLocationState(latestChapter)}
            startIcon={<AutoStoriesIcon />}
            sx={{
                position: 'fixed',
                right: 16,
                bottom: 'calc(72px + env(safe-area-inset-bottom))',
                zIndex: 1200,
                borderRadius: KOTATSU_RADIUS.fab,
                backgroundColor: KOTATSU_COLORS.fabBackground,
                color: KOTATSU_COLORS.textPrimary,
                textTransform: 'none',
                px: 2.5,
                py: 1.25,
                fontSize: '0.95rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                '&:hover': {
                    backgroundColor: '#333333',
                },
            }}
        >
            {t`Continue`}
        </Button>
    );
};
