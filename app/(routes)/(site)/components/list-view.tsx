import { Project } from "@canva-clone/shared-types/dist/models/project";
import { getRelativeTime } from "@/lib/utils/utils";
import { Button } from "@components/atoms/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { upperFirst } from "lodash";
import { MoreHorizontal, Share2, Star, StarOff } from "lucide-react";
import { Badge } from "@components/atoms/badge";

interface ListViewProps {
    designs: Project[];
    handleOpenDesign: (designId: string) => void;
    toggleStar: (designId: string, e: React.MouseEvent) => void;
    handleDeleteDesign: (designId: string, e: React.MouseEvent) => void;
    getVisibleDesigns: () => Project[];
    getDefaultThumbnail: (index: number) => string;
    toggleDesignSelection: (designId: string, e: React.MouseEvent) => void; // Added
    isDesignSelected: (designId: string) => boolean; // Added
}

export default function ListView({
    getVisibleDesigns,
    handleOpenDesign,
    toggleStar,
    handleDeleteDesign,
    getDefaultThumbnail,
    toggleDesignSelection, // Added
    isDesignSelected, // Added
}: ListViewProps) {
    return (
        <div className="rounded-2xl border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-brand-blue-light/10 to-brand-teal-light/10">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Last Modified
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {getVisibleDesigns().map((design, index) => (
                        <tr
                            key={design.id}
                            className="hover:bg-brand-blue-light/5 cursor-pointer transition-colors"
                            onClick={() => handleOpenDesign(design.id)}
                        >
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 h-10 w-10 rounded-lg overflow-hidden bg-gray-100">
                                        <img src={design.thumbnail || getDefaultThumbnail(index)} alt="" className="h-10 w-10 object-cover" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">{design.title}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <Badge variant="outline" className="bg-brand-teal-light/10 border-brand-teal-light/20">
                                    Design
                                </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {upperFirst(getRelativeTime(design.updatedAt))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                    {design.shared && (
                                        <Badge variant="secondary" className="bg-brand-blue-light/10 text-brand-blue border-brand-blue-light/20">
                                            <Share2 className="h-3 w-3 mr-1" /> Shared
                                        </Badge>
                                    )}
                                    {design.starred && (
                                        <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                            <Star className="h-3 w-3 mr-1 fill-yellow-500" /> Starred
                                        </Badge>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="sm" className="h-8" onClick={(e) => toggleStar(design.id, e)}>
                                        {design.starred ? (
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        ) : (
                                            <StarOff className="h-4 w-4 text-gray-400" />
                                        )}
                                    </Button>
                                    <Button variant="ghost" size="sm" className="h-8">
                                        <Share2 className="h-4 w-4 text-gray-500" />
                                    </Button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm" className="h-8">
                                                <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-xl">
                                            <DropdownMenuItem className="cursor-pointer">Rename</DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer">Duplicate</DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer">Download</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="cursor-pointer text-red-500 focus:text-red-500"
                                                onClick={(e) => handleDeleteDesign(design.id, e)}
                                            >
                                                Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}