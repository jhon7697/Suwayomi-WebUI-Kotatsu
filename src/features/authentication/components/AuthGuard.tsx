/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { AuthManager } from '@/features/authentication/AuthManager.ts';
import { requestManager } from '@/lib/requests/RequestManager.ts';

export const AuthGuard = ({ children }: { children: ReactNode }) => {
    // Set auth state synchronously on first render so PrivateRoutes doesn't redirect
    if (!AuthManager.isAuthInitialized()) {
        AuthManager.setAuthRequired(false);
        AuthManager.setAuthInitialized(true);
    }

    useEffect(() => {
        requestManager.processQueues();
    }, []);

    return children;
};
