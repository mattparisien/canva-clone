import React from 'react';
import { Header } from '@components/templates/header';
import { NavigationSidebar } from '@components/templates/navigation-sidebar';
import { GLOBAL_NAVIGATION_ITEMS } from '@lib/constants/navigation';

export default function SiteLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <NavigationSidebar items={GLOBAL_NAVIGATION_ITEMS} />
            <main className="flex flex-col flex-1 pl-sidebar min-h-screen bg pt-10">
                <div className="flex-grow">
                    {children}
                </div>
            </main>
        </>
    );
}
