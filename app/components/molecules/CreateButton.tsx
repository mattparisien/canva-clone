import { Button } from "@components/atoms/button"
import { Popover, PopoverTrigger, PopoverContent } from "@components/atoms/popover"
import { Plus } from "lucide-react"
import { useState, useRef } from "react"

export interface CreateButtonItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  action?: () => void;
  isFileUpload?: boolean;
  acceptFileTypes?: string;
  onFileSelect?: (file: File) => void;
}

export interface CreateButtonProps {
  // Button customization
  buttonText?: string;
  buttonIcon?: React.ReactNode;
  buttonClassName?: string;
  
  // Action items configuration
  items?: CreateButtonItem[];
  
  // Additional configuration
  popoverAlign?: "start" | "center" | "end";
  popoverWidth?: string;
  headerText?: string;
}

export function CreateButton({
  // Default values for props
  buttonText = "Create",
  buttonIcon = <Plus size={50} />,
  buttonClassName = "",
  items = [],
  popoverAlign = "end",
  popoverWidth = "w-56",
  headerText = "Create New"
}: CreateButtonProps) {
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
    
    const handleItemClick = (item: CreateButtonItem) => {
        if (item.isFileUpload) {
            // Trigger file input click
            fileInputRefs.current[item.id]?.click();
        } else if (item.action) {
            item.action();
            setIsPopoverOpen(false);
        }
    };
    
    const handleFileChange = (item: CreateButtonItem) => (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && item.onFileSelect) {
            item.onFileSelect(e.target.files[0]);
            setIsPopoverOpen(false);
            
            // Reset the file input value so the same file can be selected again
            if (fileInputRefs.current[item.id]) {
                fileInputRefs.current[item.id]!.value = '';
            }
        }
    };
    
    return (
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
                <Button className={`flex items-center gap-2 ${buttonClassName}`}>
                    {buttonIcon}
                    <span>{buttonText}</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className={popoverWidth} align={popoverAlign}>
                <h3 className="px-3 pb-3">{headerText}</h3>
                <div className="flex flex-col gap-1">
                    {items.map((item) => (
                        <div key={item.id}>
                            {item.isFileUpload && (
                                <input
                                    type="file"
                                    ref={(el) => { fileInputRefs.current[item.id] = el }}
                                    className="hidden"
                                    accept={item.acceptFileTypes || "*"}
                                    onChange={handleFileChange(item)}
                                />
                            )}
                            <Button
                                variant="ghost"
                                className="w-full justify-start gap-2 px-3"
                                onClick={() => handleItemClick(item)}
                            >
                                {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                                <span>{item.label}</span>
                            </Button>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}