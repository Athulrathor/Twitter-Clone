import { createClient } from '@supabase/supabase-js';
import crypto from "crypto";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function uploadAudioToStorage(file, userId) {
  const extension = file.originalname.split(".").pop();

  const fileName = `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const storagePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from("audio")
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage
    .from("audio")
    .getPublicUrl(storagePath);

  return {
    audioUrl: data.publicUrl,
    storagePath,
  };
}

export async function deletePath(path) {
  if (!path) return;

  await supabase.storage
  .from("audio")
  .remove([audio.storagePath]);
}

export default uploadAudioToStorage;