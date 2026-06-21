/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Grid from '@mui/material/Grid';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { KotatsuScreenLayout } from '@/features/kotatsu-ui/components/KotatsuScreenLayout.tsx';
import { KotatsuMangaCard } from '@/features/kotatsu-ui/components/KotatsuMangaCard.tsx';
import { useKotatsuMainScreen } from '@/features/kotatsu-ui/hooks/useKotatsuMainScreen.ts';
import { GET_CATEGORIES_LIBRARY } from '@/lib/graphql/category/CategoryQuery.ts';
import type { GetCategoriesLibraryQuery, GetCategoriesLibraryQueryVariables } from '@/lib/graphql/generated/graphql.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { Mangas } from '@/features/manga/services/Mangas.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { KOTATSU_COLORS } from '@/features/kotatsu-ui/Kotatsu.constants.ts';

export const KotatsuLibrary: React.FC = () => {
    const { t } = useLingui();
    const { openSettings } = useKotatsuMainScreen();
    useAppTitle(t`Library`);

    const {
        data: categoriesResponse,
        error: tabsError,
        loading: areCategoriesLoading,
    } = requestManager.useGetCategories<GetCategoriesLibraryQuery, GetCategoriesLibraryQueryVariables>(
        GET_CATEGORIES_LIBRARY,
    );

    const tabsData = categoriesResponse?.categories.nodes.filter(
        (category) => category.id !== 0 || (category.id === 0 && category.mangas.totalCount),
    );
    const tabs = tabsData ?? STABLE_EMPTY_ARRAY;

    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const activeTab = tabs[activeTabIndex];

    const {
        data: categoryMangaResponse,
        loading: areMangasLoading,
        error: mangaError,
    } = requestManager.useGetCategoryMangas(activeTab?.id, { skip: !activeTab });
    
    const categoryMangas = categoryMangaResponse?.mangas.nodes ?? STABLE_EMPTY_ARRAY;

    if (tabsError) {
        return (
            <KotatsuScreenLayout onMenuClick={openSettings}>
                <EmptyViewAbsoluteCentered message={t`Unable to load data`} messageExtra={getErrorMessage(tabsError)} />
            </KotatsuScreenLayout>
        );
    }

    return (
        <KotatsuScreenLayout onMenuClick={openSettings}>
            {areCategoriesLoading ? (
                <LoadingPlaceholder />
            ) : tabs.length > 0 ? (
                <>
                    <Tabs
                        value={activeTabIndex}
                        onChange={(_, newValue) => setActiveTabIndex(newValue)}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        sx={{
                            borderBottom: 1,
                            borderColor: 'divider',
                            backgroundColor: KOTATSU_COLORS.surface,
                            position: 'sticky',
                            top: 0,
                            zIndex: 1,
                        }}
                    >
                        {tabs.map((tab) => (
                            <Tab key={tab.id} label={tab.name} />
                        ))}
                    </Tabs>
                    
                    <Box sx={{ p: 2, pb: 10 }}>
                        {areMangasLoading ? (
                            <LoadingPlaceholder />
                        ) : mangaError ? (
                            <EmptyViewAbsoluteCentered message={t`Unable to load mangas`} messageExtra={getErrorMessage(mangaError)} />
                        ) : categoryMangas.length === 0 ? (
                            <EmptyViewAbsoluteCentered message={t`No manga in this category`} />
                        ) : (
                            <Grid container spacing={1.5}>
                                {categoryMangas.map((manga) => (
                                    <Grid key={manga.id} size={{ xs: 4, sm: 3, md: 2 }}>
                                        <KotatsuMangaCard
                                            id={manga.id}
                                            title={manga.title}
                                            thumbnailUrl={Mangas.getThumbnailUrl(manga)}
                                            unreadCount={manga.unreadCount}
                                            downloadCount={manga.downloadCount}
                                            inLibrary={manga.inLibrary}
                                            to={AppRoutes.manga.path(manga.id)}
                                        />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                </>
            ) : (
                <EmptyViewAbsoluteCentered message={t`Your library is empty`} />
            )}
        </KotatsuScreenLayout>
    );
};
