import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";

import Image from "next/image";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tweet: any;
}

export default function NotificationDialogBox({
  open,
  onOpenChange,
  tweet,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Tweet</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Author */}
          <div className="flex items-center gap-2">
            <div>
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage
                  src={tweet.author.avatar}
                  alt={tweet.author.displayName}
                />
                <AvatarFallback>{tweet.author.displayName?.[0]}</AvatarFallback>
              </Avatar>
            </div>
            <div>
              <p className="font-semibold">{tweet?.author?.displayName}</p>
              <p className="text-muted-foreground text-sm">
                @{tweet?.author?.username}
              </p>
            </div>
          </div>

          {/* Content */}
          {tweet?.content && (
            <p className="whitespace-pre-wrap">{tweet?.content}</p>
          )}

          {/* Image */}
          {tweet.image && (
            <div className="relative h-80 rounded-lg overflow-hidden">
              <Image
                src={tweet.image}
                alt="Tweet Image"
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Audio */}
          {tweet.audio?.audioUrl && (
            <audio controls className="w-full" preload="metadata">
              <source src={tweet.audio.audioUrl} type={tweet.audio.mimeType} />
            </audio>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
