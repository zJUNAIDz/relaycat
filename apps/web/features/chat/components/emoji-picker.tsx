import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { Smile } from "lucide-react";
import Picker, { EmojiClickData, EmojiStyle, Theme } from "emoji-picker-react";
import { useTheme } from "@wrksz/themes/client"
interface EmojiPickerProps {
  onChange: (value: string) => void;
}

export const EmojiPicker = ({ onChange }: EmojiPickerProps) => {
  const { resolvedTheme } = useTheme();
  return (
    <Popover>
      <PopoverTrigger>
        <Smile className="text-muted-foreground hover:text-foreground transition" />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={40}
        className="bg-transparent border-none shadow-none drop-shadow-none mb-16"
      >
        <Picker
          onEmojiClick={(data: EmojiClickData) => onChange(data.emoji)}
          theme={resolvedTheme as Theme}
          emojiStyle={EmojiStyle.GOOGLE}
        />
      </PopoverContent>
    </Popover>
  )
}