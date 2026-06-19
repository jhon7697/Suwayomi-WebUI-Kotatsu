/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';
import { memo } from 'react';
import type { ChapterHistoryListFieldsFragment } from '@/lib/graphql/generated/graphql.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import { SpinnerImage } from '@/base/components/SpinnerImage.tsx';
import { KOTATSU_COLORS, KOTATSU_RADIUS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';

export const ChapterHistoryCard = memo(({ chapter }: { chapter: ChapterHistoryListFieldsFragment }) => {
    const { manga } = chapter;

    return (
        <Box sx={{ px: 2, py: 0.75 }}>
            <CardActionArea
                component={Link}
                to={AppRoutes.manga.path(manga.id)}
                sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 1.5,
                    borderRadius: KOTATSU_RADIUS.card,
                    p: 0.5,
                }}
            >
                <Box
                    sx={{
                        width: 56,
                        height: 72,
                        borderRadius: KOTATSU_RADIUS.card,
                        overflow: 'hidden',
                        flexShrink: 0,
                    }}
                >
                    <SpinnerImage
                        alt={manga.title}
                        src={Mangas.getThumbnailUrl(manga)}
                        imgStyle={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                        noWrap
                        sx={{
                            color: KOTATSU_COLORS.textPrimary,
                            fontWeight: 500,
                            fontSize: '0.95rem',
                        }}
                    >
                        {manga.title}
                    </Typography>
                    <Typography
                        noWrap
                        sx={{
                            color: KOTATSU_COLORS.textSecondary,
                            fontSize: '0.8rem',
                            mt: 0.25,
                        }}
                    >
                        {chapter.name}
                    </Typography>
                </Box>
            </CardActionArea>
        </Box>
    );
});
