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
import { notify } from "@/lib/toast";
import { useTranslation } from "react-i18next";

const Feed = () => {
  const [tweets, setTweets] = useState<any>([]);
  const [loading, setloading] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();
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
          <h1 className="text-xl font-bold text-white">{t("home")}</h1>
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
              {t("for_you")}
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:border-b-1 data-[state=active]:border-blue-100 data-[state=active]:rounded-none text-gray-400 hover:bg-gray-900/50 py-4 font-semibold"
            >
              {t("following")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="w-full">
        <Card className="bg-gray-900 border-gray-800 m-4 xl:hidden">
          <CardContent className="p-2 flex justify-evenly max-sm:flex-wrap">
            <div><h3 className="text-white text-xl font-bold mb-2">
              {t("subscribe_premium")}
            </h3>
            <p className="text-gray-400 text-sm mb-4 max-md:hidden">
              {t("subscribe_description")}
            </p></div>
            <div className="flex items-center"><Link  href={`/subscriptions/${user?._id}`}>
              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full">
                {t("subscribe_now")}
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
