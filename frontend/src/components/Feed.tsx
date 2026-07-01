import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent } from "./ui/card";
import LoadingSpinner from "./loading-spinner";
import TweetCard from "./TweetCard";
import TweetComposer from "./TweetComposer";
import axiosInstance from "@/lib/axiosInstance";
import { Button } from "./ui/button";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/context/firebase";

interface Tweet {
  id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  comments: number;
  liked?: boolean;
  retweeted?: boolean;
  image?: string;
}
const tweets: Tweet[] = [
  {
    id: "1",
    author: {
      id: "2",
      username: "elonmusk",
      displayName: "Elon Musk",
      avatar:
        "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400",
      verified: true,
    },
    content:
      "Just had an amazing conversation about the future of AI. The possibilities are endless!",
    timestamp: "2h",
    likes: 1247,
    retweets: 324,
    comments: 89,
    liked: false,
    retweeted: false,
  },
  {
    id: "2",
    author: {
      id: "3",
      username: "sarahtech",
      displayName: "Sarah Johnson",
      avatar:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400",
      verified: false,
    },
    content:
      "Working on some exciting new features for our app. Can't wait to share what we've been building! 🚀",
    timestamp: "4h",
    likes: 89,
    retweets: 23,
    comments: 12,
    liked: true,
    retweeted: false,
  },
  {
    id: "3",
    author: {
      id: "4",
      username: "designguru",
      displayName: "Alex Chen",
      avatar:
        "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=400",
      verified: true,
    },
    content:
      "The new design system is finally complete! It took 6 months but the results are incredible. Clean, consistent, and accessible.",
    timestamp: "6h",
    likes: 456,
    retweets: 78,
    comments: 34,
    liked: false,
    retweeted: true,
    image:
      "https://images.pexels.com/photos/196645/pexels-photo-196645.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];
const Feed = () => {
  const [tweets, setTweets] = useState<any>([]);
  const [loading, setloading] = useState(false);
  const { user } = useAuth();
  const fetchTweets = async () => {
    try {
      setloading(true);
      const token = await auth.currentUser?.getIdToken();
      const res = await axiosInstance.get("/post", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTweets(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setloading(false);
    }
  };
  useEffect(() => {
    fetchTweets();
  }, []);
  const handlenewtweet = (newtweet: any) => {
    setTweets((prev: any) => [newtweet, ...prev]);
  };
  return (
    <div className="min-h-screen w-full pb-20 md:pb-0">
      <div className="sticky top-0 bg-black/90 backdrop-blur-md border-b border-gray-800 z-10">
        <div className="px-4 py-3 flex gap-4">
          <h1 className="text-xl font-bold text-white">Home</h1>
          {/* <div className="hidden max-sm:flex">
          <Link href={`/subscriptions/${user?._id}`}>
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full">
              Subscribe Now
            </Button>
          </Link>
        </div> */}
        </div>

        <Tabs defaultValue="foryou" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-transparent border-b border-gray-800 rounded-none h-auto">
            <TabsTrigger
              value="foryou"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-1 data-[state=active]:border-blue-100 data-[state=active]:rounded-none text-gray-400 hover:bg-gray-900/50 py-4 font-semibold"
            >
              For you
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-1 data-[state=active]:border-blue-100 data-[state=active]:rounded-none text-gray-400 hover:bg-gray-900/50 py-4 font-semibold"
            >
              Following
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="w-full">
        <Card className="bg-gray-900 border-gray-800 m-4 xl:hidden">
          <CardContent className="p-2 flex justify-evenly max-sm:flex-wrap">
            <div><h3 className="text-white text-xl font-bold mb-2">
              Subscribe to Premium
            </h3>
            <p className="text-gray-400 text-sm mb-4 max-md:hidden">
              Subscribe to unlock new features and if eligible, receive a share
              of revenue.
            </p></div>
            <div className="flex items-center"><Link  href={`/subscriptions/${user?._id}`}>
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full">
                Subscribe Now
              </Button>
            </Link></div>
          </CardContent>
        </Card>
        <TweetComposer onTweetPosted={handlenewtweet} />
      </div>
      <div className="divide-y divide-gray-800">
        {loading ? (
          <Card className="bg-black border-none">
            <CardContent className="py-12 text-center">
              <div className="text-gray-400 mb-4">
                <LoadingSpinner size="lg" className="mx-auto mb-4" />
                <p>Loading tweets...</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          tweets.map((tweet: any) => (
            <TweetCard key={tweet._id} tweet={tweet} />
          ))
        )}
      </div>
      {!loading && tweets.length === 0 && (
        <Card className="bg-black border-none">
          <CardContent className="py-12 text-center">
            <p className="text-gray-400">
              No tweets yet. Be the first to post!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Feed;
