/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import ViewListIcon from '@mui/icons-material/ViewList';
import GridViewIcon from '@mui/icons-material/GridView';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { Link } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { Chapters } from '@/features/chapter/services/Chapters.ts';
import type { ChapterReadInfo, ChapterSourceOrderInfo } from '@/features/chapter/Chapter.types.ts';
import type { MangaIdInfo } from '@/features/manga/Manga.types.ts';
import { KOTATSU_COLORS, KOTATSU_RADIUS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';

type KotatsuMangaBottomBarProps = {
    mangaId: MangaIdInfo['id'];
    continueChapter?: (ChapterSourceOrderInfo & ChapterReadInfo & { id: number }) | null;
};

export const KotatsuMangaBottomBar = ({ mangaId, continueChapter }: KotatsuMangaBottomBarProps) => {
    const { t } = useLingui();

    return (
        <Paper
            elevation={0}
            sx={{
                position: 'fixed',
                left: 12,
                right: 12,
                bottom: 'calc(12px + env(safe-area-inset-bottom))',
                zIndex: 1200,
                borderRadius: KOTATSU_RADIUS.bottomSheet,
                backgroundColor: KOTATSU_COLORS.surfaceElevated,
                px: 1.5,
                py: 1,
            }}
        >
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                    <IconButton size="small" sx={{ color: KOTATSU_COLORS.textPrimary }}>
                        <ViewListIcon />
                    </IconButton>
                    <IconButton size="small" sx={{ color: KOTATSU_COLORS.textSecondary }}>
                        <GridViewIcon />
                    </IconButton>
                    <IconButton size="small" sx={{ color: KOTATSU_COLORS.textSecondary }}>
                        <BookmarkBorderIcon />
                    </IconButton>
                </Stack>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1 }}>
                    {continueChapter ? (
                        <Button
                            component={Link}
                            to={AppRoutes.reader.path(mangaId, continueChapter.sourceOrder)}
                            state={Chapters.getReaderOpenChapterLocationState(continueChapter)}
                            sx={{
                                borderRadius: KOTATSU_RADIUS.button,
                                backgroundColor: KOTATSU_COLORS.continueButton,
                                color: KOTATSU_COLORS.continueButtonText,
                                textTransform: 'none',
                                px: 3,
                                fontWeight: 600,
                                '&:hover': { backgroundColor: '#e8e8e8' },
                            }}
                        >
                            {t`Continue`}
                        </Button>
                    ) : null}
                    <IconButton
                        size="small"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        sx={{
                            color: KOTATSU_COLORS.textPrimary,
                            backgroundColor: KOTATSU_COLORS.surface,
                        }}
                    >
                        <KeyboardArrowUpIcon />
                    </IconButton>
                </Stack>
            </Stack>
        </Paper>
    );
};
