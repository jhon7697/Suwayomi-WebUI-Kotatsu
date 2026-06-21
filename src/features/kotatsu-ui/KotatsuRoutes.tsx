/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { FC } from 'react';
import { Navigate, Route, Routes, Outlet, useLocation } from 'react-router-dom';
import Box from '@mui/material/Box';

// Screens
import { KotatsuLibrary } from '@/features/kotatsu-ui/screens/KotatsuLibrary.tsx';
import { KotatsuUpdates } from '@/features/kotatsu-ui/screens/KotatsuUpdates.tsx';
import { KotatsuHistory } from '@/features/kotatsu-ui/screens/KotatsuHistory.tsx';
import { KotatsuExplore } from '@/features/kotatsu-ui/screens/KotatsuExplore.tsx';
import { KotatsuMore } from '@/features/kotatsu-ui/screens/KotatsuMore.tsx';
import { KotatsuMangaDetails } from '@/features/kotatsu-ui/screens/KotatsuMangaDetails.tsx';
import { KotatsuReader } from '@/features/kotatsu-ui/screens/KotatsuReader.tsx';
import { KotatsuSettings } from '@/features/kotatsu-ui/screens/KotatsuSettings.tsx';

// Components
import { KotatsuBottomNav } from '@/features/kotatsu-ui/components/KotatsuBottomNav.tsx';

// Infrastructure imports kept for auth and existing routes
import { LoginPage } from '@/features/authentication/screens/LoginPage.tsx';
import { AuthManager } from '@/features/authentication/AuthManager.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { SearchParam } from '@/base/Base.types.ts';

const PrivateRoutes = () => {
    const isAuthenticated = AuthManager.useIsAuthenticated();

    if (!isAuthenticated) {
        return (
            <Navigate
                to={{
                    pathname: AppRoutes.authentication.children.login.path,
                    search: `${SearchParam.REDIRECT}=${window.location.pathname}`,
                }}
                replace
            />
        );
    }

    return <Outlet />;
};

const KotatsuAppLayout = () => {
    const location = useLocation();

    // Hide bottom navigation on full-screen pages (reader, manga details)
    const hideBottomNav = location.pathname.match(/^\/manga\/\d+/) !== null;

    return (
        <Box sx={{ height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <Box sx={{ flex: 1, overflow: 'auto', pb: hideBottomNav ? 0 : '60px' }}>
                <Outlet />
            </Box>
            {!hideBottomNav && <KotatsuBottomNav />}
        </Box>
    );
};

export const KotatsuRoutes: FC = () => (
        <Routes>
            {/* Auth route — accessible without login */}
            <Route path={AppRoutes.authentication.match}>
                <Route path={AppRoutes.authentication.children.login.match} element={<LoginPage />} />
            </Route>

            {/* All other routes require authentication */}
            <Route element={<PrivateRoutes />}>
                {/* Reader route — full-screen, no layout wrapper */}
                <Route path={AppRoutes.reader.match} element={<KotatsuReader />} />

                {/* Routes with bottom navigation layout */}
                <Route element={<KotatsuAppLayout />}>
                    {/* Root redirect */}
                    <Route path="/" element={<Navigate to="/library" replace />} />

                    {/* Main tab screens */}
                    <Route path={AppRoutes.library.match} element={<KotatsuLibrary />} />
                    <Route path={AppRoutes.updates.match} element={<KotatsuUpdates />} />
                    <Route path={AppRoutes.history.match} element={<KotatsuHistory />} />
                    <Route path={AppRoutes.browse.match} element={<KotatsuExplore />} />
                    <Route path={AppRoutes.more.match} element={<KotatsuMore />} />

                    {/* Manga details */}
                    <Route path={AppRoutes.manga.match} element={<KotatsuMangaDetails />} />

                    {/* Settings */}
                    <Route path={`${AppRoutes.settings.match}/*`} element={<KotatsuSettings />} />

                    {/* Legacy source/extension routes — redirect to browse */}
                    <Route path={AppRoutes.sources.match} element={<Navigate to="/browse" replace />} />
                    <Route path={AppRoutes.extension.match} element={<Navigate to="/browse" replace />} />

                    {/* Catch-all: redirect to library */}
                    <Route path="*" element={<Navigate to="/library" replace />} />
                </Route>
            </Route>
        </Routes>
    );
