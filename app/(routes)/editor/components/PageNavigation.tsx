import { Page } from '@/lib/types/canvas';
import { Plus } from 'lucide-react';

interface PageNavigationProps {
    pages: Page[];
    currentPageId: string | null;
    goToPage: (pageId: string) => void;
    addPage: () => void;
    deletePage: (pageId: string) => void;
    selectedPageThumbnail: string | null;
    setSelectedPageThumbnail: (pageId: string | null) => void;
}

export default function PageNavigation({
    pages,
    currentPageId,
    goToPage,
    addPage,
    deletePage,
    selectedPageThumbnail,
    setSelectedPageThumbnail
}: PageNavigationProps) {

    return (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 py-3 px-6 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.09)] bg-white border border-gray-100 z-editor-popover page-navigation" data-page-navigation style={{
        }}>
            <div className="flex items-center gap-4 page-thumbnails-container">
                {pages.map((page, index) => (
                    <div key={page.id} className="group relative">
                        <div
                            className={`relative rounded-lg overflow-hidden border-2 ${selectedPageThumbnail === page.id
                                ? 'border-red-500 shadow-md'
                                : currentPageId === page.id
                                    ? 'border-brand-blue shadow-sm'
                                    : 'border-[#e5e5e5] hover:border-brand-blue/30'
                                } transition-all cursor-pointer hover:shadow-sm`}
                            style={{ width: '100px', height: '56px' }}
                            onClick={(e) => {
                                if (e.ctrlKey || e.metaKey) {
                                    // Toggle selection for deletion
                                    setSelectedPageThumbnail(selectedPageThumbnail === page.id ? null : page.id);
                                } else {
                                    // Regular click just navigates to page
                                    goToPage(page.id);
                                    // Clear any selection
                                    setSelectedPageThumbnail(null);
                                }
                            }}
                            onContextMenu={(e) => {
                                e.preventDefault();
                                // Right-click selects for deletion
                                setSelectedPageThumbnail(selectedPageThumbnail === page.id ? null : page.id);
                            }}
                        >
                            <div className="absolute inset-0 bg-white flex items-center justify-center">
                                <div className={`text-[0.6rem] font-medium absolute top-1.5 right-1.5 flex items-center justify-center h-4 w-4 rounded-full ${selectedPageThumbnail === page.id
                                    ? 'bg-red-500 text-white'
                                    : currentPageId === page.id
                                        ? 'bg-brand-blue text-white'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    <span>{index + 1}</span>
                                </div>
                                <div className="flex flex-col items-center justify-center">
                                    <div className="text-[0.6rem] text-gray-500">Your paragraph text</div>
                                    <img src="/abstract-geometric-shapes.png" alt="Placeholder" className="mt-0.5 w-4 h-4 opacity-30" />
                                </div>
                            </div>
                        </div>

                        {/* Visual indicator for current and selected pages */}
                        {currentPageId === page.id && !selectedPageThumbnail && (
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-8 rounded-full bg-gradient-to-r from-brand-blue to-brand-teal"></div>
                        )}
                        {selectedPageThumbnail === page.id && (
                            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 w-8 rounded-full bg-gradient-to-r from-red-500 to-red-400">
                                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 text-xs text-red-500 whitespace-nowrap">
                                    Press Delete to remove
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {/* Add Page Button with improved styling */}
                <div
                    className="rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 border-2 border-dashed border-gray-200 hover:border-brand-blue/30 transition-all cursor-pointer group"
                    style={{ width: '100px', height: '56px' }}
                    onClick={() => addPage()}
                >
                    <div className="flex flex-col items-center justify-center gap-1.5">
                        <div className="rounded-full p-1.5 bg-white group-hover:bg-brand-blue/10 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                            <Plus className="h-4 w-4 text-gray-500 group-hover:text-brand-blue transition-colors" strokeWidth={1.5} />
                        </div>
                        <span className="text-[0.65rem] text-gray-500 group-hover:text-brand-blue font-medium transition-colors">Add page</span>
                    </div>
                </div>
            </div>
        </div>

    )
}
