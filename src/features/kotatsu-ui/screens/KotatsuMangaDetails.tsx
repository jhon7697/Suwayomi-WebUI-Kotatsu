/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import Stack from '@mui/material/Stack';
import { useParams } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { KotatsuScreenLayout } from '@/features/kotatsu-ui/components/KotatsuScreenLayout.tsx';
import { KotatsuMangaHeader } from '@/features/kotatsu-ui/components/KotatsuMangaHeader.tsx';
import { KotatsuChapterItem } from '@/features/kotatsu-ui/components/KotatsuChapterItem.tsx';
import { KotatsuMangaBottomBar } from '@/features/kotatsu-ui/components/KotatsuMangaBottomBar.tsx';
import { GET_MANGA_SCREEN } from '@/lib/graphql/manga/MangaQuery.ts';
import { GET_CHAPTERS_MANGA } from '@/lib/graphql/chapter/ChapterQuery.ts';
import type {
    GetMangaScreenQuery,
    GetChaptersMangaQuery,
    GetChaptersMangaQueryVariables,
} from '@/lib/graphql/generated/graphql.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { useManageMangaLibraryState } from '@/features/manga/hooks/useManageMangaLibraryState.tsx';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';

export const KotatsuMangaDetails: React.FC = () => {
    const { t } = useLingui();
    const { id } = useParams<{ id: string }>();

    const { data, error, loading: isLoading } = requestManager.useGetManga<GetMangaScreenQuery>(GET_MANGA_SCREEN, id);

    const manga = data?.manga;
    const chaptersResponse = requestManager.useGetMangaChapters<GetChaptersMangaQuery, GetChaptersMangaQueryVariables>(
        GET_CHAPTERS_MANGA,
        id,
    );
    const chapters = chaptersResponse.data?.chapters?.nodes ?? STABLE_EMPTY_ARRAY;

    const { updateLibraryState } = useManageMangaLibraryState(manga as any);

    if (error && !manga) {
        return (
            <KotatsuScreenLayout showSearch={false}>
                <EmptyViewAbsoluteCentered message={t`Could not load manga`} messageExtra={getErrorMessage(error)} />
            </KotatsuScreenLayout>
        );
    }

    return (
        <KotatsuScreenLayout showSearch={false}>
            {isLoading && !manga && <LoadingPlaceholder />}
            {manga && (
                <Stack sx={{ pb: 10 }}>
                    <KotatsuMangaHeader
                        title={manga.title}
                        author={manga.author}
                        artist={manga.artist}
                        status={manga.status}
                        description={manga.description}
                        thumbnailUrl={manga.thumbnailUrl}
                        genres={manga.genre}
                        inLibrary={manga.inLibrary}
                        onToggleLibrary={updateLibraryState}
                    />
                    <Stack>
                        {chapters.map((chapter) => (
                            <KotatsuChapterItem
                                key={chapter.id}
                                name={chapter.name}
                                scanlator={chapter.scanlator}
                                uploadDate={chapter.uploadDate?.toString()}
                                isRead={chapter.isRead}
                                isBookmarked={chapter.isBookmarked}
                                isDownloaded={chapter.isDownloaded}
                                to={AppRoutes.reader.path(chapter.id, manga.id)}
                            />
                        ))}
                    </Stack>
                </Stack>
            )}
            {manga && <KotatsuMangaBottomBar mangaId={manga.id} continueChapter={manga.firstUnreadChapter} />}
        </KotatsuScreenLayout>
    );
};
