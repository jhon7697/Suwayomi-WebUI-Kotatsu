/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import CssBaseline from '@mui/material/CssBaseline';
import type { PropsWithChildren } from 'react';
import React, { useEffect, useLayoutEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadErrorMessages, loadDevMessages } from '@apollo/client/dev';
import { AwaitableComponent } from 'awaitable-component';
import { AppContext } from '@/base/contexts/AppContext.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { WebUIUpdateChecker } from '@/features/app-updates/components/WebUIUpdateChecker.tsx';
import { ServerUpdateChecker } from '@/features/app-updates/components/ServerUpdateChecker.tsx';
import { ErrorBoundary } from '@/base/components/feedback/ErrorBoundary.tsx';
import { AuthGuard } from '@/features/authentication/components/AuthGuard.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { noOp } from '@/lib/HelperFunctions.ts';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { AuthManager } from '@/features/authentication/AuthManager.ts';
import { MigrationFABIndicator } from '@/features/migration/components/MigrationFABIndicator.tsx';
import { MigrationManager } from '@/features/migration/MigrationManager.ts';
import { KotatsuRoutes } from '@/features/kotatsu-ui/KotatsuRoutes.tsx';

if (import.meta.env.DEV) {
    // Adds messages only in a dev environment
    loadDevMessages();
    loadErrorMessages();
}

const ScrollToTop = () => {
    const { pathname } = useLocation();

    useLayoutEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
};

const InitializeGuard = ({ children }: PropsWithChildren) => {
    useEffect(() => {
        // Fire initial requests in background without blocking render
        requestManager.getGlobalMeta().response.catch(noOp);
        requestManager.getServerSettings().response.catch(noOp);
    }, []);

    return children;
};

const InitialBackgroundRequests = () => {
    // Load the full download status once on startup to fill the cache
    requestManager.useGetDownloadStatus({ nextFetchPolicy: 'standby' });

    const [fetchExtensionList] = requestManager.useExtensionListFetch();

    useEffect(() => {
        // Fetch extension list on startup to show up-to-date number of available extension updates in the navigation bar
        // without having to open the extensions page.
        fetchExtensionList().catch(defaultPromiseErrorHandler('App::InitialBackgroundRequests: extension list'));
    }, []);

    return null;
};

/**
 * Creates permanent subscriptions to always have the latest data.
 *
 * E.g. in case a view is open, which does not subscribe to the download updates, finished downloads are never received
 * and thus, data of existing chapters/mangas in the cache get outdated
 */
const BackgroundSubscriptions = () => {
    const { isAuthRequired, accessToken } = AuthManager.useSession();

    const skipConnection = isAuthRequired === null || (isAuthRequired && !accessToken);

    requestManager.useDownloadSubscription({ skip: skipConnection });
    requestManager.useUpdaterSubscription({ skip: skipConnection });
    requestManager.useWebUIUpdateSubscription({ skip: skipConnection });

    return null;
};

const ReactRouterSetter = () => {
    const navigate = useNavigate();

    useEffect(() => {
        ReactRouter.setNavigateFn(navigate);
    }, []);

    return null;
};

const ResumeMigration = () => {
    useEffect(() => {
        if (!MigrationManager.isActive()) {
            navigator.locks
                ?.request('migration-executor', async () => {
                    const resumed = await MigrationManager.resume();
                    if (resumed) {
                        await MigrationManager.awaitCompletion();
                    }
                })
                .catch(defaultPromiseErrorHandler('ResumeMigration'));
        }
    }, []);

    return null;
};

export const App: React.FC = () => (
    <AppContext>
        <ScrollToTop />
        <AwaitableComponent.Root />

        <ReactRouterSetter />

        <CssBaseline enableColorScheme />

        <AuthGuard>
            <InitializeGuard>
                <ServerUpdateChecker />
                <WebUIUpdateChecker />
                <InitialBackgroundRequests />
                <BackgroundSubscriptions />
                <ResumeMigration />

                <ErrorBoundary>
                    <KotatsuRoutes />
                </ErrorBoundary>

                <MigrationFABIndicator />
            </InitializeGuard>
        </AuthGuard>
    </AppContext>
);
