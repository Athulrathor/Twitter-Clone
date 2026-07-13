  export default function formatDistanceToNow(date: Date, options: { addSuffix: boolean }): string {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return options.addSuffix ? `${interval}y ago` : `${interval}y`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return options.addSuffix ? `${interval}mo ago` : `${interval}mo`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return options.addSuffix ? `${interval}d ago` : `${interval}d`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return options.addSuffix ? `${interval}h ago` : `${interval}h`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return options.addSuffix ? `${interval}m ago` : `${interval}m`;
    
    return options.addSuffix ? "just now" : "now";
  }