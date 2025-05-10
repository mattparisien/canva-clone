import React from 'react';
import { Header } from '@components/layout/header';
import { NavigationSidebar } from '@components/layout/navigation-sidebar';
import { GLOBAL_NAVIGATION_ITEMS } from '@lib/constants/navigation';

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <NavigationSidebar items={GLOBAL_NAVIGATION_ITEMS} />
            <main className="flex flex-col flex-1 pl-sidebar min-h-screen">
                <div className="flex-grow">
                    {children}
                </div>
            </main>
        </>
    );
}
