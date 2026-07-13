import { useAuth } from "@/context/AuthContext";
import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { Image, Smile, Calendar, MapPin, BarChart3, Globe } from "lucide-react";
import { Separator } from "./ui/separator";
import axios from "axios";
import axiosInstance from "@/lib/axiosInstance";
import { auth } from "@/context/firebase";
import AudioButton from "@/components/audio/AudioButton";
import useAudioUpload from "../components/audio/hook/useAudioUpload";
import AudioOtpDialog from "./audio/AudioOtpDialog";
import { uploadAudio } from "./audio/service/audio.service";
import LoadingSpinner from "./loading-spinner";
import AudioPlayer from "./audio/AudioPlayer";
import { notify } from "@/lib/toast";

export interface AudioUpload {
  _id: string;
  url: string;
  publicId: string;
  duration: number;
  size: number;
  mimeType: string;
}

const TweetComposer = ({
  onTweetPosted,
}: {
  onTweetPosted: (tweet: any) => void;
}) => {
  const { user } = useAuth();
  const { audio, setAudio } = useAudioUpload();
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageUrl, setimageUrl] = useState("");
  const [otpOpen, setOtpOpen] = useState(false);
  const [message, setMessage] = useState(false);
  const [success, setSuccess] = useState(false);
  const maxLength = 200;
  const hasContent = content.trim().length > 0;
  const hasImage = Boolean(imageUrl);
  const hasAudio = Boolean(audio);

  const canPost = hasContent || hasImage || hasAudio;
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !canPost) return;
    try {
      setIsLoading(true);
      const tweetdata = {
        content,
        image: imageUrl || null,
        audio: audio?._id ?? null,
      };

      const token = await auth.currentUser?.getIdToken();
      const res = await axiosInstance.post("/post", tweetdata, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      onTweetPosted(res.data.tweet);
      notify.success(res.data.message);
      setContent("");
      setimageUrl("");
      setAudio(null);
    } catch (error: any) {
      console.log(error);
      notify.error(
      error.response?.data?.message ||
      "Tweet post failed."
    );
    } finally {
      setIsLoading(false);
    }
  };
  const handleAudioSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;
    setAudioLoading(true);
    try {
      const res = await uploadAudio(file);

      setAudio(res.data.audio);
    } catch (err) {
      console.error("5. Upload error", err);
    } finally {
      setAudioLoading(false);
    }
  };
  const characterCount = content.length;
  const isOverLimit = characterCount > maxLength;
  const isNearLimit = characterCount > maxLength * 0.8;
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const image = e.target.files[0];
    const formdataimg = new FormData();
    setImageLoading(true);
    formdataimg.set("image", image);
    try {
      const res = await axios.post(
        "https://api.imgbb.com/1/upload?key=9efc86bc91feea6eaa0459b22349c3af",
        formdataimg,
      );
      const url = res.data.data.display_url;
      if (url) {
        setimageUrl(url);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setImageLoading(false);
    }
  };

  const getUploadMessage = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      const status = await axiosInstance.get("/upload/status",{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(status?.data?.message);
      setSuccess(status?.data?.success);
    } catch (error) {
      console.error(error)
    }
  };

  useEffect(() => {
    getUploadMessage();
  },[]);

  if (!user) return null;

  return (
    <>
      <Card className="bg-black border-gray-800 border-x-0 border-t-0 rounded-none">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10 shrink-0">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback>{user.displayName[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <form onSubmit={handleSubmit} className="pb-3">
                {/* Textarea */}

                <Textarea
                  value={content}
                  placeholder="What's happening?"
                  onChange={(e) => setContent(e.target.value)}
                  className="
      bg-transparent
      border-none
      text-xl
      text-white
      placeholder:text-gray-500
      resize-none
      min-h-[120px]
      focus-visible:ring-0
      focus-visible:ring-offset-0
  "
                />

                <div className="space-y-3 mt-4">
                  {imageUrl && (
                    <div className="relative overflow-hidden rounded-2xl">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        width={800}
                        height={450}
                        className="w-full max-h-80 object-cover"
                        style={{ objectFit: "cover" }}
                      />

                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        className="absolute top-2 right-2 rounded-full"
                        onClick={() => setimageUrl("")}
                      >
                        ✕
                      </Button>
                    </div>
                  )}

                  <div className="space-y-3 mt-4">
                    {audio && (
                      <AudioPlayer
                        verified={true}
                        audio={audio as any}
                        editable={true}
                        onRemove={() => setAudio(null)}
                      />
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-5">
                  <div className="flex items-center gap-1 text-blue-400">
                    <label
                      htmlFor="tweet-image"
                      className="
      cursor-pointer
      rounded-lg
      p-2
      hover:bg-blue-900/20
  "
                    >
                      {imageLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Image className="w-5 h-5" />
                      )}

                      <input
                        id="tweet-image"
                        hidden
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                      />
                    </label>

                    {audioLoading ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <AudioButton
                        canSend={!success}
                        // onFileSelected={setSelectedAudio}
                        onOtpRequested={() => setOtpOpen(true)}
                      />
                    )}
                    <Button type="button" variant="ghost" size="icon">
                      <BarChart3 className="h-5 w-5" />
                    </Button>

                    <Button type="button" variant="ghost" size="icon">
                      <Smile className="h-5 w-5" />
                    </Button>

                    <Button type="button" variant="ghost" size="icon">
                      <Calendar className="h-5 w-5" />
                    </Button>

                    <Button type="button" variant="ghost" size="icon">
                      <MapPin className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-400" />

                      <span className="text-sm text-blue-400 font-medium">
                        Everyone can reply
                      </span>
                      {characterCount > 0 && (
                        <span
                          className={`text-sm ${
                            isOverLimit
                              ? "text-red-500"
                              : isNearLimit
                                ? "text-yellow-400"
                                : "text-gray-500"
                          }`}
                        >
                          {maxLength - characterCount}
                        </span>
                      )}
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading || isOverLimit || !canPost}
                      className="
      rounded-full
      px-6
      bg-blue-500
      hover:bg-blue-600
  "
                    >
                      {isLoading ? "Posting..." : "Post"}
                    </Button>
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                </div>
              </form>
              <div
          className={`mt-4 rounded-xl p-3 text-sm border ${
            success
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : "bg-red-500/10 text-red-400 border-red-500/20"
          }`}
        >
          {message}
        </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AudioOtpDialog
        open={otpOpen}
        onClose={() => setOtpOpen(false)}
        onUploaded={setAudio}
      />
    </>
  );
};

export default TweetComposer;
