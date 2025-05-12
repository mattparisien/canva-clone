import { SelectableGrid, SelectableGridItem } from "@/components/ui/selectable-grid";
import { getRelativeTime } from "@/lib/utils/utils";
import { type Project } from "@lib/api/api";
import { upperFirst } from "lodash";
import Image from "next/image";
import Link from "next/link";

interface GridViewProps {
    designs: Project[];
}

export default function GridView({
    designs
    // selectedDesigns prop is not used here, so no change needed in destructuring
}: GridViewProps) {
    return (
        <SelectableGrid<Project>>
            {designs.map((design, index) => {

                return (
                    <SelectableGridItem item={design} key={design._id}>
                        <Link href={`/editor?id=${design._id}`} target="_blank" key={design._id}>
                            <div className="flex flex-col space-y-2">
                                <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-gray-100 group-hover:bg-gray-200 transition-colors duration-200">
                                    {design.thumbnail && (
                                        <Image
                                            src={design.thumbnail}
                                            alt={design.title}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="font-medium line-clamp-1">{design.title}</h3>
                                        <p className="text-xs text-gray-500">
                                            {upperFirst(design.type)} · Last updated {getRelativeTime(design.updatedAt)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </SelectableGridItem>
                )

            })
            }
        </SelectableGrid>
    )
}