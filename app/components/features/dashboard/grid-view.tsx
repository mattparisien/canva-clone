import { type Design } from "@/lib/api";
import { upperFirst } from "lodash";
import { getRelativeTime } from "@/lib/utils/utils";

interface GridViewProps {
    designs: Design[];
    // selectedDesigns: string[]; // Removed
    handleOpenDesign: (designId: string) => void;
    toggleDesignSelection: (designId: string, e: React.MouseEvent) => void;
    getVisibleDesigns: () => Design[];
    getDefaultThumbnail: (index: number) => string;
    isDesignSelected: (designId: string) => boolean;
}

export default function GridView({
    getVisibleDesigns,
    handleOpenDesign,
    toggleDesignSelection,
    getDefaultThumbnail,
    isDesignSelected
    // selectedDesigns prop is not used here, so no change needed in destructuring
}: GridViewProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* Design cards - Create design card removed */}
            {getVisibleDesigns().map((design, index) => {
                const handleCardClick = () => {
                    handleOpenDesign(design._id);
                };

                const handleCheckboxClick = (e: React.MouseEvent) => {
                    toggleDesignSelection(design._id, e);
                };

                return (
                    <div
                        className={`group relative rounded-lg overflow-hidden bg-white transition-all duration-300 ${isDesignSelected(design._id) ? 'ring-2 ring-brand-blue' : ''
                            }`}
                        onClick={handleCardClick}
                    >
                        {/* Preview thumbnail */}
                        <div className="aspect-[16/9] bg-gray-100 overflow-hidden relative">
                            <img
                                src={design.thumbnail || getDefaultThumbnail(index)}
                                alt={design.title}
                                className="w-full h-full object-cover"
                            />


                            {/* Selection checkbox - visible on hover or when selected */}
                            <div
                                className={`absolute top-2 left-2 transition-opacity ${isDesignSelected(design._id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                    }`}
                                onClick={handleCheckboxClick}
                            >
                                <div className={`h-6 w-6 rounded border-[1.2px] flex items-center justify-center cursor-pointer ${isDesignSelected(design._id)
                                    ? 'bg-brand-blue border-brand-blue text-white'
                                    : 'border-gray-400 bg-white'
                                    }`}>
                                    {isDesignSelected(design._id) && (
                                        <svg width="14" height="14" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Design info */}
                        <div className="p-3">
                            <h3 className="font-semibold text-sm text-gray-900 truncate">{design.title}</h3>
                            <div className="flex items-center mt-1 text-gray-500 text-xs">
                                <span className="truncate">
                                    {upperFirst(design.type)} · Edited {getRelativeTime(design.updatedAt)}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    )
}